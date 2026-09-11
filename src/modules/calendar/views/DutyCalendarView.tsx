'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarView } from '../components/CalendarView';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';

export default function DutyCalendarView() {
  return (
    <div className="space-y-6 pb-12 animate-fade-in font-prompt">
      <PageHeaderExtra>
        <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
          <Link
            href="/modules/calendar"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 bg-primary-600 text-white shadow-sm shadow-primary-500/30"
          >
            <i className="fa-solid fa-calendar-days text-xs"></i>
            <span>ปฏิทินปฏิบัติงาน</span>
          </Link>
          <Link
            href="/modules/calendar/settings"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60"
          >
            <i className="fa-solid fa-sliders text-xs text-slate-400"></i>
            <span>ตั้งค่าปฏิทินและเวร</span>
          </Link>
        </div>
      </PageHeaderExtra>
      <CalendarView />
    </div>
  );
}
