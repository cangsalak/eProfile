'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TablePagination from '@/components/common/TablePagination';

interface DashboardScope {
  isGlobalViewer: boolean;
  userDepartment: string;
  userSubDepartment: string;
  effectiveDepartment: string;
  effectiveSubDepartment: string;
  targetDate: string;
  targetYear: number;
}

interface ReadinessMetrics {
  total: number;
  activeDuty: number;
  onLeaveToday: number;
  onMission: number;
  unavailable: number;
  readinessRate: number;
}

interface DistributionItem {
  department?: string;
  subDepartment?: string;
  personnelType?: string;
  status?: string;
  count: number;
}

interface ActiveLeaveItem {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  daysRemaining: number;
  status: string;
  reason: string;
  personnel: {
    id: string;
    prefix: string;
    firstName: string;
    lastName: string;
    position: string;
    department: string;
    subDepartment: string;
    avatarColor: string;
  };
}

interface LeaveSummaryItem {
  personnel: {
    id: string;
    prefix: string;
    firstName: string;
    lastName: string;
    position: string;
    department: string;
    subDepartment: string;
    avatarColor: string;
  };
  leaveType: string;
  year: number;
  quota: number;
  isDefaultPolicy: boolean;
  usedApprovedDays: number;
  pendingDays: number;
  remainingDays: number;
}

