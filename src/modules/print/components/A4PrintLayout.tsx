'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import '../styles/print.css';

export interface A4PrintLayoutProps {
  documentTitle?: string;
  backUrl?: string;
  backLabel?: string;
  formNumber?: string;
  showPrintButton?: boolean;
  customAction?: React.ReactNode;
  children: React.ReactNode;
}

export const A4PrintLayout: React.FC<A4PrintLayoutProps> = ({
  documentTitle = 'ตัวอย่างก่อนพิมพ์ (Print Preview)',
  backUrl = '/modules',
  backLabel = 'กลับ',
  formNumber,
  showPrintButton = true,
  customAction,
  children,
}) => {
  // Support keyboard shortcut (Ctrl+P / Cmd+P) smoothly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        // Allow native print, which is handled cleanly by our print.css
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="print-root min-h-screen bg-slate-200 text-slate-900 dark:text-slate-900 py-16 print:bg-white print:py-0 font-['TH_Sarabun_New','THSarabunNew','Sarabun',sans-serif]">
      {/* ── 1. Floating Action Bar (Hidden when printing via .no-print) ── */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm z-50 flex items-center justify-between px-6 no-print font-prompt text-slate-800">
        <div className="flex items-center gap-3">
          {backUrl && (
            <Link
              href={backUrl}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-sm transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>{backLabel}</span>
            </Link>
          )}
          {backUrl && <div className="h-4 w-px bg-slate-300"></div>}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">{documentTitle}</span>
            {formNumber && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded border border-slate-200">
                {formNumber}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {customAction}
          {showPrintButton && (
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-print"></i>
              <span>สั่งพิมพ์เอกสาร</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Printable Content Container ── */}
      <div className="print-page w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
};

export default A4PrintLayout;
