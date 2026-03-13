import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigation, Bell } from 'lucide-react';

const ALERT_COORDS = {
  islamabad: [73.0479, 33.6844],
  karachi: [67.0011, 24.8607],
  lahore: [74.3587, 31.5204],
  peshawar: [71.5249, 34.0151],
  quetta: [66.9905, 30.1798],
  multan: [71.5249, 30.1575],
  rawalpindi: [73.0551, 33.5651],
  sindh: [67.0011, 24.8607],
  punjab: [74.3587, 31.5204],
  balochistan: [66.9905, 30.1798],
  'khyber pakhtunkhwa': [71.5249, 34.0151],
  kp: [71.5249, 34.0151],
  kpk: [71.5249, 34.0151],
  gilgit: [74.3142, 35.9208],
  pakistan: [69.3451, 30.3753]
};

const resolveAlertCoords = (alert) => {
  const text = `${alert?.title || ''} ${alert?.description || ''} ${alert?.region || ''}`.toLowerCase();
  const keys = Object.keys(ALERT_COORDS);
  for (const key of keys) {
    if (text.includes(key)) {
      return ALERT_COORDS[key];
    }
  }
  return null;
};

const MapSection = ({ mapData, alerts = [], loading }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const maplibreRef = useRef(null);
  const markerRefs = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showAlertsLayer, setShowAlertsLayer] = useState(true);

  const topAlerts = useMemo(() => {
    const sorted = [...(alerts || [])].sort((a, b) => {
      const ta = new Date(a?.timestamp || 0).getTime();
      const tb = new Date(b?.timestamp || 0).getTime();
      return tb - ta;
    });
    return sorted.slice(0, 8);
  }, [alerts]);

  useEffect(() => {
    const loadMap = async () => {
      if (!mapContainerRef.current || mapRef.current) return;

      try {
        const maplibregl = (await import('maplibre-gl')).default;
        maplibreRef.current = maplibregl;
        await import('maplibre-gl/dist/maplibre-gl.css');

        const map = new maplibregl.Map({
          container: mapContainerRef.current,
          style: {
            version: 8,
            sources: {
              'carto-dark': {
                type: 'raster',
                tiles: [
                  'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                  'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                  'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
                ],
                tileSize: 256,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              }
            },
            layers: [{ id: 'carto-dark-layer', type: 'raster', source: 'carto-dark', minzoom: 0, maxzoom: 22 }]
          },
          center: [69.3451, 30.3753],
          zoom: 5,
          attributionControl: false
        });

        map.addControl(new maplibregl.NavigationControl(), 'top-right');
        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

        map.on('load', () => {
          setMapLoaded(true);
          mapRef.current = map;
        });
      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    loadMap();

    return () => {
      markerRefs.current.forEach((m) => m.remove());
      markerRefs.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const renderMarkers = async () => {
      if (!mapRef.current || !mapLoaded || !maplibreRef.current) return;

      const maplibregl = maplibreRef.current;
      markerRefs.current.forEach((m) => m.remove());
      markerRefs.current = [];

      (mapData?.cities || []).forEach((city) => {
        const el = document.createElement('div');
        el.className = 'map-marker city-marker';
        el.style.cssText = `
          width: 12px;
          height: 12px;
          background: ${city.type === 'capital' ? '#22C55E' : city.type === 'strategic' ? '#F59E0B' : '#3B82F6'};
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.5);
          cursor: pointer;
          box-shadow: 0 0 10px ${city.type === 'capital' ? '#22C55E' : city.type === 'strategic' ? '#F59E0B' : '#3B82F6'};
        `;

        const popup = new maplibregl.Popup({ offset: 15 }).setHTML(`
          <div style="background: #0F172A; color: #F8FAFC; padding: 8px 12px; font-family: 'JetBrains Mono', monospace; font-size: 12px; border: 1px solid #22C55E;">
            <strong style="color: #22C55E;">${city.name}</strong><br/>
            <span style="color: #94A3B8;">Population: ${city.population}</span><br/>
            <span style="color: #94A3B8; text-transform: uppercase; font-size: 10px;">${city.type}</span>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el }).setLngLat([city.lon, city.lat]).setPopup(popup).addTo(mapRef.current);
        markerRefs.current.push(marker);
      });

      if (showAlertsLayer) {
        topAlerts.forEach((alert) => {
          const coords = resolveAlertCoords(alert);
          if (!coords) return;

          const el = document.createElement('div');
          el.className = 'map-marker alert-marker';
          el.style.cssText = `
            width: 11px;
            height: 11px;
            background: #EF4444;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.6);
            cursor: pointer;
            box-shadow: 0 0 10px #EF4444;
          `;

          const popup = new maplibregl.Popup({ offset: 15 }).setHTML(`
            <div style="background: #0F172A; color: #F8FAFC; padding: 8px 12px; font-family: 'JetBrains Mono', monospace; font-size: 12px; border: 1px solid #EF4444; max-width: 260px;">
              <strong style="color: #EF4444; text-transform: uppercase;">Alert</strong><br/>
              <span style="color: #94A3B8; text-transform: uppercase; font-size: 10px;">${alert.type || 'general'} • ${alert.severity || 'info'}</span><br/>
              <strong style="color: #F8FAFC;">${alert.title || 'Untitled Alert'}</strong><br/>
              <span style="color: #94A3B8;">${alert.region || 'Pakistan'}${alert.source ? ` • ${alert.source}` : ''}</span>
            </div>
          `);

          const marker = new maplibregl.Marker({ element: el }).setLngLat(coords).setPopup(popup).addTo(mapRef.current);
          markerRefs.current.push(marker);
        });
      }
    };

    renderMarkers();
  }, [mapData, topAlerts, mapLoaded, showAlertsLayer]);

  return (
    <div className="map-container" data-testid="map-container">
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Map Overlay - Title */}
      <div className="map-overlay" data-testid="map-overlay">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: '#22C55E',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <Navigation size={16} />
          Pakistan Overview
        </div>
      </div>

      {/* Map Legend */}
      <div className="map-legend" data-testid="map-legend">
        <div className="legend-item">
          <span className="legend-dot capital"></span>
          <span>Capital</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot major"></span>
          <span>Major City</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot strategic"></span>
          <span>Strategic Port</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#EF4444' }}></span>
          <span>Alerts</span>
        </div>
        <button
          onClick={() => setShowAlertsLayer((prev) => !prev)}
          className="range-btn"
          style={{ marginTop: '0.35rem', fontSize: '0.62rem', padding: '0.2rem 0.45rem', width: '100%' }}
          data-testid="map-alert-layer-toggle"
        >
          <Bell size={12} style={{ marginRight: '0.3rem', display: 'inline' }} />
          Alerts Layer: {showAlertsLayer ? 'On' : 'Off'}
        </button>
      </div>

      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(2, 6, 23, 0.9)',
          padding: '1rem 2rem',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div className="spinner"></div>
          <span>Loading map data...</span>
        </div>
      )}
    </div>
  );
};

export default MapSection;
