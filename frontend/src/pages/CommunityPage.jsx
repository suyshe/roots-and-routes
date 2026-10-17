import { useMemo } from 'react';
import { categoryOf, TYPES } from '../utils/markerMeta.js';
import { timeAgo } from '../utils/format.js';

export default function CommunityPage({ markers, counts, googleFormUrl, onOpenMap, onOpenAdd }) {
  const memories = useMemo(
    () =>
      markers
        .filter((m) => m.type === 'memory')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6),
    [markers]
  );

  const recentReports = useMemo(
    () =>
      markers
        .filter((m) => m.type === 'safety' || m.type === 'accessibility')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4),
    [markers]
  );

  const contributors = useMemo(() => {
    const tally = {};
    for (const m of markers) {
      const name = (m.author || 'Community member').trim();
      tally[name] = (tally[name] || 0) + 1;
    }
    return Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [markers]);

  return (
    <div className="page">
      <header className="page-head">
        <h1>Community Dashboard</h1>
        <p>What the town has been sharing — memories, landmarks and reports at a glance.</p>
      </header>

      <div className="stat-grid">
        {Object.entries(TYPES).map(([key, meta]) => (
          <button key={key} className="stat-card" style={{ '--cat': meta.color, '--cat-soft': meta.soft }} onClick={() => onOpenMap(null)} title="Open the map">
            <span className="stat-icon material-symbols-outlined">{meta.icon}</span>
            <span className="stat-num">{counts[key] ?? 0}</span>
            <span className="stat-label">{meta.label}</span>
          </button>
        ))}
        <div className="stat-card stat-card--total">
          <span className="stat-icon material-symbols-outlined">public</span>
          <span className="stat-num">{markers.length}</span>
          <span className="stat-label">Total contributions</span>
        </div>
      </div>

      <div className="dash-grid">
        <section className="dash-col">
          <h2 className="dash-title">
            <span className="material-symbols-outlined" style={{ color: TYPES.memory.color }}>history</span>
            Trending memories
          </h2>
          <div className="mem-list">
            {memories.length === 0 && <p className="empty">No memories shared yet — be the first!</p>}
            {memories.map((m) => {
              const cat = categoryOf('memory', m.category);
              return (
                <button key={m.id} className="mem-card" onClick={() => onOpenMap(m.id)}>
                  {m.photo ? (
                    <img className="mem-photo" src={m.photo} alt={m.title} loading="lazy" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  ) : (
                    <div className="mem-photo mem-photo--grad" style={{ '--cat': TYPES.memory.color }}>
                      <span className="material-symbols-outlined">{cat.icon}</span>
                    </div>
                  )}
                  <div className="mem-body">
                    <span className="mem-cat">{cat.label}</span>
                    <h3>{m.title}</h3>
                    <p>{m.description}</p>
                    <div className="mem-foot">
                      <span>{m.author}</span>
                      <span>{timeAgo(m.createdAt)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <div className="dash-side">
          <section className="dash-col">
            <h2 className="dash-title">
              <span className="material-symbols-outlined" style={{ color: TYPES.safety.color }}>campaign</span>
              Recent reports
            </h2>
            <div className="rep-list">
              {recentReports.length === 0 && <p className="empty">No reports yet.</p>}
              {recentReports.map((m) => {
                const meta = TYPES[m.type];
                return (
                  <button key={m.id} className="rep-mini" onClick={() => onOpenMap(m.id)}>
                    <span className="rep-mini-icon material-symbols-outlined" style={{ background: meta.soft, color: meta.color }}>
                      {meta.icon}
                    </span>
                    <span className="rep-mini-body">
                      <strong>{m.title}</strong>
                      <small>{m.author} · {timeAgo(m.createdAt)}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="dash-col">
            <h2 className="dash-title">
              <span className="material-symbols-outlined" style={{ color: '#C77E00' }}>workspace_premium</span>
              Top contributors
            </h2>
            <ol className="contrib-list">
              {contributors.length === 0 && <p className="empty">Nobody yet — jump in!</p>}
              {contributors.map(([name, n], i) => (
                <li key={name}>
                  <span className="rank" style={{ background: i === 0 ? '#F5A000' : 'var(--surface-3)', color: i === 0 ? '#fff' : 'var(--text-2)' }}>
                    {i + 1}
                  </span>
                  <span className="contrib-name">{name}</span>
                  <span className="contrib-num">{n} {n === 1 ? 'pin' : 'pins'}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="dash-col cta-card">
            <h2 className="dash-title">
              <span className="material-symbols-outlined" style={{ color: TYPES.accessibility.color }}>volunteer_activism</span>
              Get involved
            </h2>
            <p>Share a memory or report an issue — every pin helps the whole community.</p>
            <button className="btn btn-primary btn-block" onClick={() => onOpenAdd(null)}>
              <span className="material-symbols-outlined">add_location</span>
              Add to the map
            </button>
            {googleFormUrl && (
              <a className="btn btn-ghost btn-block" href={googleFormUrl} target="_blank" rel="noreferrer">
                <span className="material-symbols-outlined">assignment</span>
                Offline form (Google Forms)
              </a>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
