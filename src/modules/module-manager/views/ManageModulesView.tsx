'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';
import ModuleManagerSettings from '../components/ModuleManagerSettings';

export default function ManageModulesView() {
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      toast.error('ไม่สามารถโหลดการตั้งค่าได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateSettings = async (newSettings: any) => {
    setSettings(newSettings);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('eprofile-theme-change', {
              detail: newSettings,
            })
          );
          window.dispatchEvent(
            new CustomEvent('eprofile-settings-change', {
              detail: newSettings,
            })
          );
        }
      } else {
        toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="pb-16 space-y-6 animate-fade-in font-prompt">
      {/* ── Submenu Header Navigation ── */}
      <PageHeaderExtra>
        <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
          <Link
            href="/modules/module-manager"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 bg-primary-600 text-white shadow-sm shadow-primary-500/30"
          >
            <i className="fa-solid fa-puzzle-piece text-xs"></i>
            <span>จัดการโมดูลส่วนเสริม</span>
          </Link>
          <Link
            href="/modules/module-manager/menus"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-bars-staggered text-xs"></i>
            <span>ปรับแต่งเมนูระบบ</span>
          </Link>
        </div>
      </PageHeaderExtra>

      <ModuleManagerSettings settings={settings} setSettings={handleUpdateSettings} />
    </div>
  );
}
