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
        <div className="economic-grid" data-testid="real-sector-grid">
          <div
            className="economic-item clickable"
            data-testid="real-sector-item-lsm"
            onClick={() => setIsModalOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            <div className="economic-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>LSM Quantum Index</span>
              <ExternalLink size={10} style={{ opacity: 0.6 }} />
              <span
                className="live-dot"
                style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#22C55E',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'pulse 2s infinite'
                }}
              ></span>
            </div>
            <div className="economic-value" data-testid="real-sector-lsm-value">
                {latestValue !== null && latestValue !== undefined ? Number(latestValue).toFixed(2) : '--'}
            </div>
            {momChangePct !== null && momChangePct !== undefined && (
              <div className={`economic-change ${momChangePct >= 0 ? 'positive' : 'negative'}`} data-testid="real-sector-lsm-change">
                {momChangePct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {momChangePct >= 0 ? '+' : ''}{momChangePct.toFixed(2)}%
              </div>
            )}
            <div className="economic-sublabel" data-testid="real-sector-lsm-month">{latestMonth}</div>
            <div className="economic-label" style={{ marginTop: '0.15rem' }}>
              Quantum Index of Large-scale Manufacturing
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