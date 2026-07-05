import assert from "node:assert/strict";
import test from "node:test";
import rawCatalog from "../data/catalog.json";
import { catalogSchema } from "../lib/schemas/catalog";
import { approvedIntentSchema } from "../lib/schemas/intent";
import { artistId } from "../lib/ranking/shared";
import { applyFeedback, type GuidedSessionState } from "../lib/session/feedback";

const catalog = catalogSchema.parse(rawCatalog);
const initial: GuidedSessionState = {
  intent: approvedIntentSchema.parse({ freshness: 0.7 }),
  shownTrackIds: [],
  savedTrackIds: [],
  rejectedTrackIds: [],
  boostedArtistIds: [],
  iteration: 0
};

test("feedback reducer is immutable and records save/reject", () => {
  const saved = applyFeedback(initial, { type: "save", trackId: "holocene-bon-iver" }, catalog);
  const rejected = applyFeedback(saved.state, { type: "reject", trackId: "myth-beach-house" }, catalog);
  assert.deepEqual(initial.savedTrackIds, []);
  assert.deepEqual(rejected.state.savedTrackIds, ["holocene-bon-iver"]);
  assert.deepEqual(rejected.state.rejectedTrackIds, ["myth-beach-house"]);
  assert.equal(rejected.state.iteration, 2);
});

test("more like this boosts the selected artist using a stable id", () => {
  const update = applyFeedback(initial, { type: "more-like-this", trackId: "myth-beach-house" }, catalog);
  assert.deepEqual(update.state.boostedArtistIds, [artistId("Beach House")]);
  assert.match(update.summary, /artist cap/i);
});

test("more adventurous raises freshness by a bounded deterministic step", () => {
  const first = applyFeedback(initial, { type: "more-adventurous" }, catalog);
  const second = applyFeedback(first.state, { type: "more-adventurous" }, catalog);
  const third = applyFeedback(second.state, { type: "more-adventurous" }, catalog);
  assert.equal(first.state.intent.freshness, 0.85);
  assert.equal(third.state.intent.freshness, 1);
});
