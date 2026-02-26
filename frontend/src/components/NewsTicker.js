import React from 'react';

const NewsTicker = ({ news }) => {
  if (!news || news.length === 0) return null;

  // Duplicate news for seamless loop
  const tickerItems = [...news.slice(0, 15), ...news.slice(0, 15)];

  return (
    <div className="news-ticker" data-testid="news-ticker">
      <div className="ticker-content">
        {tickerItems.map((item, index) => (
          <span key={index} className="ticker-item">
            <strong>{item.source}:</strong> {item.title}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NewsTicker;
