import type { ReactNode } from "react";
import { Toolbar } from "@/components/shared/toolbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="atlas-background flex min-h-screen flex-col text-[var(--ink)]">
      <Toolbar />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-12 md:px-8 md:py-16">
        {children}
      </main>
      <footer className="mt-8">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-1 px-4 py-10 text-center md:px-8">
          <p className="text-[13px] text-[var(--ink-muted)]">
            ATLAS Learning — Robotics curriculum
          </p>
          <p className="text-[12px] text-[var(--ink-faint)]">v0.1 · Proficiency engine</p>
        </div>
      </footer>
    </div>
  );
}
