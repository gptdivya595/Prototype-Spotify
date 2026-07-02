'use client';
import { useState } from 'react';

const EXAMPLES = [
  'Why do users struggle to discover new music?',
  'What causes users to listen to the same songs on repeat?',
  'What do power users say about Discover Weekly?',
  'What controls over recommendations do users wish they had?',
];

const SEGMENTS = ['', 'power_user', 'explorer', 'casual', 'mood_based'];

export default function AskPage() {
  const [q, setQ] = useState('');
  const [segment, setSegment] = useState('');
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState(null);

  async function ask(question) {
    const query = question ?? q;
    if (!query.trim()) return;
    setLoading(true); setErr(null); setRes(null); setQ(query);
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query, filters: segment ? { segment } : {} }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'request failed');
      setRes(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h1>Ask the reviews</h1>
      <p className="sub">Answers are grounded only in real Spotify reviews, with citations. No hallucinated facts.</p>

      <div className="chips">
        {EXAMPLES.map((ex) => (
          <button key={ex} className="chip" onClick={() => ask(ex)}>{ex}</button>
        ))}
      </div>

      <textarea rows={3} placeholder="Ask about discovery, recommendations, repeat listening..."
        value={q} onChange={(e) => setQ(e.target.value)} />

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
        <label className="muted" style={{ fontSize: 14 }}>Segment:&nbsp;
          <select value={segment} onChange={(e) => setSegment(e.target.value)}
            style={{ background: 'var(--panel)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 8px' }}>
            {SEGMENTS.map((s) => <option key={s} value={s}>{s || 'all'}</option>)}
          </select>
        </label>
        <button onClick={() => ask()} disabled={loading}>
          {loading ? <><span className="spinner" /> Thinking…</> : 'Ask'}
        </button>
      </div>

      {err && <p style={{ color: 'var(--red)', marginTop: 16 }}>Error: {err}</p>}

      {res && (
        <div style={{ marginTop: 20 }}>
          <div className="qa">
            <div className="a">{res.answer}</div>
          </div>
          <h2>Sources ({res.citations.length})</h2>
          {res.citations.map((c) => (
            <div className="cite" key={c.n}>
              <div className="meta">[{c.n}] {c.source} · {c.rating ?? '-'}★ · {c.date} · {c.themes.join(', ')}
                {c.url ? <> · <a href={c.url} target="_blank" rel="noreferrer">source</a></> : null}</div>
              {c.quote}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
