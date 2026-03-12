import React, { useMemo, useState } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, Factory } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const TIME_RANGES = [
  { key: 'YTD', label: 'YTD', months: null },
  { key: '1Y', label: '1Y', months: 12 },
  { key: '2Y', label: '2Y', months: 24 },
  { key: '5Y', label: '5Y', months: 60 },
  { key: '10Y', label: '10Y', months: 120 },
  { key: '20Y', label: '20Y', months: 240 },
  { key: 'ALL', label: 'All', months: null }
];

const LSMDataModal = ({ isOpen, onClose, data, title }) => {
  const [selectedRange, setSelectedRange] = useState('10Y');

  const filteredData = useMemo(() => {
    if (!data?.history) return [];

    const history = [...data.history].sort((a, b) => new Date(a.date) - new Date(b.date));
    const now = new Date();
    const currentYear = now.getFullYear();
    const range = TIME_RANGES.find((r) => r.key === selectedRange);

    if (selectedRange === 'YTD') {
      return history.filter((item) => new Date(item.date).getFullYear() === currentYear);
    }

    if (selectedRange === 'ALL' || !range?.months) {
      return history;
    }

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - range.months);
    return history.filter((item) => new Date(item.date) >= cutoffDate);
  }, [data, selectedRange]);

  const baseYearMarkers = useMemo(() => {
    if (!data?.base_year_markers || filteredData.length === 0) return [];

    const startDate = new Date(filteredData[0].date);
    const endDate = new Date(filteredData[filteredData.length - 1].date);

    return data.base_year_markers
      .filter((marker) => {
        const markerDate = new Date(marker.date);
        return markerDate >= startDate && markerDate <= endDate;
      })
      .map((marker) => {
        const markerTime = new Date(marker.date).getTime();
        let closestDate = filteredData[0].date;
        let minDiff = Math.abs(new Date(filteredData[0].date).getTime() - markerTime);

        for (const point of filteredData) {
          const diff = Math.abs(new Date(point.date).getTime() - markerTime);
          if (diff < minDiff) {
            minDiff = diff;
            closestDate = point.date;
          }
        }

        return { ...marker, chartDate: closestDate };
      });
  }, [data, filteredData]);

  if (!isOpen) return null;

  const latest = data?.latest;
  const latestValue = latest?.value || 0;
  const momChangePct = data?.mom_change_pct;
  const yoyChange = data?.yoy_change;

  const values = filteredData.map((d) => d.value);
  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 100;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const point = payload[0].payload;
      return (
        <div className="remittances-tooltip">
          <p className="tooltip-date">{formattedDate}</p>
          <p className="tooltip-value" style={{ color: '#22C55E' }}>{(payload[0].value || 0).toFixed(2)}</p>
          {point?.base_year && (
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
              {point.base_year}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="lsm-modal-overlay">
      <div className="remittances-modal" onClick={(e) => e.stopPropagation()} data-testid="lsm-modal">
        <div className="modal-header">
          <div className="modal-title" data-testid="lsm-modal-title">
            <Factory size={20} />
            <span>{title || data?.name || 'LSM Quantum Index'}</span>
          </div>
          <button className="modal-close" onClick={onClose} data-testid="lsm-modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-summary">
          <div className="summary-main">
            <div className="summary-value" style={{ color: '#22C55E' }} data-testid="lsm-summary-value">
              {latestValue.toFixed(2)}
            </div>
            <div className="summary-period" data-testid="lsm-summary-period">
              <Calendar size={14} />
              {latest?.month || 'N/A'}
            </div>
          </div>
          <div className="summary-changes">
            {momChangePct !== null && momChangePct !== undefined && (
              <div className={`summary-change ${momChangePct >= 0 ? 'positive' : 'negative'}`} data-testid="lsm-mom-change">
                {momChangePct >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{momChangePct >= 0 ? '+' : ''}{momChangePct.toFixed(2)}%</span>
                <span className="change-label">MoM</span>
              </div>
            )}
            {yoyChange !== null && yoyChange !== undefined && (
              <div className={`summary-change ${yoyChange >= 0 ? 'positive' : 'negative'}`} data-testid="lsm-yoy-change">
                {yoyChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{yoyChange >= 0 ? '+' : ''}{yoyChange.toFixed(2)}%</span>
                <span className="change-label">YoY</span>
              </div>
            )}
          </div>
        </div>

        <div className="time-range-selector" data-testid="lsm-time-range-selector">
          {TIME_RANGES.map((range) => (
            <button
              key={range.key}
              className={`range-btn ${selectedRange === range.key ? 'active' : ''}`}
              onClick={() => setSelectedRange(range.key)}
              data-testid={`lsm-range-btn-${range.key}`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="chart-container" data-testid="lsm-chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLSM" x1="0" y1="0" x2="0" y2="1">
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
                domain={[Math.max(0, minValue * 0.95), maxValue * 1.05]}
                width={45}
              />
              {baseYearMarkers.map((marker, idx) => (
                <ReferenceLine
                  key={`lsm-base-${idx}`}
                  x={marker.chartDate}
                  stroke="#6366f1"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{
                    value: marker.base_year,
                    fill: '#6366f1',
                    fontSize: 10,
                    position: 'insideTopRight',
                    offset: 5
                  }}
                />
              ))}
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#colorLSM)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="modal-footer" data-testid="lsm-modal-footer">
          <span className="data-source">Source: {data?.source || 'State Bank of Pakistan / PBS'}</span>
          <span className="data-updated">
            {data?.total_data_points && (
              <span style={{ marginRight: '1rem', color: '#64748b' }}>
                {data.total_data_points} data points
              </span>
            )}
            Last updated: {new Date(data?.updated || Date.now()).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LSMDataModal;