import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const EconomicPanel = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="panel" data-testid="economic-panel">
        <div className="panel-header">
          <div className="panel-title">
            <DollarSign size={16} />
            Economic Indicators
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

  const indicators = [
    { 
      label: 'PKR/USD', 
      value: data.pkr_usd?.rate?.toFixed(2), 
      change: data.pkr_usd?.change_percent,
      prefix: '₨'
    },
    { 
      label: 'PKR/EUR', 
      value: data.pkr_eur?.rate?.toFixed(2), 
      change: data.pkr_eur?.change_percent,
      prefix: '₨'
    },
    { 
      label: 'KSE-100', 
      value: data.psx_kse100?.value?.toLocaleString(), 
      change: data.psx_kse100?.change_percent,
      prefix: ''
    },
    { 
      label: 'CPI Inflation', 
      value: data.inflation?.cpi + '%', 
      change: null,
      prefix: ''
    },
    { 
      label: 'Forex Reserves', 
      value: '$' + data.forex_reserves?.value + 'B', 
      change: data.forex_reserves?.change > 0 ? 2.3 : -2.3,
      prefix: ''
    },
    { 
      label: 'Remittances', 
      value: '$' + data.remittances?.monthly + 'B/m', 
      change: data.remittances?.change_percent,
      prefix: ''
    },
  ];

  return (
    <div className="panel" data-testid="economic-panel">
      <div className="panel-header">
        <div className="panel-title">
          <DollarSign size={16} />
          Economic Indicators
        </div>
        <span className="panel-badge">LIVE</span>
      </div>
      <div className="panel-content">
        <div className="economic-grid">
          {indicators.map((item, index) => (
            <div key={index} className="economic-item" data-testid={`economic-item-${index}`}>
              <div className="economic-label">{item.label}</div>
              <div className="economic-value">{item.prefix}{item.value}</div>
              {item.change !== null && (
                <div className={`economic-change ${item.change >= 0 ? 'positive' : 'negative'}`}>
                  {item.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(item.change).toFixed(2)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EconomicPanel;
