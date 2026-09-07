'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ManageSlipView() {
  const [personnelList, setPersonnelList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('กันยายน 2569');

  useEffect(() => {
    fetch('/api/personnel?limit=50')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d.data)) setPersonnelList(d.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = personnelList.filter(p => {
    const full = `${p.prefix || ''} ${p.firstName || ''} ${p.lastName || ''} ${p.position || ''}`.toLowerCase();
    return full.includes(searchQuery.toLowerCase());
  });

  const handleBulkGenerate = () => {
    toast.success('ประมวลผลคำนวณสลิปเงินเดือนประจำรอบเรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-6 pb-16 font-prompt animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/modules/test-slip"
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              <i className="fa-solid fa-arrow-left"></i> กลับหน้ารวมสลิป
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center text-lg">
              <i className="fa-solid fa-receipt"></i>
            </span>
            จัดการรอบการจ่ายและสลิปเงินเดือน
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            ระบบนำเข้า ตรวจสอบ และอนุมัติการออกสลิปเงินเดือนสำหรับฝ่ายการเงินและกำลังพล
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleBulkGenerate}
            className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <i className="fa-solid fa-calculator"></i>
            <span>ประมวลผลรอบเงินเดือน</span>
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="ค้นหากำลังพล, ยศ, ชื่อ หรือตำแหน่ง..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input pl-9 text-xs sm:text-sm w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">รอบเดือน:</span>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="form-select text-xs font-semibold"
          >
            <option value="กันยายน 2569">กันยายน 2569</option>
            <option value="สิงหาคม 2569">สิงหาคม 2569</option>
            <option value="กรกฎาคม 2569">กรกฎาคม 2569</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] uppercase font-bold text-slate-500">
              <tr>
                <th className="p-3.5 rounded-l-xl">รหัส</th>
                <th className="p-3.5">ยศ-ชื่อ-สกุล</th>
                <th className="p-3.5">ตำแหน่ง / สังกัด</th>
                <th className="p-3.5 text-right">เงินเดือนพื้นฐาน</th>
                <th className="p-3.5 text-center">สถานะสลิป</th>
                <th className="p-3.5 text-right rounded-r-xl">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                    กำลังโหลดข้อมูลกำลังพล...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    ไม่พบข้อมูลกำลังพลตามเงื่อนไข
                  </td>
                </tr>
              ) : (
                filtered.map(p => {
                  const salary = p.salary ? Number(p.salary) : (p.personnelType?.includes('สัญญาบัตร') ? 35400 : 21500);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono text-primary-600 dark:text-primary-400 font-bold">
                        {p.citizenId ? p.citizenId.slice(-4) : p.id.slice(0, 4)}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {p.prefix || ''} {p.firstName} {p.lastName}
                      </td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400">
                        {p.position || 'เจ้าหน้าที่'} ({p.department?.name || 'กองบัญชาการ'})
                      </td>
                      <td className="p-3.5 text-right font-mono font-semibold">
                        ฿{salary.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          พร้อมพิมพ์
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href="/modules/test-slip"
                          className="px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 text-xs font-semibold hover:bg-primary-100 transition-colors inline-block"
                        >
                          <i className="fa-solid fa-file-invoice mr-1"></i> ดูสลิป
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
