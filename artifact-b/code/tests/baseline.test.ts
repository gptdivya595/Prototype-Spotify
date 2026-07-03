import assert from "node:assert/strict";
import test from "node:test";
import rawCatalog from "../data/catalog.json";
import { catalogSchema } from "../lib/schemas/catalog";
import { rankBaseline } from "../lib/ranking/baseline";

const catalog = catalogSchema.parse(rawCatalog);
const anchorIds = ["cold-mess-prateek-kuhad", "holocene-bon-iver", "garden-song-phoebe-bridgers"];

test("baseline is deterministic for the same inputs", () => {
  const first = rankBaseline({ catalog, anchorIds, seed: "participant-1" });
  const second = rankBaseline({ catalog, anchorIds, seed: "participant-1" });
  assert.deepEqual(first.map((item) => item.track.id), second.map((item) => item.track.id));
});

test("baseline excludes anchors and enforces two tracks per artist", () => {
  const ranked = rankBaseline({ catalog, anchorIds, seed: "participant-2", limit: 10 });
  assert.equal(ranked.length, 10);
  assert.equal(ranked.some((item) => anchorIds.includes(item.track.id)), false);

  const artistCounts = new Map<string, number>();
  for (const item of ranked) artistCounts.set(item.track.artist, (artistCounts.get(item.track.artist) ?? 0) + 1);
  assert.ok([...artistCounts.values()].every((count) => count <= 2));
  assert.ok(ranked.every((item) => item.score >= 0 && item.score <= 1));
});

test("baseline rejects an unknown anchor set", () => {
  assert.throws(() => rankBaseline({ catalog, anchorIds: ["missing"], seed: "participant-3" }));
});
