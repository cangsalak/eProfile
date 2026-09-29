'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeaderExtra } from '@/modules/core/components/layout/PageHeaderContext';
import MediaGallery from '../components/MediaGallery';

export default function UploadGalleryView() {
  return (
    <div className="pb-16 space-y-6 animate-fade-in font-prompt">
      {/* ── Action Header Extra ── */}
      <PageHeaderExtra>
        <div className="flex items-center gap-2">
          <Link
            href="/modules/upload/settings"
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all flex items-center gap-2 shadow-xs"
          >
            <i className="fa-solid fa-server text-xs text-primary-500"></i>
            <span>ตั้งค่า Cloud S3</span>
          </Link>
        </div>
      </PageHeaderExtra>

      <MediaGallery />
    </div>
  );
}
