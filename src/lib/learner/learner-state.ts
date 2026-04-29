import type { CurriculumData, CurriculumTopic } from "@/types/domain";
import type {
  DashboardTopicSummary,
  LearnerDashboardData,
  LearnerTopicStatus,
  NextActionItem,
  PillarProgress,
  PracticeCenterFilter,
  TopicActionKey,
  TopicActionState,
} from "@/types/learner";
import type { TopicProgress } from "@/types/user";

const actionLabels: Record<TopicActionKey, string> = {
  learn: "Learn",
  quiz: "Quiz",
  challenge: "Challenge",
  review: "Review",
};

function topicMap(curriculum: CurriculumData) {
  return new Map(curriculum.topics.map((topic) => [topic.slug, topic]));
}

function progressMap(progress: TopicProgress[]) {
  return new Map(progress.map((entry) => [entry.topicSlug, entry]));
}

function pillarForTopic(topic: CurriculumTopic, topicsBySlug: Map<string, CurriculumTopic>) {
  let current: CurriculumTopic | undefined = topic;
  while (current?.parentSlug) {
    current = topicsBySlug.get(current.parentSlug);
  }
  return current ?? topic;
}

function blockedByTopics(
  topic: CurriculumTopic,
  topicsBySlug: Map<string, CurriculumTopic>,
  progressByTopic: Map<string, TopicProgress>,
) {
  return topic.dependencySlugs
    .map((slug) => topicsBySlug.get(slug))
    .filter((dependency): dependency is CurriculumTopic => Boolean(dependency))
    .filter((dependency) => {
      const entry = progressByTopic.get(dependency.slug);
      return !entry || entry.proficiencyScore < 65 || entry.status === "decaying";
    });
}

function deriveLearnerTopicStatus(
  topic: CurriculumTopic,
  blockedBy: CurriculumTopic[],
  entry: TopicProgress | undefined,
): LearnerTopicStatus {
  if (blockedBy.length > 0) {
    return "blocked";
  }
  if (entry?.status === "decaying") {
    return "decaying";
  }
  if (entry?.status === "completed" && entry.proficiencyScore >= 85) {
    return "strong";
  }
  if (entry && (entry.proficiencyScore < 45 || (entry.status === "in_progress" && entry.proficiencyScore < 55))) {
    return "needs_work";
  }
  return "active";
}

function actionHref(kind: TopicActionKey, topicSlug: string) {
  if (kind === "learn") {
    return `/topics/${topicSlug}`;
  }
  if (kind === "quiz") {
    return `/practice/quizzes?topic=${topicSlug}`;
  }
  if (kind === "challenge") {
    return `/practice/challenges?topic=${topicSlug}`;
  }
  return `/review/spaced-repetition?topic=${topicSlug}`;
}

function buildActionState({
  action,
  learnerStatus,
  topic,
  contentAuthored,
  quizAuthored,
  challengeAuthored,
  entry,
}: {
  action: TopicActionKey;
  learnerStatus: LearnerTopicStatus;
  topic: CurriculumTopic;
  contentAuthored: boolean;
  quizAuthored: boolean;
  challengeAuthored: boolean;
  entry: TopicProgress | undefined;
}): TopicActionState {
  let status: TopicActionAvailability = "available";
  let detail = "Ready now.";

  if (learnerStatus === "blocked") {
    status = "blocked";
    detail = "Finish prerequisites first.";
  } else if (action === "learn") {
    if (!contentAuthored) {
      status = "not_authored";
      detail = "Study notes are not authored yet.";
    } else if (entry?.status === "completed" && entry.proficiencyScore >= 85) {
      status = "completed";
      detail = "Core study pass completed.";
    } else if (entry?.status === "in_progress") {
      status = "started";
      detail = "Continue the current learning pass.";
    }
  } else if (action === "quiz") {
    if (!quizAuthored) {
      status = "not_authored";
      detail = "Quiz bank is not authored yet.";
    } else if (entry?.status === "completed" || entry?.proficiencyScore >= 70) {
      status = "completed";
      detail = "Retrieval checks already passed recently.";
    } else if (entry?.status === "in_progress" || entry?.proficiencyScore > 0) {
      status = "started";
      detail = "Use a short quiz to tighten this topic.";
    }
  } else if (action === "challenge") {
    if (!challengeAuthored) {
      status = "not_authored";
      detail = "Challenge set is not authored yet.";
    } else if (entry?.status === "completed" && entry.proficiencyScore >= 80) {
      status = "completed";
      detail = "Applied practice already completed.";
    } else if (entry?.proficiencyScore >= 30) {
      status = "started";
      detail = "Push beyond reading into applied work.";
    }
  } else if (action === "review") {
    if (entry?.status === "decaying") {
      status = "started";
      detail = "Due now. Review before recall slips further.";
    } else if (entry?.status === "completed" || entry?.status === "in_progress") {
      status = "available";
      detail = "Use review to stabilize retention.";
    } else {
      status = "not_authored";
      detail = "Review starts after an initial pass.";
    }
  }

  return {
    key: action,
    label: actionLabels[action],
    href: actionHref(action, topic.slug),
    status,
    detail,
  };
}

