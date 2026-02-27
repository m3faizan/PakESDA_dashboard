import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ExternalLink } from 'lucide-react';
import axios from 'axios';
import RemittancesModal from './RemittancesModal';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

const EconomicPanel = ({ data, loading }) => {
  const [remittancesData, setRemittancesData] = useState(null);
  const [remittancesLoading, setRemittancesLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchRemittances = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/remittances`);
        setRemittancesData(response.data.data);
      } catch (error) {
        console.error('Error fetching remittances:', error);
      } finally {
        setRemittancesLoading(false);
      }
    };

    fetchRemittances();
  }, []);

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

  // Format remittance value for display
  const formatRemittanceValue = () => {
    if (remittancesLoading || !remittancesData?.latest) {
      return '$--';
    }
    const value = remittancesData.latest.value;
    // Value is in millions, convert to billions for display
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}B`;
    }
    return `$${value.toFixed(0)}M`;
  };

  const getRemittanceChange = () => {
    if (remittancesLoading || !remittancesData) {
      return null;
    }
    return remittancesData.mom_change;
  };

  const indicators = [
    { 
      label: 'PKR/USD', 
      value: data.pkr_usd?.rate?.toFixed(2), 
      change: data.pkr_usd?.change_percent,
      prefix: '₨',
      clickable: false
    },
    { 
      label: 'PKR/EUR', 
      value: data.pkr_eur?.rate?.toFixed(2), 
      change: data.pkr_eur?.change_percent,
      prefix: '₨',
      clickable: false
    },
    { 
      label: 'KSE-100', 
      value: data.psx_kse100?.value?.toLocaleString(), 
      change: data.psx_kse100?.change_percent,
      prefix: '',
      clickable: false
    },
    { 
      label: 'CPI Inflation', 
      value: data.inflation?.cpi + '%', 
      change: null,
      prefix: '',
      clickable: false
    },
    { 
      label: 'Forex Reserves', 
      value: '$' + data.forex_reserves?.value + 'B', 
      change: data.forex_reserves?.change > 0 ? 2.3 : -2.3,
      prefix: '',
      clickable: false
    },
    { 
      label: 'Remittances', 
      value: formatRemittanceValue(),
      subLabel: remittancesData?.latest?.month || '',
      change: getRemittanceChange(),
      prefix: '',
      clickable: true,
      isLive: !remittancesLoading && remittancesData
    },
  ];

  const handleItemClick = (item) => {
    if (item.label === 'Remittances' && item.clickable) {
      setShowModal(true);
    }
  };

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
            <div 
              key={index} 
              className={`economic-item ${item.clickable ? 'clickable' : ''}`} 
              data-testid={`economic-item-${index}`}
              onClick={() => handleItemClick(item)}
              style={item.clickable ? { cursor: 'pointer', position: 'relative' } : {}}
            >
              <div className="economic-label">
                {item.label}
                {item.clickable && (
                  <ExternalLink size={10} style={{ marginLeft: '4px', opacity: 0.6 }} />
                )}
                {item.isLive && (
                  <span className="live-indicator" style={{ 
                    width: '6px', 
                    height: '6px', 
                    backgroundColor: '#22C55E', 
                    borderRadius: '50%', 
                    display: 'inline-block',
                    marginLeft: '6px',
                    animation: 'pulse 2s infinite'
                  }}></span>
                )}
              </div>
              <div className="economic-value">{item.prefix}{item.value}</div>
              {item.change !== null && (
                <div className={`economic-change ${item.change >= 0 ? 'positive' : 'negative'}`}>
                  {item.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(item.change).toFixed(2)}%
                </div>
              )}
              {item.subLabel && (
                <div className="economic-sublabel" style={{ 
                  position: 'absolute',
                  bottom: '0.5rem',
                  right: '0.5rem',
                  fontSize: '0.6rem', 
                  color: 'var(--color-muted)',
                }}>
                  {item.subLabel}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <RemittancesModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        data={remittancesData}
      />
    </div>
  );
};

export default EconomicPanel;
