'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TablePagination from '@/components/common/TablePagination';

interface ApplicantInfo {
  id: string;
  prefix?: string;
  firstName: string;
  lastName: string;
  position?: string;
  department: string;
  subDepartment?: string;
  avatarColor?: string;
  phone?: string;
  mobile?: string;
  badgeNo?: string;
}

interface ApproverInfo {
  id: string;
  prefix?: string;
  firstName: string;
  lastName: string;
  role: string;
  position?: string;
}

interface LeaveApprovalItem {
  id: string;
  personnelId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
  writtenAt?: string;
  toPerson?: string;
  contactAddress?: string;
  contactTambon?: string;
  contactAmphoe?: string;
  contactProvince?: string;
  status: string;
  approvedById?: string;
  approvedAt?: string;
  rejectionReason?: string;
  approvalNote?: string;
  substitutePerson?: string;
  accumulatedLeaveDays?: number;
  thisYearLeaveDays?: number;
  totalLeaveDays?: number;
  ordainedBefore?: boolean;
  ordainTempleName?: string;
  ordainTempleLocation?: string;
  ordainDate?: string;
  stayTempleName?: string;
  stayTempleLocation?: string;
  maternityLeaveTimes?: number;
  maternityLeaveDays?: number;
  createdAt: string;
  personnel: ApplicantInfo;
  approvedBy?: ApproverInfo | null;
}

