'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ModuleManifest } from '@/lib/modules/types';
import { ModuleViewRegistry } from '@/lib/modules/view-registry';

interface DynamicModuleHostProps {
  moduleId: string;
  slug?: string[];
}

export default function DynamicModuleHost({ moduleId, slug = [] }: DynamicModuleHostProps) {
  const [modules, setModules] = useState<ModuleManifest[]>([]);
  const [enabledModuleIds, setEnabledModuleIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadModuleStatus() {
      try {
        const [modData, setData] = await Promise.all([
          fetch('/api/modules').then((r) => r.json()),
          fetch('/api/settings').then((r) => r.json()),
        ]);
        if (modData.modules) {
          setModules(modData.modules);
        }
        if (setData.enabledModules) {
          try {
            const parsed = JSON.parse(setData.enabledModules);
            if (Array.isArray(parsed)) setEnabledModuleIds(parsed);
          } catch {
            // default fallback
          }
        }
      } catch (err) {
        console.error('Failed to load module info:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadModuleStatus();
  }, [moduleId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 font-prompt">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        <p className="text-sm text-slate-500 dark:text-slate-400">กำลังโหลดโมดูล {moduleId}...</p>
      </div>
    );
  }

  const currentModule = modules.find((m) => m.id === moduleId);

  // 1. Module not found
  if (!currentModule) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm font-prompt">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500 text-2xl">
          <i className="fa-solid fa-box-open"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          ไม่พบโมดูลที่ระบุในระบบ
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          โมดูลรหัส <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-rose-500">{moduleId}</code> ยังไม่ได้ถูกติดตั้งหรือไม่มีอยู่ในระบบ
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors"
          >
            กลับหน้าหลัก
          </Link>
          <Link
            href="/modules/module-manager"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            ติดตั้งโมดูลใหม่
          </Link>
        </div>
      </div>
    );
  }

  // 2. Module is disabled
  const isEnabled = currentModule.isCore || enabledModuleIds.length === 0 || enabledModuleIds.includes(moduleId);
  if (!isEnabled) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/40 text-center shadow-sm font-prompt">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 text-2xl">
          <i className="fa-solid fa-toggle-off"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          โมดูล "{currentModule.name}" ถูกปิดใช้งาน
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          ผู้ดูแลระบบได้ปิดใช้งานโมดูลนี้ไว้ในระบบ หากต้องการเปิดใช้งาน กรุณาไปที่เมนูการจัดการโมดูล
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors"
          >
            กลับหน้าหลัก
          </Link>
          <Link
            href="/modules/module-manager"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            ไปที่การจัดการโมดูล
          </Link>
        </div>
      </div>
    );
  }

  // 3. Render Real Module View dynamically from Module Registry (NO hardcoded switch-case)
  const modDef = ModuleViewRegistry.get(moduleId);
  if (!modDef) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm font-prompt">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          ไม่พบการลงทะเบียน View ของโมดูล {currentModule.name}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          โมดูลนี้ยังไม่ได้ทำการลงทะเบียน Component View ในระบบ
        </p>
      </div>
    );
  }

  // Lookup view component by full slug or primary subpath
  const subPath = slug.join('/');
  const firstSlug = slug[0] || '';
  const ViewComponent = modDef.views[subPath] || modDef.views[firstSlug] || modDef.views[''];

  if (!ViewComponent) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm font-prompt">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          ไม่พบหน้าที่ร้องขอในโมดูล {currentModule.name}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
          ไม่พบเส้นทาง <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-primary-600">{subPath || '/'}</code> ในโมดูลนี้
        </p>
        <Link
          href={`/modules/${moduleId}`}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors inline-block"
        >
          กลับหน้าหลักของโมดูล
        </Link>
      </div>
    );
  }

  return <ViewComponent />;
}
