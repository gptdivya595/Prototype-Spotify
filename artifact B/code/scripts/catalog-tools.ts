import type { CatalogManifest, Track } from "../lib/schemas/catalog";

function countValues(values: string[][]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values.flat()) counts[value] = (counts[value] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));
}

export function buildManifest(catalog: Track[], generatedAt = new Date().toISOString()): CatalogManifest {
  const artists = new Set(catalog.map((track) => track.artist));
  const genreCoverage = countValues(catalog.map((track) => track.genres));
  const languageCoverage = countValues(catalog.map((track) => track.languages));
  const moodCoverage = countValues(catalog.map((track) => track.moods));
  const activityCoverage = countValues(catalog.map((track) => track.activities));
  const popularityCoverage = countValues(catalog.map((track) => track.popularityTier ? [track.popularityTier] : ["unknown"]));
  const readinessReasons: string[] = [];

  if (catalog.length < 300) readinessReasons.push(`Study catalog needs at least 300 tracks; found ${catalog.length}.`);
  if (artists.size < 120) readinessReasons.push(`Study catalog needs at least 120 artists; found ${artists.size}.`);
  if (Object.keys(genreCoverage).length < 12) readinessReasons.push("Study catalog needs at least 12 represented genres.");
  if (Object.keys(languageCoverage).length < 3) readinessReasons.push("Study catalog needs at least 3 represented languages.");

  return {
    version: process.env.CATALOG_VERSION ?? "seed-v1",
    generatedAt,
    studyReady: readinessReasons.length === 0,
    readinessReasons,
    counts: {
      tracks: catalog.length,
      artists: artists.size,
      genres: Object.keys(genreCoverage).length,
      languages: Object.keys(languageCoverage).length,
      moods: Object.keys(moodCoverage).length,
      activities: Object.keys(activityCoverage).length
    },
    coverage: {
      genres: genreCoverage,
      languages: languageCoverage,
      moods: moodCoverage,
      activities: activityCoverage,
      popularityTiers: popularityCoverage
    }
  };
}
