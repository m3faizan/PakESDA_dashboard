import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ExternalLink, Coins, ArrowLeftRight } from 'lucide-react';
import axios from 'axios';
import SBPDataModal from './SBPDataModal';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

const EconomicPanel = ({ data, loading }) => {
  const [remittancesData, setRemittancesData] = useState(null);
  const [goldData, setGoldData] = useState(null);
  const [forexData, setForexData] = useState(null);
  const [currentAccountData, setCurrentAccountData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [remittancesRes, goldRes, forexRes, currentAccountRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/api/remittances`),
          axios.get(`${API_BASE}/api/gold-reserves`),
          axios.get(`${API_BASE}/api/forex-reserves`),
          axios.get(`${API_BASE}/api/current-account`)
        ]);

        if (remittancesRes.status === 'fulfilled') {
          setRemittancesData(remittancesRes.value.data.data);
        }
        if (goldRes.status === 'fulfilled') {
          setGoldData(goldRes.value.data.data);
        }
        if (forexRes.status === 'fulfilled') {
          setForexData(forexRes.value.data.data);
        }
        if (currentAccountRes.status === 'fulfilled') {
          setCurrentAccountData(currentAccountRes.value.data.data);
        }
      } catch (error) {
        console.error('Error fetching economic data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchAllData();
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

  // Format value in billions/millions
  const formatBillions = (value) => {
    if (value === null || value === undefined) return '$--';
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(2)}B`;
    }
    return `$${value.toFixed(0)}M`;
  };

  // Format current account (can be negative)
  const formatCurrentAccount = (value) => {
    if (value === null || value === undefined) return '$--';
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}$${value.toFixed(0)}M`;
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
      label: 'Current A/C', 
      value: formatCurrentAccount(currentAccountData?.latest?.value),
      subLabel: currentAccountData?.latest?.month || '',
      change: currentAccountData?.mom_change,
      prefix: '',
      clickable: true,
      modalKey: 'currentAccount',
      isLive: !dataLoading && currentAccountData,
      isCurrentAccount: true,
      rawValue: currentAccountData?.latest?.value
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
      label: 'Gold Reserves', 
      value: formatBillions(goldData?.latest?.value),
      subLabel: goldData?.latest?.month || '',
      change: goldData?.mom_change,
      prefix: '',
      clickable: true,
      modalKey: 'gold',
      isLive: !dataLoading && goldData
    },
    { 
      label: 'Forex Reserves', 
      value: formatBillions(forexData?.latest?.value),
      subLabel: forexData?.latest?.month || '',
      change: forexData?.mom_change,
      prefix: '',
      clickable: true,
      modalKey: 'forex',
      isLive: !dataLoading && forexData
    },
    { 
      label: 'Remittances', 
      value: formatBillions(remittancesData?.latest?.value),
      subLabel: remittancesData?.latest?.month || '',
      change: remittancesData?.mom_change,
      prefix: '',
      clickable: true,
      modalKey: 'remittances',
      isLive: !dataLoading && remittancesData
    },
  ];

  const handleItemClick = (item) => {
    if (item.clickable && item.modalKey) {
      setActiveModal(item.modalKey);
    }
  };

  const getModalData = () => {
    switch (activeModal) {
      case 'remittances':
        return { data: remittancesData, title: "Workers' Remittances", icon: DollarSign };
      case 'gold':
        return { data: goldData, title: "Gold Reserves", icon: Coins };
      case 'forex':
        return { data: forexData, title: "Total Forex Reserves", icon: DollarSign };
      case 'currentAccount':
        return { data: currentAccountData, title: "Current Account Balance", icon: ArrowLeftRight, isCurrentAccount: true };
      default:
        return null;
    }
  };

  const modalInfo = getModalData();

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
        <div className="economic-grid economic-grid-7">
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
              <div className="economic-value" style={item.isCurrentAccount ? { color: item.rawValue >= 0 ? '#22C55E' : '#EF4444' } : {}}>{item.prefix}{item.value}</div>
              {item.change !== null && item.change !== undefined && (
                <div className={`economic-change ${item.isCurrentAccount ? (item.change >= 0 ? 'positive' : 'negative') : (item.change >= 0 ? 'positive' : 'negative')}`}>
                  {item.isCurrentAccount ? (
                    <>
                      {item.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(0)}M
                    </>
                  ) : (
                    <>
                      {item.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {Math.abs(item.change).toFixed(2)}%
                    </>
                  )}
                </div>
              )}
              {item.subLabel && (
                <div className="economic-sublabel" style={{ 
                  position: 'absolute',
                  bottom: '0.5rem',
                  right: '0.5rem',
                  fontSize: '0.55rem', 
                  color: 'var(--color-muted)',
                }}>
                  {item.subLabel}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {modalInfo && (
        <SBPDataModal 
          isOpen={!!activeModal} 
          onClose={() => setActiveModal(null)} 
          data={modalInfo.data}
          title={modalInfo.title}
          icon={modalInfo.icon}
          isCurrentAccount={modalInfo.isCurrentAccount}
        />
      )}
    </div>
  );
};

export default EconomicPanel;
