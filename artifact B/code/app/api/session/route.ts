import { NextResponse } from "next/server";
import manifest from "@/data/catalog.manifest.json";
import { createStudySession } from "@/lib/experiment/session";

export async function POST() {
  const studyVersion = process.env.STUDY_VERSION ?? "discovery-compass-local-v1";
  const session = createStudySession(studyVersion);
  return NextResponse.json({
    ...session,
    catalogVersion: manifest.version,
    rankingVersion: "baseline-v1"
  }, { status: 201 });
}
