'use client';

import React, { useState, useEffect, useCallback } from 'react';
import InspectorLayout from './InspectorLayout';
import { Modal, Button } from '@/components/ui';

export default function ErrorLogView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'errors' | 'warnings' | 'auth'>('errors');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/modules/inspector/errors?filter=${filter}&limit=100`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to load error logs');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadgeClass = (action: string) => {
    if (action.startsWith('ERROR') || action.includes('FAIL')) {
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50';
    }
    if (action.startsWith('WARN') || action.includes('WARN')) {
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
    }
    if (action.includes('LOGIN') || action.includes('AUTH')) {
      return 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900/50';
    }
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  return (
    <InspectorLayout
      activeTab="errors"
      title="บันทึกข้อผิดพลาดและเหตุการณ์ระบบ (Error Logs & Audit)"
      description="ตรวจสอบ Audit Logs ที่มีข้อผิดพลาด การเข้าสู่ระบบล้มเหลว หรือการแจ้งเตือนจากระบบ"
      onRefresh={fetchLogs}
      isRefreshing={loading}
    >
      <div className="space-y-6">
        {/* Stats summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400">บันทึกทั้งหมดในระบบ</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {data?.stats?.totalAuditLogs ?? 0}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400">รายการข้อผิดพลาด (Errors)</div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {data?.stats?.errorLogs ?? 0}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400">แสดงผลปัจจุบัน</div>
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">
              {data?.stats?.returnedCount ?? 0}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          {[
            { id: 'errors', label: 'ข้อผิดพลาด (Errors)', icon: 'fa-solid fa-circle-xmark' },
            { id: 'warnings', label: 'คำเตือน (Warnings)', icon: 'fa-solid fa-triangle-exclamation' },
            { id: 'auth', label: 'ความปลอดภัย/เข้าสู่ระบบ (Auth)', icon: 'fa-solid fa-user-shield' },
            { id: 'all', label: 'ทั้งหมด (All Logs)', icon: 'fa-solid fa-list' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filter === tab.id
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Log Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">วัน-เวลา</th>
                  <th className="py-3 px-4 font-semibold">Action / Event</th>
                  <th className="py-3 px-4 font-semibold">Entity</th>
                  <th className="py-3 px-4 font-semibold">ผู้ดำเนินการ</th>
                  <th className="py-3 px-4 font-semibold">IP Address</th>
                  <th className="py-3 px-4 font-semibold text-right">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(data?.logs || []).map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString('th-TH')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                      {log.entity} {log.entityId ? `(#${log.entityId.slice(0, 6)})` : ''}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {log.personnel ? `${log.personnel.prefix || ''}${log.personnel.firstName} ${log.personnel.lastName}` : 'System'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {log.ipAddress || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/50 dark:hover:text-primary-400 transition-colors"
                      >
                        ดู JSON
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!data?.logs || data.logs.length === 0) && !loading && (
            <div className="p-8 text-center text-slate-400 text-xs">
              ไม่พบรายการบันทึกในหมวดหมู่นี้
            </div>
          )}
        </div>

        {/* JSON Detail Modal */}
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`รายละเอียดบันทึก: ${selectedLog?.action || ''}`}
          icon="fa-solid fa-file-code"
          size="lg"
          footer={
            <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
              ปิด
            </Button>
          }
        >
          {selectedLog && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <div><strong>ID:</strong> {selectedLog.id}</div>
                <div><strong>Action:</strong> {selectedLog.action}</div>
                <div><strong>Entity:</strong> {selectedLog.entity} ({selectedLog.entityId || 'N/A'})</div>
                <div><strong>Timestamp:</strong> {new Date(selectedLog.createdAt).toISOString()}</div>
                <div><strong>IP Address:</strong> {selectedLog.ipAddress || 'Unknown'}</div>
              </div>
              <div>
                <div className="font-sans font-bold text-slate-700 dark:text-slate-300 mb-1">Payload / Details:</div>
                <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl overflow-x-auto text-[11px] leading-relaxed">
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(selectedLog.details || '{}'), null, 2);
                    } catch {
                      return selectedLog.details || 'No additional details';
                    }
                  })()}
                </pre>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </InspectorLayout>
  );
}
