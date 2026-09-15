'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Users, Building2 } from 'lucide-react';

interface BannerSummaryProps {
  totalPersonnel: number;
  totalDepartments: number;
}

export default function BannerSummary({ totalPersonnel, totalDepartments }: BannerSummaryProps) {
  return (
    <Card variant="convex" className="p-6 sm:p-7 mb-6 rounded-[24px]">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-1.5 flex items-center justify-center md:justify-start gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/50 text-base">
              <i className="fa-solid fa-address-book" />
            </span>
            <span>ทำเนียบบุคลากรและโปรไฟล์อิเล็กทรอนิกส์</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            ค้นหา ตรวจสอบประวัติ ทักษะความเชี่ยวชาญ และพิมพ์บัตรประจำตัวดิจิทัลของบุคลากรภายในหน่วยงาน
          </p>
        </div>

        <div className="flex gap-3.5 mt-2 md:mt-0 justify-center shrink-0">
          <div className="px-5 py-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-center shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-xl sm:text-2xl font-black text-primary-600 dark:text-primary-400 font-mono">
              <Users className="w-5 h-5 text-primary-500" />
              <span>{totalPersonnel}</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">บุคลากรทั้งหมด</div>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-center shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              <Building2 className="w-5 h-5 text-emerald-500" />
              <span>{totalDepartments}</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">กอง / ฝ่ายงาน</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
