import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

const MapSection = ({ mapData, loading }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Dynamic import of maplibre-gl
    const loadMap = async () => {
      if (!mapContainerRef.current || mapRef.current) return;

      try {
        const maplibregl = (await import('maplibre-gl')).default;
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
            layers: [
              {
                id: 'carto-dark-layer',
                type: 'raster',
                source: 'carto-dark',
                minzoom: 0,
                maxzoom: 22
              }
            ]
          },
          center: [69.3451, 30.3753], // Pakistan center
          zoom: 5,
          attributionControl: false
        });

        map.addControl(new maplibregl.NavigationControl(), 'top-right');
        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

        map.on('load', () => {
          setMapLoaded(true);
          mapRef.current = map;

          // Add markers for cities if mapData is available
          if (mapData?.cities) {
            mapData.cities.forEach((city) => {
              const el = document.createElement('div');
              el.className = 'map-marker';
              el.style.cssText = `
                width: 12px;
                height: 12px;
                background: ${city.type === 'capital' ? '#22C55E' : city.type === 'strategic' ? '#F59E0B' : '#3B82F6'};
                border-radius: 50%;
                border: 2px solid rgba(255,255,255,0.5);
                cursor: pointer;
                box-shadow: 0 0 10px ${city.type === 'capital' ? '#22C55E' : city.type === 'strategic' ? '#F59E0B' : '#3B82F6'};
              `;

              const popup = new maplibregl.Popup({ offset: 15 })
                .setHTML(`
                  <div style="background: #0F172A; color: #F8FAFC; padding: 8px 12px; font-family: 'JetBrains Mono', monospace; font-size: 12px; border: 1px solid #22C55E;">
                    <strong style="color: #22C55E;">${city.name}</strong><br/>
                    <span style="color: #94A3B8;">Population: ${city.population}</span><br/>
                    <span style="color: #94A3B8; text-transform: uppercase; font-size: 10px;">${city.type}</span>
                  </div>
                `);

              new maplibregl.Marker({ element: el })
                .setLngLat([city.lon, city.lat])
                .setPopup(popup)
                .addTo(map);
            });
          }
        });

      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    loadMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when mapData changes
  useEffect(() => {
    const addMarkers = async () => {
      if (mapRef.current && mapData?.cities && mapLoaded) {
        // Clear existing markers and add new ones
        const markers = document.querySelectorAll('.map-marker');
        markers.forEach(m => m.parentElement?.remove());

        try {
          const maplibregl = (await import('maplibre-gl')).default;

          mapData.cities.forEach((city) => {
            const el = document.createElement('div');
            el.className = 'map-marker';
            el.style.cssText = `
              width: 12px;
              height: 12px;
              background: ${city.type === 'capital' ? '#22C55E' : city.type === 'strategic' ? '#F59E0B' : '#3B82F6'};
              border-radius: 50%;
              border: 2px solid rgba(255,255,255,0.5);
              cursor: pointer;
              box-shadow: 0 0 10px ${city.type === 'capital' ? '#22C55E' : city.type === 'strategic' ? '#F59E0B' : '#3B82F6'};
            `;

            const popup = new maplibregl.Popup({ offset: 15 })
              .setHTML(`
                <div style="background: #0F172A; color: #F8FAFC; padding: 8px 12px; font-family: 'JetBrains Mono', monospace; font-size: 12px; border: 1px solid #22C55E;">
                  <strong style="color: #22C55E;">${city.name}</strong><br/>
                  <span style="color: #94A3B8;">Population: ${city.population}</span><br/>
                  <span style="color: #94A3B8; text-transform: uppercase; font-size: 10px;">${city.type}</span>
                </div>
              `);

            new maplibregl.Marker({ element: el })
              .setLngLat([city.lon, city.lat])
              .setPopup(popup)
              .addTo(mapRef.current);
          });
        } catch (error) {
          console.error('Error adding map markers:', error);
        }
      }
    };

    addMarkers();
  }, [mapData, mapLoaded]);

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
