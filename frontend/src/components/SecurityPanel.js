import React from 'react';
import { Shield, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const SecurityPanel = ({ alerts, loading }) => {
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <AlertCircle size={14} color="#EF4444" />;
      case 'medium':
        return <AlertTriangle size={14} color="#F59E0B" />;
      case 'low':
        return <Info size={14} color="#22C55E" />;
      default:
        return <Info size={14} color="#3B82F6" />;
    }
  };

  return (
    <div className="panel" data-testid="security-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Shield size={16} />
          Security & Politics
        </div>
        <span className="panel-badge">{alerts.length} alerts</span>
      </div>
      <div className="panel-content">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="loading">No alerts</div>
        ) : (
          alerts.map((alert, index) => (
            <div 
              key={index} 
              className={`security-alert ${alert.severity}`}
              data-testid={`security-alert-${index}`}
            >
              <div className="alert-type" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {getSeverityIcon(alert.severity)}
                {alert.type}
              </div>
              <div className="alert-title">{alert.title}</div>
              <div className="alert-region">{alert.region}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SecurityPanel;
