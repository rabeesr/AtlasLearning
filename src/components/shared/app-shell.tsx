import type { ReactNode } from "react";
import { Toolbar } from "@/components/shared/toolbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="atlas-background flex min-h-screen flex-col text-[var(--text)]">
      <Toolbar />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 md:px-8 md:py-10">
        {children}
      </main>
      <footer className="border-t border-[var(--border)] px-6 py-5 text-center text-xs text-[var(--text-muted)]">
        ATLAS Learning — robotics curriculum
      </footer>
    </div>
  );
}
