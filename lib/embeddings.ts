import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function embed(texts: string[]) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts
  });
  return res.data.map(d => d.embedding as number[]);
}

export function cosine(a: number[], b: number[]) {
  let dot=0, na=0, nb=0;
  const L = Math.min(a.length, b.length);
  for (let i=0;i<L;i++){ dot+=a[i]*b[i]; na+=a[i]*a[i]; nb+=b[i]*b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}