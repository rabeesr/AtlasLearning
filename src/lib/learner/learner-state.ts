import type { CurriculumData, CurriculumTopic } from "@/types/domain";
import type {
  LearnerDashboardData,
  LearnerTopicStatus,
  PhaseProgress,
  TopicSummary,
} from "@/types/learner";
import type { TopicProgress } from "@/types/user";

function topicMap(curriculum: CurriculumData) {
  return new Map(curriculum.topics.map((topic) => [topic.slug, topic]));
}

function progressMap(progress: TopicProgress[]) {
  return new Map(progress.map((entry) => [entry.topicSlug, entry]));
}

function blockedByTopics(
  topic: CurriculumTopic,
  topicsBySlug: Map<string, CurriculumTopic>,
  progressByTopic: Map<string, TopicProgress>,
): CurriculumTopic[] {
  return topic.dependencySlugs
    .map((slug) => topicsBySlug.get(slug))
    .filter((dep): dep is CurriculumTopic => Boolean(dep))
    .filter((dep) => {
      const entry = progressByTopic.get(dep.slug);
      return !entry || entry.proficiencyScore < 65 || entry.status === "decaying";
    });
}

function deriveStatus(
  blockedBy: CurriculumTopic[],
  entry: TopicProgress | undefined,
): LearnerTopicStatus {
  if (entry?.status === "locked") return "locked";
  if (blockedBy.length > 0) return "blocked";
  if (entry?.status === "decaying") return "decaying";
  if (!entry || entry.proficiencyScore === 0) return "active";
  if (entry.proficiencyScore >= 85) return "strong";
  if (entry.proficiencyScore < 55) return "needs_work";
  return "active";
}

export function buildLearnerDashboardData({
  curriculum,
  progress,
}: {
  curriculum: CurriculumData;
  progress: TopicProgress[];
}): LearnerDashboardData {
  const topicsBySlug = topicMap(curriculum);
  const progressByTopic = progressMap(progress);

  const summaries: TopicSummary[] = curriculum.topics.map((topic) => {
    const blockedBy = blockedByTopics(topic, topicsBySlug, progressByTopic);
    const entry = progressByTopic.get(topic.slug);
    const status = deriveStatus(blockedBy, entry);
    const proficiencyScore = entry?.proficiencyScore ?? 0;
    const unlocks = curriculum.topics.filter((candidate) =>
      candidate.dependencySlugs.includes(topic.slug),
    );
    const subtopicSlugs = curriculum.topics
      .filter((candidate) => candidate.parentSlug === topic.slug)
      .map((candidate) => candidate.slug);

    return { topic, status, proficiencyScore, blockedBy, unlocks, subtopicSlugs };
  });

  const phaseProgress: PhaseProgress[] = curriculum.phases.map((phase) => {
    const phaseTopics = summaries.filter(
      (s) => s.topic.phaseSlug === phase.slug && s.topic.parentSlug === null,
    );
    const completedCount = phaseTopics.filter((s) => s.proficiencyScore >= 85).length;
    const decayingCount = phaseTopics.filter((s) => s.status === "decaying").length;
    const blockedCount = phaseTopics.filter(
      (s) => s.status === "blocked" || s.status === "locked",
    ).length;
    const averageProficiency =
      phaseTopics.length === 0
        ? 0
        : Math.round(
            phaseTopics.reduce((acc, s) => acc + s.proficiencyScore, 0) / phaseTopics.length,
          );

    return {
      phase,
      topicCount: phaseTopics.length,
      completedCount,
      decayingCount,
      blockedCount,
      averageProficiency,
      topicSlugs: phaseTopics.map((s) => s.topic.slug),
    };
  });

  const decaying = summaries.filter((s) => s.status === "decaying");
  const needsWork = summaries.filter((s) => s.status === "needs_work");
  const recentlyImproved = summaries
    .filter((s) => s.proficiencyScore >= 80 && s.status !== "decaying")
    .slice(0, 5);

  const trackedTopics = summaries.filter((s) => s.topic.parentSlug === null);
  const overallProficiency =
    trackedTopics.length === 0
      ? 0
      : Math.round(
          trackedTopics.reduce((acc, s) => acc + s.proficiencyScore, 0) / trackedTopics.length,
        );

  const topicsCompleted = trackedTopics.filter((s) => s.proficiencyScore >= 85).length;
  const totalMinutesEstimated = curriculum.topics
    .filter((t) => t.parentSlug === null)
    .reduce((acc, t) => acc + (t.estimatedMinutes ?? 0), 0);

  return {
    summaries,
    phaseProgress,
    decaying,
    needsWork,
    recentlyImproved,
    overallProficiency,
    topicsCompleted,
    topicsTotal: trackedTopics.length,
    totalMinutesEstimated,
  };
}

export function findTopicSummary(data: LearnerDashboardData, slug: string): TopicSummary | null {
  return data.summaries.find((s) => s.topic.slug === slug) ?? null;
}
