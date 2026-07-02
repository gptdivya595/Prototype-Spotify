'use client';

import { useEffect, useState } from 'react';

export default function CollectPage() {
  const [source, setSource] = useState('play_store');
  const [country, setCountry] = useState('us');
  const [language, setLanguage] = useState('en');
  const [limit, setLimit] = useState(40);
  const [key, setKey] = useState('');
  const [health, setHealth] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/health').then((r) => r.json()).then(setHealth).catch(() => setHealth({ ok: false }));
  }, []);

  async function collect() {
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const r = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(key ? { 'x-ingest-key': key } : {}) },
        body: JSON.stringify({ source, country, language, limit: Number(limit) }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'ingestion failed');
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h1>Collect a bounded review sample</h1>
      <p className="sub">This admin workflow pulls at most 100 reviews, tags discovery evidence, and updates the live vector index. Full research builds still use the reproducible CLI pipeline.</p>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="form-grid">
          <label>Source<select value={source} onChange={(e) => setSource(e.target.value)}><option value="play_store">Play Store</option><option value="app_store">App Store</option></select></label>
          <label>Country<select value={country} onChange={(e) => setCountry(e.target.value)}>{['us', 'gb', 'in', 'ca', 'au'].map((x) => <option key={x}>{x}</option>)}</select></label>
          <label>Language<select value={language} onChange={(e) => setLanguage(e.target.value)}><option value="en">en</option><option value="hi">hi</option></select></label>
          <label>Limit<input type="number" min="1" max="100" value={limit} onChange={(e) => setLimit(e.target.value)} /></label>
        </div>
        <label style={{ display: 'block', marginTop: 12 }}>Admin key (production only)<input type="password" value={key} onChange={(e) => setKey(e.target.value)} autoComplete="off" /></label>
        <button style={{ marginTop: 14 }} onClick={collect} disabled={loading}>{loading ? 'Collecting…' : 'Collect and index'}</button>
      </div>

      {health && <div className="card" style={{ marginTop: 14 }}><strong>Runtime:</strong> {health.ok ? `${health.storage} · ${health.vectors} vectors · data ${health.dataVersion}` : 'serving artifacts unavailable'}</div>}
      {error && <div className="card error" style={{ marginTop: 14 }}>{error}</div>}
      {result && <div className="card success" style={{ marginTop: 14 }}><strong>Completed:</strong> scraped {result.scraped}, added {result.added}, index size {result.size}.<div className="muted">{result.note}</div></div>}
    </main>
  );
}
