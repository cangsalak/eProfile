'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Personnel } from '../../../types/personnel';
import IDBadge from '../../../components/badges/IDBadge';

export default function BadgePrintPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Personnel | null>(null);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      router.push('/login');
    }

    fetch('/api/settings', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSettings(data);
        }
      })
      .catch(console.error);
  }, [router]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 print:bg-white text-slate-800 dark:text-slate-200">
      
      {/* Non-printable Screen Controls */}
      <div className="print:hidden max-w-4xl mx-auto pt-10 pb-6 px-4">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl mb-8 shadow-lg">
          <div>
            <h2 className="text-xl font-bold text-white mb-1"><i className="fa-solid fa-id-badge mr-2 text-primary-400"></i> พิมพ์บัตรประจำตัว</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">เลือกพิมพ์บัตรที่คุณต้องการ กรุณาตั้งค่ากระดาษเป็นขนาด A4 (No Margins)</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => router.back()}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              กลับ
            </button>
            <button 
              onClick={() => window.print()}
              className="px-5 py-2 bg-primary-500 hover:bg-primary-600 shadow-[0_0_15px_rgba(99,102,241,0.4)] rounded-lg text-white text-sm font-medium transition-colors flex items-center"
            >
              <i className="fa-solid fa-print mr-2"></i> สั่งพิมพ์ (Print)
            </button>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-sm text-amber-400">
          <i className="fa-solid fa-circle-info mt-0.5"></i>
          <div>
            <p className="font-semibold mb-1">คำแนะนำก่อนพิมพ์:</p>
            <ul className="list-disc list-inside space-y-1 ml-1 opacity-90">
              <li>ใช้กระดาษ Photo หรือกระดาษการ์ดแบบแข็ง เพื่อความสวยงาม</li>
              <li>ตั้งค่า Print Scale เป็น 100% หรือ Actual Size เสมอ เพื่อให้ขนาดบัตรคงที่ (5.4 x 8.6 ซม.)</li>
              <li>เปิดใช้งานออปชัน "Print Background Graphics" ในหน้าตั้งค่าเครื่องพิมพ์</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Printable Area - Only this will show properly in print mode */}
      <div className="max-w-4xl mx-auto px-4 pb-20 print:p-0 print:m-0">
        <div className="flex flex-wrap gap-8 print:gap-4 justify-center print:justify-start">
          
          {/* Section: ID Badge */}
          <div className="flex flex-col items-center">
            <h3 className="print:hidden text-slate-500 dark:text-slate-400 text-sm mb-3">บัตรประจำตัวเจ้าหน้าที่</h3>
            
            {/* The Badge with cut lines for print */}
            <div className="relative p-4 border border-dashed border-slate-200 dark:border-slate-700 print:border-slate-300 print:p-0">
              {/* Cut marks (only visible in print or subtle on screen) */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-slate-400 -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-slate-400 translate-x-1 -translate-y-1"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-slate-400 -translate-x-1 translate-y-1"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-slate-400 translate-x-1 translate-y-1"></div>
              
              <IDBadge personnel={currentUser} settings={settings} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
