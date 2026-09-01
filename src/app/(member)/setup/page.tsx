'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupAdminPage() {
  const [citizenId, setCitizenId] = useState('');
  const [badgeNo, setBadgeNo] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });
  const router = useRouter();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    try {
      const res = await fetch('/api/auth/setup-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citizenId, badgeNo, firstName, lastName, secretCode })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to setup admin');

      setStatus({ loading: false, error: '', success: 'ตั้งค่าผู้ดูแลระบบสำเร็จ กรุณาเข้าสู่ระบบ' });
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      setStatus({ loading: false, error: err.message, success: '' });
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 font-prompt">
      <div className="glass-card max-w-md w-full p-8 border border-slate-200 dark:border-slate-700/50 shadow-2xl rounded-2xl bg-white dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
            <i className="fa-solid fa-user-shield text-2xl text-rose-400"></i>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">กู้คืนสิทธิ์ผู้ดูแลระบบ</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">กรอกรหัสลับเพื่อตั้งค่าบัญชีของคุณเป็น Admin</p>
        </div>

        {status.error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm text-center">
            {status.error}
          </div>
        )}
        
        {status.success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm text-center">
            {status.success}
          </div>
        )}

        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label htmlFor="setup-citizenId" className="block text-slate-500 dark:text-slate-400 text-xs mb-1">เลขบัตรประชาชน (13 หลัก)</label>
            <input 
              id="setup-citizenId" 
              aria-label="เลขบัตรประชาชน 13 หลัก" 
              type="text" 
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={13} 
              required 
              value={citizenId} 
              onChange={e => setCitizenId(e.target.value.replace(/\D/g, '').slice(0, 13))} 
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 font-mono" 
            />
          </div>
          <div>
            <label htmlFor="setup-badgeNo" className="block text-slate-500 dark:text-slate-400 text-xs mb-1">เลขประจำตัวทหาร (10 หลัก)</label>
            <input 
              id="setup-badgeNo" 
              aria-label="เลขประจำตัวทหาร 10 หลัก" 
              type="text" 
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10} 
              required 
              value={badgeNo} 
              onChange={e => setBadgeNo(e.target.value.replace(/\D/g, '').slice(0, 10))} 
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 font-mono" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="setup-firstName" className="block text-slate-500 dark:text-slate-400 text-xs mb-1">ชื่อ</label>
              <input id="setup-firstName" aria-label="ชื่อ" type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label htmlFor="setup-lastName" className="block text-slate-500 dark:text-slate-400 text-xs mb-1">นามสกุล</label>
              <input id="setup-lastName" aria-label="นามสกุล" type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
            </div>
          </div>
          <div>
            <label htmlFor="setup-secretCode" className="block text-slate-500 dark:text-slate-400 text-xs mb-1">รหัสลับ (Secret Code)</label>
            <input id="setup-secretCode" aria-label="รหัสลับผู้ดูแลระบบ" type="password" required value={secretCode} onChange={e => setSecretCode(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-950 border border-rose-900/30 rounded-xl px-4 py-2.5 text-rose-400 focus:outline-none focus:border-rose-500" />
          </div>

          <button type="submit" disabled={status.loading} className="w-full mt-6 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium transition-all shadow-lg shadow-rose-600/20">
            {status.loading ? 'กำลังดำเนินการ...' : 'ตั้งค่า Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
