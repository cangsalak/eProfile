'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/common/ConfirmModal';
import { ModuleRegistry, ALL_SYSTEM_MODULES } from '@/modules/core/registry';
import { Button } from '@/components/ui';

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  permissions: string; // JSON string
  isSystem: boolean;
  createdAt: string;
}

interface RoleSettingsProps {
  settings?: any;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'MANAGE_SYSTEM', label: 'ตั้งค่าระบบ', description: 'จัดการหน้าการตั้งค่า โลโก้ รูปแบบบัตร และฟังก์ชันพื้นฐาน' },
  { id: 'MANAGE_ROLES', label: 'จัดการสิทธิ์การใช้งาน (Roles)', description: 'เพิ่ม/ลด และตั้งค่าสิทธิ์ให้กลุ่มต่างๆ' },
  { id: 'MANAGE_PERSONNEL', label: 'จัดการข้อมูลกำลังพล', description: 'เพิ่ม แก้ไข ลบ ข้อมูลประวัติบุคลากรทั้งหมด' },
  { id: 'MANAGE_DEPARTMENTS', label: 'จัดการโครงสร้างหน่วยงาน', description: 'เพิ่ม/แก้ไข รายชื่อแผนก/กอง' },
  { id: 'MANAGE_POSTS', label: 'จัดการประกาศข่าวสาร', description: 'สร้างและเผยแพร่ประกาศไปยังผู้ใช้ทั้งหมด' },
  { id: 'MANAGE_CONTACTS', label: 'ดูข้อความติดต่อ', description: 'อ่านข้อความจากหน้าติดต่อเรา' },
  { id: 'APPROVE_LEAVE', label: 'อนุมัติการลา', description: 'สามารถพิจารณาอนุมัติ/ปฏิเสธ คำร้องขอลาของกำลังพลได้' },
  { id: 'VIEW_AUDIT_LOGS', label: 'ดูประวัติการใช้งาน (Audit Logs)', description: 'เข้าถึงบันทึกกิจกรรมการใช้งานระบบทั้งหมด' },
  { id: 'VIEW_RUNTIME_INSPECTOR', label: 'เข้าถึง Runtime Inspector', description: 'ตรวจสอบสถานะระบบ ประสิทธิภาพ และสแกนหน้าจอ' },
];

