"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { AnimationPlayer } from "@/components/practice/animation-player";
import { Badge, Button, Card } from "@/components/shared/ui";
import { usePyodideRunner } from "@/lib/pyodide/use-pyodide-runner";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false, loading: () => <EditorSkeleton /> },
);

function EditorSkeleton() {
  return (
    <div className="flex h-[460px] items-center justify-center rounded-[18px] bg-[#1D1D1F] text-[13px] text-[#F5F5F7]/70">
      Loading editor…
    </div>
  );
}

const STARTER_CODE = `# step(joints, joint_vels, target_xy, t) -> commanded joint velocities
#
# joints     : np.ndarray (2,) current joint angles [rad]
# joint_vels : np.ndarray (2,) current joint velocities [rad/s]
# target_xy  : tuple (x, y) target end-effector position [m]
# t          : float current sim time [s]
#
# This starter is a damped-least-squares Jacobian controller — a classic
# inverse-kinematics technique that stays stable near singularities.

import numpy as np
import robotics_sim


def step(joints, joint_vels, target_xy, t):
    L1, L2 = 1.0, 0.8
    # Forward kinematics: where is the end-effector right now?
    x = L1 * np.cos(joints[0]) + L2 * np.cos(joints[0] + joints[1])
    y = L1 * np.sin(joints[0]) + L2 * np.sin(joints[0] + joints[1])
    err = np.array([target_xy[0] - x, target_xy[1] - y])

    # Manipulator Jacobian (planar 2-link, cumulative-absolute angles).
    J = np.array([
        [-L1 * np.sin(joints[0]) - L2 * np.sin(joints[0] + joints[1]),
         -L2 * np.sin(joints[0] + joints[1])],
        [ L1 * np.cos(joints[0]) + L2 * np.cos(joints[0] + joints[1]),
          L2 * np.cos(joints[0] + joints[1])],
    ])

    # Damped least squares — see [matrix-calculus-quickref] / [gaussian-elimination].
    Jt = J.T
    damp = 0.05
    J_dls = Jt @ np.linalg.inv(J @ Jt + damp * np.eye(2))
    return (J_dls @ (5.0 * err)).tolist()


robotics_sim.simulate_arm_reach(
    step,
    target_xy=(TARGET_X, TARGET_Y),
    noise=NOISE,
    duration=DURATION,
)
`;

interface SliderRowProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}

function SliderRow({ label, unit, value, min, max, step, onChange }: SliderRowProps) {
  return (
    <label className="flex items-center gap-3 text-[13px] text-[var(--ink-muted)]">
      <span className="w-28 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-[var(--accent)]"
        aria-label={`${label} (${unit})`}
      />
      <span className="w-20 shrink-0 text-right font-mono tabular-nums text-[var(--ink)]">
        {value.toFixed(2)} {unit}
      </span>
    </label>
  );
}

