import rawCatalog from "@/data/catalog.json";
import { catalogSchema, type Track } from "@/lib/schemas/catalog";

let parsedCatalog: Track[] | undefined;

export function getCatalog(): Track[] {
  if (!parsedCatalog) {
    const parsed = catalogSchema.parse(rawCatalog);
    const ids = new Set<string>();

    for (const track of parsed) {
      if (ids.has(track.id)) {
        throw new Error(`Duplicate catalog track id: ${track.id}`);
      }
      ids.add(track.id);
    }

    parsedCatalog = parsed;
  }

  return parsedCatalog;
}

export function getTracksByIds(ids: string[]): Track[] {
  const wanted = new Set(ids);
  return getCatalog().filter((track) => wanted.has(track.id));
}

export function getCatalogVocabulary() {
  const collect = (key: "genres" | "languages" | "moods" | "activities") =>
    [...new Set(getCatalog().flatMap((track) => track[key]))].sort();

  return {
    genres: collect("genres"),
    languages: collect("languages"),
    moods: collect("moods"),
    activities: collect("activities")
  };
}
