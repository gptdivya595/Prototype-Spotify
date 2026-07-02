import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import rawCatalog from "../data/catalog.json";
import { catalogSchema } from "../lib/schemas/catalog";
import { buildManifest } from "./catalog-tools";

const catalog = catalogSchema.parse(rawCatalog);
const manifest = buildManifest(catalog);
const destination = fileURLToPath(new URL("../data/catalog.manifest.json", import.meta.url));

await writeFile(destination, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Wrote ${destination}`);
console.log(`Tracks: ${manifest.counts.tracks}; artists: ${manifest.counts.artists}; study ready: ${manifest.studyReady}`);
