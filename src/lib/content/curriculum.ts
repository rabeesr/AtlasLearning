import { readFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

import { activeDomain } from "@/lib/domain/config";
import type {
  CurriculumData,
  CurriculumTopic,
  Difficulty,
  Phase,
  TopicSurface,
} from "@/types/domain";

interface TopicNode {
  slug: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  estimated_minutes?: number;
  dependencies?: string[];
  phase?: string;
  branch?: string;
  surfaces?: TopicSurface[];
  subtopics?: TopicNode[];
}

interface CurriculumFile {
  domain: CurriculumData["domain"];
  phases?: Phase[];
  topics: TopicNode[];
}

const domainRoot = path.join(process.cwd(), "src", "data", "domains", activeDomain.slug);

const DEFAULT_SURFACES: TopicSurface[] = ["learn", "quizzes"];

function flattenTopics(
  nodes: TopicNode[],
  parentSlug: string | null = null,
  inheritedPhase: string | null = null,
  inheritedBranch: string | null = null,
): CurriculumTopic[] {
  return nodes.flatMap((node) => {
    const phaseSlug = node.phase ?? inheritedPhase;
    const branch = node.branch ?? inheritedBranch;
    const current: CurriculumTopic = {
      slug: node.slug,
      name: node.name,
      description: node.description,
      difficulty: node.difficulty,
      parentSlug,
      phaseSlug,
      branch,
      dependencySlugs: node.dependencies ?? [],
      surfaces: node.surfaces ?? DEFAULT_SURFACES,
      estimatedMinutes: node.estimated_minutes,
    };

    const descendants = flattenTopics(node.subtopics ?? [], node.slug, phaseSlug, branch);
    return [current, ...descendants];
  });
}

let cached: CurriculumData | null = null;

export async function getCurriculumData(): Promise<CurriculumData> {
  if (cached) return cached;
  const raw = await readFile(path.join(domainRoot, "curriculum.yaml"), "utf8");
  const parsed = YAML.parse(raw) as CurriculumFile;

  cached = {
    domain: parsed.domain,
    phases: parsed.phases ?? [],
    topics: flattenTopics(parsed.topics),
  };
  return cached;
}

export async function getTopicBySlug(topicSlug: string) {
  const curriculum = await getCurriculumData();
  return curriculum.topics.find((topic) => topic.slug === topicSlug) ?? null;
}

export async function getChildTopics(parentSlug: string) {
  const curriculum = await getCurriculumData();
  return curriculum.topics.filter((topic) => topic.parentSlug === parentSlug);
}

export async function getTopLevelTopics() {
  const curriculum = await getCurriculumData();
  return curriculum.topics.filter((topic) => topic.parentSlug === null);
}

export async function getPhase(phaseSlug: string) {
  const curriculum = await getCurriculumData();
  return curriculum.phases.find((phase) => phase.slug === phaseSlug) ?? null;
}
