import React from 'react';
import { Zap, Wifi, Plane, PlaneLanding, PlaneTakeoff } from 'lucide-react';

const InfrastructurePanel = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="panel" data-testid="infrastructure-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Zap size={16} />
            Infrastructure
          </div>
        </div>
        <div className="panel-content">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  const getIndicatorClass = (status) => {
    if (status === 'Operational' || status === 'Stable' || status === 'Normal Operations' || status === 'Clear') {
      return 'good';
    }
    if (status && status.includes('hours')) {
      return 'warning';
    }
    return 'good';
  };

  const airports = data.air_transport?.airports || {};

  return (
    <div className="panel" data-testid="infrastructure-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Zap size={16} />
          Infrastructure
        </div>
      </div>
      <div className="panel-content">
        {/* Power Section */}
        <div className="infra-section">
          <div className="infra-title">
            <Zap size={12} style={{ marginRight: '0.25rem' }} />
            Power Grid
          </div>
          <div className="infra-status">
            <span className={`infra-indicator ${getIndicatorClass(data.power?.national_grid_status)}`}></span>
            <span className="infra-label">National Grid</span>
            <span className="infra-value">{data.power?.national_grid_status}</span>
          </div>
          <div className="infra-status" style={{ marginTop: '0.25rem' }}>
            <span className="infra-indicator warning"></span>
            <span className="infra-label">Load Shedding (Urban)</span>
            <span className="infra-value">{data.power?.load_shedding?.urban}</span>
          </div>
        </div>

        {/* Internet Section */}
        <div className="infra-section">
          <div className="infra-title">
            <Wifi size={12} style={{ marginRight: '0.25rem' }} />
            Internet
          </div>
          <div className="infra-status">
            <span className={`infra-indicator ${getIndicatorClass(data.internet?.national_status)}`}></span>
            <span className="infra-label">Status</span>
            <span className="infra-value">{data.internet?.national_status}</span>
          </div>
        </div>

        {/* Air Transport Section */}
        <div className="infra-section">
          <div className="infra-title">
            <Plane size={12} style={{ marginRight: '0.25rem' }} />
            Air Transport
            <span style={{ 
              fontSize: '0.5rem', 
              color: 'var(--color-muted)', 
              marginLeft: '0.5rem',
              fontWeight: 'normal'
            }}>
              (last 24 hours)
            </span>
          </div>
          
          {Object.entries(airports).map(([key, airport]) => (
            <div key={key} className="infra-status" style={{ marginTop: '0.5rem' }}>
              <span className="infra-indicator good"></span>
              <span className="infra-label" style={{ minWidth: '50px' }}>{airport.code}</span>
              <span className="infra-value" style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem' }}>
                <a 
                  href={airport.departures_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    color: 'var(--color-primary)', 
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                  data-testid={`${key}-departures-link`}
                >
                  <PlaneTakeoff size={10} />
                  {airport.departures}
                </a>
                <a 
                  href={airport.arrivals_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#3B82F6', 
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                  data-testid={`${key}-arrivals-link`}
                >
                  <PlaneLanding size={10} />
                  {airport.arrivals}
                </a>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfrastructurePanel;
