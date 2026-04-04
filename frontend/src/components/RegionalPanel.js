import React, { useEffect, useMemo, useState } from 'react';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const formatUsd = (value) => {
  if (value === null || value === undefined) return '--';
  const abs = Math.abs(value);
  if (abs >= 1000000000) return `$${(abs / 1000000000).toFixed(2)}B`;
  if (abs >= 1000000) return `$${(abs / 1000000).toFixed(2)}M`;
  return `$${abs.toFixed(0)}`;
};

const RegionalPanel = ({ relations, loading }) => {
  const countries = relations?.countries || [];
  const [selectedCountry, setSelectedCountry] = useState(countries[0]?.code || '');
  const [showSources, setShowSources] = useState(false);

  useEffect(() => {
    if (countries.length && !countries.find((country) => country.code === selectedCountry)) {
      setSelectedCountry(countries[0].code);
    }
  }, [countries, selectedCountry]);

  const activeCountry = useMemo(() => {
    return countries.find((country) => country.code === selectedCountry) || countries[0];
  }, [countries, selectedCountry]);

  const tradeCards = useMemo(() => {
    if (!activeCountry) return [];
    return [
      { key: 'exports', label: 'EXPORT RECEIPTS', data: activeCountry.trade?.exports },
      { key: 'imports', label: 'IMPORT PAYMENTS', data: activeCountry.trade?.imports },
      { key: 'remittances', label: 'WORKER REMITTANCE', data: activeCountry.trade?.remittances }
    ];
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
            <div className="regional-country-grid" data-testid="regional-country-grid">
              {countries.map((country) => (
                <button
                  key={country.code}
                  className={`regional-country-card ${selectedCountry === country.code ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCountry(country.code);
                    setShowSources(false);
                  }}
                  data-testid={`regional-country-${country.code}`}
                >
                  <div className="regional-country-flag" data-testid={`regional-country-flag-${country.code}`}>
                    {country.flag}
                  </div>
                  <div className="regional-country-name" data-testid={`regional-country-name-${country.code}`}>
                    {country.name.toUpperCase()}
                  </div>
                  <div className="regional-country-group" data-testid={`regional-country-group-${country.code}`}>
                    {country.group.toUpperCase()}
                  </div>
                </button>
              ))}
            </div>

            {activeCountry ? (
              <div className="regional-detail" data-testid="regional-detail">
                <div className="regional-detail-header">
                  <div>
                    <div className="regional-detail-title" data-testid="regional-detail-title">
                      <span className="regional-detail-flag">{activeCountry.flag}</span>
                      {activeCountry.name.toUpperCase()}
                    </div>
                    <div className="regional-status-badge" data-testid="regional-status-badge">
                      {activeCountry.status || 'ACTIVE'}
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
                      {(activeCountry.sources || []).map((source, index) => (
                        <a
                          key={source.url}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="regional-source-link"
                          data-testid={`regional-source-link-${index}`}
                        >
                          {source.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div className="regional-highlights" data-testid="regional-highlights">
                  <div className="regional-section-title">Relationship Status</div>
                  <ul>
                    {(activeCountry.highlights || []).map((item, index) => (
                      <li key={`${activeCountry.code}-${index}`} data-testid={`regional-highlight-${index}`}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="regional-trade" data-testid="regional-trade">
                  <div className="regional-section-title">Trade & Remittance (Last 12 Months)</div>
                  <div className="regional-trade-grid">
                    {tradeCards.map((card) => {
                      const latest = card.data?.latest?.value;
                      const change = card.data?.mom_change;
                      const hasData = latest !== null && latest !== undefined;
                      const trendUp = change !== null && change !== undefined && change >= 0;
                      return (
                        <div key={card.key} className="regional-trade-card" data-testid={`regional-trade-${card.key}`}>
                          <div className="regional-trade-label">{card.label}</div>
                          <div className="regional-trade-value" data-testid={`regional-trade-value-${card.key}`}>
                            {hasData ? formatUsd(latest) : '--'}
                          </div>
                          <div className="regional-trade-meta">
                            <span data-testid={`regional-trade-month-${card.key}`}>
                              {card.data?.latest?.month || 'Latest'}
                            </span>
                            {change !== null && change !== undefined && (
                              <span
                                className={`regional-trade-change ${trendUp ? 'positive' : 'negative'}`}
                                data-testid={`regional-trade-change-${card.key}`}
                              >
                                {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {trendUp ? '+' : ''}{change.toFixed(2)}%
                              </span>
                            )}
                          </div>
                          <div className="regional-trade-chart" data-testid={`regional-trade-chart-${card.key}`}>
                            {card.data?.history?.length ? (
                              <ResponsiveContainer width="100%" height={60}>
                                <LineChart data={card.data.history}>
                                  <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke={trendUp ? '#22C55E' : '#F97316'}
                                    strokeWidth={2}
                                    dot={false}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="regional-trade-empty">No data</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
