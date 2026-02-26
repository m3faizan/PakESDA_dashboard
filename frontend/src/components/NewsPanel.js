import React from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';

const NewsPanel = ({ news, loading }) => {
  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="panel" data-testid="news-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Newspaper size={16} />
          Latest News
        </div>
        <span className="panel-badge">{news.length} items</span>
      </div>
      <div className="panel-content">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : news.length === 0 ? (
          <div className="loading">No news available</div>
        ) : (
          news.slice(0, 10).map((item, index) => (
            <div key={index} className="news-item" data-testid={`news-item-${index}`}>
              <div className="news-source">{item.source}</div>
              <div className="news-title">
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  {item.title}
                  <ExternalLink size={10} style={{ marginLeft: '0.25rem', opacity: 0.5 }} />
                </a>
              </div>
              <div className="news-time">{formatTime(item.published)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsPanel;
