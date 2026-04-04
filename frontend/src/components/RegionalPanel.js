import React, { useEffect, useMemo, useState } from 'react';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const formatUsdThousands = (value) => {
  if (value === null || value === undefined) return '--';
  const scaled = value * 1000;
  const abs = Math.abs(scaled);
  if (abs >= 1000000000) return `$${(scaled / 1000000000).toFixed(2)}B`;
  if (abs >= 1000000) return `$${(scaled / 1000000).toFixed(2)}M`;
  if (abs >= 1000) return `$${(scaled / 1000).toFixed(1)}K`;
  return `$${scaled.toFixed(0)}`;
};

const scaleHistory = (history = []) =>
  history.map((item) => ({ ...item, value: item.value * 1000 }));

const GROUP_ORDER = ['Neighbor', 'GCC', 'Major', 'EU'];

const RegionalPanel = ({ relations, loading }) => {
  const countries = relations?.countries || [];
  const [selectedCountry, setSelectedCountry] = useState(countries[0]?.code || '');
  const [showSources, setShowSources] = useState(false);

  useEffect(() => {
    if (countries.length && !countries.find((c) => c.code === selectedCountry)) {
      setSelectedCountry(countries[0].code);
    }
  }, [countries, selectedCountry]);

  const grouped = useMemo(() => {
    const map = {};
    countries.forEach((c) => {
      const g = c.group || 'Other';
      if (!map[g]) map[g] = [];
      map[g].push(c);
    });
    const ordered = [];
    GROUP_ORDER.forEach((g) => { if (map[g]) ordered.push({ group: g, items: map[g] }); });
    Object.keys(map).forEach((g) => { if (!GROUP_ORDER.includes(g)) ordered.push({ group: g, items: map[g] }); });
    return ordered;
  }, [countries]);

  const activeCountry = useMemo(
    () => countries.find((c) => c.code === selectedCountry) || countries[0],
    [countries, selectedCountry]
  );

  const tradeCards = useMemo(() => {
    if (!activeCountry) return [];
    return [
      { key: 'exports', label: 'Exports', data: activeCountry.trade?.exports },
      { key: 'imports', label: 'Imports', data: activeCountry.trade?.imports },
      { key: 'remittances', label: 'Remittances', data: activeCountry.trade?.remittances }
    ];
  }, [activeCountry]);

  const tradeBalance = useMemo(() => {
    if (!activeCountry?.trade) return null;
    const exp = activeCountry.trade.exports?.latest?.value;
    const imp = activeCountry.trade.imports?.latest?.value;
    if (exp == null || imp == null) return null;
    return (exp - imp) * 1000;
  }, [activeCountry]);

  return (
    <div className="panel regional-panel" data-testid="regional-panel">
      <div className="panel-header">
        <div className="panel-title" data-testid="regional-panel-title">
          Regional Relations
        </div>
        <div className="panel-badge" data-testid="regional-panel-badge">Live</div>
      </div>
      <div className="panel-content regional-panel-content" data-testid="regional-panel-content">
        {loading ? (
          <div className="loading" data-testid="regional-panel-loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="regional-layout" data-testid="regional-layout">
            {/* Left: grouped country sidebar */}
            <div className="regional-country-sidebar" data-testid="regional-country-sidebar">
              {grouped.map((grp) => (
                <React.Fragment key={grp.group}>
                  <div className="regional-group-label">{grp.group}</div>
                  {grp.items.map((country) => (
                    <button
                      key={country.code}
                      className={`regional-country-btn ${selectedCountry === country.code ? 'active' : ''}`}
                      onClick={() => { setSelectedCountry(country.code); setShowSources(false); }}
                      data-testid={`regional-country-${country.code}`}
                    >
                      <span className="regional-country-btn-flag">{country.flag}</span>
                      <span className="regional-country-btn-info">
                        <span className="regional-country-btn-name">{country.name.toUpperCase()}</span>
                        {country.tag && <span className="regional-country-btn-tag">{country.tag}</span>}
                      </span>
                    </button>
                  ))}
                </React.Fragment>
              ))}
            </div>

            {/* Right: detail panel */}
            {activeCountry ? (
              <div className="regional-detail" data-testid="regional-detail">
                {/* Header */}
                <div className="regional-detail-header">
                  <div>
                    <div className="regional-detail-title" data-testid="regional-detail-title">
                      <span className="regional-detail-flag">{activeCountry.flag}</span>
                      {activeCountry.name.toUpperCase()}
                    </div>
                    <div className="regional-status-row">
                      <span className="regional-status-badge" data-testid="regional-status-badge">
                        {activeCountry.status || 'ACTIVE'}
                      </span>
                      {activeCountry.tag && (
                        <span className="regional-tag-chip" data-testid="regional-tag-chip">
                          {activeCountry.tag.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="regional-info-button"
                    onClick={() => setShowSources((prev) => !prev)}
                    data-testid="regional-sources-button"
                  >
                    <Info size={14} />
                  </button>
                  {showSources && (
                    <div className="regional-sources-panel" data-testid="regional-sources-panel">
                      <div className="regional-sources-title">Sources</div>
                      {(activeCountry.sources || []).map((source, idx) => (
                        <a key={source.url} href={source.url} target="_blank" rel="noreferrer"
                          className="regional-source-link" data-testid={`regional-source-link-${idx}`}>
                          {source.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Relationship highlights */}
                <div className="regional-highlights" data-testid="regional-highlights">
                  <div className="regional-section-title">Relationship Status</div>
                  <ul>
                    {(activeCountry.highlights || []).map((item, idx) => (
                      <li key={`${activeCountry.code}-h-${idx}`} data-testid={`regional-highlight-${idx}`}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Trade & Remittance */}
                <div className="regional-trade" data-testid="regional-trade">
                  <div className="regional-section-title">Trade & Remittance (Last 12 Months)</div>
                  <div className="regional-trade-grid">
                    {tradeCards.map((card) => {
                      const latest = card.data?.latest?.value;
                      const change = card.data?.mom_change;
                      const hasData = latest !== null && latest !== undefined;
                      const trendUp = change != null && change >= 0;
                      const chartData = scaleHistory(card.data?.history || []);
                      return (
                        <div key={card.key} className="regional-trade-card" data-testid={`regional-trade-${card.key}`}>
                          <div className="regional-trade-label">{card.label}</div>
                          <div className="regional-trade-value" data-testid={`regional-trade-value-${card.key}`}>
                            {hasData ? formatUsdThousands(latest) : '--'}
                          </div>
                          <div className="regional-trade-meta">
                            <span data-testid={`regional-trade-month-${card.key}`}>
                              {card.data?.latest?.month || ''}
                            </span>
                            {change != null && (
                              <span className={`regional-trade-change ${trendUp ? 'positive' : 'negative'}`}
                                data-testid={`regional-trade-change-${card.key}`}>
                                {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {trendUp ? '+' : ''}{change.toFixed(1)}%
                              </span>
                            )}
                          </div>
                          <div className="regional-trade-chart" data-testid={`regional-trade-chart-${card.key}`}>
                            {chartData.length > 1 ? (
                              <ResponsiveContainer width="100%" height={50}>
                                <LineChart data={chartData}>
                                  <Line type="monotone" dataKey="value"
                                    stroke={trendUp ? '#22C55E' : '#F97316'} strokeWidth={1.5} dot={false} />
                                </LineChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="regional-trade-empty">No trend data</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {tradeBalance !== null && (
                    <div className="regional-trade-balance" data-testid="regional-trade-balance">
                      <span className="regional-trade-balance-label">Trade Balance</span>
                      <span className={`regional-trade-balance-value ${tradeBalance >= 0 ? 'surplus' : 'deficit'}`}
                        data-testid="regional-trade-balance-value">
                        {tradeBalance >= 0 ? '+' : ''}{formatUsdThousands(tradeBalance / 1000)}
                        <span style={{ fontSize: '0.5rem', marginLeft: '0.3rem', opacity: 0.7 }}>
                          {tradeBalance >= 0 ? 'SURPLUS' : 'DEFICIT'}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Visa & Travel */}
                <div className="regional-visa" data-testid="regional-visa">
                  <div className="regional-section-title">Visa & Travel</div>
                  <div className="regional-visa-status" data-testid="regional-visa-status">
                    {activeCountry.visa?.status || 'Visa required'}
                  </div>
                  <ul>
                    {(activeCountry.visa?.notes || []).map((note, idx) => (
                      <li key={`${activeCountry.code}-v-${idx}`} data-testid={`regional-visa-note-${idx}`}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="regional-detail" data-testid="regional-detail-empty">
                Select a country to view details.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionalPanel;
