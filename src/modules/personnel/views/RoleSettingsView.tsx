'use client';

import React from 'react';
import RoleSettings from '../components/RoleSettings';

export default function RoleSettingsView() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
          <i className="fa-solid fa-user-shield text-lg"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            สิทธิ์การใช้งาน (Roles & Permissions)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            จัดการบทบาทและสิทธิ์การเข้าถึงโมดูลต่างๆ ของระบบ
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <RoleSettings />
      </div>
    </div>
  );
}
