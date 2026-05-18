import Link from "next/link";
import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { Card, SectionHeader } from "@/components/shared/ui";
import { TopicMarkdown } from "@/components/topic/topic-markdown";
import { KNOWN_REFERENCE_SLUGS } from "@/lib/tutor/citation-targets";

const REFERENCES_ROOT = path.join(
  process.cwd(),
  "src",
  "data",
  "references",
);

async function loadReference(slug: string): Promise<string | null> {
  try {
    return await readFile(path.join(REFERENCES_ROOT, `${slug}.md`), "utf8");
  } catch {
    return null;
  }
}

function titleFromMarkdown(md: string, fallback: string): string {
  const h1 = md.match(/^#\s+(.+?)\s*$/m);
  return h1 ? h1[1].trim() : fallback;
}

function strippedBody(md: string): string {
  // Drop the leading H1 since we render the title via SectionHeader.
  return md.replace(/^#\s+.+\n+/, "");
}

function prettyFallback(slug: string): string {
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function ReferencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!KNOWN_REFERENCE_SLUGS.has(slug)) notFound();
  const raw = await loadReference(slug);
  if (!raw) notFound();

  const title = titleFromMarkdown(raw, prettyFallback(slug));

  return (
    <div className="space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[14px] text-[var(--text-muted)] transition hover:text-[var(--accent)]"
      >
        <span aria-hidden>←</span> Back
      </Link>

      <SectionHeader eyebrow="Reference" title={title} />

      <Card interactive={false}>
        <TopicMarkdown content={strippedBody(raw)} />
      </Card>
    </div>
  );
}

export function generateStaticParams() {
  return Array.from(KNOWN_REFERENCE_SLUGS).map((slug) => ({ slug }));
}
