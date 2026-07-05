import type { ApprovedIntent } from "@/lib/schemas/intent";
import type { Track } from "@/lib/schemas/catalog";
import { artistId, clamp } from "@/lib/ranking/shared";

export type GuidedSessionState = {
  intent: ApprovedIntent;
  shownTrackIds: string[];
  savedTrackIds: string[];
  rejectedTrackIds: string[];
  boostedArtistIds: string[];
  iteration: number;
};

export type FeedbackAction =
  | { type: "save"; trackId: string }
  | { type: "reject"; trackId: string }
  | { type: "more-like-this"; trackId: string }
  | { type: "more-adventurous" };

function unique(values: string[]) {
  return [...new Set(values)];
}

export function applyFeedback(state: GuidedSessionState, action: FeedbackAction, catalog: Track[]) {
  const next: GuidedSessionState = structuredClone(state);
  next.iteration += 1;
  let summary = "Updated the current discovery session.";

  if (action.type === "save") {
    next.savedTrackIds = unique([...next.savedTrackIds, action.trackId]);
    summary = "Saved for this study session; variety rules remain active.";
  }

  if (action.type === "reject") {
    next.rejectedTrackIds = unique([...next.rejectedTrackIds, action.trackId]);
    summary = "Avoided this track and reduced its chance of returning.";
  }

  if (action.type === "more-like-this") {
    const track = catalog.find((item) => item.id === action.trackId);
    if (!track) throw new Error("Feedback track was not found in the catalog");
    next.boostedArtistIds = unique([...next.boostedArtistIds, artistId(track.artist)]);
    summary = "Moved closer to this artist while keeping the two-track artist cap.";
  }

  if (action.type === "more-adventurous") {
    const before = next.intent.freshness;
    next.intent.freshness = clamp(before + 0.15);
    summary = `Increased freshness from ${Math.round(before * 100)} to ${Math.round(next.intent.freshness * 100)}; other approved constraints stayed fixed.`;
  }

  return { state: next, summary };
}
