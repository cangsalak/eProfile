'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Personnel } from '@/types/personnel';
import IDBadge from '../components/IDBadge';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';
import { Button, Badge, Card } from '@/components/ui';

export default function MyBadgesView() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Personnel | null>(null);
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      router.push('/login');
    }

    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setSettings(data);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [router]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary-500 mb-3"></i>
          <p className="text-xs text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูลบัตรประจำตัว...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-prompt">
      {/* Submenu Slots in Universal Header */}
      <PageHeaderExtra>
        <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
          <Link
            href="/modules/badges"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60"
          >
            <i className="fa-solid fa-print text-xs text-slate-400"></i>
            <span>พิมพ์บัตรประจำตัว</span>
          </Link>
          <Link
            href="/modules/badges/settings"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60"
          >
            <i className="fa-solid fa-palette text-xs text-slate-400"></i>
            <span>สตูดิโอออกแบบบัตร</span>
          </Link>
          <Link
            href="/modules/badges/my"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 bg-primary-600 text-white shadow-sm shadow-primary-500/30"
          >
            <i className="fa-solid fa-address-card text-xs"></i>
            <span>บัตรของฉัน</span>
          </Link>
        </div>
      </PageHeaderExtra>

      <style dangerouslySetInnerHTML={{
        __html: `
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
              height: 344px;
              overflow: hidden;
              position: relative;
            }
          }
        `
      }} />

      {/* Control Panel (Hidden on Print) */}
      <Card className="print:hidden">
        <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                บัตรประจำตัวเจ้าหน้าที่ของคุณ
              </h3>
              <Badge variant="primary" size="sm">
                CR80 Standard
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {currentUser.prefix || ''} {currentUser.firstName} {currentUser.lastName} ({currentUser.position || 'เจ้าหน้าที่'})
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon="fa-solid fa-arrow-left"
              onClick={() => router.back()}
            >
              ย้อนกลับ
            </Button>
            <Button
              variant="primary"
              size="md"
              icon="fa-solid fa-print"
              onClick={() => window.print()}
            >
              สั่งพิมพ์บัตร (Print)
            </Button>
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex gap-3 text-xs text-amber-700 dark:text-amber-400">
            <i className="fa-solid fa-circle-info mt-0.5 text-base"></i>
            <div>
              <p className="font-bold mb-0.5">คำแนะนำก่อนพิมพ์:</p>
              <ul className="list-disc list-inside space-y-0.5 opacity-90">
                <li>ใช้กระดาษ Photo หรือกระดาษการ์ดแบบแข็ง เพื่อความสวยงาม</li>
                <li>ตั้งค่า Print Scale เป็น 100% หรือ Actual Size เสมอ (5.4 x 8.6 ซม.)</li>
                <li>เปิดใช้งานตัวเลือก "Print Background Graphics" ในหน้าตั้งค่าเครื่องพิมพ์</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Badge View Area */}
      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 print:bg-white print:border-none print:p-0 flex justify-center">
        <div className="relative p-2 border border-dashed border-slate-300 dark:border-slate-700 print:border-none print:p-0 rounded-2xl bg-white dark:bg-slate-900 shadow-sm print:shadow-none">
          <div className="cr80-card bg-white shadow-sm print:shadow-none rounded-xl overflow-hidden">
            <IDBadge
              personnel={currentUser}
              settings={settings}
              qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${currentUser.id}` : ''}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
