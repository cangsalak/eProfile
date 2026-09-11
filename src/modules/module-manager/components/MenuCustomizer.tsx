'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ALL_SYSTEM_MODULES, MenuOverride } from '@/lib/modules';
import { Card, Button, Badge, Input } from '@/components/ui';
import ConfirmModal from '@/components/common/ConfirmModal';
import {
  Menu,
  Eye,
  EyeOff,
  Edit2,
  RotateCcw,
  Plus,
  Trash2,
  Save,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Shield,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface MenuCustomizerProps {
  settings: any;
  setSettings: (newSettings: any) => void;
}

interface FullMenuItem {
  id: string;
  moduleId: string;
  moduleName: string;
  moduleCategory: string;
  title: string;
  icon: string;
  path: string;
  order: number;
  enabled: boolean;
  isCustom?: boolean;
  requiredRoles?: string[];
  requiredPermission?: string;
  subItems?: { name: string; path: string }[];
  isOverridden?: boolean;
}

const COMMON_ICONS = [
  'fa-solid fa-gauge-high',
  'fa-solid fa-user-tie',
  'fa-solid fa-users',
  'fa-solid fa-calendar-check',
  'fa-solid fa-calendar-days',
  'fa-solid fa-car',
  'fa-solid fa-id-card',
  'fa-solid fa-newspaper',
  'fa-solid fa-address-book',
  'fa-solid fa-puzzle-piece',
  'fa-solid fa-bars-staggered',
  'fa-solid fa-shield-halved',
  'fa-solid fa-book',
  'fa-solid fa-palette',
  'fa-solid fa-database',
  'fa-solid fa-file-invoice-dollar',
  'fa-solid fa-gear',
  'fa-solid fa-chart-pie',
  'fa-solid fa-envelope',
  'fa-solid fa-bell',
];

export default function MenuCustomizer({ settings, setSettings }: MenuCustomizerProps) {
  // Parse menu overrides from settings
  let menuOverrides: MenuOverride[] = [];
  try {
    if (typeof settings.menuOverrides === 'string') {
      menuOverrides = JSON.parse(settings.menuOverrides);
    } else if (Array.isArray(settings.menuOverrides)) {
      menuOverrides = settings.menuOverrides;
    }
  } catch {
    menuOverrides = [];
  }

  // Parse enabled modules
  let enabledModuleIds: string[] = [];
  try {
    if (typeof settings.enabledModules === 'string') {
      enabledModuleIds = JSON.parse(settings.enabledModules);
    } else if (Array.isArray(settings.enabledModules)) {
      enabledModuleIds = settings.enabledModules;
    } else {
      enabledModuleIds = ALL_SYSTEM_MODULES.map((m) => m.id);
    }
  } catch {
    enabledModuleIds = ALL_SYSTEM_MODULES.map((m) => m.id);
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<FullMenuItem | null>(null);
  const [isNewMenuModalOpen, setIsNewMenuModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // New custom menu form state
  const [newMenuForm, setNewMenuForm] = useState({
    title: '',
    path: '',
    icon: 'fa-solid fa-link',
    order: 50,
  });

  // Build combined menu list from all modules + custom overrides
  const combinedMenus: FullMenuItem[] = [];

  // 1. Collect all default menus from registered modules
  ALL_SYSTEM_MODULES.forEach((mod) => {
    if (!mod.menus) return;
    mod.menus.forEach((m) => {
      const override = menuOverrides.find((o) => o.id === m.id);
      combinedMenus.push({
        id: m.id,
        moduleId: mod.id,
        moduleName: mod.name,
        moduleCategory: mod.category || 'system',
        title: override?.title || m.title,
        icon: override?.icon || m.icon || 'fa-solid fa-cube',
        path: override?.path || m.path,
        order: override?.order !== undefined ? override.order : (m.order || 50),
        enabled: override?.enabled !== undefined ? override.enabled : true,
        requiredRoles: m.requiredRoles,
        requiredPermission: m.requiredPermission,
        subItems: m.subItems,
        isOverridden: !!override,
      });
    });
  });

  // 2. Add custom user-created menu items
  menuOverrides
    .filter((o) => o.isCustom)
    .forEach((o) => {
      combinedMenus.push({
        id: o.id,
        moduleId: 'custom',
        moduleName: 'เมนูกำหนดเอง (Custom)',
        moduleCategory: 'custom',
        title: o.title || 'เมนูใหม่',
        icon: o.icon || 'fa-solid fa-link',
        path: o.path || '#',
        order: o.order !== undefined ? o.order : 99,
        enabled: o.enabled !== undefined ? o.enabled : true,
        isCustom: true,
        isOverridden: true,
      });
    });

  // Sort by order ascending
  combinedMenus.sort((a, b) => a.order - b.order);

  // Filtered menus
  const filteredMenus = combinedMenus.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.path.toLowerCase().includes(q) ||
      m.moduleName.toLowerCase().includes(q)
    );
  });

  // Save changes to settings & broadcast
  const saveOverrides = (newOverrides: MenuOverride[]) => {
    const updated = {
      ...settings,
      menuOverrides: JSON.stringify(newOverrides),
    };
    setSettings(updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('eprofile-settings-change', {
          detail: updated,
        })
      );
    }
  };

  // Toggle show/hide
  const handleToggleMenu = (item: FullMenuItem) => {
    const existingIndex = menuOverrides.findIndex((o) => o.id === item.id);
    let updated: MenuOverride[];

    if (existingIndex >= 0) {
      updated = menuOverrides.map((o) =>
        o.id === item.id ? { ...o, enabled: !item.enabled } : o
      );
    } else {
      updated = [
        ...menuOverrides,
        {
          id: item.id,
          title: item.title,
          path: item.path,
          icon: item.icon,
          order: item.order,
          enabled: !item.enabled,
        },
      ];
    }

    saveOverrides(updated);
    toast.success(
      !item.enabled
        ? `แสดงเมนู "${item.title}" ในแถบนำทางแล้ว`
        : `ซ่อนเมนู "${item.title}" จากแถบนำทางแล้ว`
    );
  };

  // Move menu item order up or down
  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === filteredMenus.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const current = filteredMenus[index];
    const target = filteredMenus[targetIndex];

    const newCurrentOrder = target.order;
    const newTargetOrder = current.order === target.order
      ? direction === 'up' ? target.order + 1 : target.order - 1
      : current.order;

    let updated = [...menuOverrides];

    const updateOrAdd = (item: FullMenuItem, newOrder: number) => {
      const idx = updated.findIndex((o) => o.id === item.id);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], order: newOrder };
      } else {
        updated.push({
          id: item.id,
          title: item.title,
          path: item.path,
          icon: item.icon,
          enabled: item.enabled,
          order: newOrder,
        });
      }
    };

    updateOrAdd(current, newCurrentOrder);
    updateOrAdd(target, newTargetOrder);

    saveOverrides(updated);
    toast.success(`ปรับลำดับเมนูเรียบร้อยแล้ว`);
  };

  // Save edit item modal
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const existingIndex = menuOverrides.findIndex((o) => o.id === editingItem.id);
    let updated: MenuOverride[];

    if (existingIndex >= 0) {
      updated = menuOverrides.map((o) =>
        o.id === editingItem.id
          ? {
              ...o,
              title: editingItem.title,
              icon: editingItem.icon,
              order: Number(editingItem.order),
              path: editingItem.path,
            }
          : o
      );
    } else {
      updated = [
        ...menuOverrides,
        {
          id: editingItem.id,
          title: editingItem.title,
          icon: editingItem.icon,
          order: Number(editingItem.order),
          path: editingItem.path,
          enabled: editingItem.enabled,
        },
      ];
    }

    saveOverrides(updated);
    setEditingItem(null);
    toast.success(`บันทึกการปรับแต่งเมนู "${editingItem.title}" เรียบร้อยแล้ว`);
  };

  // Reset single item
  const handleResetItem = (item: FullMenuItem) => {
    const updated = menuOverrides.filter((o) => o.id !== item.id);
    saveOverrides(updated);
    toast.success(`คืนค่าเมนู "${item.title}" เป็นค่าเริ่มต้นแล้ว`);
  };

  // Add custom menu link
  const handleCreateCustomMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuForm.title.trim() || !newMenuForm.path.trim()) {
      toast.error('กรุณากรอกชื่อเมนูและลิงก์ปลายทาง');
      return;
    }

    const customId = `custom-menu-${Date.now()}`;
    const newOverride: MenuOverride = {
      id: customId,
      title: newMenuForm.title.trim(),
      path: newMenuForm.path.trim(),
      icon: newMenuForm.icon || 'fa-solid fa-link',
      order: Number(newMenuForm.order) || 99,
      enabled: true,
      isCustom: true,
    };

    const updated = [...menuOverrides, newOverride];
    saveOverrides(updated);
    setIsNewMenuModalOpen(false);
    setNewMenuForm({
      title: '',
      path: '',
      icon: 'fa-solid fa-link',
      order: 50,
    });
    toast.success(`เพิ่มเมนูกำหนดเอง "${newOverride.title}" สำเร็จ`);
  };

  // Delete custom menu link
  const handleDeleteCustomMenu = (item: FullMenuItem) => {
    const updated = menuOverrides.filter((o) => o.id !== item.id);
    saveOverrides(updated);
    toast.success(`ลบเมนู "${item.title}" เรียบร้อยแล้ว`);
  };

  // Reset all to system defaults
  const handleResetAll = () => {
    saveOverrides([]);
    setIsResetConfirmOpen(false);
    toast.success('คืนค่าเมนูระบบทั้งหมดเป็นค่าเริ่มต้นจากโมดูลเรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-6 animate-fade-in font-prompt">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-primary-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-primary-200" />
            <span>ปรับแต่งโครงสร้างเมนูและแถบนำทางระบบ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            ตัวจัดการเมนูระบบ (Menu Customizer)
          </h1>
          <p className="text-sm sm:text-base text-primary-100 leading-relaxed">
            จัดการชื่อเมนู, ไอคอน, ลำดับการแสดงผล และการเปิด/ปิดเมนูของโมดูลทั้งหมดในที่เดียว
            พร้อมการแสดงผลแบบ Real-time บนแถบนำทาง (Sidebar Navigation)
          </p>
        </div>
        <div className="absolute -right-8 -bottom-10 opacity-15 pointer-events-none">
          <Menu className="h-64 w-64 text-white" />
        </div>
      </div>

      {/* Action Toolbar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="ค้นหาชื่อเมนู, ลิงก์, หรือโมดูล..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setIsResetConfirmOpen(true)}
              className="gap-2 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400"
            >
              <RotateCcw className="h-4 w-4" />
              <span>คืนค่าเริ่มต้นทั้งหมด</span>
            </Button>

            <Button
              variant="primary"
              onClick={() => setIsNewMenuModalOpen(true)}
              className="gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>เพิ่มเมนูกำหนดเอง</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Menu Tree List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <span>รายการเมนูในระบบ ({filteredMenus.length} รายการ)</span>
          <span>การจัดการและลำดับ</span>
        </div>

        {filteredMenus.length === 0 ? (
          <Card className="p-12 text-center">
            <Layers className="h-12 w-12 mx-auto text-slate-400 mb-3 opacity-60" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
              ไม่พบรายการเมนูที่ค้นหา
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              ลองเปลี่ยนคำค้นหา หรือกดปุ่ม &ldquo;เพิ่มเมนูกำหนดเอง&rdquo;
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {filteredMenus.map((item, index) => {
              const isModuleActive =
                item.moduleId === 'custom' || enabledModuleIds.includes(item.moduleId);

              return (
                <Card
                  key={item.id}
                  className={`p-4 transition-all duration-200 hover:shadow-md ${
                    !item.enabled || !isModuleActive
                      ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/40 border-dashed'
                      : 'bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Icon & Info */}
                    <div className="flex items-start sm:items-center gap-3.5">
                      {/* Drag / Order Indicator */}
                      <div className="flex sm:flex-col items-center gap-1 text-slate-400">
                        <button
                          onClick={() => handleMoveOrder(index, 'up')}
                          disabled={index === 0}
                          title="ย้ายขึ้น"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(index, 'down')}
                          disabled={index === filteredMenus.length - 1}
                          title="ย้ายลง"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Icon Avatar */}
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center border border-primary-100 dark:border-primary-900/50 shadow-sm">
                        <i className={`${item.icon} text-lg`}></i>
                      </div>

                      {/* Details */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-slate-900 dark:text-white text-base">
                            {item.title}
                          </h4>
                          {item.isOverridden && (
                            <Badge variant="primary" className="text-[10px] py-0 px-1.5 font-normal">
                              ปรับแต่งแล้ว
                            </Badge>
                          )}
                          {item.isCustom && (
                            <Badge variant="success" className="text-[10px] py-0 px-1.5 font-normal">
                              Custom Link
                            </Badge>
                          )}
                          {!isModuleActive && (
                            <Badge variant="warning" className="text-[10px] py-0 px-1.5 font-normal">
                              โมดูลถูกปิดอยู่
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                          <span className="font-mono text-slate-400">{item.path}</span>
                          <span>•</span>
                          <span>โมดูล: {item.moduleName}</span>
                          <span>•</span>
                          <span>ลำดับ: {item.order}</span>
                          {item.requiredPermission && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600 dark:text-amber-400">
                                สิทธิ์: {item.requiredPermission}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleMenu(item)}
                        className={`gap-1.5 text-xs ${
                          item.enabled
                            ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title={item.enabled ? 'คลิกเพื่อซ่อนเมนู' : 'คลิกเพื่อแสดงเมนู'}
                      >
                        {item.enabled ? (
                          <>
                            <Eye className="h-3.5 w-3.5" />
                            <span>แสดงอยู่</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            <span>ซ่อนอยู่</span>
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingItem(item)}
                        className="gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>แก้ไข</span>
                      </Button>

                      {item.isCustom ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCustomMenu(item)}
                          className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="ลบเมนูกำหนดเอง"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        item.isOverridden && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetItem(item)}
                            className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                            title="คืนค่าเป็นค่าเริ่มต้น"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Menu Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    ปรับแต่งเมนู: {editingItem.title}
                  </h3>
                  <p className="text-xs text-slate-500">ID: {editingItem.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  ชื่อเมนูที่แสดง (Title)
                </label>
                <Input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  ลิงก์ปลายทาง (Path / URL)
                </label>
                <Input
                  type="text"
                  required
                  value={editingItem.path}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, path: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    ลำดับการแสดง (Order)
                  </label>
                  <Input
                    type="number"
                    value={editingItem.order}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        order: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    FontAwesome Icon Class
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={editingItem.icon}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, icon: e.target.value })
                      }
                    />
                    <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary-600">
                      <i className={editingItem.icon}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Icon Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  เลือกไอคอนด่วน
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 max-h-24 overflow-y-auto">
                  {COMMON_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, icon: ic })}
                      className={`h-7 w-7 rounded flex items-center justify-center text-sm transition ${
                        editingItem.icon === ic
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <i className={ic}></i>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" variant="primary" className="gap-1.5">
                  <Save className="h-4 w-4" />
                  <span>บันทึกการแก้ไข</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Menu Modal */}
      {isNewMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    เพิ่มเมนูกำหนดเองใหม่
                  </h3>
                  <p className="text-xs text-slate-500">
                    สร้างลิงก์ภายในหรือภายนอกเพิ่มลงในแถบนำทาง
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewMenuModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomMenu} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  ชื่อเมนู (Title) *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="เช่น คู่มือการใช้งานระบบ, ลิงก์ภายนอก"
                  value={newMenuForm.title}
                  onChange={(e) =>
                    setNewMenuForm({ ...newMenuForm, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  ลิงก์ปลายทาง (Path / URL) *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="เช่น /custom-page หรือ https://example.com"
                  value={newMenuForm.path}
                  onChange={(e) =>
                    setNewMenuForm({ ...newMenuForm, path: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    ลำดับการแสดง (Order)
                  </label>
                  <Input
                    type="number"
                    value={newMenuForm.order}
                    onChange={(e) =>
                      setNewMenuForm({
                        ...newMenuForm,
                        order: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    ไอคอน
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={newMenuForm.icon}
                      onChange={(e) =>
                        setNewMenuForm({ ...newMenuForm, icon: e.target.value })
                      }
                    />
                    <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary-600">
                      <i className={newMenuForm.icon}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Icon Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  เลือกไอคอนด่วน
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 max-h-24 overflow-y-auto">
                  {COMMON_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewMenuForm({ ...newMenuForm, icon: ic })}
                      className={`h-7 w-7 rounded flex items-center justify-center text-sm transition ${
                        newMenuForm.icon === ic
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <i className={ic}></i>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewMenuModalOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" variant="primary" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  <span>เพิ่มเมนู</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Reset All Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onCancel={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetAll}
        title="คืนค่าเมนูระบบทั้งหมด?"
        message="การดำเนินการนี้จะยกเลิกการปรับแต่งชื่อ ลำดับ และการซ่อนเมนูทั้งหมด โดยจะกลับไปใช้ค่าเริ่มต้นที่กำหนดไว้ในแต่ละโมดูล"
        confirmText="ยืนยันการคืนค่า"
        cancelText="ยกเลิก"
        isDestructive={false}
      />
    </div>
  );
}
