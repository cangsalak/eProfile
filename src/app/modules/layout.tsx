import React from 'react';
import DashboardShell from '@/components/DashboardShell';

export default function ModulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
