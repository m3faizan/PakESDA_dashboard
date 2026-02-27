import React, { useRef, useEffect, useState } from 'react';
import { Radio } from 'lucide-react';

const NewsTicker = ({ news }) => {
  const [isPaused, setIsPaused] = useState(false);
  const tickerRef = useRef(null);

  if (!news || news.length === 0) return null;

  // Take top 20 news for ticker
  const tickerItems = news.slice(0, 20);
  // Duplicate for seamless loop
  const allItems = [...tickerItems, ...tickerItems];

  return (
    <div 
      className="news-ticker" 
      data-testid="news-ticker"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        background: 'linear-gradient(90deg, var(--color-surface) 0%, rgba(34, 197, 94, 0.05) 50%, var(--color-surface) 100%)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0.5rem 0',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Live Indicator */}
      <div style={{
        position: 'absolute',
        left: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        zIndex: 10,
        background: 'var(--color-surface)',
        padding: '0.25rem 0.75rem',
        borderRight: '1px solid var(--color-border)'
      }}>
        <Radio size={12} color="#22C55E" style={{ animation: 'pulse 2s infinite' }} />
        <span style={{ 
          fontSize: '0.625rem', 
          color: 'var(--color-primary)',
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.1em'
        }}>
          Breaking
        </span>
      </div>

      <div 
        ref={tickerRef}
        className="ticker-content"
        style={{
          display: 'flex',
          animation: isPaused ? 'none' : 'ticker 40s linear infinite',
          whiteSpace: 'nowrap',
          paddingLeft: '120px'
        }}
      >
        {allItems.map((item, index) => (
          <span 
            key={index} 
            className="ticker-item"
            style={{
              padding: '0 2rem',
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <span style={{
              width: '6px',
              height: '6px',
              background: 'var(--color-primary)',
              borderRadius: '50%',
              flexShrink: 0
            }}></span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              {item.source}:
            </span>
            <span>{item.title}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default NewsTicker;
