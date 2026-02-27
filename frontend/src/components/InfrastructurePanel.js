import React from 'react';
import { Zap, Wifi, Plane, Train } from 'lucide-react';

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
          <div className="infra-status" style={{ marginTop: '0.25rem' }}>
            <span className="infra-indicator warning"></span>
            <span className="infra-label">Capacity</span>
            <span className="infra-value">{data.power?.generation_capacity}</span>
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
          <div className="infra-status" style={{ marginTop: '0.25rem' }}>
            <span className="infra-indicator good"></span>
            <span className="infra-label">Avg Speed</span>
            <span className="infra-value">{data.internet?.average_speed}</span>
          </div>
        </div>

        {/* Transport Section */}
        <div className="infra-section">
          <div className="infra-title">
            <Plane size={12} style={{ marginRight: '0.25rem' }} />
            Transport
          </div>
          <div className="infra-status">
            <span className={`infra-indicator ${getIndicatorClass(data.transport?.airports?.islamabad)}`}></span>
            <span className="infra-label">ISB Airport</span>
            <span className="infra-value">{data.transport?.airports?.islamabad}</span>
          </div>
          <div className="infra-status" style={{ marginTop: '0.25rem' }}>
            <span className="infra-indicator good"></span>
            <span className="infra-label">LHE Airport</span>
            <span className="infra-value">
              <a 
                href={data.transport?.airports?.lahore?.departures_url || "https://www.flightstats.com/v2/flight-tracker/departures/LHE"}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  color: 'var(--color-primary)', 
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                data-testid="lahore-flights-link"
              >
                {data.transport?.airports?.lahore?.departures_today || 0} departures
                <Plane size={10} />
              </a>
            </span>
          </div>
          <div className="infra-status" style={{ marginTop: '0.25rem' }}>
            <span className={`infra-indicator ${getIndicatorClass(data.transport?.railways)}`}></span>
            <span className="infra-label">Railways</span>
            <span className="infra-value">{data.transport?.railways}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfrastructurePanel;