interface LeaveApprovalsResponse {
  success: boolean;
  scope: {
    isGlobalViewer: boolean;
    userRole: string;
    userDepartment: string | null;
    userSubDepartment: string | null;
    effectiveDepartment: string;
    effectiveSubDepartment: string;
  };
  summary: {
    pendingCount: number;
    approvedTodayCount: number;
    rejectedTodayCount: number;
    totalInScope: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  items: LeaveApprovalItem[];
}

export default function LeaveApprovalsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Data State
  const [data, setData] = useState<LeaveApprovalsResponse | null>(null);
  const [departmentsList, setDepartmentsList] = useState<{ id: string; name: string; subDepartments?: any[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('รออนุมัติ');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [subDepartmentFilter, setSubDepartmentFilter] = useState<string>('ALL');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Modal / Action State
  const [selectedLeave, setSelectedLeave] = useState<LeaveApprovalItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // ── 1. Auth & Permission Verification ──────────────────────────────────────
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const authData = await res.json();
        if (authData?.user) {
          const user = authData.user;
          setCurrentUser(user);
          const perms = user.permissions || [];
          const hasPerm =
            user.role === 'SUPER_ADMIN' ||
            perms.includes('APPROVE_LEAVE') ||
            ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_COMMANDER', 'COMMANDER'].includes(user.role);

          if (!hasPerm) {
            setIsAuthorized(false);
            return;
          }
          setIsAuthorized(true);
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      }
    };

    fetchUser();
  }, [router]);

  // ── 2. Fetch Departments for Filters ───────────────────────────────────────
  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(deptData => {
        if (Array.isArray(deptData)) {
          setDepartmentsList(deptData);
        }
      })
      .catch(() => {});
  }, []);

  // ── 3. Fetch Leave Approvals Data ──────────────────────────────────────────
  const fetchApprovals = useCallback(async () => {
    if (!isAuthorized) return;
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (leaveTypeFilter && leaveTypeFilter !== 'ALL') params.set('leaveType', leaveTypeFilter);
      if (departmentFilter && departmentFilter !== 'ALL') params.set('department', departmentFilter);
      if (subDepartmentFilter && subDepartmentFilter !== 'ALL') params.set('subDepartment', subDepartmentFilter);
      if (startDateFilter) params.set('startDate', startDateFilter);
      if (endDateFilter) params.set('endDate', endDateFilter);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      params.set('sortBy', 'createdAt');
      params.set('sortOrder', 'desc');

      const res = await fetch(`/api/leaves/approvals?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 403) {
          setIsAuthorized(false);
          return;
        }
        throw new Error('ไม่สามารถดึงข้อมูลรายการอนุมัติการลาได้');
      }

      const resData: LeaveApprovalsResponse = await res.json();
      setData(resData);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  }, [
    isAuthorized,
    statusFilter,
    leaveTypeFilter,
    departmentFilter,
    subDepartmentFilter,
    startDateFilter,
    endDateFilter,
    searchTerm,
    page,
    limit,
  ]);

  useEffect(() => {
    if (isAuthorized) {
      fetchApprovals();
    }
  }, [isAuthorized, fetchApprovals]);

  // ── Sub-departments for current department selection ───────────────────────
  const currentSubDepartments = useMemo(() => {
    if (departmentFilter === 'ALL') return [];
    const dept = departmentsList.find(d => d.name === departmentFilter);
    if (!dept?.subDepartments) return [];
    try {
      return typeof dept.subDepartments === 'string'
        ? JSON.parse(dept.subDepartments)
        : dept.subDepartments;
    } catch {
      return [];
    }
  }, [departmentFilter, departmentsList]);

  // ── 4. Action Handlers (Approve / Reject) ───────────────────────────────────
  const handleOpenActionModal = (leave: LeaveApprovalItem, type: 'approve' | 'reject') => {
    setSelectedLeave(leave);
    setActionType(type);
    setActionNote('');
    setRejectionReason('');
    setActionError(null);
  };

  const handleOpenDetailModal = (leave: LeaveApprovalItem) => {
    setSelectedLeave(leave);
    setIsDetailModalOpen(true);
  };

  const handleExecuteAction = async () => {
    if (!selectedLeave || !actionType) return;
    setIsSubmittingAction(true);
    setActionError(null);

    try {
      if (actionType === 'reject' && rejectionReason.trim().length < 2) {
        setActionError('กรุณาระบุเหตุผลการไม่อนุมัติอย่างน้อย 2 ตัวอักษร');
        setIsSubmittingAction(false);
        return;
      }

      const endpoint =
        actionType === 'approve'
          ? `/api/leaves/${selectedLeave.id}/approve`
          : `/api/leaves/${selectedLeave.id}/reject`;

      const payload =
        actionType === 'approve'
          ? { note: actionNote.trim() || undefined }
          : { reason: rejectionReason.trim(), note: actionNote.trim() || undefined };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || 'เกิดข้อผิดพลาดในการดำเนินการ');
      }

      // Success
      setSuccessToast(actionType === 'approve' ? 'อนุมัติใบลาเรียบร้อยแล้ว' : 'บันทึกการไม่อนุมัติใบลาเรียบร้อยแล้ว');
      setTimeout(() => setSuccessToast(null), 4000);

      setActionType(null);
      setSelectedLeave(null);
      setIsDetailModalOpen(false);
      fetchApprovals();
    } catch (err: any) {
      setActionError(err.message || 'เกิดข้อผิดพลาดในการทำรายการ');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Helper calculation for duration in days
  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getLeaveTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'ลาพักผ่อน':
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'รออนุมัติ':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>รออนุมัติ</span>
          </span>
        );
      case 'อนุมัติแล้ว':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <i className="fa-solid fa-check text-[10px]"></i>
            <span>อนุมัติแล้ว</span>
          </span>
        );
      case 'ไม่อนุมัติ':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <i className="fa-solid fa-xmark text-[10px]"></i>
            <span>ไม่อนุมัติ</span>
          </span>
        );
      case 'ยกเลิก':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <i className="fa-solid fa-ban text-[10px]"></i>
            <span>ยกเลิก</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  // ── Access Denied State ────────────────────────────────────────────────────
  if (isAuthorized === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-fade-in font-prompt">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl mb-4 border border-rose-500/20">
          <i className="fa-solid fa-lock"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          ไม่มีสิทธิ์เข้าถึงหน้านี้
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
          หน้านี้สงวนไว้สำหรับผู้บังคับบัญชาและผู้มีสิทธิ์พิจารณาอนุมัติใบลา (APPROVE_LEAVE) เท่านั้น
        </p>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold rounded-xl shadow-md transition"
        >
          กลับสู่หน้าหลัก
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-fade-in font-prompt">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 text-xs font-semibold animate-slide-down">
          <i className="fa-solid fa-circle-check text-sm"></i>
          <span>{successToast}</span>
        </div>
      )}

      {/* ── Top Header - Harmonized with eProfile Emerald Theme ───────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-bl from-primary-100/70 via-emerald-50/40 to-teal-50/20 dark:from-primary-950/40 dark:via-emerald-950/20 dark:to-teal-950/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-80 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800/80 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-3 shadow-sm">
              <i className="fa-solid fa-clipboard-check text-primary-600 dark:text-primary-400"></i>
              <span>ระบบอนุมัติการลา (Leave Approvals Management)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <span>ศูนย์พิจารณาและอนุมัติการลา</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1.5 flex flex-wrap items-center gap-2">
              <span>ติดตาม ตรวจสอบ และพิจารณาคำขอลาของกำลังพลในสังกัด</span>
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
              onClick={() => fetchApprovals()}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <i className={`fa-solid fa-rotate-right ${isLoading ? 'fa-spin' : ''}`}></i>
              <span>รีเฟรชข้อมูล</span>
            </button>
            <Link
              href="/dashboard/command"
              className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold transition flex items-center gap-2 shadow-md shadow-primary-500/20"
            >
              <i className="fa-solid fa-chess-king"></i>
              <span>แดชบอร์ดผู้บังคับบัญชา</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── KPI Summary Cards (4 Cards) ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: รออนุมัติ */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">รอพิจารณาอนุมัติ</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
              {(data?.summary.pendingCount ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5 font-medium">คำขอที่รอดำเนินการ</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-hourglass-half animate-pulse"></i>
          </div>
        </div>

        {/* Card 2: อนุมัติวันนี้ */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">อนุมัติแล้ววันนี้</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              {(data?.summary.approvedTodayCount ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 font-medium">คำขอที่อนุมัติวันนี้</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-circle-check"></i>
          </div>
        </div>

        {/* Card 3: ไม่อนุมัติวันนี้ */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">ไม่อนุมัติวันนี้</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
              {(data?.summary.rejectedTodayCount ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5 font-medium">คำขอที่ไม่อนุมัติวันนี้</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-circle-xmark"></i>
          </div>
        </div>

        {/* Card 4: คำขอทั้งหมดในขอบเขต */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">คำขอทั้งหมดในหน่วย</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
              {(data?.summary.totalInScope ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-medium">ประวัติคำขอทั้งหมดในสังกัด</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-folder-open"></i>
          </div>
        </div>
      </div>

      {/* ── Filter Controls ──────────────────────────────────────────────── */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'รออนุมัติ', value: 'รออนุมัติ', icon: 'fa-hourglass-half' },
              { label: 'อนุมัติแล้ว', value: 'อนุมัติแล้ว', icon: 'fa-check' },
              { label: 'ไม่อนุมัติ', value: 'ไม่อนุมัติ', icon: 'fa-xmark' },
              { label: 'ทั้งหมด', value: 'ALL', icon: 'fa-list' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  statusFilter === tab.value
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <i className={`fa-solid ${tab.icon} text-[10px]`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="ค้นหาชื่อ, ตำแหน่ง, รหัส..."
              className="w-full h-9 pl-9 pr-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Detailed Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Leave Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              ประเภทการลา
            </label>
            <select
              value={leaveTypeFilter}
              onChange={e => {
                setLeaveTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">-- ทุกประเภทการลา --</option>
              <option value="ลาพักผ่อน">ลาพักผ่อน</option>
              <option value="ลากิจ">ลากิจ</option>
              <option value="ลาป่วย">ลาป่วย</option>
              <option value="ลาคลอดบุตร">ลาคลอดบุตร</option>
              <option value="ลาอุปสมบท">ลาอุปสมบท</option>
              <option value="ไปช่วยราชการ">ไปช่วยราชการ</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              หน่วยงาน / กอง
            </label>
            <select
              value={departmentFilter}
              onChange={e => {
                setDepartmentFilter(e.target.value);
                setSubDepartmentFilter('ALL');
                setPage(1);
              }}
              disabled={data?.scope && !data.scope.isGlobalViewer}
              className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
            >
              {data?.scope?.isGlobalViewer && <option value="ALL">-- ทุกหน่วยงาน --</option>}
              {departmentsList.map(dept => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub Department */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              หน่วยย่อย / แผนก
            </label>
            <select
              value={subDepartmentFilter}
              onChange={e => {
                setSubDepartmentFilter(e.target.value);
                setPage(1);
              }}
              disabled={data?.scope?.userRole === 'COMMANDER' && data?.scope?.userSubDepartment !== '-'}
              className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
            >
              <option value="ALL">-- ทั้งหมดในหน่วย --</option>
              {currentSubDepartments.map((sub: any, idx: number) => (
                <option key={idx} value={sub.name || sub}>
                  {sub.name || sub}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                ตั้งแต่วันที่
              </label>
              <input
                type="date"
                value={startDateFilter}
                onChange={e => {
                  setStartDateFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                ถึงวันที่
              </label>
              <input
                type="date"
                value={endDateFilter}
                onChange={e => {
                  setEndDateFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Table Section ────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">กำลังโหลดรายการคำขอลา...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-rose-500 p-6">
            <i className="fa-solid fa-triangle-exclamation text-3xl mb-2"></i>
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={() => fetchApprovals()}
              className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="py-20 text-center p-6">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-2xl mx-auto mb-3">
              <i className="fa-solid fa-folder-open"></i>
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              ไม่พบรายการคำขอลา
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              ไม่มีคำขอลาที่ตรงกับเงื่อนไขการค้นหาหรือไม่มีคำขอที่รอดำเนินการในขอบเขตของคุณ
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3.5">ผู้ยื่นคำขอ (Personnel)</th>
                  <th className="px-4 py-3.5">สังกัด / หน่วยงาน</th>
                  <th className="px-4 py-3.5">ประเภทการลา</th>
                  <th className="px-4 py-3.5">ช่วงวันที่ลา</th>
                  <th className="px-4 py-3.5 text-center">จำนวนวัน</th>
                  <th className="px-4 py-3.5">วันที่ยื่น</th>
                  <th className="px-4 py-3.5 text-center">สถานะ</th>
                  <th className="px-5 py-3.5 text-right">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.items.map(item => {
                  const days = calculateDays(item.startDate, item.endDate);
                  const applicantFullName = `${item.personnel.prefix || ''}${item.personnel.firstName} ${item.personnel.lastName}`.trim();
                  const isSelf = currentUser && item.personnelId === currentUser.id;
                  const isPending = item.status === 'รออนุมัติ';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      {/* Personnel */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm ${
                              item.personnel.avatarColor || 'bg-primary-600'
                            }`}
                          >
                            {item.personnel.firstName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{applicantFullName}</span>
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 font-normal">
                                  (คำขอของคุณ)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {item.personnel.position || 'เจ้าหน้าที่'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-4">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          {item.personnel.department}
                        </div>
                        {item.personnel.subDepartment && item.personnel.subDepartment !== '-' && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.personnel.subDepartment}
                          </div>
                        )}
                      </td>

                      {/* Leave Type */}
                      <td className="px-4 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border ${getLeaveTypeBadgeClass(item.leaveType)}`}>
                          {item.leaveType}
                        </span>
                      </td>

                      {/* Date Range */}
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {new Date(item.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          ถึง {new Date(item.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {days} วัน
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-4 text-slate-500 dark:text-slate-400 text-[11px]">
                        {new Date(item.createdAt).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetailModal(item)}
                            title="ดูรายละเอียดฉบับเต็ม"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                          >
                            <i className="fa-solid fa-eye text-xs"></i>
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleOpenActionModal(item, 'approve')}
                                title="อนุมัติใบลา"
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1"
                              >
                                <i className="fa-solid fa-check text-xs"></i>
                                <span className="hidden sm:inline">อนุมัติ</span>
                              </button>

                              <button
                                onClick={() => handleOpenActionModal(item, 'reject')}
                                title="ไม่อนุมัติ"
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1"
                              >
                                <i className="fa-solid fa-xmark text-xs"></i>
                                <span className="hidden sm:inline">ไม่อนุมัติ</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.pagination.total > 0 && (
          <TablePagination
            totalItems={data.pagination.total}
            indexOfFirstItem={(page - 1) * limit}
            indexOfLastItem={page * limit}
            currentPage={page}
            totalPages={data.pagination.totalPages}
            pageSize={limit}
            unitName="คำขอ"
            setPageSize={setLimit}
            setCurrentPage={setPage}
          />
        )}
      </div>

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      {isDetailModalOpen && selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-file-lines"></i>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    รายละเอียดคำขอลา ({selectedLeave.leaveType})
                  </h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    รหัสคำขอ: <span className="font-mono">{selectedLeave.id}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-xs transition"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Applicant Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm ${
                      selectedLeave.personnel.avatarColor || 'bg-primary-600'
                    }`}
                  >
                    {selectedLeave.personnel.firstName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedLeave.personnel.prefix || ''}{selectedLeave.personnel.firstName} {selectedLeave.personnel.lastName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {selectedLeave.personnel.position || 'เจ้าหน้าที่'} • {selectedLeave.personnel.department}
                      {selectedLeave.personnel.subDepartment && selectedLeave.personnel.subDepartment !== '-' ? ` (${selectedLeave.personnel.subDepartment})` : ''}
                    </div>
                  </div>
                </div>
                <div>{getStatusBadge(selectedLeave.status)}</div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3.5 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">ประเภทการลา</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedLeave.leaveType}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">จำนวนวันลา</span>
                  <span className="font-bold font-mono text-primary-600 dark:text-primary-400">
                    {calculateDays(selectedLeave.startDate, selectedLeave.endDate)} วัน
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">ตั้งแต่วันที่</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(selectedLeave.startDate).toLocaleDateString('th-TH', { dateStyle: 'long' })}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">ถึงวันที่</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(selectedLeave.endDate).toLocaleDateString('th-TH', { dateStyle: 'long' })}
                  </span>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  เหตุผลความจำเป็นในการลา
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {selectedLeave.reason || 'ไม่ได้ระบุเหตุผล'}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  สถานที่ติดต่อระหว่างลา
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {[
                    selectedLeave.contactAddress,
                    selectedLeave.contactTambon ? `ต.${selectedLeave.contactTambon}` : '',
                    selectedLeave.contactAmphoe ? `อ.${selectedLeave.contactAmphoe}` : '',
                    selectedLeave.contactProvince ? `จ.${selectedLeave.contactProvince}` : '',
                  ]
                    .filter(Boolean)
                    .join(' ') || 'ไม่ได้ระบุที่อยู่ติดต่อ'}
                  {selectedLeave.personnel.phone && (
                    <div className="mt-1 text-slate-500 dark:text-slate-400">
                      เบอร์โทรศัพท์: <span className="font-mono text-slate-800 dark:text-slate-200">{selectedLeave.personnel.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Specific Details */}
              {selectedLeave.substitutePerson && (
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">ผู้รับมอบหมายหน้าที่ระหว่างลา</span>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-medium">
                    {selectedLeave.substitutePerson}
                  </div>
                </div>
              )}

              {/* Ordination details */}
              {selectedLeave.leaveType === 'ลาอุปสมบท' && (
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 space-y-1">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300">ข้อมูลการอุปสมบท:</div>
                  <div className="text-slate-700 dark:text-slate-300">
                    วัดที่อุปสมบท: {selectedLeave.ordainTempleName || '-'} ({selectedLeave.ordainTempleLocation || '-'})
                  </div>
                  {selectedLeave.ordainDate && (
                    <div className="text-slate-700 dark:text-slate-300">
                      วันที่อุปสมบท: {new Date(selectedLeave.ordainDate).toLocaleDateString('th-TH')}
                    </div>
                  )}
                </div>
              )}

              {/* Review / Approver Details if processed */}
              {selectedLeave.status !== 'รออนุมัติ' && (
                <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>ประวัติการพิจารณา</span>
                    {selectedLeave.approvedAt && (
                      <span className="text-[11px] font-normal text-slate-500">
                        {new Date(selectedLeave.approvedAt).toLocaleString('th-TH')}
                      </span>
                    )}
                  </div>
                  {selectedLeave.approvedBy && (
                    <div className="text-slate-700 dark:text-slate-300">
                      ผู้พิจารณา:{' '}
                      <span className="font-semibold">
                        {selectedLeave.approvedBy.prefix || ''}{selectedLeave.approvedBy.firstName} {selectedLeave.approvedBy.lastName}
                      </span>{' '}
                      ({selectedLeave.approvedBy.role})
                    </div>
                  )}
                  {selectedLeave.rejectionReason && (
                    <div className="text-rose-600 dark:text-rose-400">
                      เหตุผลที่ไม่อนุมัติ: <span className="font-semibold">{selectedLeave.rejectionReason}</span>
                    </div>
                  )}
                  {selectedLeave.approvalNote && (
                    <div className="text-slate-600 dark:text-slate-400">
                      หมายเหตุ: {selectedLeave.approvalNote}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300"
              >
                ปิดหน้าต่าง
              </button>

              {selectedLeave.status === 'รออนุมัติ' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleOpenActionModal(selectedLeave, 'reject');
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition"
                  >
                    ไม่อนุมัติ
                  </button>
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleOpenActionModal(selectedLeave, 'approve');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md"
                  >
                    อนุมัติการลา
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Action Confirmation Dialog (Approve / Reject) ────────────────── */}
      {actionType && selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className={`p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 ${
              actionType === 'approve' ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : 'bg-rose-50/50 dark:bg-rose-950/20'
            }`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 ${
                actionType === 'approve' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
              }`}>
                <i className={`fa-solid ${actionType === 'approve' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {actionType === 'approve' ? 'ยืนยันการอนุมัติใบลา' : 'ยืนยันการไม่อนุมัติใบลา'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  คำขอของ: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedLeave.personnel.prefix || ''}{selectedLeave.personnel.firstName} {selectedLeave.personnel.lastName}</span>
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs">
              {actionError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 font-medium">
                  <i className="fa-solid fa-circle-exclamation mr-1.5"></i>
                  {actionError}
                </div>
              )}

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1 text-slate-600 dark:text-slate-400">
                <div>ประเภทการลา: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLeave.leaveType}</span></div>
                <div>
                  ช่วงวันที่:{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(selectedLeave.startDate).toLocaleDateString('th-TH')} - {new Date(selectedLeave.endDate).toLocaleDateString('th-TH')}
                  </span>{' '}
                  ({calculateDays(selectedLeave.startDate, selectedLeave.endDate)} วัน)
                </div>
              </div>

              {actionType === 'reject' && (
                <div>
                  <label className="block text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
                    เหตุผลการไม่อนุมัติ <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="กรุณาระบุเหตุผล เช่น ติดภารกิจราชการเร่งด่วน, ข้อมูลไม่ครบถ้วน..."
                    rows={3}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  หมายเหตุเพิ่มเติม (ถ้ามี)
                </label>
                <input
                  type="text"
                  value={actionNote}
                  onChange={e => setActionNote(e.target.value)}
                  placeholder="ข้อความหมายเหตุถึงผู้ยื่นคำขอ..."
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => setActionType(null)}
                disabled={isSubmittingAction}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={isSubmittingAction}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition flex items-center gap-2 shadow-md ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                }`}
              >
                {isSubmittingAction ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <i className={`fa-solid ${actionType === 'approve' ? 'fa-check' : 'fa-xmark'}`}></i>
                    <span>{actionType === 'approve' ? 'ยืนยันอนุมัติ' : 'ยืนยันไม่อนุมัติ'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
