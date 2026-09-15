'use client';

import React, { useState, useEffect, useCallback } from 'react';
import InspectorLayout from './InspectorLayout';
import Link from 'next/link';

export default function HealthView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/modules/inspector/health');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to load health status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    if (!autoRefresh) return;
    const timer = setInterval(fetchHealth, 10000);
    return () => clearInterval(timer);
  }, [fetchHealth, autoRefresh]);

  const formatUptime = (sec?: number) => {
    if (!sec) return '0s';
    const d = Math.floor(sec / (3600 * 24));
    const h = Math.floor((sec % (3600 * 24)) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const parts = [];
    if (d > 0) parts.push(`${d} วัน`);
    if (h > 0) parts.push(`${h} ชม.`);
    if (m > 0) parts.push(`${m} นาที`);
    if (parts.length === 0 || s > 0) parts.push(`${s} วินาที`);
    return parts.join(' ');
  };

  return (
    <InspectorLayout
      activeTab="health"
      title="ภาพรวมสถานะระบบ (System Health Overview)"
      description="ตรวจสอบความพร้อมในการทำงานของฐานข้อมูล หน่วยความจำ และเวลาทำงานต่อเนื่อง (Uptime)"
      onRefresh={fetchHealth}
      isRefreshing={loading}
    >
      <div className="space-y-6">
        {/* Controls & Quick Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${data?.status === 'healthy' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-rose-500 shadow-sm shadow-rose-500/50'} animate-pulse`}></span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                สถานะรวม: {data?.status === 'healthy' ? 'ระบบทำงานปกติ (Healthy)' : 'มีข้อขัดข้อง (Degraded)'}
              </span>
            </div>
            {data?.timestamp && (
              <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
                | อัปเดตล่าสุด: {new Date(data.timestamp).toLocaleTimeString('th-TH')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                autoRefresh
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              <i className={`fa-solid fa-arrows-rotate ${autoRefresh ? 'text-emerald-500' : 'text-slate-400'}`}></i>
              <span>Auto-refresh (10s): {autoRefresh ? 'เปิด' : 'ปิด'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-3">
            <i className="fa-solid fa-circle-exclamation text-rose-500 text-lg"></i>
            <div>
              <p className="font-semibold">ไม่สามารถดึงข้อมูลสถานะได้</p>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* 4 Health Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Database */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ฐานข้อมูล (Database)</span>
              <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
                <i className="fa-solid fa-database"></i>
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{data?.db?.status === 'connected' ? 'Connected' : 'Error'}</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  {data?.db?.latencyMs ?? 0} ms
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                SQLite Latency: {data?.db?.latencyMs ?? 0} ms
              </p>
            </div>
          </div>

          {/* Card 2: Memory */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">หน่วยความจำ (Memory)</span>
              <span className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm">
                <i className="fa-solid fa-memory"></i>
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {data?.system?.memoryMB ?? 0} MB
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Heap: {data?.system?.heapUsedMB ?? 0} / {data?.system?.heapTotalMB ?? 0} MB
              </p>
            </div>
          </div>

          {/* Card 3: Uptime */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">เวลาทำงาน (Uptime)</span>
              <span className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center text-sm">
                <i className="fa-solid fa-clock"></i>
              </span>
            </div>
            <div className="mt-3">
              <div className="text-base font-bold text-slate-900 dark:text-white truncate">
                {formatUptime(data?.system?.uptimeSeconds)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                PID: {data?.pid ?? '-'} · Node: {data?.nodeVersion ?? '-'}
              </p>
            </div>
          </div>

          {/* Card 4: Backup */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">การสำรองข้อมูล (Backup)</span>
              <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">
                <i className="fa-solid fa-box-archive"></i>
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {data?.backup?.count ?? 0} ไฟล์
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                ล่าสุด: {data?.backup?.lastBackup ? new Date(data.backup.lastBackup).toLocaleDateString('th-TH') : 'ยังไม่มีข้อมูล'}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* App Info Box */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-circle-info text-primary-500"></i>
              <span>ข้อมูลแอปพลิเคชัน</span>
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">ชื่อระบบ (App Name)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{data?.app || 'eProfile'}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">เวอร์ชันระบบ (Version)</span>
                <span className="font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                  {data?.version || '1.0.0'} ({data?.versionLabel || 'v1.0.0'})
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">สภาพแวดล้อม Node.js</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{data?.nodeVersion || '-'}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Process ID</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{data?.pid || '-'}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Navigation */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-bolt text-amber-500"></i>
              <span>เครื่องมือด่วน (Quick Tools)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/modules/inspector/performance"
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-500/50 hover:bg-primary-50/30 dark:hover:bg-primary-950/20 transition-all flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-chart-line text-sm"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    Performance
                  </div>
                  <div className="text-[11px] text-slate-400">ดูกราฟ CPU & Memory</div>
                </div>
              </Link>

              <Link
                href="/modules/inspector/routes"
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-500/50 hover:bg-primary-50/30 dark:hover:bg-primary-950/20 transition-all flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-network-wired text-sm"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Route Map
                  </div>
                  <div className="text-[11px] text-slate-400">สำรวจ API ทั้งหมด</div>
                </div>
              </Link>

              <Link
                href="/modules/inspector/database"
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-500/50 hover:bg-primary-50/30 dark:hover:bg-primary-950/20 transition-all flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-database text-sm"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                    Database Stats
                  </div>
                  <div className="text-[11px] text-slate-400">สถิติและขนาดตาราง</div>
                </div>
              </Link>

              <Link
                href="/modules/inspector/errors"
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-500/50 hover:bg-primary-50/30 dark:hover:bg-primary-950/20 transition-all flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-triangle-exclamation text-sm"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                    Error Logs
                  </div>
                  <div className="text-[11px] text-slate-400">ตรวจสอบบันทึกปัญหา</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </InspectorLayout>
  );
}
