import { z } from "zod";
import type { ApprovedIntent } from "@/lib/schemas/intent";
import type { GuidedScore } from "@/lib/ranking/guided";
import { getDefaultModel, getOpenAIClient, isOpenAIConfigured } from "@/lib/ai/openai-client";

const explanationItemSchema = z.object({
  trackId: z.string().min(1),
  explanation: z.string().trim().min(1).max(180)
}).strict();

const explanationResponseSchema = z.object({
  explanations: z.array(explanationItemSchema).max(12)
}).strict();

export interface ExplanationProvider {
  explain(items: GuidedScore[], intent: ApprovedIntent): Promise<unknown>;
  modelVersion: string;
}

function fallbackExplanation(item: GuidedScore, intent: ApprovedIntent) {
  const reasons: string[] = [];
  const mood = item.track.moods.find((value) => intent.moods.includes(value));
  const genre = item.track.genres.find((value) => intent.genres.includes(value));
  const language = item.track.languages.find((value) => intent.languages.includes(value));
  if (mood) reasons.push(`${mood} mood`);
  if (genre) reasons.push(`${genre} direction`);
  if (language) reasons.push(`${language} language preference`);
  if (intent.activity && item.track.activities.includes(intent.activity)) reasons.push(`${intent.activity} context`);
  if (reasons.length === 0) reasons.push("energy and taste-anchor compatibility");
  const novelty = item.noveltyLabel === "new-relative-to-profile"
    ? "The artist is outside your selected profile."
    : "The artist remains close to your selected profile.";
  return `Fits through ${reasons.slice(0, 2).join(" and ")}. ${novelty}`;
}

const openAIProvider: ExplanationProvider = {
  get modelVersion() {
    return getDefaultModel();
  },
  async explain(items, intent) {
    const response = await getOpenAIClient().chat.completions.create({
      model: getDefaultModel(),
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: "Explain why each already-selected track fits the approved session intent. Use only supplied metadata. Do not change IDs, add facts, or claim personal listening history. One short sentence per track."
        },
        {
          role: "user",
          content: JSON.stringify({
            intent,
            tracks: items.map((item) => ({
              id: item.track.id,
              title: item.track.title,
              artist: item.track.artist,
              genres: item.track.genres,
              languages: item.track.languages,
              moods: item.track.moods,
              activities: item.track.activities,
              energy: item.track.energy,
              noveltyLabel: item.noveltyLabel
            }))
          })
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "track_explanations",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["explanations"],
            properties: {
              explanations: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["trackId", "explanation"],
                  properties: {
                    trackId: { type: "string" },
                    explanation: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    });
    const content = response.choices[0]?.message.content;
    if (!content) throw new Error("Explanation model returned an empty response");
    return JSON.parse(content);
  }
};

export async function explainGuidedSet(
  items: GuidedScore[],
  intent: ApprovedIntent,
  provider: ExplanationProvider | undefined = isOpenAIConfigured() ? openAIProvider : undefined
) {
  const fallback = Object.fromEntries(items.map((item) => [item.track.id, fallbackExplanation(item, intent)]));
  if (!provider) return { explanations: fallback, usedFallback: true, modelVersion: "template-v1" };

  try {
    const parsed = explanationResponseSchema.parse(await provider.explain(items, intent));
    const selectedIds = new Set(items.map((item) => item.track.id));
    const safe: Record<string, string> = { ...fallback };
    for (const item of parsed.explanations) {
      if (!selectedIds.has(item.trackId)) throw new Error("Explanation returned an unselected track");
      safe[item.trackId] = item.explanation;
    }
    return { explanations: safe, usedFallback: false, modelVersion: provider.modelVersion };
  } catch {
    return { explanations: fallback, usedFallback: true, modelVersion: "template-v1" };
  }
}
