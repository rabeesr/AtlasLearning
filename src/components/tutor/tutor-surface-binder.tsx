"use client";

import { useTutorSurface } from "@/components/tutor/tutor-context";
import type { TutorSurface } from "@/lib/tutor/types";

/**
 * Thin client wrapper to call `useTutorSurface` from server components.
 * Drop near the top of a server-rendered route with the relevant surface.
 */
export function TutorSurfaceBinder({ surface }: { surface: TutorSurface }) {
  useTutorSurface(surface);
  return null;
}