export function ArmReachRunner() {
  const runner = usePyodideRunner();
  const [code, setCode] = useState<string>(STARTER_CODE);
  const [targetX, setTargetX] = useState(1.0);
  const [targetY, setTargetY] = useState(0.5);
  const [noise, setNoise] = useState(0);
  const [duration, setDuration] = useState(6);

  const canRun = runner.status === "ready" || runner.status === "running";

  const onRun = async () => {
    const wrapped = [
      `TARGET_X = ${targetX}`,
      `TARGET_Y = ${targetY}`,
      `NOISE = ${noise}`,
      `DURATION = ${duration}`,
      "",
      code,
    ].join("\n");
    await runner.run(wrapped, []);
  };

  const onReset = () => setCode(STARTER_CODE);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]">
      <Card interactive={false} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
            Policy · Python
          </p>
          <RunnerStatusPill
            status={runner.status}
            progress={runner.progress}
          />
        </div>

        <div className="overflow-hidden rounded-[18px] bg-[#1D1D1F]">
          <MonacoEditor
            height="460px"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: "on",
            }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={onRun}
              variant="accent"
              className={canRun ? "" : "pointer-events-none opacity-50"}
            >
              {runner.status === "running" ? "Running…" : "Run simulation"}
            </Button>
            <Button onClick={onReset} variant="secondary" size="sm">
              Reset
            </Button>
          </div>
          {runner.totalMs !== null ? (
            <span className="font-mono text-[12px] tabular-nums text-[var(--ink-faint)]">
              {runner.totalMs}ms
            </span>
          ) : null}
        </div>
      </Card>

      <div className="flex flex-col gap-5">
        <Card interactive={false} className="flex flex-col gap-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
            Scenario
          </p>
          <p className="text-[13px] text-[var(--ink-muted)]">
            The variables below are injected as
            <code className="ml-1 rounded bg-[var(--tile)] px-1 font-mono text-[12px] text-[var(--ink)]">
              TARGET_X
            </code>
            ,{" "}
            <code className="rounded bg-[var(--tile)] px-1 font-mono text-[12px] text-[var(--ink)]">
              TARGET_Y
            </code>
            ,{" "}
            <code className="rounded bg-[var(--tile)] px-1 font-mono text-[12px] text-[var(--ink)]">
              NOISE
            </code>
            , and{" "}
            <code className="rounded bg-[var(--tile)] px-1 font-mono text-[12px] text-[var(--ink)]">
              DURATION
            </code>
            . Tune them and re-run. The target ring turns green once the end-effector lands within 5 cm.
          </p>
          <div className="mt-2 flex flex-col gap-3">
            <SliderRow
              label="Target x"
              unit="m"
              value={targetX}
              min={-1.6}
              max={1.6}
              step={0.1}
              onChange={setTargetX}
            />
            <SliderRow
              label="Target y"
              unit="m"
              value={targetY}
              min={-1.6}
              max={1.6}
              step={0.1}
              onChange={setTargetY}
            />
            <SliderRow
              label="Sensor noise"
              unit="rad"
              value={noise}
              min={0}
              max={0.05}
              step={0.005}
              onChange={setNoise}
            />
            <SliderRow
              label="Duration"
              unit="s"
              value={duration}
              min={2}
              max={12}
              step={1}
              onChange={setDuration}
            />
          </div>
        </Card>

        <Card interactive={false}>
          <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
            Animation
          </p>
          {runner.error ? (
            <pre className="mt-3 whitespace-pre-wrap rounded-[14px] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] px-4 py-3 font-mono text-[13px] leading-6 text-[var(--danger)]">
              Pyodide failed to load: {runner.error}
            </pre>
          ) : null}
          {runner.traceback ? (
            <pre className="mt-3 whitespace-pre-wrap rounded-[14px] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] px-4 py-3 font-mono text-[13px] leading-6 text-[var(--danger)]">
              {runner.traceback}
            </pre>
          ) : null}
          {runner.animations.length > 0 ? (
            <div className="mt-3 flex flex-col gap-3">
              {runner.animations.map((anim, i) => (
                <AnimationPlayer
                  key={i}
                  frames={anim.frames}
                  fps={anim.fps}
                  truncated={anim.truncated}
                />
              ))}
            </div>
          ) : runner.status === "ready" && !runner.traceback ? (
            <p className="mt-3 text-[13px] italic text-[var(--ink-faint)]">
              Press &ldquo;Run simulation&rdquo; to drive the arm toward the target.
            </p>
          ) : null}
          {runner.consoleLines.length > 0 ? (
            <div className="mt-4 max-h-[160px] space-y-2 overflow-auto">
              {runner.consoleLines.map((line, i) => (
                <div
                  key={i}
                  className="rounded-[14px] bg-[var(--tile-deep)] px-4 py-3"
                >
                  <pre className="whitespace-pre-wrap font-mono text-[12px] leading-5 text-[var(--ink-muted)]">
                    {line.text}
                  </pre>
                </div>
              ))}
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

function RunnerStatusPill({
  status,
  progress,
}: {
  status: ReturnType<typeof usePyodideRunner>["status"];
  progress: string | null;
}) {
  if (status === "loading") {
    return (
      <span className="text-[12px] text-[var(--ink-muted)]">
        {progress ?? "Loading Pyodide…"}
      </span>
    );
  }
  if (status === "running") {
    return <Badge tone="accent">Running</Badge>;
  }
  if (status === "error") {
    return <Badge tone="danger">Runtime error</Badge>;
  }
  return <Badge tone="success">Ready</Badge>;
}
