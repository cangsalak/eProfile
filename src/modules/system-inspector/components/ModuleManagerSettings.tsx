'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ALL_SYSTEM_MODULES } from '@/lib/modules';
import { ModuleManifest, ModuleCategory } from '@/lib/modules/types';
import ConfirmModal from '@/components/common/ConfirmModal';

interface ModuleManagerSettingsProps {
  settings: any;
  setSettings: (newSettings: any) => void;
}

const CATEGORY_LABELS: Record<ModuleCategory | 'all', { label: string; icon: string }> = {
  all: { label: 'ทั้งหมด', icon: 'fa-cubes' },
  core: { label: 'ระบบหลัก (Core)', icon: 'fa-star' },
  hr: { label: 'งานกำลังพล (HR)', icon: 'fa-users' },
  operations: { label: 'การปฏิบัติการ', icon: 'fa-compass' },
  tools: { label: 'เครื่องมือและบริการ', icon: 'fa-wrench' },
  system: { label: 'ระบบและความปลอดภัย', icon: 'fa-shield-halved' },
};

export default function ModuleManagerSettings({ settings, setSettings }: ModuleManagerSettingsProps) {
  const [mainTab, setMainTab] = useState<'modules' | 'core_settings'>('modules');
  const [selectedCategory, setSelectedCategory] = useState<ModuleCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  // Dynamic modules state
  const [allModules, setAllModules] = useState<ModuleManifest[]>(ALL_SYSTEM_MODULES);
  const [customModules, setCustomModules] = useState<any[]>([]);
  
  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uninstallTarget, setUninstallTarget] = useState<ModuleManifest | null>(null);
  const [isUninstalling, setIsUninstalling] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const [isSavingCore, setIsSavingCore] = useState(false);

  const handleSaveCoreSettings = async () => {
    setIsSavingCore(true);
    try {
      await setSettings(settings);
      toast.success('บันทึกข้อมูลระบบและองค์กรเรียบร้อยแล้ว');
      window.dispatchEvent(new CustomEvent('eprofile-theme-change', { detail: settings }));
    } catch (err: any) {
      toast.error(err?.message || 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setIsSavingCore(false);
    }
  };

  // Load modules from server API (including dynamic installed modules)
  const fetchModules = async () => {
    try {
      const res = await fetch('/api/modules');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.modules)) {
          setAllModules(data.modules);
        }
        if (Array.isArray(data.customModules)) {
          setCustomModules(data.customModules);
        }
      }
    } catch (err) {
      console.error('Failed to load dynamic modules', err);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  // Parse enabled modules
  let enabledModuleIds: string[] = [];
  try {
    if (typeof settings.enabledModules === 'string') {
      enabledModuleIds = JSON.parse(settings.enabledModules);
    } else if (Array.isArray(settings.enabledModules)) {
      enabledModuleIds = settings.enabledModules;
    } else {
      enabledModuleIds = allModules.map(m => m.id);
    }
  } catch {
    enabledModuleIds = allModules.map(m => m.id);
  }

  const toggleModule = (mod: ModuleManifest) => {
    if (mod.isCore) return; // Core modules cannot be disabled

    let nextEnabled: string[];
    if (enabledModuleIds.includes(mod.id)) {
      nextEnabled = enabledModuleIds.filter(id => id !== mod.id);
    } else {
      nextEnabled = [...enabledModuleIds, mod.id];
    }

    setSettings({
      ...settings,
      enabledModules: JSON.stringify(nextEnabled),
    });
  };

  const handleInstallUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('กรุณาเลือกไฟล์ .zip ของโมดูล');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/modules/install', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'การติดตั้งล้มเหลว');
      }

      toast.success(data.message || 'ติดตั้งโมดูลสำเร็จ');
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Refresh list
      await fetchModules();

      // Automatically add to enabledModules state if not already
      if (data.manifest && !enabledModuleIds.includes(data.manifest.id)) {
        setSettings({
          ...settings,
          enabledModules: JSON.stringify([...enabledModuleIds, data.manifest.id]),
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการติดตั้งโมดูล');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUninstall = async () => {
    if (!uninstallTarget) return;

    setIsUninstalling(true);
    try {
      const res = await fetch(`/api/modules/${uninstallTarget.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ไม่สามารถถอนการติดตั้งได้');
      }

      toast.success(data.message || 'ถอนการติดตั้งสำเร็จ');
      setUninstallTarget(null);

      // Remove from enabledModuleIds
      const nextEnabled = enabledModuleIds.filter(id => id !== uninstallTarget.id);
      setSettings({
        ...settings,
        enabledModules: JSON.stringify(nextEnabled),
      });

      await fetchModules();
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการถอนการติดตั้ง');
    } finally {
      setIsUninstalling(false);
    }
  };

  const filteredModules = allModules.filter(mod => {
    const matchesCategory = selectedCategory === 'all' || mod.category === selectedCategory;
    const matchesSearch =
      mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mod.nameEn && mod.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (mod.description && mod.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      mod.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const enabledCount = allModules.filter(m => m.isCore || enabledModuleIds.includes(m.id)).length;
  const totalCount = allModules.length;

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-transparent border border-primary-200/50 dark:border-primary-900/40 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
              Modular Add-on Architecture
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <i className="fa-solid fa-puzzle-piece text-primary-500"></i>
            <span>จัดการส่วนเสริมและโมดูล (Module Management)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            เปิด/ปิดการทำงานของแต่ละส่วนเสริมในระบบ หรือติดตั้งโมดูลใหม่ด้วยการอัปโหลดไฟล์ ZIP เมนูและสิทธิ์จะถูกรวมเข้าสู่ระบบโดยอัตโนมัติ
          </p>
        </div>

        {/* Action Buttons & Counter */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <a
            href="/api/modules/template"
            download="sample-module-template.zip"
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            title="ดาวน์โหลดไฟล์โครงสร้างตัวอย่างสำหรับพัฒนาโมดูลใหม่"
          >
            <i className="fa-solid fa-file-arrow-down text-primary-500"></i>
            <span>เทมเพลตตัวอย่าง (.ZIP)</span>
          </a>

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-primary-500/25 flex items-center gap-2"
          >
            <i className="fa-solid fa-cloud-arrow-up"></i>
            <span>ติดตั้งโมดูล (.ZIP)</span>
          </button>

          {/* Counter Widget */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl shadow-sm ml-auto lg:ml-0">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-medium">เปิดใช้งาน</p>
              <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                {enabledCount} <span className="text-[10px] font-normal text-slate-400">/ {totalCount}</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/60 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <i className="fa-solid fa-cubes text-xs"></i>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Module Manager Tabs (Modules vs Core Organization Info) ───── */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          type="button"
          onClick={() => setMainTab('modules')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            mainTab === 'modules'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <i className="fa-solid fa-puzzle-piece"></i>
          <span>จัดการโมดูลส่วนเสริม ({totalCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('core_settings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            mainTab === 'core_settings'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <i className="fa-solid fa-building-columns"></i>
          <span>ข้อมูลระบบและองค์กร (Organization & Basic Info)</span>
        </button>
      </div>

      {/* ─── CORE SYSTEM & ORGANIZATION SETTINGS PANEL ─── */}
      {mainTab === 'core_settings' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 animate-fade-in">
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
                {settings?.systemLogo ? (
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
                  onClick={() => logoInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-semibold rounded-xl transition-all inline-flex items-center gap-2 shadow-xs"
                >
                  <i className="fa-solid fa-upload"></i>
                  <span>เลือกไฟล์รูปภาพโลโก้</span>
                </button>
                <input
                  id="coreSystemLogoFileInput"
                  aria-label="อัปโหลดรูปภาพโลโก้ระบบ"
                  type="file"
                  ref={logoInputRef}
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
              <label htmlFor="coreSystemName" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                ชื่อระบบ (System Name)
              </label>
              <input
                id="coreSystemName"
                type="text"
                name="systemName"
                aria-label="ชื่อระบบ"
                value={settings?.systemName || ''}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div>
              <label htmlFor="coreOrganizationName" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                ชื่อองค์กร (Organization Name)
              </label>
              <input
                id="coreOrganizationName"
                type="text"
                name="organizationName"
                aria-label="ชื่อองค์กร"
                value={settings?.organizationName || ''}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
          </div>

          {/* Contact Us Information Fields */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 space-y-4">
            <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-xs pb-1 border-b border-slate-200 dark:border-slate-700/60">
              <i className="fa-solid fa-address-book text-primary-500 text-sm"></i>
              <span>ข้อมูลการติดต่อเราและแผนที่ตั้ง (Contact Information & Location)</span>
            </div>

            <div>
              <label htmlFor="coreOrganizationAddress" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                ที่อยู่หน่วยงาน / สำนักงาน (Organization Address)
              </label>
              <textarea
                id="coreOrganizationAddress"
                name="organizationAddress"
                aria-label="ที่อยู่หน่วยงาน"
                value={settings?.organizationAddress || ''}
                onChange={handleInputChange}
                placeholder="กรอกที่อยู่สำนักงาน / หน่วยงาน..."
                rows={2}
                className="form-control resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="coreOrganizationPhone" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  เบอร์โทรศัพท์หลัก (Main Phone)
                </label>
                <input
                  id="coreOrganizationPhone"
                  type="text"
                  name="organizationPhone"
                  aria-label="เบอร์โทรศัพท์หลัก"
                  value={settings?.organizationPhone || ''}
                  onChange={handleInputChange}
                  placeholder="เช่น 02-123-4567"
                  className="form-control"
                />
              </div>
              <div>
                <label htmlFor="coreContactPhoneSecondary" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  เบอร์โทรศัพท์สายตรง / แผนก (Secondary Phone)
                </label>
                <input
                  id="coreContactPhoneSecondary"
                  type="text"
                  name="contactPhoneSecondary"
                  aria-label="เบอร์โทรศัพท์สายตรงหรือแผนก"
                  value={settings?.contactPhoneSecondary || ''}
                  onChange={handleInputChange}
                  placeholder="เช่น 02-123-4568 (ฝ่ายบริการ/สอบถาม)"
                  className="form-control"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="coreContactEmail" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  อีเมลหลัก (Contact Email)
                </label>
                <input
                  id="coreContactEmail"
                  type="email"
                  name="contactEmail"
                  aria-label="อีเมลหลักสำหรับการติดต่อ"
                  value={settings?.contactEmail || ''}
                  onChange={handleInputChange}
                  placeholder="เช่น contact@eprofile.com"
                  className="form-control"
                />
              </div>
              <div>
                <label htmlFor="coreContactEmailSupport" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  อีเมลฝ่ายบริการ / สนับสนุน (Support Email)
                </label>
                <input
                  id="coreContactEmailSupport"
                  type="email"
                  name="contactEmailSupport"
                  aria-label="อีเมลฝ่ายบริการหรือสนับสนุน"
                  value={settings?.contactEmailSupport || ''}
                  onChange={handleInputChange}
                  placeholder="เช่น support@eprofile.com"
                  className="form-control"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="coreContactMapEmbedUrl" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Google Maps Embed URL (ลิงก์แผนที่แบบฝัง iframe)
                </label>
                <input
                  id="coreContactMapEmbedUrl"
                  type="url"
                  name="contactMapEmbedUrl"
                  aria-label="Google Maps Embed URL"
                  value={settings?.contactMapEmbedUrl || ''}
                  onChange={handleInputChange}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="form-control"
                />
              </div>
              <div>
                <label htmlFor="coreContactMapLink" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ลิงก์เปิดแผนที่ภายนอก (Google Maps Link)
                </label>
                <input
                  id="coreContactMapLink"
                  type="url"
                  name="contactMapLink"
                  aria-label="ลิงก์เปิดแผนที่ภายนอก"
                  value={settings?.contactMapLink || ''}
                  onChange={handleInputChange}
                  placeholder="https://maps.google.com/?q=..."
                  className="form-control"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="coreCardTermsConditions" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              ข้อกำหนดหลังบัตร / หมายเหตุ (Terms and Conditions)
            </label>
            <textarea
              id="coreCardTermsConditions"
              name="cardTermsConditions"
              aria-label="ข้อกำหนดหลังบัตร"
              value={settings?.cardTermsConditions || ''}
              onChange={handleInputChange}
              placeholder="เช่น หากเก็บได้กรุณาส่งคืน..."
              rows={2}
              className="form-control resize-none"
            />
          </div>

          <div>
            <label htmlFor="coreDefaultPageSize" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              จำนวนรายการเริ่มต้นต่อหน้าในตาราง (Default Items Per Page)
            </label>
            <select
              id="coreDefaultPageSize"
              name="defaultPageSize"
              aria-label="จำนวนรายการเริ่มต้นต่อหน้าในตาราง"
              value={settings?.defaultPageSize || '20'}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="10">10 รายการ / หน้า</option>
              <option value="20">20 รายการ / หน้า (แนะนำ)</option>
              <option value="50">50 รายการ / หน้า</option>
              <option value="100">100 รายการ / หน้า</option>
            </select>
          </div>

          {/* Save Action Bar */}
          <div className="flex justify-end border-t border-slate-200 dark:border-slate-800 pt-5 mt-4">
            <button
              type="button"
              disabled={isSavingCore}
              onClick={handleSaveCoreSettings}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isSavingCore ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk"></i>
                  <span>บันทึกข้อมูลระบบและองค์กร</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── ADD-ON MODULES PANEL ─── */}
      {mainTab === 'modules' && (
        <div className="space-y-6 animate-fade-in">
          {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(Object.keys(CATEGORY_LABELS) as (ModuleCategory | 'all')[]).map(catKey => {
            const isCatActive = selectedCategory === catKey;
            const meta = CATEGORY_LABELS[catKey];
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  isCatActive
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <i className={`fa-solid ${meta.icon} text-[10px]`}></i>
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="ค้นหาชื่อโมดูล..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModules.map(mod => {
          const isEnabled = mod.isCore || enabledModuleIds.includes(mod.id);
          const isExpanded = expandedModuleId === mod.id;
          const isCustom = customModules.some(c => c.id === mod.id);

          return (
            <div
              key={mod.id}
              className={`rounded-2xl border transition-all flex flex-col bg-white dark:bg-slate-900 ${
                isEnabled
                  ? 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary-400/50 dark:hover:border-primary-500/30'
                  : 'border-slate-200/60 dark:border-slate-800/40 opacity-70 bg-slate-50/50 dark:bg-slate-900/40'
              }`}
            >
              {/* Card Main Body */}
              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      isEnabled
                        ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200/50 dark:border-primary-800/40'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <i className={`fa-solid ${mod.icon || 'fa-box'} text-lg`}></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {mod.name}
                        </h3>
                        {mod.isCore ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Core
                          </span>
                        ) : isCustom ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Custom Add-on
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            v{mod.version}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {mod.nameEn || mod.id}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch or Actions */}
                  <div className="flex items-center gap-2">
                    {mod.settingsPath && isEnabled && (
                      <Link
                        href={mod.settingsPath}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors flex items-center justify-center"
                        title="ตั้งค่าโมดูล"
                      >
                        <i className="fa-solid fa-gear text-xs"></i>
                      </Link>
                    )}

                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => setUninstallTarget(mod)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center justify-center"
                        title="ถอนการติดตั้งโมดูล"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    )}

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        disabled={mod.isCore}
                        onChange={() => toggleModule(mod)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {mod.description}
                </p>

                {/* Details Accordion (Menus, Permissions & Module Settings) */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3 text-xs animate-fade-in">
                    {/* Settings & Sub-pages */}
                    {mod.id === 'personnel' && (
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                          การตั้งค่ากำลังพลและหน่วยงาน
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <Link href="/modules/personnel/roles" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 text-[11px] hover:bg-primary-100 transition-colors">
                            <i className="fa-solid fa-user-shield text-[10px]"></i> สิทธิ์การใช้งาน (Roles)
                          </Link>
                          <Link href="/modules/personnel/departments" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 text-[11px] hover:bg-primary-100 transition-colors">
                            <i className="fa-solid fa-sitemap text-[10px]"></i> จัดการหน่วยงาน (Departments)
                          </Link>
                          <Link href="/modules/system-inspector/categories" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 text-[11px] hover:bg-primary-100 transition-colors">
                            <i className="fa-solid fa-list-check text-[10px]"></i> ตัวเลือกข้อมูล (Categories)
                          </Link>
                        </div>
                      </div>
                    )}

                    {mod.id === 'badges' && (
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                          การตั้งค่ารูปแบบบัตร
                        </span>
                        <Link href="/modules/badges/settings" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 text-[11px] hover:bg-primary-100 transition-colors">
                          <i className="fa-solid fa-id-card text-[10px]"></i> ออกแบบรูปแบบบัตร (Badge Studio)
                        </Link>
                      </div>
                    )}

                    {mod.id === 'news' && (
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                          การตั้งค่าการแจ้งเตือน
                        </span>
                        <Link href="/modules/news/settings" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 text-[11px] hover:bg-primary-100 transition-colors">
                          <i className="fa-solid fa-bell text-[10px]"></i> ตั้งค่า LINE & Email Notifications
                        </Link>
                      </div>
                    )}

                    {mod.id === 'system-inspector' && (
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                          เครื่องมือระบบ
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <Link href="/modules/system-inspector" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 text-[11px] hover:bg-primary-100 transition-colors">
                            <i className="fa-solid fa-shield-halved text-[10px]"></i> ตรวจสอบความปลอดภัย
                          </Link>
                          <Link href="/modules/system-inspector/api-docs" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 text-[11px] hover:bg-primary-100 transition-colors">
                            <i className="fa-solid fa-book text-[10px]"></i> API Documentation
                          </Link>
                          <Link href="/modules/system-inspector/audit-logs" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 text-[11px] hover:bg-primary-100 transition-colors">
                            <i className="fa-solid fa-history text-[10px]"></i> ประวัติการใช้งาน (Audit Logs)
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Menus provided */}
                    {mod.menus.length > 0 && (
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                          เมนูในระบบ ({mod.menus.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {mod.menus.map(m => (
                            <span key={m.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                              <i className={`${m.icon} text-[10px] text-primary-500`}></i>
                              <span>{m.title}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Permissions provided */}
                    {mod.permissions.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                          สิทธิ์ที่โมดูลนี้ร้องขอ ({mod.permissions.length})
                        </span>
                        <div className="space-y-1">
                          {mod.permissions.map(p => (
                            <div key={p.key} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                              <span className="font-mono text-[10px] text-primary-600 dark:text-primary-400 font-semibold block">
                                {p.key}
                              </span>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {p.name}: {p.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer: Metadata and Expand Button */}
              <div className="px-5 py-2.5 bg-slate-50/60 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>ผู้พัฒนา: {mod.author || 'ไม่ระบุ'}</span>
                <button
                  type="button"
                  onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1 font-medium"
                >
                    <span>{isExpanded ? 'ย่อรายละเอียด' : 'ดูรายละเอียด'}</span>
                    <i className={`fa-solid fa-chevron-down text-[9px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                  </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <i className="fa-solid fa-puzzle-piece text-3xl text-slate-300 dark:text-slate-700 mb-2"></i>
          <p className="text-sm text-slate-500 dark:text-slate-400">ไม่พบโมดูลที่ตรงกับเงื่อนไขการค้นหา</p>
        </div>
      )}
      </div>
      )}

      {/* Upload & Install Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <i className="fa-solid fa-file-zipper text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    ติดตั้งโมดูลใหม่ (Module ZIP Uploader)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    อัปโหลดไฟล์แพ็กเกจ .zip ที่มีไฟล์ manifest.json
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedFile(null);
                }}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleInstallUpload} className="space-y-5">
              {/* Dropzone Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/30 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,application/zip"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-primary-500 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/40 flex items-center justify-center transition-colors mb-3">
                  <i className="fa-solid fa-cloud-arrow-up text-2xl"></i>
                </div>
                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                    </p>
                    <p className="text-xs text-slate-400">
                      รองรับไฟล์ .zip ขนาดไม่เกิน 50MB
                    </p>
                  </div>
                )}
              </div>

              {/* Requirement Hint */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
                <i className="fa-solid fa-circle-info text-primary-500 mt-0.5"></i>
                <div className="leading-relaxed">
                  ไฟล์ ZIP จะต้องมี <code className="font-mono text-primary-600 dark:text-primary-400 font-bold">manifest.json</code> อยู่ที่รากโฟลเดอร์ ระบบจะทำการตรวจสอบความปลอดภัยและติดตั้งให้โดยอัตโนมัติ
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setSelectedFile(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-primary-500/25 disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                      <span>กำลังติดตั้งโมดูล...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i>
                      <span>ยืนยันการติดตั้ง</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Uninstall Confirmation Modal */}
      <ConfirmModal
        isOpen={!!uninstallTarget}
        title="ยืนยันการถอนการติดตั้งโมดูล?"
        message={`คุณต้องการถอนการติดตั้งโมดูล "${uninstallTarget?.name}" ใช่หรือไม่? ไฟล์และส่วนประกอบของโมดูลนี้จะถูกลบออกจากระบบ`}
        confirmText={isUninstalling ? 'กำลังถอนการติดตั้ง...' : 'ยืนยันการลบ'}
        cancelText="ยกเลิก"
        isDestructive={true}
        onConfirm={handleUninstall}
        onCancel={() => setUninstallTarget(null)}
      />
    </div>
  );
}
