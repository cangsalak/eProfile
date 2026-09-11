'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';
import { Personnel } from '@/types/personnel';
import LeaveList from '../components/LeaveList';

export default function LeaveDashboardView() {
  const [currentUser, setCurrentUser] = useState<Personnel | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      router.push('/');
    }
  }, [router]);

  if (!currentUser) return null;

  const perms = (currentUser as any).permissions || [];
  const canApprove =
    currentUser.role === 'SUPER_ADMIN' ||
    perms.includes('APPROVE_LEAVE') ||
    ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_COMMANDER', 'COMMANDER'].includes(currentUser.role || '');

  return (
    <div className="animate-fade-in pb-12 font-prompt space-y-6">
      {/* ── Submenu Header Navigation ── */}
      <PageHeaderExtra>
        <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
          <Link
            href="/modules/leaves"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 bg-primary-600 text-white shadow-sm shadow-primary-500/30"
          >
            <i className="fa-solid fa-calendar-alt text-xs"></i>
            <span>ยื่นและประวัติการลา</span>
          </Link>
          {canApprove && (
            <Link
              href="/modules/leaves/approvals"
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60"
            >
              <i className="fa-solid fa-clipboard-check text-xs text-slate-400"></i>
              <span>อนุมัติการลา</span>
            </Link>
          )}
        </div>
      </PageHeaderExtra>

      <Suspense fallback={<div className="text-center py-8">กำลังโหลดข้อมูล...</div>}>
        <LeaveList personnelId={currentUser.id} isAdmin={['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role || '')} />
      </Suspense>
    </div>
  );
}
