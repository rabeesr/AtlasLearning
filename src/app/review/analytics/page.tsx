import { notFound } from "next/navigation";

import { AtlasShell } from "@/components/shared/app-shell";
import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { getPlaceholderMeta } from "@/lib/ui/atlas-ui";

export default function AnalyticsPage() {
  const meta = getPlaceholderMeta("/review/analytics");
  if (!meta) notFound();

  return (
    <AtlasShell description={meta.purpose} eyebrow={meta.eyebrow} title={meta.title}>
      <PlaceholderPage meta={meta} />
    </AtlasShell>
  );
}
