'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';
import UnifiedCommunicationsManager from '../components/UnifiedCommunicationsManager';

export default function NewsDashboardView() {
  return (
    <div className="space-y-6 animate-fade-in pb-16 font-prompt">
      {/* ── Submenu Header Navigation ── */}
      <PageHeaderExtra>
        <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
          <Link
            href="/modules/news"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 bg-primary-600 text-white shadow-sm shadow-primary-500/30"
          >
            <i className="fa-solid fa-newspaper text-xs"></i>
            <span>ข่าวสารและประกาศ</span>
          </Link>
          <Link
            href="/modules/news/inbox"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-bell text-xs"></i>
            <span>กล่องการแจ้งเตือน</span>
          </Link>
          <Link
            href="/modules/news/settings"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-paper-plane text-xs"></i>
            <span>ตั้งค่า LINE & Email</span>
          </Link>
        </div>
      </PageHeaderExtra>

      <UnifiedCommunicationsManager initialTab="posts" />
    </div>
  );
}
