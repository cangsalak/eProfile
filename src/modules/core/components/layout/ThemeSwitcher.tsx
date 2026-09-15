'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { applyThemeSettings, ThemeSettings } from '@/modules/theme/lib/theme-manager';

interface ThemeSwitcherProps {
  systemSettings?: any;
}

export default function ThemeSwitcher({ systemSettings }: ThemeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSurface, setActiveSurface] = useState('claymorphism');
  const [activeColor, setActiveColor] = useState('nextadmin');
  const [activeFont, setActiveFont] = useState('prompt');
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync state from document or local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const surface = document.documentElement.getAttribute('data-surface') || localStorage.getItem('surfaceStyle') || 'shadow';
      const theme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'nextadmin';
      const font = document.documentElement.getAttribute('data-font') || localStorage.getItem('systemFont') || 'prompt';
      setActiveSurface(surface);
      setActiveColor(theme);
      setActiveFont(font);
    }

    const handleThemeChange = () => {
      if (typeof window !== 'undefined') {
        setActiveSurface(document.documentElement.getAttribute('data-surface') || 'shadow');
        setActiveColor(document.documentElement.getAttribute('data-theme') || 'nextadmin');
        setActiveFont(document.documentElement.getAttribute('data-font') || 'prompt');
      }
    };

    window.addEventListener('eprofile-theme-change', handleThemeChange);
    return () => window.removeEventListener('eprofile-theme-change', handleThemeChange);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const saveSettingsAsync = async (newSettings: Partial<ThemeSettings>) => {
    setIsSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch {
      // Best-effort silent sync
    } finally {
      setIsSaving(false);
    }
  };

  const handleSurfaceChange = (surface: string) => {
    setActiveSurface(surface);
    applyThemeSettings({ surfaceStyle: surface });
    saveSettingsAsync({ surfaceStyle: surface });
  };

  const handleColorChange = (color: string, customHex?: string) => {
    setActiveColor(color);
    if (color === 'custom' && customHex) {
      applyThemeSettings({ systemColor: 'custom', customPrimaryColor: customHex });
      saveSettingsAsync({ systemColor: 'custom', customPrimaryColor: customHex });
    } else {
      applyThemeSettings({ systemColor: color });
      saveSettingsAsync({ systemColor: color });
    }
  };

  const handleFontChange = (font: string) => {
    setActiveFont(font);
    applyThemeSettings({ systemFont: font });
    saveSettingsAsync({ systemFont: font });
  };

  const surfaces = [
    { id: 'claymorphism', name: 'Claymorphism 3D', icon: 'fa-cubes', desc: 'ดินน้ำมันดิจิทัล 3 มิติ นุ่มนวล เด้งดึ๋ง' },
    { id: 'neumorphism', name: 'Neumorphism', icon: 'fa-circle-half-stroke', desc: 'สัมผัส Soft UI แสงเงาคู่นูน/จม' },
    { id: 'glass', name: 'Glassmorphism', icon: 'fa-wand-magic-sparkles', desc: 'กระจกฝ้าโปร่งแสงล้ำสมัย' },
    { id: 'shadow', name: 'Modern Shadow', icon: 'fa-layer-group', desc: 'สไตล์โมเดิร์น คลาสสิก ยกระดับมิติ' },
    { id: 'flat', name: 'Flat Clean', icon: 'fa-square', desc: 'มินิมอล เรียบง่าย ไร้เงา' },
  ];

  const colorPresets = [
    { id: 'custom-violet', colorKey: 'custom', hex: '#8B5CF6', name: 'Vivid Violet', bg: 'bg-[#8B5CF6]' },
    { id: 'nextadmin', colorKey: 'nextadmin', name: 'NextAdmin Blue', bg: 'bg-[#5750F1]' },
    { id: 'custom-pink', colorKey: 'custom', hex: '#EC4899', name: 'Hot Pink', bg: 'bg-[#EC4899]' },
    { id: 'custom-blue', colorKey: 'custom', hex: '#0EA5E9', name: 'Sky Blue', bg: 'bg-[#0EA5E9]' },
    { id: 'emerald', colorKey: 'emerald', name: 'Emerald Green', bg: 'bg-[#10B981]' },
    { id: 'rose', colorKey: 'rose', name: 'Rose Red', bg: 'bg-[#F43F5E]' },
  ];

  const fonts = [
    { id: 'nunito', name: 'Nunito (3D มนกลม)' },
    { id: 'prompt', name: 'Prompt (มาตรฐาน)' },
    { id: 'sarabun', name: 'Sarabun (ทางการ)' },
    { id: 'plusJakarta', name: 'Plus Jakarta (สากล)' },
    { id: 'kanit', name: 'Kanit (โมเดิร์น)' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="เลือกธีมและสไตล์ดีไซน์ทั้งโปรเจกต์"
        title="เลือกดีไซน์และสไตล์ทั้งโปรเจกต์"
        className="size-10 rounded-lg border border-card-border bg-card-background text-icon-primary shadow-xs flex items-center justify-center hover:bg-background-gray-primary transition-all group"
      >
        <i className="fa-solid fa-wand-magic-sparkles text-sm text-primary-500 group-hover:scale-110 transition-transform"></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">
                <i className="fa-solid fa-palette"></i>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  เลือกดีไซน์ทั้งระบบ (Project-Wide)
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  เปลี่ยนสไตล์และแสดงผลทันทีทุกหน้า
                </p>
              </div>
            </div>
            {isSaving && (
              <span className="text-[10px] text-primary-600 dark:text-primary-400 font-bold flex items-center gap-1">
                <i className="fa-solid fa-circle-notch fa-spin"></i> บันทึก...
              </span>
            )}
          </div>

          <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin">
            {/* Section 1: Surface Styles */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  1. สไตล์พื้นผิวมิติ (Surface Style)
                </span>
                <span className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase">
                  {activeSurface}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {surfaces.map((s) => {
                  const isSelected = activeSurface === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSurfaceChange(s.id)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500/10 dark:bg-primary-500/15 text-primary-700 dark:text-primary-300 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                          <i className={`fa-solid ${s.icon} text-xs`}></i>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{s.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{s.desc}</p>
                        </div>
                      </div>
                      {isSelected && <i className="fa-solid fa-circle-check text-primary-500 text-sm shrink-0 ml-2"></i>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Color Presets */}
            <div>
              <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                2. ชุดสีหลักประจำระบบ (Primary Color)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {colorPresets.map((c) => {
                  const isSelected = c.colorKey === 'custom'
                    ? activeColor === 'custom' && (localStorage.getItem('customPrimaryColor') === c.hex || (!localStorage.getItem('customPrimaryColor') && c.hex === '#8B5CF6'))
                    : activeColor === c.colorKey;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleColorChange(c.colorKey, c.hex)}
                      className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500/10 ring-2 ring-primary-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full ${c.bg} shadow-sm shrink-0 flex items-center justify-center text-white text-[10px]`}>
                        {isSelected && <i className="fa-solid fa-check"></i>}
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Typography */}
            <div>
              <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                3. ฟอนต์ตัวอักษร (Typography)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {fonts.map((f) => {
                  const isSelected = activeFont === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleFontChange(f.id)}
                      className={`p-2 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500/10 text-primary-700 dark:text-primary-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="truncate">{f.name}</span>
                      {isSelected && <i className="fa-solid fa-check text-primary-500 text-[10px] ml-1"></i>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Navigation to Theme Module */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-center">
            <Link
              href="/modules/theme"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center justify-center gap-1.5"
            >
              <span>เปิดสตูดิโอปรับแต่งธีมแบบละเอียด (Theme Studio)</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
