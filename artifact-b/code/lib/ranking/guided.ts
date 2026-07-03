import type { ApprovedIntent } from "@/lib/schemas/intent";
import type { Track } from "@/lib/schemas/catalog";
import { artistId, clamp, overlapScore, stableFraction } from "@/lib/ranking/shared";

export const GUIDED_RANKING_VERSION = "guided-v1";

export type GuidedScore = {
  track: Track;
  score: number;
  noveltyLabel: "anchor-adjacent" | "new-relative-to-profile";
  components: {
    intentRelevance: number;
    noveltyFit: number;
    anchorCompatibility: number;
    setDiversity: number;
    penalties: number;
  };
};

export class ConstraintConflictError extends Error {
  constructor(public candidateCount: number) {
    super(`Only ${candidateCount} tracks remain after hard exclusions; at least 8 are required.`);
    this.name = "ConstraintConflictError";
  }
}

function average(values: number[]) {
  return values.length === 0 ? 0.5 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function scoreIntent(track: Track, intent: ApprovedIntent) {
  const scores: number[] = [];
  if (intent.genres.length > 0) scores.push(overlapScore(intent.genres, track.genres));
  if (intent.moods.length > 0) scores.push(overlapScore(intent.moods, track.moods));
  if (intent.languages.length > 0) scores.push(overlapScore(intent.languages, track.languages));
  if (intent.activity) scores.push(track.activities.includes(intent.activity) ? 1 : 0);
  if (intent.energy !== undefined) scores.push(1 - Math.abs(intent.energy - track.energy));
  return clamp(average(scores));
}

function scoreAnchorCompatibility(track: Track, anchors: Track[]) {
  const genres = [...new Set(anchors.flatMap((item) => item.genres))];
  const moods = [...new Set(anchors.flatMap((item) => item.moods))];
  const languages = [...new Set(anchors.flatMap((item) => item.languages))];
  const energy = anchors.reduce((sum, item) => sum + item.energy, 0) / anchors.length;

  return clamp(
    overlapScore(genres, track.genres) * 0.55 +
    overlapScore(moods, track.moods) * 0.25 +
    (languages.length === 0 ? 0.5 : overlapScore(languages, track.languages)) * 0.1 +
    (1 - Math.abs(energy - track.energy)) * 0.1
  );
}

function scoreTrackNovelty(track: Track, anchors: Track[], shownTrackIds: Set<string>) {
  const anchorArtists = new Set(anchors.map((item) => artistId(item.artist)));
  const anchorGenres = [...new Set(anchors.flatMap((item) => item.genres))];
  const artistNovelty = anchorArtists.has(artistId(track.artist)) ? 0 : 1;
  const genreNovelty = 1 - Math.min(1, overlapScore(anchorGenres, track.genres));
  const popularityNovelty = track.popularityTier === "niche" ? 1 : track.popularityTier === "mid" ? 0.65 : 0.25;
  const exposureNovelty = shownTrackIds.has(track.id) ? 0 : 1;
  return clamp(artistNovelty * 0.45 + genreNovelty * 0.25 + popularityNovelty * 0.15 + exposureNovelty * 0.15);
}

function scoreDiversity(track: Track, selected: GuidedScore[]) {
  if (selected.length === 0) return 1;
  const selectedArtists = new Set(selected.map((item) => artistId(item.track.artist)));
  const selectedGenres = new Set(selected.flatMap((item) => item.track.genres));
  const selectedLanguages = new Set(selected.flatMap((item) => item.track.languages));
  const newArtist = selectedArtists.has(artistId(track.artist)) ? 0 : 1;
  const newGenre = track.genres.some((genre) => !selectedGenres.has(genre)) ? 1 : 0;
  const newLanguage = track.languages.length > 0 && track.languages.some((language) => !selectedLanguages.has(language)) ? 1 : 0;
  return newArtist * 0.55 + newGenre * 0.3 + newLanguage * 0.15;
}

function isEligible(track: Track, intent: ApprovedIntent) {
  const excludedArtists = new Set(intent.excludeArtistIds);
  if (excludedArtists.has(artistId(track.artist))) return false;
  if (track.genres.some((genre) => intent.excludeGenres.includes(genre))) return false;
  if (track.languages.some((language) => intent.excludeLanguages.includes(language))) return false;
  return true;
}

export function rankGuided(options: {
  catalog: Track[];
  anchorIds: string[];
  intent: ApprovedIntent;
  seed: string;
  limit?: number;
  shownTrackIds?: string[];
  rejectedTrackIds?: string[];
  boostedArtistIds?: string[];
}): { recommendations: GuidedScore[]; candidateCount: number } {
  const {
    catalog,
    anchorIds,
    intent,
    seed,
    limit = 10,
    shownTrackIds = [],
    rejectedTrackIds = [],
    boostedArtistIds = []
  } = options;
  const anchorSet = new Set(anchorIds);
  const anchors = catalog.filter((track) => anchorSet.has(track.id));
  if (anchors.length === 0) throw new Error("At least one valid taste anchor is required");

  const shown = new Set(shownTrackIds);
  const rejected = new Set(rejectedTrackIds);
  const boostedArtists = new Set(boostedArtistIds);
  const candidates = catalog.filter((track) => !anchorSet.has(track.id) && isEligible(track, intent));
  if (candidates.length < 8) throw new ConstraintConflictError(candidates.length);

  const base = candidates.map((track) => {
    const trackNovelty = scoreTrackNovelty(track, anchors, shown);
    const penalties = (shown.has(track.id) ? 0.28 : 0) + (rejected.has(track.id) ? 1 : 0);
    const boost = boostedArtists.has(artistId(track.artist)) ? 0.08 : 0;
    return {
      track,
      intentRelevance: scoreIntent(track, intent),
      noveltyFit: 1 - Math.abs(intent.novelty - trackNovelty),
      anchorCompatibility: scoreAnchorCompatibility(track, anchors),
      penalties,
      boost,
      noveltyLabel: anchors.some((anchor) => artistId(anchor.artist) === artistId(track.artist))
        ? "anchor-adjacent" as const
        : "new-relative-to-profile" as const,
      tie: stableFraction(seed, track.id)
    };
  });

  const selected: GuidedScore[] = [];
  const remaining = new Set(base.map((item) => item.track.id));
  const artistCounts = new Map<string, number>();

  while (selected.length < limit && remaining.size > 0) {
    const next = base
      .filter((item) => remaining.has(item.track.id) && (artistCounts.get(artistId(item.track.artist)) ?? 0) < 2)
      .map((item) => {
        const setDiversity = scoreDiversity(item.track, selected);
        const score = clamp(
          item.intentRelevance * 0.45 +
          item.noveltyFit * 0.25 +
          item.anchorCompatibility * 0.2 +
          setDiversity * 0.1 -
          item.penalties +
          item.boost
        );
        return { ...item, setDiversity, score };
      })
      .sort((left, right) => right.score - left.score || right.tie - left.tie)[0];

    if (!next) break;
    remaining.delete(next.track.id);
    const id = artistId(next.track.artist);
    artistCounts.set(id, (artistCounts.get(id) ?? 0) + 1);
    selected.push({
      track: next.track,
      score: next.score,
      noveltyLabel: next.noveltyLabel,
      components: {
        intentRelevance: next.intentRelevance,
        noveltyFit: next.noveltyFit,
        anchorCompatibility: next.anchorCompatibility,
        setDiversity: next.setDiversity,
        penalties: next.penalties
      }
    });
  }

  return { recommendations: selected, candidateCount: candidates.length };
}
