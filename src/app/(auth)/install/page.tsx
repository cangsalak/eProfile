'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function InstallPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    systemName: 'ระบบฐานข้อมูลบุคลากร',
    firstName: '',
    lastName: '',
    citizenId: '',
    badgeNo: '',
    password: '',
    confirmPassword: '',
    setupSecret: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการติดตั้ง');
      }

      toast.success('ตั้งค่าระบบและสร้างผู้ดูแลสำเร็จ!');
      
      // Save to localStorage so DashboardShell knows who is logged in
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      setTimeout(() => {
        router.push('/');
      }, 1500);

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 font-prompt">
      <div className="glass-card max-w-lg w-full p-8 border border-slate-200 dark:border-slate-700/50 shadow-2xl rounded-2xl bg-white dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-500/30">
            <i className="fa-solid fa-server text-2xl text-primary-500"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">ติดตั้งระบบ (Installation)</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            ตั้งค่าเริ่มต้นสำหรับระบบ
          </p>
        </div>

        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-10 -translate-y-1/2"></div>
          <div className={`absolute top-1/2 left-0 h-0.5 bg-primary-500 -z-10 -translate-y-1/2 transition-all duration-300 ${step === 1 ? 'w-0' : 'w-full'}`}></div>
          
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 1 ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
            1
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 2 ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
            2
          </div>
        </div>

        <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
          
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-semibold text-lg border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">ข้อมูลระบบ</h3>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">ชื่อระบบ (System Name)</label>
                <input 
                  type="text" 
                  name="systemName"
                  required 
                  value={formData.systemName} 
                  onChange={handleChange} 
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" 
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">รหัสลับการติดตั้ง (Setup Secret - ถ้ามี)</label>
                <input 
                  type="password" 
                  name="setupSecret"
                  placeholder="ระบุรหัส ADMIN_SETUP_SECRET หากมีกำหนดใน .env"
                  value={formData.setupSecret} 
                  onChange={handleChange} 
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" 
                />
              </div>
              
              <div className="pt-4">
                <button type="submit" className="w-full px-4 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all shadow-lg shadow-primary-600/20">
                  ถัดไป <i className="fa-solid fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-semibold text-lg border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">บัญชีผู้ดูแลระบบสูงสุด (Super Admin)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">ชื่อ</label>
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">นามสกุล</label>
                  <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">เลขบัตรประชาชน (13 หลัก - ใช้ล็อกอิน)</label>
                <input type="text" name="citizenId" maxLength={13} required value={formData.citizenId} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
              </div>
              
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">เลขประจำตัว (10 หลัก)</label>
                <input type="text" name="badgeNo" maxLength={10} required value={formData.badgeNo} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">รหัสผ่าน</label>
                  <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">ยืนยันรหัสผ่าน</label>
                  <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={prevStep} className="w-1/3 px-4 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors">
                  ย้อนกลับ
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center">
                  {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'ติดตั้งระบบ'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
