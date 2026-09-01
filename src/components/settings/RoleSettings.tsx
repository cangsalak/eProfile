import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  permissions: string; // JSON string
  isSystem: boolean;
  createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'MANAGE_SYSTEM', label: 'ตั้งค่าระบบ', description: 'จัดการหน้าการตั้งค่า โลโก้ รูปแบบบัตร และฟังก์ชันพื้นฐาน' },
  { id: 'MANAGE_ROLES', label: 'จัดการสิทธิ์การใช้งาน (Roles)', description: 'เพิ่ม/ลด และตั้งค่าสิทธิ์ให้กลุ่มต่างๆ' },
  { id: 'MANAGE_PERSONNEL', label: 'จัดการข้อมูลกำลังพล', description: 'เพิ่ม แก้ไข ลบ ข้อมูลประวัติบุคลากรทั้งหมด' },
  { id: 'MANAGE_DEPARTMENTS', label: 'จัดการโครงสร้างหน่วยงาน', description: 'เพิ่ม/แก้ไข รายชื่อแผนก/กอง' },
  { id: 'MANAGE_POSTS', label: 'จัดการประกาศข่าวสาร', description: 'สร้างและเผยแพร่ประกาศไปยังผู้ใช้ทั้งหมด' },
  { id: 'MANAGE_CONTACTS', label: 'ดูข้อความติดต่อ', description: 'อ่านข้อความจากหน้าติดต่อเรา' },
  { id: 'APPROVE_LEAVE', label: 'อนุมัติการลา', description: 'สามารถพิจารณาอนุมัติ/ปฏิเสธ คำร้องขอลาของกำลังพลได้' },
  { id: 'VIEW_AUDIT_LOGS', label: 'ดูประวัติการใช้งาน (Audit Logs)', description: 'เข้าถึงบันทึกกิจกรรมการใช้งานระบบทั้งหมด' }
];

