'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({ error, reset }: ErrorProps) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log error to client-side console
    console.error('[Application Error]:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-prompt overflow-hidden relative p-4 sm:p-8">
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '-2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-lg bg-white/90 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-black/60 animate-fade-in text-center">
        {/* Top Decorative Accent Line */}
        <div className="absolute top-0 left-12 right-12 h-0.5 bg-gradient-to-r from-transparent via-rose-500/60 to-transparent rounded-full" />

        {/* Error Icon */}
        <div className="relative mb-6 inline-flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-rose-500/10 dark:bg-rose-500/20 blur-xl animate-pulse" />
          <div className="relative flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/60 dark:to-slate-800 border border-rose-200/80 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 shadow-lg shadow-rose-500/10">
            <i className="fa-solid fa-triangle-exclamation text-3xl" />
          </div>
        </div>

        {/* Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 tracking-wide">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>SYSTEM ERROR • เกิดข้อผิดพลาดในการทำงาน</span>
          </span>
        </div>

        {/* Title & Message */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          ขออภัย ระบบพบข้อผิดพลาด
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto mb-6">
          เกิดปัญหาขัดข้องขณะประมวลผลคำขอของคุณ กรุณาลองใหม่อีกครั้ง หรือกลับสู่หน้าหลัก
        </p>

        {/* Error Digest / Identifier */}
        {error.digest && (
          <div className="mb-6 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-xs font-mono text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Error Digest:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{error.digest}</span>
          </div>
        )}

        {/* Technical Details Toggle */}
        <div className="mb-6 text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1.5 mx-auto transition"
          >
            <i className={`fa-solid ${showDetails ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px]`} />
            <span>{showDetails ? 'ซ่อนรายละเอียดทางเทคนิค' : 'แสดงรายละเอียดทางเทคนิค (Technical Details)'}</span>
          </button>

          {showDetails && (
            <div className="mt-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-rose-600 dark:text-rose-400 overflow-x-auto max-h-40 leading-relaxed">
              <p className="font-bold">{error.name}: {error.message}</p>
              {error.stack && (
                <pre className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 whitespace-pre-wrap">
                  {error.stack.split('\n').slice(0, 5).join('\n')}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-primary-600/20 transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-rotate text-xs" />
            <span>ลองใหม่อีกครั้ง (Retry)</span>
          </button>
          
          <Link
            href="/"
            className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-house text-xs" />
            <span>กลับหน้าแรก</span>
          </Link>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="relative z-10 mt-8 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>eProfile System</span>
        <span>•</span>
        <span>ระบบทำเนียบบุคลากรและโปรไฟล์อิเล็กทรอนิกส์</span>
      </footer>
    </div>
  );
}
