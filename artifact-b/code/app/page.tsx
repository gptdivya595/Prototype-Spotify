import manifest from "@/data/catalog.manifest.json";
import { getCatalog } from "@/lib/catalog/repository";
import { MobileAppShell } from "@/components/mobile-app-shell";

export default function HomePage() {
  const catalog = getCatalog();
  const anchorOptions = catalog.map(({ id, title, artist, genres, languages, energy }) => ({
    id,
    title,
    artist,
    genres,
    languages,
    energy
  }));

  return <MobileAppShell
    anchorOptions={anchorOptions}
    catalogVersion={manifest.version}
    counts={{ tracks: manifest.counts.tracks, artists: manifest.counts.artists, languages: manifest.counts.languages }}
  />;
}
