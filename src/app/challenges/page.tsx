import { GlobalPracticePage } from "@/components/practice/global-practice-page";

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <GlobalPracticePage
      kind="challenge"
      searchParams={searchParams}
      title="Coding Challenges"
      eyebrow="Practice"
      description="Implementation problems that force transfer. Filter by topic, phase, or difficulty."
    />
  );
}
