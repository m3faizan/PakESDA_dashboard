import React, { useEffect, useMemo, useState } from 'react';
import { X, Flame, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line
} from 'recharts';

const TIME_RANGES = [
  { key: '1Y', label: '1Y', months: 12 },
  { key: '2Y', label: '2Y', months: 24 },
  { key: '5Y', label: '5Y', months: 60 },
  { key: 'ALL', label: 'All', months: null }
];

const COLORS = ['#22C55E', '#38BDF8', '#F59E0B', '#A855F7', '#EC4899', '#14B8A6', '#F97316'];

const PolSalesModal = ({ isOpen, onClose, data, title }) => {
  const [selectedRange, setSelectedRange] = useState('ALL');
  const [visibleSeries, setVisibleSeries] = useState({ total: true });

  const categories = data?.categories || [];

  useEffect(() => {
    if (!isOpen) return;
    setSelectedRange('ALL');
    const next = { total: true };
    categories.forEach((cat) => {
      next[cat.key] = true;
    });
    setVisibleSeries(next);
  }, [isOpen, categories.length]);

  const filteredData = useMemo(() => {
    if (!data?.history) return [];
    const history = [...data.history].sort((a, b) => new Date(a.date) - new Date(b.date));
    const range = TIME_RANGES.find((r) => r.key === selectedRange);
    if (selectedRange === 'ALL' || !range?.months) return history;

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - range.months);
    return history.filter((item) => new Date(item.date) >= cutoffDate);
  }, [data, selectedRange]);

  if (!isOpen || !data) return null;

  const latest = data?.latest;
  const momChange = data?.mom_change_pct;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const toggleSeries = (key) => {
    setVisibleSeries((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (prev[key] && activeCount === 1) return prev;
      return { ...prev, [key]: !prev[key] };
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="pol-sales-modal-overlay">
      <div className="remittances-modal" onClick={(e) => e.stopPropagation()} data-testid="pol-sales-modal">
        <div className="modal-header">
          <div className="modal-title" data-testid="pol-sales-modal-title">
            <Flame size={20} />
            <span>{title || 'POL Sales by Sector'}</span>
          </div>
          <button className="modal-close" onClick={onClose} data-testid="pol-sales-modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-summary">
          <div className="summary-main">
            <div className="summary-value" data-testid="pol-sales-summary-value">{(latest?.total || 0).toLocaleString()}</div>
            <div className="summary-period" data-testid="pol-sales-summary-period">
              <Calendar size={14} />
              {latest?.month || 'N/A'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.15rem' }} data-testid="pol-sales-unit-label">
              Metric Ton
            </div>
          </div>
          {momChange !== null && momChange !== undefined && (
            <div className="summary-changes">
              <div className={`summary-change ${momChange >= 0 ? 'positive' : 'negative'}`} data-testid="pol-sales-summary-change">
                {momChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{momChange >= 0 ? '+' : ''}{momChange.toFixed(2)}%</span>
                <span className="change-label">MoM</span>
              </div>
            </div>
          )}
        </div>

        <div className="time-range-selector" data-testid="pol-sales-time-selector">
          {TIME_RANGES.map((range) => (
            <button
              key={range.key}
              className={`range-btn ${selectedRange === range.key ? 'active' : ''}`}
              onClick={() => setSelectedRange(range.key)}
              data-testid={`pol-sales-range-${range.key}`}
            >
              {range.label}
            </button>
          ))}
          <div style={{ width: '1px', height: '22px', background: 'var(--color-border)', margin: '0 0.3rem' }}></div>
          <button
            onClick={() => toggleSeries('total')}
            className={`range-btn ${visibleSeries.total !== false ? 'active' : ''}`}
            style={{ opacity: visibleSeries.total !== false ? 1 : 0.42, display: 'inline-flex', alignItems: 'center', gap: '0.28rem' }}
            data-testid="pol-sales-series-toggle-total"
          >
            <span style={{ width: '10px', height: '2px', background: '#FACC15', display: 'inline-block' }}></span>
            Total
          </button>
          {categories.map((series, idx) => {
            const active = visibleSeries[series.key] !== false;
            return (
              <button
                key={series.key}
                onClick={() => toggleSeries(series.key)}
                className={`range-btn ${active ? 'active' : ''}`}
                style={{ opacity: active ? 1 : 0.42, display: 'inline-flex', alignItems: 'center', gap: '0.28rem' }}
                data-testid={`pol-sales-series-toggle-${series.key}`}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[idx % COLORS.length], display: 'inline-block' }}></span>
                {series.label}
              </button>
            );
          })}
        </div>

        <div className="chart-container" data-testid="pol-sales-chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatDate} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} interval="preserveStartEnd" minTickGap={50} />
              <YAxis tickFormatter={(val) => `${val.toFixed(0)}`} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} width={55} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const date = new Date(label);
                    return (
                      <div className="remittances-tooltip" style={{ minWidth: '190px' }}>
                        <p className="tooltip-date">{date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                        {payload.map((entry) => (
                          <p key={entry.dataKey} style={{ color: entry.color, fontSize: '0.8rem', margin: '0.15rem 0' }}>
                            {entry.name}: {(entry.value || 0).toLocaleString()} Metric Ton
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {categories.map((series, idx) => (
                <Bar
                  key={series.key}
                  dataKey={series.key}
                  name={series.label}
                  stackId="a"
                  fill={COLORS[idx % COLORS.length]}
                  hide={visibleSeries[series.key] === false}
                />
              ))}
              <Line type="monotone" dataKey="total" name="Total" stroke="#FACC15" strokeWidth={3} dot={false} connectNulls hide={visibleSeries.total === false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="modal-footer" data-testid="pol-sales-modal-footer">
          <span className="data-source">Source: {data?.source || 'State Bank of Pakistan / PBS'}</span>
          <span className="data-updated">
            <span style={{ marginRight: '0.8rem', color: '#94a3b8' }}>Unit: Metric Ton</span>
            Last updated: {new Date(data?.updated || Date.now()).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PolSalesModal;
