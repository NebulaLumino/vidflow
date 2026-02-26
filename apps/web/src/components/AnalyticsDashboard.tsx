/**
 * VidFlow Analytics Dashboard Component
 * Displays key metrics and event statistics
 */

'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  totalEvents: number;
  uniqueSessions: number;
  downloadsStarted: number;
  downloadsCompleted: number;
  downloadSuccessRate: number;
  adImpressions: number;
  adClicks: number;
  adCTR: number;
  topPlatforms: { platform: string; count: number }[];
}

interface AnalyticsDashboardProps {
  title?: string;
  refreshInterval?: number;
}

export default function AnalyticsDashboard({
  title = 'Analytics Dashboard',
  refreshInterval = 30000,
}: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      // In a real app, this would fetch from an analytics API
      // For demo purposes, we'll use localStorage
      const stored = localStorage.getItem('vidflow_analytics');
      if (stored) {
        const parsed = JSON.parse(stored);
        setData(parsed);
      } else {
        // Default demo data
        setData({
          totalEvents: 0,
          uniqueSessions: 0,
          downloadsStarted: 0,
          downloadsCompleted: 0,
          downloadSuccessRate: 0,
          adImpressions: 0,
          adClicks: 0,
          adCTR: 0,
          topPlatforms: [],
        });
      }
      setError(null);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Events" value={data.totalEvents.toLocaleString()} color="blue" />
        <MetricCard
          label="Unique Sessions"
          value={data.uniqueSessions.toLocaleString()}
          color="green"
        />
        <MetricCard
          label="Downloads"
          value={data.downloadsCompleted.toLocaleString()}
          color="purple"
        />
        <MetricCard
          label="Success Rate"
          value={`${data.downloadSuccessRate.toFixed(1)}%`}
          color="green"
        />
      </div>

      {/* Ad Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Ad Impressions"
          value={data.adImpressions.toLocaleString()}
          color="orange"
        />
        <MetricCard label="Ad Clicks" value={data.adClicks.toLocaleString()} color="orange" />
        <MetricCard label="Ad CTR" value={`${data.adCTR.toFixed(2)}%`} color="red" />
      </div>

      {/* Top Platforms */}
      {data.topPlatforms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Top Platforms</h3>
          <div className="space-y-2">
            {data.topPlatforms.slice(0, 5).map((platform, index) => (
              <div key={platform.platform} className="flex items-center">
                <span className="w-24 font-medium capitalize">{platform.platform}</span>
                <div className="flex-1 mx-3 h-4 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${(platform.count / data.topPlatforms[0].count) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-gray-600">{platform.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={fetchAnalytics}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Refresh
      </button>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

function MetricCard({ label, value, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="text-sm opacity-75">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
