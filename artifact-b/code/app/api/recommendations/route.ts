import { NextResponse } from "next/server";
import { z } from "zod";
import manifest from "@/data/catalog.manifest.json";
import { getCatalog } from "@/lib/catalog/repository";
import { rankBaseline } from "@/lib/ranking/baseline";
import { approvedIntentSchema } from "@/lib/schemas/intent";
import { ConstraintConflictError, GUIDED_RANKING_VERSION, rankGuided } from "@/lib/ranking/guided";
import { explainGuidedSet } from "@/lib/ai/explainer";

const common = {
  anchorIds: z.array(z.string().min(1)).min(1).max(5),
  seed: z.string().min(1).max(200),
  limit: z.number().int().min(8).max(12).default(10)
};

const baselineRequestSchema = z.object({
  ...common,
  condition: z.literal("baseline").default("baseline")
}).strict();

const guidedRequestSchema = z.object({
  ...common,
  condition: z.literal("guided"),
  intent: approvedIntentSchema,
  shownTrackIds: z.array(z.string()).max(100).default([]),
  rejectedTrackIds: z.array(z.string()).max(100).default([]),
  boostedArtistIds: z.array(z.string()).max(30).default([]),
  iteration: z.number().int().min(0).max(50).default(0)
}).strict();

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const baseline = baselineRequestSchema.safeParse(body);
  const guided = guidedRequestSchema.safeParse(body);
  if (!baseline.success && !guided.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    if (guided.success) {
      const ranked = rankGuided({
        catalog: getCatalog(),
        anchorIds: guided.data.anchorIds,
        intent: guided.data.intent,
        seed: `${guided.data.seed}:${guided.data.iteration}`,
        limit: guided.data.limit,
        shownTrackIds: guided.data.shownTrackIds,
        rejectedTrackIds: guided.data.rejectedTrackIds,
        boostedArtistIds: guided.data.boostedArtistIds
      });
      const explanation = await explainGuidedSet(ranked.recommendations, guided.data.intent);

      return NextResponse.json({
        condition: "guided",
        catalogVersion: manifest.version,
        rankingVersion: GUIDED_RANKING_VERSION,
        explanationVersion: explanation.modelVersion,
        explanationFallback: explanation.usedFallback,
        candidateCount: ranked.candidateCount,
        recommendations: ranked.recommendations.map(({ track, ...ranking }) => ({
          ...track,
          ...ranking,
          explanation: explanation.explanations[track.id]
        }))
      });
    }

    if (!baseline.success) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const data = baseline.data;
    const ranked = rankBaseline({
      catalog: getCatalog(),
      anchorIds: data.anchorIds,
      seed: data.seed,
      limit: data.limit
    });

    return NextResponse.json({
      condition: "baseline",
      catalogVersion: manifest.version,
      rankingVersion: "baseline-v1",
      recommendations: ranked.map(({ track, score }) => ({ ...track, score }))
    });
  } catch (error) {
    if (error instanceof ConstraintConflictError) {
      return NextResponse.json({
        error: "constraint_conflict",
        candidateCount: error.candidateCount,
        message: error.message
      }, { status: 422 });
    }
    return NextResponse.json({
      error: "ranking_failed",
      message: error instanceof Error ? error.message : "The baseline could not be generated."
    }, { status: 422 });
  }
}
