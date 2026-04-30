import type { ReactNode } from "react";
import { Toolbar } from "@/components/shared/toolbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="atlas-background flex min-h-screen flex-col text-[var(--ink)]">
      <Toolbar />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-10 md:px-8 md:py-14">
        {children}
      </main>
      <footer className="border-t border-[var(--ink)] bg-[var(--bg-white)]">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-5 md:px-8">
          <p className="coordinate">
            § ATLAS LEARNING / ROBOTICS CURRICULUM
          </p>
          <p className="coordinate">
            v0.1 — PROFICIENCY ENGINE
          </p>
        </div>
      </footer>
    </div>
  );
}
