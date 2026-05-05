import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

import { activeDomain } from "@/lib/domain/config";
import type { TopicContent } from "@/types/domain";

const topicsRoot = path.join(
  process.cwd(),
  "src",
  "data",
  "domains",
  activeDomain.slug,
  "topics",
);

export async function getTopicContent(topicSlug: string): Promise<TopicContent | null> {
  try {
    const raw = await readFile(path.join(topicsRoot, `${topicSlug}.md`), "utf8");
    const parsed = matter(raw);

    return {
      slug: topicSlug,
      title: String(parsed.data.title ?? topicSlug),
      summary: String(parsed.data.summary ?? ""),
      learningObjectives: Array.isArray(parsed.data.learning_objectives)
        ? parsed.data.learning_objectives.map(String)
        : [],
      estimatedMinutes:
        typeof parsed.data.estimated_minutes === "number"
          ? parsed.data.estimated_minutes
          : undefined,
      prerequisitesRecap: Array.isArray(parsed.data.prerequisites_recap)
        ? parsed.data.prerequisites_recap.map(String)
        : [],
      sources: Array.isArray(parsed.data.sources)
        ? parsed.data.sources.map(String)
        : [],
      keyConcepts: extractKeyConcepts(parsed.content),
      body: parsed.content,
    };
  } catch {
    return null;
  }
}

/**
 * Extract H3 titles under a `## Key concepts` section. Used by the
 * proficiency tracker to present each concept as a checkable item.
 */
function extractKeyConcepts(body: string): string[] {
  const lines = body.split("\n");
  const concepts: string[] = [];
  let inSection = false;
  for (const line of lines) {
    const h2 = /^##\s+(.+?)\s*$/.exec(line);
    if (h2) {
      inSection = /^key concepts$/i.test(h2[1].trim());
      continue;
    }
    if (!inSection) continue;
    const h3 = /^###\s+(.+?)\s*$/.exec(line);
    if (h3) concepts.push(h3[1].trim());
  }
  return concepts;
}

export async function listTopicContentSlugs(): Promise<string[]> {
  try {
    const entries = await readdir(topicsRoot, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => entry.name.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}
