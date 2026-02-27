import React from 'react';
import { Zap, ExternalLink, Battery, Flame } from 'lucide-react';

const EnergyPanel = ({ news, loading }) => {
  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="panel" data-testid="energy-panel" style={{ gridColumn: 'span 1' }}>
      <div className="panel-header" style={{ background: 'linear-gradient(90deg, rgba(251, 146, 60, 0.1), transparent)' }}>
        <div className="panel-title" style={{ color: '#FB923C' }}>
          <Zap size={16} />
          Energy Sector
        </div>
        <span className="panel-badge" style={{ 
          background: 'rgba(251, 146, 60, 0.2)', 
          color: '#FB923C' 
        }}>
          {news?.length || 0} updates
        </span>
      </div>
      <div className="panel-content" style={{ maxHeight: '350px', overflowY: 'auto' }}>
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : !news || news.length === 0 ? (
          <div style={{ 
            padding: '1rem', 
            textAlign: 'center', 
            color: 'var(--color-muted)',
            fontSize: '0.75rem'
          }}>
            <Battery size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <div>No energy news in last 24 hours</div>
          </div>
        ) : (
          news.map((item, index) => (
            <div 
              key={index} 
              className="news-item" 
              data-testid={`energy-item-${index}`}
              style={{ 
                borderLeft: '2px solid #FB923C',
                paddingLeft: '0.75rem',
                marginLeft: '0'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '0.25rem'
              }}>
                <Flame size={10} color="#FB923C" />
                <span style={{ 
                  fontSize: '0.625rem', 
                  color: '#FB923C',
                  textTransform: 'uppercase',
                  fontWeight: 600
                }}>
                  {item.source}
                </span>
              </div>
              <div className="news-title" style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-text)' }}
                >
                  {item.title}
                  <ExternalLink size={10} style={{ marginLeft: '0.25rem', opacity: 0.5 }} />
                </a>
              </div>
              {item.summary && (
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: 'var(--color-muted)', 
                  marginTop: '0.25rem',
                  lineHeight: 1.3
                }}>
                  {item.summary.substring(0, 120)}...
                </div>
              )}
              <div className="news-time" style={{ marginTop: '0.25rem' }}>
                {formatTime(item.published)}
              </div>
            </div>
          ))
        )}
      </div>
      <div style={{
        padding: '0.5rem 1rem',
        borderTop: '1px solid var(--color-border)',
        fontSize: '0.625rem',
        color: 'var(--color-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span>Source:</span>
        <a 
          href="https://www.energyupdate.com.pk" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#FB923C' }}
        >
          energyupdate.com.pk
        </a>
      </div>
    </div>
  );
};

export default EnergyPanel;
