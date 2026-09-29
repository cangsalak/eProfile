'use client';

import React, { useState, useEffect, useMemo } from 'react';
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

interface TreeNode {
  name: string;
  shortName?: string;
  children?: TreeNode[];
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
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [isCustomSubDept, setIsCustomSubDept] = useState(false);

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

  // Parse recursive sub-departments
  const parseTree = (subDepts: any): TreeNode[] => {
    if (!subDepts) return [];
    let raw: any[] = [];
    if (Array.isArray(subDepts)) {
      raw = subDepts;
    } else {
      try {
        const parsed = typeof subDepts === 'string' ? JSON.parse(subDepts) : subDepts;
        if (Array.isArray(parsed)) raw = parsed;
      } catch (_) {
        return [];
      }
    }

    const normalize = (item: any): TreeNode => {
      if (typeof item === 'string') return { name: item, shortName: '', children: [] };
      const childrenRaw = item.children || item.subDepartments;
      const children = Array.isArray(childrenRaw) ? childrenRaw.map(normalize) : [];
      return {
        name: item.name || '',
        shortName: item.shortName || '',
        children,
      };
    };

    return raw.map(normalize);
  };

  // Build options for main departments and nested level 1 units
  const { mainDeptOptions, subDeptLevel1Options, subUnitsMap } = useMemo(() => {
    const mainList: { name: string; label: string }[] = [];
    const level1List: { name: string; label: string; parentDeptName: string }[] = [];
    const map: Record<string, { name: string; shortName?: string; level: number }[]> = {};

    const collectRecursive = (
      nodes: TreeNode[],
      level = 1
    ): { name: string; shortName?: string; level: number }[] => {
      let list: { name: string; shortName?: string; level: number }[] = [];
      nodes.forEach((n) => {
        list.push({ name: n.name, shortName: n.shortName, level });
        if (n.children && n.children.length > 0) {
          list = list.concat(collectRecursive(n.children, level + 1));
        }
      });
      return list;
    };

    internalDepartments.forEach((dept) => {
      mainList.push({
        name: dept.name,
        label: `${dept.name}${dept.shortName ? ` (${dept.shortName})` : ''}`,
      });

      const tree = parseTree(dept.subDepartments);

      // Collect all descendants for main department
      map[dept.name] = collectRecursive(tree, 1);

      // Extract Level 1 units (กอง / ฝ่ายย่อย)
      tree.forEach((n1) => {
        level1List.push({
          name: n1.name,
          label: `${n1.name}${n1.shortName ? ` (${n1.shortName})` : ''}`,
          parentDeptName: dept.name,
        });

        // Collect descendants of Level 1 unit
        if (n1.children && n1.children.length > 0) {
          map[n1.name] = collectRecursive(n1.children, 2);
        } else {
          map[n1.name] = [];
        }
      });
    });

    return { mainDeptOptions: mainList, subDeptLevel1Options: level1List, subUnitsMap: map };
  }, [internalDepartments]);

  // Determine available sub-departments for currently selected department
  const availableSubDepts = subUnitsMap[department] || [];

  // Check if current department value exists in options
  const isDeptInOptions =
    !department ||
    mainDeptOptions.some((d) => d.name === department) ||
    subDeptLevel1Options.some((d) => d.name === department);

  // Smart matching for legacy / shortened department values (e.g. "กองบังคับการ" -> "กองบังคับการศูนย์ฝึกทางยุทธวิธีกองทัพบก")
  useEffect(() => {
    if (department && !isDeptInOptions && internalDepartments.length > 0 && !isCustomDept) {
      const match =
        mainDeptOptions.find(
          (d) => d.name.toLowerCase() === department.toLowerCase()
        ) ||
        mainDeptOptions.find(
          (d) => d.name.toLowerCase().includes(department.toLowerCase()) || department.toLowerCase().includes(d.name.toLowerCase())
        ) ||
        subDeptLevel1Options.find(
          (d) => d.name.toLowerCase() === department.toLowerCase()
        ) ||
        subDeptLevel1Options.find(
          (d) => d.name.toLowerCase().includes(department.toLowerCase()) || department.toLowerCase().includes(d.name.toLowerCase())
        );
      if (match) {
        onDepartmentChange(match.name);
      }
    }
  }, [department, isDeptInOptions, internalDepartments, subDeptLevel1Options, mainDeptOptions, onDepartmentChange, isCustomDept]);

