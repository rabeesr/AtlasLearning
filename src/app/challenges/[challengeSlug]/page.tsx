import Link from "next/link";
import { notFound } from "next/navigation";

import { ChallengeRunner } from "@/components/practice/challenge-runner";
import { Badge, Card, SectionHeader } from "@/components/shared/ui";
import { getCurriculumData } from "@/lib/content/curriculum";
import { getCodingChallenge } from "@/lib/practice/challenge-repository";

function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.round((min / 60) * 10) / 10;
  return `${h}h`;
}

export default async function ChallengeRunnerPage({
  params,
}: {
  params: Promise<{ challengeSlug: string }>;
}) {
  const { challengeSlug } = await params;

  const codingChallenge = await getCodingChallenge(challengeSlug);
  if (!codingChallenge) {
    notFound();
  }

  const { title, summary, difficulty, estimatedMinutes, topicSlugs } =
    codingChallenge;

  const curriculum = await getCurriculumData();
  const topicLookup = new Map(curriculum.topics.map((t) => [t.slug, t]));
  const taggedTopics = topicSlugs
    .map((slug) => topicLookup.get(slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div className="space-y-8">
      <Link
        href="/challenges"
        className="inline-flex items-center gap-1.5 text-[14px] text-[var(--text-muted)] transition hover:text-[var(--accent)]"
      >
        <span aria-hidden>←</span> Back to Challenges
      </Link>

      <SectionHeader
        eyebrow="Challenge"
        title={title}
        description={summary}
        action={
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{difficulty}</Badge>
            <Badge>{formatMinutes(estimatedMinutes)}</Badge>
            <Badge>Python</Badge>
          </div>
        }
      />

      <ChallengeRunner challenge={codingChallenge} />

      {taggedTopics.length > 0 ? (
        <Card interactive={false}>
          <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
            Tagged topics
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {taggedTopics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className="rounded-full border border-[var(--accent)]/40 bg-transparent px-3 py-1 text-[14px] text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {topic.name}
              </Link>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
