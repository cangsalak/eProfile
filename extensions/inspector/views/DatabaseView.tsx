'use client';

import React, { useState, useEffect, useCallback } from 'react';
import InspectorLayout from './InspectorLayout';

export default function DatabaseView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDb = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/modules/inspector/database');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to inspect database');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDb();
  }, [fetchDb]);

  const maxCount = Math.max(...(data?.tables?.map((t: any) => t.count) || [1]), 1);

  return (
    <InspectorLayout
      activeTab="database"
      title="โครงสร้างและสถิติฐานข้อมูล (Database Diagnostics)"
      description="ตรวจสอบจำนวนแถวข้อมูลในแต่ละตาราง ขนาดไฟล์ฐานข้อมูล SQLite และความเร็วในการตอบสนอง"
      onRefresh={fetchDb}
      isRefreshing={loading}
    >
      <div className="space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400">ขนาดฐานข้อมูล (DB Size)</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {data?.dbSizeMB ?? 0} MB
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">{data?.dbFilePath || 'prisma/dev.db'}</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400">จำนวนระเบียนรวม (Total Records)</div>
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">
              {(data?.totalRecords ?? 0).toLocaleString()} แถว
            </div>
            <div className="text-[11px] text-slate-400 mt-1">จากทั้งหมด {data?.tables?.length ?? 0} ตารางหลัก</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400">ประเภทฐานข้อมูล (Engine)</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {data?.dbType ?? 'SQLite'}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Embedded / Local File</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400">Query Latency</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {data?.latencyMs ?? 0} ms
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Prisma Client Query Time</div>
          </div>
        </div>

        {/* Table Records List */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-table-list text-primary-500"></i>
                <span>สถิติจำนวนข้อมูลแยกตามตาราง (Table Record Distribution)</span>
              </h3>
              <p className="text-xs text-slate-400">แจกแจงจำนวนแถวข้อมูลและสัดส่วนของแต่ละโมเดล</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(data?.tables || []).map((tbl: any) => {
              const percent = Math.round((tbl.count / maxCount) * 100);
              return (
                <div key={tbl.name} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="w-full sm:w-1/3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {tbl.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                        {tbl.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {tbl.thaiName}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full sm:w-1/3 space-y-1">
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percent, 2)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="w-full sm:w-1/6 text-right font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                    {tbl.count.toLocaleString()} <span className="text-xs font-sans font-normal text-slate-400">รายการ</span>
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
