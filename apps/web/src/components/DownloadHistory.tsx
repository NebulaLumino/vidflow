'use client';

import { useEffect, useState } from 'react';

interface DownloadRecord {
  id: string;
  url: string;
  platform: string;
  quality: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  created_at: string;
  updated_at?: string;
  file_path?: string;
}

interface Stats {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  processing: number;
  by_platform: Record<string, number>;
}

const WORKER_API = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:3001';

export function DownloadHistory() {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'stats'>('history');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch stats from worker API
      const statsRes = await fetch(`${WORKER_API}/api/v1/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-success';
      case 'failed':
        return 'status-error';
      case 'processing':
        return 'status-processing';
      default:
        return 'status-pending';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (loading) {
    return (
      <div className="history-panel">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <div className="history-tabs">
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Download History
        </button>
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
      </div>

      {activeTab === 'history' && (
        <div className="history-content">
          {downloads.length === 0 ? (
            <p className="empty-message">No downloads yet. Start by pasting a video URL!</p>
          ) : (
            <div className="downloads-list">
              {downloads.map((download) => (
                <div key={download.id} className="download-item">
                  <div className="download-info">
                    <span className="platform-badge">{download.platform}</span>
                    <span className="download-url" title={download.url}>
                      {download.url.substring(0, 50)}...
                    </span>
                  </div>
                  <div className="download-meta">
                    <span className={`status-badge ${getStatusColor(download.status)}`}>
                      {download.status}
                    </span>
                    <span className="quality">{download.quality}</span>
                    <span className="format">{download.format}</span>
                  </div>
                  <div className="download-date">{formatDate(download.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && stats && (
        <div className="stats-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Downloads</div>
            </div>
            <div className="stat-card success">
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card error">
              <div className="stat-value">{stats.failed}</div>
              <div className="stat-label">Failed</div>
            </div>
            <div className="stat-card processing">
              <div className="stat-value">{stats.processing}</div>
              <div className="stat-label">Processing</div>
            </div>
          </div>

          {Object.keys(stats.by_platform).length > 0 && (
            <div className="platform-stats">
              <h4>By Platform</h4>
              <div className="platform-bars">
                {Object.entries(stats.by_platform).map(([platform, count]) => (
                  <div key={platform} className="platform-bar">
                    <span className="platform-name">{platform}</span>
                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="platform-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
