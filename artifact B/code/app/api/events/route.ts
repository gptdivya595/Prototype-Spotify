import { NextResponse } from "next/server";
import { z } from "zod";
import { validateStudyEvent } from "@/lib/events/schema";
import { getEventStore } from "@/lib/events/store";

const requestSchema = z.object({ events: z.array(z.unknown()).min(1).max(50) }).strict();

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  try {
    const events = parsed.data.events.map(validateStudyEvent);
    await getEventStore().append(events);
    return NextResponse.json({ accepted: events.map((event) => event.eventId) }, { status: 202 });
  } catch (error) {
    return NextResponse.json({
      error: "invalid_event",
      message: error instanceof Error ? error.message : "An event was rejected."
    }, { status: 400 });
  }
}
