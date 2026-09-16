'use client';

import React from 'react';
import { Input, Select, Checkbox } from '@/components/ui';

interface ClassicBadgeSettingsProps {
  settings: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function ClassicBadgeSettings({ settings, handleChange }: ClassicBadgeSettingsProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <Input
        id="badgeHeaderTitle"
        type="text"
        name="badgeHeaderTitle"
        label="ข้อความหัวบัตร (Header Title)"
        placeholder="บัตรประจำตัวข้าราชการ"
        value={settings.badgeHeaderTitle ?? 'บัตรประจำตัวข้าราชการ'}
        onChange={handleChange}
      />

      <Select
        id="badgeColorModeSelect"
        name="badgeColorMode"
        label="รูปแบบสีของบัตร (Color Mode)"
        value={settings.badgeColorMode || 'auto'}
        onChange={handleChange}
      >
        <option value="auto">เปลี่ยนสีตามชั้นยศ/ประเภท (Auto)</option>
        <option value="custom">ใช้สีเดียวทั้งองค์กร (Custom Color)</option>
      </Select>

      {settings.badgeColorMode === 'custom' && (
        <div className="animate-fade-in flex flex-col gap-2">
          <span className="block text-slate-500 dark:text-slate-400 text-sm">เลือกสีหลัก (Primary Color)</span>
          <div className="flex items-center space-x-3">
            <Input
              id="badgeCustomColor"
              type="color"
              name="badgeCustomColor"
              value={settings.badgeCustomColor || '#4f46e5'}
              onChange={handleChange}
              className="p-0.5 h-10 w-16 cursor-pointer"
            />
            <span className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded">
              {settings.badgeCustomColor || '#4f46e5'}
            </span>
          </div>
        </div>
      )}

      <div className="pt-2 space-y-3">
        <span className="block text-slate-500 dark:text-slate-400 text-sm mb-2">ข้อมูลที่ต้องการแสดง</span>
        <Checkbox
          name="badgeShowBloodType"
          label="แสดงกรุ๊ปเลือด"
          checked={settings.badgeShowBloodType !== 'false'}
          onChange={handleChange}
          id="badgeShowBloodType"
        />
      </div>

      {/* Back Side Settings Section */}
      <div className="pt-4 space-y-3 border-t border-slate-200 dark:border-slate-700">
        <span className="block text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
          ข้อมูลด้านหลังบัตร (Back Side Information)
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            id="organizationName"
            type="text"
            name="organizationName"
            label="ชื่อหน่วยงาน / ต้นสังกัด"
            placeholder="กองทัพบก / กระทรวงกลาโหม"
            value={settings.organizationName ?? ''}
            onChange={handleChange}
          />
          <Input
            id="organizationPhone"
            type="text"
            name="organizationPhone"
            label="เบอร์โทรศัพท์หน่วยงาน"
            placeholder="02-297-7000"
            value={settings.organizationPhone ?? ''}
            onChange={handleChange}
          />
        </div>
        <Input
          id="organizationAddress"
          type="text"
          name="organizationAddress"
          label="ที่อยู่หน่วยงานสำหรับส่งคืน"
          placeholder="ถนนราชดำเนินนอก แขวงบางขุนพรหม เขตพระนคร กรุงเทพฯ 10200"
          value={settings.organizationAddress ?? ''}
          onChange={handleChange}
        />
        <div className="space-y-1">
          <label htmlFor="cardTermsConditions" className="block text-xs text-slate-600 dark:text-slate-400 font-medium">
            ข้อกำหนดและระเบียบการใช้บัตร
          </label>
          <textarea
            id="cardTermsConditions"
            name="cardTermsConditions"
            rows={3}
            placeholder="1. บัตรนี้เป็นทรัพย์สินของทางราชการ ห้ามโอนให้ผู้อื่นนำไปใช้&#10;2. กรณีบัตรสูญหายหรือชำรุด ให้รีบแจ้งหน่วยงานต้นสังกัดทันที&#10;3. หากเก็บได้กรุณาส่งคืนตามที่อยู่ด้านบน"
            value={settings.cardTermsConditions ?? ''}
            onChange={handleChange as any}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 resize-none shadow-xs"
          />
        </div>
      </div>

      <div className="pt-4 space-y-3 border-t border-slate-200 dark:border-slate-700">
        <span className="block text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">
          สีประจำกลุ่มกำลังพล (Auto Mode)
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 block">นายทหารสัญญาบัตร</span>
            <div className="flex items-center space-x-2">
              <Input
                id="colorCommissioned"
                type="color"
                name="colorCommissioned"
                value={settings.colorCommissioned || '#dc2626'}
                onChange={handleChange}
                className="p-0.5 h-10 w-16 cursor-pointer"
              />
              <span className="text-xs font-mono">{settings.colorCommissioned || '#dc2626'}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 block">นายทหารประทวน/ลูกจ้าง</span>
            <div className="flex items-center space-x-2">
              <Input
                id="colorNonCommissioned"
                type="color"
                name="colorNonCommissioned"
                value={settings.colorNonCommissioned || '#d97706'}
                onChange={handleChange}
                className="p-0.5 h-10 w-16 cursor-pointer"
              />
              <span className="text-xs font-mono">{settings.colorNonCommissioned || '#d97706'}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 block">ทหารกองประจำการ</span>
            <div className="flex items-center space-x-2">
              <Input
                id="colorConscript"
                type="color"
                name="colorConscript"
                value={settings.colorConscript || '#16a34a'}
                onChange={handleChange}
                className="p-0.5 h-10 w-16 cursor-pointer"
              />
              <span className="text-xs font-mono">{settings.colorConscript || '#16a34a'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