  return (
    <>
      {/* 1. Main Department Control */}
      <div className={className}>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor={departmentId} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {departmentLabel} {required && <span className="text-rose-500">*</span>}
          </label>
          <button
            type="button"
            onClick={() => setIsCustomDept(!isCustomDept)}
            className="text-[11px] text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium transition-colors"
          >
            <i className={isCustomDept ? 'fa-solid fa-list' : 'fa-solid fa-pen'}></i>
            <span>{isCustomDept ? 'เลือกจากรายการ' : 'พิมพ์ระบุเอง'}</span>
          </button>
        </div>

        {isCustomDept ? (
          <Input
            id={departmentId}
            type="text"
            placeholder="พิมพ์ระบุชื่อกอง / ฝ่าย / สังกัด"
            value={department}
            onChange={(e) => {
              onDepartmentChange(e.target.value);
              if (onSubDepartmentChange) onSubDepartmentChange('');
            }}
            required={required}
          />
        ) : (
          <Select
            id={departmentId}
            value={department}
            onChange={(e) => {
              const newDept = e.target.value;
              onDepartmentChange(newDept);
              if (onSubDepartmentChange) onSubDepartmentChange('');
            }}
            required={required}
          >
            {allowAll ? (
              <option value="">{allLabel}</option>
            ) : (
              <option value="">-- เลือกกอง / ฝ่าย / สังกัด --</option>
            )}

            {/* Preserved Current Value if not matched */}
            {department && !isDeptInOptions && (
              <option value={department}>{department} (สังกัดปัจจุบัน)</option>
            )}

            {/* Main Departments (หน่วยงานหลัก) */}
            {mainDeptOptions.length > 0 && (
              <optgroup label="หน่วยงานหลัก (Main Organization)">
                {mainDeptOptions.map((opt, idx) => (
                  <option key={`main-${idx}`} value={opt.name}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            )}

            {/* Level 1 Sub-departments (กอง / ฝ่าย ในสังกัด) */}
            {subDeptLevel1Options.length > 0 && (
              <optgroup label="กอง / ฝ่าย ภายในหน่วย">
                {subDeptLevel1Options.map((opt, idx) => (
                  <option key={`sub1-${idx}`} value={opt.name}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            )}
          </Select>
        )}
      </div>

      {/* 2. Sub-department Control */}
      {showSubDepartment && onSubDepartmentChange && (
        <div className={className}>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor={subDepartmentId} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {subDepartmentLabel}
            </label>
            <button
              type="button"
              onClick={() => setIsCustomSubDept(!isCustomSubDept)}
              className="text-[11px] text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium transition-colors"
            >
              <i className={isCustomSubDept ? 'fa-solid fa-list' : 'fa-solid fa-pen'}></i>
              <span>{isCustomSubDept ? 'เลือกจากรายการ' : 'พิมพ์ระบุเอง'}</span>
            </button>
          </div>

          {!isCustomSubDept && availableSubDepts.length > 0 ? (
            <Select
              id={subDepartmentId}
              value={subDepartment || ''}
              onChange={(e) => onSubDepartmentChange(e.target.value)}
            >
              <option value="">-- สังกัดกองโดยตรง / เลือกแผนกย่อย --</option>
              {subDepartment && !availableSubDepts.some((s) => s.name === subDepartment) && (
                <option value={subDepartment}>{subDepartment} (สังกัดย่อยเดิม)</option>
              )}
              {availableSubDepts.map((sub, idx) => {
                const prefix =
                  sub.level === 2 ? '　↳ [แผนก/หมวด] ' :
                  sub.level === 3 ? '　　↳ [ตอน/ชุด] ' : '';
                return (
                  <option key={idx} value={sub.name}>
                    {prefix}{sub.name} {sub.shortName ? `(${sub.shortName})` : ''}
                  </option>
                );
              })}
            </Select>
          ) : (
            <Input
              id={subDepartmentId}
              type="text"
              placeholder={department ? 'ระบุแผนก/หมวด/ตอน/ชุด (ถ้ามี)' : 'กรุณาเลือกหรือระบุกอง/ฝ่ายก่อน'}
              value={subDepartment || ''}
              onChange={(e) => onSubDepartmentChange(e.target.value)}
            />
          )}
        </div>
      )}
    </>
  );
};

export default DepartmentSelect;
