'use client';

import React, { useState } from 'react';

interface SystemSettingsFormProps {
  settings: any;
  setSettings: (settings: any) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  autoSaveStatus?: 'idle' | 'saving' | 'saved';
}

export default function SystemSettingsForm({ 
  settings, 
  setSettings, 
  handleChange, 
  handleLogoUpload, 
  fileInputRef,
  autoSaveStatus = 'saved'
}: SystemSettingsFormProps) {
  const [subTab, setSubTab] = useState<'general' | 'calendar' | 'theme' | 'typography' | 'toast'>('general');

  const subTabs = [
    { id: 'general', name: 'ข้อมูลระบบและองค์กร', icon: 'fa-building-columns' },
    { id: 'calendar', name: 'ปฏิทิน Google Calendar', icon: 'fa-calendar-days' },
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

      {/* ─── 1. GENERAL & ORGANIZATION INFO ──────────────────────────────────── */}
      {subTab === 'general' && (
        <div 
          role="tabpanel"
          id="subtabpanel-general"
          aria-labelledby="subtab-general"
          className="space-y-5 animate-fade-in"
        >
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <i className="fa-solid fa-building-columns text-primary-500 text-sm"></i>
              <span>ข้อมูลพื้นฐานของระบบและองค์กร (Organization & Basic Info)</span>
            </h3>
          </div>

          {/* System Logo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              โลโก้ระบบ (System Logo)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm shrink-0">
                {settings.systemLogo ? (
                  <img src={settings.systemLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <i className="fa-solid fa-image text-3xl text-slate-400"></i>
                )}
              </div>
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  รูปภาพโลโก้ที่จะแสดงบริเวณเมนูด้านซ้ายและแถบด้านบนสุด รองรับไฟล์ PNG, JPG ขนาดไม่เกิน 2MB
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-semibold rounded-xl transition-all inline-flex items-center gap-2 shadow-xs"
                >
                  <i className="fa-solid fa-upload"></i>
                  <span>เลือกไฟล์รูปภาพโลโก้</span>
                </button>
                <input
                  id="systemLogoFileInput"
                  aria-label="อัปโหลดรูปภาพโลโก้ระบบ"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* System & Organization Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="systemName" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                ชื่อระบบ (System Name)
              </label>
              <input
                id="systemName"
                type="text"
                name="systemName"
                aria-label="ชื่อระบบ"
                value={settings.systemName || ''}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div>
              <label htmlFor="organizationName" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                ชื่อองค์กร (Organization Name)
              </label>
              <input
                id="organizationName"
                type="text"
                name="organizationName"
                aria-label="ชื่อองค์กร"
                value={settings.organizationName || ''}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="organizationAddress" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                ที่อยู่หน่วยงาน (Organization Address)
              </label>
              <input
                id="organizationAddress"
                type="text"
                name="organizationAddress"
                aria-label="ที่อยู่หน่วยงาน"
                value={settings.organizationAddress || ''}
                onChange={handleChange}
                placeholder="กรอกที่อยู่หน่วยงาน..."
                className="form-control"
              />
            </div>
            <div>
              <label htmlFor="organizationPhone" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                เบอร์โทรศัพท์หน่วยงาน (Organization Phone)
              </label>
              <input
                id="organizationPhone"
                type="text"
                name="organizationPhone"
                aria-label="เบอร์โทรศัพท์หน่วยงาน"
                value={settings.organizationPhone || ''}
                onChange={handleChange}
                placeholder="กรอกเบอร์โทรศัพท์หน่วยงาน..."
                className="form-control"
              />
            </div>
          </div>

          <div>
            <label htmlFor="cardTermsConditions" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              ข้อกำหนดหลังบัตร / หมายเหตุ (Terms and Conditions)
            </label>
            <textarea
              id="cardTermsConditions"
              name="cardTermsConditions"
              aria-label="ข้อกำหนดหลังบัตร"
              value={settings.cardTermsConditions || ''}
              onChange={handleChange}
              placeholder="เช่น หากเก็บได้กรุณาส่งคืน..."
              rows={2}
              className="form-control resize-none"
            />
          </div>

          <div>
            <label htmlFor="defaultPageSize" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              จำนวนรายการเริ่มต้นต่อหน้าในตาราง (Default Items Per Page)
            </label>
            <select
              id="defaultPageSize"
              name="defaultPageSize"
              aria-label="จำนวนรายการเริ่มต้นต่อหน้าในตาราง"
              value={settings.defaultPageSize || '20'}
              onChange={handleChange}
              className="form-control"
            >
              <option value="10">10 รายการ / หน้า</option>
              <option value="20">20 รายการ / หน้า (แนะนำ)</option>
              <option value="50">50 รายการ / หน้า</option>
              <option value="100">100 รายการ / หน้า</option>
            </select>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              กำหนดค่าเริ่มต้นสำหรับตารางข้อมูลทั้งหมดในระบบ เช่น ทะเบียนบุคลากร และเอกสาร API
            </p>
          </div>
        </div>
      )}

      {/* ─── 2. GOOGLE CALENDAR INTEGRATION ──────────────────────────────────── */}
      {subTab === 'calendar' && (
        <div 
          role="tabpanel"
          id="subtabpanel-calendar"
          aria-labelledby="subtab-calendar"
          className="space-y-5 animate-fade-in"
        >
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <i className="fa-solid fa-calendar-days text-primary-500 text-sm"></i>
              <span>การเชื่อมต่อปฏิทินส่วนกลาง (Google Calendar iCal Integration)</span>
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ดึงข้อมูลกิจกรรมและวันสำคัญจาก Google Calendar มาแสดงผลในหน้าปฏิทินส่วนกลางของระบบ (รองรับหลายปฏิทิน)
            </p>
            <button
              type="button"
              onClick={() => {
                const urls = settings.googleCalendarUrls ? JSON.parse(settings.googleCalendarUrls) : [];
                setSettings({ ...settings, googleCalendarUrls: JSON.stringify([...urls, { name: '', url: '' }]) });
              }}
              className="text-xs bg-primary-600 hover:bg-primary-500 text-white px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 font-semibold shadow-sm shrink-0"
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
              <span>เพิ่มปฏิทิน</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {(() => {
              const urls = settings.googleCalendarUrls ? JSON.parse(settings.googleCalendarUrls) : [];
              if (urls.length === 0) {
                return (
                  <div className="text-xs text-slate-500 text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <i className="fa-regular fa-calendar-xmark text-2xl mb-2 text-slate-400 block"></i>
                    <span>ยังไม่ได้เพิ่มปฏิทิน Google Calendar คลิกปุ่ม "เพิ่มปฏิทิน" ด้านบนเพื่อเริ่มต้น</span>
                  </div>
                );
              }
              return urls.map((cal: any, index: number) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <label htmlFor={`googleCalendarName_${index}`} className="sr-only">ชื่อปฏิทิน</label>
                  <input 
                    id={`googleCalendarName_${index}`}
                    type="text" 
                    aria-label={`ชื่อปฏิทินรายการที่ ${index + 1}`}
                    placeholder="ชื่อปฏิทิน (เช่น วันหยุดราชการ, กิจกรรมประจำปี)" 
                    value={cal.name}
                    onChange={(e) => {
                      const newUrls = [...urls];
                      newUrls[index].name = e.target.value;
                      setSettings({ ...settings, googleCalendarUrls: JSON.stringify(newUrls) });
                    }}
                    className="w-full sm:w-1/3 form-control py-2 text-xs"
                  />
                  <label htmlFor={`googleCalendarUrl_${index}`} className="sr-only">ลิงก์ iCal</label>
                  <input 
                    id={`googleCalendarUrl_${index}`}
                    type="text" 
                    aria-label={`ลิงก์ iCal รายการที่ ${index + 1}`}
                    placeholder="ลิงก์ iCal (https://calendar.google.com/calendar/ical/.../basic.ics)" 
                    value={cal.url}
                    onChange={(e) => {
                      const newUrls = [...urls];
                      newUrls[index].url = e.target.value;
                      setSettings({ ...settings, googleCalendarUrls: JSON.stringify(newUrls) });
                    }}
                    className="w-full flex-1 form-control py-2 text-xs font-mono"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      const newUrls = urls.filter((_: any, i: number) => i !== index);
                      setSettings({ ...settings, googleCalendarUrls: JSON.stringify(newUrls) });
                    }}
                    className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors shrink-0"
                    title="ลบปฏิทินนี้"
                  >
                    <i className="fa-solid fa-trash text-xs"></i>
                  </button>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* ─── 3. THEME & PRIMARY COLOR ────────────────────────────────────────── */}
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
              <label className={`cursor-pointer border rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all ${settings.theme === 'dark' ? 'border-primary-500 bg-primary-500/10 shadow-sm' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                <input type="radio" name="theme" value="dark" checked={settings.theme === 'dark'} onChange={handleChange} className="sr-only" />
                <div className="w-16 h-10 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center shadow-inner">
                  <div className="w-8 h-3 bg-slate-800 rounded"></div>
                </div>
                <span className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">Dark Mode (โหมดมืด)</span>
              </label>
              <label className={`cursor-pointer border rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all ${settings.theme === 'light' ? 'border-primary-500 bg-primary-500/10 shadow-sm' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                <input type="radio" name="theme" value="light" checked={settings.theme === 'light'} onChange={handleChange} className="sr-only" />
                <div className="w-16 h-10 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center shadow-inner">
                  <div className="w-8 h-3 bg-white border border-slate-200 rounded"></div>
                </div>
                <span className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">Light Mode (โหมดสว่าง)</span>
              </label>
            </div>
          </div>

          {/* Primary Color Palette */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">2. สีประจำระบบ (Primary Color Theme)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { id: 'indigo', name: 'Indigo (คราม)', color: 'bg-indigo-500' },
                { id: 'emerald', name: 'Emerald (เขียวมรกต)', color: 'bg-emerald-500' },
                { id: 'ocean', name: 'Ocean (ฟ้าสมุทร)', color: 'bg-sky-500' },
                { id: 'rose', name: 'Rose (กุหลาบ)', color: 'bg-rose-500' },
                { id: 'custom', name: 'สีแต่งเอง', color: 'bg-slate-400' },
              ].map(c => (
                <label key={c.id} className={`cursor-pointer border rounded-2xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${settings.systemColor === c.id ? 'border-primary-500 bg-primary-500/10 shadow-sm' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                  <input type="radio" name="systemColor" value={c.id} checked={settings.systemColor === c.id} onChange={handleChange} className="sr-only" />
                  <div className={`w-8 h-8 rounded-full ${c.color} shadow-md`}></div>
                  <span className="text-slate-900 dark:text-white font-semibold text-xs text-center">{c.name}</span>
                </label>
              ))}
            </div>

            {settings.systemColor === 'custom' && (
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mt-3 flex items-center space-x-4 animate-fade-in">
                <div>
                  <label htmlFor="customPrimaryColorHex" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    เลือกสีที่ต้องการ (Custom Hex Color)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input id="customPrimaryColorPicker" type="color" name="customPrimaryColor" aria-label="เลือกสีแต่งเอง" value={settings.customPrimaryColor || '#6366f1'} onChange={handleChange} className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 shadow-sm" />
                    <input id="customPrimaryColorHex" type="text" name="customPrimaryColor" aria-label="รหัสสี Hex แต่งเอง" value={settings.customPrimaryColor || '#6366f1'} onChange={handleChange} className="form-control font-mono uppercase w-32 py-1.5" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 4. TYPOGRAPHY, BORDER RADIUS & SURFACE STYLE ─────────────────────── */}
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
              <span>แบบอักษรและความโค้งมนพื้นผิว (Typography & Surface Style)</span>
            </h3>
          </div>

          {/* Typography */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">1. แบบตัวอักษร (Typography)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { id: 'prompt', name: 'Prompt', desc: 'ทันสมัย อ่านง่าย' },
                { id: 'sarabun', name: 'Sarabun', desc: 'มาตรฐานราชการ' },
                { id: 'kanit', name: 'Kanit', desc: 'ทรงเหลี่ยม เป็นทางการ' },
                { id: 'niramit', name: 'Niramit', desc: 'สวยงาม คลาสสิก' },
              ].map(font => (
                <label key={font.id} className={`cursor-pointer border rounded-2xl p-3.5 flex flex-col items-center justify-center gap-1.5 transition-all ${settings.systemFont === font.id ? 'border-primary-500 bg-primary-500/10 shadow-sm' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                  <input type="radio" name="systemFont" value={font.id} checked={settings.systemFont === font.id} onChange={handleChange} className="sr-only" />
                  <span className="text-slate-900 dark:text-white font-bold text-base" style={{ fontFamily: `var(--font-${font.id})` }}>{font.name}</span>
                  <span className="text-[11px] text-slate-500">{font.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">2. ความโค้งมนของขอบ (Border Radius)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'sharp', name: 'เหลี่ยม (Sharp)', shapeClass: 'rounded-none' },
                { id: 'rounded', name: 'โค้งมน (Rounded)', shapeClass: 'rounded-xl' },
                { id: 'pill', name: 'แคปซูล (Pill)', shapeClass: 'rounded-full' },
              ].map(r => (
                <label key={r.id} className={`cursor-pointer border rounded-2xl p-3.5 flex flex-col items-center justify-center gap-2.5 transition-all ${settings.borderRadius === r.id ? 'border-primary-500 bg-primary-500/10 shadow-sm' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                  <input type="radio" name="borderRadius" value={r.id} checked={settings.borderRadius === r.id} onChange={handleChange} className="sr-only" />
                  <div className={`w-16 h-8 bg-primary-500 shadow-sm ${r.shapeClass}`}></div>
                  <span className="text-slate-900 dark:text-white font-semibold text-xs">{r.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Surface Style */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">3. สไตล์พื้นผิว (Surface Style)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'flat', name: 'เรียบแบน (Flat)' },
                { id: 'shadow', name: 'มีเงา (Shadow)' },
                { id: 'glass', name: 'กระจกฝ้า (Glassmorphism)' },
              ].map(s => (
                <label key={s.id} className={`cursor-pointer border rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all ${settings.surfaceStyle === s.id ? 'border-primary-500 bg-primary-500/10 shadow-sm' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                  <input type="radio" name="surfaceStyle" value={s.id} checked={settings.surfaceStyle === s.id} onChange={handleChange} className="sr-only" />
                  <span className="text-slate-900 dark:text-white font-semibold text-xs">{s.name}</span>
                </label>
              ))}
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
                {[
                  { id: 'top-right', name: 'มุมบนขวา' },
                  { id: 'top-center', name: 'ตรงกลางด้านบน' },
                  { id: 'top-left', name: 'มุมบนซ้าย' },
                  { id: 'bottom-right', name: 'มุมล่างขวา' },
                  { id: 'bottom-center', name: 'ตรงกลางด้านล่าง' },
                  { id: 'bottom-left', name: 'มุมล่างซ้าย' },
                ].map(pos => (
                  <label key={pos.id} className={`cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all text-xs ${settings.toastPosition === pos.id || (!settings.toastPosition && pos.id === 'top-right') ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    <input type="radio" name="toastPosition" value={pos.id} checked={settings.toastPosition === pos.id || (!settings.toastPosition && pos.id === 'top-right')} onChange={handleChange} className="sr-only" />
                    <span>{pos.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
                รูปแบบป๊อปอัป (Toast Theme)
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'light', name: 'สว่าง (Light)', icon: 'fa-sun' },
                  { id: 'dark', name: 'มืด (Dark)', icon: 'fa-moon' },
                ].map(theme => (
                  <label key={theme.id} className={`cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all text-xs ${settings.toastTheme === theme.id || (!settings.toastTheme && theme.id === 'light') ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    <input type="radio" name="toastTheme" value={theme.id} checked={settings.toastTheme === theme.id || (!settings.toastTheme && theme.id === 'light')} onChange={handleChange} className="sr-only" />
                    <i className={`fa-solid ${theme.icon}`}></i>
                    <span>{theme.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
