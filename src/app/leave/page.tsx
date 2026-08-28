'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import LeaveList from '../../components/leaves/LeaveList';
import { Personnel } from '../../types/personnel';

export default function LeavePage() {
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

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          ระบบจัดการการลา
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          จัดการประวัติการลา ยื่นขอลา และตรวจสอบสถานะการลาของคุณ
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-8">กำลังโหลดข้อมูล...</div>}>
        <LeaveList personnelId={currentUser.id} isAdmin={currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN'} />
      </Suspense>
    </div>
  );
}
