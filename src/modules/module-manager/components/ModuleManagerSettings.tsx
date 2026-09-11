'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ALL_SYSTEM_MODULES } from '@/lib/modules';
import { ModuleManifest, ModuleCategory } from '@/lib/modules/types';
import ConfirmModal from '@/components/common/ConfirmModal';
import { Card, Button, Badge, Input, Select } from '@/components/ui';
import {
  Puzzle,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Settings,
  Shield,
  Layers,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Edit,
  RotateCcw,
} from 'lucide-react';

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

  // Load modules from server API
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
      enabledModuleIds = allModules.map((m) => m.id);
    }
  } catch {
    enabledModuleIds = allModules.map((m) => m.id);
  }

  const toggleModule = (mod: ModuleManifest) => {
    if (mod.isCore) {
      toast.error(`โมดูล "${mod.name}" เป็นโมดูลหลักของระบบ ไม่สามารถปิดการใช้งานได้`);
      return;
    }

    let nextEnabled: string[];
    const isTurningOff = enabledModuleIds.includes(mod.id);
    if (isTurningOff) {
      nextEnabled = enabledModuleIds.filter((id) => id !== mod.id);
    } else {
      nextEnabled = [...enabledModuleIds, mod.id];
    }

    const updated = {
      ...settings,
      enabledModules: JSON.stringify(nextEnabled),
    };

    setSettings(updated);
    toast.success(
      isTurningOff
        ? `ปิดใช้งานโมดูล "${mod.name}" เรียบร้อยแล้ว`
        : `เปิดใช้งานโมดูล "${mod.name}" เรียบร้อยแล้ว`
    );
  };

  // Menu Overrides state
  let menuOverridesList: any[] = [];
  try {
    if (typeof settings.menuOverrides === 'string') {
      menuOverridesList = JSON.parse(settings.menuOverrides);
    } else if (Array.isArray(settings.menuOverrides)) {
      menuOverridesList = settings.menuOverrides;
    }
  } catch {
    menuOverridesList = [];
  }

  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [editingMenuForm, setEditingMenuForm] = useState<{ title: string; icon: string; order: number }>({
    title: '',
    icon: '',
    order: 10,
  });

  const toggleMenuItem = (menuId: string, currentEnabled: boolean, defaultMenu: any) => {
    const existing = menuOverridesList.find((m: any) => m.id === menuId);
    let updatedList: any[];
    if (existing) {
      updatedList = menuOverridesList.map((m: any) =>
        m.id === menuId ? { ...m, enabled: !currentEnabled } : m
      );
    } else {
      updatedList = [
        ...menuOverridesList,
        {
          id: menuId,
          title: defaultMenu.title,
          path: defaultMenu.path,
          icon: defaultMenu.icon,
          order: defaultMenu.order,
          enabled: !currentEnabled,
        },
      ];
    }
    const nextSettings = { ...settings, menuOverrides: JSON.stringify(updatedList) };
    setSettings(nextSettings);
    window.dispatchEvent(new CustomEvent('eprofile-settings-change', { detail: nextSettings }));
    toast.success(!currentEnabled ? `เปิดแสดงเมนูเรียบร้อยแล้ว` : `ซ่อนเมนูจากแถบนำทางแล้ว`);
  };

  const saveMenuEdit = (menuId: string, defaultMenu: any) => {
    const existing = menuOverridesList.find((m: any) => m.id === menuId);
    let updatedList: any[];
    if (existing) {
      updatedList = menuOverridesList.map((m: any) =>
        m.id === menuId ? { ...m, ...editingMenuForm } : m
      );
    } else {
      updatedList = [
        ...menuOverridesList,
        {
          id: menuId,
          path: defaultMenu.path,
          enabled: true,
          ...editingMenuForm,
        },
      ];
    }
    const nextSettings = { ...settings, menuOverrides: JSON.stringify(updatedList) };
    setSettings(nextSettings);
    window.dispatchEvent(new CustomEvent('eprofile-settings-change', { detail: nextSettings }));
    setEditingMenuId(null);
    toast.success('บันทึกการปรับแต่งเมนูเรียบร้อยแล้ว');
  };

  const resetMenuItem = (menuId: string) => {
    const updatedList = menuOverridesList.filter((m: any) => m.id !== menuId);
    const nextSettings = { ...settings, menuOverrides: JSON.stringify(updatedList) };
    setSettings(nextSettings);
    window.dispatchEvent(new CustomEvent('eprofile-settings-change', { detail: nextSettings }));
    setEditingMenuId(null);
    toast.success('คืนค่าเมนูเป็นค่าเริ่มต้นแล้ว');
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
      await fetchModules();
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
        throw new Error(data.error || 'การถอนการติดตั้งล้มเหลว');
      }

      toast.success(data.message || 'ถอนการติดตั้งโมดูลสำเร็จ');
      setUninstallTarget(null);
      await fetchModules();
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการถอนการติดตั้ง');
    } finally {
      setIsUninstalling(false);
    }
  };

  // Filter modules
  const filteredModules = allModules.filter((m) => {
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesQuery =
      !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.nameEn && m.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const totalCore = allModules.filter((m) => m.isCore).length;
  const totalInstalled = allModules.length;
  const totalEnabled = allModules.filter((m) => m.isCore || enabledModuleIds.includes(m.id)).length;

  return (
    <div className="space-y-6 font-prompt">
      {/* ── Top Metric Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">โมดูลทั้งหมด</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
              {totalInstalled}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">รวมโมดูลหลักและส่วนเสริม</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xl shrink-0">
            <Puzzle className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">เปิดใช้งานอยู่</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              {totalEnabled}
            </div>
            <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
              พร้อมใช้งานบนแถบนำทาง
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">โมดูลหลัก (Core)</span>
            <div className="text-2xl font-black text-primary-600 dark:text-primary-400 font-mono mt-1">
              {totalCore}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">โครงสร้างพื้นฐานระบบ</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xl shrink-0">
            <Shield className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* ── Action Bar & Category Filters ── */}
      <Card className="p-4 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(CATEGORY_LABELS) as (ModuleCategory | 'all')[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <i className={`fa-solid ${CATEGORY_LABELS[cat].icon} text-[10px]`}></i>
                <span>{CATEGORY_LABELS[cat].label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <a
              href="/api/modules/template"
              download="sample-module-template.zip"
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
              title="ดาวน์โหลดโครงสร้างโมดูลตัวอย่างสำหรับนักพัฒนา"
            >
              <Download className="w-3.5 h-3.5 text-primary-500" />
              <span>โหลดเทมเพลต</span>
            </a>

            <Button
              variant="primary"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 shadow-sm shadow-primary-500/30 text-xs font-bold"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>ติดตั้งโมดูล (.ZIP)</span>
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div>
          <input
            type="text"
            placeholder="ค้นหาชื่อโมดูล, รหัสระบบ, หรือคำอธิบาย..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
          />
        </div>
      </Card>

      {/* ── Module Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredModules.map((mod) => {
          const isEnabled = mod.isCore || enabledModuleIds.includes(mod.id);
          const isCustom = customModules.some((c) => c.id === mod.id);
          const isExpanded = expandedModuleId === mod.id;

          return (
            <Card
              key={mod.id}
              className={`transition-all overflow-hidden ${
                isEnabled ? 'border-slate-200 dark:border-slate-800' : 'opacity-65 border-dashed'
              }`}
            >
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xl shrink-0">
                      <i className={mod.icon}></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{mod.name}</h3>
                        {mod.isCore ? (
                          <Badge variant="primary" size="sm">
                            Core
                          </Badge>
                        ) : isCustom ? (
                          <Badge variant="warning" size="sm">
                            Custom
                          </Badge>
                        ) : null}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {mod.id} • v{mod.version}
                      </span>
                    </div>
                  </div>

                  {/* Switch toggle */}
                  <div>
                    {mod.isCore ? (
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-semibold">
                        บังคับเปิด
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleModule(mod)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isEnabled
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        <i className={`fa-solid ${isEnabled ? 'fa-toggle-on' : 'fa-toggle-off'} text-sm`}></i>
                        <span>{isEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {mod.description || 'ไม่มีคำอธิบาย'}
                </p>

                {/* Expanded Details & Menu Customizer */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-fade-in">
                    {/* Settings Link if defined */}
                    {mod.settingsPath && (
                      <div>
                        <Link
                          href={mod.settingsPath}
                          className="inline-flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline font-semibold"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>ไปที่หน้าตั้งค่าของโมดูลนี้</span>
                        </Link>
                      </div>
                    )}

                    {/* Menus provided with interactive controls */}
                    {mod.menus.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                            จัดการเมนูในแถบนำทาง ({mod.menus.length})
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ปรับแต่งการแสดงผลหรือซ่อนเมนูของโมดูลนี้
                          </span>
                        </div>
                        <div className="space-y-2">
                          {mod.menus.map((m) => {
                            const override = menuOverridesList.find((ov: any) => ov.id === m.id);
                            const isMenuEnabled = override?.enabled !== false;
                            const currentTitle = override?.title || m.title;
                            const currentIcon = override?.icon || m.icon;
                            const currentOrder = override?.order ?? m.order;
                            const isEditing = editingMenuId === m.id;

                            return (
                              <div
                                key={m.id}
                                className={`p-3 rounded-xl border transition-all ${
                                  isMenuEnabled
                                    ? 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                                    : 'bg-slate-100/50 dark:bg-slate-900/50 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                                }`}
                              >
                                {isEditing ? (
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        แก้ไขเมนู: {m.title}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setEditingMenuId(null)}
                                        className="text-[11px] text-slate-400 hover:text-slate-600"
                                      >
                                        ✕ ปิด
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                          ชื่อเมนู
                                        </label>
                                        <input
                                          type="text"
                                          value={editingMenuForm.title}
                                          onChange={(e) =>
                                            setEditingMenuForm((prev) => ({ ...prev, title: e.target.value }))
                                          }
                                          className="w-full h-8 text-xs px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary-500"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                          FontAwesome Icon
                                        </label>
                                        <input
                                          type="text"
                                          value={editingMenuForm.icon}
                                          onChange={(e) =>
                                            setEditingMenuForm((prev) => ({ ...prev, icon: e.target.value }))
                                          }
                                          className="w-full h-8 text-xs px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary-500 font-mono"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                          ลำดับ (Order)
                                        </label>
                                        <input
                                          type="number"
                                          value={editingMenuForm.order}
                                          onChange={(e) =>
                                            setEditingMenuForm((prev) => ({
                                              ...prev,
                                              order: parseInt(e.target.value) || 10,
                                            }))
                                          }
                                          className="w-full h-8 text-xs px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary-500"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditingMenuId(null)}
                                      >
                                        ยกเลิก
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => saveMenuEdit(m.id, m)}
                                      >
                                        บันทึก
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 text-xs">
                                        <i className={currentIcon}></i>
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                            {currentTitle}
                                          </span>
                                          {override && (
                                            <Badge variant="warning" size="sm">
                                              ปรับแต่งแล้ว
                                            </Badge>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono block truncate">
                                          {m.path} • ลำดับ: {currentOrder}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingMenuId(m.id);
                                          setEditingMenuForm({
                                            title: currentTitle,
                                            icon: currentIcon,
                                            order: currentOrder,
                                          });
                                        }}
                                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] transition-colors"
                                        title="แก้ไขชื่อ/ไอคอน/ลำดับ"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      {override && (
                                        <button
                                          type="button"
                                          onClick={() => resetMenuItem(m.id)}
                                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 text-[11px] transition-colors"
                                          title="คืนค่าเริ่มต้น"
                                        >
                                          <RotateCcw className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => toggleMenuItem(m.id, isMenuEnabled, m)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                          isMenuEnabled
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                                        }`}
                                      >
                                        <i
                                          className={`fa-solid ${
                                            isMenuEnabled ? 'fa-eye' : 'fa-eye-slash'
                                          }`}
                                        ></i>
                                        <span>{isMenuEnabled ? 'แสดง' : 'ซ่อน'}</span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Permissions requested */}
                    {mod.permissions.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                          สิทธิ์ที่โมดูลนี้ร้องขอ ({mod.permissions.length})
                        </span>
                        <div className="space-y-1">
                          {mod.permissions.map((p) => (
                            <div
                              key={p.key}
                              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                            >
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

                    {/* Uninstall button for custom modules */}
                    {isCustom && (
                      <div className="pt-3 flex justify-end">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setUninstallTarget(mod)}
                          className="flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ถอนการติดตั้งโมดูลนี้</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-5 py-2.5 bg-slate-50/60 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>ผู้พัฒนา: {mod.author || 'ไม่ระบุ'}</span>
                <button
                  type="button"
                  onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1 font-medium"
                >
                  <span>{isExpanded ? 'ย่อรายละเอียด' : 'จัดการเมนูและสิทธิ์'}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Upload ZIP Module Modal ── */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-prompt">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center text-lg">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">ติดตั้งโมดูลเสริม (.ZIP)</h3>
                  <p className="text-xs text-slate-400">อัปโหลดแพ็กเกจโมดูลที่ถูกต้องตามข้อกำหนด</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInstallUpload} className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Upload className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {selectedFile ? selectedFile.name : 'คลิกเพื่อเลือกไฟล์ .zip ของโมดูล'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">ขนาดไฟล์ไม่เกิน 50MB และต้องมี manifest.json</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setIsUploadModalOpen(false)}>
                  ยกเลิก
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="flex items-center gap-1.5"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>กำลังติดตั้ง...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ยืนยันการติดตั้ง</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Uninstall Confirmation Modal ── */}
      <ConfirmModal
        isOpen={!!uninstallTarget}
        title={`ถอนการติดตั้งโมดูล "${uninstallTarget?.name}"?`}
        message="คุณแน่ใจหรือไม่ที่จะถอนการติดตั้งโมดูลนี้ ไฟล์ทั้งหมดของโมดูลจะถูกลบออกจากระบบ"
        confirmText={isUninstalling ? 'กำลังถอนการติดตั้ง...' : 'ถอนการติดตั้ง'}
        cancelText="ยกเลิก"
        isDestructive={true}
        onConfirm={handleUninstall}
        onCancel={() => setUninstallTarget(null)}
      />
    </div>
  );
}
