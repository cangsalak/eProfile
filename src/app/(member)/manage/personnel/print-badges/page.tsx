'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Personnel } from '@/types/personnel';
import IDBadge from '@/components/badges/IDBadge';
import toast from 'react-hot-toast';

export default function BulkBadgePrintPage() {
  const router = useRouter();
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedIds = sessionStorage.getItem('bulkPrintIds');
    let idsToPrint: string[] = [];
    if (storedIds) {
      try {
        idsToPrint = JSON.parse(storedIds);
      } catch (e) {
        console.error(e);
      }
    }

    if (idsToPrint.length === 0) {
      toast.error('ไม่มีรายชื่อที่เลือกไว้สำหรับพิมพ์');
      router.back();
      return;
    }

    // Fetch settings and personnel
    Promise.all([
      fetch('/api/settings', { cache: 'no-store' }).then(res => res.json()),
      fetch('/api/personnel', { cache: 'no-store' }).then(res => res.json())
    ])
    .then(([settingsData, personnelData]) => {
      if (!settingsData.error) setSettings(settingsData);
      
      if (Array.isArray(personnelData)) {
        // Filter only the selected IDs
        const filtered = personnelData.filter(p => idsToPrint.includes(p.id));
        setPersonnelList(filtered);
      }
    })
    .catch(console.error)
    .finally(() => setIsLoading(false));
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-primary-500 mb-4"></i>
          <p className="text-slate-500 dark:text-slate-400">กำลังเตรียมข้อมูลสำหรับพิมพ์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 print:bg-white text-slate-800 dark:text-slate-200">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white !important;
          }
          .cr80-card {
            width: 5.4cm;
            height: 8.6cm;
            overflow: hidden;
            position: relative;
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
        @media screen {
          .cr80-card {
            width: 216px;
            height: 344px; /* roughly 54x86 ratio */
            overflow: hidden;
            position: relative;
          }
        }
      `}} />
      
      {/* Non-printable Screen Controls */}
      <div className="print:hidden pt-10 pb-6 px-4">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl mb-8 shadow-lg">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              <i className="fa-solid fa-print mr-2 text-primary-500"></i> พิมพ์บัตรแบบกลุ่ม ({personnelList.length} ใบ)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">กรุณาตั้งค่ากระดาษเป็นขนาด A4 (No Margins) และเปิดใช้งาน "Print Background Graphics"</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => router.back()}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700"
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
      </div>

      {/* Printable Area - Only this will show properly in print mode */}
      <div className="px-4 pb-20 print:p-0 print:m-0 print:max-w-none">
        <div className="flex flex-wrap gap-4 print:gap-[5mm] justify-center print:justify-start">
          
          {personnelList.map(person => (
            <div key={person.id} className="flex flex-col items-center print:break-inside-avoid mb-4">
              <h3 className="print:hidden text-slate-500 dark:text-slate-400 text-xs mb-2 text-center w-full truncate">{person.firstName} {person.lastName}</h3>
              
              {/* The Badge with cut lines for print */}
              <div className="relative p-2 border border-dashed border-slate-300 dark:border-slate-700 print:border-none print:p-0">
                {/* Cut marks (only visible in print or subtle on screen) */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-slate-400 -translate-x-1 -translate-y-1 print:-translate-x-[1px] print:-translate-y-[1px]"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-slate-400 translate-x-1 -translate-y-1 print:translate-x-[1px] print:-translate-y-[1px]"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-slate-400 -translate-x-1 translate-y-1 print:-translate-x-[1px] print:translate-y-[1px]"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-slate-400 translate-x-1 translate-y-1 print:translate-x-[1px] print:translate-y-[1px]"></div>
                
                <div className="cr80-card bg-white shadow-sm print:shadow-none ring-1 ring-slate-200/50 print:ring-0">
                  <IDBadge 
                    personnel={person} 
                    settings={settings} 
                    qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${person.id}` : ''}
                  />
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
