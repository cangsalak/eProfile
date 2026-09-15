'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import { Card, StatCard, Badge, Button } from '@/components/ui';
import {
  Users,
  Building2,
  CalendarDays,
  Plane,
  Bell,
  Newspaper,
  ShieldCheck,
  Zap,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [systemName, setSystemName] = useState('ระบบฐานข้อมูลบุคลากร (eProfile)');
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [personnelStats, setPersonnelStats] = useState<{
    total: number;
    active: number;
    inactive: number;
    departments: number;
  }>({ total: 0, active: 0, inactive: 0, departments: 0 });

  const [activeLeavesToday, setActiveLeavesToday] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentNotifs, setRecentNotifs] = useState<any[]>([]);


  const router = useRouter();

  // Greeting time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'อรุณสวัสดิ์';
    if (hour < 17) return 'สวัสดีตอนบ่าย';
    return 'สวัสดีตอนเย็น';
  }, []);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  useEffect(() => {
    // 1. Fetch Current User
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Unauthenticated');
      })
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        } else {
          router.push('/login');
        }
      })
      .catch(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          try {
            setCurrentUser(JSON.parse(savedUser));
          } catch {
            router.push('/login');
          }
        } else {
          router.push('/login');
        }
      });

    // 2. Fetch Aggregated Metrics
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [resStats, resSettings, resLeaves, resPosts, resNotifs] = await Promise.all([
          fetch('/api/personnel/stats').catch(() => null),
          fetch('/api/settings').catch(() => null),
          fetch('/api/modules/leaves').catch(() => null),
          fetch('/api/modules/news/posts?published=true').catch(() => null),
          fetch('/api/modules/news/notifications').catch(() => null),
        ]);

        // Settings
        if (resSettings && resSettings.ok) {
          const settings = await resSettings.json();
          if (settings.systemName) setSystemName(settings.systemName);
        }

        // Personnel Stats
        if (resStats && resStats.ok) {
          const statsData = await resStats.json();
          setPersonnelStats({
            total: statsData.summary?.total || 0,
            active: statsData.summary?.active || 0,
            inactive: statsData.summary?.inactive || 0,
            departments: statsData.byDepartment?.length || 0,
          });
        }

        // Leaves today
        if (resLeaves && resLeaves.ok) {
          const leavesData = await resLeaves.json();
          const leavesList = Array.isArray(leavesData) ? leavesData : leavesData.data || [];
          const now = new Date();
          const activeToday = leavesList.filter((l: any) => {
            const start = new Date(l.startDate);
            const end = new Date(l.endDate);
            end.setHours(23, 59, 59, 999);
            return (
              ['อนุมัติแล้ว', 'รออนุมัติ'].includes(l.status) &&
              start <= now &&
              now <= end
            );
          });
          setActiveLeavesToday(activeToday);
        }

        // Posts
        if (resPosts && resPosts.ok) {
          const postsData = await resPosts.json();
          setRecentPosts(Array.isArray(postsData) ? postsData.slice(0, 4) : []);
        }

        // Notifications
        if (resNotifs && resNotifs.ok) {
          const notifsData = await resNotifs.json();
          setRecentNotifs(Array.isArray(notifsData) ? notifsData.slice(0, 4) : []);
        }

      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);



  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-20 font-prompt">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium text-sm">กำลังเตรียมข้อมูลระบบ...</p>
      </div>
    );
  }

  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(currentUser?.role || '');

  return (
    <div className="pb-16 space-y-6 animate-fade-in font-prompt">
      {/* Welcome Banner */}
      <Card variant="convex" className="relative overflow-hidden p-6 sm:p-8 rounded-[28px]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary-400/20 via-primary-300/10 to-transparent dark:from-primary-600/15 dark:to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-start space-x-4 sm:space-x-5">
            <div className="hidden sm:flex shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl sm:rounded-3xl items-center justify-center shadow-lg shadow-primary-500/25 text-white text-2xl sm:text-3xl font-black">
              {currentUser.firstName ? currentUser.firstName.charAt(0) : 'U'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <Badge
                  variant={isAdmin ? 'danger' : 'success'}
                  size="sm"
                  className="font-bold"
                >
                  {currentUser.role === 'SUPER_ADMIN'
                    ? 'ผู้ดูแลระบบระดับสูง (Super Admin)'
                    : isAdmin
                    ? 'ผู้ดูแลระบบ (Admin)'
                    : 'เจ้าหน้าที่ผู้ใช้งาน (User)'}
                </Badge>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-primary-500" />
                  {todayFormatted}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mb-1.5">
                {greeting},{' '}
                <span className="text-primary-600 dark:text-primary-400">
                  {currentUser.firstName} {currentUser.lastName || ''}
                </span>{' '}
                👋
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                ยินดีต้อนรับเข้าสู่ {systemName} ติดตามสถิติกำลังพล ตรวจสอบการลา ปฏิทินปฏิบัติงาน และศูนย์กระจายข่าวสารได้จากแดชบอร์ดนี้
              </p>
            </div>
          </div>

          {/* Quick Status Pills */}
          <div className="flex flex-wrap lg:flex-col gap-2 w-full lg:w-auto shrink-0">
            <div className="flex-1 lg:flex-none px-4 py-2 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">สถานะปฏิบัติงานวันนี้</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ปกติ ({personnelStats.active} นาย)
              </span>
            </div>

            <div className="flex-1 lg:flex-none px-4 py-2 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">อยู่ระหว่างการลา</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {activeLeavesToday.length} นาย
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 4 Overview StatCards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="กำลังพลทั้งหมด"
          value={personnelStats.total}
          unit="นาย"
          icon="fa-solid fa-users"
          trend={{ value: '+12.5%', isPositive: true }}
        />
        <StatCard
          title="หน่วยงานในสังกัด"
          value={personnelStats.departments}
          unit="กอง/ฝ่าย"
          icon="fa-solid fa-building"
          trend={{ value: '+4.35%', isPositive: true }}
        />
        <StatCard
          title="คำร้องการลาวันนี้"
          value={activeLeavesToday.length}
          unit="รายการ"
          icon="fa-solid fa-plane-departure"
          trend={{ value: '+2.59%', isPositive: true }}
        />
        <StatCard
          title="พร้อมปฏิบัติหน้าที่"
          value={personnelStats.active}
          unit="นาย"
          icon="fa-solid fa-user-check"
          trend={{ value: '98.4%', isPositive: true }}
        />
      </div>

      {/* Quick Actions Control Hub */}
      <Card variant="convex" className="p-6 sm:p-7 space-y-4 rounded-[24px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/50 text-base">
              <Zap className="w-5 h-5 text-primary-500" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                ศูนย์ควบคุมการทำงานด่วน (Quick Actions)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                เข้าถึงโมดูลหลักและงานประจำวันได้อย่างรวดเร็ว
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {/* Personnel Management */}
          <Link
            href="/manage/personnel"
            className="group p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-primary-500/50 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/80 transition-all flex items-start gap-4 shadow-2xs"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-users-gear" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                จัดการข้อมูลบุคลากร
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 line-clamp-1">
                เพิ่ม แก้ไข ค้นหา และดูรายละเอียดประวัติกำลังพล
              </p>
            </div>
          </Link>

          {/* Leaves System */}
          <Link
            href="/leaves"
            className="group p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/80 transition-all flex items-start gap-4 shadow-2xs"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-calendar-days" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                ระบบการลา & อนุมัติ
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 line-clamp-1">
                ยื่นใบลา ตรวจสอบสถานะ และดูสถิติวันลาคงเหลือ
              </p>
            </div>
          </Link>

          {/* Print Badges */}
          <Link
            href="/profile/badges"
            className="group p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-primary-500/50 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/80 transition-all flex items-start gap-4 shadow-2xs"
          >
            <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-id-card" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                พิมพ์บัตรประจำตัว
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 line-clamp-1">
                ออกบัตรดิจิทัลพร้อม QR Code สแกนตรวจสอบ
              </p>
            </div>
          </Link>

          {/* Notifications Hub */}
          <Link
            href="/manage/notifications"
            className="group p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-primary-500/50 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/80 transition-all flex items-start gap-4 shadow-2xs"
          >
            <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-bullhorn" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                จัดการข่าวสาร & การแจ้งเตือน
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 line-clamp-1">
                ศูนย์กระจายข่าวและแจ้งเตือนด่วนในระบบ
              </p>
            </div>
          </Link>

          {/* Work Calendar */}
          <Link
            href="/calendar"
            className="group p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/80 transition-all flex items-start gap-4 shadow-2xs"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-calendar-days" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                ปฏิทินปฏิบัติงาน
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 line-clamp-1">
                ตารางงาน เวรปฏิบัติหน้าที่ และวันหยุดราชการ
              </p>
            </div>
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            className="group p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-rose-500/50 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/80 transition-all flex items-start gap-4 shadow-2xs"
          >
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-sliders" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                ตั้งค่าระบบ & สำรองข้อมูล
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 line-clamp-1">
                จัดการสิทธิ์ แผนก สำรองฐานข้อมูล และ Audit Log
              </p>
            </div>
          </Link>
        </div>
      </Card>

      {/* Main Content Grid: Live Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7/12): On Leave Today & Announcements */}
        <div className="lg:col-span-7 space-y-6">
          {/* Widget 1: Personnel On Leave Today */}
          <Card variant="convex" className="p-0 overflow-hidden rounded-[24px]">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 text-sm font-bold">
                  <Plane className="w-4 h-4 text-amber-500" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    กำลังพลที่อยู่ระหว่างการลาวันนี้
                  </h3>
                  <p className="text-xs text-slate-400">อัปเดตสถานะแบบ Real-time ตามช่วงวันที่</p>
                </div>
              </div>
              <Link href="/leaves" className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                ดูทั้งหมด
              </Link>
            </div>

            <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800/60">
              {activeLeavesToday.length === 0 ? (
                <div className="py-10 text-center text-slate-400 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 mx-auto flex items-center justify-center text-xl">
                    <UserCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">ไม่มีบุคลากรลาในวันนี้</p>
                  <p className="text-[11px] text-slate-400">กำลังพลทุกคนพร้อมปฏิบัติหน้าที่ตามปกติ</p>
                </div>
              ) : (
                activeLeavesToday.map((leave) => (
                  <div key={leave.id} className="py-3 flex items-center justify-between first:pt-1 last:pb-1">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center">
                        ✈️
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          {leave.personnel?.firstName} {leave.personnel?.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {leave.personnel?.position || 'กำลังพล'} • {leave.personnel?.department || '-'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                        {leave.leaveType}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        ถึง {new Date(leave.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Widget 2: Recent Broadcast Notifications */}
          <Card variant="convex" className="p-0 overflow-hidden rounded-[24px]">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-sm font-bold">
                  <Bell className="w-4 h-4 text-blue-500" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    ประกาศแจ้งเตือนล่าสุดในระบบ
                  </h3>
                  <p className="text-xs text-slate-400">ข้อความประกาศและแจ้งเตือนด่วน</p>
                </div>
              </div>
              <Link href="/manage/notifications" className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                จัดการประกาศ
              </Link>
            </div>

            <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentNotifs.length === 0 ? (
                <div className="py-10 text-center text-slate-400 space-y-2">
                  <Bell className="w-8 h-8 mx-auto opacity-30" />
                  <p className="text-xs">ยังไม่มีรายการแจ้งเตือนใหม่</p>
                </div>
              ) : (
                recentNotifs.map((notif) => (
                  <div key={notif.id} className="py-3 flex items-start gap-3 first:pt-1 last:pb-1">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
                      <i className="fa-solid fa-info" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {notif.title}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                      {new Date(notif.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column (5/12): Latest News Feed & System Integrity */}
        <div className="lg:col-span-5 space-y-6">
          {/* Widget 3: Public News & Articles */}
          <Card variant="convex" className="p-0 overflow-hidden rounded-[24px]">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 text-sm font-bold">
                  <Newspaper className="w-4 h-4 text-primary-500" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    ข่าวสาร & ประชาสัมพันธ์
                  </h3>
                  <p className="text-xs text-slate-400">บทความและกิจกรรมองค์กร</p>
                </div>
              </div>
              <Link href="/news" className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                อ่านทั้งหมด
              </Link>
            </div>

            <div className="p-4 space-y-3">
              {recentPosts.length === 0 ? (
                <div className="py-10 text-center text-slate-400 space-y-2">
                  <Newspaper className="w-8 h-8 mx-auto opacity-30" />
                  <p className="text-xs">ยังไม่มีข่าวสารใหม่</p>
                </div>
              ) : (
                recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/news/${post.id}`}
                    className="group block p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-primary-500/40 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-all shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                          <i className="fa-regular fa-image text-lg" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                          {post.title}
                        </div>
                        <p
                          className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 line-clamp-2 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content.replace(/<[^>]+>/g, '')) }}
                        />
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>{post.author?.firstName}</span>
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>

          {/* Widget 4: System Information Card */}
          <Card variant="convex" className="p-5 sm:p-6 rounded-[24px] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">ความปลอดภัยและสถานะระบบ</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">eProfile Platform v1.3.0</div>
                </div>
              </div>
              <Badge variant="success" size="sm">
                Online
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">สิทธิ์ผู้ใช้งาน</div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">{currentUser.role}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">การสำรองข้อมูล</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">พร้อมใช้งาน</div>
              </div>
            </div>

            {isAdmin && (
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800/80">
                <Link href="/manage/inspector" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 font-semibold text-[11px] transition-colors">
                  <i className="fa-solid fa-wand-magic-sparkles" /> ตรวจสอบระบบ (Inspector)
                </Link>
                <Link href="/manage/api-docs" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 font-semibold text-[11px] transition-colors">
                  <i className="fa-solid fa-code" /> API Docs
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
