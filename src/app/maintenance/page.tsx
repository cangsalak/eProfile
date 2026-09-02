'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MaintenancePage() {
  const router = useRouter();
  const [dots, setDots] = useState('');
  const [maintenanceInfo, setMaintenanceInfo] = useState({
    isMaintenance: true,
    message: 'ระบบกำลังอยู่ระหว่างการปิดปรับปรุงเพื่อเพิ่มประสิทธิภาพการทำงาน ขออภัยในความไม่สะดวก',
    endTime: '',
  });

  // Animated dots
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 600);
    return () => clearInterval(t);
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/maintenance');
      if (res.ok) {
        const data = await res.json();
        setMaintenanceInfo(data);
        if (!data.isMaintenance) router.push('/');
      }
    } catch { /* ignore */ }
  }, [router]);

  useEffect(() => {
    checkStatus();
    const iv = setInterval(checkStatus, 15000);
    return () => clearInterval(iv);
  }, [checkStatus]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 font-prompt overflow-hidden relative p-4 sm:p-8">
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-primary-500/15 dark:bg-primary-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '-2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-lg bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/60 animate-fade-in">
        {/* Top Decorative Accent Line */}
        <div className="absolute top-0 left-12 right-12 h-0.5 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent rounded-full" />

        {/* Maintenance Icon */}
        <div className="w-20 h-20 mx-auto mb-6 relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-amber-500/10 border border-amber-500/20 animate-ping opacity-25" />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10 relative z-10">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="animate-spin text-amber-400" style={{ animationDuration: '8s' }}>
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" fill="currentColor" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Badge */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/25 text-amber-300 tracking-wide">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>โหมดปิดปรับปรุงระบบ (Maintenance Mode)</span>
          </span>
        </div>

        {/* Title & Message */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            กำลังปรับปรุงเว็บไซต์{dots}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            {maintenanceInfo.message}
          </p>
        </div>

        {/* Shimmer Progress Track */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>กำลังดำเนินการปรับปรุง</span>
            <span>กรุณารอสักครู่</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Auto Refresh Status Banner */}
        <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-xl mb-4 text-xs text-slate-400">
          <i className="fa-solid fa-arrows-rotate text-amber-400 animate-spin text-xs"></i>
          <span>ตรวจสอบสถานะทุก 15 วินาที —</span>
          <span className="text-slate-200 font-medium">จะนำท่านกลับอัตโนมัติ</span>
        </div>

        {/* Estimated Completion Time */}
        {maintenanceInfo.endTime && (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-primary-950/40 border border-primary-900/60 rounded-xl mb-6 text-xs text-slate-300">
            <i className="fa-regular fa-clock text-primary-400 text-xs"></i>
            <span>คาดว่าจะเปิดให้บริการ:</span>
            <span className="text-primary-300 font-bold ml-auto">{maintenanceInfo.endTime}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={checkStatus}
            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-rotate text-xs"></i>
            <span>ตรวจสอบสถานะ</span>
          </button>
          <Link
            href="/login"
            className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-primary-600/20 transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-shield-halved text-xs"></i>
            <span>เข้าสู่ระบบผู้ดูแล</span>
          </Link>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="relative z-10 mt-8 flex items-center gap-2 text-xs text-slate-500">
        <span>eProfile System</span>
        <span>•</span>
        <span>ระบบทำเนียบบุคลากรและโปรไฟล์อิเล็กทรอนิกส์</span>
      </footer>
    </div>
  );
}
