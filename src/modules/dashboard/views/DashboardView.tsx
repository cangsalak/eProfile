'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';
import { Card, Badge, Button } from '@/components/ui';
import {
  Users,
  CalendarCheck,
  Clock,
  Car,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Activity,
  Calendar,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface DashboardStatsData {
  totalPersonnel: number;
  activeDuty: number;
  activeLeavesToday: number;
  pendingLeaveRequests: number;
  readinessRate: number;
  totalVehicles: number;
  availableVehicles: number;
}

export default function DashboardView() {
  const [data, setData] = useState<{
    stats: DashboardStatsData;
    upcomingEvents: any[];
    recentActivities: any[];
    departmentStats: { name: string; count: number }[];
    leaveTypeStats: { name: string; count: number }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/modules/dashboard/stats');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 font-prompt">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 dark:text-slate-400">กำลังประมวลผลข้อมูลแดชบอร์ด...</p>
      </div>
    );
  }

  const stats = data?.stats || {
    totalPersonnel: 0,
    activeDuty: 0,
    activeLeavesToday: 0,
    pendingLeaveRequests: 0,
    readinessRate: 100,
    totalVehicles: 0,
    availableVehicles: 0,
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in font-prompt">
      {/* ── Submenu Header Navigation ── */}
      <PageHeaderExtra>
        <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
          <Link
            href="/modules/dashboard"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 bg-primary-600 text-white shadow-sm shadow-primary-500/30"
          >
            <i className="fa-solid fa-chart-pie text-xs"></i>
            <span>ภาพรวมระบบ (Overview)</span>
          </Link>
          <Link
            href="/modules/dashboard/command"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60"
          >
            <i className="fa-solid fa-shield-halved text-xs text-slate-400"></i>
            <span>ศูนย์บัญชาการ (Command)</span>
          </Link>
        </div>
      </PageHeaderExtra>

      {/* ── Hero Welcome Banner with Glassmorphism ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-primary-400/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-primary-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>eProfile Smart Personnel System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ศูนย์ปฏิบัติการและภาพรวมกำลังพล
            </h1>
            <p className="text-xs sm:text-sm text-primary-100/90 max-w-xl leading-relaxed">
              ติดตามความพร้อมรบ กำลังพลพร้อมปฏิบัติการ วันลา ยานพาหนะ และความเคลื่อนไหวล่าสุดของหน่วยงานแบบ Real-time
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/modules/dashboard/command">
              <Button
                variant="secondary"
                size="md"
                icon="fa-solid fa-shield-halved"
                className="bg-white/90 hover:bg-white text-primary-900 font-bold shadow-lg"
              >
                ศูนย์บัญชาการ
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 4 Key Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Personnel */}
        <Card className="p-5 relative overflow-hidden group hover:border-primary-400 dark:hover:border-primary-600 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">กำลังพลทั้งหมด</span>
            <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center text-base shadow-xs group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.totalPersonnel}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">นาย/คน</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">พร้อมปฏิบัติหน้าที่</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.activeDuty} นาย</span>
          </div>
        </Card>

        {/* Metric 2: Readiness Rate */}
        <Card className="p-5 relative overflow-hidden group hover:border-emerald-400 dark:hover:border-emerald-600 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">อัตราความพร้อมปฏิบัติการ</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-base shadow-xs group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.readinessRate}%
            </span>
            <Badge variant="success" size="sm">
              พร้อมรบ
            </Badge>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.max(0, stats.readinessRate))}%` }}
            />
          </div>
        </Card>

        {/* Metric 3: Active Leaves */}
        <Card className="p-5 relative overflow-hidden group hover:border-amber-400 dark:hover:border-amber-600 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">กำลังพลลาวันนี้</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-base shadow-xs group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.activeLeavesToday}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">นาย</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">รอการอนุมัติ</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{stats.pendingLeaveRequests} รายการ</span>
          </div>
        </Card>

        {/* Metric 4: Vehicles Availability */}
        <Card className="p-5 relative overflow-hidden group hover:border-sky-400 dark:hover:border-sky-600 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ยานพาหนะพร้อมใช้</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center text-base shadow-xs group-hover:scale-110 transition-transform">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.availableVehicles}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ {stats.totalVehicles} คัน</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">ความพร้อมยานพาหนะ</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">
              {stats.totalVehicles > 0 ? Math.round((stats.availableVehicles / stats.totalVehicles) * 100) : 100}%
            </span>
          </div>
        </Card>
      </div>

      {/* ── Middle Section: Department Distribution & Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Department Personnel Breakdown (2 Cols) */}
        <Card className="lg:col-span-2 p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-500" />
                <span>การกระจายตัวกำลังพลตามหน่วยงาน</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                สัดส่วนจำนวนกำลังพลในแต่ละแผนก / ฝ่าย
              </p>
            </div>
            <Link href="/modules/users">
              <Button variant="outline" size="sm" icon="fa-solid fa-arrow-right">
                ดูทั้งหมด
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {data?.departmentStats && data.departmentStats.length > 0 ? (
              data.departmentStats.map((dept, idx) => {
                const pct = stats.totalPersonnel > 0 ? Math.round((dept.count / stats.totalPersonnel) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{dept.name}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-500 dark:text-slate-400">{dept.count} นาย</span>
                        <span className="font-bold text-primary-600 dark:text-primary-400 w-10 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary-600 dark:bg-primary-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                ยังไม่มีข้อมูลกำลังพลในระบบ
              </div>
            )}
          </div>
        </Card>

        {/* Right: Quick Action Shortcuts & Tools (1 Col) */}
        <Card className="p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <Activity className="w-4 h-4 text-primary-500" />
            <span>เครื่องมือและเมนูด่วน</span>
          </h3>

          <div className="grid grid-cols-1 gap-2.5">
            <Link
              href="/modules/users"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-primary-400 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-users"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    ทำเนียบกำลังพล
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">ค้นหาและจัดการประวัติกำลังพล</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/modules/leaves"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-primary-400 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-calendar-xmark"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    ระบบการลาและอนุมัติ
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">ยื่นใบลาและพิจารณาคำขอ</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/modules/calendar"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-primary-400 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-calendar-days"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    ปฏิทินและตารางเวร
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">ลงตารางเวรยามและภารกิจ</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/modules/vehicles"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-primary-400 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-car"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    ระบบยานพาหนะ
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">ขอใช้รถและบันทึกการเดินทาง</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </Card>
      </div>

      {/* ── Bottom Section: Upcoming Events & Recent Audit Trail ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-500" />
              <span>กิจกรรมและเวรปฏิบัติการใกล้ถึง</span>
            </h3>
            <Link href="/modules/calendar">
              <Button variant="outline" size="sm" icon="fa-solid fa-calendar-days">
                ดูปฏิทิน
              </Button>
            </Link>
          </div>

          <div className="space-y-2.5">
            {data?.upcomingEvents && data.upcomingEvents.length > 0 ? (
              data.upcomingEvents.map((ev, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{ev.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {new Date(ev.startDate).toLocaleDateString('th-TH')} - {new Date(ev.startDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                      </p>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {ev.type || 'ทั่วไป'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                ไม่มีกิจกรรมหรือเวรยามในระยะเวลาอันใกล้
              </div>
            )}
          </div>
        </Card>

        {/* Recent System Activity */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-500" />
              <span>บันทึกความเคลื่อนไหวล่าสุด (System Audit)</span>
            </h3>
            <Link href="/inspector/audit-logs">
              <Button variant="outline" size="sm" icon="fa-solid fa-clock-rotate-left">
                ประวัติทั้งหมด
              </Button>
            </Link>
          </div>

          <div className="space-y-2.5">
            {data?.recentActivities && data.recentActivities.length > 0 ? (
              data.recentActivities.map((log, idx) => {
                const user = log.personnel;
                const name = user ? `${user.prefix || ''}${user.firstName} ${user.lastName}`.trim() : 'ระบบ';
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {name[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {log.action} <span className="text-slate-500 font-normal">โดย {name}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          {new Date(log.createdAt).toLocaleString('th-TH')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                ยังไม่มีบันทึกกิจกรรมล่าสุด
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
