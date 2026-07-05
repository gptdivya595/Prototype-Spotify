import { z } from "zod";

export const eventNames = [
  "session_started",
  "anchor_approved",
  "intent_parsed",
  "intent_edited",
  "recommendations_shown",
  "track_saved",
  "track_rejected",
  "refinement_requested",
  "condition_completed",
  "study_completed"
] as const;

const propertyValueSchema = z.union([
  z.string().max(200),
  z.number().finite(),
  z.boolean(),
  z.array(z.string().max(100)).max(30)
]);

export const studyEventSchema = z.object({
  eventId: z.string().uuid(),
  sessionId: z.string().uuid(),
  eventName: z.enum(eventNames),
  condition: z.enum(["baseline", "guided"]),
  iteration: z.number().int().min(0).max(50),
  catalogVersion: z.string().trim().min(1).max(100),
  rankingVersion: z.string().trim().min(1).max(100),
  modelVersion: z.string().trim().min(1).max(100).optional(),
  properties: z.record(propertyValueSchema),
  occurredAt: z.string().datetime()
}).strict();

export type StudyEvent = z.infer<typeof studyEventSchema>;

const allowedProperties: Record<StudyEvent["eventName"], Set<string>> = {
  session_started: new Set(["conditionOrder", "studyVersion"]),
  anchor_approved: new Set(["anchorTrackIds", "anchorArtistCount"]),
  intent_parsed: new Set(["latencyMs", "usedFallback", "unresolvedCount"]),
  intent_edited: new Set(["editedFields", "editCount"]),
  recommendations_shown: new Set(["trackIds", "artistIds", "freshArtistIds", "candidateCount"]),
  track_saved: new Set(["trackId", "artistId", "freshArtist"]),
  track_rejected: new Set(["trackId", "artistId"]),
  refinement_requested: new Set(["action", "freshnessBefore", "freshnessAfter"]),
  condition_completed: new Set(["relevanceRating", "freshnessRating", "controlRating", "effortRating", "durationMs"]),
  study_completed: new Set(["completedConditions", "durationMs"])
};

const forbiddenKeyPattern = /(email|name|ip|prompt|intentText|apiKey|secret|userAgent)/i;

export function validateStudyEvent(input: unknown): StudyEvent {
  const event = studyEventSchema.parse(input);
  const allowed = allowedProperties[event.eventName];

  for (const key of Object.keys(event.properties)) {
    if (forbiddenKeyPattern.test(key) || !allowed.has(key)) {
      throw new Error(`Property ${key} is not allowed for ${event.eventName}`);
    }
  }

  return event;
}
