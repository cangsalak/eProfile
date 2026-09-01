import React from 'react';
import { Personnel } from '@/types/personnel';

export interface DepartmentItem {
  id: string;
  name: string;
  shortName?: string;
  subDepartments?: any;
}

interface MilitaryInfoFormProps {
  formData: Partial<Personnel>;
  setFormData: (data: Partial<Personnel>) => void;
  departments: DepartmentItem[];
  personnelTypes: string[];
  statusList: string[];
  isProfile?: boolean;
  roles?: { name: string; displayName: string }[];
}

export default function MilitaryInfoForm({ 
  formData, 
  setFormData, 
  departments, 
  personnelTypes, 
  statusList, 
  isProfile, 
  roles = [] 
}: MilitaryInfoFormProps) {

  // Extract sub-departments for the selected department
  const selectedDeptObj = departments.find(d => d.name === formData.department);
  let availableSubDepts: { name: string; shortName?: string }[] = [];
  
  if (selectedDeptObj?.subDepartments) {
    if (Array.isArray(selectedDeptObj.subDepartments)) {
      availableSubDepts = selectedDeptObj.subDepartments.map(item => {
        if (typeof item === 'string') return { name: item, shortName: '' };
        return item;
      });
    } else if (typeof selectedDeptObj.subDepartments === 'string') {
      try {
        const parsed = JSON.parse(selectedDeptObj.subDepartments);
        if (Array.isArray(parsed)) {
          availableSubDepts = parsed.map(item => {
            if (typeof item === 'string') return { name: item, shortName: '' };
            return item;
          });
        }
      } catch (_) {}
    }
  }

  return (
    <div>
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 mt-6 flex items-center gap-2">
        <i className="fa-solid fa-shield-halved text-primary-500"></i> ข้อมูลการปฏิบัติราชการ
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            ตำแหน่งหน้าที่ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="เช่น ผบ.ร้อย., เสมียน, นายทหารส่งกำลัง"
            value={formData.position || ''}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
            required
          />
        </div>

        {!isProfile && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              ประเภทกำลังพล <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.personnelType || personnelTypes[0] || ''}
              onChange={(e) => setFormData({ ...formData, personnelType: e.target.value })}
              className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              {personnelTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Military Unit Hierarchy: Department & SubDepartment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            กอง / ฝ่าย / กองร้อย <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.department || ''}
            onChange={(e) => {
              const newDept = e.target.value;
              setFormData({ 
                ...formData, 
                department: newDept,
                subDepartment: '', // Reset sub-department when department changes
              });
            }}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
            required
          >
            <option value="">-- เลือกกอง / ฝ่าย / กองร้อย --</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>
                {dept.name} {dept.shortName ? `(${dept.shortName})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            แผนก / หมวด / ตอน / ชุด (Sub-department)
          </label>
          {availableSubDepts.length > 0 ? (
            <select
              value={formData.subDepartment || ''}
              onChange={(e) => setFormData({ ...formData, subDepartment: e.target.value })}
              className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              <option value="">-- สังกัดกองโดยตรง / เลือกแผนกย่อย --</option>
              {availableSubDepts.map((sub, idx) => (
                <option key={idx} value={sub.name}>
                  {sub.name} {sub.shortName ? `(${sub.shortName})` : ''}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder={formData.department ? "ระบุแผนก/หมวดย่อย (ถ้ามี)" : "กรุณาเลือกกอง/ฝ่ายก่อน"}
              value={formData.subDepartment || ''}
              onChange={(e) => setFormData({ ...formData, subDepartment: e.target.value })}
              className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            เหล่า / สายวิทยาการ
          </label>
          <input
            type="text"
            placeholder="เช่น ร., ม., ป., ช., ส., พ."
            value={formData.militaryBranch || ''}
            onChange={(e) => setFormData({ ...formData, militaryBranch: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            หมายเลขข้าราชการ
          </label>
          <input
            type="text"
            placeholder="หมายเลขข้าราชการ"
            value={formData.officialId || ''}
            onChange={(e) => setFormData({ ...formData, officialId: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {!isProfile && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              เลขประจำตัวทหาร (10 หลัก) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={10}
              placeholder="เลขประจำตัวทหาร 10 หลัก"
              value={formData.badgeNo || ''}
              onChange={(e) => setFormData({ ...formData, badgeNo: e.target.value })}
              className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            วันบรรจุ
          </label>
          <input
            type="text"
            placeholder="เช่น 01/05/2560"
            value={formData.commissionDate || ''}
            onChange={(e) => setFormData({ ...formData, commissionDate: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
      </div>

      {!isProfile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              สถานะการปฏิบัติงาน <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status || statusList[0] || ''}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              {statusList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              ระดับสิทธิ์การใช้งาน (Role) <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role || 'USER'}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              {roles && roles.length > 0 ? (
                roles.map(r => (
                  <option key={r.name} value={r.name}>{r.displayName} ({r.name})</option>
                ))
              ) : (
                <>
                  <option value="USER">ผู้ใช้งานทั่วไป (USER)</option>
                  <option value="ADMIN">ผู้ดูแลระบบ (ADMIN)</option>
                  <option value="SUPER_ADMIN">ผู้ดูแลระบบสูงสุด (SUPER_ADMIN)</option>
                </>
              )}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
