'use client';

import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import SystemSettingsForm from '../components/SystemSettingsForm';

export default function ThemeSettingsView() {
  const [settings, setSettings] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load settings on mount (we will just mock this for now or rely on the form)
  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked.toString() : e.target.value;
    setSettings({ ...settings, [e.target.name]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('ไฟล์ภาพต้องมีขนาดไม่เกิน 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, systemLogo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'ไม่สามารถบันทึกการตั้งค่าได้');
      }

      toast.success('บันทึกการตั้งค่าธีมเรียบร้อยแล้ว');
      window.dispatchEvent(new CustomEvent('eprofile-theme-change', { detail: settings }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ไม่สามารถบันทึกการตั้งค่าได้');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
          <i className="fa-solid fa-palette text-lg"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            ดีไซน์และธีม (Theme & Branding)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ตั้งค่ารูปแบบการแสดงผล สีสัน โลโก้ และธีมของระบบ
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        {settings ? (
          <SystemSettingsForm
            settings={settings}
            setSettings={setSettings}
            handleChange={handleChange}
            handleLogoUpload={handleLogoUpload}
            fileInputRef={fileInputRef}
            showLayoutOptions={true}
          />
        ) : (
          <div className="flex justify-center items-center h-32">
            <i className="fa-solid fa-spinner fa-spin text-primary-500 text-2xl"></i>
          </div>
        )}
        <div className="flex justify-end border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
          <button type="submit" disabled={isSaving} className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold">
            {isSaving ? <i className="fa-solid fa-circle-notch fa-spin mr-2" /> : <i className="fa-solid fa-save mr-2" />}
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าธีม'}
          </button>
        </div>
      </form>

      {/* ─── NEXTADMIN HQ THEME LIVE PREVIEW ───────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5750F1]/10 flex items-center justify-center text-[#5750F1]">
              <i className="fa-solid fa-desktop text-base"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>ตัวอย่างอินเทอร์เฟซ NextAdmin HQ (Live Preview)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#5750F1] text-white">NextAdmin v2</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                การแสดงผลองค์ประกอบ UI และการตอบสนองตามธีมระบบปัจจุบัน
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <i className="fa-solid fa-circle-check mr-1.5"></i>เปิดใช้งานแล้ว
          </span>
        </div>

        {/* Live Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <i className="fa-solid fa-users text-lg"></i>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                +12.5% <i className="fa-solid fa-arrow-up text-[10px]"></i>
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">บุคลากรทั้งหมด</span>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">3,450 คน</h4>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <i className="fa-solid fa-building text-lg"></i>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                100% <i className="fa-solid fa-check text-[10px]"></i>
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">หน่วยงานในสังกัด</span>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">42 หน่วยงาน</h4>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <i className="fa-solid fa-file-signature text-lg"></i>
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                8 รายการ
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">คำร้องรออนุมัติ</span>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">18 คำร้อง</h4>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <i className="fa-solid fa-shield-halved text-lg"></i>
              </div>
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full">
                ปกติ
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">สถานะความปลอดภัย</span>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">100% Secure</h4>
            </div>
          </div>
        </div>

        {/* Live UI Controls & Badges Preview */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-4">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            ปุ่มและองค์ประกอบดีไซน์ (NextAdmin Components & Controls)
          </h4>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-sm transition-all">
              <i className="fa-solid fa-plus mr-1.5"></i> Primary Button
            </button>
            <button type="button" className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all">
              Secondary Button
            </button>
            <button type="button" className="px-4 py-2 rounded-xl border border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-500/10 text-xs font-bold transition-all">
              Outline Button
            </button>
            <span className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-bold border border-primary-500/20">
              NextAdmin Badge
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
              Active Status
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
