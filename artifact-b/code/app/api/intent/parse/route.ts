import { NextResponse } from "next/server";
import { z } from "zod";
import { parseIntent } from "@/lib/ai/intent-parser";
import { consumeRateLimit } from "@/lib/security/rate-limit";

const requestSchema = z.object({
  text: z.string().trim().min(3).max(500)
}).strict();

export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const rate = consumeRateLimit(`intent:${forwarded ?? "local"}`, { limit: 20, windowMs: 60_000 });

  if (!rate.allowed) {
    return NextResponse.json({ error: "rate_limited", retryAt: new Date(rate.resetAt).toISOString() }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_intent", details: parsed.error.flatten() }, { status: 400 });

  const startedAt = performance.now();
  try {
    const result = await parseIntent(parsed.data.text);
    return NextResponse.json({ ...result, latencyMs: Math.round(performance.now() - startedAt) }, {
      headers: { "Cache-Control": "no-store", "X-RateLimit-Remaining": String(rate.remaining) }
    });
  } catch (error) {
    return NextResponse.json({
      error: "intent_parse_failed",
      message: error instanceof Error ? error.message : "Intent could not be parsed."
    }, { status: 422 });
  }
}
