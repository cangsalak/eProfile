'use client';

import React, { useState, useEffect, useCallback } from 'react';
import InspectorLayout from './InspectorLayout';

export default function PerformanceView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pingHistory, setPingHistory] = useState<{ time: string; latency: number }[]>([]);

  const fetchPerformance = useCallback(async () => {
    try {
      setLoading(true);
      const start = Date.now();
      const res = await fetch('/api/modules/inspector/performance');
      const latency = Date.now() - start;
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setData(json);
      setPingHistory((prev) => [
        ...prev.slice(-19),
        { time: new Date().toLocaleTimeString('th-TH'), latency },
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch performance metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPerformance();
    const interval = setInterval(fetchPerformance, 5000);
    return () => clearInterval(interval);
  }, [fetchPerformance]);

  const heapPercent = data?.memory?.heapUsedPercent ?? 0;
  const sysMemPercent = data?.system?.systemMemUsagePercent ?? 0;

  return (
    <InspectorLayout
      activeTab="performance"
      title="ประสิทธิภาพและทรัพยากรระบบ (System Performance)"
      description="ตรวจสอบการใช้งานหน่วยความจำ (Memory RSS / Heap), ซีพียู (CPU Load Average) และความหน่วงของการตอบสนอง (Latency)"
      onRefresh={fetchPerformance}
      isRefreshing={loading}
    >
      <div className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Memory Gauges Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Node.js Process Memory */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-microchip"></i>
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Node.js Process Memory</h3>
                  <p className="text-xs text-slate-400">หน่วยความจำที่กระบวนการของ Next.js ใช้งาน</p>
                </div>
              </div>
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                {data?.memory?.rssMB ?? 0} MB (RSS)
              </span>
            </div>

            {/* Heap Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>V8 Heap Usage</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {data?.memory?.heapUsedMB ?? 0} / {data?.memory?.heapTotalMB ?? 0} MB ({heapPercent}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    heapPercent > 85 ? 'bg-rose-500' : heapPercent > 65 ? 'bg-amber-500' : 'bg-primary-600'
                  }`}
                  style={{ width: `${Math.min(heapPercent, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Memory breakdown details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-400">RSS</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{data?.memory?.rssMB ?? 0} MB</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-400">Heap Total</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{data?.memory?.heapTotalMB ?? 0} MB</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-400">Heap Used</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{data?.memory?.heapUsedMB ?? 0} MB</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-400">External</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{data?.memory?.externalMB ?? 0} MB</div>
              </div>
            </div>
          </div>

          {/* Host OS Memory & CPU */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-server"></i>
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Host System Resources</h3>
                  <p className="text-xs text-slate-400">{data?.system?.cpuModel || 'CPU'} ({data?.system?.cpuCount || 1} Cores)</p>
                </div>
              </div>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {sysMemPercent}% Used
              </span>
            </div>

            {/* System Memory Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>System RAM Usage</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {data?.system?.usedMemMB ?? 0} / {data?.system?.totalMemMB ?? 0} MB ({sysMemPercent}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    sysMemPercent > 85 ? 'bg-rose-500' : sysMemPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(sysMemPercent, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Load Average */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Load 1 min</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{data?.system?.loadAverage?.['1m'] ?? 0}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Load 5 min</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{data?.system?.loadAverage?.['5m'] ?? 0}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Load 15 min</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{data?.system?.loadAverage?.['15m'] ?? 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Latency Bar Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-wave-square text-primary-500"></i>
                <span>Live Latency Timeline (5s Polling)</span>
              </h3>
              <p className="text-xs text-slate-400">ประวัติความหน่วงในการตอบสนองของเซิร์ฟเวอร์แบบ Real-time</p>
            </div>
            {pingHistory.length > 0 && (
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400">
                ล่าสุด: {pingHistory[pingHistory.length - 1].latency} ms
              </span>
            )}
          </div>

          <div className="h-32 flex items-end gap-1.5 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
            {pingHistory.map((item, idx) => {
              const maxLat = 200;
              const heightPercent = Math.min((item.latency / maxLat) * 100, 100);
              const barColor =
                item.latency < 50
                  ? 'bg-emerald-500'
                  : item.latency < 100
                  ? 'bg-primary-500'
                  : item.latency < 150
                  ? 'bg-amber-500'
                  : 'bg-rose-500';

              return (
                <div key={idx} className="flex-1 min-w-[14px] flex flex-col items-center gap-1 group relative">
                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 ${barColor}`}
                    style={{ height: `${Math.max(heightPercent, 8)}%` }}
                  ></div>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-white whitespace-nowrap pointer-events-none transition-opacity">
                    {item.latency}ms ({item.time})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </InspectorLayout>
  );
}
