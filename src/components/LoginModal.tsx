'use client';

import React, { useState } from 'react';
import { Personnel } from '../types/personnel';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: Personnel) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }

      onLoginSuccess(data.user);
      onClose();
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="no-print fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600/20 border border-primary-500/30 text-primary-400 flex items-center justify-center text-lg">
              <i className="fa-solid fa-[#fa-right-to-bracket] fa-shield-halved"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">เข้าสู่ระบบ eProfile</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">สำหรับบุคลากรและผู้ดูแลระบบ</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              เลขบัตรประจำตัวประชาชน (13 หลัก)
            </label>
            <div className="relative">
              <i className="fa-solid fa-id-card absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"></i>
              <input
                type="text"
                maxLength={13}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกเลขบัตรประชาชน 13 หลัก..."
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">รหัสผ่าน / เลขประจำตัวทหาร (10 หลัก)</label>
            <div className="relative">
              <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                maxLength={10}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกเลขประจำตัวทหาร 10 หลัก..."
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-white"
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Quick Demo Login Help */}
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">💡 บัญชีทดสอบระบบ (Quick Demo):</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('1111111111111', '1000000001')}
                className="px-2 py-1 rounded bg-primary-500/20 text-primary-300 hover:bg-primary-500/30"
              >
                Admin (สมชาย)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('2222222222222', '1000000002')}
                className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
              >
                Officer (นภาภรณ์)
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
            <a href="/setup" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              <i className="fa-solid fa-shield-halved mr-1"></i>
              ตั้งค่าแอดมินฉุกเฉิน
            </a>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold flex items-center gap-2"
              >
                {isLoading ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-right-to-bracket"></i>
                )}
                เข้าสู่ระบบ
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
