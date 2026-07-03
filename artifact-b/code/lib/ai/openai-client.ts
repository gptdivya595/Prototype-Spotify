import OpenAI from "openai";

let client: OpenAI | undefined;

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 15_000,
      maxRetries: 1
    });
  }
  return client;
}

export function getDefaultModel() {
  return process.env.DEFAULT_MODEL ?? "gpt-4o-mini";
}
