import React from 'react';
import { Metadata } from 'next';
import '@/modules/print/styles/print.css';

export const metadata: Metadata = {
  title: 'พิมพ์เอกสารราชการ | eProfile',
  description: 'ศูนย์รวมการพิมพ์แบบฟอร์มเอกสารราชการ',
};

export default function PrintRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="print-layout-root min-h-screen bg-slate-200 print:bg-white text-black">
      {children}
    </div>
  );
}
