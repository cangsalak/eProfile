'use client';

import React, { useState, useEffect, useCallback } from 'react';
import InspectorLayout from './InspectorLayout';
import Link from 'next/link';

export default function SecurityScanView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSecurity = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/modules/inspector/security');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch security diagnostics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSecurity();
  }, [fetchSecurity]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50';
      case 'WARN':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
      default:
        return 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900/50';
    }
  };

  return (
    <InspectorLayout
      activeTab="security"
      title="การวินิจฉัยความปลอดภัย (Security Diagnostics)"
      description="ประเมินความปลอดภัยพื้นฐาน การจัดสรรสิทธิ์ระดับสูง การพยายามล็อกอินล้มเหลว และการตรวจสอบเชิงลึก"
      onRefresh={fetchSecurity}
      isRefreshing={loading}
    >
      <div className="space-y-6">
        {/* Top Summary Box */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-shield-halved text-primary-500"></i>
              <span>System Security Posture</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ผู้ใช้ทั้งหมด: {data?.summary?.totalUsers || 0} บัญชี · Super Admins: {data?.summary?.superAdminCount || 0} · Admins: {data?.summary?.adminCount || 0}
            </p>
          </div>

          <Link
            href="/inspector"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-500/25 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-magnifying-glass-arrow-right"></i>
            <span>เปิดหน้าสแกนเชิงลึก (System Inspector)</span>
          </Link>
        </div>

        {/* Security Checks List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data?.checks || []).map((c: any) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{c.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(c.status)}`}>
                  {c.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {c.message}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Failed Logins */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-user-lock text-rose-500"></i>
            <span>ประวัติการเข้าสู่ระบบไม่สำเร็จล่าสุด (Recent Failed Logins)</span>
          </h3>

          <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">วัน-เวลา</th>
                  <th className="py-2.5 px-4 font-semibold">Action</th>
                  <th className="py-2.5 px-4 font-semibold">IP Address</th>
                  <th className="py-2.5 px-4 font-semibold">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(data?.recentFailedLogins || []).map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('th-TH')}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {log.ipAddress || '-'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 truncate max-w-sm">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!data?.recentFailedLogins || data.recentFailedLogins.length === 0) && (
            <div className="p-4 text-center text-slate-400 text-xs">
              ไม่พบประวัติการพยายามเข้าสู่ระบบไม่สำเร็จในระบบช่วงนี้
            </div>
          )}
        </div>
      </div>
    </InspectorLayout>
  );
}
