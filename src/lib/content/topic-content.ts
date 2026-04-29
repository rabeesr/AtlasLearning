import { readFile } from "node:fs/promises";
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
      body: parsed.content,
    };
  } catch {
    return null;
  }
}
