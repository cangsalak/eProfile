import React from 'react';
import Link from 'next/link';
import { verifyAuth } from '@/lib/auth';

export default async function PublicLandingPage() {
  const user = await verifyAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-100 via-slate-50 to-white dark:from-primary-900/20 dark:via-slate-900 dark:to-slate-950"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-8 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-500"></span>
            ระบบจัดการบุคลากรรุ่นใหม่
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 animate-fade-in-up animation-delay-100">
            ยกระดับการบริหาร <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 dark:from-primary-400 dark:to-primary-300">
              ทรัพยากรบุคคล
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 animate-fade-in-up animation-delay-200">
            แพลตฟอร์มที่รวมทุกฟีเจอร์ที่คุณต้องการ สำหรับการบริหารจัดการบุคลากร การลา ยานพาหนะ และการสื่อสารภายในองค์กร
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up animation-delay-300">
            {user ? (
              <Link 
                href="/dashboard" 
                className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg shadow-primary-600/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2.5"
              >
                <i className="fa-solid fa-gauge"></i>
                <span>เข้าสู่ระบบจัดการ (Dashboard)</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg shadow-primary-600/30 transition-all hover:-translate-y-1"
                >
                  เข้าสู่ระบบสมาชิก
                </Link>
                <Link 
                  href="/register" 
                  className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-2xl font-bold transition-all hover:-translate-y-1"
                >
                  เริ่มต้นใช้งานฟรี
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">จุดเด่นของระบบ eProfile</h2>
            <p className="text-slate-600 dark:text-slate-400">ครบจบในที่เดียว ด้วยโมดูลที่ออกแบบมาเพื่อลดเวลาทำงานของฝ่าย HR และเพิ่มความสะดวกสบายให้กับบุคลากร</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="w-14 h-14 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center text-2xl mb-6">
                <i className="fa-solid fa-users"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">จัดการข้อมูลบุคลากร</h3>
              <p className="text-slate-600 dark:text-slate-400">จัดเก็บข้อมูลประวัติอย่างเป็นระบบ ค้นหาง่าย สร้างบัตรประจำตัวพนักงานได้ทันที</p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center text-2xl mb-6">
                <i className="fa-solid fa-calendar-check"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">ระบบการลาออนไลน์</h3>
              <p className="text-slate-600 dark:text-slate-400">ยื่นใบลาและอนุมัติผ่านระบบได้ทุกที่ พร้อมพิมพ์ใบลาตามแบบฟอร์มราชการ</p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-2xl mb-6">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">ความปลอดภัยระดับสูง</h3>
              <p className="text-slate-600 dark:text-slate-400">เข้ารหัสข้อมูลตามมาตรฐานความปลอดภัย พร้อมระบบกำหนดสิทธิ์การเข้าถึงแบบละเอียด</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
