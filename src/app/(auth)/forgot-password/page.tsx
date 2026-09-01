'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in-up">
      <Link href="/" className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <i className="fa-solid fa-key text-3xl text-white"></i>
          </div>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
          ลืมรหัสผ่าน?
        </h2>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          กรอกรหัสประจำตัวของคุณ เพื่อส่งคำขอให้ผู้ดูแลระบบรีเซ็ตรหัสผ่าน
        </p>

      <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl shadow-slate-200/20 dark:shadow-none sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-slate-700">
          
          {status === 'success' ? (
            <div className="text-center py-8 animate-scale-up">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-check text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">ส่งคำขอสำเร็จ</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">ผู้ดูแลระบบได้รับคำขอรีเซ็ตรหัสผ่านของคุณแล้ว กรุณารอการติดต่อกลับหรือแจ้งแอดมินโดยตรง</p>
              <Link 
                href="/login"
                className="text-primary-600 hover:text-primary-500 font-medium border border-primary-500 px-6 py-2 rounded-xl"
              >
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  รหัสประจำตัว (Username) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-user text-slate-400"></i>
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white transition-shadow"
                    placeholder="รหัสประจำตัวประชาชน หรือรหัสทหาร"
                  />
                </div>
              </div>

              {status === 'error' && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start">
                  <i className="fa-solid fa-circle-exclamation mt-0.5 mr-2"></i>
                  <span>เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้ง</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-70"
              >
                {status === 'loading' ? (
                  <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> กำลังส่งคำขอ...</>
                ) : (
                  <><i className="fa-solid fa-paper-plane mr-2"></i> ขอรีเซ็ตรหัสผ่าน</>
                )}
              </button>
            </form>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            จำรหัสผ่านได้แล้ว? เข้าสู่ระบบ
          </Link>
        </div>
    </div>
  );
}
