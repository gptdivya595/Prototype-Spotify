import rawCatalog from "../data/catalog.json";
import { catalogSchema } from "../lib/schemas/catalog";
import { buildManifest } from "./catalog-tools";

const parsed = catalogSchema.safeParse(rawCatalog);

if (!parsed.success) {
  console.error(parsed.error.format());
  process.exitCode = 1;
} else {
  const ids = parsed.data.map((track) => track.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    console.error(`Duplicate track IDs: ${[...new Set(duplicateIds)].join(", ")}`);
    process.exitCode = 1;
  } else {
    const manifest = buildManifest(parsed.data);
    console.log(JSON.stringify({
      structurallyValid: true,
      studyReady: manifest.studyReady,
      counts: manifest.counts,
      readinessReasons: manifest.readinessReasons
    }, null, 2));

    if (process.argv.includes("--study-ready") && !manifest.studyReady) process.exitCode = 2;
  }
}
