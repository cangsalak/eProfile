import React from 'react';

interface SystemSettingsFormProps {
  settings: any;
  setSettings: (settings: any) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export default function SystemSettingsForm({ settings, setSettings, handleChange, handleLogoUpload, fileInputRef }: SystemSettingsFormProps) {
  return (
    <>
      <div className="space-y-5 animate-fade-in">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">ระบบทั่วไป</h3>

        <div>
          <label className="block text-slate-500 dark:text-slate-400 text-sm mb-2">โลโก้ระบบ (System Logo)</label>
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <div className="w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-300 dark:border-slate-600 overflow-hidden shadow-inner">
              {settings.systemLogo ? (
                <img src={settings.systemLogo} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <i className="fa-solid fa-image text-3xl text-slate-500"></i>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">รูปภาพโลโก้ที่จะแสดงบริเวณเมนูด้านซ้ายและแถบด้านบนสุด รองรับ PNG, JPG ขนาดไม่เกิน 2MB</p>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-900 dark:text-white text-sm font-medium rounded-lg transition-colors flex items-center">
                <i className="fa-solid fa-upload mr-2"></i> เลือกไฟล์รูปภาพ
              </button>
              <input id="systemLogoFileInput" aria-label="อัปโหลดรูปภาพโลโก้ระบบ" type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="systemName" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">ชื่อระบบ (System Name)</label>
          <input id="systemName" type="text" name="systemName" aria-label="ชื่อระบบ" value={settings.systemName || ''} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
        </div>
        <div>
          <label htmlFor="organizationName" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">ชื่อองค์กร (Organization Name)</label>
          <input id="organizationName" type="text" name="organizationName" aria-label="ชื่อองค์กร" value={settings.organizationName || ''} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
        </div>
        <div>
          <label htmlFor="organizationAddress" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">ที่อยู่หน่วยงาน (Organization Address)</label>
          <input id="organizationAddress" type="text" name="organizationAddress" aria-label="ที่อยู่หน่วยงาน" value={settings.organizationAddress || ''} onChange={handleChange} placeholder="กรอกที่อยู่หน่วยงาน..." className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
        </div>
        <div>
          <label htmlFor="organizationPhone" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">เบอร์โทรศัพท์หน่วยงาน (Organization Phone)</label>
          <input id="organizationPhone" type="text" name="organizationPhone" aria-label="เบอร์โทรศัพท์หน่วยงาน" value={settings.organizationPhone || ''} onChange={handleChange} placeholder="กรอกเบอร์โทรศัพท์หน่วยงาน..." className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
        </div>
        <div>
          <label htmlFor="cardTermsConditions" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">ข้อกำหนดหลังบัตร / หมายเหตุ (Terms and Conditions)</label>
          <textarea id="cardTermsConditions" name="cardTermsConditions" aria-label="ข้อกำหนดหลังบัตร" value={settings.cardTermsConditions || ''} onChange={handleChange} placeholder="เช่น หากเก็บได้กรุณาส่งคืน..." rows={2} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none" />
        </div>

        <div>
          <label htmlFor="defaultPageSize" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">จำนวนรายการเริ่มต้นต่อหน้าในตาราง (Default Items Per Page)</label>
          <select
            id="defaultPageSize"
            name="defaultPageSize"
            aria-label="จำนวนรายการเริ่มต้นต่อหน้าในตาราง"
            value={settings.defaultPageSize || '20'}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer"
          >
            <option value="10">10 รายการ / หน้า</option>
            <option value="20">20 รายการ / หน้า (แนะนำ)</option>
            <option value="50">50 รายการ / หน้า</option>
            <option value="100">100 รายการ / หน้า</option>
          </select>
          <p className="text-xs text-slate-500 mt-1">กำหนดค่าเริ่มต้นสำหรับตารางข้อมูลทั้งหมดในระบบ เช่น ทะเบียนบุคลากร และเอกสาร API</p>
        </div>


        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">เชื่อมต่อ Google Calendar</h4>
            <button
              type="button"
              onClick={() => {
                const urls = settings.googleCalendarUrls ? JSON.parse(settings.googleCalendarUrls) : [];
                setSettings({ ...settings, googleCalendarUrls: JSON.stringify([...urls, { name: '', url: '' }]) });
              }}
              className="text-xs bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <i className="fa-solid fa-plus"></i> เพิ่มปฏิทิน
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-3">ดึงข้อมูลกิจกรรมจาก Google Calendar มาแสดงในปฏิทินส่วนกลางของระบบ (รองรับหลายปฏิทิน)</p>
          
          <div className="space-y-3">
            {(() => {
              const urls = settings.googleCalendarUrls ? JSON.parse(settings.googleCalendarUrls) : [];
              if (urls.length === 0) {
                return <div className="text-sm text-slate-500 text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">ยังไม่ได้เพิ่มปฏิทิน</div>;
              }
              return urls.map((cal: any, index: number) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <label htmlFor={`googleCalendarName_${index}`} className="sr-only">ชื่อปฏิทิน</label>
                  <input 
                    id={`googleCalendarName_${index}`}
                    type="text" 
                    aria-label={`ชื่อปฏิทินรายการที่ ${index + 1}`}
                    placeholder="ชื่อปฏิทิน (เช่น วันหยุดไทย)" 
                    value={cal.name}
                    onChange={(e) => {
                      const newUrls = [...urls];
                      newUrls[index].name = e.target.value;
                      setSettings({ ...settings, googleCalendarUrls: JSON.stringify(newUrls) });
                    }}
                    className="w-full sm:w-1/3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                  <label htmlFor={`googleCalendarUrl_${index}`} className="sr-only">ลิงก์ iCal</label>
                  <input 
                    id={`googleCalendarUrl_${index}`}
                    type="text" 
                    aria-label={`ลิงก์ iCal รายการที่ ${index + 1}`}
                    placeholder="ลิงก์ iCal (https://.../basic.ics)" 
                    value={cal.url}
                    onChange={(e) => {
                      const newUrls = [...urls];
                      newUrls[index].url = e.target.value;
                      setSettings({ ...settings, googleCalendarUrls: JSON.stringify(newUrls) });
                    }}
                    className="w-full flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      const newUrls = urls.filter((_: any, i: number) => i !== index);
                      setSettings({ ...settings, googleCalendarUrls: JSON.stringify(newUrls) });
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                    title="ลบปฏิทินนี้"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
      
      {/* Theme Settings below System Settings */}
      <div className="space-y-5 pt-8 animate-fade-in mt-8 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">ธีมและการแสดงผล</h3>
        
        <h4 className="font-semibold text-slate-900 dark:text-white pt-2">1. โหมดหน้าจอ (Dark / Light)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all ${settings.theme === 'dark' ? 'border-primary-500 bg-primary-500/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:bg-slate-800'}`}>
            <input type="radio" name="theme" value="dark" checked={settings.theme === 'dark'} onChange={handleChange} className="sr-only" />
            <div className="w-16 h-12 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <div className="w-8 h-4 bg-slate-50 dark:bg-slate-800 rounded"></div>
            </div>
            <span className="text-slate-900 dark:text-white font-medium">Dark Glassmorphism</span>
          </label>
          <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all ${settings.theme === 'light' ? 'border-primary-500 bg-primary-500/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:bg-slate-800'}`}>
            <input type="radio" name="theme" value="light" checked={settings.theme === 'light'} onChange={handleChange} className="sr-only" />
            <div className="w-16 h-12 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center">
              <div className="w-8 h-4 bg-white border border-slate-200 rounded"></div>
            </div>
            <span className="text-slate-900 dark:text-white font-medium">Light Minimal</span>
          </label>
        </div>

        <h4 className="font-semibold text-slate-900 dark:text-white pt-4">2. แบบตัวอักษร (Typography)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'prompt', name: 'Prompt', desc: 'ทันสมัย อ่านง่าย' },
            { id: 'sarabun', name: 'Sarabun', desc: 'มาตรฐานราชการ' },
            { id: 'kanit', name: 'Kanit', desc: 'ทรงเหลี่ยม เป็นทางการ' },
            { id: 'niramit', name: 'Niramit', desc: 'สวยงาม คลาสสิก' },
          ].map(font => (
            <label key={font.id} className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${settings.systemFont === font.id ? 'border-primary-500 bg-primary-500/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:bg-slate-800'}`}>
              <input type="radio" name="systemFont" value={font.id} checked={settings.systemFont === font.id} onChange={handleChange} className="sr-only" />
              <span className={`text-slate-900 dark:text-white font-medium text-lg`} style={{ fontFamily: `var(--font-${font.id})` }}>{font.name}</span>
              <span className="text-xs text-slate-500">{font.desc}</span>
            </label>
          ))}
        </div>

        <h4 className="font-semibold text-slate-900 dark:text-white pt-4">3. สีประจำระบบ (Primary Color)</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { id: 'indigo', name: 'Indigo', color: 'bg-indigo-500' },
            { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500' },
            { id: 'ocean', name: 'Ocean', color: 'bg-sky-500' },
            { id: 'rose', name: 'Rose', color: 'bg-rose-500' },
            { id: 'custom', name: 'สีแต่งเอง', color: 'bg-slate-300 dark:bg-slate-700' },
          ].map(c => (
            <label key={c.id} className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${settings.systemColor === c.id ? 'border-primary-500 bg-primary-500/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:bg-slate-800'}`}>
              <input type="radio" name="systemColor" value={c.id} checked={settings.systemColor === c.id} onChange={handleChange} className="sr-only" />
              <div className={`w-8 h-8 rounded-full ${c.color} shadow-md`}></div>
              <span className="text-slate-900 dark:text-white font-medium text-xs text-center">{c.name}</span>
            </label>
          ))}
        </div>

        {settings.systemColor === 'custom' && (
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mt-2 flex items-center space-x-4 animate-fade-in">
            <div>
              <label htmlFor="customPrimaryColorHex" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">เลือกสีที่ต้องการ (Custom Hex)</label>
              <div className="flex items-center space-x-3">
                <input id="customPrimaryColorPicker" type="color" name="customPrimaryColor" aria-label="เลือกสีแต่งเอง" value={settings.customPrimaryColor || '#6366f1'} onChange={handleChange} className="w-12 h-12 rounded cursor-pointer border-0 p-0" />
                <input id="customPrimaryColorHex" type="text" name="customPrimaryColor" aria-label="รหัสสี Hex แต่งเอง" value={settings.customPrimaryColor || '#6366f1'} onChange={handleChange} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-900 dark:text-white uppercase font-mono w-28" />
              </div>
            </div>
          </div>
        )}

        <h4 className="font-semibold text-slate-900 dark:text-white pt-4">4. ความโค้งมน (Border Radius)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'sharp', name: 'เหลี่ยม (Sharp)', shapeClass: 'rounded-none' },
            { id: 'rounded', name: 'โค้งมน (Rounded)', shapeClass: 'rounded-lg' },
            { id: 'pill', name: 'แคปซูล (Pill)', shapeClass: 'rounded-full' },
          ].map(r => (
            <label key={r.id} className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all ${settings.borderRadius === r.id ? 'border-primary-500 bg-primary-500/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:bg-slate-800'}`}>
              <input type="radio" name="borderRadius" value={r.id} checked={settings.borderRadius === r.id} onChange={handleChange} className="sr-only" />
              <div className={`w-20 h-10 bg-primary-500 ${r.shapeClass}`}></div>
              <span className="text-slate-900 dark:text-white font-medium text-sm">{r.name}</span>
            </label>
          ))}
        </div>

        <h4 className="font-semibold text-slate-900 dark:text-white pt-4">5. สไตล์พื้นผิว (Surface Style)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'flat', name: 'เรียบแบน (Flat)' },
            { id: 'shadow', name: 'มีเงา (Shadow)' },
            { id: 'glass', name: 'กระจกฝ้า (Glass)' },
          ].map(s => (
            <label key={s.id} className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${settings.surfaceStyle === s.id ? 'border-primary-500 bg-primary-500/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:bg-slate-800'}`}>
              <input type="radio" name="surfaceStyle" value={s.id} checked={settings.surfaceStyle === s.id} onChange={handleChange} className="sr-only" />
              <span className="text-slate-900 dark:text-white font-medium text-sm">{s.name}</span>
            </label>
          ))}
        </div>
        <h4 className="font-semibold text-slate-900 dark:text-white pt-4">6. ตั้งค่าการแจ้งเตือน (Notifications)</h4>
        
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mt-2 animate-fade-in space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">ตำแหน่งป๊อปอัปแจ้งเตือน (Toast Position)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'top-right', name: 'มุมบนขวา' },
                { id: 'top-center', name: 'ตรงกลางด้านบน' },
                { id: 'top-left', name: 'มุมบนซ้าย' },
                { id: 'bottom-right', name: 'มุมล่างขวา' },
                { id: 'bottom-center', name: 'ตรงกลางด้านล่าง' },
                { id: 'bottom-left', name: 'มุมล่างซ้าย' },
              ].map(pos => (
                <label key={pos.id} className={`cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 transition-all text-sm ${settings.toastPosition === pos.id || (!settings.toastPosition && pos.id === 'top-right') ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                  <input type="radio" name="toastPosition" value={pos.id} checked={settings.toastPosition === pos.id || (!settings.toastPosition && pos.id === 'top-right')} onChange={handleChange} className="sr-only" />
                  {pos.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">รูปแบบป๊อปอัป (Toast Theme)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'light', name: 'สว่าง (Light)', icon: 'fa-sun' },
                { id: 'dark', name: 'มืด (Dark)', icon: 'fa-moon' },
              ].map(theme => (
                <label key={theme.id} className={`cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 transition-all text-sm ${settings.toastTheme === theme.id || (!settings.toastTheme && theme.id === 'light') ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                  <input type="radio" name="toastTheme" value={theme.id} checked={settings.toastTheme === theme.id || (!settings.toastTheme && theme.id === 'light')} onChange={handleChange} className="sr-only" />
                  <i className={`fa-solid ${theme.icon}`}></i> {theme.name}
                </label>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
