"use server";

import { applyDemotionServer } from "@/lib/reviews/mixed-session";

/**
 * Server action exposing demotion for the mixed-session runner. Called per
 * topic at the end of a Refresh-mode session.
 */
export async function applyDemotionAction(topicSlug: string, delta: number) {
  await applyDemotionServer(topicSlug, delta);
}
