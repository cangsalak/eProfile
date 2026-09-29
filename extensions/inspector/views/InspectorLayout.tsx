'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';

interface TabItem {
  id: string;
  name: string;
  icon: string;
  path: string;
}

const TABS: TabItem[] = [
  { id: 'health', name: 'ภาพรวมสถานะ (Health)', icon: 'fa-solid fa-heart-pulse', path: '/modules/inspector' },
  { id: 'checklist', name: 'ความพร้อมระบบ (Checklist)', icon: 'fa-solid fa-clipboard-check', path: '/modules/inspector/checklist' },
  { id: 'performance', name: 'ประสิทธิภาพ (Performance)', icon: 'fa-solid fa-chart-line', path: '/modules/inspector/performance' },
  { id: 'routes', name: 'แผนผัง API (Route Map)', icon: 'fa-solid fa-network-wired', path: '/modules/inspector/routes' },
  { id: 'modules', name: 'สถานะโมดูล (Modules)', icon: 'fa-solid fa-cubes', path: '/modules/inspector/modules' },
  { id: 'audit-logs', name: 'บันทึกการใช้งาน (Audit Logs)', icon: 'fa-solid fa-clock-rotate-left', path: '/modules/inspector/audit-logs' },
  { id: 'security', name: 'ความปลอดภัย (Security)', icon: 'fa-solid fa-shield-halved', path: '/modules/inspector/security' },
  { id: 'scan', name: 'ตรวจประเมินระบบ (Scan)', icon: 'fa-solid fa-magnifying-glass-chart', path: '/modules/inspector/scan' },
  { id: 'categories', name: 'ข้อมูลพื้นฐาน (Categories)', icon: 'fa-solid fa-list-check', path: '/modules/inspector/categories' },
  { id: 'database', name: 'ฐานข้อมูล (Database)', icon: 'fa-solid fa-database', path: '/modules/inspector/database' },
  { id: 'environment', name: 'สภาพแวดล้อม (Environment)', icon: 'fa-solid fa-server', path: '/modules/inspector/environment' },
  { id: 'errors', name: 'บันทึกข้อผิดพลาด (Errors)', icon: 'fa-solid fa-triangle-exclamation', path: '/modules/inspector/errors' },
];

interface InspectorLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  title: string;
  description: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function InspectorLayout({
  children,
  activeTab,
  title,
  description,
  onRefresh,
  isRefreshing = false,
}: InspectorLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-6 animate-fade-in pb-16 font-prompt">
      <PageHeaderExtra>
        <div className="flex items-center gap-2 p-1 bg-white/60 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
          <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-600 text-white shadow-sm shadow-primary-500/30 flex items-center gap-2">
            <i className="fa-solid fa-gauge-high text-xs"></i>
            <span>Runtime Inspector</span>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              title="รีเฟรชข้อมูล"
            >
              <i className={`fa-solid fa-rotate ${isRefreshing ? 'animate-spin' : ''}`}></i>
              <span className="hidden sm:inline">รีเฟรช</span>
            </button>
          )}
        </div>
      </PageHeaderExtra>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 text-xs font-semibold border border-primary-100 dark:border-primary-900/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Runtime Diagnostic Engine
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/modules/inspector/scan"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-500 text-white shadow-sm shadow-primary-500/25 transition-all"
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              <span>ตรวจประเมินระบบ (Scanner UI)</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab || pathname === tab.path;
            return (
              <Link
                key={tab.id}
                href={tab.path}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/25 ring-1 ring-primary-500'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <i className={`${tab.icon} ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}></i>
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div>{children}</div>
    </div>
  );
}
