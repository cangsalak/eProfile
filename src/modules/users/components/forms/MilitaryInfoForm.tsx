import React from 'react';
import { Personnel } from '@/modules/users';
import { Input, Select } from '@/components/ui';

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
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 flex items-center gap-2">
        <i className="fa-solid fa-shield-halved text-primary-500"></i> ข้อมูลการปฏิบัติราชการ
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          id="military-position-input"
          label="ตำแหน่งหน้าที่"
          type="text"
          placeholder="เช่น ผบ.ร้อย., เสมียน, นายทหารส่งกำลัง"
          value={formData.position || ''}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          required
        />

        {!isProfile && (
          <Select
            id="military-type-select"
            label="ประเภทกำลังพล"
            value={formData.personnelType || personnelTypes[0] || ''}
            onChange={(e) => setFormData({ ...formData, personnelType: e.target.value })}
            required
          >
            {personnelTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
        )}
      </div>

      {/* Military Unit Hierarchy: Department & SubDepartment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Select
          id="military-department-select"
          label="กอง / ฝ่าย / กองร้อย"
          value={formData.department || ''}
          onChange={(e) => {
            const newDept = e.target.value;
            setFormData({ 
              ...formData, 
              department: newDept,
              subDepartment: '',
            });
          }}
          required
        >
          <option value="">-- เลือกกอง / ฝ่าย / กองร้อย --</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.name}>
              {dept.name} {dept.shortName ? `(${dept.shortName})` : ''}
            </option>
          ))}
        </Select>

        {availableSubDepts.length > 0 ? (
          <Select
            id="military-subdept-control"
            label="แผนก / หมวด / ตอน / ชุด (Sub-department)"
            value={formData.subDepartment || ''}
            onChange={(e) => setFormData({ ...formData, subDepartment: e.target.value })}
          >
            <option value="">-- สังกัดกองโดยตรง / เลือกแผนกย่อย --</option>
            {availableSubDepts.map((sub, idx) => (
              <option key={idx} value={sub.name}>
                {sub.name} {sub.shortName ? `(${sub.shortName})` : ''}
              </option>
            ))}
          </Select>
        ) : (
          <Input
            id="military-subdept-control"
            label="แผนก / หมวด / ตอน / ชุด (Sub-department)"
            type="text"
            placeholder={formData.department ? "ระบุแผนก/หมวดย่อย (ถ้ามี)" : "กรุณาเลือกกอง/ฝ่ายก่อน"}
            value={formData.subDepartment || ''}
            onChange={(e) => setFormData({ ...formData, subDepartment: e.target.value })}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          id="military-branch-input"
          label="เหล่า / สายวิทยาการ"
          type="text"
          placeholder="เช่น ร., ม., ป., ช., ส., พ."
          value={formData.militaryBranch || ''}
          onChange={(e) => setFormData({ ...formData, militaryBranch: e.target.value })}
        />

        <Input
          id="military-officialid-input"
          label="หมายเลขข้าราชการ"
          type="text"
          placeholder="หมายเลขข้าราชการ"
          value={formData.officialId || ''}
          onChange={(e) => setFormData({ ...formData, officialId: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {!isProfile && (
          <Input
            id="military-badgeno-input"
            label="เลขประจำตัวทหาร (10 หลัก)"
            type="text"
            maxLength={10}
            placeholder="เลขประจำตัวทหาร 10 หลัก"
            value={formData.badgeNo || ''}
            onChange={(e) => setFormData({ ...formData, badgeNo: e.target.value })}
            className="font-mono"
            required
          />
        )}

        <Input
          id="military-commissiondate-input"
          label="วันบรรจุ"
          type="text"
          placeholder="เช่น 01/05/2560"
          value={formData.commissionDate || ''}
          onChange={(e) => setFormData({ ...formData, commissionDate: e.target.value })}
        />
      </div>

      {!isProfile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Select
            id="military-status-select"
            label="สถานะการปฏิบัติงาน"
            value={formData.status || statusList[0] || ''}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            required
          >
            {statusList.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>

          <Select
            id="military-role-select"
            label="ระดับสิทธิ์การใช้งาน (Role)"
            value={formData.role || 'USER'}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
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
          </Select>
        </div>
      )}
    </div>
  );
}