export function buildLearnerDashboardData({
  curriculum,
  progress,
  contentTopicSlugs,
  quizTopicSlugs,
  challengeTopicSlugs,
}: {
  curriculum: CurriculumData;
  progress: TopicProgress[];
  contentTopicSlugs: string[];
  quizTopicSlugs: string[];
  challengeTopicSlugs: string[];
}): LearnerDashboardData {
  const topicsBySlug = topicMap(curriculum);
  const progressByTopic = progressMap(progress);
  const contentSet = new Set(contentTopicSlugs);
  const quizSet = new Set(quizTopicSlugs);
  const challengeSet = new Set(challengeTopicSlugs);

  const summaries = curriculum.topics.map((topic) => {
    const pillar = pillarForTopic(topic, topicsBySlug);
    const blockedBy = blockedByTopics(topic, topicsBySlug, progressByTopic);
    const entry = progressByTopic.get(topic.slug);
    const status = deriveLearnerTopicStatus(topic, blockedBy, entry);
    const progressPercent = entry?.proficiencyScore ?? 0;
    const unlocks = curriculum.topics.filter((candidate) => candidate.dependencySlugs.includes(topic.slug));
    const availableActions = (["learn", "quiz", "challenge", "review"] as TopicActionKey[]).map((action) =>
      buildActionState({
        action,
        learnerStatus: status,
        topic,
        contentAuthored: contentSet.has(topic.slug),
        quizAuthored: quizSet.has(topic.slug),
        challengeAuthored: challengeSet.has(topic.slug),
        entry,
      }),
    );

    return {
      topic,
      pillarSlug: pillar.slug,
      pillarName: pillar.name,
      status,
      blockedBy,
      unlocks,
      availableActions,
      progressPercent,
    };
  });

  const statusCounts: Record<LearnerTopicStatus, number> = {
    strong: 0,
    active: 0,
    needs_work: 0,
    decaying: 0,
    blocked: 0,
  };
  for (const summary of summaries) {
    statusCounts[summary.status] += 1;
  }

  const pillars = curriculum.topics
    .filter((topic) => topic.parentSlug === null)
    .map((pillar) => {
      const topics = summaries.filter((summary) => summary.pillarSlug === pillar.slug);
      const strongCount = topics.filter((summary) => summary.status === "strong").length;
      const blockedCount = topics.filter((summary) => summary.status === "blocked").length;
      const weakCount = topics.filter((summary) => summary.status === "needs_work" || summary.status === "decaying").length;
      const activeCount = topics.filter((summary) => summary.status === "active").length;
      const completionCount = topics.filter((summary) => summary.progressPercent >= 80).length;
      const progressPercent =
        topics.length === 0
          ? 0
          : Math.round(topics.reduce((sum, topic) => sum + topic.progressPercent, 0) / topics.length);

      return {
        pillarSlug: pillar.slug,
        pillarName: pillar.name,
        topicCount: topics.length,
        completionCount,
        blockedCount,
        weakCount,
        activeCount,
        strongCount,
        progressPercent,
      };
    });

  const nextActions = summaries
    .flatMap((summary) =>
      summary.availableActions
        .filter((action) => action.status === "available" || action.status === "started")
        .map((action) => {
          const priority =
            summary.status === "decaying"
              ? 100
              : summary.status === "needs_work"
                ? 90
                : action.key === "learn"
                  ? 70
                  : 60;

          return {
            id: `${summary.topic.slug}:${action.key}`,
            kind: action.key,
            title: `${action.label}: ${summary.topic.name}`,
            detail: action.detail,
            topicSlug: summary.topic.slug,
            pillarSlug: summary.pillarSlug,
            href: action.href,
            priority,
          };
        }),
    )
    .sort((left, right) => right.priority - left.priority)
    .slice(0, 8);

  const completionPercent =
    summaries.length === 0
      ? 0
      : Math.round(summaries.reduce((sum, topic) => sum + topic.progressPercent, 0) / summaries.length);

  const focusTopic =
    summaries.find((summary) => summary.status === "decaying") ??
    summaries.find((summary) => summary.status === "needs_work") ??
    summaries.find((summary) => summary.status === "active") ??
    null;

  return {
    summaries,
    pillars,
    nextActions,
    statusCounts,
    completionPercent,
    focusTopic,
  };
}

export function buildPracticeFilter(searchParams: Record<string, string | string[] | undefined>): PracticeCenterFilter {
  const read = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value ?? null;
  };

  const status = read("status");
  const readiness = read("readiness");
  const mode = read("mode");

  return {
    selectedPillar: read("pillar"),
    selectedTopic: read("topic"),
    selectedStatus:
      status === "strong" ||
      status === "active" ||
      status === "needs_work" ||
      status === "decaying" ||
      status === "blocked"
        ? status
        : "all",
    readiness: readiness === "ready" || readiness === "blocked" ? readiness : "all",
    mode: mode === "due" || mode === "ready_now" || mode === "started" ? mode : "all",
  };
}

export function filterPracticeSummaries(
  summaries: DashboardTopicSummary[],
  filter: PracticeCenterFilter,
) {
  return summaries.filter((summary) => {
    if (filter.selectedPillar && summary.pillarSlug !== filter.selectedPillar) {
      return false;
    }
    if (filter.selectedTopic && summary.topic.slug !== filter.selectedTopic) {
      return false;
    }
    if (filter.selectedStatus !== "all" && summary.status !== filter.selectedStatus) {
      return false;
    }
    if (filter.readiness === "ready" && summary.status === "blocked") {
      return false;
    }
    if (filter.readiness === "blocked" && summary.status !== "blocked") {
      return false;
    }
    if (filter.mode === "due" && summary.status !== "decaying") {
      return false;
    }
    if (filter.mode === "ready_now" && summary.status === "blocked") {
      return false;
    }
    if (
      filter.mode === "started" &&
      !summary.availableActions.some((action) => action.status === "started" || action.status === "completed")
    ) {
      return false;
    }
    return true;
  });
}
