'use client';

import React, { useState, useEffect, useRef } from 'react';
import IDBadge from '../../components/badges/IDBadge';
import BadgeCanvasEditor, { CanvasElement } from '../../components/badges/BadgeCanvasEditor';
import DepartmentsManager from '../../components/DepartmentsManager';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('system');
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<any>({
    systemName: 'eProfile System',
    organizationName: 'กระทรวงกลาโหม',
    organizationAddress: '',
    organizationPhone: '',
    cardTermsConditions: 'หากเก็บได้กรุณาส่งคืนตามที่อยู่ด้านบน',
    allowPublicView: 'true',
    theme: 'dark',
    lineNotifyToken: '',
    enableLineNotify: 'false',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    enableEmailNotify: 'false',
    systemFont: 'prompt',
    systemColor: 'indigo',
    customPrimaryColor: '#6366f1',
    borderRadius: 'rounded',
    surfaceStyle: 'glass',
    layoutDensity: 'comfortable',
    badgeTemplate: 'classic',
    badgeColorMode: 'auto',
    badgeCustomColor: '#4f46e5',
    badgeShowBloodType: 'true',
    badgeShowBarcode: 'true',
    badgeCanvasConfig: '[]',
    colorCommissioned: '#dc2626',
    colorNonCommissioned: '#d97706',
    colorConscript: '#16a34a',
    personnelTypes: '["นายทหารสัญญาบัตร", "นายทหารประทวน", "พนักงานราชการ", "ลูกจ้าง", "ทหารกองประจำการ"]',
    statusList: '["ปฏิบัติงานปกติ", "ลาพักผ่อน", "ลาป่วย", "ราชการ", "ปลดออกจากกองประจำการ"]'
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (!data.error && Object.keys(data).length > 0) {
          setSettings((prev: any) => ({ ...prev, ...data }));
        }
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_HEIGHT = 200; // Limit logo height
          const scaleSize = MAX_HEIGHT / img.height;
          canvas.height = MAX_HEIGHT;
          canvas.width = img.width * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/png');
          setSettings({ ...settings, systemLogo: base64 });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.db')) {
      alert('กรุณาอัปโหลดไฟล์ฐานข้อมูล .db เท่านั้น');
      return;
    }

    if (!confirm('คำเตือน: การกู้คืนฐานข้อมูลจะนำข้อมูลจากไฟล์ทับข้อมูลปัจจุบันทั้งหมด และข้อมูลที่ไม่ได้สำรองไว้จะหายไป ยืนยันที่จะดำเนินการต่อหรือไม่?')) {
      if (restoreFileInputRef.current) restoreFileInputRef.current.value = '';
      return;
    }

    setIsRestoring(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/restore', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'กู้คืนฐานข้อมูลสำเร็จ ระบบกำลังเริ่มใหม่...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการกู้คืนฐานข้อมูล');
        setIsRestoring(false);
      }
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      setIsRestoring(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked.toString() : e.target.value;
    setSettings({ ...settings, [e.target.name]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setMessage({ text: 'บันทึกการตั้งค่าเรียบร้อยแล้ว', type: 'success' });
        // Immediately apply theme
        document.documentElement.className = settings.theme;
        localStorage.setItem('theme', settings.theme);
      } else {
        setMessage({ text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ', type: 'error' });
    }
    setIsSaving(false);
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const testLineNotify = async () => {
    if (!settings.lineNotifyToken) {
      setMessage({ text: 'กรุณากรอก Token ก่อนทดสอบ', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return;
    }

    // We can simulate an API call here, or just save it first.
    setMessage({ text: 'ทดสอบส่งข้อความ (ฟังก์ชันนี้ยังไม่ได้ต่อ API ทดสอบตรง)', type: 'success' });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  return (
    <div className="pb-12 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">ตั้งค่าระบบ (System Settings)</h2>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 flex items-center ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
          <i className={`fa-solid ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-3 text-xl`}></i>
          {message.text}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4 text-primary-500"></i>
          <p>กำลังโหลดการตั้งค่า...</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 space-y-2">
            {[
              { id: 'system', name: 'ระบบทั่วไป', icon: 'fa-desktop' },
              { id: 'theme', name: 'ธีมและการแสดงผล', icon: 'fa-palette' },
              { id: 'badge', name: 'ออกแบบบัตร (Badge)', icon: 'fa-id-badge' },
              { id: 'dropdowns', name: 'จัดการตัวเลือก', icon: 'fa-list' },
              { id: 'departments', name: 'หน่วยงาน', icon: 'fa-sitemap' },
              { id: 'line', name: 'LINE Bot (Messaging API)', icon: 'fa-comment-dots' },
              { id: 'mail', name: 'Email แจ้งเตือน', icon: 'fa-envelope' },
              { id: 'maintenance', name: 'บำรุงรักษาระบบ', icon: 'fa-tools' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center ${activeTab === tab.id ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
              >
                <i className={`fa-solid ${tab.icon} w-6`}></i>
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-xl">
            {activeTab === 'departments' ? (
              <DepartmentsManager />
            ) : (
            <form onSubmit={handleSave} className="space-y-6">

              {activeTab === 'system' && (
                <div className="space-y-5 animate-fade-in">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">ระบบทั่วไป</h3>

                  {/* System Logo Upload */}
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
                        <p className="text-sm text-slate-500 dark:text-slate-400">รูปภาพโลโก้ที่จะแสดงบริเวณเมนูด้านซ้ายและแถบด้านบนสุด รองรับ PNG, JPG ขนาดไม่เกิน 2MB (ระบบจะย่อขนาดให้อัตโนมัติ)</p>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-900 dark:text-white text-sm font-medium rounded-lg transition-colors flex items-center">
                          <i className="fa-solid fa-upload mr-2"></i> เลือกไฟล์รูปภาพ
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 text-sm mb-1">ชื่อระบบ (System Name)</label>
                    <input type="text" name="systemName" value={settings.systemName} onChange={handleChange} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 text-sm mb-1">ชื่อองค์กร (Organization Name)</label>
                    <input type="text" name="organizationName" value={settings.organizationName} onChange={handleChange} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 text-sm mb-1">ที่อยู่หน่วยงาน (Organization Address)</label>
                    <input type="text" name="organizationAddress" value={settings.organizationAddress || ''} onChange={handleChange} placeholder="กรอกที่อยู่หน่วยงาน..." className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 text-sm mb-1">เบอร์โทรศัพท์หน่วยงาน (Organization Phone)</label>
                    <input type="text" name="organizationPhone" value={settings.organizationPhone || ''} onChange={handleChange} placeholder="กรอกเบอร์โทรศัพท์หน่วยงาน..." className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 text-sm mb-1">ข้อกำหนดหลังบัตร / หมายเหตุ (Terms and Conditions)</label>
                    <textarea name="cardTermsConditions" value={settings.cardTermsConditions || ''} onChange={handleChange as any} placeholder="เช่น หากเก็บได้กรุณาส่งคืน..." rows={2} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white resize-none" />
                  </div>
                  <div className="flex items-center space-x-3 pt-2">
                    <input type="checkbox" name="allowPublicView" checked={settings.allowPublicView === 'true'} onChange={handleChange} id="allowPublicView" className="w-4 h-4 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-800" />
                    <label htmlFor="allowPublicView" className="text-slate-700 dark:text-slate-300 text-sm">อนุญาตให้บุคคลภายนอกดูทำเนียบบุคลากรได้โดยไม่ต้อง Login</label>
                  </div>
                </div>
              )}

              {activeTab === 'theme' && (
                <div className="space-y-5 animate-fade-in">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">1. โหมดหน้าจอ (Dark / Light)</h3>
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

                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 pt-4">2. แบบตัวอักษร (Typography)</h3>
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

                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 pt-4">3. สีประจำระบบ (Primary Color)</h3>
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
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">เลือกสีที่ต้องการ (Custom Hex)</label>
                        <div className="flex items-center space-x-3">
                          <input type="color" name="customPrimaryColor" value={settings.customPrimaryColor} onChange={handleChange} className="w-12 h-12 rounded cursor-pointer border-0 p-0" />
                          <input type="text" name="customPrimaryColor" value={settings.customPrimaryColor} onChange={handleChange} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-900 dark:text-white uppercase font-mono w-28" />
                        </div>
                      </div>
                      <div className="flex-1 text-sm text-slate-500 dark:text-slate-400">
                        * สีที่คุณเลือกจะถูกนำไปสร้างเป็นชุดสี (Palette) สำหรับใช้กับปุ่มและกรอบต่างๆ ในระบบอัตโนมัติ
                      </div>
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 pt-4">4. ความโค้งมน (Border Radius)</h3>
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

                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 pt-4">5. สไตล์พื้นผิว (Surface Style)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'flat', name: 'เรียบแบน (Flat)', desc: 'ไม่มีเงา โหลดเร็ว' },
                      { id: 'shadow', name: 'มีเงา (Shadow)', desc: 'ลอยขึ้นมา มีมิติ' },
                      { id: 'glass', name: 'กระจกฝ้า (Glassmorphism)', desc: 'หรูหรา โปร่งแสง' },
                    ].map(s => (
                      <label key={s.id} className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${settings.surfaceStyle === s.id ? 'border-primary-500 bg-primary-500/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:bg-slate-800'}`}>
                        <input type="radio" name="surfaceStyle" value={s.id} checked={settings.surfaceStyle === s.id} onChange={handleChange} className="sr-only" />
                        <span className="text-slate-900 dark:text-white font-medium text-sm">{s.name}</span>
                        <span className="text-xs text-slate-500 text-center">{s.desc}</span>
                      </label>
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 pt-4">6. ความหนาแน่นของเลย์เอาต์ (Layout Density)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'comfortable', name: 'สบายตา (Comfortable)', desc: 'มีช่องว่างกว้างขวาง อ่านง่าย' },
                      { id: 'compact', name: 'กระชับ (Compact)', desc: 'ลดช่องว่าง เพื่อแสดงข้อมูลได้มากขึ้น' },
                    ].map(d => (
                      <label key={d.id} className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${settings.layoutDensity === d.id ? 'border-primary-500 bg-primary-500/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:bg-slate-800'}`}>
                        <input type="radio" name="layoutDensity" value={d.id} checked={settings.layoutDensity === d.id} onChange={handleChange} className="sr-only" />
                        <span className="text-slate-900 dark:text-white font-medium text-sm">{d.name}</span>
                        <span className="text-xs text-slate-500 text-center">{d.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'badge' && (
                <div className={`space-y-6 animate-fade-in flex flex-col ${settings.badgeTemplate === 'canvas' ? '' : 'xl:flex-row'} gap-8`}>
                  {/* Settings Form */}
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
                          <label className="block text-slate-500 dark:text-slate-400 text-sm mb-2">รูปแบบสีของบัตร (Color Mode)</label>
                          <select name="badgeColorMode" value={settings.badgeColorMode || 'auto'} onChange={handleChange} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500">
                            <option value="auto">เปลี่ยนสีตามชั้นยศ/ประเภท (Auto)</option>
                            <option value="custom">ใช้สีเดียวทั้งองค์กร (Custom Color)</option>
                          </select>
                        </div>

                        {settings.badgeColorMode === 'custom' && (
                          <div className="animate-fade-in">
                            <label className="block text-slate-500 dark:text-slate-400 text-sm mb-2">เลือกสีหลัก (Primary Color)</label>
                            <div className="flex items-center space-x-3">
                              <input type="color" name="badgeCustomColor" value={settings.badgeCustomColor || '#4f46e5'} onChange={handleChange} className="w-12 h-12 rounded cursor-pointer border-0 p-0" />
                              <span className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded">{settings.badgeCustomColor || '#4f46e5'}</span>
                            </div>
                          </div>
                        )}

                        <div className="pt-2 space-y-3">
                          <label className="block text-slate-500 dark:text-slate-400 text-sm mb-2">ข้อมูลที่ต้องการแสดง</label>
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" name="badgeShowBloodType" checked={settings.badgeShowBloodType !== 'false'} onChange={handleChange} id="badgeShowBloodType" className="w-4 h-4 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-800" />
                            <label htmlFor="badgeShowBloodType" className="text-slate-700 dark:text-slate-300 text-sm cursor-pointer">แสดงกรุ๊ปเลือด</label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" name="badgeShowBarcode" checked={settings.badgeShowBarcode !== 'false'} onChange={handleChange} id="badgeShowBarcode" className="w-4 h-4 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-800" />
                            <label htmlFor="badgeShowBarcode" className="text-slate-700 dark:text-slate-300 text-sm cursor-pointer">แสดงแถบบาร์โค้ด (เฉพาะ Modern)</label>
                          </div>
                        </div>
                        <div className="pt-4 space-y-3 border-t border-slate-200 dark:border-slate-700">
                          <label className="block text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">สีประจำกลุ่มกำลังพล (Auto Mode)</label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-xs text-slate-500 block mb-1">นายทหารสัญญาบัตร</label>
                              <div className="flex items-center space-x-2">
                                <input type="color" name="colorCommissioned" value={settings.colorCommissioned || '#dc2626'} onChange={handleChange} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                                <span className="text-xs font-mono">{settings.colorCommissioned || '#dc2626'}</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-slate-500 block mb-1">นายทหารประทวน/ลูกจ้าง</label>
                              <div className="flex items-center space-x-2">
                                <input type="color" name="colorNonCommissioned" value={settings.colorNonCommissioned || '#d97706'} onChange={handleChange} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                                <span className="text-xs font-mono">{settings.colorNonCommissioned || '#d97706'}</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-slate-500 block mb-1">ทหารกองประจำการ</label>
                              <div className="flex items-center space-x-2">
                                <input type="color" name="colorConscript" value={settings.colorConscript || '#16a34a'} onChange={handleChange} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                                <span className="text-xs font-mono">{settings.colorConscript || '#16a34a'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Live Preview / Canvas Editor */}
                  {settings.badgeTemplate === 'canvas' ? (
                    <div className="w-full bg-slate-100 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                      <div className="w-full">
                        <BadgeCanvasEditor 
                          initialElements={settings.badgeCanvasConfig ? JSON.parse(settings.badgeCanvasConfig) : []}
                          onChange={(elements) => setSettings((prev: any) => ({ ...prev, badgeCanvasConfig: JSON.stringify(elements) }))}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full xl:w-auto flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 relative">
                      <div className="absolute top-6 flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl z-10">
                        <button
                          onClick={() => setPreviewSide('front')}
                          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${previewSide === 'front' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                          ด้านหน้า
                        </button>
                        <button
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
                            }}
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
                            }}
                            settings={settings}
                            isBack={true}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'line' && (
                <div className="space-y-5 animate-fade-in">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center">
                    <i className="fa-brands fa-line text-green-500 mr-2 text-xl"></i> LINE Bot (Messaging API)
                  </h3>
                  <div className="flex items-center space-x-3 pb-2">
                    <input type="checkbox" name="enableLineNotify" checked={settings.enableLineNotify === 'true'} onChange={handleChange} id="enableLineNotify" className="w-4 h-4 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-800" />
                    <label htmlFor="enableLineNotify" className="text-slate-700 dark:text-slate-300 font-medium">เปิดใช้งานการแจ้งเตือนผ่าน LINE Bot</label>
                  </div>
                  <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                      <i className="fa-solid fa-lock text-slate-500 mr-2"></i>
                      เนื่องจาก LINE Notify ถูกยกเลิกการให้บริการ ระบบจึงเปลี่ยนมาใช้ <strong>LINE Messaging API</strong> แทน
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      กรุณาตั้งค่า <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-primary-500">LINE_CHANNEL_ACCESS_TOKEN</code> และ <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-primary-500">LINE_USER_ID</code> ในไฟล์ <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">.env</code> บนเซิร์ฟเวอร์โดยตรง
                    </p>
                  </div>
                  <div className="pt-2">
                    <button type="button" onClick={testLineNotify} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-900 dark:text-white text-sm rounded-lg transition-colors">
                      ทดสอบการส่งข้อความ
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'mail' && (
                <div className="space-y-5 animate-fade-in">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center">
                    <i className="fa-solid fa-envelope text-blue-400 mr-2 text-xl"></i> Email (SMTP) แจ้งเตือน
                  </h3>
                  <div className="flex items-center space-x-3 pb-2">
                    <input type="checkbox" name="enableEmailNotify" checked={settings.enableEmailNotify === 'true'} onChange={handleChange} id="enableEmailNotify" className="w-4 h-4 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-800" />
                    <label htmlFor="enableEmailNotify" className="text-slate-700 dark:text-slate-300 font-medium">เปิดใช้งานการแจ้งเตือนผ่าน Email</label>
                  </div>
                  <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      <i className="fa-solid fa-lock text-slate-500 mr-2"></i>
                      เพื่อความปลอดภัยขั้นสูงสุด การตั้งค่า SMTP (Host, Port, User, Password) จะต้องตั้งค่าผ่านไฟล์ <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">.env</code> บนเซิร์ฟเวอร์เท่านั้น
                    </p>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700/50 pt-4 mt-2">
                    <label className="block text-slate-500 dark:text-slate-400 text-sm mb-1">อีเมลผู้รับการแจ้งเตือน (To:)</label>
                    <input type="email" name="notifyEmailTo" value={settings.notifyEmailTo} onChange={handleChange} placeholder="admin@yourdomain.com" className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white" />
                  </div>
                </div>
              )}

              {activeTab === 'dropdowns' && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center">
                    <i className="fa-solid fa-list text-purple-500 mr-2 text-xl"></i> จัดการรายการตัวเลือก (Dropdowns)
                  </h3>

                  <div className="space-y-4">
                    <label className="block text-slate-700 dark:text-slate-300 font-medium">1. ประเภทกำลังพล</label>
                    <p className="text-xs text-slate-500">คั่นแต่ละรายการด้วยเครื่องหมายคอมมา (,)</p>
                    <textarea
                      value={JSON.parse(settings.personnelTypes || '[]').join(', ')}
                      onChange={(e) => {
                        const arr = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                        setSettings({ ...settings, personnelTypes: JSON.stringify(arr) });
                      }}
                      className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white h-24 resize-none"
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <label className="block text-slate-700 dark:text-slate-300 font-medium">2. สถานะบุคลากร</label>
                    <p className="text-xs text-slate-500">คั่นแต่ละรายการด้วยเครื่องหมายคอมมา (,)</p>
                    <textarea
                      value={JSON.parse(settings.statusList || '[]').join(', ')}
                      onChange={(e) => {
                        const arr = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                        setSettings({ ...settings, statusList: JSON.stringify(arr) });
                      }}
                      className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white h-24 resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'maintenance' && (
                <div className="space-y-5 animate-fade-in">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center">
                    <i className="fa-solid fa-tools text-orange-500 mr-2 text-xl"></i> การบำรุงรักษาระบบ (Maintenance)
                  </h3>

                  <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-white">สำรองข้อมูลฐานข้อมูล (Backup Database)</h4>
                      <p className="text-sm text-slate-500 mt-1">ดาวน์โหลดไฟล์ฐานข้อมูล SQLite (dev.db) เพื่อเก็บรักษาเป็นตัวสำรอง</p>
                    </div>
                    <a
                      href="/api/backup"
                      target="_blank"
                      className="px-5 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium rounded-lg transition-colors whitespace-nowrap flex items-center"
                    >
                      <i className="fa-solid fa-download mr-2"></i> ดาวน์โหลด Backup
                    </a>
                  </div>

                  <div className="p-5 border border-red-200 dark:border-red-900/30 rounded-xl bg-red-50/50 dark:bg-red-900/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                    <div>
                      <h4 className="font-semibold text-red-800 dark:text-red-400">กู้คืนฐานข้อมูล (Restore Database)</h4>
                      <p className="text-sm text-red-600 dark:text-red-500/80 mt-1">อัปโหลดไฟล์ฐานข้อมูล (.db) เพื่อนำข้อมูลเดิมกลับมา <br/><span className="font-medium underline">คำเตือน</span>: ข้อมูลปัจจุบันจะถูกเขียนทับทั้งหมด</p>
                    </div>
                    <div>
                      <button
                        type="button"
                        disabled={isRestoring}
                        onClick={() => restoreFileInputRef.current?.click()}
                        className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors whitespace-nowrap flex items-center"
                      >
                        {isRestoring ? <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> : <i className="fa-solid fa-upload mr-2"></i>}
                        {isRestoring ? 'กำลังกู้คืน...' : 'อัปโหลดและกู้คืน'}
                      </button>
                      <input 
                        type="file" 
                        ref={restoreFileInputRef} 
                        onChange={handleRestore} 
                        accept=".db" 
                        className="hidden" 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700/50">
                <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all flex items-center">
                  {isSaving ? <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> : <i className="fa-solid fa-save mr-2"></i>}
                  บันทึกการตั้งค่า
                </button>
              </div>

            </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
