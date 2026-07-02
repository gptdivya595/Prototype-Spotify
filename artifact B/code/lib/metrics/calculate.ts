import type { StudyEvent } from "@/lib/events/schema";

export type ConditionMetrics = {
  condition: "baseline" | "guided";
  cardsShown: number;
  savedTracks: number;
  savedNovelArtists: number;
  overallAcceptanceRate: number;
  acceptedNovelArtistRate: number;
};

export function calculateConditionMetrics(
  events: StudyEvent[],
  condition: "baseline" | "guided"
): ConditionMetrics {
  const scoped = events.filter((event) => event.condition === condition);
  const cardsShown = scoped
    .filter((event) => event.eventName === "recommendations_shown")
    .reduce((sum, event) => sum + ((event.properties.trackIds as string[] | undefined)?.length ?? 0), 0);
  const saves = scoped.filter((event) => event.eventName === "track_saved");
  const savedNovelArtists = saves.filter((event) => event.properties.novelArtist === true).length;

  return {
    condition,
    cardsShown,
    savedTracks: saves.length,
    savedNovelArtists,
    overallAcceptanceRate: cardsShown === 0 ? 0 : saves.length / cardsShown,
    acceptedNovelArtistRate: cardsShown === 0 ? 0 : savedNovelArtists / cardsShown
  };
}
