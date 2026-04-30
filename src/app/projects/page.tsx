import { GlobalPracticePage } from "@/components/practice/global-practice-page";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <GlobalPracticePage
      kind="project"
      searchParams={searchParams}
      title="Projects"
      eyebrow="Practice"
      description="Multi-week synthesis projects that integrate several topics. Filter by topic, phase, or difficulty."
    />
  );
}
