'use client';

import React, { useState } from 'react';
import { Card, CardHeader, Badge, Button, Input } from '@/components/ui';
import { PageHeaderExtra } from '@/modules/core/components/layout/PageHeaderContext';
import Link from 'next/link';
import { Sliders, CheckCircle2, AlertCircle, Printer, FileCheck } from 'lucide-react';
import { PaperSettings } from '../types';

export default function PrintSettingsView() {
  const [settings, setSettings] = useState<PaperSettings>({
    pageSize: 'A4',
    orientation: 'portrait',
    margin: '10mm',
    showGaruda: true,
    watermark: 'none',
    showSignature: true,
    unitName: 'ระบบบริหารงานกำลังพล eProfile',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    localStorage.setItem('eprofile-print-settings', JSON.stringify(settings));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 font-prompt max-w-5xl mx-auto pb-12">
      {/* ── PageHeader Action Button ── */}
      <PageHeaderExtra>
        <div className="flex items-center gap-2">
          <Link href="/modules/print">
            <Button variant="secondary" size="sm" icon="fa-solid fa-arrow-left">
              กลับศูนย์การพิมพ์
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            icon="fa-solid fa-floppy-disk"
            onClick={handleSave}
          >
            บันทึกการตั้งค่า
          </Button>
        </div>
      </PageHeaderExtra>

      {/* ── Status Feedback ── */}
      {savedSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>บันทึกการตั้งค่ากระดาษราชการเรียบร้อยแล้ว</span>
        </div>
      )}

      {/* ── Card 1: Font & System Verification ── */}
      <Card variant="convex" className="p-6">
        <CardHeader
          title="สถานะระบบและฟอนต์สารบรรณ"
          subtitle="การตรวจสอบความพร้อมของการพิมพ์ทางการ"
          icon={<FileCheck className="w-5 h-5 text-white" />}
          iconGradient="from-emerald-400 to-teal-600"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">ฟอนต์มาตรฐาน</span>
              <Badge variant="success" size="xs">พร้อมใช้งาน</Badge>
            </div>
            <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">TH Sarabun New</p>
            <p className="text-[11px] text-slate-500">ติดตั้งไฟล์ Local .ttf ในระบบแล้ว</p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">ความแม่นยำ CSS</span>
              <Badge variant="info" size="xs">100%</Badge>
            </div>
            <p className="text-lg font-black text-sky-700 dark:text-sky-400">Zero Dark Leakage</p>
            <p className="text-[11px] text-slate-500">บังคับพื้นขาว 100% เมื่อพิมพ์</p>
          </div>

          <div className="p-4 rounded-2xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">มาตรฐานกระดาษ</span>
              <Badge variant="candy" size="xs">ISO 216</Badge>
            </div>
            <p className="text-lg font-black text-violet-700 dark:text-violet-400">A4 (210 × 297 mm)</p>
            <p className="text-[11px] text-slate-500">รองรับ CR80 สำหรับบัตรพลาสติก</p>
          </div>
        </div>
      </Card>

      {/* ── Card 2: Paper Settings Form ── */}
      <Card variant="convex" className="p-6">
        <CardHeader
          title="พารามิเตอร์หน้ากระดาษและระยะขอบ"
          subtitle="กำหนดค่าเริ่มต้นสำหรับเครื่องพิมพ์และเอกสารราชการ"
          icon={<Sliders className="w-5 h-5 text-white" />}
          iconGradient="from-primary-500 to-indigo-600"
        />

        <div className="space-y-5 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                ขนาดกระดาษมาตรฐาน (Page Size)
              </label>
              <select
                value={settings.pageSize}
                onChange={(e) => setSettings({ ...settings, pageSize: e.target.value as any })}
                className="form-select text-xs rounded-xl w-full"
              >
                <option value="A4">A4 (210 × 297 mm) — มาตรฐานราชการภาครัฐ</option>
                <option value="Letter">Letter (8.5 × 11 inches)</option>
                <option value="CR80">CR80 (5.4 × 8.6 cm) — มาตรฐานบัตรประจำตัว</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                ทิศทางการวางหน้ากระดาษ (Orientation)
              </label>
              <select
                value={settings.orientation}
                onChange={(e) => setSettings({ ...settings, orientation: e.target.value as any })}
                className="form-select text-xs rounded-xl w-full"
              >
                <option value="portrait">แนวตั้ง (Portrait) — สำหรับหนังสือราชการและใบลา</option>
                <option value="landscape">แนวนอน (Landscape) — สำหรับตารางเวรและทำเนียบ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                ระยะขอบกระดาษ (Margins)
              </label>
              <select
                value={settings.margin}
                onChange={(e) => setSettings({ ...settings, margin: e.target.value })}
                className="form-select text-xs rounded-xl w-full"
              >
                <option value="0mm">ไม่มีระยะขอบ (0mm — สำหรับบัตรประจำตัว)</option>
                <option value="5mm">ระยะขอบแคบ (5mm)</option>
                <option value="10mm">ระยะขอบปานกลาง (10mm)</option>
                <option value="20mm">ระยะขอบมาตรฐานงานสารบรรณ (20mm / 2cm)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                ลายน้ำเอกสาร (Watermark)
              </label>
              <select
                value={settings.watermark}
                onChange={(e) => setSettings({ ...settings, watermark: e.target.value as any })}
                className="form-select text-xs rounded-xl w-full"
              >
                <option value="none">ไม่มีลายน้ำ (ค่าเริ่มต้น)</option>
                <option value="original">ต้นฉบับ (ORIGINAL)</option>
                <option value="copy">สำเนาถูกต้อง (CERTIFIED COPY)</option>
                <option value="confidential">ลับ / ลับเฉพาะ (CONFIDENTIAL)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              ชื่อหน่วยงานหรือองค์กรที่ปรากฏบนหัวกระดาษ
            </label>
            <input
              type="text"
              value={settings.unitName}
              onChange={(e) => setSettings({ ...settings, unitName: e.target.value })}
              placeholder="ระบุชื่อหน่วยงานหรือสังกัด..."
              className="form-input text-xs rounded-xl w-full"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button
              type="button"
              variant="primary"
              icon="fa-solid fa-check"
              onClick={handleSave}
            >
              บันทึกการตั้งค่า
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
