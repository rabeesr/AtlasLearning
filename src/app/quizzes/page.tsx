import { GlobalPracticePage } from "@/components/practice/global-practice-page";

export default async function QuizzesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <GlobalPracticePage
      kind="quiz"
      searchParams={searchParams}
      title="Quizzes"
      eyebrow="Practice"
      description="Retrieval practice across the full curriculum. Filter by topic, phase, or difficulty — quizzes can span multiple topics."
    />
  );
}
