import React from 'react';
import DashboardShell from '@/components/DashboardShell';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
