'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MaintenancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [maintenanceInfo, setMaintenanceInfo] = useState({
    isMaintenance: true,
    message: 'ระบบกำลังอยู่ระหว่างการปิดปรับปรุงเพื่อเพิ่มประสิทธิภาพการทำงาน ขออภัยในความไม่สะดวก',
    endTime: '',
  });

  const checkStatus = React.useCallback(async () => {
    try {
      const res = await fetch('/api/settings/maintenance');
      if (res.ok) {
        const data = await res.json();
        setMaintenanceInfo(data);
        if (!data.isMaintenance) {
          router.push('/');
        }
      }
    } catch {
      // Ignore network errors during polling
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white font-prompt px-4 py-12 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-xl w-full p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl text-center space-y-6 relative z-10 animate-fade-in">
        
        {/* Animated Construction Icon */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-500/20 rounded-3xl animate-pulse blur-xl"></div>
          <div className="w-24 h-24 bg-gradient-to-tr from-amber-500/20 to-orange-500/10 rounded-3xl border border-amber-500/30 flex items-center justify-center relative shadow-inner">
            <i className="fa-solid fa-wrench text-4xl text-amber-400 animate-bounce"></i>
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>โหมดปิดปรับปรุงระบบชั่วคราว (Maintenance Mode)</span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            กำลังปรับปรุงเว็บไซต์
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
            {maintenanceInfo.message}
          </p>
        </div>

        {/* Estimated Time Card (if specified) */}
        {maintenanceInfo.endTime && (
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center gap-3 text-xs text-slate-300">
            <i className="fa-regular fa-clock text-amber-400 text-base"></i>
            <div>
              <span className="text-slate-400">คาดว่าจะเปิดให้บริการ: </span>
              <span className="font-semibold text-white">{maintenanceInfo.endTime}</span>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-400 flex items-center justify-center gap-2">
          <i className="fa-solid fa-arrows-rotate fa-spin text-xs"></i>
          <span>ระบบจะนำท่านเข้าสู่เว็บไซต์อัตโนมัติทันทีที่การปรับปรุงเสร็จสิ้น</span>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={checkStatus}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-rotate-right"></i>
            <span>ตรวจสอบสถานะอีกครั้ง</span>
          </button>

          <Link
            href="/login"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-user-shield"></i>
            <span>เข้าสู่ระบบสำหรับผู้ดูแล</span>
          </Link>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-8 text-xs text-slate-500 flex items-center gap-2">
        <span>eProfile System</span>
        <span>•</span>
        <span>ระบบทำเนียบบุคลากรและโปรไฟล์อิเล็กทรอนิกส์</span>
      </div>
    </div>
  );
}
