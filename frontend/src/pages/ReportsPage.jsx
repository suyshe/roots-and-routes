import { useMemo, useState } from 'react';
import { categoryOf, SEVERITY, STATUS, TYPES } from '../utils/markerMeta.js';
import { timeAgo } from '../utils/format.js';

export default function ReportsPage({ markers, onStatus, onDelete, canDelete, onOpenMap }) {
  const [tab, setTab] = useState('all'); // all | safety | accessibility
  const [confirmId, setConfirmId] = useState(null);

  const reports = useMemo(
    () =>
      markers
        .filter((m) => m.type === 'safety' || m.type === 'accessibility')
        .filter((m) => tab === 'all' || m.type === tab)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [markers, tab]
  );

  const summary = useMemo(() => {
    const s = { open: 0, 'in-progress': 0, resolved: 0 };
    for (const m of markers) {
      if (m.type === 'safety' || m.type === 'accessibility') {
        if (s[m.status] !== undefined) s[m.status] += 1;
      }
    }
    return s;
  }, [markers]);

  return (
    <div className="page">
      <header className="page-head page-head--row">
        <div>
          <h1>Reports</h1>
          <p>Safety hazards and accessibility barriers reported by the community.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => (window.location.href = '/api/export.csv')}>
          <span className="material-symbols-outlined">download</span>
          Export CSV
        </button>
      </header>

      <div className="tabs">
        {[
          { id: 'all', label: 'All reports' },
          { id: 'safety', label: 'Safety' },
          { id: 'accessibility', label: 'Accessibility' },
        ].map((t) => (
          <button key={t.id} className={'tab' + (tab === t.id ? ' tab--on' : '')} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
        <div className="tabs-spacer" />
        {Object.entries(summary).map(([key, n]) => (
          <span key={key} className="summary-pill" style={{ color: STATUS[key].color }}>
            <span className="dot" style={{ background: STATUS[key].color }} />
            {STATUS[key].label}: {n}
          </span>
        ))}
      </div>

      <div className="report-grid">
        {reports.length === 0 && <p className="empty">No reports in this view yet.</p>}
        {reports.map((m) => {
          const meta = TYPES[m.type];
          const cat = categoryOf(m.type, m.category);
          const sev = SEVERITY[m.severity];
          const st = STATUS[m.status];
          return (
            <article key={m.id} className="report-card">
              <div className="report-top">
                <span className="report-icon" style={{ background: meta.soft, color: meta.color }}>
                  <span className="material-symbols-outlined">{meta.icon}</span>
                </span>
                <div className="report-title">
                  <button className="report-link" onClick={() => onOpenMap(m.id)}>{m.title}</button>
                  <span className="report-sub">
                    {meta.singular} · {cat.label}
                  </span>
                </div>
                <span className="status-pill" style={{ background: st.color + '1a', color: st.color }}>
                  <span className="dot" style={{ background: st.color }} />
                  {st.label}
                </span>
              </div>

              {m.description && <p className="report-desc">{m.description}</p>}

              <div className="report-meta">
                <span className="sev-pill" style={{ background: sev.color + '1a', color: sev.color }}>
                  {sev.label} severity
                </span>
                <span>{m.author}</span>
                <span>·</span>
                <span>{timeAgo(m.createdAt)}</span>
                <span className="report-coords">
                  {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                </span>
              </div>

              <div className="report-actions">
                {m.status !== 'resolved' ? (
                  <button className="btn btn-success btn-sm" onClick={() => onStatus(m.id, 'resolved')}>
                    <span className="material-symbols-outlined">task_alt</span>
                    Mark resolved
                  </button>
                ) : (
                  <button className="btn btn-ghost btn-sm" onClick={() => onStatus(m.id, 'open')}>
                    <span className="material-symbols-outlined">refresh</span>
                    Reopen
                  </button>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => onOpenMap(m.id)}>
                  <span className="material-symbols-outlined">map</span>
                  View on map
                </button>
                {canDelete(m) && (confirmId === m.id ? (
                  <button className="btn btn-danger btn-sm" onClick={() => { onDelete(m.id); setConfirmId(null); }}>
                    <span className="material-symbols-outlined">delete</span>
                    Confirm
                  </button>
                ) : (
                  <button className="btn btn-ghost btn-sm" onClick={() => setConfirmId(m.id)}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
