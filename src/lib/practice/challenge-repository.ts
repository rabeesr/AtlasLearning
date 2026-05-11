/**
 * Coding challenge loader.
 *
 * Authoring layout per challenge under `src/data/challenges/<slug>/`:
 *   problem.md   — markdown problem statement
 *   starter.py   — initial editor contents
 *   solution.py  — reference implementation
 *   tests.py     — each top-level `def test_*` becomes one ChallengeTest
 *   meta.ts      — `export default` a `Partial<CodingChallenge>` with metadata
 *
 * Server-only (uses Node `fs`). Results are memoized in module scope.
 */

import { readFile, readdir } from "node:fs/promises";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import type { Difficulty } from "@/types/domain";
import type { ChallengeTest, CodingChallenge } from "@/types/practice";

const CHALLENGES_DIR = path.join(process.cwd(), "src", "data", "challenges");

const cache = new Map<string, CodingChallenge>();
let indexLoaded = false;

interface RawMeta {
  slug: string;
  title: string;
  summary: string;
  topicSlugs: string[];
  difficulty: Difficulty;
  estimatedMinutes: number;
  pythonPackages?: string[];
}

/**
 * Lightweight evaluator for `meta.ts`. Strips imports and the
 * `: Partial<CodingChallenge>` annotation so the body is plain JS, then
 * evaluates it inside a Function. Keeps the loader dependency-free.
 */
function parseMeta(source: string, slug: string): RawMeta {
  let body = source.replace(/^\s*import[^\n]*\n/gm, "");
  body = body.replace(/:\s*Partial<CodingChallenge>\s*/g, "");
  body = body.replace(/export\s+default\s+/g, "return ");
  body = body.replace(/^\s*export\s+/gm, "");

  try {
    const fn = new Function(
      `${body}\nreturn typeof meta !== 'undefined' ? meta : undefined;`,
    );
    const meta = fn() as Partial<RawMeta> | undefined;
    if (!meta) throw new Error("meta.ts did not export a value");
    return {
      slug: meta.slug ?? slug,
      title: meta.title ?? slug,
      summary: meta.summary ?? "",
      topicSlugs: meta.topicSlugs ?? [],
      difficulty: (meta.difficulty as Difficulty) ?? "intermediate",
      estimatedMinutes: meta.estimatedMinutes ?? 60,
      pythonPackages: meta.pythonPackages,
    };
  } catch (err) {
    throw new Error(
      `Failed to parse meta.ts for challenge "${slug}": ${(err as Error).message}`,
    );
  }
}

/**
 * Split `tests.py` on top-level `def test_*` declarations. Top-level non-test
 * statements (imports, helpers) form a shared prelude prepended to each test.
 * The runner appends a call to the test function at the end of each block.
 */
function parseTests(source: string): ChallengeTest[] {
  const lines = source.split(/\r?\n/);
  const preludeLines: string[] = [];
  type Block = { name: string; lines: string[] };
  const blocks: Block[] = [];
  let current: Block | null = null;
  const testDefRe = /^def\s+(test_[A-Za-z0-9_]+)\s*\(/;

  for (const line of lines) {
    const match = line.match(testDefRe);
    if (match && !line.startsWith(" ") && !line.startsWith("\t")) {
      if (current) blocks.push(current);
      current = { name: match[1], lines: [line] };
      continue;
    }
    if (current) {
      if (line.length > 0 && !line.startsWith(" ") && !line.startsWith("\t")) {
        blocks.push(current);
        current = null;
        preludeLines.push(line);
      } else {
        current.lines.push(line);
      }
    } else {
      preludeLines.push(line);
    }
  }
  if (current) blocks.push(current);

  const prelude = preludeLines.join("\n").trim();
  return blocks.map((block) => ({
    name: block.name,
    code: `${prelude ? `${prelude}\n\n` : ""}${block.lines.join("\n").trim()}\n\n${block.name}()`,
  }));
}

function composeChallenge(slug: string, files: {
  problem: string;
  starter: string;
  solution: string;
  tests: string;
  meta: string;
}): CodingChallenge {
  const meta = parseMeta(files.meta, slug);
  return {
    slug: meta.slug,
    title: meta.title,
    summary: meta.summary,
    topicSlugs: meta.topicSlugs,
    difficulty: meta.difficulty,
    estimatedMinutes: meta.estimatedMinutes,
    pythonPackages: meta.pythonPackages,
    problemMarkdown: files.problem,
    starterCode: files.starter,
    exampleSolution: files.solution,
    tests: parseTests(files.tests),
  };
}

async function loadChallengeFromDisk(slug: string): Promise<CodingChallenge | null> {
  const dir = path.join(CHALLENGES_DIR, slug);
  if (!existsSync(dir)) return null;
  const [problem, starter, solution, tests, meta] = await Promise.all([
    readFile(path.join(dir, "problem.md"), "utf8"),
    readFile(path.join(dir, "starter.py"), "utf8"),
    readFile(path.join(dir, "solution.py"), "utf8"),
    readFile(path.join(dir, "tests.py"), "utf8"),
    readFile(path.join(dir, "meta.ts"), "utf8"),
  ]);
  return composeChallenge(slug, { problem, starter, solution, tests, meta });
}

function loadChallengeFromDiskSync(slug: string): CodingChallenge | null {
  const dir = path.join(CHALLENGES_DIR, slug);
  if (!existsSync(dir)) return null;
  try {
    return composeChallenge(slug, {
      problem: readFileSync(path.join(dir, "problem.md"), "utf8"),
      starter: readFileSync(path.join(dir, "starter.py"), "utf8"),
      solution: readFileSync(path.join(dir, "solution.py"), "utf8"),
      tests: readFileSync(path.join(dir, "tests.py"), "utf8"),
      meta: readFileSync(path.join(dir, "meta.ts"), "utf8"),
    });
  } catch (err) {
    console.error(`[challenge-repository] failed to load "${slug}":`, err);
    return null;
  }
}

/** Async loader — returns null on missing directory. */
export async function getCodingChallenge(
  slug: string,
): Promise<CodingChallenge | null> {
  if (cache.has(slug)) return cache.get(slug) ?? null;
  const challenge = await loadChallengeFromDisk(slug);
  if (challenge) cache.set(slug, challenge);
  return challenge;
}

/** Sync index listing for server components / route generation. */
export function listCodingChallenges(): CodingChallenge[] {
  if (indexLoaded) return Array.from(cache.values());
  if (!existsSync(CHALLENGES_DIR)) {
    indexLoaded = true;
    return [];
  }
  const slugs = readdirSync(CHALLENGES_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  for (const slug of slugs) {
    if (cache.has(slug)) continue;
    const challenge = loadChallengeFromDiskSync(slug);
    if (challenge) cache.set(slug, challenge);
  }
  indexLoaded = true;
  return Array.from(cache.values());
}

/** Async variant of the index listing. */
export async function listCodingChallengesAsync(): Promise<CodingChallenge[]> {
  if (!existsSync(CHALLENGES_DIR)) return [];
  const slugs = (await readdir(CHALLENGES_DIR, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  const challenges = await Promise.all(slugs.map((slug) => getCodingChallenge(slug)));
  return challenges.filter((c): c is CodingChallenge => Boolean(c));
}
