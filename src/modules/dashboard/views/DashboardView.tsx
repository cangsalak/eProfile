'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';
import { Card, CardHeader, StatCard, Badge, Button } from '@/components/ui';
import {
  Users,
  CalendarCheck,
  Car,
  TrendingUp,
  ArrowRight,
  Activity,
  Calendar,
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
        <div className="w-12 h-12 rounded-full bg-primary-500/20 shadow-clay-orb flex items-center justify-center animate-spin">
          <i className="fa-solid fa-circle-notch text-primary-600 text-xl"></i>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">กำลังประมวลผลข้อมูลแดชบอร์ด...</p>
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
    <div className="relative space-y-6 sm:space-y-8 pb-16 animate-fade-in font-prompt">
      {/* ── Ambient 3D Floating Blobs Background ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10 opacity-60 dark:opacity-30">
        <div className="absolute h-[50vh] w-[50vh] -top-[10%] -left-[10%] rounded-full bg-primary-500/15 blur-3xl animate-clay-float" />
        <div className="absolute h-[45vh] w-[45vh] top-[30%] -right-[10%] rounded-full bg-[#EC4899]/10 blur-3xl animate-clay-float" style={{ animationDelay: '3s' }} />
        <div className="absolute h-[40vh] w-[40vh] -bottom-[10%] left-[25%] rounded-full bg-emerald-500/10 blur-3xl animate-clay-float" style={{ animationDelay: '6s' }} />
      </div>

      {/* ── Submenu Header Navigation ── */}
      <PageHeaderExtra>
        <div className="flex items-center gap-1.5 p-1.5 bg-white/70 dark:bg-slate-800/80 rounded-2xl border border-white/60 dark:border-slate-700 shadow-clay-card backdrop-blur-xl">
          <Link
            href="/modules/dashboard"
            className="px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-clay-button"
          >
            <i className="fa-solid fa-chart-pie text-xs"></i>
            <span>ภาพรวมระบบ (Overview)</span>
          </Link>
          <Link
            href="/modules/dashboard/command"
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-700/60"
          >
            <i className="fa-solid fa-shield-halved text-xs text-slate-400"></i>
            <span>ศูนย์บัญชาการ (Command)</span>
          </Link>
        </div>
      </PageHeaderExtra>

      {/* ── Hero Welcome Banner with Claymorphic 3D Styling ── */}
      <div className="relative overflow-hidden rounded-[32px] sm:rounded-[36px] bg-gradient-to-br from-primary-600 via-primary-700 to-slate-900 p-6 sm:p-10 text-white shadow-clay-surface">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-60 h-60 bg-primary-400/25 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-black text-primary-100 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>eProfile Smart Personnel System</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              ศูนย์ปฏิบัติการและภาพรวมกำลังพล
            </h1>
            <p className="text-xs sm:text-sm text-primary-100/90 max-w-xl leading-relaxed">
              ติดตามความพร้อมรบ กำลังพลพร้อมปฏิบัติการ วันลา ยานพาหนะ และความเคลื่อนไหวล่าสุดของหน่วยงานแบบ Real-time
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/modules/dashboard/command">
              <Button
                type="button"
                variant="secondary"
                size="md"
                icon="fa-solid fa-shield-halved"
                className="bg-white hover:bg-slate-50 text-primary-900 font-black shadow-clay-button"
              >
                ศูนย์บัญชาการ
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 4 Key Metric StatCards (3D Convex Marshmallow) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Personnel */}
        <StatCard
          title="กำลังพลทั้งหมด"
          value={stats.totalPersonnel.toLocaleString()}
          unit="นาย"
          icon={<Users className="w-5 h-5 text-white" />}
          iconBgGradient="from-violet-500 to-primary-600"
          trend={{ value: '+12.5%', isPositive: true }}
          footer={
            <>
              <span>พร้อมปฏิบัติหน้าที่</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">{stats.activeDuty.toLocaleString()} นาย</span>
            </>
          }
        />

        {/* Metric 2: Readiness Rate */}
        <StatCard
          title="อัตราความพร้อมปฏิบัติการ"
          value={`${stats.readinessRate}%`}
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          iconBgGradient="from-emerald-400 to-emerald-600"
          trend={{ value: 'พร้อมรบ 100%', isPositive: true }}
          progress={{ value: stats.readinessRate, color: 'bg-gradient-to-r from-emerald-400 to-teal-500' }}
          footer={
            <>
              <span>สถานะความพร้อม</span>
              <Badge variant="success" size="xs">
                พร้อมรบสูงสุด
              </Badge>
            </>
          }
        />

        {/* Metric 3: Active Leaves */}
        <StatCard
          title="กำลังพลลาวันนี้"
          value={stats.activeLeavesToday.toLocaleString()}
          unit="นาย"
          icon={<CalendarCheck className="w-5 h-5 text-white" />}
          iconBgGradient="from-amber-400 to-amber-600"
          trend={{ value: `${stats.pendingLeaveRequests} รอดำเนินการ`, isPositive: false }}
          footer={
            <>
              <span>รอการอนุมัติ</span>
              <span className="font-black text-amber-600 dark:text-amber-400">{stats.pendingLeaveRequests} รายการ</span>
            </>
          }
        />

        {/* Metric 4: Vehicles Availability */}
        <StatCard
          title="ยานพาหนะพร้อมใช้"
          value={stats.availableVehicles}
          unit={`/ ${stats.totalVehicles} คัน`}
          icon={<Car className="w-5 h-5 text-white" />}
          iconBgGradient="from-sky-400 to-blue-600"
          trend={{
            value: `${stats.totalVehicles > 0 ? Math.round((stats.availableVehicles / stats.totalVehicles) * 100) : 100}%`,
            isPositive: true
          }}
          footer={
            <>
              <span>ความพร้อมยานพาหนะ</span>
              <span className="font-black text-sky-600 dark:text-sky-400">
                {stats.totalVehicles > 0 ? Math.round((stats.availableVehicles / stats.totalVehicles) * 100) : 100}%
              </span>
            </>
          }
        />
      </div>

      {/* ── Middle Section: Department Distribution & Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Department Personnel Breakdown (2 Cols) */}
        <Card variant="convex" className="lg:col-span-2">
          <CardHeader
            title="การกระจายตัวกำลังพลตามหน่วยงาน"
            subtitle="สัดส่วนจำนวนกำลังพลในแต่ละแผนก / ฝ่าย"
            icon={<Users className="w-5 h-5 text-white" />}
            iconGradient="from-violet-500 to-primary-600"
            action={
              <Link href="/modules/users">
                <Button type="button" variant="secondary" size="xs" icon="fa-solid fa-arrow-right">
                  ดูทั้งหมด
                </Button>
              </Link>
            }
          />

          <div className="space-y-4 mt-2">
            {data?.departmentStats && data.departmentStats.length > 0 ? (
              data.departmentStats.map((dept, idx) => {
                const pct = stats.totalPersonnel > 0 ? Math.round((dept.count / stats.totalPersonnel) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{dept.name}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">{dept.count} นาย</span>
                        <span className="font-black text-primary-600 dark:text-primary-400 w-10 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700/60 h-2.5 rounded-full overflow-hidden shadow-inner p-0.5">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full transition-all duration-700 shadow-sm"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-xs text-slate-500 font-bold">
                ยังไม่มีข้อมูลกำลังพลในระบบ
              </div>
            )}
          </div>
        </Card>

        {/* Right: Quick Action Shortcuts & Tools (1 Col) */}
        <Card variant="convex" className="space-y-4">
          <CardHeader
            title="เครื่องมือและเมนูด่วน"
            subtitle="ทางลัดไปยังโมดูลหลักที่ใช้งานบ่อย"
            icon={<Activity className="w-5 h-5 text-white" />}
            iconGradient="from-[#DB2777] to-[#7C3AED]"
          />

          <div className="grid grid-cols-1 gap-3">
            <Link
              href="/modules/users"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:shadow-clay-card hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-primary-600 text-white shadow-clay-orb flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform">
                  <i className="fa-solid fa-users"></i>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">
                    ทำเนียบกำลังพล
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">ค้นหาและจัดการประวัติกำลังพล</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </Link>

            <Link
              href="/modules/leaves"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:shadow-clay-card hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-clay-orb flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform">
                  <i className="fa-solid fa-calendar-xmark"></i>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors truncate">
                    ระบบการลาและอนุมัติ
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">ยื่นใบลาและพิจารณาคำขอ</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </Link>

            <Link
              href="/modules/calendar"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:shadow-clay-card hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-clay-orb flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform">
                  <i className="fa-solid fa-calendar-days"></i>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors truncate">
                    ปฏิทินและตารางเวร
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">ลงตารางเวรยามและภารกิจ</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </Link>

            <Link
              href="/modules/vehicles"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:shadow-clay-card hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-clay-orb flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform">
                  <i className="fa-solid fa-car"></i>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors truncate">
                    ระบบยานพาหนะ
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">ขอใช้รถและบันทึกการเดินทาง</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </Link>
          </div>
        </Card>
      </div>

      {/* ── Bottom Section: Upcoming Events & Recent Audit Trail ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card variant="convex">
          <CardHeader
            title="กิจกรรมและเวรปฏิบัติการใกล้ถึง"
            subtitle="กำหนดการนัดหมายและตารางเวรยามเร็วๆ นี้"
            icon={<Calendar className="w-5 h-5 text-white" />}
            iconGradient="from-primary-500 to-indigo-600"
            action={
              <Link href="/modules/calendar">
                <Button type="button" variant="secondary" size="xs" icon="fa-solid fa-calendar-days">
                  ดูปฏิทิน
                </Button>
              </Link>
            }
          />

          <div className="space-y-3 mt-2">
            {data?.upcomingEvents && data.upcomingEvents.length > 0 ? (
              data.upcomingEvents.map((ev, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-clay-card hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary-500 to-emerald-400 shadow-xs shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{ev.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {new Date(ev.startDate).toLocaleDateString('th-TH')} - {new Date(ev.startDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                      </p>
                    </div>
                  </div>
                  <Badge variant="candy" size="xs">
                    {ev.type || 'ทั่วไป'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500 font-bold">
                ไม่มีกิจกรรมหรือเวรยามในระยะเวลาอันใกล้
              </div>
            )}
          </div>
        </Card>

        {/* Recent System Activity */}
        <Card variant="convex">
          <CardHeader
            title="บันทึกความเคลื่อนไหวล่าสุด"
            subtitle="ประวัติการเปลี่ยนแปลงและบันทึก Audit Logs"
            icon={<Activity className="w-5 h-5 text-white" />}
            iconGradient="from-emerald-400 to-teal-600"
            action={
              <Link href="/modules/inspector/audit-logs">
                <Button type="button" variant="secondary" size="xs" icon="fa-solid fa-clock-rotate-left">
                  ประวัติทั้งหมด
                </Button>
              </Link>
            }
          />

          <div className="space-y-3 mt-2">
            {data?.recentActivities && data.recentActivities.length > 0 ? (
              data.recentActivities.map((log, idx) => {
                const user = log.personnel;
                const name = user ? `${user.prefix || ''}${user.firstName} ${user.lastName}`.trim() : 'ระบบ';
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-clay-card hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 text-white shadow-clay-orb flex items-center justify-center text-xs font-black shrink-0">
                        {name[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
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
              <div className="text-center py-8 text-xs text-slate-500 font-bold">
                ยังไม่มีบันทึกกิจกรรมล่าสุด
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
