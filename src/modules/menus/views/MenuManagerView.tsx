'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ALL_SYSTEM_MODULES } from '@/lib/modules';
import { ModuleManifest, ModuleMenu } from '@/lib/modules/types';
import ConfirmModal from '@/components/common/ConfirmModal';

interface MenuManagerViewProps {
  settings?: any;
}

export interface MenuOverride {
  id: string;
  title?: string;
  path?: string;
  order?: number;
  enabled?: boolean;
  icon?: string;
  isCustom?: boolean;
  subItems?: { name: string; path: string }[];
}

interface DisplayMenuItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  order: number;
  enabled: boolean;
  isCustom: boolean;
  moduleName: string;
  moduleId: string;
  isCore: boolean;
  requiredRoles?: string[];
  requiredPermission?: string;
  subItems: { name: string; path: string }[];
}

const PRESET_ICONS = [
  'fa-solid fa-link',
  'fa-solid fa-file-lines',
  'fa-solid fa-folder',
  'fa-solid fa-star',
  'fa-solid fa-chart-line',
  'fa-solid fa-bullhorn',
  'fa-solid fa-layer-group',
  'fa-solid fa-compass',
  'fa-solid fa-[#000000]',
  'fa-solid fa-gear',
  'fa-solid fa-globe',
  'fa-solid fa-database',
  'fa-solid fa-bookmark',
];

