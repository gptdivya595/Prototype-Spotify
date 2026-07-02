import { createHash } from "node:crypto";
import type { Track } from "@/lib/schemas/catalog";

export type BaselineScore = {
  track: Track;
  score: number;
  components: {
    genre: number;
    mood: number;
    language: number;
    energy: number;
  };
};

function overlapScore(left: string[], right: string[]): number {
  if (left.length === 0 || right.length === 0) return 0;
  const wanted = new Set(left);
  return right.filter((value) => wanted.has(value)).length / Math.max(wanted.size, 1);
}

function seededTieBreak(seed: string, trackId: string): number {
  const value = createHash("sha256").update(`${seed}:${trackId}`).digest().readUInt32BE(0);
  return value / 0xffffffff;
}

export function scoreBaselineTrack(track: Track, anchors: Track[]): BaselineScore {
  const anchorGenres = [...new Set(anchors.flatMap((item) => item.genres))];
  const anchorMoods = [...new Set(anchors.flatMap((item) => item.moods))];
  const anchorLanguages = [...new Set(anchors.flatMap((item) => item.languages))];
  const averageEnergy = anchors.reduce((sum, item) => sum + item.energy, 0) / anchors.length;

  const components = {
    genre: overlapScore(anchorGenres, track.genres),
    mood: overlapScore(anchorMoods, track.moods),
    language: anchorLanguages.length === 0 ? 0.5 : overlapScore(anchorLanguages, track.languages),
    energy: 1 - Math.abs(averageEnergy - track.energy)
  };

  const score =
    components.genre * 0.45 +
    components.mood * 0.25 +
    components.language * 0.1 +
    components.energy * 0.2;

  return { track, score, components };
}

export function rankBaseline(options: {
  catalog: Track[];
  anchorIds: string[];
  seed: string;
  limit?: number;
}): BaselineScore[] {
  const { catalog, anchorIds, seed, limit = 10 } = options;
  const anchorSet = new Set(anchorIds);
  const anchors = catalog.filter((track) => anchorSet.has(track.id));

  if (anchors.length === 0) {
    throw new Error("At least one valid taste anchor is required");
  }

  const ranked = catalog
    .filter((track) => !anchorSet.has(track.id))
    .map((track) => ({ ...scoreBaselineTrack(track, anchors), tie: seededTieBreak(seed, track.id) }))
    .sort((left, right) => right.score - left.score || right.tie - left.tie);

  const selected: BaselineScore[] = [];
  const artistCounts = new Map<string, number>();

  for (const item of ranked) {
    const artistCount = artistCounts.get(item.track.artist) ?? 0;
    if (artistCount >= 2) continue;
    selected.push({ track: item.track, score: item.score, components: item.components });
    artistCounts.set(item.track.artist, artistCount + 1);
    if (selected.length === limit) break;
  }

  return selected;
}
