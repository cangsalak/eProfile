'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState({ total: 0, departments: 0 });
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [systemName, setSystemName] = useState('eProfile System');

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
        const [resPersonnel, resPosts, resSettings] = await Promise.all([
          fetch('/api/personnel'),
          fetch('/api/posts?published=true'),
          fetch('/api/settings')
        ]);
        
        if (resSettings.ok) {
          const settings = await resSettings.json();
          if (settings.systemName) setSystemName(settings.systemName);
        }

        if (resPersonnel.ok) {
          const data = await resPersonnel.json();
          const depts = new Set(data.map((p: any) => p.department));
          setStats({ total: data.length, departments: depts.size });
        }
        
        if (resPosts.ok) {
          const data = await resPosts.json();
          setPosts(data.slice(0, 5)); // show top 5 recent announcements
        }
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] py-20">
        <div className="relative w-16 h-16 flex items-center justify-center">
           <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
           <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-6 text-slate-500 dark:text-slate-400 font-medium">กำลังเตรียมข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="pb-12 space-y-8 animate-fade-in">
      
      {/* Welcome Banner - Redesigned for clarity & contrast */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Soft decorative background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary-100/50 to-purple-100/50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70 pointer-events-none"></div>
        
        <div className="relative z-10 p-8 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start space-x-6">
            <div className="hidden sm:flex shrink-0 w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl items-center justify-center shadow-lg text-white text-3xl font-bold">
              {currentUser.firstName?.charAt(0)}
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 mb-4">
                <div className={`w-2 h-2 rounded-full ${['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role || '') ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                <span>{['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role || '') ? 'ผู้ดูแลระบบ (Admin)' : 'เจ้าหน้าที่ (Officer)'}</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                สวัสดี, <span className="text-primary-600 dark:text-primary-400">{currentUser.firstName}</span> 👋
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
                ยินดีต้อนรับเข้าสู่ระบบ {systemName} คุณสามารถดูภาพรวม จัดการข้อมูลบุคลากร และดูประกาศข่าวสารล่าสุดได้จากแผงควบคุมนี้
              </p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 mt-4 animate-pulse">กำลังซิงค์ข้อมูลสถิติ...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stat Card 1 - Modern Minimalist */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">บุคลากรทั้งหมดในระบบ</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{stats.total}</h3>
                <span className="text-slate-500 dark:text-slate-500 font-medium">นาย</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
              <i className="fa-solid fa-users text-2xl"></i>
            </div>
          </div>

          {/* Stat Card 2 - Modern Minimalist */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">หน่วยงาน / แผนก</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{stats.departments}</h3>
                <span className="text-slate-500 dark:text-slate-500 font-medium">หน่วย</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <i className="fa-solid fa-sitemap text-2xl"></i>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pt-4">
        
        {/* Quick Actions (Admin Only) - 2 Columns wide on XL */}
        {['ADMIN', 'SUPER_ADMIN'].includes(currentUser?.role || '') && (
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-3">
                  <i className="fa-solid fa-bolt"></i>
                </div>
                การจัดการด่วน (Quick Actions)
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/manage/personnel" className="group flex items-start p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary-500/50 hover:shadow-md transition-all">
                <div className="w-12 h-12 shrink-0 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 transition-colors">
                  <i className="fa-solid fa-address-book text-slate-400 group-hover:text-primary-500 text-xl"></i>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">จัดการข้อมูลบุคลากร</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">เพิ่ม ลบ แก้ไข ข้อมูลประวัติ และปริ้นบัตรประจำตัว</p>
                </div>
              </Link>
              
              <Link href="/manage/departments" className="group flex items-start p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-emerald-500/50 hover:shadow-md transition-all">
                <div className="w-12 h-12 shrink-0 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mr-4 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-600 transition-colors">
                  <i className="fa-solid fa-sitemap text-slate-400 group-hover:text-emerald-500 text-xl"></i>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">โครงสร้างหน่วยงาน</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">บริหารจัดการรายชื่อแผนกและสายบังคับบัญชา</p>
                </div>
              </Link>

              <Link href="/manage/posts" className="group flex items-start p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500/50 hover:shadow-md transition-all">
                <div className="w-12 h-12 shrink-0 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 transition-colors">
                  <i className="fa-solid fa-bullhorn text-slate-400 group-hover:text-blue-500 text-xl"></i>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">จัดการประกาศข่าว</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">เขียนประกาศ ข่าวสาร ประชาสัมพันธ์องค์กร</p>
                </div>
              </Link>

              <Link href="/settings" className="group flex items-start p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-purple-500/50 hover:shadow-md transition-all">
                <div className="w-12 h-12 shrink-0 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mr-4 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 group-hover:text-purple-600 transition-colors">
                  <i className="fa-solid fa-cogs text-slate-400 group-hover:text-purple-500 text-xl"></i>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">ตั้งค่าระบบ (Settings)</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">ออกแบบบัตรประจำตัว เชื่อมต่อ LINE / Email / API</p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Announcements / News Feed - 1 Column wide on XL */}
        <div className={['ADMIN', 'SUPER_ADMIN'].includes(currentUser?.role || '') ? "xl:col-span-1" : "xl:col-span-3"}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mr-3">
                <i className="fa-regular fa-newspaper"></i>
              </div>
              ข่าวสารและประกาศ
            </h3>
            {posts.length > 0 && (
               <Link href="/news" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">ดูทั้งหมด</Link>
            )}
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            {posts.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
                  <i className="fa-solid fa-box-open text-2xl"></i>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">ยังไม่มีประกาศข่าวสาร</p>
                <p className="text-sm text-slate-400 mt-1">ข่าวสารใหม่จะแสดงที่นี่</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {posts.map(post => (
                  <div key={post.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center space-x-2 mb-2 text-xs font-medium text-slate-500">
                      <span className="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded">ประกาศ</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <Link href={`/news/${post.id}`} className="block group">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors mb-2 line-clamp-2 leading-snug">
                        {post.title}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                        {post.content}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
