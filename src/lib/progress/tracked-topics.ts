/**
 * Topics that compute proficiency live from learner engagement (objective/concept
 * checklists, quiz attempts, challenge/project completion). Other topics fall
 * back to seed data in `mock-progress-repository.ts` until they're built out.
 */
export const TRACKED_TOPIC_SLUGS = new Set<string>([
  "linear-algebra-robotics",
  "calculus-robotics",
]);

export function isTrackedTopic(slug: string): boolean {
  return TRACKED_TOPIC_SLUGS.has(slug);
}
