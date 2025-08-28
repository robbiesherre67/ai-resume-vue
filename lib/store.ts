import resume from "../data/resume.json";
import { embed, cosine } from "./embeddings";

export type Chunk = { id: string; text: string; embedding?: number[] };

let chunks: Chunk[] = (resume as Chunk[]).map(c => ({ ...c }));
let ready = false;

export async function ensureEmbedded() {
  if (ready) return;
  const vectors = await embed(chunks.map(c => c.text));
  chunks = chunks.map((c, i) => ({ ...c, embedding: vectors[i] }));
  ready = true;
}

export async function searchRelevant(query: string, k = 5) {
  await ensureEmbedded();
  const [qVec] = await embed([query]);
  return chunks
    .map(c => ({ ...c, score: cosine(qVec, c.embedding!) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}