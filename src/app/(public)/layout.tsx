import React from 'react';
import Link from 'next/link';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
                ระบบจัดการฐานข้อมูลและสารสนเทศบุคลากรยุคใหม่ ที่ออกแบบมาเพื่อความง่ายและมีประสิทธิภาพสูงสุด
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">เมนูลัด</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-primary-400 transition-colors">เกี่ยวกับองค์กร</Link></li>
                <li><Link href="/services" className="hover:text-primary-400 transition-colors">บริการของเรา</Link></li>
                <li><Link href="/news" className="hover:text-primary-400 transition-colors">ข่าวสารและบทความ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">ติดต่อเรา</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <i className="fa-solid fa-location-dot mt-1 w-4 text-center"></i>
                  <span>ศูนย์ราชการเฉลิมพระเกียรติฯ</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-phone w-4 text-center"></i>
                  <span>02-123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-envelope w-4 text-center"></i>
                  <span>contact@eprofile.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-sm text-center">
            &copy; {new Date().getFullYear()} eProfile System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
