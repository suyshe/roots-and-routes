import { TYPES } from '../utils/markerMeta.js';

export default function Sidebar({ counts, filters, onToggleFilter, onOpenAdd }) {
  return (
    <aside className="sidebar">
      <div className="side-head">
        <div className="side-title">
          <span className="material-symbols-outlined">explore</span>
          <div>
            <strong>Explore the map</strong>
            <p>Everything the community has shared</p>
          </div>
        </div>
        <button className="btn btn-primary btn-block" onClick={() => onOpenAdd(null)}>
          <span className="material-symbols-outlined">add_location</span>
          Add to the map
        </button>
      </div>

      <div className="side-section">
        <h3 className="side-label">Show on map</h3>
        <div className="filter-list">
          {Object.entries(TYPES).map(([key, meta]) => (
            <button
              key={key}
              className={'filter-item' + (filters[key] ? ' filter-item--on' : '')}
              style={{ '--cat': meta.color, '--cat-soft': meta.soft }}
              onClick={() => onToggleFilter(key)}
            >
              <span className="filter-icon material-symbols-outlined">{meta.icon}</span>
              <span className="filter-name">{meta.label}</span>
              <span className="filter-count">{counts[key] ?? 0}</span>
              <span className="filter-check material-symbols-outlined">
                {filters[key] ? 'check_circle' : 'radio_button_unchecked'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="side-section">
        <h3 className="side-label">Quick add</h3>
        <div className="quick-add">
          <button className="quick-item" style={{ '--cat': TYPES.memory.color, '--cat-soft': TYPES.memory.soft }} onClick={() => onOpenAdd('memory')}>
            <span className="material-symbols-outlined">{TYPES.memory.icon}</span>
            <span>
              <strong>Share a memory</strong>
              <small>Story, tradition or event</small>
            </span>
          </button>
          <button className="quick-item" style={{ '--cat': TYPES.safety.color, '--cat-soft': TYPES.safety.soft }} onClick={() => onOpenAdd('safety')}>
            <span className="material-symbols-outlined">{TYPES.safety.icon}</span>
            <span>
              <strong>Report a safety issue</strong>
              <small>Unsafe location or hazard</small>
            </span>
          </button>
          <button className="quick-item" style={{ '--cat': TYPES.accessibility.color, '--cat-soft': TYPES.accessibility.soft }} onClick={() => onOpenAdd('accessibility')}>
            <span className="material-symbols-outlined">{TYPES.accessibility.icon}</span>
            <span>
              <strong>Report an accessibility issue</strong>
              <small>Ramps, footpaths, crossings</small>
            </span>
          </button>
        </div>
      </div>

      <div className="side-foot">
        <span className="material-symbols-outlined">volunteer_activism</span>
        <p>
          Built with Leaflet + OpenStreetMap, React, Node.js and Supabase.
        </p>
      </div>
    </aside>
  );
}
