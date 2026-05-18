import { createClient } from "@supabase/supabase-js";

import { embedQuery } from "./voyage-client";

export interface RetrievedChunk {
  source_kind: "topic" | "reference";
  source_id: string;
  section: string | null;
  content: string;
  similarity: number;
}

let cachedClient: ReturnType<typeof createClient> | null = null;
let warnedMissing = false;
function retrievalClient(): ReturnType<typeof createClient> | null {
  if (cachedClient) return cachedClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // reference_chunks has public-select RLS, so the publishable key suffices.
  // Service role is accepted too for parity with admin contexts.
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    if (!warnedMissing) {
      console.warn(
        "[tutor] retrieval disabled — set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local and run `npm run build:tutor-corpus` to enable citations.",
      );
      warnedMissing = true;
    }
    return null;
  }
  cachedClient = createClient(url, key, {
    auth: { persistSession: false },
  });
  return cachedClient;
}

/**
 * Retrieve top-K chunks from the corpus by cosine similarity to the query.
 * If `boostTopic` is set, the topic's notes are pulled first (always-on) and
 * then we top up with the next-best by similarity to fill K.
 */
export async function retrieveChunks(
  query: string,
  k = 3,
  boostTopic?: string,
): Promise<RetrievedChunk[]> {
  const supabase = retrievalClient();
  if (!supabase) return []; // retrieval not configured; answer without citations
  const embedding = await embedQuery(query);

  // Supabase doesn't expose pgvector operators via the JS SDK directly; use
  // a tiny RPC alternative: order by cosine distance via .rpc or a raw query.
  // Simplest path: use the REST .from + order via a stored function. To stay
  // dependency-light, we hand-write a small RPC inline via supabase.rpc with
  // a SQL function we expect exists. For initial demo, fall back to a naive
  // client-side k-NN over all rows (corpus is tiny: <200 chunks).
  const { data, error } = await supabase
    .from("reference_chunks")
    .select("source_kind, source_id, section, content, embedding");
  if (error || !data) {
    throw new Error(`retrieveChunks failed: ${error?.message ?? "no data"}`);
  }

  const scored = (data as unknown as Array<{
    source_kind: "topic" | "reference";
    source_id: string;
    section: string | null;
    content: string;
    embedding: number[] | string;
  }>).map((row) => {
    // pgvector may return embedding as a string "[0.1,0.2,...]" via JSON.
    const emb =
      typeof row.embedding === "string"
        ? (JSON.parse(row.embedding) as number[])
        : row.embedding;
    return {
      source_kind: row.source_kind,
      source_id: row.source_id,
      section: row.section,
      content: row.content,
      similarity: cosine(embedding, emb),
    };
  });

  scored.sort((a, b) => b.similarity - a.similarity);

  if (!boostTopic) return scored.slice(0, k);

  const topicHits = scored.filter(
    (c) => c.source_kind === "topic" && c.source_id === boostTopic,
  );
  const others = scored.filter(
    (c) => !(c.source_kind === "topic" && c.source_id === boostTopic),
  );
  const merged = [...topicHits.slice(0, 1), ...others].slice(0, k);
  return merged;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
