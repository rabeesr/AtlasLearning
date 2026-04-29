import { redirect } from "next/navigation";

export default async function ConceptVariantRedirect({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant } = await params;
  redirect(`/workbench/concepts/${variant}`);
}
