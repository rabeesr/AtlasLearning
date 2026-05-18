import Groq from "groq-sdk";

let cached: Groq | null = null;

export function getGroqClient(): Groq {
  if (cached) return cached;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY missing");
  cached = new Groq({ apiKey });
  return cached;
}

export const TUTOR_MODEL = "llama-3.3-70b-versatile";
