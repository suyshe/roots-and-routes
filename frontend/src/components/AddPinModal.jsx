import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api.js';
import { CATEGORIES, SEVERITY, TYPES } from '../utils/markerMeta.js';

const ADDABLE = ['memory', 'safety', 'accessibility'];

export default function AddPinModal({
  prefillType,
  onClose,
  onSubmit,
  mapRef,
  addToast,
  picking,
  setPicking,
  picked,
  setPicked,
}) {
  const [step, setStep] = useState(prefillType ? 2 : 1);
  const [type, setType] = useState(prefillType || null);
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    severity: 'medium',
    author: '',
    dateLabel: '',
  });
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  // Enable map picking while the modal is open so users can drop a pin.
  useEffect(() => {
    setPicking(true);
    return () => setPicking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function chooseType(t) {
    setType(t);
    setForm((f) => ({ ...f, category: '' }));
    setStep(2);
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onFile(e) {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    const valid = selected.filter((file) => /^image\//.test(file.type));
    const invalid = selected.length - valid.length;
    if (invalid > 0) addToast('Some files were not valid images and were skipped.', 'error');
    if (!valid.length) {
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    const tooLarge = valid.filter((file) => file.size > 8 * 1024 * 1024);
    if (tooLarge.length) {
      addToast('Each image must be 8 MB or smaller.', 'error');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    setUploading(true);
    try {
      const next = [...photos, ...valid.map((file) => ({ id: crypto.randomUUID?.() || String(Date.now() + Math.random()), file, preview: URL.createObjectURL(file) }))];
      setPhotos(next);
      addToast(valid.length === 1 ? 'Photo selected 📷' : `${valid.length} photos selected 📷`);
    } catch (err) {
      addToast('Photo upload failed: ' + err.message, 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by this browser', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPicked({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        mapRef.current?.flyTo(pos.coords.latitude, pos.coords.longitude, 15);
      },
      () => addToast('Could not get your location — please drop a pin instead', 'error')
    );
  }

  async function submit(e) {
    e.preventDefault();
    if (!type) return;
    if (!picked) {
      addToast('Drop a pin on the map first 📍', 'error');
      return;
    }
    const payload = {
      type,
      title: form.title,
      category: form.category || CATEGORIES[type][0].id,
      description: form.description,
      latitude: picked.lat,
      longitude: picked.lng,
      author: form.author,
      dateLabel: form.dateLabel,
      photo: photos[0]?.preview || null,
      photos: photos.map((p) => p.preview),
    };
    if (type === 'safety' || type === 'accessibility') payload.severity = form.severity;

    if (!payload.title.trim()) {
      addToast('Please give it a title', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ ...payload, files: photos.map((item) => item.file) });
    } catch {
      /* error toast already shown by App */
    } finally {
      setSubmitting(false);
    }
  }

  const meta = type ? TYPES[type] : null;

  return (
    <aside className="add-panel">
      <div className="panel-head add-head">
        <div>
          <p className="step-label">Step {step} of 2</p>
          <h2>{step === 1 ? 'Add to the map' : `New ${meta ? meta.singular.toLowerCase() : 'entry'}`}</h2>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {step === 1 ? (
        <div className="add-step">
          <p className="add-intro">What would you like to share with the community?</p>
          <div className="type-cards">
            {ADDABLE.map((t) => {
              const m = TYPES[t];
              return (
                <button key={t} className="type-card" style={{ '--cat': m.color, '--cat-soft': m.soft }} onClick={() => chooseType(t)}>
                  <span className="type-card-icon material-symbols-outlined">{m.icon}</span>
                  <span className="type-card-title">{m.label}</span>
                  <span className="type-card-blurb">{m.blurb}</span>
                </button>
              );
            })}
          </div>
          <p className="add-note">
            Heritage sites are curated by the Heritage Trust — see the map to explore them.
          </p>
        </div>
      ) : (
        <form className="add-form" onSubmit={submit}>
          <label className="field">
            <span className="field-label">Title *</span>
            <input
              className="input"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder={meta ? `e.g. “${meta.singular} near the market”` : 'Title'}
              maxLength={120}
            />
          </label>

          <div className="field">
            <span className="field-label">Category</span>
            <div className="cat-chips">
              {CATEGORIES[type].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={'cat-chip' + (form.category === c.id ? ' cat-chip--on' : '')}
                  style={form.category === c.id ? { background: meta.color, borderColor: meta.color } : undefined}
                  onClick={() => set('category', c.id)}
                >
                  <span className="material-symbols-outlined">{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            <span className="field-label">Description</span>
            <textarea
              className="input textarea"
              rows={4}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Tell the story or describe the problem…"
            />
          </label>

          {(type === 'safety' || type === 'accessibility') && (
            <div className="field">
              <span className="field-label">Severity</span>
              <div className="sev-row">
                {Object.entries(SEVERITY).map(([key, s]) => (
                  <button
                    key={key}
                    type="button"
                    className={'sev-btn' + (form.severity === key ? ' sev-btn--on' : '')}
                    style={form.severity === key ? { background: s.color, borderColor: s.color } : undefined}
                    onClick={() => set('severity', key)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="field-row">
            <label className="field">
              <span className="field-label">Your name</span>
              <input
                className="input"
                value={form.author}
                onChange={(e) => set('author', e.target.value)}
                placeholder="Community member"
                maxLength={60}
              />
            </label>
            <label className="field">
              <span className="field-label">Date / era (optional)</span>
              <input
                className="input"
                value={form.dateLabel}
                onChange={(e) => set('dateLabel', e.target.value)}
                placeholder="e.g. Est. 1920, Summer 1998"
                maxLength={40}
              />
            </label>
          </div>

          <div className="field">
            <span className="field-label">Photos (optional)</span>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden-input" id="photo-input" onChange={onFile} />
            {photos.length > 0 ? (
              <div className="photo-grid">
                {photos.map((item, index) => (
                  <div key={item.id || index} className="photo-preview">
                    <img src={item.preview} alt={`Upload preview ${index + 1}`} />
                    <button type="button" className="photo-remove" onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))} aria-label="Remove photo">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <label htmlFor="photo-input" className="photo-drop">
              <span className="material-symbols-outlined">{uploading ? 'hourglass_top' : 'add_a_photo'}</span>
              {uploading ? 'Selecting…' : photos.length > 0 ? 'Add more photos' : 'Upload photos'}
            </label>
          </div>

          <div className={'field location-field' + (picked ? ' location-field--ok' : '')}>
            <span className="field-label">Location *</span>
            <div className="location-cta">
              <button type="button" className="btn btn-ghost" onClick={() => setPicking(true)}>
                <span className="material-symbols-outlined">touch_app</span>
                Drop pin on map
              </button>
              <button type="button" className="btn btn-ghost" onClick={useMyLocation}>
                <span className="material-symbols-outlined">my_location</span>
                Use my location
              </button>
            </div>
            {picked ? (
              <p className="location-ok">
                <span className="material-symbols-outlined">check_circle</span>
                Pin at {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
              </p>
            ) : (
              <p className="location-warn">
                <span className="material-symbols-outlined">info</span>
                Tap the map on the right to drop the pin
              </p>
            )}
          </div>

          <div className="add-actions">
            {!prefillType && (
              <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                <span className="material-symbols-outlined">arrow_back</span>
                Back
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <span className="material-symbols-outlined">{submitting ? 'hourglass_top' : 'add_location'}</span>
              {submitting ? 'Saving…' : `Add to map`}
            </button>
          </div>
        </form>
      )}
    </aside>
  );
}
