import assert from "node:assert/strict";
import test from "node:test";
import rawCatalog from "../data/catalog.json";
import { catalogSchema } from "../lib/schemas/catalog";
import { buildManifest } from "../scripts/catalog-tools";

test("seed catalog is structurally valid with unique ids", () => {
  const catalog = catalogSchema.parse(rawCatalog);
  assert.equal(new Set(catalog.map((track) => track.id)).size, catalog.length);
  assert.ok(catalog.length >= 40);
});

test("manifest truthfully reports seed catalog as not study ready", () => {
  const catalog = catalogSchema.parse(rawCatalog);
  const manifest = buildManifest(catalog, "2026-07-02T00:00:00.000Z");
  assert.equal(manifest.studyReady, false);
  assert.ok(manifest.readinessReasons.some((reason) => reason.includes("300 tracks")));
  assert.ok(manifest.counts.languages >= 5);
});
