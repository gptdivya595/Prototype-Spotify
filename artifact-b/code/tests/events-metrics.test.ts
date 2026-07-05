import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { validateStudyEvent, type StudyEvent } from "../lib/events/schema";
import { calculateConditionMetrics } from "../lib/metrics/calculate";

const sessionId = randomUUID();
const common = {
  sessionId,
  iteration: 0,
  catalogVersion: "seed-v1",
  rankingVersion: "baseline-v1",
  occurredAt: "2026-07-02T00:00:00.000Z"
} as const;

function event(input: Omit<StudyEvent, keyof typeof common | "eventId">): StudyEvent {
  return validateStudyEvent({ ...common, eventId: randomUUID(), ...input });
}

test("event allowlist rejects raw intent and identity properties", () => {
  assert.throws(() => validateStudyEvent({
    ...common,
    eventId: randomUUID(),
    eventName: "session_started",
    condition: "baseline",
    properties: { email: "person@example.com" }
  }));
  assert.throws(() => validateStudyEvent({
    ...common,
    eventId: randomUUID(),
    eventName: "intent_parsed",
    condition: "guided",
    properties: { intentText: "private prose" }
  }));
});

test("primary and guardrail metrics match hand-calculated events", () => {
  const events = [
    event({
      eventName: "recommendations_shown",
      condition: "guided",
      properties: { trackIds: ["a", "b", "c", "d"], artistIds: ["aa", "bb", "cc", "dd"], freshArtistIds: ["bb", "dd"], candidateCount: 20 }
    }),
    event({ eventName: "track_saved", condition: "guided", properties: { trackId: "b", artistId: "bb", freshArtist: true } }),
    event({ eventName: "track_saved", condition: "guided", properties: { trackId: "a", artistId: "aa", freshArtist: false } })
  ];

  const metrics = calculateConditionMetrics(events, "guided");
  assert.equal(metrics.cardsShown, 4);
  assert.equal(metrics.savedTracks, 2);
  assert.equal(metrics.savedFreshArtists, 1);
  assert.equal(metrics.overallAcceptanceRate, 0.5);
  assert.equal(metrics.acceptedFreshArtistRate, 0.25);
});
