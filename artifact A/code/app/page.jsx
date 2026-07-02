import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const dynamic = 'force-dynamic';

async function loadInsights() {
  try {
    const p = join(process.cwd(), 'data', 'insights.json');
    return JSON.parse(await readFile(p, 'utf8'));
  } catch {
    return null;
  }
}

function Bar({ label, value, max }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="bar-row">
      <span className="label">{label}</span>
      <span className="bar-track"><span className="bar-fill" style={{ width: `${pct}%` }} /></span>
      <span className="val">{value}</span>
    </div>
  );
}

export default async function InsightsPage() {
  const data = await loadInsights();

  if (!data) {
    return (
      <main className="container">
        <h1>Insights</h1>
        <p className="sub">No data yet. Run <code>npm run build:data</code> (with an OpenAI key set)
        to scrape → enrich → index → compute insights, then reload.</p>
      </main>
    );
  }

  const { aggregates: a, briefAnswers } = data;
  const themeMax = a.themes.length ? a.themes[0][1] : 1;
  const segEntries = Object.entries(a.segments || {}).sort((x, y) => y[1] - x[1]);
  const segMax = segEntries.length ? segEntries[0][1] : 1;
  const sentTotal = Object.values(a.sentiment).reduce((s, x) => s + x, 0) || 1;

  return (
    <main className="container">
      <h1>What Spotify users say about music discovery</h1>
      <p className="sub">
        {a.corpus.total.toLocaleString()} reviews analysed · {a.corpus.discoveryRelated.toLocaleString()} discovery-related ·
        sources: {Object.entries(a.corpus.sources).map(([k, v]) => `${k} (${v})`).join(', ')} ·
        data version: {(data.dataVersion || a.generatedAt || '').slice(0, 10)}
      </p>

      <div className="card" style={{ marginTop: 16, borderColor: 'var(--blue)' }}>
        <strong>Research status:</strong> these findings identify hypotheses from public feedback.
        User interviews are still required before treating a cause as validated or committing to Artifact B.
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card"><div className="stat">{a.corpus.total.toLocaleString()}</div><div className="stat-label">Reviews analysed</div></div>
        <div className="card"><div className="stat">{a.corpus.discoveryRelated.toLocaleString()}</div><div className="stat-label">Mention discovery / recs</div></div>
        <div className="card"><div className="stat">{Math.round((a.sentiment.negative / sentTotal) * 100)}%</div><div className="stat-label">Negative sentiment</div></div>
        <div className="card"><div className="stat">{a.themes.length}</div><div className="stat-label">Distinct frustration themes</div></div>
      </div>

      <h2>Top discovery frustrations (by review count)</h2>
      <div className="card">
        {a.themes.map(([name, count]) => (
          <Bar key={name} label={name.replace(/_/g, ' ')} value={count} max={themeMax} />
        ))}
      </div>

      <h2>Who is affected (discovery-related reviews by segment)</h2>
      <div className="card">
        {segEntries.map(([name, count]) => (
          <Bar key={name} label={name.replace(/_/g, ' ')} value={count} max={segMax} />
        ))}
      </div>

      {a.topJtbds?.length > 0 && (
        <>
          <h2>What users are trying to do (jobs-to-be-done)</h2>
          <div className="card">
            {a.topJtbds.map(([j, c]) => (
              <div key={j} className="bar-row"><span className="badge">{c}</span> {j}</div>
            ))}
          </div>
        </>
      )}

      <h2>AI answers to the core research questions</h2>
      <p className="sub">Each answer is generated strictly from retrieved reviews. Expand to see the cited sources.</p>
      {briefAnswers.map((qa, i) => (
        <div className="qa" key={i}>
          <div className="q">{qa.question}</div>
          <div className="a">{qa.answer}</div>
          <details style={{ marginTop: 10 }}>
            <summary className="muted" style={{ cursor: 'pointer' }}>{qa.citations.length} cited reviews</summary>
            {qa.citations.map((c) => (
              <div className="cite" key={c.n}>
                <div className="meta">[{c.n}] {c.source} · {c.rating ?? '-'}★ · {c.date} · {c.themes.join(', ')}</div>
                {c.quote}
              </div>
            ))}
          </details>
        </div>
      ))}
    </main>
  );
}
