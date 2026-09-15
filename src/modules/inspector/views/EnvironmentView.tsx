'use client';

import React, { useState, useEffect, useCallback } from 'react';
import InspectorLayout from './InspectorLayout';

export default function EnvironmentView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchEnv = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/modules/inspector/environment');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch environment info');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnv();
  }, [fetchEnv]);

  const filteredEnv = (data?.environmentVariables || []).filter((item: any) =>
    item.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <InspectorLayout
      activeTab="environment"
      title="สภาพแวดล้อมระบบและการตั้งค่า (Environment & Runtime)"
      description="ตรวจสอบเวอร์ชันระบบปฏิบัติการ, Node.js Runtime, ตัวแปรสภาพแวดล้อม (Environment Variables) โดยปกปิดข้อมูลความลับ"
      onRefresh={fetchEnv}
      isRefreshing={loading}
    >
      <div className="space-y-6">
        {/* Runtime Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* OS & Runtime Box */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-server text-primary-500"></i>
              <span>Host & Runtime Information</span>
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Node.js Version</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{data?.runtime?.nodeVersion || '-'}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Platform / Architecture</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{data?.runtime?.platform} / {data?.runtime?.arch}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">OS Type & Release</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{data?.runtime?.osType} {data?.runtime?.osRelease}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">System Timezone</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{data?.runtime?.timezone || '-'}</span>
              </div>
            </div>
          </div>

          {/* Process & Paths Box */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-folder-tree text-emerald-500"></i>
              <span>Process Paths & Execution</span>
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">NODE_ENV</span>
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  {data?.app?.env || 'development'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Process PID</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{data?.runtime?.pid || '-'}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Working Directory</span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate max-w-xs">{data?.runtime?.cwd || '-'}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Hostname</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{data?.runtime?.hostname || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Variables Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-3 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-key text-amber-500"></i>
                <span>Environment Variables ({filteredEnv.length})</span>
              </h3>
              <p className="text-xs text-slate-400">ตัวแปรที่มีความสำคัญหรือมีคีย์ลับจะถูกอำพรางอัตโนมัติ</p>
            </div>

            <div className="relative w-full sm:w-64">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                type="text"
                placeholder="ค้นหาตัวแปร..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-sans">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Key Name</th>
                  <th className="py-2.5 px-4 font-semibold">Value</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Protection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEnv.map((item: any) => (
                  <tr key={item.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {item.key}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 truncate max-w-md">
                      {item.value}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap font-sans">
                      {item.isSensitive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                          REDACTED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                          VISIBLE
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </InspectorLayout>
  );
}
