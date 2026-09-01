import './globals.css';
import React from 'react';
import ToastProvider from '../components/ToastProvider';
import { Metadata } from 'next';
/*
 * ============================================================
 * ⚠️  DEVELOPER CREDIT IMPORT — DO NOT REMOVE ⚠️
 * ============================================================
 */
import DeveloperCreditFooter from '@/components/DeveloperCreditFooter';

export const metadata: Metadata = {
  title: 'ระบบฐานข้อมูลบุคลากร',
  description: 'ระบบจัดการฐานข้อมูลและสารสนเทศบุคลากร',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <ToastProvider />
        <div className="flex-1">{children}</div>
        {/* ============================================================
            ⚠️  DEVELOPER CREDIT FOOTER — DO NOT REMOVE OR MODIFY ⚠️
            ผู้พัฒนา: นายเยาวรัตน์ ช่างสลัก | 089-016-7912
            การลบส่วนนี้จะทำให้ระบบตรวจสอบความสมบูรณ์ล้มเหลว
            ============================================================ */}
        <DeveloperCreditFooter />
      </body>
    </html>
  );
}
