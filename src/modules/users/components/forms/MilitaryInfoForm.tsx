import React from 'react';
import {
  Personnel,
  DepartmentItem,
  DepartmentSelect,
  PersonnelTypeSelect,
  PersonnelStatusSelect,
  RoleSelect,
  RoleItem,
} from '@/modules/users';
import { Input } from '@/components/ui';

interface MilitaryInfoFormProps {
  formData: Partial<Personnel>;
  setFormData: (data: Partial<Personnel>) => void;
  isProfile?: boolean;
}

export default function MilitaryInfoForm({ 
  formData, 
  setFormData, 
  isProfile, 
}: MilitaryInfoFormProps) {
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
          <PersonnelTypeSelect
            value={formData.personnelType || ''}
            onChange={(e) => setFormData({ ...formData, personnelType: e.target.value })}
            required
          />
        )}
      </div>

      {/* Military Unit Hierarchy: Department & SubDepartment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <DepartmentSelect
          department={formData.department || ''}
          onDepartmentChange={(dept) => setFormData({ ...formData, department: dept })}
          subDepartment={formData.subDepartment || ''}
          onSubDepartmentChange={(subDept) => setFormData({ ...formData, subDepartment: subDept })}
          required
        />
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
          <PersonnelStatusSelect
            value={formData.status || ''}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            required
          />

          <RoleSelect
            value={formData.role || 'USER'}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
          />
        </div>
      )}
    </div>
  );
}
