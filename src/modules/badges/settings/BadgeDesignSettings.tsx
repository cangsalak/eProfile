'use client';

import React from 'react';
import IDBadge from '../components/IDBadge';
import BadgeCanvasEditor from '../components/BadgeCanvasEditor';
import ClassicBadgeSettings from '../components/classic/ClassicBadgeSettings';
import ModernBadgeSettings from '../components/modern/ModernBadgeSettings';

interface BadgeDesignSettingsProps {
  settings: any;
  setSettings: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  previewSide: 'front' | 'back';
  setPreviewSide: (side: 'front' | 'back') => void;
}

export default function BadgeDesignSettings({
  settings,
  setSettings,
  handleChange,
  previewSide,
  setPreviewSide
}: BadgeDesignSettingsProps) {
  const parseConfig = (val: any) => {
    if (!val) return undefined;
    if (typeof val === 'object') return val;
    try {
      return JSON.parse(val);
    } catch {
      return undefined;
    }
  };

  const badgeTemplate = settings.badgeTemplate || 'classic';

  return (
    <div className={`space-y-6 animate-fade-in flex flex-col ${badgeTemplate === 'canvas' ? '' : 'xl:flex-row'} gap-8`}>
      <div className="flex-1 space-y-5">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
          ออกแบบบัตรประจำตัว
        </h3>

        {/* 3 Template Formats Selector */}
        <div>
          <label className="block text-slate-500 dark:text-slate-400 text-sm mb-2">รูปแบบบัตร (Template Format)</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Format 1: Classic */}
            <label
              className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${
                badgeTemplate === 'classic'
                  ? 'border-primary-500 bg-primary-500/10 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <input
                type="radio"
                name="badgeTemplate"
                value="classic"
                checked={badgeTemplate === 'classic'}
                onChange={handleChange}
                className="sr-only"
              />
              <i className="fa-solid fa-address-card text-2xl text-primary-500 dark:text-primary-400" />
              <div className="text-center">
                <span className="text-sm font-semibold block text-slate-800 dark:text-slate-200">1. คลาสสิค (Classic)</span>
                <span className="text-[11px] text-slate-400">แบบมาตรฐานราชการ</span>
              </div>
            </label>

            {/* Format 2: Modern */}
            <label
              className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${
                badgeTemplate === 'modern'
                  ? 'border-primary-500 bg-primary-500/10 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <input
                type="radio"
                name="badgeTemplate"
                value="modern"
                checked={badgeTemplate === 'modern'}
                onChange={handleChange}
                className="sr-only"
              />
              <i className="fa-solid fa-id-card-clip text-2xl text-primary-500 dark:text-primary-400" />
              <div className="text-center">
                <span className="text-sm font-semibold block text-slate-800 dark:text-slate-200">2. ทันสมัย (Modern)</span>
                <span className="text-[11px] text-slate-400">รูปวงกลม + บาร์โค้ด</span>
              </div>
            </label>

            {/* Format 3: Canva Style Studio */}
            <label
              className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${
                badgeTemplate === 'canvas'
                  ? 'border-primary-500 bg-primary-500/10 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <input
                type="radio"
                name="badgeTemplate"
                value="canvas"
                checked={badgeTemplate === 'canvas'}
                onChange={handleChange}
                className="sr-only"
              />
              <i className="fa-solid fa-pen-ruler text-2xl text-primary-500 dark:text-primary-400" />
              <div className="text-center">
                <span className="text-sm font-semibold block text-slate-800 dark:text-slate-200">3. ออกแบบอิสระ (Canva)</span>
                <span className="text-[11px] text-slate-400">Drag & Drop Studio</span>
              </div>
            </label>
          </div>
        </div>

        {/* Modular View 1: Classic Settings */}
        {badgeTemplate === 'classic' && (
          <ClassicBadgeSettings settings={settings} handleChange={handleChange} />
        )}

        {/* Modular View 2: Modern Settings */}
        {badgeTemplate === 'modern' && (
          <ModernBadgeSettings settings={settings} handleChange={handleChange} />
        )}
      </div>

      {/* Modular View 3 / Preview */}
      {badgeTemplate === 'canvas' ? (
        <div className="w-full bg-slate-50 dark:bg-slate-900/60 p-2 sm:p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
          <div className="w-full">
            <BadgeCanvasEditor
              initialElements={parseConfig(settings.badgeCanvasConfig)}
              initialBackElements={parseConfig(settings.badgeBackCanvasConfig)}
              onChange={(elements) =>
                setSettings((prev: any) => ({ ...prev, badgeCanvasConfig: JSON.stringify(elements) }))
              }
              onBackChange={(elements) =>
                setSettings((prev: any) => ({ ...prev, badgeBackCanvasConfig: JSON.stringify(elements) }))
              }
            />
          </div>
        </div>
      ) : (
        <div className="w-full xl:w-auto flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 relative">
          <div className="absolute top-6 flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl z-10">
            <button
              type="button"
              onClick={() => setPreviewSide('front')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                previewSide === 'front'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              ด้านหน้า
            </button>
            <button
              type="button"
              onClick={() => setPreviewSide('back')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                previewSide === 'back'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              ด้านหลัง
            </button>
          </div>

          <div
            className="transform xl:scale-[1.1] 2xl:scale-[1.2] origin-top mt-12 mb-4 transition-all duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: previewSide === 'back' ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            <div style={{ backfaceVisibility: 'hidden', display: previewSide === 'back' ? 'none' : 'block' }}>
              <IDBadge
                personnel={
                  {
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
                  } as any
                }
                settings={settings}
                isBack={false}
              />
            </div>
            <div
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                display: previewSide === 'front' ? 'none' : 'block'
              }}
            >
              <IDBadge
                personnel={
                  {
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
                  } as any
                }
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
