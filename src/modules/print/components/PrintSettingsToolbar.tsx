'use client';

import React from 'react';
import { Card, CardHeader, Select } from '@/components/ui';
import { PaperSettings } from '../types';

interface PrintSettingsToolbarProps {
  paperSettings: PaperSettings;
  setPaperSettings: React.Dispatch<React.SetStateAction<PaperSettings>>;
  personnelList: any[];
  selectedPersonnelId: string;
  setSelectedPersonnelId: (id: string) => void;
  showGarudaControl?: boolean;
}

export default function PrintSettingsToolbar({
  paperSettings,
  setPaperSettings,
  personnelList,
  selectedPersonnelId,
  setSelectedPersonnelId,
  showGarudaControl = true,
}: PrintSettingsToolbarProps) {
  return (
    <Card variant="convex" padding="md" className="space-y-4 no-print">
      <CardHeader
        title="ตั้งค่าหน้ากระดาษและตัวเลือกการพิมพ์ (Print & Paper Settings)"
        subtitle="กำหนดขนาดกระดาษ ระยะขอบ ทิศทาง ตราครุฑ และลายน้ำ"
        icon="fa-solid fa-sliders"
        iconGradient="from-primary-500 to-indigo-600"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Page Size */}
        <Select
          label="ขนาดกระดาษ (Page Size)"
          value={paperSettings.pageSize}
          onChange={(e) =>
            setPaperSettings((prev) => ({ ...prev, pageSize: e.target.value as any }))
          }
          options={[
            { value: 'A4', label: 'A4 (210 x 297 มม.) — มาตรฐานราชการ' },
            { value: 'Letter', label: 'Letter (8.5 x 11 นิ้ว)' },
            { value: 'CR80', label: 'CR-80 (85.6 x 54 มม.) — ขนาดบัตร' },
          ]}
        />

        {/* Orientation */}
        <Select
          label="ทิศทางหน้ากระดาษ (Orientation)"
          value={paperSettings.orientation}
          onChange={(e) =>
            setPaperSettings((prev) => ({ ...prev, orientation: e.target.value as any }))
          }
          options={[
            { value: 'portrait', label: 'แนวตั้ง (Portrait)' },
            { value: 'landscape', label: 'แนวนอน (Landscape)' },
          ]}
        />

        {/* Margin */}
        <Select
          label="ระยะขอบกระดาษ (Margins)"
          value={paperSettings.margin}
          onChange={(e) =>
            setPaperSettings((prev) => ({ ...prev, margin: e.target.value }))
          }
          options={[
            { value: '5mm', label: 'แคบ (5 มม.)' },
            { value: '10mm', label: 'ปกติราชการ (10 มม.)' },
            { value: '15mm', label: 'มาตรฐานสมบูรณ์ (15 มม.)' },
            { value: '20mm', label: 'กว้าง (20 มม.)' },
            { value: '0mm', label: 'ไร้ขอบ (0 มม. - สำหรับพิมพ์บัตร)' },
          ]}
        />

        {/* Watermark */}
        <Select
          label="ลายน้ำเอกสาร (Watermark)"
          value={paperSettings.watermark}
          onChange={(e) =>
            setPaperSettings((prev) => ({ ...prev, watermark: e.target.value as any }))
          }
          options={[
            { value: 'none', label: 'ไม่มีลายน้ำ' },
            { value: 'original', label: 'ต้นฉบับ (ORIGINAL)' },
            { value: 'copy', label: 'สำเนาถูกต้อง (CERTIFIED COPY)' },
            { value: 'confidential', label: 'ลับที่สุด (TOP SECRET)' },
          ]}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-4">
          {showGarudaControl && (
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={paperSettings.showGaruda}
                onChange={(e) =>
                  setPaperSettings((prev) => ({ ...prev, showGaruda: e.target.checked }))
                }
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span>แสดงตราครุฑราชการ</span>
            </label>
          )}

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={paperSettings.showSignature}
              onChange={(e) =>
                setPaperSettings((prev) => ({ ...prev, showSignature: e.target.checked }))
              }
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <span>แสดงช่องลงนามผู้บังคับบัญชา</span>
          </label>
        </div>

        {personnelList.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500">เลือกกำลังพลตัวอย่าง:</span>
            <select
              value={selectedPersonnelId}
              onChange={(e) => setSelectedPersonnelId(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              {personnelList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.rank || p.prefix || ''} {p.firstName} {p.lastName} ({p.badgeNo || p.id})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </Card>
  );
}
