'use client';

import React, { useState, useEffect } from 'react';
import { Select, Input } from '@/components/ui';

export interface DepartmentItem {
  id: string;
  name: string;
  shortName?: string;
  subDepartments?: any;
}

export interface DepartmentSelectProps {
  department: string;
  onDepartmentChange: (department: string) => void;
  subDepartment?: string;
  onSubDepartmentChange?: (subDepartment: string) => void;
  departments?: DepartmentItem[];
  showSubDepartment?: boolean;
  departmentLabel?: string;
  subDepartmentLabel?: string;
  required?: boolean;
  allowAll?: boolean;
  allLabel?: string;
  className?: string;
  departmentId?: string;
  subDepartmentId?: string;
}

export const DepartmentSelect: React.FC<DepartmentSelectProps> = ({
  department,
  onDepartmentChange,
  subDepartment,
  onSubDepartmentChange,
  departments: propDepartments,
  showSubDepartment = true,
  departmentLabel = 'กอง / ฝ่าย / กองร้อย',
  subDepartmentLabel = 'แผนก / หมวด / ตอน / ชุด (Sub-department)',
  required = false,
  allowAll = false,
  allLabel = 'ทุกสังกัด / กอง',
  className,
  departmentId = 'military-department-select',
  subDepartmentId = 'military-subdept-control',
}) => {
  const [internalDepartments, setInternalDepartments] = useState<DepartmentItem[]>(propDepartments || []);

  useEffect(() => {
    if (propDepartments && propDepartments.length > 0) {
      setInternalDepartments(propDepartments);
    } else {
      fetch('/api/departments')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setInternalDepartments(data);
        })
        .catch((err) => console.error('Failed to fetch departments:', err));
    }
  }, [propDepartments]);

  const selectedDeptObj = internalDepartments.find((d) => d.name === department);
  let availableSubDepts: { name: string; shortName?: string }[] = [];

  if (selectedDeptObj?.subDepartments) {
    if (Array.isArray(selectedDeptObj.subDepartments)) {
      availableSubDepts = selectedDeptObj.subDepartments.map((item) => {
        if (typeof item === 'string') return { name: item, shortName: '' };
        return item;
      });
    } else if (typeof selectedDeptObj.subDepartments === 'string') {
      try {
        const parsed = JSON.parse(selectedDeptObj.subDepartments);
        if (Array.isArray(parsed)) {
          availableSubDepts = parsed.map((item) => {
            if (typeof item === 'string') return { name: item, shortName: '' };
            return item;
          });
        }
      } catch (_) {}
    }
  }

  return (
    <>
      <Select
        id={departmentId}
        label={departmentLabel}
        value={department}
        onChange={(e) => {
          const newDept = e.target.value;
          onDepartmentChange(newDept);
          if (onSubDepartmentChange) {
            onSubDepartmentChange('');
          }
        }}
        required={required}
        containerClassName={className}
      >
        {allowAll ? (
          <option value="">{allLabel}</option>
        ) : (
          <option value="">-- เลือกกอง / ฝ่าย / กองร้อย --</option>
        )}
        {internalDepartments.map((dept) => (
          <option key={dept.id} value={dept.name}>
            {dept.name} {dept.shortName ? `(${dept.shortName})` : ''}
          </option>
        ))}
      </Select>

      {showSubDepartment && onSubDepartmentChange && (
        availableSubDepts.length > 0 ? (
          <Select
            id={subDepartmentId}
            label={subDepartmentLabel}
            value={subDepartment || ''}
            onChange={(e) => onSubDepartmentChange(e.target.value)}
            containerClassName={className}
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
            id={subDepartmentId}
            label={subDepartmentLabel}
            type="text"
            placeholder={department ? 'ระบุแผนก/หมวดย่อย (ถ้ามี)' : 'กรุณาเลือกกอง/ฝ่ายก่อน'}
            value={subDepartment || ''}
            onChange={(e) => onSubDepartmentChange(e.target.value)}
            containerClassName={className}
          />
        )
      )}
    </>
  );
};

export default DepartmentSelect;
