/**
 * Voyage embeddings — query-time embed for retrieval.
 * Build-time embeds live in scripts/build-tutor-corpus.ts.
 */

const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";

export async function embedQuery(text: string): Promise<number[]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error("VOYAGE_API_KEY missing");

  const res = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: [text],
      model: "voyage-3-lite",
      input_type: "query",
    }),
  });
  if (!res.ok) {
    throw new Error(`Voyage embed failed (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as { data: { embedding: number[] }[] };
  return json.data[0].embedding;
}
