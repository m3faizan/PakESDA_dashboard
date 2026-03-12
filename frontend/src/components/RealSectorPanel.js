import React, { useEffect, useState } from 'react';
import { Factory, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import axios from 'axios';
import LSMDataModal from './LSMDataModal';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

const RealSectorPanel = ({ loading: parentLoading }) => {
  const [lsmData, setLsmData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lsmRes, lsmHistRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/api/lsm`),
          axios.get(`${API_BASE}/api/lsm-historical`)
        ]);

        if (lsmRes.status === 'fulfilled') {
          setLsmData(lsmRes.value.data.data);
        }

        if (lsmHistRes.status === 'fulfilled' && lsmHistRes.value.data.data) {
          setLsmData((prev) => ({
            ...prev,
            ...lsmHistRes.value.data.data,
            latest: prev?.latest || lsmHistRes.value.data.data.latest
          }));
        }
      } catch (error) {
        console.error('Error fetching LSM data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  if (parentLoading || dataLoading) {
    return (
      <div className="panel" data-testid="real-sector-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Factory size={16} />
            Real Sector
          </div>
        </div>
        <div className="panel-content">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  const latestValue = lsmData?.latest?.value;
  const latestMonth = lsmData?.latest?.month || '';
  const momChangePct = lsmData?.mom_change_pct;

  return (
    <div className="panel" data-testid="real-sector-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Factory size={16} />
          Real Sector
        </div>
        <span className="panel-badge">LIVE</span>
      </div>
      <div className="panel-content">
        <div className="inflation-grid" data-testid="real-sector-grid">
          <div
            className="inflation-item clickable"
            data-testid="real-sector-item-lsm"
            onClick={() => setIsModalOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            <div className="inflation-header">
              <span className="inflation-label">
                LSM Quantum Index
                <ExternalLink size={10} style={{ marginLeft: '4px', opacity: 0.6 }} />
                <span
                  className="live-dot"
                  style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#22C55E',
                    borderRadius: '50%',
                    display: 'inline-block',
                    marginLeft: '6px',
                    animation: 'pulse 2s infinite'
                  }}
                ></span>
              </span>
            </div>
            <div className="inflation-value-container">
              <span className="inflation-value" style={{ color: 'var(--color-text)' }} data-testid="real-sector-lsm-value">
                {latestValue !== null && latestValue !== undefined ? Number(latestValue).toFixed(2) : '--'}
              </span>
              {momChangePct !== null && momChangePct !== undefined && (
                <span className={`inflation-change ${momChangePct >= 0 ? 'up' : 'down'}`} data-testid="real-sector-lsm-change">
                  {momChangePct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {momChangePct >= 0 ? '+' : ''}{momChangePct.toFixed(2)}%
                </span>
              )}
            </div>
            <div className="inflation-sublabel" data-testid="real-sector-lsm-month">{latestMonth}</div>
            <div className="inflation-description">
              Quantum Index of Large-scale Manufacturing (Increase is good)
            </div>
          </div>
        </div>
      </div>

      <LSMDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={lsmData}
        title="Quantum Index of Large-scale Manufacturing"
      />
    </div>
  );
};

export default RealSectorPanel;