import assert from "node:assert/strict";
import test from "node:test";
import rawCatalog from "../data/catalog.json";
import { catalogSchema } from "../lib/schemas/catalog";
import { approvedIntentSchema } from "../lib/schemas/intent";
import { artistId } from "../lib/ranking/shared";
import { ConstraintConflictError, rankGuided } from "../lib/ranking/guided";

const catalog = catalogSchema.parse(rawCatalog);
const anchorIds = ["cold-mess-prateek-kuhad", "holocene-bon-iver", "garden-song-phoebe-bridgers"];
const intent = approvedIntentSchema.parse({
  activity: "focus",
  moods: ["calm"],
  genres: ["indie"],
  languages: ["en"],
  energy: 0.35,
  novelty: 0.75
});

test("guided ranking is deterministic and returns transparent components", () => {
  const first = rankGuided({ catalog, anchorIds, intent, seed: "guided-seed" });
  const second = rankGuided({ catalog, anchorIds, intent, seed: "guided-seed" });
  assert.deepEqual(first, second);
  assert.equal(first.recommendations.length, 10);
  assert.ok(first.recommendations.every((item) => Object.values(item.components).every(Number.isFinite)));
});

test("hard artist, genre, and language exclusions are never overridden", () => {
  const excludedArtist = artistId("Beach House");
  const result = rankGuided({
    catalog,
    anchorIds,
    seed: "excluded-seed",
    intent: approvedIntentSchema.parse({
      ...intent,
      excludeArtistIds: [excludedArtist],
      excludeGenres: ["electronic"],
      excludeLanguages: ["hi"]
    })
  });
  assert.equal(result.recommendations.some((item) => artistId(item.track.artist) === excludedArtist), false);
  assert.equal(result.recommendations.some((item) => item.track.genres.includes("electronic")), false);
  assert.equal(result.recommendations.some((item) => item.track.languages.includes("hi")), false);
});

test("artist caps and relative novelty labels hold", () => {
  const result = rankGuided({ catalog, anchorIds, intent, seed: "cap-seed" });
  const counts = new Map<string, number>();
  for (const item of result.recommendations) {
    const id = artistId(item.track.artist);
    counts.set(id, (counts.get(id) ?? 0) + 1);
    assert.ok(["anchor-adjacent", "new-relative-to-profile"].includes(item.noveltyLabel));
  }
  assert.ok([...counts.values()].every((count) => count <= 2));
});

test("shown and rejected tracks receive deterministic penalties", () => {
  const initial = rankGuided({ catalog, anchorIds, intent, seed: "feedback-seed" });
  const firstId = initial.recommendations[0].track.id;
  const next = rankGuided({
    catalog,
    anchorIds,
    intent,
    seed: "feedback-seed",
    shownTrackIds: [firstId],
    rejectedTrackIds: [firstId]
  });
  assert.notEqual(next.recommendations[0].track.id, firstId);
  assert.equal(next.recommendations.some((item) => item.track.id === firstId), false);
});

test("over-constrained requests surface a recoverable conflict", () => {
  assert.throws(() => rankGuided({
    catalog,
    anchorIds,
    seed: "conflict-seed",
    intent: approvedIntentSchema.parse({
      ...intent,
      excludeLanguages: ["en", "hi", "ja", "ko", "es"]
    })
  }), ConstraintConflictError);
});
