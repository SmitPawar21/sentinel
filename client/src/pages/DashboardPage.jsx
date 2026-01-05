import React, { useState, useEffect } from 'react';
import { Activity, Shield, Clock, AlertTriangle, Server, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = 'http://localhost:3000'

  useEffect(() => {
    // Simulated API call - replace with your actual endpoint
    const fetchData = async () => {
      try {
        const response = await fetch(`${API}/logs/stats`);
        const result = await response.json();
        console.log(result)
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading security data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Failed to load data</div>
      </div>
    );
  }

  const maxAttacks = Math.max(...data.attacksPerMinResult.map(a => a.count));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-gray-800" />
            <h1 className="text-3xl font-bold text-gray-900">Sentinel</h1>
          </div>
          <p className="text-gray-600">Real-time Security & Observability System</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Logs</span>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{data.summary.totalLogs.toLocaleString()}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Threat IPs Detected</span>
              <AlertTriangle className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{data.summary.totalAttackIpsCount}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Avg Response Time</span>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{Number(data.summary.avgResponseTime[0]?.avg).toFixed(3)}<span className="text-lg text-gray-500 ml-1">ms</span></div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attacks Timeline */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Attack Activity</h2>
            </div>
            <div className="space-y-2">
              {data.attacksPerMinResult.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600">{new Date(item._id).toLocaleString([], {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.count} attacks</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Services */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Server className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Top Services</h2>
            </div>
            <div className="space-y-4">
              {data.topServicesResult.map((service, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 font-mono truncate">{service._id}</span>
                    <span className="text-sm font-semibold text-gray-900">{service.count}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-gray-700 h-full rounded-full"
                      style={{ width: `${(service.count / data.topServicesResult[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Threat Analysis */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Threat Analysis</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.attacks.attackReasons.map((attack, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-gray-800 rounded-full" />
                    <span className="font-mono text-sm font-semibold text-gray-900">{attack.ip}</span>
                  </div>
                  <div className="space-y-1.5">
                    {attack.reasons.map((reason, rIdx) => (
                      <div key={rIdx} className="flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <p className="text-xs text-gray-600 leading-relaxed flex-1">
                          {reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Last updated: {new Date().toLocaleTimeString()} • Auto-refresh every 30s
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;