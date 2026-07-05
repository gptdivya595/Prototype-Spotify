import { z } from "zod";

export const approvedIntentSchema = z.object({
  activity: z.string().trim().min(1).optional(),
  moods: z.array(z.string().trim().min(1)).max(5).default([]),
  genres: z.array(z.string().trim().min(1)).max(5).default([]),
  languages: z.array(z.string().trim().min(1)).max(5).default([]),
  energy: z.number().min(0).max(1).optional(),
  freshness: z.number().min(0).max(1).default(0.5),
  excludeArtistIds: z.array(z.string().trim().min(1)).max(20).default([]),
  excludeGenres: z.array(z.string().trim().min(1)).max(10).default([]),
  excludeLanguages: z.array(z.string().trim().min(1)).max(10).default([])
}).strict();

export type ApprovedIntent = z.infer<typeof approvedIntentSchema>;
