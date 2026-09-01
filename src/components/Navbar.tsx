'use client';
import Link from "next/link";

import React, { useState, useEffect } from 'react';
import { Personnel } from '@/types/personnel';

interface NavbarProps {
  currentUser: Personnel | null;
  onOpenLoginModal: () => void;
  onOpenAddModal: () => void;
  onLogout: () => void;
}

export default function Navbar({
  currentUser,
  onOpenLoginModal,
  onOpenAddModal,
  onLogout,
}: NavbarProps) {
  const [systemName, setSystemName] = useState('eProfile บุคลากร');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.systemName) setSystemName(data.systemName);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <header className="no-print sticky top-0 z-40 bg-slate-100 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-primary-600 dark:bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
            <i className="fa-solid fa-users text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-slate-900 dark:text-white">ระบบ {systemName}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Electronic Personnel Profile & Digital ID Directory</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <a
            href="/"
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-arrow-left"></i> TACTIC PORTAL
          </a>

          {currentUser ? (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 pl-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-900 dark:text-white text-xs font-bold"
                style={{ backgroundColor: currentUser.avatarColor || '#6366f1' }}
              >
                {currentUser.firstName.charAt(0)}
              </div>
              <div className="text-xs">
                <span className="text-slate-900 dark:text-white font-medium block leading-tight">
                  {currentUser.prefix} {currentUser.firstName}
                </span>
                <span className="text-[10px] text-primary-400 font-semibold uppercase">
                  {currentUser.role || 'USER'}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="ml-2 px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs transition-colors"
                title="ออกจากระบบ"
              >
                <i className="fa-solid fa-right-from-bracket"></i>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-right-to-bracket"></i> เข้าสู่ระบบ
            </button>
          )}

          {currentUser && (
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-600/30 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i> เพิ่มบุคลากร
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
