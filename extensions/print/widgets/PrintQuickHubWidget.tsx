'use client';

import React, { useState } from 'react';
import { Card, CardHeader, Badge, Button } from '@/components/ui';
import { Printer, FileText, Shield, FileCheck, Sliders } from 'lucide-react';
import Link from 'next/link';

type PrintWidgetTab = 'shortcuts' | 'templates' | 'status';

export default function PrintQuickHubWidget() {
  const [activeTab, setActiveTab] = useState<PrintWidgetTab>('shortcuts');

  return (
    <Card variant="convex" className="h-full flex flex-col min-h-[360px] font-prompt">
      <CardHeader
        title="ศูนย์พิมพ์เอกสารและบัตร"
        subtitle="ทางลัดสั่งพิมพ์เอกสารราชการและบัตรประจำตัว"
        icon={<Printer className="w-5 h-5 text-white" />}
        iconGradient="from-amber-500 to-primary-600"
        action={
          <Link href="/modules/print">
            <Button type="button" variant="secondary" size="xs" icon="fa-solid fa-arrow-right">
              เปิดศูนย์พิมพ์
            </Button>
          </Link>
        }
      />

      <div className="flex-1 flex flex-col p-4 pt-2 space-y-3">
        {/* ── Segmented Tab Selector ── */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('shortcuts')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
              activeTab === 'shortcuts'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-bolt text-[11px]"></i>
            <span>พิมพ์ด่วน</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
              activeTab === 'templates'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-file-lines text-[11px]"></i>
            <span>แบบฟอร์มยอดนิยม</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
              activeTab === 'status'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-circle-check text-[11px]"></i>
            <span>สถานะระบบ</span>
          </button>
        </div>

        {/* ── Tab Content ── */}
        <div className="flex-1 flex flex-col justify-between space-y-3">
          {/* ════════ TAB 1: SHORTCUTS ════════ */}
          {activeTab === 'shortcuts' && (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/modules/e-form"
                className="p-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xs transition-all group flex flex-col justify-between text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <i className="fa-solid fa-file-signature text-sm"></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    พิมพ์ใบลา
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">ใบลาพักผ่อน / ป่วย / กิจ</p>
                </div>
              </Link>

              <Link
                href="/modules/badges"
                className="p-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xs transition-all group flex flex-col justify-between text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <i className="fa-solid fa-id-card text-sm"></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    พิมพ์บัตรประจำตัว
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">บัตร CR80 หน้า-หลัง</p>
                </div>
              </Link>

              <Link
                href="/modules/users/rpb1"
                className="p-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xs transition-all group flex flex-col justify-between text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <i className="fa-solid fa-shield-halved text-sm"></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    ประวัติ รปภ. ๑
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">แบบฟอร์ม ทบ. 100-009</p>
                </div>
              </Link>

              <Link
                href="/modules/users"
                className="p-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xs transition-all group flex flex-col justify-between text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <i className="fa-solid fa-users text-sm"></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    ทำเนียบบุคลากร
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">บัญชีรายชื่อกำลังพล</p>
                </div>
              </Link>
            </div>
          )}

          {/* ════════ TAB 2: TEMPLATES ════════ */}
          {activeTab === 'templates' && (
            <div className="space-y-1.5">
              {[
                { title: 'ใบลาพักผ่อนประจำปี', size: 'A4 แนวตั้ง', form: 'แบบ ๑', url: '/modules/e-form', color: 'text-primary-500' },
                { title: 'ใบลาป่วย / ลาคลอด', size: 'A4 แนวตั้ง', form: 'แบบ ๒', url: '/modules/e-form', color: 'text-primary-500' },
                { title: 'บัตรประจำตัวบุคคล', size: 'CR80 หน้า-หลัง', form: 'ISO-ID', url: '/modules/badges', color: 'text-violet-500' },
                { title: 'ตารางเวรยามประจำเดือน', size: 'A4 แนวนอน', form: 'วร. ๑๐', url: '/modules/calendar', color: 'text-sky-500' },
              ].map((tmpl, idx) => (
                <Link
                  key={idx}
                  href={tmpl.url}
                  className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 transition-all text-xs group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <i className={`fa-regular fa-file-lines ${tmpl.color}`}></i>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600 transition-colors">
                      {tmpl.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-[10px] text-slate-400">{tmpl.size}</span>
                    <i className="fa-solid fa-chevron-right text-[9px] text-slate-300 dark:text-slate-600"></i>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* ════════ TAB 3: STATUS ════════ */}
          {activeTab === 'status' && (
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    ฟอนต์ TH Sarabun New
                  </span>
                  <Badge variant="success" size="xs">พร้อมใช้งาน</Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-emerald-100/60 dark:border-emerald-900/30">
                  <span>มาตรฐานกระดาษ:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">A4 (210 × 297 mm)</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>โหมดพิมพ์พื้นหลัง:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">White Background 100%</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-primary-500 text-xs"></i>
                <span>แนะนำเลือก Margins = None หรือ Default เมื่อพิมพ์บัตร CR80</span>
              </div>
            </div>
          )}

          {/* ── Bottom Action Links ── */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <Link href="/modules/print" className="block w-full">
              <Button
                type="button"
                variant="primary"
                size="xs"
                className="w-full justify-center"
                icon="fa-solid fa-print"
              >
                ศูนย์รวมการพิมพ์
              </Button>
            </Link>
            <Link href="/modules/print/settings" className="block w-full">
              <Button
                type="button"
                variant="outline"
                size="xs"
                className="w-full justify-center"
                icon="fa-solid fa-sliders"
              >
                ตั้งค่ากระดาษ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
