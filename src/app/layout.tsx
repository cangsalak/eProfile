import './globals.css';
import React from 'react';
import DashboardShell from '../components/DashboardShell';

export const metadata = {
  title: 'ระบบ eProfile บุคลากร - Electronic Personnel Profile System',
  description: 'ระบบบริการจัดการโปรไฟล์บุคลากรและทำเนียบบุคลากรอิเล็กทรอนิกส์ส่วนกลาง',
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
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
