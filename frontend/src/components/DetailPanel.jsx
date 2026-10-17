import { useEffect, useState } from 'react';
import { categoryOf, SEVERITY, STATUS, TYPES } from '../utils/markerMeta.js';
import { prettyDate } from '../utils/format.js';

export default function DetailPanel({ marker, onClose, onResizeStart, onStatus, onDelete, canDelete, onAddMemory, onFlyTo }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const meta = TYPES[marker.type];
  const cat = categoryOf(marker.type, marker.category);
  const isReport = marker.type === 'safety' || marker.type === 'accessibility';

  useEffect(() => {
    setPhotoFailed(false);
  }, [marker.id, marker.photo]);

  return (
    <aside className="detail-panel">
      <button
        className="detail-resize-handle"
        type="button"
        onPointerDown={onResizeStart}
        aria-label="Resize post and map"
        title="Drag to resize the map and post"
      >
        <span />
      </button>
      <div className="panel-head">
        <div className="panel-head-top">
          <span className="type-badge" style={{ background: meta.soft, color: meta.color }}>
            <span className="material-symbols-outlined">{meta.icon}</span>
            {meta.singular}
          </span>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <h2>{marker.title}</h2>
        <div className="panel-meta">
          {cat && (
            <span className="meta-pill">
              <span className="material-symbols-outlined">{cat.icon}</span>
              {cat.label}
            </span>
          )}
          {isReport && SEVERITY[marker.severity] && (
            <span
              className="sev-pill"
              style={{ background: SEVERITY[marker.severity].color + '1a', color: SEVERITY[marker.severity].color }}
            >
              {SEVERITY[marker.severity].label} severity
            </span>
          )}
          {isReport && STATUS[marker.status] && (
            <span
              className="status-pill"
              style={{ background: STATUS[marker.status].color + '1a', color: STATUS[marker.status].color }}
            >
              <span className="dot" style={{ background: STATUS[marker.status].color }} />
              {STATUS[marker.status].label}
            </span>
          )}
        </div>
      </div>

      <div className="panel-body">
        {marker.photo && !photoFailed && (
          <img className="panel-photo" src={marker.photo} alt={marker.title} onError={() => setPhotoFailed(true)} />
        )}
        {marker.photo && photoFailed && (
          <div className="panel-photo panel-photo--unavailable" role="status">
            <span className="material-symbols-outlined">broken_image</span>
            <span>Photo could not be loaded. Check that the Supabase image bucket is public.</span>
          </div>
        )}
        {marker.description && <p className="panel-desc">{marker.description}</p>}

        <dl className="panel-facts">
          <div>
            <dt>Location</dt>
            <dd>
              {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
            </dd>
          </div>
          {marker.dateLabel && (
            <div>
              <dt>Date</dt>
              <dd>{marker.dateLabel}</dd>
            </div>
          )}
          <div>
            <dt>Shared by</dt>
            <dd>{marker.author}</dd>
          </div>
          <div>
            <dt>Added</dt>
            <dd>{prettyDate(marker.createdAt)}</dd>
          </div>
        </dl>
      </div>

      <div className="panel-actions">
        {isReport ? (
          marker.status !== 'resolved' ? (
            <button className="btn btn-success" onClick={() => onStatus(marker.id, 'resolved')}>
              <span className="material-symbols-outlined">task_alt</span>
              Mark as resolved
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={() => onStatus(marker.id, 'open')}>
              <span className="material-symbols-outlined">refresh</span>
              Reopen
            </button>
          )
        ) : (
          <button className="btn btn-primary" onClick={onAddMemory}>
            <span className="material-symbols-outlined">add_circle</span>
            Add your memory here
          </button>
        )}
        <button className="btn btn-ghost" onClick={onFlyTo}>
          <span className="material-symbols-outlined">center_focus_strong</span>
          Centre map
        </button>
        {canDelete && (confirmDelete ? (
          <button className="btn btn-danger" onClick={() => onDelete(marker.id)}>
            <span className="material-symbols-outlined">delete</span>
            Confirm delete?
          </button>
        ) : (
          <button className="btn btn-ghost btn-danger-ghost" onClick={() => setConfirmDelete(true)}>
            <span className="material-symbols-outlined">delete</span>
            Delete
          </button>
        ))}
      </div>
    </aside>
  );
}
