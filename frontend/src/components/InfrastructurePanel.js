import React from 'react';
import { Zap, Wifi, Plane, PlaneLanding, PlaneTakeoff, Anchor, Ship } from 'lucide-react';

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

  const airports = data.airport_status?.airports || {};
  const ports = data.port_status?.ports || {};

  return (
    <div className="panel" data-testid="infrastructure-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Zap size={16} />
          Infrastructure
        </div>
      </div>
      <div className="panel-content" style={{ maxHeight: '450px', overflowY: 'auto' }}>
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
            <span className="infra-label">Load Shedding</span>
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

        {/* Airport Status Section */}
        <div className="infra-section">
          <div className="infra-title">
            <Plane size={12} style={{ marginRight: '0.25rem' }} />
            Airport Status
            <span style={{ 
              fontSize: '0.5rem', 
              color: 'var(--color-muted)', 
              marginLeft: '0.5rem',
              fontWeight: 'normal'
            }}>
              ({data.airport_status?.note || '24 hours'})
            </span>
          </div>
          
          {Object.entries(airports).map(([key, airport]) => (
            <div key={key} className="infra-status" style={{ marginTop: '0.35rem' }}>
              <span className="infra-indicator good"></span>
              <span className="infra-label" style={{ minWidth: '40px' }}>{airport.code}</span>
              <span className="infra-value" style={{ display: 'flex', gap: '0.5rem', fontSize: '0.65rem' }}>
                <a 
                  href={airport.departures_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    color: 'var(--color-primary)', 
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.15rem'
                  }}
                  title="Departures"
                >
                  <PlaneTakeoff size={9} />
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
                    gap: '0.15rem'
                  }}
                  title="Arrivals"
                >
                  <PlaneLanding size={9} />
                  {airport.arrivals}
                </a>
              </span>
            </div>
          ))}
        </div>

        {/* Port Status Section */}
        <div className="infra-section">
          <div className="infra-title">
            <Anchor size={12} style={{ marginRight: '0.25rem' }} />
            Port Status
            <span style={{ 
              fontSize: '0.5rem', 
              color: 'var(--color-muted)', 
              marginLeft: '0.5rem',
              fontWeight: 'normal'
            }}>
              ({data.port_status?.note || '24 hours'})
            </span>
          </div>
          
          {Object.entries(ports).map(([key, port]) => (
            <div key={key} style={{ marginTop: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
              <a 
                href={port.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  color: 'var(--color-text)', 
                  textDecoration: 'none',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                data-testid={`${key}-port-link`}
              >
                <Ship size={10} color="var(--color-primary)" />
                {port.name}
              </a>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '0.25rem', 
                marginTop: '0.25rem',
                fontSize: '0.6rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--color-muted)' }}>In Port</div>
                  <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{port.in_port}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--color-muted)' }}>Arrivals</div>
                  <div style={{ color: '#3B82F6', fontWeight: 600 }}>{port.arrivals}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--color-muted)' }}>Departures</div>
                  <div style={{ color: '#F59E0B', fontWeight: 600 }}>{port.departures}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--color-muted)' }}>Expected</div>
                  <div style={{ color: '#8B5CF6', fontWeight: 600 }}>{port.expected}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfrastructurePanel;
