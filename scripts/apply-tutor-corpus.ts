/**
 * apply-tutor-corpus
 * ------------------
 * Parses scripts/tutor-corpus.generated.sql (produced by build-tutor-corpus)
 * and inserts the rows via supabase-js using the publishable (anon) key.
 *
 * Requires a temporary insert RLS policy on public.reference_chunks. Apply
 * via MCP before running, then drop after:
 *
 *   create policy "reference_chunks_temp_insert" on public.reference_chunks
 *     for insert with check (true);
 *   -- run this script --
 *   drop policy "reference_chunks_temp_insert" on public.reference_chunks;
 */

import { config as loadEnv } from "dotenv";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: ".env.local" });
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!SUPABASE_URL) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
if (!SUPABASE_KEY)
  throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required");

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

const SQL_FILE = join(process.cwd(), "scripts/tutor-corpus.generated.sql");

interface Row {
  source_kind: "topic" | "reference";
  source_id: string;
  section: string | null;
  content: string;
  embedding: number[];
}

/**
 * Parse the rows out of the generated SQL file. Format per row:
 *   ('topic', 'slug', NULL or 'section', 'content', '[0.1,0.2,...]'::vector(512))
 * with single-quotes inside strings escaped as ''. The content field may
 * span many lines.
 */
function parseRows(sql: string): Row[] {
  const rows: Row[] = [];
  // Strip leading comments and DELETE / INSERT-header lines; what we want is the
  // body of each INSERT. We walk character-by-character to respect quoted strings.
  let i = 0;
  while (i < sql.length) {
    if (sql[i] !== "(") {
      i++;
      continue;
    }
    // Try to parse a row starting at this '('.
    const result = parseRow(sql, i);
    if (result) {
      rows.push(result.row);
      i = result.end;
    } else {
      i++;
    }
  }
  return rows;
}

function parseRow(sql: string, start: number): { row: Row; end: number } | null {
  if (sql[start] !== "(") return null;
  // Field 1: 'topic' or 'reference'
  let i = start + 1;
  const f1 = readQuoted(sql, i);
  if (!f1) return null;
  i = f1.end;
  if (sql[i] !== ",") return null;
  i = skipSpace(sql, i + 1);
  const f2 = readQuoted(sql, i);
  if (!f2) return null;
  i = f2.end;
  if (sql[i] !== ",") return null;
  i = skipSpace(sql, i + 1);
  let f3: string | null;
  if (sql.startsWith("NULL", i)) {
    f3 = null;
    i += 4;
  } else {
    const q = readQuoted(sql, i);
    if (!q) return null;
    f3 = q.value;
    i = q.end;
  }
  if (sql[i] !== ",") return null;
  i = skipSpace(sql, i + 1);
  const f4 = readQuoted(sql, i);
  if (!f4) return null;
  i = f4.end;
  if (sql[i] !== ",") return null;
  i = skipSpace(sql, i + 1);
  // Vector literal: '[…]'::vector(512)
  const vec = readQuoted(sql, i);
  if (!vec) return null;
  i = vec.end;
  // Skip '::vector(512)'
  if (sql.startsWith("::vector(512)", i)) i += "::vector(512)".length;
  if (sql[i] !== ")") return null;
  const end = i + 1;

  const embedding = JSON.parse(vec.value) as number[];
  if (!Array.isArray(embedding) || embedding.length !== 512) return null;

  return {
    row: {
      source_kind: f1.value as "topic" | "reference",
      source_id: f2.value,
      section: f3,
      content: f4.value,
      embedding,
    },
    end,
  };
}

function skipSpace(sql: string, i: number): number {
  while (i < sql.length && (sql[i] === " " || sql[i] === "\t" || sql[i] === "\n")) i++;
  return i;
}

function readQuoted(sql: string, start: number): { value: string; end: number } | null {
  if (sql[start] !== "'") return null;
  let i = start + 1;
  let out = "";
  while (i < sql.length) {
    if (sql[i] === "'") {
      if (sql[i + 1] === "'") {
        out += "'";
        i += 2;
        continue;
      }
      return { value: out, end: i + 1 };
    }
    out += sql[i];
    i++;
  }
  return null;
}

async function main() {
  const sql = await readFile(SQL_FILE, "utf8");
  const rows = parseRows(sql);
  console.log(`[apply-tutor-corpus] parsed ${rows.length} rows`);
  if (rows.length === 0) throw new Error("no rows parsed");

  // Insert in batches of 25 to stay well under request size limits.
  const BATCH = 25;
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("reference_chunks").insert(slice);
    if (error) {
      throw new Error(`Insert failed at batch ${i}: ${error.message}`);
    }
    console.log(`[apply-tutor-corpus] inserted ${i + slice.length} / ${rows.length}`);
  }
  console.log("[apply-tutor-corpus] done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
