import type { DomainSlug } from "@/types/domain";

export type SourceType = "pdf" | "powerpoint" | "github-repo" | "article" | "video";
export type ParserStatus =
  | "not_needed"
  | "covered_by_existing_parser"
  | "needs_new_parser"
  | "in_progress"
  | "normalized";

export interface SourceManifestEntry {
  id: string;
  domain: DomainSlug;
  title: string;
  sourceType: SourceType;
  provenance: string;
  localAssetPath?: string;
  parserId?: string;
  parserStatus: ParserStatus;
  normalizationStatus: "not_started" | "drafted" | "completed";
  linkedTopicSlugs: string[];
  notes?: string;
}

export interface ParserDefinition {
  id: string;
  name: string;
  supportedSourceTypes: SourceType[];
  status: "planned" | "available";
  notes: string;
}
