import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

import { activeDomain } from "@/lib/domain/config";
import type { ParserDefinition, SourceManifestEntry } from "@/types/ingestion";

const rawRoot = path.join(
  process.cwd(),
  "src",
  "data",
  "domains",
  activeDomain.slug,
  "raw",
);

export const parserRegistry: ParserDefinition[] = [
  {
    id: "manual-normalizer",
    name: "Manual normalization",
    supportedSourceTypes: ["article", "video"],
    status: "available",
    notes: "Use for sources that do not require extraction tooling.",
  },
  {
    id: "pdf-lecture-extractor",
    name: "PDF lecture extractor",
    supportedSourceTypes: ["pdf"],
    status: "planned",
    notes: "Planned parser for lecture slides and course PDFs.",
  },
  {
    id: "repo-syllabus-scraper",
    name: "Repository syllabus scraper",
    supportedSourceTypes: ["github-repo"],
    status: "planned",
    notes: "Planned parser for educational repos and README-derived topic extraction.",
  },
];

export async function getSourceManifestEntries(): Promise<SourceManifestEntry[]> {
  const manifestRoot = path.join(rawRoot, "manifests");
  const filenames = (await readdir(manifestRoot)).filter((name) => name.endsWith(".yaml"));

  const entries = await Promise.all(
    filenames.map(async (filename) => {
      const raw = await readFile(path.join(manifestRoot, filename), "utf8");
      return YAML.parse(raw) as SourceManifestEntry;
    }),
  );

  return entries.sort((a, b) => a.title.localeCompare(b.title));
}