export default function MenuManagerView({ settings }: MenuManagerViewProps) {
  const [modules, setModules] = useState<ModuleManifest[]>(ALL_SYSTEM_MODULES);
  const [selectedTab, setSelectedTab] = useState<'all' | 'system' | 'custom' | 'disabled'>('all');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [overrides, setOverrides] = useState<MenuOverride[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null); // null if adding new
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [editForm, setEditForm] = useState<{
    id: string;
    title: string;
    path: string;
    icon: string;
    order: string;
    subItems: { name: string; path: string }[];
  }>({
    id: '',
    title: '',
    path: '',
    icon: 'fa-solid fa-link',
    order: '500',
    subItems: [],
  });

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<DisplayMenuItem | null>(null);

  useEffect(() => {
    async function loadModules() {
      try {
        const res = await fetch('/api/modules');
        if (res.ok) {
          const data = await res.json();
          if (data.modules && Array.isArray(data.modules)) {
            setModules(data.modules);
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic modules:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadModules();
  }, []);

  const loadMenuOverrides = () => {
    fetch('/api/menus')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('โหลดการตั้งค่าเมนูไม่สำเร็จ'))))
      .then((data) => {
        if (Array.isArray(data?.overrides)) setOverrides(data.overrides);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadMenuOverrides();
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const saveOverrides = async (nextOverrides: MenuOverride[]) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/menus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overrides: nextOverrides }),
      });
      if (!response.ok) throw new Error('ไม่สามารถบันทึกการตั้งค่าเมนูได้');
      setOverrides(nextOverrides);
      showNotification('success', 'บันทึกการตั้งค่าเมนูเรียบร้อยแล้ว');
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'ไม่สามารถบันทึกการตั้งค่าเมนูได้');
    } finally {
      setIsSaving(false);
    }
  };

  const getOverride = (id: string) => overrides.find((item) => item.id === id);

  // Enabled modules array
  let enabledModuleIds: string[] = [];
  try {
    if (typeof settings?.enabledModules === 'string') {
      enabledModuleIds = JSON.parse(settings.enabledModules);
    } else if (Array.isArray(settings?.enabledModules)) {
      enabledModuleIds = settings.enabledModules;
    }
  } catch {
    // fallback
  }

  // Aggregate System Module Menus + Custom Menus
  const allDisplayItems: DisplayMenuItem[] = [];

  // 1. System Module Menus
  modules.forEach((mod) => {
    const isModEnabled = mod.isCore || enabledModuleIds.length === 0 || enabledModuleIds.includes(mod.id);
    mod.menus.forEach((menu) => {
      const override = getOverride(menu.id);
      allDisplayItems.push({
        id: menu.id,
        title: override?.title || menu.title,
        path: override?.path || menu.path,
        icon: override?.icon || menu.icon,
        order: override?.order ?? menu.order,
        enabled: isModEnabled && override?.enabled !== false,
        isCustom: false,
        moduleName: mod.name,
        moduleId: mod.id,
        isCore: mod.isCore,
        requiredRoles: menu.requiredRoles,
        requiredPermission: menu.requiredPermission,
        subItems: override?.subItems || menu.subItems?.map((s) => ({ name: s.name, path: s.path })) || [],
      });
    });
  });

  // 2. Custom Menus
  overrides.forEach((ov) => {
    if (ov.isCustom && ov.title && ov.path) {
      if (!allDisplayItems.some((item) => item.id === ov.id)) {
        allDisplayItems.push({
          id: ov.id,
          title: ov.title,
          path: ov.path,
          icon: ov.icon || 'fa-solid fa-link',
          order: ov.order ?? 500,
          enabled: ov.enabled !== false,
          isCustom: true,
          moduleName: 'เมนูสร้างเอง (Custom)',
          moduleId: 'custom',
          isCore: false,
          subItems: ov.subItems || [],
        });
      }
    }
  });

  // Sort by order ascending
  allDisplayItems.sort((a, b) => a.order - b.order);

  // Statistics
  const totalCount = allDisplayItems.length;
  const systemCount = allDisplayItems.filter((i) => !i.isCustom).length;
  const customCount = allDisplayItems.filter((i) => i.isCustom).length;
  const disabledCount = allDisplayItems.filter((i) => !i.enabled).length;

  // Filtered List
  const filteredItems = allDisplayItems.filter((item) => {
    // Tab filter
    if (selectedTab === 'system' && item.isCustom) return false;
    if (selectedTab === 'custom' && !item.isCustom) return false;
    if (selectedTab === 'disabled' && item.enabled) return false;

    // Module dropdown filter
    if (selectedModuleFilter !== 'all' && item.moduleId !== selectedModuleFilter) return false;

    // Search Query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = item.title.toLowerCase().includes(q);
    const matchPath = item.path.toLowerCase().includes(q);
    const matchMod = item.moduleName.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
    const matchSub = item.subItems.some((s) => s.name.toLowerCase().includes(q) || s.path.toLowerCase().includes(q));
    return matchTitle || matchPath || matchMod || matchSub;
  });

  // Handlers for Add / Edit / Delete
  const handleOpenAddModal = () => {
    setEditingMenuId(null);
    setIsCustomMode(true);
    setEditForm({
      id: `custom-menu-${Date.now().toString(36)}`,
      title: '',
      path: '/',
      icon: 'fa-solid fa-link',
      order: String((totalCount + 1) * 10),
      subItems: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: DisplayMenuItem) => {
    setEditingMenuId(item.id);
    setIsCustomMode(item.isCustom);
    setEditForm({
      id: item.id,
      title: item.title,
      path: item.path,
      icon: item.icon,
      order: String(item.order),
      subItems: item.subItems.map((s) => ({ ...s })),
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!editForm.title.trim()) {
      alert('กรุณาระบุชื่อเมนู');
      return;
    }
    if (!editForm.path.trim() || !editForm.path.startsWith('/')) {
      alert('กรุณาระบุเส้นทาง (Path) ที่ขึ้นต้นด้วย /');
      return;
    }
    const orderNum = Number(editForm.order);
    if (isNaN(orderNum)) {
      alert('กรุณาระบุลำดับเป็นตัวเลข');
      return;
    }

    const nextOverrides = overrides.filter((o) => o.id !== editForm.id);
    const existing = getOverride(editForm.id);

    nextOverrides.push({
      ...existing,
      id: editForm.id,
      title: editForm.title.trim(),
      path: editForm.path.trim(),
      icon: editForm.icon.trim(),
      order: orderNum,
      isCustom: isCustomMode || existing?.isCustom,
      subItems: editForm.subItems.filter((s) => s.name.trim() && s.path.trim()),
    });

    setIsModalOpen(false);
    void saveOverrides(nextOverrides);
  };

  const handleToggleEnable = (item: DisplayMenuItem) => {
    const existing = getOverride(item.id);
    const nextOverrides = overrides.filter((o) => o.id !== item.id);
    nextOverrides.push({
      ...existing,
      id: item.id,
      enabled: !item.enabled,
    });
    void saveOverrides(nextOverrides);
  };

  const handleDeleteItem = (item: DisplayMenuItem) => {
    setDeleteTarget(item);
  };

  const confirmExecuteDelete = () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    const isCustom = deleteTarget.isCustom;

    let nextOverrides: MenuOverride[];
    if (isCustom) {
      // Remove completely
      nextOverrides = overrides.filter((o) => o.id !== targetId);
    } else {
      // Disable system menu
      const existing = getOverride(targetId);
      nextOverrides = overrides.filter((o) => o.id !== targetId);
      nextOverrides.push({
        ...existing,
        id: targetId,
        enabled: false,
      });
    }

    setDeleteTarget(null);
    void saveOverrides(nextOverrides);
  };

  // Sub-items management inside Modal
  const addSubItem = () => {
    setEditForm((prev) => ({
      ...prev,
      subItems: [...prev.subItems, { name: '', path: '/' }],
    }));
  };

  const removeSubItem = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      subItems: prev.subItems.filter((_, idx) => idx !== index),
    }));
  };

  const updateSubItem = (index: number, field: 'name' | 'path', val: string) => {
    setEditForm((prev) => {
      const next = [...prev.subItems];
      next[index] = { ...next[index], [field]: val };
      return { ...prev, subItems: next };
    });
  };

  return (
    <div className="pb-16 max-w-7xl mx-auto space-y-6 animate-fade-in font-prompt">
      {/* ─── Notification Alert Banner ─────────────────────────────────── */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-semibold shadow-md animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <i className={`fa-solid ${statusMessage.type === 'success' ? 'fa-circle-check text-emerald-500' : 'fa-triangle-exclamation text-rose-500'} text-lg`}></i>
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      {/* ─── Header Banner ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary-200/40 via-primary-100/10 to-transparent dark:from-primary-950/30 dark:via-primary-900/10 dark:to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-primary-500/20">
              <i className="fa-solid fa-compass"></i>
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-900/60 rounded-full text-xs font-semibold text-primary-700 dark:text-primary-300 mb-2">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                <span>ระบบจัดการเมนูและนำทาง (Menu & Navigation System)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                จัดการเมนูและโครงสร้างระบบ
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                จัดการ เพิ่ม แก้ไข เปลี่ยนชื่อ ลำดับ ไอคอน และลบรายการเมนูปรับแต่งในแถบข้าง (Sidebar Navigation)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-md shadow-primary-600/25"
            >
              <i className="fa-solid fa-plus"></i>
              <span>+ เพิ่มเมนูใหม่</span>
            </button>

            <button
              onClick={loadMenuOverrides}
              className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2"
              title="รีเฟรชข้อมูล"
            >
              <i className="fa-solid fa-rotate"></i>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Metric & Filter Tabs ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-x-auto">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              selectedTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className="fa-solid fa-bars"></i>
            <span>ทั้งหมด ({totalCount})</span>
          </button>

          <button
            onClick={() => setSelectedTab('system')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              selectedTab === 'system'
                ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className="fa-solid fa-cube"></i>
            <span>โมดูลระบบ ({systemCount})</span>
          </button>

          <button
            onClick={() => setSelectedTab('custom')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              selectedTab === 'custom'
                ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            <span>เมนูสร้างเอง ({customCount})</span>
          </button>

          <button
            onClick={() => setSelectedTab('disabled')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              selectedTab === 'disabled'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className="fa-solid fa-eye-slash"></i>
            <span>ปิดใช้งาน ({disabledCount})</span>
          </button>
        </div>

        {/* Module Filter Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedModuleFilter}
            onChange={(e) => setSelectedModuleFilter(e.target.value)}
            className="form-select text-xs font-semibold py-2"
          >
            <option value="all">กรองตามโมดูลทั้งหมด</option>
            <option value="custom">เฉพาะเมนูสร้างเอง (Custom)</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Search Bar ─────────────────────────────────────────────── */}
      <div className="relative">
        <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
        <input
          type="text"
          placeholder="ค้นหาชื่อเมนู, เส้นทาง (URL Path), หรือชื่อโมดูล..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-control pl-9 py-2.5 text-xs sm:text-sm"
        />
      </div>

      {/* ─── Menu Items Table ────────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-4 font-semibold w-16 text-center">ลำดับ</th>
                <th className="py-3.5 px-4 font-semibold">ชื่อเมนู (Menu Item)</th>
                <th className="py-3.5 px-4 font-semibold">ที่มา / โมดูล</th>
                <th className="py-3.5 px-4 font-semibold">เส้นทาง (Route Path)</th>
                <th className="py-3.5 px-4 font-semibold text-center w-24">เมนูย่อย</th>
                <th className="py-3.5 px-4 font-semibold text-center w-24">สถานะ</th>
                <th className="py-3.5 px-4 font-semibold text-right w-40">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-2 text-primary-500 block"></i>
                    กำลังโหลดข้อมูลรายการเมนู...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <i className="fa-solid fa-folder-open text-3xl mb-2 text-slate-300 dark:text-slate-600 block"></i>
                    ไม่พบรายการเมนูที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const override = getOverride(item.id);
                  const isModified = !!override;

                  return (
                    <React.Fragment key={item.id}>
                      <tr className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${!item.enabled ? 'opacity-50 bg-slate-50/40 dark:bg-slate-900/40' : ''}`}>
                        {/* Order */}
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500 font-semibold">
                          {item.order}
                        </td>

                        {/* Title & Icon */}
                        <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200/50 dark:border-primary-800/50 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 shadow-xs">
                              <i className={item.icon}></i>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900 dark:text-white">{item.title}</span>
                                {isModified && (
                                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800" title="มีปรับแต่งข้อมูล">
                                    Modified
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400 mt-0.5">{item.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Module Tag */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-slate-700 dark:text-slate-300">{item.moduleName}</span>
                            {item.isCustom ? (
                              <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold border border-purple-200 dark:border-purple-800">
                                Custom
                              </span>
                            ) : item.isCore ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                                Core
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* Route Path */}
                        <td className="py-3.5 px-4">
                          <code className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400 font-mono text-xs border border-slate-200/60 dark:border-slate-700/60">
                            {item.path}
                          </code>
                        </td>

                        {/* Sub-items count */}
                        <td className="py-3.5 px-4 text-center">
                          {item.subItems && item.subItems.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
                              <i className="fa-solid fa-list text-[10px]"></i>
                              {item.subItems.length} เมนูย่อย
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">-</span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 text-center">
                          {item.enabled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              เปิดอยู่
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              ปิดใช้งาน
                            </span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Edit Button */}
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => handleOpenEditModal(item)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-primary-50 dark:bg-slate-800 dark:hover:bg-primary-950/60 text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 transition-colors disabled:opacity-50"
                              title="แก้ไขชื่อ ไอคอน และเมนูย่อย"
                            >
                              <i className="fa-solid fa-pen-to-square text-xs"></i>
                            </button>

                            {/* Toggle Enable/Disable Button */}
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => handleToggleEnable(item)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 ${
                                item.enabled
                                  ? 'bg-slate-100 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-amber-950/60 text-slate-600 hover:text-amber-600 dark:text-slate-300 dark:hover:text-amber-400'
                                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                              }`}
                              title={item.enabled ? 'ปิดใช้งานเมนูนี้' : 'เปิดใช้งานเมนูนี้'}
                            >
                              <i className={`fa-solid ${item.enabled ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                            </button>

                            {/* Delete Button (Added as requested) */}
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => handleDeleteItem(item)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 transition-colors disabled:opacity-50"
                              title="ลบเมนู"
                            >
                              <i className="fa-solid fa-trash-can text-xs"></i>
                            </button>

                            {/* Open Route */}
                            <Link
                              href={item.path}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                              title="เปิดหน้าเมนูนี้"
                            >
                              <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                            </Link>
                          </div>
                        </td>
                      </tr>

                      {/* Sub-items list expansion */}
                      {item.subItems && item.subItems.length > 0 && (
                        <tr className="bg-slate-50/40 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80">
                          <td colSpan={7} className="py-2.5 px-6">
                            <div className="pl-10 pr-4 py-1.5 border-l-2 border-primary-400 dark:border-primary-600 space-y-1.5">
                              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <i className="fa-solid fa-folder-tree text-primary-500"></i>
                                <span>รายการเมนูย่อย (Sub-items):</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {item.subItems.map((sub, sIdx) => (
                                  <Link
                                    key={sIdx}
                                    href={sub.path}
                                    className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-primary-400 dark:hover:border-primary-600 transition-all text-xs group shadow-xs"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <i className="fa-solid fa-angle-right text-primary-500 text-[10px] group-hover:translate-x-0.5 transition-transform"></i>
                                      <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                                        {sub.name}
                                      </span>
                                    </div>
                                    <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-2">
                                      {sub.path}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal for Add / Edit Menu ──────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <i className={`fa-solid ${editingMenuId ? 'fa-pen-to-square text-primary-500' : 'fa-plus-circle text-emerald-500'}`}></i>
                {editingMenuId ? 'แก้ไขข้อมูลเมนู' : 'เพิ่มเมนูใหม่ (Custom Menu)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveModal();
              }}
              className="space-y-4"
            >
              {/* Menu Title */}
              <div>
                <label htmlFor="menu-title-input" className="form-label">
                  ชื่อเมนู (Title) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="menu-title-input"
                  type="text"
                  placeholder="เช่น รายงานประจำวัน, เมนูบริการประชาชน"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="form-control"
                  required
                  autoFocus
                />
              </div>

              {/* Path & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="menu-path-input" className="form-label">
                    เส้นทาง URL (Path) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="menu-path-input"
                    type="text"
                    placeholder="เช่น /reports, /modules/custom"
                    value={editForm.path}
                    onChange={(e) => setEditForm({ ...editForm, path: e.target.value })}
                    className="form-control font-mono"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="menu-order-input" className="form-label">
                    ลำดับ (Order)
                  </label>
                  <input
                    id="menu-order-input"
                    type="number"
                    placeholder="500"
                    value={editForm.order}
                    onChange={(e) => setEditForm({ ...editForm, order: e.target.value })}
                    className="form-control font-mono"
                  />
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label htmlFor="menu-icon-input" className="form-label flex items-center justify-between">
                  <span>ไอคอน (FontAwesome Class)</span>
                  <span className="text-slate-400 font-normal">ตัวอย่าง:</span>
                </label>
                <div className="flex gap-2 items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0 text-lg">
                    <i className={editForm.icon || 'fa-solid fa-link'}></i>
                  </div>
                  <input
                    id="menu-icon-input"
                    type="text"
                    placeholder="fa-solid fa-folder"
                    value={editForm.icon}
                    onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                    className="form-control font-mono flex-1"
                  />
                </div>

                {/* Quick Icon Selector Suggestions */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-slate-400 mr-1 self-center">ไอคอนยอดนิยม:</span>
                  {PRESET_ICONS.map((iconClass) => (
                    <button
                      key={iconClass}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, icon: iconClass })}
                      className={`w-7 h-7 rounded-lg border text-xs flex items-center justify-center transition-all ${
                        editForm.icon === iconClass
                          ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-400'
                      }`}
                      title={iconClass}
                    >
                      <i className={iconClass}></i>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-items Management */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="form-label mb-0">รายการเมนูย่อย (Sub-items)</span>
                  <button
                    type="button"
                    onClick={addSubItem}
                    className="px-2.5 py-1 bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <i className="fa-solid fa-plus text-[10px]"></i>
                    <span>+ เพิ่มเมนูย่อย</span>
                  </button>
                </div>

                {editForm.subItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">ไม่มีเมนูย่อย (กดปุ่ม "+ เพิ่มเมนูย่อย" หากต้องการ)</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {editForm.subItems.map((sub, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                        <input
                          type="text"
                          placeholder="ชื่อเมนูย่อย"
                          value={sub.name}
                          onChange={(e) => updateSubItem(sIdx, 'name', e.target.value)}
                          className="form-control text-xs py-1.5 flex-1"
                        />
                        <input
                          type="text"
                          placeholder="Path (/...)"
                          value={sub.path}
                          onChange={(e) => updateSubItem(sIdx, 'path', e.target.value)}
                          className="form-control text-xs py-1.5 font-mono flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeSubItem(sIdx)}
                          className="w-7 h-7 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 flex items-center justify-center shrink-0 transition-colors"
                          title="ลบเมนูย่อยนี้"
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-primary-600/25 transition-colors disabled:opacity-50"
                >
                  {isSaving ? <i className="fa-solid fa-circle-notch fa-spin mr-1"></i> : null}
                  บันทึกเมนู
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Styled Confirmation Modal for Delete ─────────────────── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.isCustom ? 'ยืนยันการลบเมนูสร้างเอง?' : 'ยืนยันการปิดใช้งานเมนูระบบ?'}
        message={
          deleteTarget?.isCustom
            ? `คุณแน่ใจหรือไม่ที่จะลบเมนูคัสตอม "${deleteTarget.title}" (${deleteTarget.path}) ออกจากระบบ? การลบนี้จะไม่สามารถกู้คืนได้`
            : `คุณแน่ใจหรือไม่ที่จะปิดการใช้งานเมนู "${deleteTarget?.title}"? เมนูนี้จะถูกซ่อนจากแถบข้าง (Sidebar)`
        }
        confirmText={deleteTarget?.isCustom ? 'ลบเมนูนี้' : 'ปิดใช้งาน'}
        cancelText="ยกเลิก"
        isDestructive={true}
        onConfirm={confirmExecuteDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
