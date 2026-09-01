'use client';

import React, { useState, useEffect } from 'react';
import { Personnel } from '@/types/personnel';
import toast from 'react-hot-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: Personnel) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [systemName, setSystemName] = useState('eProfile');

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => {
      if (data.systemName) setSystemName(data.systemName);
    }).catch(e => console.error(e));
  }, []);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      toast.success('เข้าสู่ระบบสำเร็จ');
    } catch (err: any) {
      toast.error(err.message);
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">เข้าสู่ระบบ {systemName}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">สำหรับบุคลากรและผู้ดูแลระบบ</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label htmlFor="modalUsername" className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              เลขบัตรประจำตัวประชาชน (13 หลัก)
            </label>
            <div className="relative">
              <i className="fa-solid fa-id-card absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"></i>
              <input
                id="modalUsername"
                type="text"
                aria-label="เลขบัตรประจำตัวประชาชน (13 หลัก)"
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
            <label htmlFor="modalPassword" className="block text-slate-700 dark:text-slate-300 font-medium mb-1">รหัสผ่าน / เลขประจำตัวทหาร (10 หลัก)</label>
            <div className="relative">
              <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"></i>
              <input
                id="modalPassword"
                type={showPassword ? 'text' : 'password'}
                aria-label="รหัสผ่านหรือเลขประจำตัวทหาร (10 หลัก)"
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
