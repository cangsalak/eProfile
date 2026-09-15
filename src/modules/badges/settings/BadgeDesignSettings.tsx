'use client';

import React from 'react';
import IDBadge from '../components/IDBadge';
import BadgeCanvasEditor from '../components/BadgeCanvasEditor';
import { Input, Select, Checkbox } from '@/components/ui';

interface BadgeDesignSettingsProps {
  settings: any;
  setSettings: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  previewSide: 'front' | 'back';
  setPreviewSide: (side: 'front' | 'back') => void;
}

export default function BadgeDesignSettings({ settings, setSettings, handleChange, previewSide, setPreviewSide }: BadgeDesignSettingsProps) {
  const parseConfig = (val: any) => {
    if (!val) return undefined;
    if (typeof val === 'object') return val;
    try {
      return JSON.parse(val);
    } catch {
      return undefined;
    }
  };

  return (
    <div className={`space-y-6 animate-fade-in flex flex-col ${settings.badgeTemplate === 'canvas' ? '' : 'xl:flex-row'} gap-8`}>
      <div className="flex-1 space-y-5">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">ออกแบบบัตรประจำตัว</h3>

        <div>
          <label className="block text-slate-500 dark:text-slate-400 text-sm mb-2">รูปแบบบัตร (Template)</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${settings.badgeTemplate === 'classic' || !settings.badgeTemplate ? 'border-primary-500 bg-primary-500/10' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <input type="radio" name="badgeTemplate" value="classic" checked={settings.badgeTemplate === 'classic' || !settings.badgeTemplate} onChange={handleChange} className="sr-only" />
              <i className="fa-solid fa-address-card text-2xl text-slate-700 dark:text-slate-300"></i>
              <span className="text-sm font-medium">คลาสสิค (Classic)</span>
            </label>
            <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${settings.badgeTemplate === 'modern' ? 'border-primary-500 bg-primary-500/10' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <input type="radio" name="badgeTemplate" value="modern" checked={settings.badgeTemplate === 'modern'} onChange={handleChange} className="sr-only" />
              <i className="fa-solid fa-id-card-clip text-2xl text-slate-700 dark:text-slate-300"></i>
              <span className="text-sm font-medium">ทันสมัย (Modern)</span>
            </label>
            <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${settings.badgeTemplate === 'canvas' ? 'border-primary-500 bg-primary-500/10' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <input type="radio" name="badgeTemplate" value="canvas" checked={settings.badgeTemplate === 'canvas'} onChange={handleChange} className="sr-only" />
              <i className="fa-solid fa-pen-ruler text-2xl text-slate-700 dark:text-slate-300"></i>
              <span className="text-sm font-medium">ออกแบบอิสระ (Canva Style)</span>
            </label>
          </div>
        </div>

        {settings.badgeTemplate !== 'canvas' && (
          <>
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
                  <Input id="badgeCustomColor" type="color" name="badgeCustomColor" value={settings.badgeCustomColor || '#4f46e5'} onChange={handleChange} className="p-0.5 h-10 w-16 cursor-pointer" />
                  <span className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded">{settings.badgeCustomColor || '#4f46e5'}</span>
                </div>
              </div>
            )}

            <div className="pt-2 space-y-3">
              <span className="block text-slate-500 dark:text-slate-400 text-sm mb-2">ข้อมูลที่ต้องการแสดง</span>
              <Checkbox name="badgeShowBloodType" label="แสดงกรุ๊ปเลือด" checked={settings.badgeShowBloodType !== 'false'} onChange={handleChange} id="badgeShowBloodType" />
              <Checkbox name="badgeShowBarcode" label="แสดงแถบบาร์โค้ด (เฉพาะ Modern)" checked={settings.badgeShowBarcode !== 'false'} onChange={handleChange} id="badgeShowBarcode" />
            </div>
            
            <div className="pt-4 space-y-3 border-t border-slate-200 dark:border-slate-700">
              <span className="block text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">สีประจำกลุ่มกำลังพล (Auto Mode)</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 block">นายทหารสัญญาบัตร</span>
                  <div className="flex items-center space-x-2">
                    <Input id="colorCommissioned" type="color" name="colorCommissioned" value={settings.colorCommissioned || '#dc2626'} onChange={handleChange} className="p-0.5 h-10 w-16 cursor-pointer" />
                    <span className="text-xs font-mono">{settings.colorCommissioned || '#dc2626'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 block">นายทหารประทวน/ลูกจ้าง</span>
                  <div className="flex items-center space-x-2">
                    <Input id="colorNonCommissioned" type="color" name="colorNonCommissioned" value={settings.colorNonCommissioned || '#d97706'} onChange={handleChange} className="p-0.5 h-10 w-16 cursor-pointer" />
                    <span className="text-xs font-mono">{settings.colorNonCommissioned || '#d97706'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 block">ทหารกองประจำการ</span>
                  <div className="flex items-center space-x-2">
                    <Input id="colorConscript" type="color" name="colorConscript" value={settings.colorConscript || '#16a34a'} onChange={handleChange} className="p-0.5 h-10 w-16 cursor-pointer" />
                    <span className="text-xs font-mono">{settings.colorConscript || '#16a34a'}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {settings.badgeTemplate === 'canvas' ? (
        <div className="w-full bg-slate-950 p-2 sm:p-4 rounded-3xl border border-slate-800 flex flex-col items-center">
          <div className="w-full">
            <BadgeCanvasEditor 
              initialElements={parseConfig(settings.badgeCanvasConfig)}
              initialBackElements={parseConfig(settings.badgeBackCanvasConfig)}
              onChange={(elements) => setSettings((prev: any) => ({ ...prev, badgeCanvasConfig: JSON.stringify(elements) }))}
              onBackChange={(elements) => setSettings((prev: any) => ({ ...prev, badgeBackCanvasConfig: JSON.stringify(elements) }))}
            />
          </div>
        </div>
      ) : (
        <div className="w-full xl:w-auto flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 relative">
          <div className="absolute top-6 flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl z-10">
            <button
              type="button"
              onClick={() => setPreviewSide('front')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${previewSide === 'front' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              ด้านหน้า
            </button>
            <button
              type="button"
              onClick={() => setPreviewSide('back')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${previewSide === 'back' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              ด้านหลัง
            </button>
          </div>

          <div className="transform xl:scale-[1.1] 2xl:scale-[1.2] origin-top mt-12 mb-4 transition-all duration-500" style={{ transformStyle: 'preserve-3d', transform: previewSide === 'back' ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
            <div style={{ backfaceVisibility: 'hidden', display: previewSide === 'back' ? 'none' : 'block' }}>
              <IDBadge
                personnel={{
                  id: 'mock',
                  badgeNo: 'ID-12345678',
                  citizenId: '1234567890123',
                  prefix: 'นาย',
                  firstName: 'ทดสอบ',
                  lastName: 'ระบบ',
                  personnelType: 'นายทหารสัญญาบัตร',
                  position: 'นักพัฒนาระบบ',
                  department: settings.systemName || 'กระทรวงกลาโหม',
                  bloodType: 'O',
                  email: 'test@example.com',
                  phone: '0812345678',
                  role: 'USER',
                  status: 'ACTIVE',
                  avatarColor: ''
                } as any}
                settings={settings}
                isBack={false}
              />
            </div>
            <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', display: previewSide === 'front' ? 'none' : 'block' }}>
              <IDBadge
                personnel={{
                  id: 'mock',
                  badgeNo: 'ID-12345678',
                  citizenId: '1234567890123',
                  prefix: 'นาย',
                  firstName: 'ทดสอบ',
                  lastName: 'ระบบ',
                  personnelType: 'นายทหารสัญญาบัตร',
                  position: 'นักพัฒนาระบบ',
                  department: settings.systemName || 'กระทรวงกลาโหม',
                  bloodType: 'O',
                  email: 'test@example.com',
                  phone: '0812345678',
                  role: 'USER',
                  status: 'ACTIVE',
                  avatarColor: ''
                } as any}
                settings={settings}
                isBack={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
