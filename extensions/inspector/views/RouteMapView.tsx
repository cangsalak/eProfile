'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import InspectorLayout from './InspectorLayout';

export default function RouteMapView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedAuth, setSelectedAuth] = useState<string>('ALL');

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/modules/inspector/routes');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to scan routes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const filteredRoutes = useMemo(() => {
    if (!data?.routes) return [];
    return data.routes.filter((route: any) => {
      const matchSearch =
        !search ||
        route.path.toLowerCase().includes(search.toLowerCase()) ||
        route.module.toLowerCase().includes(search.toLowerCase()) ||
        route.filePath.toLowerCase().includes(search.toLowerCase());

      const matchMethod =
        selectedMethod === 'ALL' || route.methods.includes(selectedMethod);

      const matchAuth =
        selectedAuth === 'ALL' || route.authLevel === selectedAuth;

      return matchSearch && matchMethod && matchAuth;
    });
  }, [data, search, selectedMethod, selectedAuth]);

  const getMethodBadgeClass = (m: string) => {
    switch (m) {
      case 'GET':
        return 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/60';
      case 'POST':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60';
      case 'PUT':
      case 'PATCH':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60';
      case 'DELETE':
        return 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getAuthBadgeClass = (auth: string) => {
    switch (auth) {
      case 'PUBLIC':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
      case 'AUTHENTICATED':
        return 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/50';
      case 'ROLE_RESTRICTED':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
      case 'SUPER_ADMIN':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <InspectorLayout
      activeTab="routes"
      title="แผนผังเส้นทาง API (Route Map & Endpoints)"
      description="สแกนและแจกแจง API Endpoints ทั้งหมดในระบบ พร้อมแสดง HTTP Methods, สิทธิ์การเข้าถึง และไฟล์ปลายทาง"
      onRefresh={fetchRoutes}
      isRefreshing={loading}
    >
      <div className="space-y-6">
        {/* Stats summary banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Routes</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {data?.stats?.totalRoutes ?? 0}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400">Public Endpoints</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {data?.stats?.authCounts?.PUBLIC ?? 0}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400">Auth & Roles</div>
            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1">
              {(data?.stats?.authCounts?.AUTHENTICATED ?? 0) + (data?.stats?.authCounts?.ROLE_RESTRICTED ?? 0)}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400">Super Admin Only</div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {data?.stats?.authCounts?.SUPER_ADMIN ?? 0}
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                type="text"
                placeholder="ค้นหาเส้นทาง API หรือโมดูล..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              {['ALL', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMethod(m)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    selectedMethod === m
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Route Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Method</th>
                  <th className="py-3 px-4 font-semibold">API Endpoint Path</th>
                  <th className="py-3 px-4 font-semibold">Module</th>
                  <th className="py-3 px-4 font-semibold">Security / Auth</th>
                  <th className="py-3 px-4 font-semibold">Source File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRoutes.map((route: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {route.methods.map((m: string) => (
                          <span
                            key={m}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${getMethodBadgeClass(m)}`}
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                      {route.path}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {route.module}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] border ${getAuthBadgeClass(route.authLevel)}`}>
                        {route.authLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] truncate max-w-xs">
                      {route.filePath}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRoutes.length === 0 && !loading && (
            <div className="p-8 text-center text-slate-400 text-xs">
              ไม่พบเส้นทาง API ที่ตรงกับเงื่อนไขการค้นหา
            </div>
          )}
        </div>
      </div>
    </InspectorLayout>
  );
}
