'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-prompt overflow-hidden relative p-4 sm:p-8">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '-2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-lg bg-white/90 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-black/60 animate-fade-in text-center">
        {/* Top Decorative Accent Line */}
        <div className="absolute top-0 left-12 right-12 h-0.5 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent rounded-full" />

        {/* 403 Visual Icon / Badge */}
        <div className="relative mb-6 inline-flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 blur-xl animate-pulse" />
          <div className="relative flex items-center justify-center h-24 w-24 rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/60 dark:to-slate-800 border border-amber-200/80 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 shadow-lg shadow-amber-500/10">
            <i className="fa-solid fa-shield-halved text-4xl" />
          </div>
        </div>

        {/* Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 tracking-wide">
            <i className="fa-solid fa-lock text-[11px]" />
            <span>403 FORBIDDEN • สิทธิ์การเข้าถึงไม่เพียงพอ</span>
          </span>
        </div>

        {/* Title & Message */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          คุณไม่มีสิทธิ์เข้าถึงหน้านี้
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto mb-8">
          บัญชีผู้ใช้ปัจจุบันของคุณไม่มีสิทธิ์ในการดูหรือจัดการข้อมูลในส่วนนี้ หากคุณเชื่อว่านี่เป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ (Admin)
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-arrow-left text-xs" />
            <span>ย้อนกลับหน้าเดิม</span>
          </button>
          
          <Link
            href="/"
            className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-primary-600/20 transition flex items-center justify-center gap-2"
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
