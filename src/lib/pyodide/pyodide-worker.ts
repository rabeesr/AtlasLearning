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
 *   { type: "run", id, userCode, tests: { name, code }[] }
 *     -> { type: "run-result", id, results, stdout, traceback? }
 *
 * Tests run in the same global namespace as user code (after the user code has
 * been exec'd). Each test is wrapped so it can fail with AssertionError or any
 * other Exception and the error message is captured per-test. User code that
 * raises is reported via a traceback in the response — tests are still
 * attempted so the user sees which tests would have run.
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
  // Write the shim into the in-memory FS and add the dir to sys.path.
  pyodide.FS.mkdirTree("/home/pyodide/atlas");
  pyodide.FS.writeFile("/home/pyodide/atlas/robotics.py", shimSrc);
  await pyodide.runPythonAsync(`
import sys
if "/home/pyodide/atlas" not in sys.path:
    sys.path.insert(0, "/home/pyodide/atlas")
`);

  // Sanity-check: importing robotics must work; failure here is surfaced as init-error.
  await pyodide.runPythonAsync("import robotics  # noqa: F401");

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

async function handleRun(req: RunRequest) {
  const pyodide = await ensurePyodide();

  // Optional per-challenge extra packages — try Pyodide-built first, fall back to micropip.
  if (req.pythonPackages && req.pythonPackages.length > 0) {
    try {
      await pyodide.loadPackage(req.pythonPackages);
    } catch {
      await pyodide.loadPackage("micropip");
      const micropip = pyodide.pyimport("micropip");
      await micropip.install(req.pythonPackages);
    }
  }

  // Capture stdout/stderr.
  await pyodide.runPythonAsync(`
import sys, io
_atlas_stdout = io.StringIO()
_atlas_stderr = io.StringIO()
sys.stdout = _atlas_stdout
sys.stderr = _atlas_stderr
`);

  // Fresh user namespace each run.
  const userNs = pyodide.toPy({});

  let traceback: string | undefined;
  try {
    await pyodide.runPythonAsync(req.userCode, { globals: userNs });
  } catch (err: any) {
    traceback = err?.message ?? String(err);
  }

  const results: { testName: string; passed: boolean; errorMessage?: string }[] = [];

  for (const test of req.tests) {
    if (traceback) {
      // If user code failed, every test is reported as not-run with a clear message.
      results.push({
        testName: test.name,
        passed: false,
        errorMessage: "Not run — user code raised before tests executed.",
      });
      continue;
    }
    try {
      await pyodide.runPythonAsync(test.code, { globals: userNs });
      results.push({ testName: test.name, passed: true });
    } catch (err: any) {
      results.push({
        testName: test.name,
        passed: false,
        errorMessage: err?.message ?? String(err),
      });
    }
  }

  const stdout = (await pyodide.runPythonAsync(`_atlas_stdout.getvalue()`)) as string;
  const stderr = (await pyodide.runPythonAsync(`_atlas_stderr.getvalue()`)) as string;
  const combinedStdout = stderr ? `${stdout}\n[stderr]\n${stderr}` : stdout;

  post({
    type: "run-result",
    id: req.id,
    results,
    stdout: combinedStdout,
    traceback,
  });
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
        traceback: err?.message ?? String(err),
      });
    }
  }
});

export {};
