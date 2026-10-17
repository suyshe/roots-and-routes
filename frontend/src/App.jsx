import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from './services/api.js';
import TopNav from './components/TopNav.jsx';
import Sidebar from './components/Sidebar.jsx';
import MapView from './components/MapView.jsx';
import DetailPanel from './components/DetailPanel.jsx';
import AddPinModal from './components/AddPinModal.jsx';
import ToastStack from './components/ToastStack.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import { useMarkers } from './hooks/useMarkers.js';
import { useToasts } from './hooks/useToasts.js';
import { TYPES } from './utils/markerMeta.js';
import { signInWithGoogle, signOut, supabase } from './services/supabase.js';

export default function App() {
  const [view, setView] = useState('map');
  const [config, setConfig] = useState({ center: { lat: 18.5204, lng: 73.8567 }, zoom: 13, googleFormUrl: '' });
  const [filters, setFilters] = useState({ memory: true, heritage: true, safety: true, accessibility: true });
  const [selectedId, setSelectedId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [addPrefill, setAddPrefill] = useState(null);
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState(null);
  const [session, setSession] = useState(null);
  const [account, setAccount] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [pendingSearch, setPendingSearch] = useState(null);
  const [detailPanelRatio, setDetailPanelRatio] = useState(0.5);
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    header: 104,
    nav: 62,
  });
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('roots-routes-theme') === 'dark';
    } catch {
      return false;
    }
  });
  const mapRef = useRef(null);
  const panelDragRef = useRef(null);

  const { toasts, addToast } = useToasts();
  const onMarkersError = useCallback(
    (err) => addToast('Could not load markers: ' + err.message, 'error'),
    [addToast]
  );
  const { markers, demo, loadMarkers } = useMarkers({ onError: onMarkersError });

  useEffect(() => {
    const measure = () => {
      const header = document.querySelector('.topnav');
      const nav = document.querySelector('.nav-links');
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        header: header?.getBoundingClientRect().height || 104,
        nav: nav && getComputedStyle(nav).position === 'fixed'
          ? nav.getBoundingClientRect().height
          : 0,
      });
    };

    measure();
    window.addEventListener('resize', measure);
    const observer = new ResizeObserver(measure);
    const header = document.querySelector('.topnav');
    const nav = document.querySelector('.nav-links');
    if (header) observer.observe(header);
    if (nav) observer.observe(nav);
    return () => {
      window.removeEventListener('resize', measure);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const onPointerMove = (event) => {
      const drag = panelDragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const coordinate = drag.axis === 'y' ? event.clientY : event.clientX;
      const delta = drag.startCoordinate - coordinate;
      const ratio = Math.max(0.15, Math.min(0.85, drag.startRatio + delta / drag.available));
      setDetailPanelRatio(ratio);
    };
    const stopDragging = (event) => {
      if (panelDragRef.current?.pointerId === event.pointerId) panelDragRef.current = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return undefined;
    }

    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) addToast('Could not restore your sign-in: ' + error.message, 'error');
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
      if (!nextSession) setAccount(null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [addToast]);

  useEffect(() => {
    try {
      localStorage.setItem('roots-routes-theme', darkMode ? 'dark' : 'light');
    } catch (err) {
      addToast('Could not save your theme preference: ' + err.message, 'error');
    }
  }, [darkMode, addToast]);

  useEffect(() => {
    let active = true;
    if (!session) {
      setAccount(null);
      return undefined;
    }
    api.currentUser()
      .then((profile) => {
        if (active) setAccount({ ...profile.user, role: profile.role, provider: profile.provider });
      })
      .catch((err) => {
        if (active) {
          setAccount(null);
          addToast('Could not verify your account: ' + err.message, 'error');
        }
      });
    return () => {
      active = false;
    };
  }, [session?.access_token, addToast]);

  useEffect(() => {
    api
      .config()
      .then(setConfig)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (view !== 'map' || !pendingSearch || !mapRef.current) return;
    mapRef.current.flyTo(
      pendingSearch.lat,
      pendingSearch.lng,
      pendingSearch.zoom,
      pendingSearch.label
    );
    if (pendingSearch.markerId) setDetailPanelRatio(0.5);
    setSelectedId(pendingSearch.markerId || null);
    setPendingSearch(null);
  }, [pendingSearch, view]);

  const selected = useMemo(
    () => markers.find((m) => m.id === selectedId) || null,
    [markers, selectedId]
  );

  const counts = useMemo(() => {
    const c = { memory: 0, heritage: 0, safety: 0, accessibility: 0 };
    for (const m of markers) c[m.type] = (c[m.type] || 0) + 1;
    return c;
  }, [markers]);

  function toggleFilter(type) {
    setFilters((f) => ({ ...f, [type]: !f[type] }));
  }

  function toggleTheme() {
    setDarkMode((current) => !current);
  }

  function startPanelResize(event) {
    event.preventDefault();
    const portrait = viewport.height >= viewport.width;
    const available = portrait
      ? Math.max(1, viewport.height - viewport.header - viewport.nav)
      : Math.max(1, viewport.width);
    panelDragRef.current = {
      pointerId: event.pointerId,
      axis: portrait ? 'y' : 'x',
      startCoordinate: portrait ? event.clientY : event.clientX,
      startRatio: detailPanelRatio,
      available,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleSelectMarker(id) {
    if (id) setDetailPanelRatio(0.5);
    setSelectedId(id);
  }

  function openAdd(prefillType = null) {
    if (!account) {
      addToast('Sign in with Google before contributing.', 'error');
      return;
    }
    setSelectedId(null);
    setPicked(null);
    setPicking(false);
    setAddPrefill(prefillType);
    setAdding(true);
    setView('map');
  }

  function closeAdd() {
    setAdding(false);
    setPicking(false);
    setPicked(null);
  }

  async function handleSignIn() {
    try {
      await signInWithGoogle();
    } catch (err) {
      addToast('Could not sign in: ' + err.message, 'error');
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch (err) {
      addToast('Could not sign out: ' + err.message, 'error');
    }
  }

  function canDelete(marker) {
    return Boolean(account && (account.role === 'admin' || account.id === marker.userId));
  }

  function demoMessage(fallback) {
    return demo ? 'Demo mode — start the backend (npm run dev) to save changes.' : fallback;
  }

  async function handleCreate(payload) {
    try {
      const created = await api.createMarker(payload);
      await loadMarkers();
      closeAdd();
      setSelectedId(created.id);
      mapRef.current?.flyTo(created.lat, created.lng, 16);
      addToast(`${TYPES[created.type].singular} added to the map 🎉`);
    } catch (err) {
      addToast(demoMessage('Could not save: ' + err.message), 'error');
      throw err;
    }
  }

  async function handleStatus(id, status) {
    try {
      await api.updateMarker(id, { status });
      await loadMarkers();
      addToast(status === 'resolved' ? 'Marked as resolved 👍' : 'Status updated');
    } catch (err) {
      addToast(demoMessage('Could not update: ' + err.message), 'error');
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteMarker(id);
      setSelectedId(null);
      await loadMarkers();
      addToast('Marker removed');
    } catch (err) {
      addToast(demoMessage('Could not delete: ' + err.message), 'error');
    }
  }

  async function handleSearch(term) {
    const query = term.trim();
    const q = query.toLowerCase();
    if (!q) return;
    const match = markers.find((m) => {
      const meta = TYPES[m.type];
      if (!filters[m.type]) return false;
      return (m.title + ' ' + (m.description || '') + ' ' + meta.label).toLowerCase().includes(q);
    });
    if (match) {
      setPendingSearch({
        lat: match.lat,
        lng: match.lng,
        zoom: 16,
        markerId: match.id,
      });
      setView('map');
      return;
    }

    setSearching(true);
    try {
      const location = await api.geocode(query);
      setPendingSearch({
        lat: location.lat,
        lng: location.lng,
        zoom: 15,
        label: location.name,
        markerId: null,
      });
      setView('map');
    } catch (err) {
      addToast(err.message === 'Location not found'
        ? `No post or location found for “${query}”`
        : `Could not search for that location: ${err.message}`, 'error');
    } finally {
      setSearching(false);
    }
  }

  function openOnMap(id) {
    setDetailPanelRatio(0.5);
    setSelectedId(id);
    setView('map');
  }

  function handleHome() {
    setAdding(false);
    setPicking(false);
    setPicked(null);
    setSelectedId(null);
    setDetailPanelRatio(0.5);
    setPendingSearch({
      lat: config.center.lat,
      lng: config.center.lng,
      zoom: config.zoom,
      markerId: null,
    });
    setView('map');
  }

  const panelPortrait = viewport.height >= viewport.width;
  const panelAvailable = panelPortrait
    ? Math.max(1, viewport.height - viewport.header - viewport.nav)
    : Math.max(1, viewport.width);

  return (
    <div
      className="app"
      data-theme={darkMode ? 'dark' : 'light'}
      style={{
        '--mobile-panel-size': `${Math.round(panelAvailable * detailPanelRatio)}px`,
        '--mobile-header-size': `${viewport.header}px`,
        '--mobile-nav-size': `${viewport.nav}px`,
      }}
    >
      <TopNav
        view={view}
        onNav={setView}
        onHome={handleHome}
        onSearch={handleSearch}
        onOpenAdd={() => openAdd(null)}
        demo={demo}
        user={account}
        authLoading={authLoading}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        searching={searching}
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
      />

      <div className="app-body">
        <Sidebar
          counts={counts}
          filters={filters}
          onToggleFilter={toggleFilter}
          onOpenAdd={openAdd}
        />

        <main className="main-area">
          {view === 'map' && (
            <MapView
              ref={mapRef}
              markers={markers}
              filters={filters}
              selectedId={selectedId}
              onSelect={handleSelectMarker}
              onOpenAdd={() => openAdd(null)}
              center={config.center}
              zoom={config.zoom}
              darkMode={darkMode}
              detailOpen={Boolean(selected)}
              picking={picking}
              picked={picked}
              onPick={(lat, lng) => setPicked({ lat, lng })}
              onToggleFilter={toggleFilter}
            />
          )}
          {view === 'community' && (
            <CommunityPage
              markers={markers}
              counts={counts}
              googleFormUrl={config.googleFormUrl}
              onOpenMap={openOnMap}
              onOpenAdd={openAdd}
            />
          )}
          {view === 'reports' && (
            <ReportsPage
              markers={markers}
              onStatus={handleStatus}
              onDelete={handleDelete}
              canDelete={canDelete}
              onOpenMap={openOnMap}
            />
          )}
        </main>
      </div>

      {view === 'map' && selected && (
        <DetailPanel
          marker={selected}
          onClose={() => setSelectedId(null)}
          onResizeStart={startPanelResize}
          onStatus={handleStatus}
          onDelete={handleDelete}
          canDelete={canDelete(selected)}
          onAddMemory={() => {
            setSelectedId(null);
            openAdd('memory');
          }}
          onFlyTo={() => mapRef.current?.flyTo(selected.lat, selected.lng, 16)}
        />
      )}

      {adding && (
        <AddPinModal
          prefillType={addPrefill}
          onClose={closeAdd}
          onSubmit={handleCreate}
          mapRef={mapRef}
          addToast={addToast}
          picking={picking}
          setPicking={setPicking}
          picked={picked}
          setPicked={setPicked}
        />
      )}

      <ToastStack toasts={toasts} />
    </div>
  );
}
