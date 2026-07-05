import assert from "node:assert/strict";
import test from "node:test";
import rawCatalog from "../data/catalog.json";
import { catalogSchema } from "../lib/schemas/catalog";
import { approvedIntentSchema } from "../lib/schemas/intent";
import { rankGuided } from "../lib/ranking/guided";
import { explainGuidedSet, type ExplanationProvider } from "../lib/ai/explainer";

const catalog = catalogSchema.parse(rawCatalog);
const intent = approvedIntentSchema.parse({ moods: ["calm"], genres: ["indie"], freshness: 0.75 });
const ranked = rankGuided({
  catalog,
  anchorIds: ["cold-mess-prateek-kuhad", "holocene-bon-iver", "garden-song-phoebe-bridgers"],
  intent,
  seed: "explanation-seed",
  limit: 8
}).recommendations;

test("template explanations exist for every selected track", async () => {
  const result = await explainGuidedSet(ranked, intent, undefined);
  assert.equal(result.usedFallback, true);
  assert.deepEqual(Object.keys(result.explanations).sort(), ranked.map((item) => item.track.id).sort());
  assert.ok(Object.values(result.explanations).every((value) => value.length <= 180));
});

test("an explanation provider cannot introduce an unselected track", async () => {
  const provider: ExplanationProvider = {
    modelVersion: "hostile-explainer",
    async explain() {
      return { explanations: [{ trackId: "invented-track", explanation: "Invented fact." }] };
    }
  };
  const result = await explainGuidedSet(ranked, intent, provider);
  assert.equal(result.usedFallback, true);
  assert.equal("invented-track" in result.explanations, false);
});
