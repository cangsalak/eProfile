'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState({ total: 0, departments: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      router.push('/directory');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/personnel');
        if (res.ok) {
          const data = await res.json();
          const depts = new Set(data.map((p: any) => p.department));
          setStats({ total: data.length, departments: depts.size });
        }
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <i className="fa-solid fa-circle-notch fa-spin text-4xl text-primary-500"></i>
        <p className="mt-4 text-slate-500 dark:text-slate-400">กำลังพาคุณไปหน้าทำเนียบบุคลากร...</p>
      </div>
    );
  }

  return (
    <div className="pb-12 space-y-8 relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 overflow-hidden -z-10 pointer-events-none rounded-3xl">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-primary-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-purple-600/20 blur-[100px] rounded-full mix-blend-screen"></div>
      </div>

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900/80 via-slate-900/90 to-purple-900/80 border border-slate-200 dark:border-slate-700/50 p-8 sm:p-10 shadow-2xl backdrop-blur-xl group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/10 transition-all duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
              ยินดีต้อนรับ, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-300">{currentUser.firstName}</span> 👋
            </h2>
            <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
              เข้าสู่ระบบ eProfile System คุณสามารถดูภาพรวมและจัดการข้อมูลบุคลากรของหน่วยงานได้จากแผงควบคุมนี้
            </p>
          </div>
          <div className="px-5 py-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center shadow-lg">
            <div className={`w-2.5 h-2.5 rounded-full mr-3 ${currentUser.role === 'ADMIN' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'}`}></div>
            <span className="text-sm font-medium text-slate-900 dark:text-white tracking-wide">
              {currentUser.role === 'ADMIN' ? 'สิทธิ์ระดับผู้ดูแลระบบ (Admin)' : 'เจ้าหน้าที่ (Officer)'}
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 relative flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 font-medium animate-pulse">กำลังซิงค์ข้อมูลสถิติ...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stat Card 1 */}
          <div className="group relative bg-slate-50 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 p-6 sm:p-8 rounded-3xl flex items-center overflow-hidden transition-all duration-300 hover:bg-slate-800/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-primary-500/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-500"></div>
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-primary-600/20 rounded-2xl flex items-center justify-center mr-6 border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <i className="fa-solid fa-users text-4xl text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]"></i>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">บุคลากรทั้งหมด</p>
              <div className="flex items-baseline">
                <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">{stats.total}</p>
                <span className="text-lg text-slate-500 font-medium ml-2">นาย</span>
              </div>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="group relative bg-slate-50 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 p-6 sm:p-8 rounded-3xl flex items-center overflow-hidden transition-all duration-300 hover:bg-slate-800/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-emerald-500/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all duration-500"></div>
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl flex items-center justify-center mr-6 border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <i className="fa-solid fa-sitemap text-4xl text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]"></i>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">หน่วยงาน / แผนก</p>
              <div className="flex items-baseline">
                <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">{stats.departments}</p>
                <span className="text-lg text-slate-500 font-medium ml-2">หน่วย</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions (Admin Only) */}
      {currentUser?.role === 'ADMIN' && (
        <div className="mt-10">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
            <i className="fa-solid fa-bolt text-amber-400 mr-3"></i>
            การจัดการด่วน (Quick Actions)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Link href="/manage/personnel" className="group bg-slate-50 dark:bg-slate-800/40 backdrop-blur-md hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-primary-500/50 rounded-2xl p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                <i className="fa-solid fa-address-book text-primary-400 text-xl"></i>
              </div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">จัดการข้อมูลบุคลากร</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">เพิ่ม ลบ หรือแก้ไขข้อมูลประวัติส่วนตัวของกำลังพลทั้งหมดในระบบ</p>
            </Link>
            
            <Link href="/manage/departments" className="group bg-slate-50 dark:bg-slate-800/40 backdrop-blur-md hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500/50 rounded-2xl p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-colors">
                <i className="fa-solid fa-sitemap text-emerald-400 text-xl"></i>
              </div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">โครงสร้างหน่วยงาน</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">กำหนดและแก้ไขรายชื่อแผนกและกองต่างๆ ภายในองค์กร</p>
            </Link>

            <Link href="/settings" className="group bg-slate-50 dark:bg-slate-800/40 backdrop-blur-md hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-purple-500/50 rounded-2xl p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                <i className="fa-solid fa-cogs text-purple-400 text-xl"></i>
              </div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">ตั้งค่าระบบ</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">ปรับแต่งการทำงาน ค่าเริ่มต้น และการเชื่อมต่อ API ของระบบ</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
