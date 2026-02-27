import React, { useState, useEffect, useCallback } from 'react';
import { 
  Globe, 
  Newspaper, 
  TrendingUp, 
  Shield, 
  Cloud, 
  Users, 
  Zap,
  RefreshCw,
  Clock,
  MapPin
} from 'lucide-react';
import axios from 'axios';
import NewsPanel from './components/NewsPanel';
import EconomicPanel from './components/EconomicPanel';
import SecurityPanel from './components/SecurityPanel';
import WeatherPanel from './components/WeatherPanel';
import RegionalPanel from './components/RegionalPanel';
import InfrastructurePanel from './components/InfrastructurePanel';
import MapSection from './components/MapSection';
import NewsTicker from './components/NewsTicker';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

function App() {
  const [news, setNews] = useState([]);
  const [economic, setEconomic] = useState(null);
  const [security, setSecurity] = useState([]);
  const [weather, setWeather] = useState([]);
  const [regional, setRegional] = useState(null);
  const [infrastructure, setInfrastructure] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [newsRes, energyRes, economicRes, securityRes, weatherRes, regionalRes, infraRes, mapRes] = 
        await Promise.allSettled([
          axios.get(`${API_BASE}/api/news`),
          axios.get(`${API_BASE}/api/energy`),
          axios.get(`${API_BASE}/api/economic`),
          axios.get(`${API_BASE}/api/security`),
          axios.get(`${API_BASE}/api/weather`),
          axios.get(`${API_BASE}/api/regional`),
          axios.get(`${API_BASE}/api/infrastructure`),
          axios.get(`${API_BASE}/api/map-data`)
        ]);

      if (newsRes.status === 'fulfilled') setNews(newsRes.value.data.news || []);
      if (energyRes.status === 'fulfilled') setEnergy(energyRes.value.data.news || []);
      if (economicRes.status === 'fulfilled') setEconomic(economicRes.value.data.data);
      if (securityRes.status === 'fulfilled') setSecurity(securityRes.value.data.alerts || []);
      if (weatherRes.status === 'fulfilled') setWeather(weatherRes.value.data.cities || []);
      if (regionalRes.status === 'fulfilled') setRegional(regionalRes.value.data.relations);
      if (infraRes.status === 'fulfilled') setInfrastructure(infraRes.value.data);
      if (mapRes.status === 'fulfilled') setMapData(mapRes.value.data);

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    });
  };

  return (
    <div className="app-container" data-testid="app-container">
      {/* Header */}
      <header className="header" data-testid="header">
        <div className="header-left">
          <div className="header-logo">
            <Globe size={28} />
            <h1 className="header-title">
              <span>Pakistan</span> Intelligence Monitor
            </h1>
          </div>
          <div className="header-status">
            <span className="status-dot"></span>
            <span>LIVE</span>
          </div>
        </div>
        <div className="header-right">
          <div className="header-time" data-testid="header-time">
            <Clock size={14} style={{ marginRight: '0.5rem', display: 'inline' }} />
            {formatDate(currentTime)} | {formatTime(currentTime)} PKT
          </div>
          <button 
            onClick={fetchData} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--color-primary)', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            data-testid="refresh-button"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      {/* News Ticker */}
      <NewsTicker news={news} />

      {/* Main Content */}
      <main className="main-content" data-testid="main-content">
        <div className="bento-grid">
          {/* Map Section */}
          <div className="map-section" data-testid="map-section">
            <MapSection mapData={mapData} loading={loading} />
          </div>

          {/* Side Panels */}
          <div className="side-panels">
            <NewsPanel news={news} loading={loading} />
            <SecurityPanel alerts={security} loading={loading} />
          </div>

          {/* Bottom Panels */}
          <div className="bottom-panels" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            <EconomicPanel data={economic} loading={loading} />
            <EnergyPanel news={energy} loading={loading} />
            <WeatherPanel cities={weather} loading={loading} />
            <RegionalPanel relations={regional} loading={loading} />
            <InfrastructurePanel data={infrastructure} loading={loading} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        padding: '0.5rem 1rem', 
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem',
        color: 'var(--color-muted)'
      }} data-testid="footer">
        <span>Pakistan Intelligence Monitor v1.0.0</span>
        {lastUpdate && (
          <span>Last updated: {formatTime(lastUpdate)}</span>
        )}
      </footer>
    </div>
  );
}

export default App;
