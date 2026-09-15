'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginView() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [systemName, setSystemName] = useState('eProfile');

  useEffect(() => {
    // If already authenticated via HttpOnly cookie, redirect to dashboard
    fetch('/api/auth/me?silent=true')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.user) {
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          window.location.href = '/dashboard';
        }
      })
      .catch(() => {});

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.systemName) setSystemName(data.systemName);
        if (data.isInstalled === 'false') {
          router.push('/install');
        }
      })
      .catch((e) => console.error(e));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }

      const data = await res.json();
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      toast.success('เข้าสู่ระบบสำเร็จ');

      // Use window.location.href to guarantee full reload with the new auth cookie
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect') || '/dashboard';
      window.location.href = redirectUrl;
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
    <div className="w-full max-w-md animate-fade-in-up">
      {/* Brand Header */}
      <Link href="/" className="mb-8 flex flex-col items-center group">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white shadow-lg shadow-primary-500/30 transition-transform group-hover:scale-105">
          <i className="fa-solid fa-id-card text-2xl" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {systemName}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          ระบบฐานข้อมูลกำลังพลและบัตรประจำตัวอิเล็กทรอนิกส์
        </p>
      </Link>

      {/* Main Login Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-none">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              ชื่อผู้ใช้งาน / รหัสประจำตัวประชาชน / หมายเลขบัตร
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <i className="fa-solid fa-user text-sm" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้ หรือ เลขบัตร ปชช. 13 หลัก"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                รหัสผ่าน
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <i className="fa-solid fa-lock text-sm" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านของคุณ"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:from-primary-700 hover:to-primary-600 hover:shadow-primary-500/35 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin text-sm" />
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              <>
                เข้าสู่ระบบ
                <i className="fa-solid fa-arrow-right text-xs" />
              </>
            )}
          </button>
        </form>

        {/* Quick Login for Dev/Demo */}
        <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
          <p className="mb-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
            ทางลัดเข้าสู่ระบบสำหรับทดสอบ (Demo Accounts)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('superadmin', 'password')}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <i className="fa-solid fa-crown block mb-1 text-amber-500" />
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('1000000001', 'password')}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <i className="fa-solid fa-user-shield block mb-1 text-primary-500" />
              Admin IT
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('1000000002', 'password')}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <i className="fa-solid fa-user block mb-1 text-emerald-500" />
              Staff
            </button>
          </div>
        </div>
      </div>

      {/* Footer Registration Link */}
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        ยังไม่มีบัญชีผู้ใช้งาน?{' '}
        <Link
          href="/register"
          className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
        >
          ลงทะเบียนใหม่
        </Link>
      </p>
    </div>
  );
}
