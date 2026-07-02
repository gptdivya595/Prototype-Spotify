import { NextResponse } from "next/server";
import { z } from "zod";
import manifest from "@/data/catalog.manifest.json";
import { explainGuidedSet } from "@/lib/ai/explainer";
import { getCatalog } from "@/lib/catalog/repository";
import { GUIDED_RANKING_VERSION, rankGuided } from "@/lib/ranking/guided";
import { approvedIntentSchema } from "@/lib/schemas/intent";
import { applyFeedback } from "@/lib/session/feedback";

const stateSchema = z.object({
  intent: approvedIntentSchema,
  shownTrackIds: z.array(z.string()).max(200),
  savedTrackIds: z.array(z.string()).max(100),
  rejectedTrackIds: z.array(z.string()).max(100),
  boostedArtistIds: z.array(z.string()).max(50),
  iteration: z.number().int().min(0).max(50)
}).strict();

const actionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("save"), trackId: z.string().min(1) }).strict(),
  z.object({ type: z.literal("reject"), trackId: z.string().min(1) }).strict(),
  z.object({ type: z.literal("more-like-this"), trackId: z.string().min(1) }).strict(),
  z.object({ type: z.literal("more-adventurous") }).strict()
]);

const requestSchema = z.object({
  anchorIds: z.array(z.string()).min(1).max(5),
  seed: z.string().min(1).max(200),
  state: stateSchema,
  action: actionSchema,
  limit: z.number().int().min(8).max(12).default(10)
}).strict();

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_feedback" }, { status: 400 });

  try {
    const catalog = getCatalog();
    const update = applyFeedback(parsed.data.state, parsed.data.action, catalog);
    const ranked = rankGuided({
      catalog,
      anchorIds: parsed.data.anchorIds,
      intent: update.state.intent,
      seed: `${parsed.data.seed}:${update.state.iteration}`,
      limit: parsed.data.limit,
      shownTrackIds: update.state.shownTrackIds,
      rejectedTrackIds: update.state.rejectedTrackIds,
      boostedArtistIds: update.state.boostedArtistIds
    });
    const explanation = await explainGuidedSet(ranked.recommendations, update.state.intent);
    update.state.shownTrackIds = [...new Set([
      ...update.state.shownTrackIds,
      ...ranked.recommendations.map((item) => item.track.id)
    ])];

    return NextResponse.json({
      state: update.state,
      changeSummary: update.summary,
      catalogVersion: manifest.version,
      rankingVersion: GUIDED_RANKING_VERSION,
      candidateCount: ranked.candidateCount,
      explanationFallback: explanation.usedFallback,
      recommendations: ranked.recommendations.map(({ track, ...ranking }) => ({
        ...track,
        ...ranking,
        explanation: explanation.explanations[track.id]
      }))
    });
  } catch (error) {
    return NextResponse.json({
      error: "feedback_failed",
      message: error instanceof Error ? error.message : "Feedback could not be applied."
    }, { status: 422 });
  }
}
