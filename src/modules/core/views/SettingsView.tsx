'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ModuleRegistry } from '@/modules/core/registry';

export default function SettingsView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams ? searchParams.get('tab') : null;

  React.useEffect(() => {
    if (tab) {
      const legacyRoute = ModuleRegistry.resolveSettingsTab(tab);
      if (legacyRoute) {
        router.replace(legacyRoute);
      }
    }
  }, [tab, router]);

  const settingsCards = ModuleRegistry.getSettingsCards();

  return (
    <div className="space-y-6 pb-16 font-prompt">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
          System Administration
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">ตั้งค่าระบบ</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          เลือกจัดการแต่ละส่วนผ่านโมดูลเจ้าของโดยตรง (Dynamic Module Settings)
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {settingsCards.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-primary-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400">
                <i className={`fa-solid ${item.icon.replace(/^fa-solid\s+/, '')}`} />
              </span>
              <span>
                <span className="block font-semibold text-slate-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                  {item.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400 line-clamp-2">
                  {item.description}
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