export default function RoleSettings({ settings }: RoleSettingsProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentRole, setCurrentRole] = useState<Partial<Role>>({});
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Compute combined permissions dynamically from active modules
  const allPermissions = useMemo(() => {
    let enabledModuleIds: string[] = [];
    try {
      if (typeof settings?.enabledModules === 'string') {
        enabledModuleIds = JSON.parse(settings.enabledModules);
      } else if (Array.isArray(settings?.enabledModules)) {
        enabledModuleIds = settings.enabledModules;
      } else {
        enabledModuleIds = ALL_SYSTEM_MODULES.map((m) => m.id);
      }
    } catch {
      enabledModuleIds = ALL_SYSTEM_MODULES.map((m) => m.id);
    }

    const modulePerms = ModuleRegistry.getAllModulePermissions(enabledModuleIds);
    const combined = [...AVAILABLE_PERMISSIONS];

    modulePerms.forEach((mp) => {
      if (!combined.some((c) => c.id === mp.key)) {
        combined.push({
          id: mp.key,
          label: `${mp.name} (${mp.moduleName})`,
          description: mp.description,
        });
      }
    });

    return combined;
  }, [settings]);

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (e) {
      console.error(e);
      toast.error('ไม่สามารถโหลดข้อมูลสิทธิ์ได้');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleEdit = (role: Role) => {
    setCurrentRole(role);
    try {
      setSelectedPermissions(JSON.parse(role.permissions || '[]'));
    } catch {
      setSelectedPermissions([]);
    }
    setIsEditing(true);
  };

  const handleCreate = () => {
    setCurrentRole({
      name: '',
      displayName: '',
      description: '',
      isSystem: false,
    });
    setSelectedPermissions([]);
    setIsEditing(true);
  };

  const handleTogglePermission = (permId: string) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((id) => id !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedPermissions.length === allPermissions.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(allPermissions.map((p) => p.id));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRole.name || !currentRole.displayName) {
      toast.error('กรุณากรอกชื่ออ้างอิงและชื่อแสดงผลของ Role');
      return;
    }

    try {
      const isNew = !currentRole.id;
      const url = isNew ? '/api/roles' : `/api/roles/${currentRole.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const payload = {
        ...currentRole,
        permissions: selectedPermissions,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(isNew ? 'สร้าง Role ใหม่สำเร็จ' : 'อัปเดต Role สำเร็จ');
        setIsEditing(false);
        fetchRoles();
      } else {
        const data = await res.json();
        toast.error(data.error || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (e) {
      console.error(e);
      toast.error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  const handleDelete = async () => {
    if (!deleteRoleId) return;
    try {
      const res = await fetch(`/api/roles/${deleteRoleId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('ลบ Role สำเร็จ');
        setDeleteRoleId(null);
        fetchRoles();
      } else {
        const data = await res.json();
        toast.error(data.error || 'ไม่สามารถลบ Role นี้ได้');
      }
    } catch (e) {
      console.error(e);
      toast.error('เกิดข้อผิดพลาดในการลบ');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-user-shield text-primary-600 dark:text-primary-400"></i>
            <span>กำหนดบทบาทและสิทธิ์การใช้งาน (Role & Permission Matrix)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            จัดการสิทธิ์การเข้าถึงเมนูและฟังก์ชันต่างๆ ในระบบตามบทบาทผู้ใช้
          </p>
        </div>

        {!isEditing && (
          <Button
            variant="primary"
            size="sm"
            icon="fa-solid fa-plus"
            onClick={handleCreate}
          >
            สร้าง Role ใหม่
          </Button>
        )}
      </div>

      {isEditing ? (
        /* Edit/Create Form Card */
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-fade-in space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-pen-to-square text-primary-500"></i>
              <span>{currentRole.id ? `แก้ไขบทบาท: ${currentRole.displayName}` : 'สร้างบทบาทใหม่'}</span>
            </h3>
            <Button
              variant="outline"
              size="sm"
              icon="fa-solid fa-xmark"
              onClick={() => setIsEditing(false)}
            >
              ยกเลิก
            </Button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ชื่ออ้างอิงของ Role (ภาษาอังกฤษพิมพ์ใหญ่ เช่น HR_ADMIN) *
                </label>
                <input
                  type="text"
                  required
                  disabled={currentRole.isSystem && !!currentRole.id}
                  value={currentRole.name || ''}
                  onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
                  placeholder="เช่น HR_MANAGER"
                  className="form-input text-xs font-mono disabled:opacity-50"
                />
              </div>

              <div className="form-control">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ชื่อแสดงผลภาษาไทย (Display Name) *
                </label>
                <input
                  type="text"
                  required
                  value={currentRole.displayName || ''}
                  onChange={(e) => setCurrentRole({ ...currentRole, displayName: e.target.value })}
                  placeholder="เช่น เจ้าหน้าที่ฝ่ายบุคคล"
                  className="form-input text-xs"
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  คำอธิบายหน้าที่ / ขอบเขตความรับผิดชอบ
                </label>
                <textarea
                  rows={2}
                  value={currentRole.description || ''}
                  onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
                  placeholder="ระบุคำอธิบายสั้นๆ..."
                  className="form-textarea text-xs"
                />
              </div>
            </div>

            {/* Permission Matrix */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <i className="fa-solid fa-key text-amber-500"></i>
                    <span>กำหนดสิทธิ์การใช้งาน ({selectedPermissions.length} / {allPermissions.length} สิทธิ์)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">เลือกสิทธิ์ที่ต้องการมอบหมายให้กับบทบาทนี้</p>
                </div>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {selectedPermissions.length === allPermissions.length ? 'ยกเลิกการเลือกทั้งหมด' : 'เลือกทั้งหมด'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allPermissions.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm.id);
                  return (
                    <div
                      key={perm.id}
                      onClick={() => handleTogglePermission(perm.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                        isChecked
                          ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-primary-600 focus:ring-primary-500"
                      />
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {perm.label}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                          {perm.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                ยกเลิก
              </Button>
              <Button variant="primary" size="sm" icon="fa-solid fa-floppy-disk" type="submit">
                บันทึกบทบาท
              </Button>
            </div>
          </form>
        </div>
      ) : (
        /* Roles List Table */
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">ชื่อบทบาท</th>
                  <th className="py-3 px-4">ชื่ออ้างอิงระบบ</th>
                  <th className="py-3 px-4">คำอธิบาย</th>
                  <th className="py-3 px-4">สิทธิ์ที่ได้รับ</th>
                  <th className="py-3 px-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      ไม่พบข้อมูลบทบาทในระบบ
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => {
                    let permsCount = 0;
                    try {
                      permsCount = JSON.parse(role.permissions || '[]').length;
                    } catch {}

                    return (
                      <tr key={role.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{role.displayName}</span>
                          {role.isSystem && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                              SYSTEM
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300 font-semibold">
                          {role.name}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {role.description || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-900/50">
                            {permsCount} สิทธิ์
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEdit(role)}
                              className="p-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
                            >
                              แก้ไข
                            </button>
                            {!role.isSystem && (
                              <button
                                onClick={() => setDeleteRoleId(role.id)}
                                className="p-1.5 px-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-medium transition-colors"
                              >
                                ลบ
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteRoleId}
        title="ยืนยันการลบบทบาทนี้?"
        message="คุณแน่ใจหรือไม่ที่จะลบ Role นี้? ผู้ใช้งานที่มีบทบาทนี้อาจสูญเสียสิทธิ์การเข้าถึง"
        confirmText="ยืนยันการลบ"
        cancelText="ยกเลิก"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteRoleId(null)}
      />
    </div>
  );
}
