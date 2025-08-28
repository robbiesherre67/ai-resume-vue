import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import { z } from "zod";
import { searchRelevant } from "../lib/store";

const Body = z.object({
  jobDescription: z.string().min(50),
  tone: z.enum(["concise","leadership","impact"]).default("impact")
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const body = Body.parse(req.body);
    const top = await searchRelevant(body.jobDescription, 5);
    const context = top.map(t => `- ${t.text}`).join("\n");

    const prompt = `
You are a resume rewrite assistant. Using ONLY the context and the job description,
rewrite 4-6 resume bullets that match the role. Keep strong metrics and action verbs.

Tone: ${body.tone}

Job Description:
${body.jobDescription}

Context (my experience):
${context}

Rules:
- No hallucinations; do not invent tech I didn't use.
- Keep bullets scannable; 1 line each when possible.
- Emphasize measurable impact.
Return as a markdown list.
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    });

    const text = completion.choices[0]?.message?.content ?? "No output.";
    return res.status(200).json({ bullets: text, sources: top });
  } catch (e: any) {
    return res.status(400).json({ error: e.message || "Bad Request" });
  }
}