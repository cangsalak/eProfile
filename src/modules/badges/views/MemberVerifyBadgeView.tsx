'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Personnel } from '@/types/personnel';
import { Card, Badge, Button } from '@/components/ui';

export default function MemberVerifyBadgeView() {
  const params = useParams();
  const id = params.id as string;
  const [personnel, setPersonnel] = useState<Personnel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [allowPublic, setAllowPublic] = useState(true);

  useEffect(() => {
    // Check if public view is allowed via settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((settings) => {
        if (settings.allowPublicView === 'false') {
          setAllowPublic(false);
          setIsLoading(false);
          return;
        }

        // Fetch personnel details
        return fetch(`/api/modules/badges/verify/${id}`);
      })
      .then((res) => {
        if (!res) return;
        if (!res.ok) throw new Error('ไม่พบข้อมูลบุคคลนี้ในระบบ');
        return res.json();
      })
      .then((data) => {
        if (data) setPersonnel(data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 font-prompt">
        <i className="fa-solid fa-circle-notch fa-spin text-4xl text-primary-500 mb-3"></i>
        <p className="text-xs text-slate-500 dark:text-slate-400">กำลังตรวจสอบข้อมูลบัตรประจำตัว...</p>
      </div>
    );
  }

  if (!allowPublic) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-prompt">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl flex items-center justify-center mb-4 shadow-xs">
          <i className="fa-solid fa-lock text-2xl"></i>
        </div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-1">เข้าถึงไม่ได้</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">ระบบถูกตั้งค่าให้ไม่แสดงข้อมูลต่อสาธารณะ</p>
      </div>
    );
  }

  if (error || !personnel) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-prompt">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-2xl flex items-center justify-center mb-4 shadow-xs">
          <i className="fa-solid fa-circle-xmark text-2xl"></i>
        </div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-1">ไม่พบข้อมูลบัตรประจำตัว</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">บัตรนี้อาจถูกยกเลิก หรือไม่มีข้อมูลอยู่ในระบบ</p>
        <Link href="/login">
          <Button variant="outline" size="sm" icon="fa-solid fa-arrow-left">
            กลับหน้าเข้าสู่ระบบ
          </Button>
        </Link>
      </div>
    );
  }

  const avatar =
    personnel.avatarColor?.startsWith('data:image') || personnel.avatarColor?.startsWith('http')
      ? personnel.avatarColor
      : null;

  const isActive = personnel.status === 'ปฏิบัติงานปกติ' || personnel.status === 'ACTIVE';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 flex justify-center items-start font-prompt">
      <Card className="w-full max-w-md overflow-hidden mt-6 sm:mt-10 border border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl">
        {/* Card Header Profile Banner */}
        <div className="bg-primary-600 px-6 py-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

          <h2 className="text-white/90 text-xs font-bold uppercase tracking-wider mb-6 relative z-10">
            ระบบตรวจสอบข้อมูลกำลังพล (Official ID Verification)
          </h2>

          <div className="relative z-10 inline-block">
            <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-white dark:bg-slate-800 p-1 overflow-hidden shadow-lg mx-auto">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-3xl font-bold text-white"
                  style={{ backgroundColor: personnel.avatarColor || '#3b82f6' }}
                >
                  {personnel.firstName?.[0] || 'U'}
                </div>
              )}
            </div>

            {/* Status Indicator Icon */}
            <div
              className={`absolute bottom-0 right-0 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center shadow-md ${
                isActive ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            >
              <i className={`fa-solid ${isActive ? 'fa-check' : 'fa-xmark'} text-white text-xs`}></i>
            </div>
          </div>
        </div>

        {/* Card Details Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
              {personnel.prefix || ''}{personnel.firstName} {personnel.lastName}
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {personnel.position || 'เจ้าหน้าที่'}
            </p>
            <div className="mt-2.5">
              <Badge variant="primary" size="sm">
                {personnel.personnelType || 'ประเภทกำลังพล'}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-3 shrink-0">
                <i className="fa-solid fa-id-card text-sm"></i>
              </div>
              <div className="min-w-0">
                <p className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">รหัสประจำตัว (Badge No.)</p>
                <p className="text-slate-900 dark:text-white font-bold font-mono">{personnel.badgeNo}</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mr-3 shrink-0">
                <i className="fa-solid fa-sitemap text-sm"></i>
              </div>
              <div className="min-w-0">
                <p className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">สังกัด (Department)</p>
                <p className="text-slate-900 dark:text-white font-bold truncate">{personnel.department || '-'}</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mr-3 shrink-0">
                <i className="fa-solid fa-shield-halved text-sm"></i>
              </div>
              <div className="min-w-0">
                <p className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">สถานะกำลังพล (Status)</p>
                <p className={`font-bold ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {isActive ? 'กำลังพลปัจจุบัน (Active)' : personnel.status}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              ข้อมูลอัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
