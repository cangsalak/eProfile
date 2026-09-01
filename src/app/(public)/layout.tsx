import React from 'react';
import Link from 'next/link';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await verifyAuth();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  // Check Maintenance Mode from database
  let isMaintenance = false;
  try {
    const maintenanceSetting = await prisma.systemSetting.findUnique({
      where: { key: 'maintenanceMode' }
    });
    isMaintenance = maintenanceSetting?.value === 'true';
  } catch {
    // Fallback if database is not reachable
  }

  // Get current path from headers
  const headersList = headers();
  const pathname = headersList.get('x-invoke-path') || '';

  // If maintenance is on and user is not an admin, and not on /maintenance or /login, redirect
  if (isMaintenance && !isAdmin && pathname !== '/maintenance' && pathname !== '/login') {
    redirect('/maintenance');
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-prompt">
      {/* Maintenance Mode Warning for Admins */}
      {isMaintenance && isAdmin && (
        <div className="bg-amber-600 text-white text-xs px-4 py-2 text-center font-semibold flex items-center justify-center gap-2 shadow-sm z-50">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>⚠️ ระบบกำลังอยู่ในโหมดปิดปรับปรุงเว็บไซต์ (คุณกำลังเข้าชมในฐานะผู้ดูแลระบบ)</span>
          <Link href="/settings" className="underline font-bold ml-2 hover:text-amber-100">
            ไปที่หน้าตั้งค่าเพื่อปิดโหมดปรับปรุง &rarr;
          </Link>
        </div>
      )}

      {/* Public Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                  eP
                </div>
                <span className="font-bold text-xl tracking-tight text-primary-600 dark:text-primary-400">
                  eProfile
                </span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium hover:text-primary-600 transition-colors">หน้าแรก</Link>
              <Link href="/about" className="text-sm font-medium hover:text-primary-600 transition-colors">เกี่ยวกับเรา</Link>
              <Link href="/services" className="text-sm font-medium hover:text-primary-600 transition-colors">บริการ</Link>
              <Link href="/news" className="text-sm font-medium hover:text-primary-600 transition-colors">ข่าวสาร</Link>
              <Link href="/contact" className="text-sm font-medium hover:text-primary-600 transition-colors">ติดต่อเรา</Link>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <Link 
                  href="/dashboard" 
                  className="text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                >
                  <i className="fa-solid fa-gauge text-xs"></i>
                  <span>ไปยังระบบจัดการ</span>
                </Link>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link 
                    href="/register" 
                    className="hidden md:flex text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-colors"
                  >
                    สมัครสมาชิก
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Public Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  eP
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white">eProfile</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                ระบบทำเนียบบุคลากรและโปรไฟล์อิเล็กทรอนิกส์
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">บริการ</h3>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link href="/services" className="hover:text-primary-600">ค้นหาบุคลากร</Link></li>
                <li><Link href="/services" className="hover:text-primary-600">พิมพ์บัตรประจำตัว</Link></li>
                <li><Link href="/services" className="hover:text-primary-600">ยื่นคำร้องขอลา</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">ลิงก์ด่วน</h3>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link href="/news" className="hover:text-primary-600">ข่าวประชาสัมพันธ์</Link></li>
                <li><Link href="/about" className="hover:text-primary-600">เกี่ยวกับองค์กร</Link></li>
                <li><Link href="/contact" className="hover:text-primary-600">ติดต่อสอบถาม</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">ความปลอดภัย</h3>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link href="/verify/check" className="hover:text-primary-600">ตรวจสอบความถูกต้องบัตร (QR Verify)</Link></li>
                <li><Link href="/api-documentation" className="hover:text-primary-600">คู่มือ API สำหรับนักพัฒนา</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <p>© {new Date().getFullYear()} eProfile System. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/about" className="hover:text-primary-600">ข้อกำหนดการใช้งาน</Link>
              <Link href="/about" className="hover:text-primary-600">นโยบายความเป็นส่วนตัว</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
