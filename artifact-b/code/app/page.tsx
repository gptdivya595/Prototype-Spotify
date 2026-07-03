import manifest from "@/data/catalog.manifest.json";
import { getCatalog } from "@/lib/catalog/repository";
import { MobileAppShell } from "@/components/mobile-app-shell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  const catalog = getCatalog();
  const buildVersion = (process.env.VERCEL_GIT_COMMIT_SHA ?? "local").slice(0, 7);
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
    buildVersion={buildVersion}
    counts={{ tracks: manifest.counts.tracks, artists: manifest.counts.artists, languages: manifest.counts.languages }}
  />;
}
