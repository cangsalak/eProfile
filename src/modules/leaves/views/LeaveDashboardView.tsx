'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
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

  return (
    <div className="animate-fade-in pb-12">
      <Suspense fallback={<div className="text-center py-8">กำลังโหลดข้อมูล...</div>}>
        <LeaveList personnelId={currentUser.id} isAdmin={['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role || '')} />
      </Suspense>
    </div>
  );
}
