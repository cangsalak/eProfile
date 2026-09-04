'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [systemName, setSystemName] = useState('eProfile');

  useEffect(() => {
    // If already authenticated via HttpOnly cookie, redirect to dashboard
    fetch('/api/auth/me')
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(data => {
        if (data?.user) {
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          router.replace('/dashboard');
        }
      })
      .catch(() => {});

    fetch('/api/settings').then(res => res.json()).then(data => {
      if (data.systemName) setSystemName(data.systemName);
      if (data.isInstalled === 'false') {
        router.push('/install');
      }
    }).catch(e => console.error(e));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }

      const data = await res.json();
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      toast.success('เข้าสู่ระบบสำเร็จ');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in-up">
      <Link href="/" className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
          <i className="fa-solid fa-shield-halved text-3xl text-white"></i>
        </div>
      </Link>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">เข้าสู่ระบบ</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">เข้าสู่ระบบเพื่อใช้งาน {systemName}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl shadow-slate-200/20 dark:shadow-none sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-slate-700">
        <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Username หรือ รหัสประจำตัว
            </label>
            <input
              type="text"
              autoComplete="off"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                รหัสผ่าน
              </label>
              <Link href="/forgot-password" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control pr-10"
              />
              <button
                type="button"
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember_me"
              name="remember_me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
            />
            <label htmlFor="remember_me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
              จดจำการเข้าสู่ระบบ
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full ui-btn-primary py-3"
          >
            {isLoading ? (
              <><i className="fa-solid fa-circle-notch fa-spin mr-2 mt-0.5"></i> กำลังตรวจสอบ...</>
            ) : (
              <><i className="fa-solid fa-right-to-bracket mr-2 mt-0.5"></i> เข้าสู่ระบบ</>
            )}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center">
        <Link href="/register" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
          ยังไม่มีบัญชีใช่หรือไม่? สมัครสมาชิกใหม่
        </Link>
      </div>
    </div>
  );
}
