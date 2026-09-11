'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TablePagination from '@/components/common/TablePagination';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';
import { Card, Button, Badge, Input, Select } from '@/components/ui';
import {
  ShieldAlert,
  Users,
  CalendarCheck,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';

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
    allowedLeaveTypes?: string[];
    items: LeaveSummaryItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
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
    const dept = departmentsList.find((d) => d.name === selectedDepartment);
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
      .then((res) => (res.ok ? res.json() : []))
      .then((depts) => {
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

      const res = await fetch(`/api/modules/dashboard/command?${params.toString()}`);
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

  return (
    <div className="space-y-6 pb-16 animate-fade-in font-prompt">
      {/* ── Submenu Header Navigation ── */}
      <PageHeaderExtra>
        <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
          <Link
            href="/modules/dashboard"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60"
          >
            <i className="fa-solid fa-chart-pie text-xs text-slate-400"></i>
            <span>ภาพรวมระบบ (Overview)</span>
          </Link>
          <Link
            href="/modules/dashboard/command"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 bg-primary-600 text-white shadow-sm shadow-primary-500/30"
          >
            <i className="fa-solid fa-shield-halved text-xs"></i>
            <span>ศูนย์บัญชาการ (Command)</span>
          </Link>
        </div>
      </PageHeaderExtra>

      {/* ── Top Filter Bar ── */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary-600" />
              <span>ศูนย์บัญชาการและติดตามความพร้อมรบ</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ข้อมูล ณ วันที่ {formattedThaiDate} (พ.ศ. {selectedYear + 543})
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              isLoading={isLoading}
              icon="fa-solid fa-rotate"
            >
              รีเฟรชข้อมูล
            </Button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              วันที่ตรวจสอบความพร้อม
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs w-full"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              สังกัด / หน่วยงาน
            </label>
            <Select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedSubDepartment('ALL');
              }}
              options={[
                { value: 'ALL', label: 'ทั้งหมด (ทุกสังกัด)' },
                ...departmentsList.map((d) => ({ value: d.name, label: d.name })),
              ]}
              className="text-xs w-full"
            />
          </div>

          {availableSubDepartments.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                ฝ่าย / แผนกย่อย
              </label>
              <Select
                value={selectedSubDepartment}
                onChange={(e) => setSelectedSubDepartment(e.target.value)}
                options={[
                  { value: 'ALL', label: 'ทุกฝ่าย / แผนกย่อย' },
                  ...availableSubDepartments.map((s) => ({ value: s, label: s })),
                ]}
                className="text-xs w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              ประเภทการลาที่วิเคราะห์
            </label>
            <Select
              value={leaveSummaryType}
              onChange={(e) => setLeaveSummaryType(e.target.value)}
              options={
                data?.leaveSummary?.allowedLeaveTypes
                  ? data.leaveSummary.allowedLeaveTypes.map((t) => ({ value: t, label: t }))
                  : [
                      { value: 'ลาพักผ่อน', label: 'ลาพักผ่อน' },
                      { value: 'ลากิจ', label: 'ลากิจ' },
                      { value: 'ลาป่วย', label: 'ลาป่วย' },
                    ]
              }
              className="text-xs w-full"
            />
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs text-rose-700 dark:text-rose-300">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          {error}
        </div>
      )}

      {/* ── Readiness Summary Cards ── */}
      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">กำลังพลในสังกัด</span>
                <Users className="w-4 h-4 text-primary-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                {data.readiness.total} <span className="text-xs font-normal text-slate-400">นาย</span>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">พร้อมปฏิบัติหน้าที่</span>
                <Users className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                {data.readiness.activeDuty} <span className="text-xs font-normal text-slate-400">นาย</span>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ลาปฏิบัติงานวันนี้</span>
                <CalendarCheck className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
                {data.readiness.onLeaveToday} <span className="text-xs font-normal text-slate-400">นาย</span>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ความพร้อมรบรวม</span>
                <TrendingUp className="w-4 h-4 text-primary-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-primary-600 dark:text-primary-400 mt-2">
                {data.readiness.readinessRate}%
              </div>
              <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${data.readiness.readinessRate}%` }}
                />
              </div>
            </Card>
          </div>

          {/* ── Active Leaves Table ── */}
          <Card className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-amber-500" />
                  <span>รายชื่อกำลังพลที่ลาปฏิบัติงานวันนี้ ({data.activeLeaves.pagination.total} นาย)</span>
                </h3>
              </div>
              <div className="w-full sm:w-64">
                <Input
                  type="text"
                  placeholder="ค้นหากำลังพลที่ลา..."
                  value={activeLeavesSearch}
                  onChange={(e) => {
                    setActiveLeavesSearch(e.target.value);
                    setActiveLeavesPage(1);
                  }}
                  className="text-xs w-full"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-bold">
                    <th className="p-3">กำลังพล</th>
                    <th className="p-3">สังกัด / แผนก</th>
                    <th className="p-3">ประเภทการลา</th>
                    <th className="p-3">ช่วงเวลา</th>
                    <th className="p-3 text-center">คงเหลือ (วัน)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.activeLeaves.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500">
                        ไม่มีกำลังพลที่ลาในวันที่ระบุ
                      </td>
                    </tr>
                  ) : (
                    data.activeLeaves.items.map((leave) => (
                      <tr key={leave.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">
                          {leave.personnel.prefix}{leave.personnel.firstName} {leave.personnel.lastName}
                          <p className="text-[11px] text-slate-400 font-normal">{leave.personnel.position}</p>
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">
                          {leave.personnel.department}
                          {leave.personnel.subDepartment && ` / ${leave.personnel.subDepartment}`}
                        </td>
                        <td className="p-3">
                          <Badge variant="warning" size="sm">
                            {leave.leaveType}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {new Date(leave.startDate).toLocaleDateString('th-TH')} - {new Date(leave.endDate).toLocaleDateString('th-TH')}
                        </td>
                        <td className="p-3 text-center font-bold text-amber-600 dark:text-amber-400">
                          อีก {leave.daysRemaining} วัน
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {data.activeLeaves.pagination.totalPages > 1 && (
              <TablePagination
                totalItems={data.activeLeaves.pagination.total}
                indexOfFirstItem={(activeLeavesPage - 1) * activeLeavesLimit}
                indexOfLastItem={Math.min(activeLeavesPage * activeLeavesLimit, data.activeLeaves.pagination.total)}
                currentPage={data.activeLeaves.pagination.page}
                totalPages={data.activeLeaves.pagination.totalPages}
                pageSize={activeLeavesLimit}
                setCurrentPage={(p) => setActiveLeavesPage(typeof p === 'function' ? p(activeLeavesPage) : p)}
              />
            )}
          </Card>

          {/* ── Annual Leave Balance & Quota Summary Table ── */}
          <Card className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span>
                    สรุปโควตาและการใช้สิทธิ์ ({leaveSummaryType}) ประจำปี พ.ศ. {selectedYear + 543}
                  </span>
                </h3>
              </div>
              <div className="w-full sm:w-64">
                <Input
                  type="text"
                  placeholder="ค้นหากำลังพล..."
                  value={leaveSummarySearch}
                  onChange={(e) => {
                    setLeaveSummarySearch(e.target.value);
                    setLeaveSummaryPage(1);
                  }}
                  className="text-xs w-full"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-bold">
                    <th className="p-3">กำลังพล</th>
                    <th className="p-3">สังกัด</th>
                    <th className="p-3 text-center">สิทธิ์ตามโควตา</th>
                    <th className="p-3 text-center">ใช้ไปแล้ว</th>
                    <th className="p-3 text-center">รออนุมัติ</th>
                    <th className="p-3 text-center">คงเหลือ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.leaveSummary.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">
                        ไม่พบข้อมูลกำลังพล
                      </td>
                    </tr>
                  ) : (
                    data.leaveSummary.items.map((item) => (
                      <tr key={item.personnel.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">
                          {item.personnel.prefix}{item.personnel.firstName} {item.personnel.lastName}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{item.personnel.department}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {item.quota} วัน
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-rose-600 dark:text-rose-400">
                          {item.usedApprovedDays} วัน
                        </td>
                        <td className="p-3 text-center font-mono text-amber-600 dark:text-amber-400">
                          {item.pendingDays > 0 ? `${item.pendingDays} วัน` : '-'}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {item.remainingDays} วัน
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {data.leaveSummary.pagination.totalPages > 1 && (
              <TablePagination
                totalItems={data.leaveSummary.pagination.total}
                indexOfFirstItem={(leaveSummaryPage - 1) * leaveSummaryLimit}
                indexOfLastItem={Math.min(leaveSummaryPage * leaveSummaryLimit, data.leaveSummary.pagination.total)}
                currentPage={data.leaveSummary.pagination.page}
                totalPages={data.leaveSummary.pagination.totalPages}
                pageSize={leaveSummaryLimit}
                setCurrentPage={(p) => setLeaveSummaryPage(typeof p === 'function' ? p(leaveSummaryPage) : p)}
              />
            )}
          </Card>
        </>
      )}
    </div>
  );
}
