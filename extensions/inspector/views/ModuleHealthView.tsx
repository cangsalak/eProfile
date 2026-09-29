'use client';

import React, { useState, useEffect, useCallback } from 'react';
import InspectorLayout from './InspectorLayout';
import Link from 'next/link';

export default function ModuleHealthView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/modules/inspector/modules');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to load module health');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const categories = ['ALL', 'core', 'hr', 'operations', 'system', 'tools'];

  const filteredModules = (data?.modules || []).filter((m: any) => {
    if (filterCategory === 'ALL') return true;
    return m.category === filterCategory;
  });

  return (
    <InspectorLayout
      activeTab="modules"
      title="สถานะและความสมบูรณ์ของโมดูล (Module Health)"
      description="ตรวจสอบสถานะการเปิด/ปิดใช้งาน เวอร์ชั่น สิทธิ์การเข้าถึง และเมนูของแต่ละโมดูลในระบบ"
      onRefresh={fetchModules}
      isRefreshing={loading}
    >
      <div className="space-y-6">
        {/* Stats summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400">โมดูลทั้งหมด</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {data?.stats?.totalModules ?? 0}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400">เปิดใช้งานอยู่</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {data?.stats?.enabledCount ?? 0}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400">โมดูลหลัก (Core)</div>
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">
              {data?.stats?.coreCount ?? 0}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400">ปิดใช้งาน</div>
            <div className="text-2xl font-bold text-slate-400 mt-1">
              {data?.stats?.disabledCount ?? 0}
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase transition-all ${
                filterCategory === c
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((mod: any) => (
            <div
              key={mod.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-sm flex flex-col justify-between ${
                mod.isEnabled
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-slate-200/50 dark:border-slate-800/40 opacity-70'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-base shrink-0">
                      <i className={mod.icon || 'fa-solid fa-cube'}></i>
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {mod.name}
                        {mod.isCore && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-semibold">
                            CORE
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">{mod.id} · v{mod.version}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      mod.isEnabled
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {mod.isEnabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {mod.description || 'ไม่มีคำอธิบาย'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span title="จำนวนเมนู">
                    <i className="fa-solid fa-bars mr-1 text-slate-400"></i>
                    {mod.menuCount} เมนู
                  </span>
                  <span title="จำนวนสิทธิ์">
                    <i className="fa-solid fa-key mr-1 text-slate-400"></i>
                    {mod.permissionCount} สิทธิ์
                  </span>
                </div>

                {mod.settingsPath && (
                  <Link
                    href={mod.settingsPath}
                    className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
                  >
                    ตั้งค่า
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </InspectorLayout>
  );
}
