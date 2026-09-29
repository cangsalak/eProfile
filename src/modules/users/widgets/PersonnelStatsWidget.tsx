'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, StatCard, Badge, Button } from '@/components/ui';
import { Users, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PersonnelStatsWidget() {
  const [stats, setStats] = useState<{ totalPersonnel: number; activeDuty: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/modules/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setStats({
            totalPersonnel: data.stats?.totalPersonnel || 0,
            activeDuty: data.stats?.activeDuty || 0
          });
        }
      } catch (err) {
        console.error('Failed to load personnel stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <Card variant="convex" className="h-full flex flex-col min-h-[300px]">
      <CardHeader
        title="ทำเนียบกำลังพล"
        subtitle="ภาพรวมยอดกำลังพล"
        icon={<Users className="w-5 h-5 text-white" />}
        iconGradient="from-violet-500 to-primary-600"
        action={
          <Link href="/modules/users">
            <Button type="button" variant="secondary" size="xs" icon="fa-solid fa-arrow-right">
              เปิดทำเนียบ
            </Button>
          </Link>
        }
      />
      
      <div className="flex-1 flex items-center justify-center p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs font-prompt">กำลังโหลดข้อมูล...</span>
          </div>
        ) : (
          <div className="w-full space-y-4 font-prompt">
            <div className="flex justify-between items-center bg-violet-50 dark:bg-violet-900/20 p-3 rounded-2xl border border-violet-100 dark:border-violet-900/30">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">กำลังพลทั้งหมด</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-violet-600">{stats?.totalPersonnel || 0}</span>
                <span className="text-xs text-slate-500">นาย</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center bg-primary-50 dark:bg-primary-900/20 p-3 rounded-2xl border border-primary-100 dark:border-primary-900/30">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">พร้อมปฏิบัติหน้าที่</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-primary-600">{stats?.activeDuty || 0}</span>
                <span className="text-xs text-slate-500">นาย</span>
              </div>
            </div>
            
            <Link href="/modules/users/add" className="block w-full">
              <Button type="button" variant="primary" className="w-full justify-center mt-2 shadow-clay-button" icon="fa-solid fa-user-plus">
                เพิ่มกำลังพล
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}
