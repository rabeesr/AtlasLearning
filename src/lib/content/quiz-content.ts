import { readFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

import { activeDomain } from "@/lib/domain/config";
import type { Difficulty } from "@/types/domain";
import type { Quiz, QuizQuestion } from "@/types/practice";

const quizzesRoot = path.join(
  process.cwd(),
  "src",
  "data",
  "domains",
  activeDomain.slug,
  "quizzes",
);

const VALID_DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];

function parseDifficulty(value: unknown): Difficulty {
  if (typeof value === "string" && (VALID_DIFFICULTIES as string[]).includes(value)) {
    return value as Difficulty;
  }
  return "beginner";
}

function parseQuestion(raw: unknown): QuizQuestion | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === "string" ? r.id : null;
  const prompt = typeof r.prompt === "string" ? r.prompt : null;
  const type = typeof r.type === "string" ? r.type : null;
  const answer = typeof r.answer === "string" ? r.answer : null;
  if (!id || !prompt || !type || !answer) return null;

  const base = {
    id,
    prompt,
    difficulty: parseDifficulty(r.difficulty),
    rubric: Array.isArray(r.rubric) ? r.rubric.map(String) : undefined,
  };

  if (type === "multiple_choice") {
    const choices = Array.isArray(r.choices) ? r.choices.map(String) : [];
    if (choices.length < 2 || !choices.includes(answer)) return null;
    return {
      ...base,
      type: "multiple_choice",
      choices,
      answer,
      explanation: typeof r.explanation === "string" ? r.explanation : undefined,
    };
  }

  if (type === "short_answer" || type === "code") {
    return { ...base, type, answer };
  }

  return null;
}

export async function getQuizForTopic(topicSlug: string): Promise<Quiz | null> {
  try {
    const raw = await readFile(path.join(quizzesRoot, `${topicSlug}.yaml`), "utf8");
    const parsed = YAML.parse(raw) as { topic?: string; items?: unknown[] } | null;
    if (!parsed || !Array.isArray(parsed.items)) return null;

    const items = parsed.items
      .map(parseQuestion)
      .filter((q): q is QuizQuestion => Boolean(q));
    if (items.length === 0) return null;

    return { topicSlug: parsed.topic ?? topicSlug, items };
  } catch {
    return null;
  }
}
