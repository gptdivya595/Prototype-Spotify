import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

export const trackSchema = z.object({
  id: nonEmptyString.regex(/^[a-z0-9-]+$/),
  title: nonEmptyString,
  artist: nonEmptyString,
  genres: z.array(nonEmptyString).min(1),
  languages: z.array(nonEmptyString),
  moods: z.array(nonEmptyString).min(1),
  activities: z.array(nonEmptyString).min(1),
  energy: z.number().min(0).max(1),
  valence: z.number().min(0).max(1).optional(),
  era: nonEmptyString.optional(),
  popularityTier: z.enum(["niche", "mid", "popular"]).optional(),
  description: nonEmptyString,
  sourceUrl: z.string().url().refine((value) => value.startsWith("https://"), {
    message: "sourceUrl must use HTTPS"
  })
}).strict();

export const catalogSchema = z.array(trackSchema).min(1);

export type Track = z.infer<typeof trackSchema>;

export type CatalogManifest = {
  version: string;
  generatedAt: string;
  studyReady: boolean;
  readinessReasons: string[];
  counts: {
    tracks: number;
    artists: number;
    genres: number;
    languages: number;
    moods: number;
    activities: number;
  };
  coverage: {
    genres: Record<string, number>;
    languages: Record<string, number>;
    moods: Record<string, number>;
    activities: Record<string, number>;
    popularityTiers: Record<string, number>;
  };
};
