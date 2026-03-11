import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ExternalLink, Coins, ArrowLeftRight, ArrowDownToLine, ArrowUpFromLine, Banknote, BarChart3, Droplets, Landmark } from 'lucide-react';
import axios from 'axios';
import SBPDataModal from './SBPDataModal';
import PSXDataModal from './PSXDataModal';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

const EconomicPanel = ({ data, loading }) => {
  const [remittancesData, setRemittancesData] = useState(null);
  const [goldData, setGoldData] = useState(null);
  const [forexData, setForexData] = useState(null);
  const [currentAccountData, setCurrentAccountData] = useState(null);
  const [importsData, setImportsData] = useState(null);
  const [exportsData, setExportsData] = useState(null);
  const [pkrUsdData, setPkrUsdData] = useState(null);
  const [psxData, setPsxData] = useState(null);
  const [liquidForexData, setLiquidForexData] = useState(null);
  const [govDebtData, setGovDebtData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [remittancesRes, goldRes, forexRes, currentAccountRes, importsRes, exportsRes, pkrUsdRes, psxRes, liquidForexRes, govDebtRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/api/remittances`),
          axios.get(`${API_BASE}/api/gold-reserves`),
          axios.get(`${API_BASE}/api/forex-reserves`),
          axios.get(`${API_BASE}/api/current-account`),
          axios.get(`${API_BASE}/api/imports`),
          axios.get(`${API_BASE}/api/exports`),
          axios.get(`${API_BASE}/api/pkr-usd`),
          axios.get(`${API_BASE}/api/psx-data`),
          axios.get(`${API_BASE}/api/liquid-forex`),
          axios.get(`${API_BASE}/api/gov-debt`)
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
        if (importsRes.status === 'fulfilled') {
          setImportsData(importsRes.value.data.data);
        }
        if (exportsRes.status === 'fulfilled') {
          setExportsData(exportsRes.value.data.data);
        }
        if (pkrUsdRes.status === 'fulfilled') {
          setPkrUsdData(pkrUsdRes.value.data.data);
        }
        if (psxRes.status === 'fulfilled') {
          setPsxData(psxRes.value.data.data);
        }
        if (liquidForexRes.status === 'fulfilled') {
          setLiquidForexData(liquidForexRes.value.data.data);
        }
        if (govDebtRes.status === 'fulfilled') {
          setGovDebtData(govDebtRes.value.data.data);
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

  const formatDebtBillions = (value) => {
    if (value === null || value === undefined) return '₨--';
    return `₨${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}B`;
  };

  const indicators = [
    { 
      label: 'PKR/USD', 
      value: pkrUsdData?.latest?.value?.toFixed(2) || '--',
      subLabel: pkrUsdData?.latest?.dateFormatted || '',
      change: pkrUsdData?.daily_change,
      prefix: '₨',
      clickable: true,
      modalKey: 'pkrUsd',
      isLive: !dataLoading && pkrUsdData,
      isPkrUsd: true
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
      value: psxData?.value?.toLocaleString() || data?.psx_kse100?.value?.toLocaleString() || '--', 
      change: psxData?.change_percent || data?.psx_kse100?.change_percent,
      prefix: '',
      clickable: true,
      modalKey: 'psx',
      isLive: !dataLoading && psxData
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
      label: 'Imports', 
      value: formatBillions(importsData?.latest?.value),
      subLabel: importsData?.latest?.month || '',
      change: importsData?.mom_change,
      prefix: '',
      clickable: true,
      modalKey: 'imports',
      isLive: !dataLoading && importsData,
      isImports: true  // Inverse color logic: decrease is good
    },
    { 
      label: 'Exports', 
      value: formatBillions(exportsData?.latest?.value),
      subLabel: exportsData?.latest?.month || '',
      change: exportsData?.mom_change,
      prefix: '',
      clickable: true,
      modalKey: 'exports',
      isLive: !dataLoading && exportsData
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
    { 
      label: 'Gov. Debt',
      value: formatDebtBillions(govDebtData?.latest?.value),
      subLabel: govDebtData?.latest?.month || '',
      change: govDebtData?.mom_change,
      prefix: '',
      clickable: true,
      modalKey: 'govDebt',
      isLive: !dataLoading && govDebtData,
      isGovDebt: true
    },
    {
      label: 'Liquid FX', 
      value: formatBillions(liquidForexData?.latest?.value),
      subLabel: liquidForexData?.latest?.dateFormatted || '',
      change: liquidForexData?.wow_change_pct,
      prefix: '',
      clickable: true,
      modalKey: 'liquidForex',
      isLive: !dataLoading && liquidForexData,
      isWeekly: true
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
        return { data: forexData, title: "Total Forex Reserves", icon: DollarSign, isForexReserves: true };
      case 'currentAccount':
        return { data: currentAccountData, title: "Current Account Balance", icon: ArrowLeftRight, isCurrentAccount: true };
      case 'imports':
        return { data: importsData, title: "Imports (Goods & Services)", icon: ArrowDownToLine };
      case 'exports':
        return { data: exportsData, title: "Exports (Goods & Services)", icon: ArrowUpFromLine };
      case 'pkrUsd':
        return { data: pkrUsdData, title: "PKR/USD Exchange Rate", icon: Banknote, isPkrUsd: true };
      case 'psx':
        return { data: psxData, title: "KSE-100 Index", icon: BarChart3, isPsx: true };
      case 'liquidForex':
        return { data: liquidForexData, title: "Liquid Foreign Exchange Reserves", icon: Droplets, isLiquidForex: true };
      case 'govDebt':
        return { data: govDebtData, title: "Central Government Debt", icon: Landmark, isGovDebt: true };
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
        <div className="economic-grid economic-grid-9">
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
              {item.change !== null && item.change !== undefined && (
                <div className={`economic-change ${
                  item.isImports 
                    ? (item.change <= 0 ? 'positive' : 'negative')  // Imports: decrease is good
                    : item.isGovDebt
                      ? (item.change <= 0 ? 'positive' : 'negative')  // Gov debt: decrease is good
                    : item.isCurrentAccount 
                      ? (item.change >= 0 ? 'positive' : 'negative')
                      : (item.change >= 0 ? 'positive' : 'negative')
                }`}>
                  {item.isCurrentAccount ? (
                    <>
                      {item.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(0)}M
                    </>
                  ) : item.isImports ? (
                    <>
                      {item.change <= 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                      {Math.abs(item.change).toFixed(2)}%
                    </>
                  ) : item.isGovDebt ? (
                    <>
                      {item.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {Math.abs(item.change).toFixed(2)}%
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
                <div className="economic-sublabel">
                  {item.subLabel}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {modalInfo && !modalInfo.isPsx && (
        <SBPDataModal 
          isOpen={!!activeModal} 
          onClose={() => setActiveModal(null)} 
          data={modalInfo.data}
          title={modalInfo.title}
          icon={modalInfo.icon}
          isCurrentAccount={modalInfo.isCurrentAccount}
          isPkrUsd={modalInfo.isPkrUsd}
          isForexReserves={modalInfo.isForexReserves}
          isLiquidForex={modalInfo.isLiquidForex}
          isGovDebt={modalInfo.isGovDebt}
        />
      )}

      {modalInfo && modalInfo.isPsx && (
        <PSXDataModal 
          isOpen={!!activeModal} 
          onClose={() => setActiveModal(null)} 
          data={modalInfo.data}
        />
      )}
    </div>
  );
};

export default EconomicPanel;
