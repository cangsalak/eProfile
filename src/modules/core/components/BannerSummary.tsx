'use client';

import React from 'react';

interface BannerSummaryProps {
  totalPersonnel: number;
  totalDepartments: number;
}

export default function BannerSummary({ totalPersonnel, totalDepartments }: BannerSummaryProps) {
  return (
    <div className="glass-card p-6 mb-8 text-center md:text-left md:flex justify-between items-center gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">ทำเนียบบุคลากรและโปรไฟล์อิเล็กทรอนิกส์</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          ค้นหา ตรวจสอบประวัติ ทักษะความเชี่ยวชาญ และพิมพ์บัตรประจำตัวดิจิทัลของบุคลากรภายในหน่วยงาน
        </p>
      </div>
      <div className="flex gap-4 mt-4 md:mt-0 justify-center">
        <div className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
          <div className="text-2xl font-bold text-primary-400">{totalPersonnel}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">บุคลากรทั้งหมด</div>
        </div>
        <div className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
          <div className="text-2xl font-bold text-emerald-400">{totalDepartments}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">กอง / ฝ่ายงาน</div>
        </div>
      </div>
    </div>
  );
}
