import { readFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

import { activeDomain } from "@/lib/domain/config";
import type { CurriculumData, CurriculumTopic, Difficulty } from "@/types/domain";

interface TopicNode {
  slug: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  estimated_minutes?: number;
  dependencies?: string[];
  subtopics?: TopicNode[];
}

interface CurriculumFile {
  domain: CurriculumData["domain"];
  topics: TopicNode[];
}

const domainRoot = path.join(process.cwd(), "src", "data", "domains", activeDomain.slug);

function flattenTopics(nodes: TopicNode[], parentSlug: string | null = null): CurriculumTopic[] {
  return nodes.flatMap((node) => {
    const current: CurriculumTopic = {
      slug: node.slug,
      name: node.name,
      description: node.description,
      difficulty: node.difficulty,
      parentSlug,
      dependencySlugs: node.dependencies ?? [],
      estimatedMinutes: node.estimated_minutes,
    };

    const descendants = flattenTopics(node.subtopics ?? [], node.slug);
    return [current, ...descendants];
  });
}

export async function getCurriculumData(): Promise<CurriculumData> {
  const raw = await readFile(path.join(domainRoot, "curriculum.yaml"), "utf8");
  const parsed = YAML.parse(raw) as CurriculumFile;

  return {
    domain: parsed.domain,
    topics: flattenTopics(parsed.topics),
  };
}

export async function getTopicBySlug(topicSlug: string) {
  const curriculum = await getCurriculumData();
  return curriculum.topics.find((topic) => topic.slug === topicSlug) ?? null;
}

export async function getChildTopics(parentSlug: string) {
  const curriculum = await getCurriculumData();
  return curriculum.topics.filter((topic) => topic.parentSlug === parentSlug);
}
