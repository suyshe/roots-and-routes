import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TYPES } from '../utils/markerMeta.js';

// ------------------------------------------------------------------ pin icon
function pinIcon(type, highlight = false) {
  const meta = TYPES[type] || TYPES.memory;
  const html = `
    <div class="cp-pin${highlight ? ' cp-pin--hl' : ''}" style="--pin-color:${meta.color};--pin-icon:${meta.dark};">
      <div class="cp-pin-head">
        <span class="material-symbols-outlined">${meta.icon}</span>
      </div>
    </div>`;
  return L.divIcon({
    html,
    className: 'cp-pin-wrap',
    iconSize: [40, 48],
    iconAnchor: [20, 42],
    popupAnchor: [0, -44],
  });
}

const pickIcon = L.divIcon({
  html: `
    <div class="cp-pin cp-pin--pick" style="--pin-color:#06483f;--pin-icon:#ffffff;">
      <div class="cp-pin-head"><span class="material-symbols-outlined">add_location</span></div>
    </div>`,
  className: 'cp-pin-wrap',
  iconSize: [40, 48],
  iconAnchor: [20, 42],
});

function createTileLayer(darkMode) {
  return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    className: darkMode ? 'map-tiles-dark' : '',
  });
}

// ------------------------------------------------------------------ component
const MapView = forwardRef(function MapView(
  {
    markers,
    filters,
    selectedId,
    onSelect,
    onOpenAdd,
    center,
    zoom,
    darkMode,
    picking,
    picked,
    onPick,
    onToggleFilter,
  },
  ref
) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);
  const tileLayerRef = useRef(null);
  const pickMarkerRef = useRef(null);
  const searchMarkerRef = useRef(null);
  const pickingRef = useRef(picking);
  pickingRef.current = picking;

  // Initialise the map once.
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: false,
      attributionControl: true,
    });
    tileLayerRef.current = createTileLayer(darkMode).addTo(map);
    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const onClick = (e) => {
      if (pickingRef.current) {
        onPick(e.latlng.lat, e.latlng.lng);
        return;
      }
      // Clicks that land on a marker are handled by the marker's own handler —
      // don't treat them as a map click (which would deselect immediately).
      const target = e.originalEvent && e.originalEvent.target;
      if (target && target.closest && target.closest('.leaflet-marker-icon')) return;
      onSelect(null);
    };
    map.on('click', onClick);

    // Keep the map sized correctly when panels beside it open/close.
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.off('click', onClick);
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
      tileLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    tileLayerRef.current = createTileLayer(darkMode).addTo(map);
  }, [darkMode]);

  useEffect(() => {
    if (selectedId && searchMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(searchMarkerRef.current);
      searchMarkerRef.current = null;
    }
  }, [selectedId]);

  // Expose imperative helpers (flyTo) to the parent.
  useImperativeHandle(ref, () => ({
    flyTo: (lat, lng, z = 14, label = '') => {
      mapRef.current?.flyTo([lat, lng], z, { duration: 0.8 });
      if (searchMarkerRef.current) {
        mapRef.current?.removeLayer(searchMarkerRef.current);
        searchMarkerRef.current = null;
      }
      if (label && mapRef.current) {
        searchMarkerRef.current = L.circleMarker([lat, lng], {
          radius: 9,
          color: '#ffffff',
          weight: 3,
          fillColor: '#06483f',
          fillOpacity: 1,
        }).addTo(mapRef.current);
        searchMarkerRef.current.bindTooltip(label, { permanent: true, direction: 'top', offset: [0, -8] }).openTooltip();
      }
    },
  }));

  // Rebuild the markers layer whenever data or filters change.
  useEffect(() => {
    const group = layerGroupRef.current;
    if (!group) return;
    group.clearLayers();
    for (const m of markers) {
      if (!filters[m.type]) continue;
      const marker = L.marker([m.lat, m.lng], {
        icon: pinIcon(m.type, m.id === selectedId),
        riseOnHover: true,
        zIndexOffset: m.id === selectedId ? 1000 : 0,
      });
      marker.on('click', (e) => {
        if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
        onSelect(m.id);
      });
      marker.bindTooltip(m.title, {
        direction: 'top',
        offset: [0, -42],
        opacity: 1,
        className: 'cp-tooltip',
      });
      marker.addTo(group);
    }
  }, [markers, filters, selectedId, onSelect]);

  // Show/hide the temporary "drop here" pin while picking a location.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (pickMarkerRef.current) {
      map.removeLayer(pickMarkerRef.current);
      pickMarkerRef.current = null;
    }
    if (picking && picked) {
      pickMarkerRef.current = L.marker([picked.lat, picked.lng], { icon: pickIcon }).addTo(map);
    }
  }, [picking, picked]);

  function locateMe() {
    const map = mapRef.current;
    if (!map) return;
    if (!navigator.geolocation) {
      window.alert('Geolocation is not supported by this browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => map.flyTo([pos.coords.latitude, pos.coords.longitude], 16, { duration: 1 }),
      () => window.alert?.('Could not get your location — please allow location access.')
    );
  }

  return (
    <div className="map-view">
      <div ref={containerRef} className="map-canvas" />

      {/* Category filter chips */}
      <div className="filter-bar">
        {Object.entries(TYPES).map(([key, meta]) => (
          <button
            key={key}
            className={'chip' + (filters[key] ? ' chip--on' : '')}
            style={filters[key] ? { background: meta.color, borderColor: meta.color } : undefined}
            onClick={() => onToggleFilter(key)}
            title={meta.blurb}
          >
            <span className="material-symbols-outlined">{meta.icon}</span>
            {meta.label}
            <span className="chip-count">{filters[key] ? '✓' : ''}</span>
          </button>
        ))}
      </div>

      {/* Right-hand zoom / locate controls */}
      <div className="map-controls">
        <div className="ctrl-group">
          <button className="ctrl-btn" title="Zoom in" onClick={() => mapRef.current?.zoomIn()}>
            <span className="material-symbols-outlined">add</span>
          </button>
          <button className="ctrl-btn" title="Zoom out" onClick={() => mapRef.current?.zoomOut()}>
            <span className="material-symbols-outlined">remove</span>
          </button>
        </div>
        <div className="ctrl-group">
          <button className="ctrl-btn" title="My location" onClick={locateMe}>
            <span className="material-symbols-outlined">my_location</span>
          </button>
        </div>
      </div>

      {/* Primary call-to-action */}
      <button className="fab" onClick={onOpenAdd}>
        <span className="material-symbols-outlined">add_location</span>
        <span>Add to the map</span>
      </button>

      {/* Picking hint */}
      {picking && (
        <div className="pick-hint">
          <span className="material-symbols-outlined">touch_app</span>
          {picked ? 'Location set — tap another spot to move the pin' : 'Tap the map to drop the pin'}
        </div>
      )}
    </div>
  );
});

export default MapView;
