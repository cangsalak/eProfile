import './globals.css';
import React from 'react';
import ToastProvider from '../components/ToastProvider';
import { Metadata } from 'next';

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
      <body>
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
