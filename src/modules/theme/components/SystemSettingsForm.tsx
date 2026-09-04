'use client';

import React, { useState } from 'react';

interface SystemSettingsFormProps {
  settings: any;
  setSettings: (settings: any) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  autoSaveStatus?: 'idle' | 'saving' | 'saved';
  showLayoutOptions?: boolean;
}

export default function SystemSettingsForm({ 
  settings, 
  setSettings, 
  handleChange, 
  handleLogoUpload, 
  fileInputRef,
  autoSaveStatus = 'saved'
}: SystemSettingsFormProps) {
  const [subTab, setSubTab] = useState<'theme' | 'typography' | 'toast'>('theme');

  const subTabs = [
    { id: 'theme', name: 'ธีมและสีประจำระบบ', icon: 'fa-palette' },
    { id: 'typography', name: 'แบบอักษรและสไตล์', icon: 'fa-font' },
    { id: 'toast', name: 'การแจ้งเตือนป๊อปอัป', icon: 'fa-bell' },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-prompt">
      {/* ─── Secondary Sub-Tabs Navigation + Auto-save indicator ───────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div 
          role="tablist" 
          aria-label="หมวดย่อยการตั้งค่าระบบและธีม"
          className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-full sm:w-fit overflow-x-auto border border-slate-200 dark:border-slate-700/80"
        >
          {subTabs.map(st => {
            const isSelected = subTab === st.id;
            return (
              <button
                key={st.id}
                role="tab"
                id={`subtab-${st.id}`}
                aria-controls={`subtabpanel-${st.id}`}
                aria-selected={isSelected}
                type="button"
                onClick={() => setSubTab(st.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm border border-slate-200 dark:border-slate-700/70'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <i className={`fa-solid ${st.icon} text-xs ${isSelected ? 'text-primary-500' : 'text-slate-400'}`}></i>
                <span>{st.name}</span>
              </button>
            );
          })}
        </div>

        {/* Auto-save Status Indicator Badge */}
        <div className="flex items-center gap-2 self-end sm:self-center px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-[11px] shrink-0 font-medium">
          {autoSaveStatus === 'saving' ? (
            <>
              <i className="fa-solid fa-circle-notch fa-spin text-amber-500 text-xs"></i>
              <span className="text-slate-600 dark:text-slate-300">กำลังบันทึกอัตโนมัติ...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">บันทึกอัตโนมัติเรียบร้อย</span>
            </>
          )}
        </div>
      </div>

      {/* ─── THEME & PRIMARY COLOR ────────────────────────────────────────── */}
      {subTab === 'theme' && (
        <div 
          role="tabpanel"
          id="subtabpanel-theme"
          aria-labelledby="subtab-theme"
          className="space-y-6 animate-fade-in"
        >
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <i className="fa-solid fa-palette text-primary-500 text-sm"></i>
              <span>โหมดหน้าจอและชุดสีประจำระบบ (Theme Mode & Primary Colors)</span>
            </h3>
          </div>
          
          {/* Dark / Light Mode */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">1. โหมดหน้าจอ (Dark / Light Mode)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {(() => {
                const activeTheme = settings.theme || 'dark';
                return (
                  <>
                    <label className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all ${activeTheme === 'dark' ? 'border-primary-500 bg-primary-500/10 shadow-md ring-2 ring-primary-500/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                      <input type="radio" name="theme" value="dark" checked={activeTheme === 'dark'} onChange={handleChange} className="sr-only" />
                      <div className="w-16 h-10 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center shadow-inner">
                        <div className="w-8 h-3 bg-slate-800 rounded"></div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {activeTheme === 'dark' && <i className="fa-solid fa-circle-check text-primary-500 text-xs"></i>}
                        <span className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">Dark Mode (โหมดมืด)</span>
                      </div>
                    </label>
                    <label className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all ${activeTheme === 'light' ? 'border-primary-500 bg-primary-500/10 shadow-md ring-2 ring-primary-500/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                      <input type="radio" name="theme" value="light" checked={activeTheme === 'light'} onChange={handleChange} className="sr-only" />
                      <div className="w-16 h-10 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center shadow-inner">
                        <div className="w-8 h-3 bg-white border border-slate-200 rounded"></div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {activeTheme === 'light' && <i className="fa-solid fa-circle-check text-primary-500 text-xs"></i>}
                        <span className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">Light Mode (โหมดสว่าง)</span>
                      </div>
                    </label>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Primary Color Theme */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">2. ชุดสีและโทนหลักของ NextAdmin HQ (Primary Accent)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(() => {
                const activeColor = settings.systemColor || 'nextadmin';
                return [
                  { id: 'nextadmin', name: 'NextAdmin Standard Blue (#5750F1)', desc: 'โทนสีหลักมาตรฐาน NextAdmin HQ Admin Dashboard', color: 'bg-[#5750F1]' },
                  { id: 'custom', name: 'สีเน้นแต่งเอง (Custom Accent Hex)', desc: 'ปรับแต่งรหัสสีเน้นระบบตามองค์กร', color: 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500' },
                ].map(c => {
                  const isSelected = activeColor === c.id;
                  return (
                    <label key={c.id} className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-3 transition-all ${isSelected ? 'border-primary-500 bg-primary-500/10 shadow-md ring-2 ring-primary-500/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                      <input type="radio" name="systemColor" value={c.id} checked={isSelected} onChange={handleChange} className="sr-only" />
                      <div className={`w-10 h-10 rounded-xl ${c.color} shadow-md flex items-center justify-center text-white text-xs shrink-0`}>
                        {isSelected && <i className="fa-solid fa-check text-sm"></i>}
                      </div>
                      <div>
                        <span className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm block">{c.name}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{c.desc}</span>
                      </div>
                    </label>
                  );
                });
              })()}
            </div>

            {settings.systemColor === 'custom' && (
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mt-3 flex items-center space-x-4 animate-fade-in">
                <div>
                  <label htmlFor="customPrimaryColorHex" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    เลือกสีเน้นแต่งเอง (Custom Hex Color)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input id="customPrimaryColorPicker" type="color" name="customPrimaryColor" aria-label="เลือกสีแต่งเอง" value={settings.customPrimaryColor || '#5750F1'} onChange={handleChange} className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 shadow-sm" />
                    <input id="customPrimaryColorHex" type="text" name="customPrimaryColor" aria-label="รหัสสี Hex แต่งเอง" value={settings.customPrimaryColor || '#5750F1'} onChange={handleChange} className="form-control font-mono uppercase w-32 py-1.5" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 4. TYPOGRAPHY, FONT SIZE, BORDER RADIUS & SURFACE STYLE ────────── */}
      {subTab === 'typography' && (
        <div 
          role="tabpanel"
          id="subtabpanel-typography"
          aria-labelledby="subtab-typography"
          className="space-y-6 animate-fade-in"
        >
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <i className="fa-solid fa-font text-primary-500 text-sm"></i>
              <span>แบบอักษร ขนาด และความโค้งมนพื้นผิว (Typography & Surface Style)</span>
            </h3>
          </div>

          {/* Typography */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">1. แบบตัวอักษร (Typography)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(() => {
                const activeFont = settings.systemFont || 'prompt';
                return [
                  { id: 'prompt', name: 'Prompt', desc: 'ทันสมัย อ่านง่าย' },
                  { id: 'sarabun', name: 'Sarabun', desc: 'มาตรฐานราชการ' },
                  { id: 'kanit', name: 'Kanit', desc: 'ทรงเหลี่ยม เป็นทางการ' },
                  { id: 'niramit', name: 'Niramit', desc: 'สวยงาม คลาสสิก' },
                ].map(font => {
                  const isSelected = activeFont === font.id;
                  return (
                    <label key={font.id} className={`cursor-pointer border-2 rounded-2xl p-3.5 flex flex-col items-center justify-center gap-1.5 transition-all ${isSelected ? 'border-primary-500 bg-primary-500/10 shadow-md ring-2 ring-primary-500/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                      <input type="radio" name="systemFont" value={font.id} checked={isSelected} onChange={handleChange} className="sr-only" />
                      <div className="flex items-center gap-1.5">
                        {isSelected && <i className="fa-solid fa-circle-check text-primary-500 text-xs"></i>}
                        <span className="text-slate-900 dark:text-white font-bold text-base" style={{ fontFamily: `var(--font-${font.id})` }}>{font.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{font.desc}</span>
                    </label>
                  );
                });
              })()}
            </div>
          </div>

          {/* Font Size Slider */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <i className="fa-solid fa-text-height text-primary-500"></i>
                  <span>2. ขนาดตัวอักษรของระบบ (Font Size Scale)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">เลื่อนแถบสไลด์ซ้าย-ขวา เพื่อเพิ่มหรือลดขนาดตัวอักษรทั่วทั้งระบบ</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary-500/10 border border-primary-500/30 text-primary-600 dark:text-primary-400 rounded-full font-bold text-xs">
                  {settings.fontSizeScale || '100'}%
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const e = { target: { name: 'fontSizeScale', value: '100', type: 'radio' } } as any;
                    handleChange(e);
                  }}
                  className="text-[11px] text-slate-500 hover:text-primary-500 underline"
                >
                  คืนค่าเริ่มต้น (100%)
                </button>
              </div>
            </div>

            {/* Range Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400 select-none">ก (เล็ก)</span>
                <input 
                  type="range" 
                  name="fontSizeScale"
                  aria-label="ตัวเลื่อนปรับขนาดตัวอักษร"
                  min="85" 
                  max="125" 
                  step="5"
                  value={settings.fontSizeScale || '100'}
                  onChange={handleChange}
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-500"
                />
                <span className="text-lg font-bold text-slate-700 dark:text-slate-200 select-none">ก (ใหญ่)</span>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                {[
                  { value: '85', label: '85% เล็ก' },
                  { value: '100', label: '100% ปกติ' },
                  { value: '115', label: '115% ใหญ่' },
                  { value: '125', label: '125% ใหญ่พิเศษ' },
                ].map(preset => {
                  const isActive = (settings.fontSizeScale || '100') === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => {
                        const e = { target: { name: 'fontSizeScale', value: preset.value, type: 'radio' } } as any;
                        handleChange(e);
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-medium transition-all ${isActive ? 'bg-primary-600 text-white font-bold shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-500'}`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Text Preview Box */}
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 mt-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">ตัวอย่างข้อความแสดงผลจริง (Live Preview)</span>
              <p className="text-slate-800 dark:text-slate-100 leading-relaxed">
                ระบบจัดการฐานข้อมูลและสารสนเทศกำลังพล (eProfile System) — ระบบกำลังแสดงผลด้วยขนาดตัวอักษร <strong>{settings.fontSizeScale || '100'}%</strong>
              </p>
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">3. ความโค้งมนของขอบ (Border Radius)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(() => {
                const activeBorder = settings.borderRadius || 'rounded';
                return [
                  { id: 'sharp', name: 'เหลี่ยม (Sharp)', shapeClass: 'rounded-none' },
                  { id: 'rounded', name: 'โค้งมน (Rounded)', shapeClass: 'rounded-xl' },
                  { id: 'pill', name: 'แคปซูล (Pill)', shapeClass: 'rounded-full' },
                ].map(r => {
                  const isSelected = activeBorder === r.id;
                  return (
                    <label key={r.id} className={`cursor-pointer border-2 rounded-2xl p-3.5 flex flex-col items-center justify-center gap-2.5 transition-all ${isSelected ? 'border-primary-500 bg-primary-500/10 shadow-md ring-2 ring-primary-500/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                      <input type="radio" name="borderRadius" value={r.id} checked={isSelected} onChange={handleChange} className="sr-only" />
                      <div className={`w-16 h-8 bg-primary-500 shadow-sm ${r.shapeClass} flex items-center justify-center text-white text-xs`}>
                        {isSelected && <i className="fa-solid fa-check"></i>}
                      </div>
                      <span className="text-slate-900 dark:text-white font-semibold text-xs">{r.name}</span>
                    </label>
                  );
                });
              })()}
            </div>
          </div>

          {/* Surface Style */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">4. สไตล์พื้นผิว (Surface Style)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(() => {
                const activeSurface = settings.surfaceStyle || 'shadow';
                return [
                  { id: 'flat', name: 'เรียบแบน (Flat)' },
                  { id: 'shadow', name: 'มีเงา (Shadow)' },
                  { id: 'glass', name: 'กระจกฝ้า (Glassmorphism)' },
                ].map(s => {
                  const isSelected = activeSurface === s.id;
                  return (
                    <label key={s.id} className={`cursor-pointer border-2 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all ${isSelected ? 'border-primary-500 bg-primary-500/10 shadow-md ring-2 ring-primary-500/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                      <input type="radio" name="surfaceStyle" value={s.id} checked={isSelected} onChange={handleChange} className="sr-only" />
                      <div className="flex items-center gap-1.5">
                        {isSelected && <i className="fa-solid fa-circle-check text-primary-500 text-xs"></i>}
                        <span className="text-slate-900 dark:text-white font-semibold text-xs">{s.name}</span>
                      </div>
                    </label>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. TOAST NOTIFICATIONS ──────────────────────────────────────────── */}
      {subTab === 'toast' && (
        <div 
          role="tabpanel"
          id="subtabpanel-toast"
          aria-labelledby="subtab-toast"
          className="space-y-6 animate-fade-in"
        >
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <i className="fa-solid fa-bell text-primary-500 text-sm"></i>
              <span>การตั้งค่าป๊อปอัปแจ้งเตือน (Toast Notifications Settings)</span>
            </h3>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
                ตำแหน่งป๊อปอัปแจ้งเตือน (Toast Position)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(() => {
                  const activePos = settings.toastPosition || 'top-right';
                  return [
                    { id: 'top-right', name: 'มุมบนขวา' },
                    { id: 'top-center', name: 'ตรงกลางด้านบน' },
                    { id: 'top-left', name: 'มุมบนซ้าย' },
                    { id: 'bottom-right', name: 'มุมล่างขวา' },
                    { id: 'bottom-center', name: 'ตรงกลางด้านล่าง' },
                    { id: 'bottom-left', name: 'มุมล่างซ้าย' },
                  ].map(pos => {
                    const isSelected = activePos === pos.id;
                    return (
                      <label key={pos.id} className={`cursor-pointer border-2 rounded-xl p-3 flex items-center justify-center gap-2 transition-all text-xs ${isSelected ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold shadow-sm ring-2 ring-primary-500/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <input type="radio" name="toastPosition" value={pos.id} checked={isSelected} onChange={handleChange} className="sr-only" />
                        {isSelected && <i className="fa-solid fa-check text-xs"></i>}
                        <span>{pos.name}</span>
                      </label>
                    );
                  });
                })()}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
                รูปแบบป๊อปอัป (Toast Theme)
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(() => {
                  const activeToastTheme = settings.toastTheme || 'light';
                  return [
                    { id: 'light', name: 'สว่าง (Light)', icon: 'fa-sun' },
                    { id: 'dark', name: 'มืด (Dark)', icon: 'fa-moon' },
                  ].map(theme => {
                    const isSelected = activeToastTheme === theme.id;
                    return (
                      <label key={theme.id} className={`cursor-pointer border-2 rounded-xl p-3 flex items-center justify-center gap-2 transition-all text-xs ${isSelected ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold shadow-sm ring-2 ring-primary-500/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <input type="radio" name="toastTheme" value={theme.id} checked={isSelected} onChange={handleChange} className="sr-only" />
                        <i className={`fa-solid ${theme.icon}`}></i>
                        <span>{theme.name}</span>
                        {isSelected && <i className="fa-solid fa-check text-xs ml-1"></i>}
                      </label>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
