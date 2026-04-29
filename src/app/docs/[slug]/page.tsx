import { redirect } from "next/navigation";

export default async function ProjectDocRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/workbench/docs/${slug}`);
}
