import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Percent, ExternalLink } from 'lucide-react';
import axios from 'axios';
import CPIDataModal from './CPIDataModal';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

const InflationPanel = ({ loading: parentLoading }) => {
  const [cpiYoyData, setCpiYoyData] = useState(null);
  const [cpiMomData, setCpiMomData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [yoyRes, momRes, yoyHistRes, momHistRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/api/cpi-yoy`),
          axios.get(`${API_BASE}/api/cpi-mom`),
          axios.get(`${API_BASE}/api/cpi-yoy-historical`),
          axios.get(`${API_BASE}/api/cpi-mom-historical`)
        ]);

        if (yoyRes.status === 'fulfilled') {
          setCpiYoyData(yoyRes.value.data.data);
        }
        if (momRes.status === 'fulfilled') {
          setCpiMomData(momRes.value.data.data);
        }
        // Merge historical data with latest data
        if (yoyHistRes.status === 'fulfilled' && yoyHistRes.value.data.data) {
          setCpiYoyData(prev => ({
            ...prev,
            ...yoyHistRes.value.data.data,
            // Keep latest from regular endpoint if available
            latest: prev?.latest || yoyHistRes.value.data.data.latest
          }));
        }
        if (momHistRes.status === 'fulfilled' && momHistRes.value.data.data) {
          setCpiMomData(prev => ({
            ...prev,
            ...momHistRes.value.data.data,
            latest: prev?.latest || momHistRes.value.data.data.latest
          }));
        }
      } catch (error) {
        console.error('Error fetching CPI data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  if (parentLoading || dataLoading) {
    return (
      <div className="panel" data-testid="inflation-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Percent size={16} />
            Inflation Monitor
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
      label: 'CPI (YoY)',
      value: cpiYoyData?.latest?.value,
      subLabel: cpiYoyData?.latest?.month || '',
      change: cpiYoyData?.mom_change,
      description: 'Year-on-Year Inflation',
      clickable: true,
      modalKey: 'yoy',
      isLive: cpiYoyData !== null
    },
    {
      label: 'CPI (MoM)',
      value: cpiMomData?.latest?.value,
      subLabel: cpiMomData?.latest?.month || '',
      change: null,
      description: 'Month-on-Month Inflation',
      clickable: true,
      modalKey: 'mom',
      isLive: cpiMomData !== null
    }
  ];

  const handleItemClick = (item) => {
    if (item.clickable && item.modalKey) {
      setActiveModal(item.modalKey);
    }
  };

  const getModalData = () => {
    switch (activeModal) {
      case 'yoy':
        return { data: cpiYoyData, title: 'CPI Inflation (Year-on-Year)', type: 'yoy' };
      case 'mom':
        return { data: cpiMomData, title: 'CPI Inflation (Month-on-Month)', type: 'mom' };
      default:
        return null;
    }
  };

  const modalInfo = getModalData();

  // Determine if inflation is high (above 10% is concerning)
  const getInflationStatus = (value) => {
    if (value === null || value === undefined) return 'neutral';
    if (value > 10) return 'critical';
    if (value > 5) return 'warning';
    return 'good';
  };

  return (
    <div className="panel" data-testid="inflation-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Percent size={16} />
          Inflation Monitor
        </div>
        <span className="panel-badge">LIVE</span>
      </div>
      <div className="panel-content">
        <div className="inflation-grid">
          {indicators.map((item, index) => {
            const status = getInflationStatus(item.value);
            
            return (
              <div
                key={index}
                className={`inflation-item ${item.clickable ? 'clickable' : ''}`}
                data-testid={`inflation-item-${index}`}
                onClick={() => handleItemClick(item)}
                style={item.clickable ? { cursor: 'pointer' } : {}}
              >
                <div className="inflation-header">
                  <span className="inflation-label">
                    {item.label}
                    {item.clickable && (
                      <ExternalLink size={10} style={{ marginLeft: '4px', opacity: 0.6 }} />
                    )}
                    {item.isLive && (
                      <span className="live-dot" style={{
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#22C55E',
                        borderRadius: '50%',
                        display: 'inline-block',
                        marginLeft: '6px',
                        animation: 'pulse 2s infinite'
                      }}></span>
                    )}
                  </span>
                </div>
                <div className="inflation-value-container">
                  <span 
                    className={`inflation-value ${status}`}
                    style={{
                      color: 'var(--color-text)'
                    }}
                  >
                    {item.value !== null && item.value !== undefined ? (
                      <>
                        {item.value >= 0 ? '' : ''}{item.value}%
                      </>
                    ) : '--'}
                  </span>
                  {item.change !== null && item.change !== undefined && (
                    <span className={`inflation-change ${item.change >= 0 ? 'up' : 'down'}`}>
                      {item.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="inflation-sublabel">
                  {item.subLabel}
                </div>
                <div className="inflation-description">
                  {item.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalInfo && (
        <CPIDataModal
          isOpen={!!activeModal}
          onClose={() => setActiveModal(null)}
          data={modalInfo.data}
          title={modalInfo.title}
          type={modalInfo.type}
        />
      )}
    </div>
  );
};

export default InflationPanel;