export default function RoleSettings() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentRole, setCurrentRole] = useState<Partial<Role>>({});
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (err) {
      console.error(err);
      toast.error('โหลดข้อมูล Role ไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (role: Role) => {
    setCurrentRole(role);
    try {
      setSelectedPermissions(JSON.parse(role.permissions || '[]'));
    } catch (e) {
      setSelectedPermissions([]);
    }
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setCurrentRole({ name: '', displayName: '', description: '' });
    setSelectedPermissions([]);
    setIsEditing(true);
  };

  const togglePermission = (permId: string) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdate = !!currentRole.id;
    const method = isUpdate ? 'PUT' : 'POST';
    const url = isUpdate ? `/api/roles/${currentRole.id}` : '/api/roles';

    const payload = {
      ...currentRole,
      permissions: selectedPermissions
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(isUpdate ? 'อัปเดตสิทธิ์สำเร็จ' : 'เพิ่ม Role ใหม่สำเร็จ');
        setIsEditing(false);
        fetchRoles();
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบ Role นี้? ผู้ใช้งานที่ใช้ Role นี้จะไม่สามารถเข้าสู่ระบบได้จนกว่าจะได้รับ Role ใหม่')) return;
    
    try {
      const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success('ลบสำเร็จ');
        fetchRoles();
      } else {
        toast.error(data.error || 'ไม่สามารถลบได้');
      }
    } catch (err) {
      toast.error('เชื่อมต่อไม่สำเร็จ');
    }
  };

  if (isLoading) return <div className="p-8 text-center"><i className="fa-solid fa-spinner fa-spin text-3xl text-primary-500"></i></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            <i className="fa-solid fa-user-shield text-primary-500 mr-2"></i>
            สิทธิ์การใช้งาน (Roles & Permissions)
          </h3>
          <p className="text-sm text-slate-500 mt-1">กำหนดระดับสิทธิ์ และการเข้าถึงระบบของบุคลากร</p>
        </div>
        {!isEditing && (
          <button 
            onClick={handleCreateNew}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm font-medium transition-colors whitespace-nowrap"
          >
            <i className="fa-solid fa-plus mr-2"></i> เพิ่ม Role ใหม่
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-fade-in">
          <h4 className="text-lg font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            {currentRole.id ? 'แก้ไข Role' : 'สร้าง Role ใหม่'}
          </h4>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="roleNameInput" className="block text-sm font-medium mb-1">รหัสอ้างอิง (Role Name) <span className="text-red-500">*</span></label>
                <input 
                  id="roleNameInput"
                  aria-label="รหัสอ้างอิง Role"
                  required
                  type="text" 
                  value={currentRole.name || ''}
                  onChange={(e) => setCurrentRole({...currentRole, name: e.target.value.toUpperCase()})}
                  disabled={currentRole.isSystem}
                  placeholder="เช่น HR_MANAGER (ภาษาอังกฤษเท่านั้น)"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg disabled:opacity-60 font-mono text-sm"
                />
                {currentRole.isSystem && <p className="text-xs text-amber-500 mt-1"><i className="fa-solid fa-info-circle"></i> สิทธิ์พื้นฐานของระบบไม่สามารถเปลี่ยนรหัสอ้างอิงได้</p>}
              </div>
              <div>
                <label htmlFor="roleDisplayNameInput" className="block text-sm font-medium mb-1">ชื่อสิทธิ์ (Display Name) <span className="text-red-500">*</span></label>
                <input 
                  id="roleDisplayNameInput"
                  aria-label="ชื่อสิทธิ์ Display Name"
                  required
                  type="text" 
                  value={currentRole.displayName || ''}
                  onChange={(e) => setCurrentRole({...currentRole, displayName: e.target.value})}
                  placeholder="เช่น เจ้าหน้าที่ฝ่ายบุคคล"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="roleDescriptionInput" className="block text-sm font-medium mb-1">คำอธิบาย</label>
                <input 
                  id="roleDescriptionInput"
                  aria-label="คำอธิบายสิทธิ์"
                  type="text" 
                  value={currentRole.description || ''}
                  onChange={(e) => setCurrentRole({...currentRole, description: e.target.value})}
                  placeholder="หน้าที่และขอบเขตของสิทธิ์นี้"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-slate-900 dark:text-white mb-3">กำหนดสิทธิ์การเข้าถึง (Permissions)</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AVAILABLE_PERMISSIONS.map(perm => (
                  <label key={perm.id} className={`flex items-start p-3 border rounded-xl cursor-pointer transition-colors ${selectedPermissions.includes(perm.id) ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                    <div className="pt-0.5">
                      <input 
                        type="checkbox" 
                        aria-label={`สิทธิ์ ${perm.label}`}
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <span className="block text-sm font-medium text-slate-900 dark:text-white">{perm.label}</span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{perm.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm font-medium transition-colors flex items-center"
              >
                <i className="fa-solid fa-save mr-2"></i> บันทึก
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(role => {
            let perms: string[] = [];
            try { perms = JSON.parse(role.permissions || '[]'); } catch(e){}
            
            return (
              <div key={role.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                      {role.displayName} 
                      {role.isSystem && <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-full uppercase">System Role</span>}
                    </h4>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{role.name}</p>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(role)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="แก้ไข">
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    {!role.isSystem && (
                      <button onClick={() => handleDelete(role.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="ลบ">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-1">
                  {role.description || <span className="italic opacity-50">ไม่มีคำอธิบาย</span>}
                </p>
                
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-auto">
                  <p className="text-xs font-medium text-slate-500 mb-2">
                    <i className="fa-solid fa-key mr-1"></i> สิทธิ์ที่มี ({perms.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {perms.length === 0 ? (
                      <span className="text-[10px] text-slate-400 italic">สิทธิ์พื้นฐานทั่วไป</span>
                    ) : (
                      perms.slice(0, 3).map(p => {
                        const permDef = AVAILABLE_PERMISSIONS.find(ap => ap.id === p);
                        return (
                          <span key={p} className="text-[10px] bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 px-1.5 py-0.5 rounded" title={permDef?.label}>
                            {permDef?.label || p}
                          </span>
                        );
                      })
                    )}
                    {perms.length > 3 && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">+{perms.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
