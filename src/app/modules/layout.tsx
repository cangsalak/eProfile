'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import DashboardShell from '@/modules/core/components/DashboardShell';
import DeveloperCreditFooter from '@/modules/core/components/DeveloperCreditFooter';

const STANDALONE_MODULE_PREFIXES = [
  '/modules/auth',
  '/modules/install',
];

export default function ModulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_MODULE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  );

  if (isStandalone) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 font-prompt">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          {children}
        </div>
        <DeveloperCreditFooter />
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}

