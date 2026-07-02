import { NextResponse } from "next/server";
import manifest from "@/data/catalog.manifest.json";
import { getEventStore, getEventStoreStatus } from "@/lib/events/store";

export async function GET() {
  const storeStatus = getEventStoreStatus();
  let eventCount: number | null = null;
  let eventStoreReachable = false;
  try {
    eventCount = await getEventStore().count();
    eventStoreReachable = true;
  } catch {
    eventStoreReachable = false;
  }
  return NextResponse.json({
    ok: true,
    product: "discovery-compass",
    phase: 5,
    technicalPrototypeReady: true,
    catalog: {
      version: manifest.version,
      tracks: manifest.counts.tracks,
      artists: manifest.counts.artists,
      studyReady: manifest.studyReady
    },
    rankingVersions: ["baseline-v1", "guided-v1"],
    modelConfigured: Boolean(process.env.OPENAI_API_KEY),
    eventStore: storeStatus.requestedMode,
    eventStoreDurable: storeStatus.durable,
    eventStoreReachable,
    eventCount,
    interviewsComplete: process.env.INTERVIEWS_COMPLETE === "true",
    evaluationReady:
      manifest.studyReady &&
      process.env.INTERVIEWS_COMPLETE === "true" &&
      storeStatus.durable &&
      eventStoreReachable &&
      Boolean(process.env.OPENAI_API_KEY)
  });
}
