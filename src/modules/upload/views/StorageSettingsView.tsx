'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';
import S3ConfigForm from '../components/S3ConfigForm';

export default function StorageSettingsView() {
  return (
    <div className="pb-16 space-y-6 animate-fade-in font-prompt">
      {/* ── Submenu Header Navigation ── */}
      <PageHeaderExtra>
        <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
          <Link
            href="/modules/upload"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-photo-film text-xs"></i>
            <span>คลังไฟล์และสื่อ</span>
          </Link>
          <Link
            href="/modules/upload/settings"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 bg-primary-600 text-white shadow-sm shadow-primary-500/30"
          >
            <i className="fa-solid fa-server text-xs"></i>
            <span>ตั้งค่า Cloud S3</span>
          </Link>
        </div>
      </PageHeaderExtra>

      <S3ConfigForm />
    </div>
  );
}
