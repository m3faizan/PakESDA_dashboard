import React, { useMemo, useState } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const TIME_RANGES = [
  { key: '6M', label: '6M', months: 6 },
  { key: '1Y', label: '1Y', months: 12 },
  { key: '2Y', label: '2Y', months: 24 },
  { key: '5Y', label: '5Y', months: 60 },
  { key: 'ALL', label: 'All', months: null }
];

const SPIModal = ({ isOpen, onClose, data, title }) => {
  const [selectedRange, setSelectedRange] = useState('2Y');
  const [showPctChange, setShowPctChange] = useState(false);

  const filteredData = useMemo(() => {
    if (!data?.history) return [];

    const history = [...data.history].sort((a, b) => new Date(a.date) - new Date(b.date));
    const range = TIME_RANGES.find(r => r.key === selectedRange);

    if (selectedRange === 'ALL' || !range?.months) {
      return history;
    }

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - range.months);
    return history.filter(item => new Date(item.date) >= cutoffDate);
  }, [data, selectedRange]);

  if (!isOpen) return null;

  const latest = data?.latest;
  const latestValue = latest?.value || 0;
  const primaryChange = data?.primary_change;
  const primaryChangePct = data?.primary_change_pct;
  const primaryLabel = data?.primary_change_label || 'Change';
  const isPositive = (primaryChange || 0) >= 0;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit'
    });
  };

  const minValue = Math.min(...filteredData.map(d => d.value), 0);
  const maxValue = Math.max(...filteredData.map(d => d.value), 0);

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="spi-modal-overlay">
      <div className="remittances-modal" onClick={(e) => e.stopPropagation()} data-testid="spi-modal">
        <div className="modal-header">
          <div className="modal-title" data-testid="spi-modal-title">
            <Activity size={20} />
            <span>{title || data?.name || 'SPI Data'}</span>
          </div>
          <button className="modal-close" onClick={onClose} data-testid="spi-modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-summary" data-testid="spi-modal-summary">
          <div className="summary-main">
            <div className="summary-value" data-testid="spi-summary-value">
              {latestValue.toFixed(2)}
            </div>
            <div className="summary-period" data-testid="spi-summary-period">
              <Calendar size={14} />
              {latest?.week_ending_formatted || latest?.month || 'N/A'}
            </div>
          </div>

          {(primaryChange !== null && primaryChange !== undefined) && (
            <div className="summary-changes">
              <div className={`summary-change ${isPositive ? 'positive' : 'negative'}`} data-testid="spi-summary-change">
                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{isPositive ? '+' : ''}{primaryChange.toFixed(2)} pts</span>
                {(primaryChangePct !== null && primaryChangePct !== undefined) && (
                  <span className="change-label">({isPositive ? '+' : ''}{primaryChangePct.toFixed(2)}%) {primaryLabel}</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="time-range-selector" data-testid="spi-time-range-selector">
          {TIME_RANGES.map((range) => (
            <button
              key={range.key}
              className={`range-btn ${selectedRange === range.key ? 'active' : ''}`}
              onClick={() => setSelectedRange(range.key)}
              data-testid={`spi-range-btn-${range.key}`}
            >
              {range.label}
            </button>
          ))}

          <button
            className={`range-btn ${showPctChange ? 'active' : ''}`}
            onClick={() => setShowPctChange(!showPctChange)}
            style={{ marginLeft: '1rem', borderLeft: '1px solid var(--color-border)', paddingLeft: '1rem' }}
            data-testid="spi-pct-toggle"
          >
            {showPctChange ? 'Value' : '% Change'}
          </button>
        </div>

        <div className="chart-container" data-testid="spi-chart-container">
          <ResponsiveContainer width="100%" height={300}>
            {showPctChange ? (
              <BarChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  tickFormatter={(val) => `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`}
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#1e293b' }}
                  tickLine={{ stroke: '#1e293b' }}
                  domain={['auto', 'auto']}
                  width={50}
                />
                <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const date = new Date(label);
                      const formattedDate = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                      const pct = payload[0].value || 0;
                      return (
                        <div className="remittances-tooltip">
                          <p className="tooltip-date">{formattedDate}</p>
                          <p className="tooltip-value" style={{ color: pct >= 0 ? '#22C55E' : '#EF4444' }}>
                            {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="pct_change" radius={[2, 2, 0, 0]}>
                  {filteredData.map((entry, index) => (
                    <Cell key={`spi-pct-cell-${index}`} fill={entry.pct_change >= 0 ? '#22C55E' : '#EF4444'} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSPI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
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
                  tickFormatter={(val) => val.toFixed(0)}
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#1e293b' }}
                  tickLine={{ stroke: '#1e293b' }}
                  domain={[Math.max(0, minValue * 0.98), maxValue * 1.02]}
                  width={50}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const point = payload[0]?.payload;
                      const date = new Date(label);
                      const formattedDate = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                      return (
                        <div className="remittances-tooltip">
                          <p className="tooltip-date">{formattedDate}</p>
                          <p className="tooltip-value" style={{ color: '#22C55E' }}>{(point?.value || 0).toFixed(2)}</p>
                          {(point?.pct_change !== null && point?.pct_change !== undefined) && (
                            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                              {point.pct_change >= 0 ? '+' : ''}{point.pct_change.toFixed(2)}%
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#colorSPI)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="modal-footer" data-testid="spi-modal-footer">
          <span className="data-source">Source: {data?.source || 'PakESDA SPI Sheet'}</span>
          <span className="data-updated">
            Last updated: {new Date(data?.updated || Date.now()).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SPIModal;