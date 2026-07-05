"use client";

import { useMemo, useState } from "react";

type Condition = "baseline" | "guided";
export type AnchorOption = {
  id: string;
  title: string;
  artist: string;
  genres: string[];
  languages: string[];
  energy: number;
};
type Intent = {
  activity?: string;
  moods: string[];
  genres: string[];
  languages: string[];
  energy?: number;
  freshness: number;
  excludeArtistIds: string[];
  excludeGenres: string[];
  excludeLanguages: string[];
};
type Recommendation = {
  id: string;
  title: string;
  artist: string;
  genres: string[];
  languages: string[];
  moods: string[];
  energy: number;
  description: string;
  sourceUrl: string;
  score: number;
  freshnessLabel?: "anchor-adjacent" | "new-relative-to-profile";
  explanation?: string;
};
type Session = {
  sessionId: string;
  seed: string;
  studyVersion: string;
  conditionOrder: [Condition, Condition];
};
type GuidedState = {
  intent: Intent;
  shownTrackIds: string[];
  savedTrackIds: string[];
  rejectedTrackIds: string[];
  boostedArtistIds: string[];
  iteration: number;
};

const intentExample = "Calm Hindi indie for late-night focus, mostly unfamiliar";

function splitValues(value: string) {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

function artistId(artist: string) {
  return artist.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function DiscoveryStudy({
  anchorOptions,
  catalogVersion
}: {
  anchorOptions: AnchorOption[];
  catalogVersion: string;
}) {
  const [condition, setCondition] = useState<Condition>("guided");
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [intentText, setIntentText] = useState(intentExample);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [intentApproved, setIntentApproved] = useState(false);
  const [parseMeta, setParseMeta] = useState("");
  const [unresolvedTerms, setUnresolvedTerms] = useState<string[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [guidedState, setGuidedState] = useState<GuidedState | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [savedBaseline, setSavedBaseline] = useState<string[]>([]);
  const [status, setStatus] = useState("Select three to five anchors, then approve the current-session intent.");
  const [changeSummary, setChangeSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [conditionStartedAt, setConditionStartedAt] = useState(() => Date.now());
  const [completedConditions, setCompletedConditions] = useState<Condition[]>([]);
  const [survey, setSurvey] = useState({ relevance: 3, freshness: 3, control: 3, effort: 3 });

  const filteredAnchors = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return anchorOptions;
    return anchorOptions.filter((option) =>
      `${option.title} ${option.artist} ${option.genres.join(" ")}`.toLowerCase().includes(needle)
    );
  }, [anchorOptions, query]);

  function selectCondition(next: Condition) {
    setCondition(next);
    setRecommendations([]);
    setChangeSummary("");
    setConditionStartedAt(Date.now());
    setStatus(next === "guided"
      ? "Guided condition: approve intent before generating."
      : "Baseline condition: the same anchor and catalog, without intent or steering.");
  }

  function toggleAnchor(id: string) {
    setRecommendations([]);
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 5) {
        setStatus("Five anchors is the maximum.");
        return current;
      }
      return [...current, id];
    });
  }

  function updateIntent<K extends keyof Intent>(key: K, value: Intent[K]) {
    setIntent((current) => current ? { ...current, [key]: value } : current);
    setIntentApproved(false);
  }

  async function parseIntent() {
    setLoading(true);
    setStatus("Interpreting the current session…");
    try {
      const response = await fetch("/api/intent/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: intentText })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Intent could not be parsed.");
      setIntent(payload.intent as Intent);
      setUnresolvedTerms(payload.unresolvedTerms as string[]);
      setParseMeta(`${payload.usedFallback ? "Deterministic fallback" : "AI structured output"} · ${payload.modelVersion} · ${payload.latencyMs} ms`);
      setIntentApproved(false);
      setStatus("Review and approve the interpreted fields before ranking.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Intent could not be parsed.");
    } finally {
      setLoading(false);
    }
  }

  async function ensureSession() {
    if (session) return session;
    const response = await fetch("/api/session", { method: "POST" });
    if (!response.ok) throw new Error("A study session could not be created.");
    const created = await response.json() as Session;
    setSession(created);
    void emitEvent(created, condition, 0, "session_started", {
      conditionOrder: created.conditionOrder,
      studyVersion: created.studyVersion
    });
    return created;
  }

  async function emitEvent(
    activeSession: Session,
    activeCondition: Condition,
    iteration: number,
    eventName: string,
    properties: Record<string, string | number | boolean | string[]>
  ) {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ events: [{
          eventId: crypto.randomUUID(),
          sessionId: activeSession.sessionId,
          eventName,
          condition: activeCondition,
          iteration,
          catalogVersion,
          rankingVersion: activeCondition === "guided" ? "guided-v1" : "baseline-v1",
          properties,
          occurredAt: new Date().toISOString()
        }] })
      });
      return response.ok;
    } catch {
      // Study UI stays usable; hosted evaluation readiness checks event durability separately.
      return false;
    }
  }

  async function generateSet() {
    if (selected.length < 3) {
      setStatus("Select at least three taste anchors.");
      return;
    }
    if (condition === "guided" && (!intent || !intentApproved)) {
      setStatus("Interpret and approve the current-session intent first.");
      return;
    }

    setLoading(true);
    setChangeSummary("");
    setStatus(`Generating the ${condition} set…`);
    try {
      const activeSession = await ensureSession();
      const body = condition === "baseline"
        ? { condition, anchorIds: selected, seed: activeSession.seed, limit: 10 }
        : {
            condition,
            anchorIds: selected,
            seed: activeSession.seed,
            limit: 10,
            intent,
            shownTrackIds: [],
            rejectedTrackIds: [],
            boostedArtistIds: [],
            iteration: 0
          };
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Recommendations could not be generated.");
      const nextRecommendations = payload.recommendations as Recommendation[];
      setRecommendations(nextRecommendations);
      if (condition === "guided" && intent) {
        setGuidedState({
          intent,
          shownTrackIds: nextRecommendations.map((item) => item.id),
          savedTrackIds: [],
          rejectedTrackIds: [],
          boostedArtistIds: [],
          iteration: 0
        });
      }
      setStatus(`${condition === "guided" ? "Guided" : "Baseline"} set ready from ${payload.candidateCount ?? anchorOptions.length - selected.length} candidates.`);
      const selectedArtists = new Set(selected.map((id) => anchorOptions.find((item) => item.id === id)?.artist).filter(Boolean));
      void emitEvent(activeSession, condition, 0, "anchor_approved", {
        anchorTrackIds: selected,
        anchorArtistCount: selectedArtists.size
      });
      void emitEvent(activeSession, condition, 0, "recommendations_shown", {
        trackIds: nextRecommendations.map((item) => item.id),
        artistIds: nextRecommendations.map((item) => artistId(item.artist)),
        freshArtistIds: nextRecommendations.filter((item) => item.freshnessLabel === "new-relative-to-profile").map((item) => artistId(item.artist)),
        candidateCount: payload.candidateCount ?? anchorOptions.length - selected.length
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Recommendations could not be generated.");
    } finally {
      setLoading(false);
    }
  }

  async function applyGuidedFeedback(action: { type: "save" | "reject" | "more-like-this"; trackId: string } | { type: "more-adventurous" }) {
    if (!guidedState || !session) return;
    setLoading(true);
    setStatus("Applying feedback and reranking…");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ anchorIds: selected, seed: session.seed, state: guidedState, action, limit: 10 })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Feedback could not be applied.");
      const nextState = payload.state as GuidedState;
      const nextRecommendations = payload.recommendations as Recommendation[];
      setGuidedState(nextState);
      setIntent(nextState.intent);
      setRecommendations(nextRecommendations);
      setChangeSummary(payload.changeSummary as string);
      setStatus(`Reranked iteration ${nextState.iteration}.`);

      const eventName = action.type === "save" ? "track_saved"
        : action.type === "reject" ? "track_rejected"
        : "refinement_requested";
      const track = "trackId" in action ? recommendations.find((item) => item.id === action.trackId) : undefined;
      let properties: Record<string, string | number | boolean | string[]>;
      if (action.type === "save") {
        properties = { trackId: action.trackId, artistId: artistId(track?.artist ?? "unknown"), freshArtist: track?.freshnessLabel === "new-relative-to-profile" };
      } else if (action.type === "reject") {
        properties = { trackId: action.trackId, artistId: artistId(track?.artist ?? "unknown") };
      } else {
        properties = { action: action.type, freshnessBefore: guidedState.intent.freshness, freshnessAfter: nextState.intent.freshness };
      }
      void emitEvent(session, "guided", nextState.iteration, eventName, properties);
      void emitEvent(session, "guided", nextState.iteration, "recommendations_shown", {
        trackIds: nextRecommendations.map((item) => item.id),
        artistIds: nextRecommendations.map((item) => artistId(item.artist)),
        freshArtistIds: nextRecommendations.filter((item) => item.freshnessLabel === "new-relative-to-profile").map((item) => artistId(item.artist)),
        candidateCount: payload.candidateCount
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Feedback could not be applied.");
    } finally {
      setLoading(false);
    }
  }

  function saveBaseline(track: Recommendation) {
    setSavedBaseline((current) => [...new Set([...current, track.id])]);
    setChangeSummary("Saved for comparison. Baseline ranking stays unsteered by design.");
    if (session) void emitEvent(session, "baseline", 0, "track_saved", {
      trackId: track.id,
      artistId: artistId(track.artist),
      freshArtist: !selected.some((id) => anchorOptions.find((item) => item.id === id)?.artist === track.artist)
    });
  }

  async function completeCondition() {
    if (!session) return;
    setLoading(true);
    const durationMs = Date.now() - conditionStartedAt;
    const completionIteration = condition === "guided" ? guidedState?.iteration ?? 0 : 0;
    const stored = await emitEvent(session, condition, completionIteration, "condition_completed", {
      relevanceRating: survey.relevance,
      freshnessRating: survey.freshness,
      controlRating: survey.control,
      effortRating: survey.effort,
      durationMs
    });
    if (!stored) {
      setStatus("This condition could not be stored. Retry before treating the session as complete.");
      setLoading(false);
      return;
    }

    const completed = [...new Set([...completedConditions, condition])];
    setCompletedConditions(completed);
    if (completed.length === 2) {
      await emitEvent(session, condition, completionIteration, "study_completed", {
        completedConditions: completed,
        durationMs
      });
      setStatus("Paired technical session complete. Results remain directional until the formal study gate opens.");
      setChangeSummary("Both baseline and guided condition events were recorded.");
    } else {
      const next: Condition = condition === "guided" ? "baseline" : "guided";
      setCondition(next);
      setRecommendations([]);
      setChangeSummary("");
      setConditionStartedAt(Date.now());
      setStatus(`Condition recorded. Continue with the ${next} condition using the same anchor.`);
    }
    setLoading(false);
  }

  return (
    <section className="discovery-study" aria-labelledby="study-title">
      <div className="shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Build your mix</p>
            <h2 id="study-title">Tune the next set.</h2>
          </div>
          <p>Choose a few tracks that feel like you, then describe the direction you want right now.</p>
        </div>

        <div className="condition-switch" aria-label="Experiment condition">
          <button type="button" aria-pressed={condition === "guided"} onClick={() => selectCondition("guided")}>
            Compass <span>Intent + steering</span>
          </button>
          <button type="button" aria-pressed={condition === "baseline"} onClick={() => selectCondition("baseline")}>
            Classic <span>Taste anchor only</span>
          </button>
        </div>

        <div className="study-grid">
          <div className="study-step">
            <p className="step-label"><span>01</span> Your taste</p>
            <label htmlFor="anchor-filter">Find a track, artist, or genre</label>
            <input id="anchor-filter" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try indie, Hindi, jazz…" />
            <p className="selection-count"><strong>{selected.length}/5</strong> selected</p>
            <div className="compact-anchor-list">
              {filteredAnchors.map((option) => (
                <button key={option.id} type="button" aria-pressed={selected.includes(option.id)} onClick={() => toggleAnchor(option.id)}>
                  <span><strong>{option.title}</strong><small>{option.artist}</small></span>
                  <span aria-hidden="true">{selected.includes(option.id) ? "✓" : "+"}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="study-step">
            <p className="step-label"><span>02</span> {condition === "guided" ? "Set the vibe" : "Classic rules"}</p>
            {condition === "guided" ? (
              <>
                <label htmlFor="guided-intent">What fits now?</label>
                <textarea id="guided-intent" rows={4} maxLength={500} value={intentText} onChange={(event) => setIntentText(event.target.value)} />
                <button className="secondary-action" type="button" onClick={parseIntent} disabled={loading || intentText.trim().length < 3}>Interpret intent</button>
                {intent && (
                  <div className="approved-intent">
                    <small>{parseMeta}</small>
                    <label>Activity<input value={intent.activity ?? ""} onChange={(event) => updateIntent("activity", event.target.value || undefined)} /></label>
                    <label>Moods<input value={intent.moods.join(", ")} onChange={(event) => updateIntent("moods", splitValues(event.target.value))} /></label>
                    <label>Genres<input value={intent.genres.join(", ")} onChange={(event) => updateIntent("genres", splitValues(event.target.value))} /></label>
                    <label>Languages<input value={intent.languages.join(", ")} onChange={(event) => updateIntent("languages", splitValues(event.target.value))} /></label>
                    <label>Exclude genres<input value={intent.excludeGenres.join(", ")} onChange={(event) => updateIntent("excludeGenres", splitValues(event.target.value))} /></label>
                    <label>Exclude languages<input value={intent.excludeLanguages.join(", ")} onChange={(event) => updateIntent("excludeLanguages", splitValues(event.target.value))} /></label>
                    <label className="wide-field">Freshness <strong>{Math.round(intent.freshness * 100)}</strong>
                      <input type="range" min="0" max="100" value={Math.round(intent.freshness * 100)} onChange={(event) => updateIntent("freshness", Number(event.target.value) / 100)} />
                    </label>
                    {unresolvedTerms.length > 0 && <p className="unresolved">Needs clarification: {unresolvedTerms.join(", ")}</p>}
                    <button className="approve-button" type="button" onClick={() => { setIntentApproved(true); setStatus("Intent approved for this session."); }}> {intentApproved ? "✓ Intent approved" : "Approve intent"}</button>
                  </div>
                )}
              </>
            ) : (
              <div className="baseline-rules">
                <p>No free-text intent, freshness control, exclusions, or iterative steering.</p>
                <p>The ranker uses anchor genre, mood, language, and energy with fixed diversity and a two-track artist cap.</p>
              </div>
            )}
          </div>
        </div>

        <div className="generate-row">
          <p role="status" aria-live="polite">{status}</p>
          <button className="primary-action" type="button" onClick={generateSet} disabled={loading || selected.length < 3 || (condition === "guided" && !intentApproved)}>
            {loading ? "Building your mix…" : condition === "guided" ? "Build my Compass mix" : "Shuffle from my anchors"}
          </button>
        </div>

        {changeSummary && <p className="change-summary" role="status"><strong>What changed:</strong> {changeSummary}</p>}

        {recommendations.length > 0 && (
          <div className="recommendation-results" id="results">
            <div className="results-heading">
              <div><p className="eyebrow">Made for this moment</p><h3>Your next direction.</h3></div>
              {condition === "guided" && (
                <button className="adventure-action" type="button" disabled={loading} onClick={() => applyGuidedFeedback({ type: "more-adventurous" })}>More adventurous</button>
              )}
            </div>
            <ol className="recommendation-list">
              {recommendations.map((track, index) => {
                const saved = condition === "guided" ? guidedState?.savedTrackIds.includes(track.id) : savedBaseline.includes(track.id);
                return (
                  <li key={`${condition}-${track.id}-${guidedState?.iteration ?? 0}`}>
                    <div className="album-art" aria-hidden="true"><span>{String(index + 1).padStart(2, "0")}</span><i /><i /><i /></div>
                    <div className="recommendation-topline">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {track.freshnessLabel && <small>{track.freshnessLabel.replaceAll("-", " ")}</small>}
                      <strong>{Math.round(track.score * 100)}</strong>
                    </div>
                    <h4>{track.title}</h4>
                    <p className="artist-name">{track.artist}</p>
                    <p className="track-tags">{[...track.genres.slice(0, 2), ...track.languages].join(" · ")}</p>
                    <p className="fit-copy">{track.explanation ?? track.description}</p>
                    <div className="card-actions">
                      <button type="button" aria-pressed={saved} onClick={() => condition === "guided" ? applyGuidedFeedback({ type: "save", trackId: track.id }) : saveBaseline(track)}>{saved ? "Saved" : "Save"}</button>
                      {condition === "guided" && <button type="button" onClick={() => applyGuidedFeedback({ type: "reject", trackId: track.id })}>Not for me</button>}
                      {condition === "guided" && <button type="button" onClick={() => applyGuidedFeedback({ type: "more-like-this", trackId: track.id })}>More like this</button>}
                      <a href={track.sourceUrl} target="_blank" rel="noreferrer">Open ↗</a>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="condition-survey" aria-labelledby="survey-title">
              <div>
                <p className="eyebrow">Quick check</p>
                <h4 id="survey-title">How did this mix feel?</h4>
                <p>These structured ratings are stored; current-intent prose is not.</p>
              </div>
              <div className="survey-fields">
                {([
                  ["relevance", "Relevance"],
                  ["freshness", "Freshness"],
                  ["control", "Control"],
                  ["effort", "Low effort"]
                ] as const).map(([key, label]) => (
                  <label key={key}>{label} <strong>{survey[key]}/5</strong>
                    <input type="range" min="1" max="5" value={survey[key]} onChange={(event) => setSurvey((current) => ({ ...current, [key]: Number(event.target.value) }))} />
                  </label>
                ))}
              </div>
              <button className="complete-condition" type="button" disabled={loading || completedConditions.includes(condition)} onClick={completeCondition}>
                {completedConditions.includes(condition) ? "Condition recorded" : `Complete ${condition} condition`}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
