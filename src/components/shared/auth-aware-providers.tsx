"use client";

import { useAuth } from "@clerk/nextjs";
import type { ReactNode } from "react";

import { ReflectionProvider } from "@/components/learn/reflection-context";
import { TutorProvider } from "@/components/tutor/tutor-context";
import { TutorCompanion } from "@/components/tutor/tutor-panel";
import { InSessionQuizTrackerProvider } from "@/lib/practice/quiz-tracker";
import { SupabaseQuizTrackerProvider } from "@/lib/practice/supabase-quiz-tracker-provider";
import { InSessionEngagementProvider } from "@/lib/progress/proficiency-tracker";
import { SupabaseEngagementProvider } from "@/lib/progress/supabase-engagement-provider";

/**
 * Mounts the engagement + quiz tracker providers appropriate for the current
 * auth state. Signed-out: in-session only (today's behavior). Signed-in:
 * Supabase-backed providers that hydrate on mount and write through on change.
 *
 * The two implementations satisfy the same EngagementTracker / QuizTracker
 * interfaces, so consuming components don't need to know which is mounted.
 */
export function AuthAwareProviders({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  // Until Clerk has resolved, fall back to in-session providers so the page
  // still renders. The user is treated as signed-out during this brief window.
  if (!isLoaded || !isSignedIn) {
    return (
      <ReflectionProvider>
        <TutorProvider>
          <InSessionEngagementProvider>
            <InSessionQuizTrackerProvider>{children}</InSessionQuizTrackerProvider>
          </InSessionEngagementProvider>
          <TutorCompanion />
        </TutorProvider>
      </ReflectionProvider>
    );
  }

  return (
    <ReflectionProvider>
      <TutorProvider>
        <SupabaseEngagementProvider>
          <SupabaseQuizTrackerProvider>{children}</SupabaseQuizTrackerProvider>
        </SupabaseEngagementProvider>
        <TutorCompanion />
      </TutorProvider>
    </ReflectionProvider>
  );
}
