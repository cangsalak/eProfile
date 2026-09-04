'use client';

import React from 'react';
import { CalendarView } from '../components/CalendarView';

export default function DutyCalendarView() {
  return (
    <div className="pb-12 animate-fade-in">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">ปฏิทินปฏิบัติงานและการแจ้งเตือน</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">ภาพรวมการปฏิบัติงาน, การประชุม, วันหยุด และข้อมูลการลาของกำลังพล</p>
        </div>

        <CalendarView />
      </div>
    </div>
  );
}
