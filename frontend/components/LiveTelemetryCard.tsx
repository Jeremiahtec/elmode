'use client';

import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface TelemetryData {
  vehicleId: string;
  metric: string;
  value: number;
  status: 'INFO' | 'WARNING' | 'CRITICAL';
  time: string;
}

interface MetricHistory {
  currentStatus: string;
  history: TelemetryData[];
}

export default function LiveTelemetryCard() {
  const [metrics, setMetrics] = useState<Record<string, MetricHistory>>({});
  const [isConnected, setIsConnected] = useState(false);

useEffect(() => {
const BACKEND_URL = "https://elmode-backend.onrender.com";    
    const socket = new SockJS(`${BACKEND_URL}/ws-telemetry`);
    
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: () => {}, 
      onConnect: () => {
        setIsConnected(true);
        stompClient.subscribe('/topic/telemetry', (message) => {
          const payload = JSON.parse(message.body);
          
          const dataPoint = {
            ...payload,
            time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })
          };
          
          setMetrics((prev) => {
            const existingHistory = prev[payload.metric]?.history || [];
            const newHistory = [...existingHistory, dataPoint].slice(-20);
            
            return {
              ...prev,
              [payload.metric]: {
                currentStatus: payload.status,
                history: newHistory
              }
            };
          });
        });
      },
      onDisconnect: () => setIsConnected(false),
    });

    stompClient.activate();
    return () => { stompClient.deactivate(); };
  }, []);

  const getTheme = (status?: string) => {
    switch (status) {
      case 'CRITICAL': return { color: '#ef4444', class: 'text-red-400 border-red-500/30 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]' };
      case 'WARNING': return { color: '#f59e0b', class: 'text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]' };
      default: return { color: '#10b981', class: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]' };
    }
  };

  return (
    <div className="w-full max-w-5xl p-6 rounded-2xl bg-neutral-900/60 backdrop-blur-xl border border-white/10 shadow-2xl font-sans text-white">
      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
        <h2 className="text-neutral-400 text-xs tracking-[0.2em] uppercase font-semibold">Live Diagnostics Array</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-600'}`}></div>
          <span className="text-[10px] uppercase tracking-wider text-neutral-500">{isConnected ? 'Uplink Active' : 'Connecting...'}</span>
        </div>
      </div>
      
      {Object.keys(metrics).length === 0 ? (
        <div className="h-48 flex items-center justify-center text-neutral-600 text-sm animate-pulse">
          Awaiting ELMODE data stream...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(metrics).map(([metricName, metricData]) => {
            const latestData = metricData.history[metricData.history.length - 1];
            const theme = getTheme(metricData.currentStatus);
            
            // Make RUL span the full width
            const isRul = metricName === 'ENGINE_HEALTH_RUL';
            const colSpan = isRul ? 'md:col-span-2' : '';
            
            return (
              <div key={metricName} className={`p-5 rounded-xl border transition-all duration-500 flex flex-col justify-between ${isRul ? 'h-72' : 'h-64'} ${theme.class} ${colSpan}`}>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-mono text-sm opacity-80">{latestData.vehicleId}</span>
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-black/40 tracking-wider backdrop-blur-md">
                      {metricData.currentStatus}
                    </span>
                  </div>
                  
                  <div className="text-white/50 text-xs uppercase tracking-widest mb-1">{metricName.replace('_', ' ')}</div>
                  <div className="text-5xl font-light font-mono flex items-baseline tracking-tighter truncate z-10 relative">
                    {latestData.value.toLocaleString()}
                    <span className="text-xl ml-2 opacity-40 font-sans tracking-normal">
                      {metricName === 'ENGINE_RPM' ? 'RPM' : isRul ? '%' : '°C'}
                    </span>
                  </div>
                </div>

                <div className={`${isRul ? 'h-32' : 'h-24'} w-full mt-auto -mx-2 opacity-80 mix-blend-screen`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metricData.history}>
                      <defs>
                        <linearGradient id={`gradient-${metricName}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.color} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={theme.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <YAxis domain={['auto', 'auto']} hide />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={theme.color} 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill={`url(#gradient-${metricName})`} 
                        isAnimationActive={false} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}