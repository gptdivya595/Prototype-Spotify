"use client";

import { useRef, useState } from "react";
import { DiscoveryStudy, type AnchorOption } from "@/components/discovery-study";
import { GuideRail } from "@/components/guide-rail";

function SpotifyMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-label="Spotify-inspired music mark">
      <circle cx="32" cy="32" r="31" fill="#1ed760" />
      <path d="M15 24.5c12.2-3.5 25.8-2.5 35.7 2.2" fill="none" stroke="#08110b" strokeWidth="5.2" strokeLinecap="round" />
      <path d="M17.8 33.8c9.9-2.7 21.4-1.9 30 2" fill="none" stroke="#08110b" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M20.5 42.2c8-2 16.9-1.3 24 1.7" fill="none" stroke="#08110b" strokeWidth="3.8" strokeLinecap="round" />
    </svg>
  );
}

export function MobileAppShell({
  anchorOptions,
  catalogVersion,
  counts
}: {
  anchorOptions: AnchorOption[];
  catalogVersion: string;
  counts: { tracks: number; artists: number; languages: number };
}) {
  const [opened, setOpened] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);

  return (
    <main className="web-stage">
      <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
      <div className="ambient-orb ambient-orb-two" aria-hidden="true" />

      <a
        className="datasource-link"
        href="https://prototype-spotify-kohl.vercel.app/artifact-A-summary.html"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span aria-hidden="true">◎</span>
        Data sources &amp; inputs
        <span aria-hidden="true">↗</span>
      </a>

      <GuideRail screenRef={screenRef} opened={opened} />

      <section className="phone-device" aria-label="Discovery Compass mobile application preview">
        <span className="phone-button phone-button-left" aria-hidden="true" />
        <span className="phone-button phone-button-right" aria-hidden="true" />
        <div className="phone-screen" ref={screenRef}>
          <div className="ios-status" aria-hidden="true">
            <span>9:41</span>
            <span className="dynamic-island" />
            <span className="status-symbols">● ◒ ▰</span>
          </div>

          {!opened ? (
            <div className="app-splash" data-guide="welcome">
              <div className="splash-glow" aria-hidden="true" />
              <SpotifyMark className="splash-logo" />
              <p className="splash-kicker">A Spotify concept</p>
              <h1>Discovery<br />Compass</h1>
              <p className="splash-copy">Tell us what fits now. Get a mix that moves beyond the same familiar loop.</p>
              <button className="open-app-button" type="button" onClick={() => setOpened(true)}>
                <span>Open app</span><span aria-hidden="true">→</span>
              </button>
              <p className="prototype-note">Independent product prototype · No Spotify login required</p>
            </div>
          ) : (
            <div className="mobile-app">
              <header className="app-header">
                <a className="brand-lockup" href="#top" aria-label="Discovery Compass home">
                  <SpotifyMark className="brand-logo" />
                  <span>Discovery Compass</span>
                </a>
                <button className="profile-button" type="button" aria-label="Prototype profile">D</button>
              </header>

              <div id="top" className="app-home" data-guide="home">
                <p className="time-greeting">Good evening</p>
                <h1>Find your next<br /><span>sound.</span></h1>
                <p className="home-copy">Your history knows your taste. Compass adds what you want right now.</p>
                <div className="feature-pills" aria-label="Discovery Compass benefits">
                  <span>Intent first</span><span>Less repetition</span><span>Explain the fit</span>
                </div>
                <div className="catalog-strip" aria-label="Prototype catalog summary">
                  <div><strong>{counts.tracks}</strong><span>tracks</span></div>
                  <div><strong>{counts.artists}</strong><span>artists</span></div>
                  <div><strong>{counts.languages}</strong><span>languages</span></div>
                  <div className="catalog-live"><i />Preview live</div>
                </div>
              </div>

              <DiscoveryStudy anchorOptions={anchorOptions} catalogVersion={catalogVersion} />

              <nav className="app-nav" aria-label="App navigation">
                <a href="#top"><span aria-hidden="true">⌂</span>Home</a>
                <a className="active" href="#study-title"><span aria-hidden="true">✦</span>Compass</a>
                <a href="#results"><span aria-hidden="true">♡</span>Saved</a>
              </nav>
            </div>
          )}
          <div className="home-indicator" aria-hidden="true" />
        </div>
      </section>

      <aside className="desktop-caption" aria-hidden="true">
        <span>DISCOVERY COMPASS</span>
        <strong>Intent-aware music discovery,<br />designed as a mobile experience.</strong>
        <small>Interactive Artifact B prototype</small>
      </aside>
    </main>
  );
}
