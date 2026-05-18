import { ArmReachRunner } from "@/components/playground/arm-reach-runner";
import { Badge, Card, SectionHeader } from "@/components/shared/ui";

export const metadata = {
  title: "Playground — AtlasLearning",
  description:
    "Sandbox for writing closed-loop robot policies. Planar 2-link arm reaching a target you can move.",
};

export default function PlaygroundPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Playground"
        title="Planar arm reach"
        description="Drive a 2-link planar arm's joints so the end-effector reaches the target. Tune the target, noise, and duration on the right and re-run."
        action={
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">Free-form</Badge>
            <Badge>Pyodide</Badge>
          </div>
        }
      />

      <ArmReachRunner />

      <Card interactive={false}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
          How it works
        </p>
        <div className="atlas-prose mt-4 space-y-3 text-[14px] text-[var(--ink-muted)]">
          <p>
            The arm is a 2-link planar manipulator with link lengths 1.0 m and
            0.8 m. Each frame the simulator passes your current joint angles
            and velocities (optionally noised) to your <code>step</code>{" "}
            function; you return commanded joint velocities, the joints
            integrate kinematically, and the end-effector traces out the
            resulting path.
          </p>
          <p>
            The starter code is the textbook trick: build the manipulator
            Jacobian, compute end-effector error, and step in the direction of
            its damped-least-squares pseudoinverse. That keeps things stable
            near singularities (configurations where the arm is fully extended
            or folded on itself). Try changing the gain, swapping in a P-only
            controller, or adding a secondary objective.
          </p>
          <p>
            The target ring flips green once the end-effector lands within 5 cm.
            Crank the noise slider and watch the controller start to chatter —
            that&apos;s the moment to add a filter.
          </p>
        </div>
      </Card>
    </div>
  );
}
