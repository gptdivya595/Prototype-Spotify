import manifest from "@/data/catalog.manifest.json";
import { getCatalog } from "@/lib/catalog/repository";
import { DiscoveryStudy } from "@/components/discovery-study";

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

  return (
    <main>
      <section className="hero" aria-labelledby="page-title">
        <div className="shell hero-grid">
          <div>
            <p className="eyebrow">Artifact B · Working technical prototype</p>
            <h1 id="page-title">Find a new direction without losing the thread.</h1>
            <p className="hero-copy">
              Discovery Compass tests whether a listener can find more acceptable novelty when
              current intent and steering become explicit. Compare the same catalog and taste
              anchor with or without session intent and immediate steering.
            </p>
          </div>
          <aside className="status-panel" aria-label="Prototype readiness">
            <p className="status-label">Foundation status</p>
            <strong>Technical phases 1–5 implemented</strong>
            <dl>
              <div><dt>Tracks</dt><dd>{manifest.counts.tracks}</dd></div>
              <div><dt>Artists</dt><dd>{manifest.counts.artists}</dd></div>
              <div><dt>Languages</dt><dd>{manifest.counts.languages}</dd></div>
              <div><dt>Study ready</dt><dd>{manifest.studyReady ? "Yes" : "Not yet"}</dd></div>
            </dl>
            <p className="status-note">The study gate remains open until interviews and a
              300–500-track catalog are complete.</p>
          </aside>
        </div>
      </section>

      <DiscoveryStudy anchorOptions={anchorOptions} catalogVersion={manifest.version} />

      <section className="principles" aria-labelledby="principles-title">
        <div className="shell principles-grid">
          <div>
            <p className="eyebrow">Experiment discipline</p>
            <h2 id="principles-title">The baseline is allowed to win.</h2>
          </div>
          <div className="principle-list">
            <p><span>01</span> Same curated catalog and card structure in both conditions.</p>
            <p><span>02</span> Deterministic ranking and versioned inputs before AI prose.</p>
            <p><span>03</span> Novelty is relative to the selected profile, never claimed as personal history.</p>
            <p><span>04</span> Interview and catalog-readiness gates remain visible.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
