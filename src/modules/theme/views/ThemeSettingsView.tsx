'use client';

import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import SystemSettingsForm from '../components/SystemSettingsForm';
import { applyThemeSettings } from '../lib/theme-manager';

export default function ThemeSettingsView() {
  const [settings, setSettings] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [squishState, setSquishState] = useState(false);
  const [sampleInput, setSampleInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load settings on mount
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        applyThemeSettings(data);
      })
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked.toString() : e.target.value;
    const updated = { ...settings, [e.target.name]: value };
    setSettings(updated);
    // Apply real-time preview instantly across the entire application
    applyThemeSettings({ ...updated, userExplicit: e.target.name === 'theme' });
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
        const updated = { ...settings, systemLogo: reader.result };
        setSettings(updated);
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
      applyThemeSettings(settings);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ไม่สามารถบันทึกการตั้งค่าได้');
    } finally {
      setIsSaving(false);
    }
  };

  const isClay = settings?.surfaceStyle === 'claymorphism' || !settings?.surfaceStyle;
  const isNeu = settings?.surfaceStyle === 'neumorphism';

  return (
    <div className="relative space-y-8 animate-fade-in pb-20 font-sans">
      {/* ─── FLOATING 3D AMBIENT BLOBS BACKGROUND ───────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10 opacity-70 dark:opacity-40">
        <div className="absolute h-[55vh] w-[55vh] -top-[12%] -left-[10%] rounded-full bg-[#7C3AED]/15 blur-3xl animate-clay-float" />
        <div className="absolute h-[50vh] w-[50vh] top-[25%] -right-[12%] rounded-full bg-[#DB2777]/15 blur-3xl animate-clay-float" style={{ animationDelay: '2.5s' }} />
        <div className="absolute h-[45vh] w-[45vh] -bottom-[10%] left-[20%] rounded-full bg-[#0EA5E9]/15 blur-3xl animate-clay-float" style={{ animationDelay: '5s' }} />
      </div>

      {/* ─── THEME SETTINGS CONFIGURATION CARD (Glass-Clay Floating Container) ── */}
      <div className="relative rounded-[36px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-clay-card p-6 sm:p-8 transition-all duration-300">
        <form onSubmit={handleSave}>
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
            <div className="flex justify-center items-center h-40">
              <div className="w-12 h-12 rounded-full bg-primary-500/20 shadow-clay-orb flex items-center justify-center animate-spin">
                <i className="fa-solid fa-circle-notch text-primary-600 text-xl"></i>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200/80 dark:border-slate-800/80 pt-6 mt-8 gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <i className="fa-solid fa-wand-magic-sparkles text-primary-500"></i>
              <span>การตั้งค่าทั้งหมดจะถูกบันทึกและซิงค์แบบ Real-time ทั่วระบบ</span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3.5 rounded-[20px] bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white font-black text-sm tracking-wide shadow-clay-button hover:shadow-clay-button-hover active:scale-[0.92] active:shadow-clay-pressed transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin text-sm" />
                  <span>กำลังบันทึกข้อมูล...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk text-sm" />
                  <span>บันทึกการตั้งค่าระบบและธีม</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ─── HIGH-FIDELITY CLAYMORPHISM LIVE PREVIEW SHOWCASE ──────────────── */}
      <div className={`relative p-6 sm:p-10 rounded-[40px] transition-all duration-500 ${
        isClay
          ? 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-clay-surface'
          : isNeu
          ? 'bg-[#E0E5EC] dark:bg-[#1a222c] neu-extruded border-transparent'
          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm'
      }`}>
        {/* Showcase Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/60 dark:border-slate-800/60 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] shadow-clay-orb flex items-center justify-center text-white text-xl animate-clay-breathe shrink-0">
              <i className="fa-solid fa-cubes-stacked"></i>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#332F3A] dark:text-white">
                  High-Fidelity Claymorphic Live Studio
                </h3>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-[#DB2777] to-[#7C3AED] text-white shadow-sm">
                  Digital Clay 3D
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#635F69] dark:text-slate-400 mt-1">
                ระบบจำลองมิติทางกายภาพแสงเงา 4 ชั้น (4-Layer Shadow Architecture) นุ่มนวล เด้งดึ๋ง
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>พร้อมแสดงผลสด (Live)</span>
            </span>
          </div>
        </div>

        {/* ─── 4-COLUMN CLAY STAT CARDS (Convex Marshmallow Bulge) ──────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          {/* Stat 1 */}
          <div className="p-6 rounded-[32px] bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl shadow-clay-card hover:-translate-y-2 hover:shadow-clay-card-hover transition-all duration-400 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 shadow-clay-orb flex items-center justify-center text-white text-lg">
                <i className="fa-solid fa-users"></i>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-sm">
                +12.5% <i className="fa-solid fa-arrow-up text-[10px]"></i>
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-[#635F69] dark:text-slate-400 block">กำลังพลทั้งหมด</span>
              <h4 className="text-3xl font-black text-[#332F3A] dark:text-white mt-0.5">3,450 นาย</h4>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="p-6 rounded-[32px] bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl shadow-clay-card hover:-translate-y-2 hover:shadow-clay-card-hover transition-all duration-400 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 shadow-clay-orb flex items-center justify-center text-white text-lg">
                <i className="fa-solid fa-building"></i>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-sm">
                100% <i className="fa-solid fa-check text-[10px]"></i>
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-[#635F69] dark:text-slate-400 block">หน่วยงานในสังกัด</span>
              <h4 className="text-3xl font-black text-[#332F3A] dark:text-white mt-0.5">42 หน่วย</h4>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="p-6 rounded-[32px] bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl shadow-clay-card hover:-translate-y-2 hover:shadow-clay-card-hover transition-all duration-400 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-clay-orb flex items-center justify-center text-white text-lg">
                <i className="fa-solid fa-file-signature"></i>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 shadow-sm">
                8 รายการ
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-[#635F69] dark:text-slate-400 block">คำร้องขอลา</span>
              <h4 className="text-3xl font-black text-[#332F3A] dark:text-white mt-0.5">18 รายการ</h4>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="p-6 rounded-[32px] bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl shadow-clay-card hover:-translate-y-2 hover:shadow-clay-card-hover transition-all duration-400 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 shadow-clay-orb flex items-center justify-center text-white text-lg">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 shadow-sm">
                ปกติ
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-[#635F69] dark:text-slate-400 block">ความปลอดภัย</span>
              <h4 className="text-3xl font-black text-[#332F3A] dark:text-white mt-0.5">100% Secure</h4>
            </div>
          </div>
        </div>

        {/* ─── TACTILE SQUISH BUTTONS & RECESSED INPUTS ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Interactive Tactile Controls */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-[32px] bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl shadow-clay-card space-y-6">
            <h4 className="text-xs font-black text-[#332F3A] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-hand-pointer text-primary-500"></i>
              <span>ระบบปฏิสัมพันธ์และการตอบสนองแบบ Clay Squish Physics</span>
            </h4>

            {/* Tactile Buttons Row */}
            <div className="flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => setSquishState(!squishState)}
                className={`px-6 py-3.5 rounded-[20px] font-black text-xs sm:text-sm transition-all duration-200 flex items-center gap-2.5 cursor-pointer select-none ${
                  squishState
                    ? 'shadow-clay-pressed scale-[0.92] bg-[#EFEBF5] dark:bg-slate-800 text-primary-600 dark:text-primary-400'
                    : 'shadow-clay-button hover:shadow-clay-button-hover hover:-translate-y-1 active:scale-[0.92] active:shadow-clay-pressed bg-white dark:bg-slate-800 text-[#332F3A] dark:text-white'
                }`}
              >
                <i className={`fa-solid ${squishState ? 'fa-circle-check text-emerald-500 text-base' : 'fa-wand-magic-sparkles text-primary-500'}`}></i>
                <span>{squishState ? 'สถานะ: ยุบตัว (Squished / Pressed)' : 'กดปุ่มเพื่อทดสอบ Squish Feedback'}</span>
              </button>

              <button
                type="button"
                className="px-6 py-3.5 rounded-[20px] bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white font-black text-xs sm:text-sm shadow-clay-button hover:shadow-clay-button-hover hover:-translate-y-1 active:scale-[0.92] active:shadow-clay-pressed transition-all duration-200 cursor-pointer flex items-center gap-2"
              >
                <i className="fa-solid fa-gem"></i>
                <span>Candy Violet</span>
              </button>

              <button
                type="button"
                className="px-5 py-3.5 rounded-[20px] bg-gradient-to-br from-[#F472B6] to-[#DB2777] text-white font-black text-xs sm:text-sm shadow-clay-button hover:shadow-clay-button-hover hover:-translate-y-1 active:scale-[0.92] active:shadow-clay-pressed transition-all duration-200 cursor-pointer flex items-center gap-2"
              >
                <i className="fa-solid fa-heart"></i>
                <span>Hot Pink</span>
              </button>
            </div>

            {/* Recessed Clay Input Field */}
            <div className="space-y-2 pt-2">
              <label htmlFor="clayInputDemo" className="block text-xs font-bold text-[#332F3A] dark:text-slate-300">
                ช่องกรอกข้อความแบบ Recessed Concave Well
              </label>
              <div className="relative">
                <input
                  id="clayInputDemo"
                  type="text"
                  value={sampleInput}
                  onChange={(e) => setSampleInput(e.target.value)}
                  placeholder="พิมพ์ข้อความทดสอบมิติการกดลึกแบบดินเหนียวดิจิทัล..."
                  className="w-full px-5 py-4 rounded-[20px] bg-[#EFEBF5] dark:bg-slate-900 shadow-clay-pressed text-[#332F3A] dark:text-white placeholder-[#635F69] text-xs sm:text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all duration-200"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-500 text-sm">
                  <i className="fa-solid fa-shapes"></i>
                </div>
              </div>
            </div>

            {/* Candy Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 shadow-sm flex items-center gap-1.5">
                <i className="fa-solid fa-circle text-[8px] text-violet-500"></i>
                High-Fidelity 4-Layer Shadows
              </span>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 shadow-sm flex items-center gap-1.5">
                <i className="fa-solid fa-circle text-[8px] text-pink-500"></i>
                WCAG AA Compliant (#332F3A)
              </span>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 shadow-sm flex items-center gap-1.5">
                <i className="fa-solid fa-circle text-[8px] text-sky-500"></i>
                Zero Sharp Edges
              </span>
            </div>
          </div>

          {/* Abstract 3D Marshmallow Composition */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl shadow-clay-card flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#635F69] dark:text-slate-400 mb-4">
              Digital Clay World
            </span>

            {/* Nested Bouncy Orbs */}
            <div className="relative w-40 h-40 flex items-center justify-center my-3">
              {/* Outer Clay Ring */}
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-violet-100 to-pink-100 dark:from-slate-800 dark:to-slate-900 shadow-clay-card flex items-center justify-center">
                {/* Inner Recessed Well */}
                <div className="w-28 h-28 rounded-full bg-[#EFEBF5] dark:bg-slate-950 shadow-clay-pressed flex items-center justify-center">
                  {/* Bouncy Floating Center Orb */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A78BFA] via-[#7C3AED] to-[#DB2777] shadow-clay-orb flex items-center justify-center text-white text-xl animate-clay-breathe cursor-pointer hover:scale-110 transition-transform duration-300">
                    <i className="fa-solid fa-cubes"></i>
                  </div>
                </div>
              </div>
            </div>

            <h5 className="text-sm font-black text-[#332F3A] dark:text-white mt-2">
              Tactile Soft Physics
            </h5>
            <p className="text-[11px] text-[#635F69] dark:text-slate-400 mt-1 max-w-[200px] leading-relaxed">
              จำลองมิติของเล่นไวนิลผิวด้าน สัมผัสฟูนุ่ม ไร้เหลี่ยมมุม 100%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
