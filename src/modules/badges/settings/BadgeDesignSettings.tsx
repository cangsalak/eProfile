'use client';

import React from 'react';
import IDBadge from '../components/IDBadge';
import BadgeCanvasEditor from '../components/BadgeCanvasEditor';

interface BadgeDesignSettingsProps {
  settings: any;
  setSettings: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  previewSide: 'front' | 'back';
  setPreviewSide: (side: 'front' | 'back') => void;
}

export default function BadgeDesignSettings({ settings, setSettings, handleChange, previewSide, setPreviewSide }: BadgeDesignSettingsProps) {
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
              <span className="text-sm font-medium">ออกแบบอิสระ (Canvas)</span>
            </label>
          </div>
        </div>

        {settings.badgeTemplate !== 'canvas' && (
          <>
            <div>
              <label htmlFor="badgeColorModeSelect" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">รูปแบบสีของบัตร (Color Mode)</label>
              <select 
                id="badgeColorModeSelect"
                name="badgeColorMode" 
                aria-label="รูปแบบสีของบัตร"
                value={settings.badgeColorMode || 'auto'} 
                onChange={handleChange} 
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer"
              >
                <option value="auto">เปลี่ยนสีตามชั้นยศ/ประเภท (Auto)</option>
                <option value="custom">ใช้สีเดียวทั้งองค์กร (Custom Color)</option>
              </select>
            </div>

            {settings.badgeColorMode === 'custom' && (
              <div className="animate-fade-in">
                <label htmlFor="badgeCustomColor" className="block text-slate-500 dark:text-slate-400 text-sm mb-2">เลือกสีหลัก (Primary Color)</label>
                <div className="flex items-center space-x-3">
                  <input id="badgeCustomColor" type="color" name="badgeCustomColor" aria-label="เลือกสีหลักของบัตร" value={settings.badgeCustomColor || '#4f46e5'} onChange={handleChange} className="w-12 h-12 rounded cursor-pointer border-0 p-0" />
                  <span className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded">{settings.badgeCustomColor || '#4f46e5'}</span>
                </div>
              </div>
            )}

            <div className="pt-2 space-y-3">
              <label className="block text-slate-500 dark:text-slate-400 text-sm mb-2">ข้อมูลที่ต้องการแสดง</label>
              <div className="flex items-center space-x-3">
                <input type="checkbox" name="badgeShowBloodType" aria-label="แสดงกรุ๊ปเลือด" checked={settings.badgeShowBloodType !== 'false'} onChange={handleChange} id="badgeShowBloodType" className="w-4 h-4 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-800" />
                <label htmlFor="badgeShowBloodType" className="text-slate-700 dark:text-slate-300 text-sm cursor-pointer">แสดงกรุ๊ปเลือด</label>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" name="badgeShowBarcode" aria-label="แสดงแถบบาร์โค้ด" checked={settings.badgeShowBarcode !== 'false'} onChange={handleChange} id="badgeShowBarcode" className="w-4 h-4 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-800" />
                <label htmlFor="badgeShowBarcode" className="text-slate-700 dark:text-slate-300 text-sm cursor-pointer">แสดงแถบบาร์โค้ด (เฉพาะ Modern)</label>
              </div>
            </div>
            
            <div className="pt-4 space-y-3 border-t border-slate-200 dark:border-slate-700">
              <label className="block text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">สีประจำกลุ่มกำลังพล (Auto Mode)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="colorCommissioned" className="text-xs text-slate-500 block mb-1">นายทหารสัญญาบัตร</label>
                  <div className="flex items-center space-x-2">
                    <input id="colorCommissioned" type="color" name="colorCommissioned" aria-label="สีประจำกลุ่มนายทหารสัญญาบัตร" value={settings.colorCommissioned || '#dc2626'} onChange={handleChange} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                    <span className="text-xs font-mono">{settings.colorCommissioned || '#dc2626'}</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="colorNonCommissioned" className="text-xs text-slate-500 block mb-1">นายทหารประทวน/ลูกจ้าง</label>
                  <div className="flex items-center space-x-2">
                    <input id="colorNonCommissioned" type="color" name="colorNonCommissioned" aria-label="สีประจำกลุ่มนายทหารประทวนและลูกจ้าง" value={settings.colorNonCommissioned || '#d97706'} onChange={handleChange} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                    <span className="text-xs font-mono">{settings.colorNonCommissioned || '#d97706'}</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="colorConscript" className="text-xs text-slate-500 block mb-1">ทหารกองประจำการ</label>
                  <div className="flex items-center space-x-2">
                    <input id="colorConscript" type="color" name="colorConscript" aria-label="สีประจำกลุ่มทหารกองประจำการ" value={settings.colorConscript || '#16a34a'} onChange={handleChange} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                    <span className="text-xs font-mono">{settings.colorConscript || '#16a34a'}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {settings.badgeTemplate === 'canvas' ? (
        <div className="w-full bg-slate-100 dark:bg-slate-900/50 p-2 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
          <div className="w-full">
            <BadgeCanvasEditor 
              initialElements={settings.badgeCanvasConfig ? JSON.parse(settings.badgeCanvasConfig) : []}
              initialBackElements={settings.badgeBackCanvasConfig ? JSON.parse(settings.badgeBackCanvasConfig) : []}
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
                  avatarColor: '#3b82f6'
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
                  avatarColor: '#3b82f6'
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
