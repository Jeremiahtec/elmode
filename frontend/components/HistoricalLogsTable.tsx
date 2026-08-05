'use client';

import { useEffect, useState } from 'react';

interface TelemetryLog {
  id: number;
  vehicleId: string;
  metric: string;
  metricValue: number;
  status: string;
  timestamp: string;
}

export default function HistoricalLogsTable() {
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [isResetting, setIsResetting] = useState(false); // Add loading state
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchLogs = async () => {
      try {
const response = await fetch(`${BACKEND_URL}/api/telemetry/history`);        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error('Failed to fetch historical logs', error);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  // NEW: Function to trigger the reset
  const handleReset = async () => {
    setIsResetting(true);
    try {
    await fetch(`${BACKEND_URL}/api/telemetry/reset`, {        method: 'DELETE',
      });
      setLogs([]); // Immediately clear the UI
    } catch (error) {
      console.error('Failed to reset system', error);
    }
    setTimeout(() => setIsResetting(false), 1000);
  };

  const getStatusColor = (status: string) => {
    if (status === 'CRITICAL') return 'text-red-400 bg-red-400/10 border-red-500/20';
    if (status === 'WARNING') return 'text-amber-400 bg-amber-400/10 border-amber-500/20';
    return 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20';
  };

  return (
    <div className="w-full max-w-5xl p-6 mt-6 rounded-2xl bg-neutral-900/60 backdrop-blur-xl border border-white/10 shadow-2xl font-sans text-white">
      {/* UPDATE: Header now includes the Reset Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-neutral-400 text-xs tracking-[0.2em] uppercase font-semibold">Database Log (PostgreSQL)</h2>
        
        <button 
          onClick={handleReset}
          disabled={isResetting}
          className={`px-4 py-2 text-xs font-bold tracking-widest uppercase rounded border transition-all duration-300
            ${isResetting 
              ? 'bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed' 
              : 'text-blue-400 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]'}`}
        >
          {isResetting ? 'Purging...' : 'Initiate System Repair'}
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-300">
          <thead className="text-xs text-neutral-500 uppercase bg-neutral-950/50">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">ID</th>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Metric</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3 rounded-tr-lg">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-mono text-neutral-500">#{log.id}</td>
                <td className="px-4 py-3 font-mono opacity-80">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-4 py-3 tracking-wider text-xs">{log.metric.replace('_', ' ')}</td>
                <td className="px-4 py-3 font-mono">{log.metricValue}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded border tracking-wider ${getStatusColor(log.status)}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {logs.length === 0 && (
          <div className="text-center text-neutral-500 py-6 text-sm animate-pulse">
            Querying database records...
          </div>
        )}
      </div>
    </div>
  );
}