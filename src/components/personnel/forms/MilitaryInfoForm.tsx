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

  const formControlClass = "w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all";
  const labelClass = "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div>
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 mt-6 flex items-center gap-2">
        <i className="fa-solid fa-shield-halved text-primary-500"></i> ข้อมูลการปฏิบัติราชการ
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="military-position-input" className={labelClass}>
            ตำแหน่งหน้าที่ <span className="text-rose-500">*</span>
          </label>
          <input
            id="military-position-input"
            aria-label="ตำแหน่งหน้าที่"
            type="text"
            placeholder="เช่น ผบ.ร้อย., เสมียน, นายทหารส่งกำลัง"
            value={formData.position || ''}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className={formControlClass}
            required
          />
        </div>

        {!isProfile && (
          <div>
            <label htmlFor="military-type-select" className={labelClass}>
              ประเภทกำลังพล <span className="text-rose-500">*</span>
            </label>
            <select
              id="military-type-select"
              aria-label="ประเภทกำลังพล"
              value={formData.personnelType || personnelTypes[0] || ''}
              onChange={(e) => setFormData({ ...formData, personnelType: e.target.value })}
              className={`${formControlClass} cursor-pointer`}
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
          <label htmlFor="military-department-select" className={labelClass}>
            กอง / ฝ่าย / กองร้อย <span className="text-rose-500">*</span>
          </label>
          <select
            id="military-department-select"
            aria-label="กอง / ฝ่าย / กองร้อย"
            value={formData.department || ''}
            onChange={(e) => {
              const newDept = e.target.value;
              setFormData({ 
                ...formData, 
                department: newDept,
                subDepartment: '',
              });
            }}
            className={`${formControlClass} cursor-pointer`}
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
          <label htmlFor="military-subdept-control" className={labelClass}>
            แผนก / หมวด / ตอน / ชุด (Sub-department)
          </label>
          {availableSubDepts.length > 0 ? (
            <select
              id="military-subdept-control"
              aria-label="แผนก / หมวด / ตอน / ชุด"
              value={formData.subDepartment || ''}
              onChange={(e) => setFormData({ ...formData, subDepartment: e.target.value })}
              className={`${formControlClass} cursor-pointer`}
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
              id="military-subdept-control"
              aria-label="ระบุแผนก/หมวดย่อย"
              type="text"
              placeholder={formData.department ? "ระบุแผนก/หมวดย่อย (ถ้ามี)" : "กรุณาเลือกกอง/ฝ่ายก่อน"}
              value={formData.subDepartment || ''}
              onChange={(e) => setFormData({ ...formData, subDepartment: e.target.value })}
              className={formControlClass}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="military-branch-input" className={labelClass}>
            เหล่า / สายวิทยาการ
          </label>
          <input
            id="military-branch-input"
            aria-label="เหล่า / สายวิทยาการ"
            type="text"
            placeholder="เช่น ร., ม., ป., ช., ส., พ."
            value={formData.militaryBranch || ''}
            onChange={(e) => setFormData({ ...formData, militaryBranch: e.target.value })}
            className={formControlClass}
          />
        </div>

        <div>
          <label htmlFor="military-officialid-input" className={labelClass}>
            หมายเลขข้าราชการ
          </label>
          <input
            id="military-officialid-input"
            aria-label="หมายเลขข้าราชการ"
            type="text"
            placeholder="หมายเลขข้าราชการ"
            value={formData.officialId || ''}
            onChange={(e) => setFormData({ ...formData, officialId: e.target.value })}
            className={formControlClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {!isProfile && (
          <div>
            <label htmlFor="military-badgeno-input" className={labelClass}>
              เลขประจำตัวทหาร (10 หลัก) <span className="text-rose-500">*</span>
            </label>
            <input
              id="military-badgeno-input"
              aria-label="เลขประจำตัวทหาร 10 หลัก"
              type="text"
              maxLength={10}
              placeholder="เลขประจำตัวทหาร 10 หลัก"
              value={formData.badgeNo || ''}
              onChange={(e) => setFormData({ ...formData, badgeNo: e.target.value })}
              className={`${formControlClass} font-mono`}
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="military-commissiondate-input" className={labelClass}>
            วันบรรจุ
          </label>
          <input
            id="military-commissiondate-input"
            aria-label="วันบรรจุ"
            type="text"
            placeholder="เช่น 01/05/2560"
            value={formData.commissionDate || ''}
            onChange={(e) => setFormData({ ...formData, commissionDate: e.target.value })}
            className={formControlClass}
          />
        </div>
      </div>

      {!isProfile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="military-status-select" className={labelClass}>
              สถานะการปฏิบัติงาน <span className="text-rose-500">*</span>
            </label>
            <select
              id="military-status-select"
              aria-label="สถานะการปฏิบัติงาน"
              value={formData.status || statusList[0] || ''}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className={`${formControlClass} cursor-pointer`}
            >
              {statusList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="military-role-select" className={labelClass}>
              ระดับสิทธิ์การใช้งาน (Role) <span className="text-rose-500">*</span>
            </label>
            <select
              id="military-role-select"
              aria-label="ระดับสิทธิ์การใช้งาน"
              value={formData.role || 'USER'}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className={`${formControlClass} cursor-pointer`}
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
