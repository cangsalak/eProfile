'use client';
import React, { useState, useEffect } from 'react';

export default function ManageAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/audit-logs?take=100');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md text-xs font-semibold">CREATE</span>;
      case 'UPDATE': return <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-md text-xs font-semibold">UPDATE</span>;
      case 'DELETE': return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-xs font-semibold">DELETE</span>;
      case 'LOGIN': return <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-xs font-semibold">LOGIN</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 rounded-md text-xs font-semibold">{action}</span>;
    }
  };

  return (
    <div className="pb-12 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">บันทึกระบบ (Audit Logs)</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">ตรวจสอบประวัติการใช้งานและการแก้ไขข้อมูลในระบบ (100 รายการล่าสุด)</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">ไม่มีบันทึกข้อมูล</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                  <th className="px-4 py-3 font-medium">วันที่-เวลา</th>
                  <th className="px-4 py-3 font-medium">ผู้ดำเนินการ</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">ระบบ (Entity)</th>
                  <th className="px-4 py-3 font-medium">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('th-TH')}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {log.personnel ? `${log.personnel.firstName} ${log.personnel.lastName}` : 'System'}
                    </td>
                    <td className="px-4 py-3">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                      {log.entity}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
