import OpenAI from 'openai';
import { loadEnv, requireEnv } from './env.mjs';

loadEnv();

export const MODELS = {
  default: process.env.DEFAULT_MODEL || 'gpt-4o-mini',
  synthesis: process.env.SYNTHESIS_MODEL || process.env.DEFAULT_MODEL || 'gpt-4o',
  embedding: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
};

let _client = null;
export function openai() {
  if (!_client) _client = new OpenAI({ apiKey: requireEnv('OPENAI_API_KEY') });
  return _client;
}

/** Chat completion constrained to a JSON schema (structured outputs). */
export async function chatJSON({ system, user, schema, schemaName = 'result', model }) {
  const res = await openai().chat.completions.create({
    model: model || MODELS.default,
    temperature: 0,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: { name: schemaName, schema, strict: true },
    },
  });
  return JSON.parse(res.choices[0].message.content);
}

/** Free-form chat completion (used for grounded RAG synthesis). */
export async function chatText({ system, user, model }) {
  const res = await openai().chat.completions.create({
    model: model || MODELS.synthesis,
    temperature: 0.2,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  return res.choices[0].message.content;
}

/** Embed an array of strings; returns number[][]. */
export async function embed(texts, model) {
  const res = await openai().embeddings.create({
    model: model || MODELS.embedding,
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}
