import React, { useState, useMemo } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

const TIME_RANGES = [
  { key: 'YTD', label: 'YTD', months: null },
  { key: '6M', label: '6M', months: 6 },
  { key: '1Y', label: '1Y', months: 12 },
  { key: '5Y', label: '5Y', months: 60 },
  { key: '10Y', label: '10Y', months: 120 },
  { key: 'ALL', label: 'All', months: null }
];

const SBPDataModal = ({ isOpen, onClose, data, title, icon: Icon = DollarSign }) => {
  const [selectedRange, setSelectedRange] = useState('1Y');

  const filteredData = useMemo(() => {
    if (!data?.history) return [];
    
    const history = [...data.history].reverse();
    const now = new Date();
    const currentYear = now.getFullYear();
    
    const range = TIME_RANGES.find(r => r.key === selectedRange);
    
    if (selectedRange === 'YTD') {
      return history.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getFullYear() === currentYear;
      });
    }
    
    if (selectedRange === 'ALL' || !range?.months) {
      return history;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - range.months);
    
    return history.filter(item => new Date(item.date) >= cutoffDate);
  }, [data, selectedRange]);

  const formatValue = (value) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}B`;
    }
    return `$${value.toFixed(0)}M`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      return (
        <div className="remittances-tooltip">
          <p className="tooltip-date">{formattedDate}</p>
          <p className="tooltip-value">{formatValue(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  const latest = data?.latest;
  const momChange = data?.mom_change || 0;
  const yoyChange = data?.yoy_change;
  const isMomPositive = momChange >= 0;
  const isYoyPositive = yoyChange >= 0;

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="sbp-modal-overlay">
      <div 
        className="remittances-modal" 
        onClick={(e) => e.stopPropagation()}
        data-testid="sbp-modal"
      >
        <div className="modal-header">
          <div className="modal-title">
            <Icon size={20} />
            <span>{title || data?.name || 'SBP Data'}</span>
          </div>
          <button 
            className="modal-close" 
            onClick={onClose}
            data-testid="sbp-modal-close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-summary">
          <div className="summary-main">
            <div className="summary-value">
              {formatValue(latest?.value || 0)}
            </div>
            <div className="summary-period">
              <Calendar size={14} />
              {latest?.month || 'N/A'}
            </div>
          </div>
          <div className="summary-changes">
            <div className={`summary-change ${isMomPositive ? 'positive' : 'negative'}`}>
              {isMomPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{isMomPositive ? '+' : ''}{momChange.toFixed(2)}%</span>
              <span className="change-label">MoM</span>
            </div>
            {yoyChange !== null && yoyChange !== undefined && (
              <div className={`summary-change ${isYoyPositive ? 'positive' : 'negative'}`}>
                {isYoyPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{isYoyPositive ? '+' : ''}{yoyChange.toFixed(2)}%</span>
                <span className="change-label">YoY</span>
              </div>
            )}
          </div>
        </div>

        <div className="time-range-selector" data-testid="time-range-selector">
          {TIME_RANGES.map((range) => (
            <button
              key={range.key}
              className={`range-btn ${selectedRange === range.key ? 'active' : ''}`}
              onClick={() => setSelectedRange(range.key)}
              data-testid={`range-btn-${range.key}`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="chart-container" data-testid="sbp-chart">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSBP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#1e293b' }}
                tickLine={{ stroke: '#1e293b' }}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis 
                tickFormatter={(val) => `$${(val/1000).toFixed(1)}B`}
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#1e293b' }}
                tickLine={{ stroke: '#1e293b' }}
                domain={[0, 'auto']}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#22C55E" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSBP)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="modal-footer">
          <span className="data-source">Source: State Bank of Pakistan</span>
          <span className="data-updated">
            Last updated: {new Date(data?.updated || Date.now()).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SBPDataModal;
