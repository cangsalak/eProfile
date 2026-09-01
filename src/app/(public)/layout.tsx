import React from 'react';
import Link from 'next/link';
import { verifyAuth } from '@/lib/auth';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await verifyAuth();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
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
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                  eP
                </div>
                <span className="font-bold text-xl tracking-tight text-white">
                  eProfile
                </span>
              </Link>
              <p className="text-sm text-slate-500 max-w-sm">
                ระบบสารสนเทศเพื่อการบริหารจัดการบุคลากร ทันสมัย ปลอดภัย และมีประสิทธิภาพสูง
              </p>
              <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                <div>
                  <i className="fa-solid fa-phone w-4 text-slate-500"></i>
                  <a href="tel:021234567" className="hover:text-white transition-colors">02-123-4567</a>
                </div>
                <div>
                  <i className="fa-solid fa-envelope w-4 text-slate-500"></i>
                  <a href="mailto:contact@eprofile.com" className="hover:text-white transition-colors">contact@eprofile.com</a>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">ลิงก์ด่วน</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">เกี่ยวกับเรา</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">บริการ</Link></li>
                <li><Link href="/news" className="hover:text-white transition-colors">ข่าวสารประชาสัมพันธ์</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">ติดต่อเรา</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">สำหรับสมาชิก</h3>
              <ul className="space-y-2 text-sm">
                {user ? (
                  <>
                    <li><Link href="/dashboard" className="hover:text-white transition-colors">แดชบอร์ดหลัก</Link></li>
                    <li><Link href="/directory" className="hover:text-white transition-colors">ทำเนียบบุคลากร</Link></li>
                    <li><Link href="/profile" className="hover:text-white transition-colors">ข้อมูลส่วนตัว</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link href="/login" className="hover:text-white transition-colors">เข้าสู่ระบบ</Link></li>
                    <li><Link href="/register" className="hover:text-white transition-colors">ลงทะเบียน</Link></li>
                    <li><Link href="/forgot-password" className="hover:text-white transition-colors">ลืมรหัสผ่าน</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-slate-500 text-center">
            &copy; {new Date().getFullYear()} eProfile System. สงวนลิขสิทธิ์ทุกประการ.
          </div>
        </div>
      </footer>
    </div>
  );
}
