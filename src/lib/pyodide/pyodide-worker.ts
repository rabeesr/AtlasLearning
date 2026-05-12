/// <reference lib="webworker" />
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Pyodide worker — CPython compiled to WebAssembly, isolated from the UI thread.
 *
 * Pinned Pyodide version: v0.27.7 (loaded from jsdelivr CDN).
 * Update both PYODIDE_VERSION and the CDN tag together when bumping.
 *
 * Message protocol:
 *   { type: "init" }
 *     -> { type: "init-progress", message }*
 *     -> { type: "ready" } | { type: "init-error", message }
 *
 *   { type: "run", id, userCode, tests: { name, code }[], pythonPackages? }
 *     -> { type: "run-result", id, results, stdout, consoleLines, traceback?,
 *           totalMs, plots }
 *
 *   { type: "run-test", id, userCode, test: { name, code }, pythonPackages? }
 *     -> same as "run-result" but with a single test entry. Used for the
 *        per-test "play" button on the expanded test row.
 *
 * Tests run in the same global namespace as user code (after the user code has
 * been exec'd). Each test is wrapped so it can fail with AssertionError or any
 * other Exception and the error message is captured per-test. User code that
 * raises is reported via a traceback in the response — tests are still
 * attempted so the user sees which tests would have run.
 *
 * stdout / stderr capture
 * -----------------------
 * Capture happens BOTH around user code AND around each test. We snapshot
 * `_atlas_stdout.getvalue()` after the user code, then truncate the buffer and
 * snapshot again after each test. The per-test slice is attached to that
 * test's result; the user-code slice is the first ConsoleLine entry with
 * origin="user". The UI surfaces both grouped.
 *
 * matplotlib capture
 * ------------------
 * Right before user code runs we set the matplotlib backend to "Agg" and
 * hook `pyplot.show`. After user code (and tests) we collect any captured
 * figures, encode each as PNG, and ship base64 strings inline.
 */

declare const self: DedicatedWorkerGlobalScope & {
  loadPyodide?: (opts: { indexURL: string }) => Promise<any>;
  pyodide?: any;
};

const PYODIDE_VERSION = "0.27.7";
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

// Packages we want available out of the box. numpy + scipy + sympy + matplotlib
// per spec. All four are available as Pyodide-built wheels for v0.27.x.
const DEFAULT_PACKAGES = ["numpy", "scipy", "sympy", "matplotlib"];

let pyodideReady: Promise<any> | null = null;
let initStarted = false;

function post(msg: unknown) {
  (self as unknown as DedicatedWorkerGlobalScope).postMessage(msg);
}

async function fetchRoboticsShim(): Promise<string> {
  // Served from /public/atlas-python/robotics.py — same origin, no CORS issues.
  const res = await fetch("/atlas-python/robotics.py");
  if (!res.ok) {
    throw new Error(`Failed to load robotics shim (${res.status})`);
  }
  return res.text();
}

async function fetchRoboticsSimShim(): Promise<string> {
  // BETA 4.3 — robotics_sim animation helpers, fetched from /public.
  const res = await fetch("/atlas-python/robotics_sim.py");
  if (!res.ok) {
    throw new Error(`Failed to load robotics_sim shim (${res.status})`);
  }
  return res.text();
}

async function bootPyodide(): Promise<any> {
  post({ type: "init-progress", message: "Loading Pyodide runtime…" });
  // importScripts is the recommended in-worker loader from the Pyodide docs.
  (self as any).importScripts(`${PYODIDE_CDN}pyodide.js`);
  const loadPyodide = (self as any).loadPyodide as (opts: {
    indexURL: string;
  }) => Promise<any>;
  const pyodide = await loadPyodide({ indexURL: PYODIDE_CDN });

  post({ type: "init-progress", message: "Loading numpy, scipy, sympy, matplotlib…" });
  await pyodide.loadPackage(DEFAULT_PACKAGES);

  post({ type: "init-progress", message: "Installing robotics shim…" });
  const shimSrc = await fetchRoboticsShim();
  const simShimSrc = await fetchRoboticsSimShim();
  // Write the shim into the in-memory FS and add the dir to sys.path.
  pyodide.FS.mkdirTree("/home/pyodide/atlas");
  pyodide.FS.writeFile("/home/pyodide/atlas/robotics.py", shimSrc);
  pyodide.FS.writeFile("/home/pyodide/atlas/robotics_sim.py", simShimSrc);
  await pyodide.runPythonAsync(`
import sys
if "/home/pyodide/atlas" not in sys.path:
    sys.path.insert(0, "/home/pyodide/atlas")
`);

  // Sanity-check: importing robotics must work; failure here is surfaced as init-error.
  await pyodide.runPythonAsync("import robotics  # noqa: F401");
  await pyodide.runPythonAsync("import robotics_sim  # noqa: F401");

  return pyodide;
}

async function ensurePyodide(): Promise<any> {
  if (!pyodideReady) {
    pyodideReady = bootPyodide();
  }
  return pyodideReady;
}

interface RunRequest {
  id: number;
  userCode: string;
  tests: { name: string; code: string }[];
  pythonPackages?: string[];
}

interface RunTestRequest {
  id: number;
  userCode: string;
  test: { name: string; code: string };
  pythonPackages?: string[];
}

interface RunOutcome {
  results: {
    testName: string;
    passed: boolean;
    errorMessage?: string;
    durationMs?: number;
    stdout?: string;
  }[];
  stdout: string;
  consoleLines: { origin: string; text: string }[];
  traceback?: string;
  totalMs: number;
  plots: { pngBase64: string }[];
  /** BETA 4.1 — captured matplotlib.animation.FuncAnimation frames. */
  animations: { fps: number; frames: string[]; truncated: boolean }[];
}

async function loadExtraPackages(pyodide: any, packages?: string[]) {
  if (!packages || packages.length === 0) return;
  try {
    await pyodide.loadPackage(packages);
  } catch {
    await pyodide.loadPackage("micropip");
    const micropip = pyodide.pyimport("micropip");
    await micropip.install(packages);
  }
}

/**
 * Reset the stdout/stderr StringIO buffers and matplotlib state, returning a
 * function that snapshots whatever was emitted since the last reset.
 */
async function setupRunEnv(pyodide: any) {
  await pyodide.runPythonAsync(`
import sys, io
_atlas_stdout = io.StringIO()
_atlas_stderr = io.StringIO()
sys.stdout = _atlas_stdout
sys.stderr = _atlas_stderr

# matplotlib: switch to a non-interactive backend and capture figures on show().
try:
    import matplotlib
    matplotlib.use("Agg", force=True)
    import matplotlib.pyplot as _plt  # noqa
    _atlas_captured_figs = []
    def _atlas_show(*args, **kwargs):
        # Capture every open figure when user code calls plt.show().
        import matplotlib.pyplot as plt
        for num in plt.get_fignums():
            _atlas_captured_figs.append(plt.figure(num))
    _plt.show = _atlas_show
except Exception:
    _atlas_captured_figs = []

# BETA 4.1 — track every FuncAnimation instance constructed by user code so the
# worker can render it frame-by-frame after the run finishes. We monkey-patch
# the FuncAnimation constructor to append to a module-level list. The figure,
# the user's update function, the frame iterable, and the interval are stashed
# verbatim so collectAnimations() can replay them.
try:
    import matplotlib.animation as _atlas_anim
    _atlas_tracked_anims = []
    _atlas_FuncAnimation_orig = _atlas_anim.FuncAnimation
    class _AtlasTrackedFuncAnimation(_atlas_FuncAnimation_orig):
        def __init__(self, fig, func, frames=None, init_func=None,
                     fargs=None, save_count=None, *, cache_frame_data=True,
                     **kwargs):
            interval = kwargs.get("interval", 200)
            _atlas_tracked_anims.append({
                "fig": fig,
                "func": func,
                "frames": frames,
                "init_func": init_func,
                "fargs": fargs,
                "interval": interval,
            })
            super().__init__(fig, func, frames=frames, init_func=init_func,
                             fargs=fargs, save_count=save_count,
                             cache_frame_data=cache_frame_data, **kwargs)
    _atlas_anim.FuncAnimation = _AtlasTrackedFuncAnimation
except Exception:
    _atlas_tracked_anims = []
`);
}

async function snapshotStdout(pyodide: any): Promise<string> {
  const out = (await pyodide.runPythonAsync(`
_v = _atlas_stdout.getvalue()
_atlas_stdout.truncate(0); _atlas_stdout.seek(0)
_v
`)) as string;
  const errOut = (await pyodide.runPythonAsync(`
_v = _atlas_stderr.getvalue()
_atlas_stderr.truncate(0); _atlas_stderr.seek(0)
_v
`)) as string;
  return errOut ? `${out}${out && !out.endsWith("\n") ? "\n" : ""}[stderr] ${errOut}` : out;
}

async function collectPlots(pyodide: any): Promise<{ pngBase64: string }[]> {
  try {
    const result = (await pyodide.runPythonAsync(`
import io, base64
_pngs = []
try:
    import matplotlib.pyplot as plt
    nums = plt.get_fignums()
    # Include both explicitly captured figures and any still-open ones.
    figs = list(_atlas_captured_figs) + [plt.figure(n) for n in nums]
    seen = set()
    for fig in figs:
        if id(fig) in seen:
            continue
        seen.add(id(fig))
        buf = io.BytesIO()
        fig.savefig(buf, format="png", bbox_inches="tight", dpi=110)
        _pngs.append(base64.b64encode(buf.getvalue()).decode("ascii"))
    plt.close("all")
    _atlas_captured_figs.clear()
except Exception:
    pass
_pngs
`)) as unknown;
    const arr = (result as { toJs?: () => string[] })?.toJs
      ? (result as { toJs: () => string[] }).toJs()
      : (result as string[]);
    return Array.isArray(arr) ? arr.map((pngBase64) => ({ pngBase64 })) : [];
  } catch {
    return [];
  }
}

async function collectAnimations(
  pyodide: any,
): Promise<{ fps: number; frames: string[]; truncated: boolean }[]> {
  try {
    const raw = (await pyodide.runPythonAsync(`
import io, base64, numbers
_anim_payloads = []
_MAX_FRAMES = 120
try:
    for entry in _atlas_tracked_anims:
        fig = entry["fig"]
        func = entry["func"]
        frames = entry["frames"]
        init_func = entry["init_func"]
        fargs = entry["fargs"] or ()
        interval = entry["interval"] or 200
        fps = max(1.0, 1000.0 / float(interval))

        # Normalize frames into a concrete iterable.
        if frames is None:
            frame_list = list(range(100))
        elif isinstance(frames, numbers.Integral):
            frame_list = list(range(int(frames)))
        elif callable(frames):
            # Generator function — call it and materialize lazily up to cap+1.
            it = frames()
            frame_list = []
            for v in it:
                frame_list.append(v)
                if len(frame_list) > _MAX_FRAMES:
                    break
        else:
            frame_list = list(frames)

        truncated = False
        if len(frame_list) > _MAX_FRAMES:
            frame_list = frame_list[:_MAX_FRAMES]
            truncated = True

        if init_func is not None:
            try:
                init_func()
            except Exception:
                pass

        png_frames = []
        for fv in frame_list:
            try:
                func(fv, *fargs)
            except Exception:
                # If a single frame errors, skip it but keep going.
                continue
            buf = io.BytesIO()
            try:
                fig.savefig(buf, format="png", bbox_inches="tight", dpi=90)
            except Exception:
                continue
            png_frames.append(base64.b64encode(buf.getvalue()).decode("ascii"))

        _anim_payloads.append({
            "fps": fps,
            "frames": png_frames,
            "truncated": truncated,
        })
        # Close the figure so the static-plot capture path doesn't grab it
        # again as a (last-frame or empty) PLOT entry on top of the animation.
        try:
            import matplotlib.pyplot as _plt
            _plt.close(fig)
        except Exception:
            pass
    _atlas_tracked_anims.clear()
except Exception:
    pass
_anim_payloads
`)) as unknown;
    const arr = (raw as { toJs?: (opts?: unknown) => unknown })?.toJs
      ? ((raw as { toJs: (opts?: unknown) => unknown }).toJs({
          dict_converter: Object.fromEntries,
        }) as { fps: number; frames: string[]; truncated: boolean }[])
      : (raw as { fps: number; frames: string[]; truncated: boolean }[]);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function executeRun(
  pyodide: any,
  userCode: string,
  tests: { name: string; code: string }[],
  pythonPackages?: string[],
): Promise<RunOutcome> {
  await loadExtraPackages(pyodide, pythonPackages);
  await setupRunEnv(pyodide);

  const startTotal = performance.now();
  const consoleLines: { origin: string; text: string }[] = [];
  const userNs = pyodide.toPy({});

  let traceback: string | undefined;
  try {
    await pyodide.runPythonAsync(userCode, { globals: userNs });
  } catch (err: any) {
    traceback = err?.message ?? String(err);
  }
  const userStdout = await snapshotStdout(pyodide);
  if (userStdout.length > 0) {
    consoleLines.push({ origin: "user", text: userStdout });
  }

  const results: RunOutcome["results"] = [];
  for (const test of tests) {
    if (traceback) {
      results.push({
        testName: test.name,
        passed: false,
        errorMessage: "Not run — user code raised before tests executed.",
        durationMs: 0,
      });
      continue;
    }
    const t0 = performance.now();
    let passed = true;
    let errorMessage: string | undefined;
    try {
      await pyodide.runPythonAsync(test.code, { globals: userNs });
    } catch (err: any) {
      passed = false;
      errorMessage = err?.message ?? String(err);
    }
    const durationMs = Math.round(performance.now() - t0);
    const testStdout = await snapshotStdout(pyodide);
    if (testStdout.length > 0) {
      consoleLines.push({ origin: test.name, text: testStdout });
    }
    results.push({
      testName: test.name,
      passed,
      errorMessage,
      durationMs,
      stdout: testStdout || undefined,
    });
  }

  // BETA 4.1 — animations BEFORE plots, because rendering frames may close
  // the underlying figures (we let collectPlots() then catch anything left
  // open from non-animated user code).
  const animations = await collectAnimations(pyodide);
  const plots = await collectPlots(pyodide);
  const totalMs = Math.round(performance.now() - startTotal);

  // Untagged concatenation for backwards-compat consumers.
  const stdout = consoleLines
    .map((l) => (l.origin === "user" ? l.text : `[${l.origin}]\n${l.text}`))
    .join("");

  return { results, stdout, consoleLines, traceback, totalMs, plots, animations };
}

async function handleRun(req: RunRequest) {
  const pyodide = await ensurePyodide();
  const outcome = await executeRun(
    pyodide,
    req.userCode,
    req.tests,
    req.pythonPackages,
  );
  post({ type: "run-result", id: req.id, ...outcome });
}

async function handleRunTest(req: RunTestRequest) {
  const pyodide = await ensurePyodide();
  const outcome = await executeRun(
    pyodide,
    req.userCode,
    [req.test],
    req.pythonPackages,
  );
  post({ type: "run-result", id: req.id, ...outcome });
}

self.addEventListener("message", async (event: MessageEvent) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "init") {
    if (initStarted) return;
    initStarted = true;
    try {
      await ensurePyodide();
      post({ type: "ready" });
    } catch (err: any) {
      post({
        type: "init-error",
        message: err?.message ?? String(err),
      });
    }
    return;
  }

  if (data.type === "run") {
    try {
      await handleRun(data as RunRequest);
    } catch (err: any) {
      post({
        type: "run-result",
        id: data.id,
        results: (data.tests ?? []).map((t: { name: string }) => ({
          testName: t.name,
          passed: false,
          errorMessage: "Worker error — see traceback panel.",
        })),
        stdout: "",
        consoleLines: [],
        traceback: err?.message ?? String(err),
        totalMs: 0,
        plots: [],
        animations: [],
      });
    }
    return;
  }

  if (data.type === "run-test") {
    try {
      await handleRunTest(data as RunTestRequest);
    } catch (err: any) {
      post({
        type: "run-result",
        id: data.id,
        results: [
          {
            testName: data.test?.name ?? "unknown",
            passed: false,
            errorMessage: "Worker error — see traceback panel.",
          },
        ],
        stdout: "",
        consoleLines: [],
        traceback: err?.message ?? String(err),
        totalMs: 0,
        plots: [],
        animations: [],
      });
    }
  }
});

export {};
