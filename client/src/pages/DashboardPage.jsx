import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:3000";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLogs: 0,
    totalAttacks: 0,
    attacksPerMinute: 0,
    avgResponseTime: 0,
    topServices: [],
    errorBreakdown: {},
  });

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/logs/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // auto refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Logs" value={stats.totalLogs} />
        <StatCard label="Total Attacks" value={stats.totalAttacks} />
        <StatCard label="Attacks / Min" value={stats.attacksPerMinute} />
        <StatCard label="Avg Response Time" value={`${stats.avgResponseTime} ms`} />
      </div>

      {/* Top Services */}
      <div>
        <h2 className="text-lg font-medium mb-2">Top Services</h2>

        <div className="border rounded p-3">
          {stats.topServices.length === 0 ? (
            <p className="text-gray-500 text-sm">No service data available.</p>
          ) : (
            <ul className="list-disc pl-6">
              {stats.topServices.map((svc, i) => (
                <li key={i}>
                  {svc.service}: <span className="font-semibold">{svc.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Error Breakdown */}
      <div>
        <h2 className="text-lg font-medium mb-2">Error Level Breakdown</h2>

        <div className="border rounded p-3">
          {Object.keys(stats.errorBreakdown).length === 0 ? (
            <p className="text-gray-500 text-sm">No error-level logs found.</p>
          ) : (
            <ul className="list-disc pl-6">
              {Object.entries(stats.errorBreakdown).map(([level, count]) => (
                <li key={level}>
                  {level.toUpperCase()}: <span className="font-semibold">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* Small reusable card */
function StatCard({ label, value }) {
  return (
    <div className="border rounded p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
