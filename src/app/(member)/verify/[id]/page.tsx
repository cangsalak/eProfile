'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Personnel } from '@/types/personnel';

export default function VerifyBadgePage() {
  const params = useParams();
  const id = params.id as string;
  const [personnel, setPersonnel] = useState<Personnel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [allowPublic, setAllowPublic] = useState(true);

  useEffect(() => {
    // Check if public view is allowed via settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(settings => {
        if (settings.allowPublicView === 'false') {
          setAllowPublic(false);
          setIsLoading(false);
          return;
        }
        
        // Fetch personnel details
        return fetch(`/api/verify/${id}`);
      })
      .then(res => {
        if (!res) return; // Handled by allowPublic check
        if (!res.ok) throw new Error('ไม่พบข้อมูลบุคคลนี้');
        return res.json();
      })
      .then(data => {
        if (data) setPersonnel(data);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <i className="fa-solid fa-circle-notch fa-spin text-4xl text-primary-500"></i>
      </div>
    );
  }

  if (!allowPublic) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mb-4">
          <i className="fa-solid fa-lock text-3xl"></i>
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">เข้าถึงไม่ได้</h1>
        <p className="text-slate-600">ระบบถูกตั้งค่าให้ไม่แสดงข้อมูลต่อสาธารณะ</p>
      </div>
    );
  }

  if (error || !personnel) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <i className="fa-solid fa-circle-xmark text-4xl"></i>
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">ไม่พบข้อมูล</h1>
        <p className="text-slate-600">บัตรนี้อาจถูกยกเลิก หรือไม่มีอยู่ในระบบ</p>
      </div>
    );
  }

  const avatar = (personnel.avatarColor?.startsWith('data:image') || personnel.avatarColor?.startsWith('http'))
    ? personnel.avatarColor 
    : null;

  const isActive = personnel.status === 'ปฏิบัติงานปกติ' || personnel.status === 'ACTIVE';

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 flex justify-center items-start">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden mt-10">
        <div className="bg-primary-600 px-6 py-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          
          <h2 className="text-white/90 text-sm font-semibold uppercase tracking-wider mb-6 relative z-10">
            ระบบตรวจสอบบุคคล
          </h2>
          
          <div className="relative z-10 inline-block">
            <div className="w-28 h-28 rounded-full border-4 border-white/20 bg-white p-1 overflow-hidden shadow-lg mx-auto">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center text-4xl font-bold text-white"
                  style={{ backgroundColor: personnel.avatarColor || '#3b82f6' }}
                >
                  {personnel.firstName?.[0] || 'U'}
                </div>
              )}
            </div>
            
            {/* Status Badge */}
            <div className={`absolute bottom-0 right-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-lg ${isActive ? 'bg-green-500' : 'bg-red-500'}`}>
              <i className={`fa-solid ${isActive ? 'fa-check' : 'fa-times'} text-white text-xs`}></i>
            </div>
          </div>
        </div>

        <div className="px-6 py-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              {personnel.prefix}{personnel.firstName} {personnel.lastName}
            </h1>
            <p className="text-slate-500 font-medium">{personnel.position || 'เจ้าหน้าที่'}</p>
            <div className="inline-block mt-3 px-4 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-slate-700 text-xs font-semibold">
              {personnel.personnelType || 'ประเภทกำลังพล'}
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mr-4">
                <i className="fa-solid fa-id-card"></i>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium">รหัสประจำตัว (Badge No.)</p>
                <p className="text-slate-900 font-bold">{personnel.badgeNo}</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center mr-4">
                <i className="fa-solid fa-sitemap"></i>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium">สังกัด (Department)</p>
                <p className="text-slate-900 font-bold">{personnel.department || '-'}</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center mr-4">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium">สถานะ (Status)</p>
                <p className={`font-bold ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {isActive ? 'กำลังพลปัจจุบัน (Active)' : personnel.status}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">ข้อมูลอัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
