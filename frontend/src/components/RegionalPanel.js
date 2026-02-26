import React from 'react';
import { Users, ArrowRight } from 'lucide-react';

const RegionalPanel = ({ relations, loading }) => {
  const getStatusClass = (sentiment) => {
    if (sentiment > 0.5) return 'positive';
    if (sentiment < 0) return 'negative';
    return 'neutral';
  };

  const countries = relations ? Object.entries(relations).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
    status: value.status,
    sentiment: value.sentiment
  })) : [];

  return (
    <div className="panel" data-testid="regional-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Users size={16} />
          Regional Relations
        </div>
      </div>
      <div className="panel-content">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : countries.length === 0 ? (
          <div className="loading">No data available</div>
        ) : (
          countries.map((country, index) => (
            <div key={index} className="regional-item" data-testid={`regional-item-${index}`}>
              <div className="regional-country">
                <ArrowRight size={12} style={{ marginRight: '0.5rem', opacity: 0.5 }} />
                {country.name}
              </div>
              <div className={`regional-status ${getStatusClass(country.sentiment)}`}>
                {country.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RegionalPanel;