interface DashboardData {
  success: boolean;
  scope: DashboardScope;
  readiness: ReadinessMetrics;
  distributions: {
    byDepartment: DistributionItem[];
    bySubDepartment: DistributionItem[];
    byPersonnelType: DistributionItem[];
    byStatus: DistributionItem[];
  };
  activeLeaves: {
    items: ActiveLeaveItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  leaveSummary: {
    leaveType: string;
    year: number;
    policyQuota: number;
    totals: {
      policyQuota: number;
      totalPersonnel: number;
      totalUsedApproved: number;
      totalPending: number;
      personnelUsedCount: number;
      personnelPendingCount: number;
      averageDaysUsed: number;
      utilizationRate: number;
    };
    items: LeaveSummaryItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  leavePolicy: Record<string, number>;
}

export default function CommandDashboardView() {
  const router = useRouter();

  // Control & Filter States
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedSubDepartment, setSelectedSubDepartment] = useState('ALL');
  const [includeSubDepts, setIncludeSubDepts] = useState(true);

  // Active Leaves Sub-state
  const [activeLeavesPage, setActiveLeavesPage] = useState(1);
  const [activeLeavesLimit, setActiveLeavesLimit] = useState(10);
  const [activeLeavesSearch, setActiveLeavesSearch] = useState('');

  // Leave Summary Sub-state
  const [leaveSummaryPage, setLeaveSummaryPage] = useState(1);
  const [leaveSummaryLimit, setLeaveSummaryLimit] = useState(10);
  const [leaveSummarySearch, setLeaveSummarySearch] = useState('');
  const [leaveSummaryType, setLeaveSummaryType] = useState('ลาพักผ่อน');

  // Async States
  const [data, setData] = useState<DashboardData | null>(null);
  const [departmentsList, setDepartmentsList] = useState<{ id: string; name: string; subDepartments?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Thai Date formatting helper
  const formattedThaiDate = useMemo(() => {
    try {
      const d = new Date(selectedDate);
      if (isNaN(d.getTime())) return selectedDate;
      return d.toLocaleDateString('th-TH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Available Sub-departments for currently selected department
  const availableSubDepartments = useMemo(() => {
    if (!selectedDepartment || selectedDepartment === 'ALL') return [];
    const dept = departmentsList.find(d => d.name === selectedDepartment);
    if (!dept?.subDepartments) return [];
    try {
      const parsed = JSON.parse(dept.subDepartments);
      return Array.isArray(parsed) ? parsed.map((s: any) => (typeof s === 'string' ? s : s.name)) : [];
    } catch {
      return [];
    }
  }, [selectedDepartment, departmentsList]);

  // Load Departments list for dropdown
  useEffect(() => {
    fetch('/api/departments')
      .then(res => {
        if (res.ok) return res.json();
        return [];
      })
      .then(depts => {
        if (Array.isArray(depts)) setDepartmentsList(depts);
      })
      .catch(() => {});
  }, []);

  // Fetch Dashboard Data
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        date: selectedDate,
        year: String(selectedYear),
        department: selectedDepartment,
        subDepartment: selectedSubDepartment,
        includeSubDepartments: String(includeSubDepts),
        activeLeavesPage: String(activeLeavesPage),
        activeLeavesLimit: String(activeLeavesLimit),
        activeLeavesSearch,
        leaveSummaryPage: String(leaveSummaryPage),
        leaveSummaryLimit: String(leaveSummaryLimit),
        leaveSummarySearch,
        leaveSummaryType,
      });

      const res = await fetch(`/api/dashboard/command?${params.toString()}`);
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.status === 403) {
        setError('คุณไม่มีสิทธิ์เข้าถึงแดชบอร์ดผู้บังคับบัญชา (ต้องมีสิทธิ์ VIEW_COMMAND_DASHBOARD)');
        setIsLoading(false);
        return;
      }
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
      }

      const json: DashboardData = await res.json();
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedDate,
    selectedYear,
    selectedDepartment,
    selectedSubDepartment,
    includeSubDepts,
    activeLeavesPage,
    activeLeavesLimit,
    activeLeavesSearch,
    leaveSummaryPage,
    leaveSummaryLimit,
    leaveSummarySearch,
    leaveSummaryType,
    router,
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Color mapping for leave types
  const getLeaveTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'ลาพักผ่อน':
      case 'ลาพักผ่อนประจำปี':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'ลากิจ':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'ลาป่วย':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'ลาคลอดบุตร':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'ลาอุปสมบท':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-prompt">
      {/* ── Top Header - Harmonized with eProfile Emerald Theme ─────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-bl from-primary-100/70 via-emerald-50/40 to-teal-50/20 dark:from-primary-950/40 dark:via-emerald-950/20 dark:to-teal-950/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-80 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800/80 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-3 shadow-sm">
              <i className="fa-solid fa-chess-king text-primary-600 dark:text-primary-400"></i>
              <span>ศูนย์บัญชาการกำลังพล (Command Dashboard)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <span>รายงานความพร้อมรบและสถานะกำลังพล</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <i className="fa-regular fa-calendar-check text-primary-600 dark:text-primary-400"></i>
                <span>ข้อมูลประจำ {formattedThaiDate}</span>
              </span>
              {data?.scope && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-mono text-xs">
                  ขอบเขต: {data.scope.effectiveDepartment === 'ALL' ? 'ทุกหน่วยงาน' : data.scope.effectiveDepartment}
                  {data.scope.effectiveSubDepartment && data.scope.effectiveSubDepartment !== 'ALL' ? ` (${data.scope.effectiveSubDepartment})` : ''}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchDashboardData()}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <i className={`fa-solid fa-rotate-right ${isLoading ? 'fa-spin' : ''}`}></i>
              <span>รีเฟรชข้อมูล</span>
            </button>
            <Link
              href="/manage/leave-approvals"
              className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold transition flex items-center gap-2 shadow-md shadow-primary-500/20"
            >
              <i className="fa-solid fa-clipboard-check"></i>
              <span>ศูนย์อนุมัติการลา</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Filter Control Bar ───────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <i className="fa-solid fa-filter text-primary-500"></i>
            <span>ตัวกรองข้อมูลและขอบเขต (Filters & Scope)</span>
          </div>
          {data?.scope && !data.scope.isGlobalViewer && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
              <i className="fa-solid fa-lock mr-1"></i> ล็อกขอบเขตตามหน่วย: {data.scope.userDepartment}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {/* 1. Date Picker */}
          <div>
            <label htmlFor="cmd-selected-date" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              วันที่ตรวจสอบ (Date)
            </label>
            <input
              id="cmd-selected-date"
              name="cmdSelectedDate"
              aria-label="วันที่ตรวจสอบ"
              type="date"
              value={selectedDate}
              onChange={e => {
                setSelectedDate(e.target.value);
                setActiveLeavesPage(1);
              }}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* 2. Year Picker */}
          <div>
            <label htmlFor="cmd-selected-year" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              ปีงบประมาณ/ปฏิทิน (Year)
            </label>
            <select
              id="cmd-selected-year"
              name="cmdSelectedYear"
              aria-label="ปีงบประมาณหรือปฏิทิน"
              value={selectedYear}
              onChange={e => {
                setSelectedYear(parseInt(e.target.value, 10));
                setLeaveSummaryPage(1);
              }}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {[2024, 2025, 2026, 2027, 2028].map(y => (
                <option key={y} value={y}>
                  พ.ศ. {y + 543} ({y})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Department Dropdown */}
          <div>
            <label htmlFor="cmd-selected-dept" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              หน่วยงาน / กอง (Department)
            </label>
            <select
              id="cmd-selected-dept"
              name="cmdSelectedDept"
              aria-label="หน่วยงานหรือกอง"
              value={selectedDepartment}
              onChange={e => {
                setSelectedDepartment(e.target.value);
                setSelectedSubDepartment('ALL');
                setActiveLeavesPage(1);
                setLeaveSummaryPage(1);
              }}
              disabled={data?.scope && !data.scope.isGlobalViewer}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
            >
              {data?.scope?.isGlobalViewer && <option value="ALL">-- ทุกหน่วยงาน (All Departments) --</option>}
              {departmentsList.map(dept => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Sub-Department Dropdown */}
          <div>
            <label htmlFor="cmd-selected-subdept" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              หน่วยย่อย / แผนก (Sub-Department)
            </label>
            <select
              id="cmd-selected-subdept"
              name="cmdSelectedSubdept"
              aria-label="หน่วยย่อยหรือแผนก"
              value={selectedSubDepartment}
              onChange={e => {
                setSelectedSubDepartment(e.target.value);
                setActiveLeavesPage(1);
                setLeaveSummaryPage(1);
              }}
              disabled={availableSubDepartments.length === 0}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <option value="ALL">-- ทั้งหมดในหน่วย --</option>
              {availableSubDepartments.map((sub: string) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
            <input
              type="checkbox"
              checked={includeSubDepts}
              onChange={e => setIncludeSubDepts(e.target.checked)}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-700"
            />
            <span>รวมกำลังพลในหน่วยย่อยทั้งหมด (Include Sub-units)</span>
          </label>
        </div>
      </div>

      {/* ── Error Alert ─────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-3 text-xs sm:text-sm">
          <i className="fa-solid fa-circle-exclamation text-lg shrink-0"></i>
          <div>{error}</div>
        </div>
      )}

      {/* ── 5 KPI Summary Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Personnel */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">กำลังพลในสังกัด</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">
              <i className="fa-solid fa-users"></i>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {isLoading ? '...' : (data?.readiness.total ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">ยอดบรรจุตามอัตรา</div>
          </div>
        </div>

        {/* Active Duty */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">พร้อมปฏิบัติงานปกติ</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-sm">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {isLoading ? '...' : (data?.readiness.activeDuty ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
              <span>ความพร้อม: {data?.readiness.readinessRate ?? 0}%</span>
            </div>
          </div>
        </div>

        {/* On Leave Today */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">อยู่ระหว่างการลาวันนี้</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 flex items-center justify-center text-sm">
              <i className="fa-solid fa-plane-departure"></i>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {isLoading ? '...' : (data?.readiness.onLeaveToday ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">อนุมัติแล้ว ณ วันที่เลือก</div>
          </div>
        </div>

        {/* On Mission / Detached */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">ไปช่วยราชการ / ภารกิจ</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm">
              <i className="fa-solid fa-briefcase"></i>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">
              {isLoading ? '...' : (data?.readiness.onMission ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-blue-500 dark:text-blue-400 mt-1">ภายนอกหน่วย/ศึกษาดูงาน</div>
          </div>
        </div>

        {/* Unavailable / Inactive */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ไม่พร้อมปฏิบัติงาน/อื่นๆ</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-sm">
              <i className="fa-solid fa-hospital-user"></i>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-700 dark:text-slate-300 font-mono">
              {isLoading ? '...' : (data?.readiness.unavailable ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">ป่วย/พ้นสภาพ/อื่นๆ</div>
          </div>
        </div>
      </div>

      {/* ── Operational Readiness Gauge & Distributions ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness Rate Progress Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <i className="fa-solid fa-gauge-high text-primary-500"></i>
              <span>อัตราความพร้อมปฏิบัติงานรวม</span>
            </div>
            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 font-mono">
              {data?.readiness.readinessRate ?? 0}%
            </span>
          </div>

          {/* Large Progress Bar */}
          <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (data?.readiness.readinessRate ?? 0) >= 80
                  ? 'bg-emerald-500'
                  : (data?.readiness.readinessRate ?? 0) >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${data?.readiness.readinessRate ?? 0}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">ปฏิบัติงานได้จริง</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 text-base font-mono mt-0.5">
                {data?.readiness.activeDuty ?? 0} นาย
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">ไม่พร้อมปฏิบัติงาน</div>
              <div className="font-bold text-rose-600 dark:text-rose-400 text-base font-mono mt-0.5">
                {(data?.readiness.onLeaveToday ?? 0) + (data?.readiness.unavailable ?? 0)} นาย
              </div>
            </div>
          </div>
        </div>

        {/* Personnel Type Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <i className="fa-solid fa-id-badge text-primary-500"></i>
              <span>สัดส่วนประเภทกำลังพล (Personnel Types)</span>
            </div>
            <span className="text-xs text-slate-400">
              รวม {data?.distributions.byPersonnelType.reduce((a, b) => a + b.count, 0) || 0} นาย
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {data?.distributions.byPersonnelType.map(item => {
              const total = data?.readiness.total || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div
                  key={item.personnelType}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.personnelType || 'ไม่ระบุ'}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {item.count} นาย ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── SECTION 1: Active Leaves Table ──────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm">
                <i className="fa-solid fa-plane-departure"></i>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                กำลังพลที่อยู่ระหว่างการลา (Active Leaves)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              รายชื่อผู้ที่มีใบลา &quot;อนุมัติแล้ว&quot; และครอบคลุมวันที่ {formattedThaiDate}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <label htmlFor="cmd-active-leaves-search" className="sr-only">
              ค้นหากำลังพลที่อยู่ระหว่างการลา
            </label>
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              id="cmd-active-leaves-search"
              name="cmdActiveLeavesSearch"
              aria-label="ค้นหาชื่อกำลังพลที่อยู่ระหว่างการลา"
              type="text"
              value={activeLeavesSearch}
              onChange={e => {
                setActiveLeavesSearch(e.target.value);
                setActiveLeavesPage(1);
              }}
              placeholder="ค้นหาชื่อกำลังพล..."
              className="w-full h-9 pl-9 pr-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Active Leaves Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">กำลังพล (Personnel)</th>
                <th className="py-3 px-4">หน่วยงาน / ตำแหน่ง</th>
                <th className="py-3 px-4">ประเภทการลา</th>
                <th className="py-3 px-4">ช่วงวันที่ลา</th>
                <th className="py-3 px-4 text-center">จำนวนวันลา</th>
                <th className="py-3 px-4 text-center">วันที่เหลือ</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : data?.activeLeaves.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <i className="fa-solid fa-check-circle text-emerald-500 mr-1.5"></i>
                    ไม่มีกำลังพลอยู่ระหว่างการลาในวันที่เลือก
                  </td>
                </tr>
              ) : (
                data?.activeLeaves.items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                          style={{ backgroundColor: item.personnel.avatarColor || '#3b82f6' }}
                        >
                          {item.personnel.firstName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {item.personnel.prefix} {item.personnel.firstName} {item.personnel.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">{item.personnel.position || '-'}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.personnel.department} {item.personnel.subDepartment && item.personnel.subDepartment !== '-' ? `(${item.personnel.subDepartment})` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getLeaveTypeBadgeColor(item.leaveType)}`}>
                        {item.leaveType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-mono">
                      {new Date(item.startDate).toLocaleDateString('th-TH')} - {new Date(item.endDate).toLocaleDateString('th-TH')}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white font-mono">
                      {item.totalDays} วัน
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-[11px] border border-amber-500/20 font-mono">
                        {item.daysRemaining > 0 ? `เหลือ ${item.daysRemaining} วัน` : 'วันสุดท้าย'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] border border-emerald-500/20">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.activeLeaves && data.activeLeaves.pagination.total > 0 && (
          <TablePagination
            totalItems={data.activeLeaves.pagination.total}
            indexOfFirstItem={(activeLeavesPage - 1) * activeLeavesLimit}
            indexOfLastItem={activeLeavesPage * activeLeavesLimit}
            currentPage={activeLeavesPage}
            totalPages={data.activeLeaves.pagination.totalPages}
            pageSize={activeLeavesLimit}
            unitName="คน"
            setPageSize={setActiveLeavesLimit}
            setCurrentPage={setActiveLeavesPage}
          />
        )}
      </div>

      {/* ── SECTION 2: Leave Quota & Balance Summary ────────────────────── */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-sm">
                <i className="fa-solid fa-chart-simple"></i>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                สรุปสิทธิ์วันลา ใช้ไป และคงเหลือ (Leave Balance & Quota)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              สรุปวันลาประจำปี พ.ศ. {selectedYear + 543} ({selectedYear}) ตามนโยบายสิทธิ์ที่กำหนดในระบบ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Leave Type Filter Tabs */}
            {['ลาพักผ่อน', 'ลากิจ', 'ลาป่วย', 'ลาคลอดบุตร', 'ลาอุปสมบท'].map(type => (
              <button
                key={type}
                onClick={() => {
                  setLeaveSummaryType(type);
                  setLeaveSummaryPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  leaveSummaryType === type
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Scope Totals Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">สิทธิ์ตามระเบียบ ({leaveSummaryType})</div>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {data?.leaveSummary.policyQuota ?? (leaveSummaryType === 'ลาพักผ่อน' ? 10 : 45)} วัน/คน
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">สิทธิ์มาตรฐานต่อบุคคล</div>
          </div>
          <div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">อนุมัติใช้ไปแล้วรวม</div>
            <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">
              {(data?.leaveSummary.totals.totalUsedApproved ?? 0).toLocaleString()} วัน
            </div>
            <div className="text-[10px] text-blue-500/80 dark:text-blue-400/80 mt-0.5 font-medium">
              จากผู้ใช้สิทธิ์ {data?.leaveSummary.totals.personnelUsedCount ?? 0} นาย
            </div>
          </div>
          <div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">รออนุมัติรวม</div>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
              {(data?.leaveSummary.totals.totalPending ?? 0).toLocaleString()} วัน
            </div>
            <div className="text-[10px] text-amber-500/80 dark:text-amber-400/80 mt-0.5 font-medium">
              จากผู้ยื่นคำขอ {data?.leaveSummary.totals.personnelPendingCount ?? 0} นาย
            </div>
          </div>
          <div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">อัตราการใช้สิทธิ์ของหน่วย</div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              {data?.leaveSummary.totals.utilizationRate ?? 0}%
            </div>
            <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 font-medium">
              {data?.leaveSummary.totals.personnelUsedCount ?? 0}/{data?.leaveSummary.totals.totalPersonnel ?? 0} นาย (เฉลี่ย {data?.leaveSummary.totals.averageDaysUsed ?? 0} วัน/คน)
            </div>
          </div>
        </div>

        {/* Search for Leave Summary */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            สิทธิ์มาตรฐานระบบ: <span className="font-bold text-slate-800 dark:text-slate-200">{data?.leaveSummary.policyQuota ?? 10} วัน/ปี</span>
          </div>
          <div className="relative w-full sm:w-64">
            <label htmlFor="cmd-leave-summary-search" className="sr-only">
              ค้นหาสรุปวันลากำลังพล
            </label>
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              id="cmd-leave-summary-search"
              name="cmdLeaveSummarySearch"
              aria-label="ค้นหาสรุปวันลากำลังพล"
              type="text"
              value={leaveSummarySearch}
              onChange={e => {
                setLeaveSummarySearch(e.target.value);
                setLeaveSummaryPage(1);
              }}
              placeholder="ค้นหาชื่อกำลังพล..."
              className="w-full h-9 pl-9 pr-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Summary Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">กำลังพล (Personnel)</th>
                <th className="py-3 px-4">หน่วยงาน</th>
                <th className="py-3 px-4 text-center">สิทธิ์วันลา</th>
                <th className="py-3 px-4 text-center">ใช้ไปแล้ว</th>
                <th className="py-3 px-4 text-center">รออนุมัติ</th>
                <th className="py-3 px-4 text-center">วันลาคงเหลือ</th>
                <th className="py-3 px-4">สัดส่วนคงเหลือ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : data?.leaveSummary.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    ไม่พบข้อมูลกำลังพลในขอบเขตที่เลือก
                  </td>
                </tr>
              ) : (
                data?.leaveSummary.items.map(item => {
                  const remainingPct = item.quota > 0 ? Math.round((item.remainingDays / item.quota) * 100) : 0;
                  return (
                    <tr key={item.personnel.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                            style={{ backgroundColor: item.personnel.avatarColor || '#3b82f6' }}
                          >
                            {item.personnel.firstName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {item.personnel.prefix} {item.personnel.firstName} {item.personnel.lastName}
                            </div>
                            <div className="text-[11px] text-slate-400">{item.personnel.position || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {item.personnel.department}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-slate-900 dark:text-white font-mono">{item.quota} วัน</span>
                        {item.isDefaultPolicy && (
                          <div className="text-[10px] text-slate-400">(นโยบายระบบ)</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-blue-600 dark:text-blue-400 font-mono">
                        {item.usedApprovedDays} วัน
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-amber-600 dark:text-amber-400 font-mono">
                        {item.pendingDays > 0 ? `${item.pendingDays} วัน` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-black font-mono text-sm ${
                            item.remainingDays <= 2
                              ? 'text-rose-600 dark:text-rose-400'
                              : item.remainingDays <= 5
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {item.remainingDays} วัน
                        </span>
                      </td>
                      <td className="py-3 px-4 w-40">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>{remainingPct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                remainingPct <= 20 ? 'bg-rose-500' : remainingPct <= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${remainingPct}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.leaveSummary && data.leaveSummary.pagination.total > 0 && (
          <TablePagination
            totalItems={data.leaveSummary.pagination.total}
            indexOfFirstItem={(leaveSummaryPage - 1) * leaveSummaryLimit}
            indexOfLastItem={leaveSummaryPage * leaveSummaryLimit}
            currentPage={leaveSummaryPage}
            totalPages={data.leaveSummary.pagination.totalPages}
            pageSize={leaveSummaryLimit}
            unitName="คน"
            setPageSize={setLeaveSummaryLimit}
            setCurrentPage={setLeaveSummaryPage}
          />
        )}
      </div>
    </div>
  );
}
