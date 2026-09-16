'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectProps } from '@/components/ui';
import { DEFAULT_ROLES } from '@/modules/users/constants';

export interface RoleItem {
  name: string;
  displayName: string;
}

export interface RoleSelectProps extends Omit<SelectProps, 'children'> {
  roles?: RoleItem[]; // Optional override
  placeholder?: string;
  allowAll?: boolean;
  allLabel?: string;
}

export const RoleSelect: React.FC<RoleSelectProps> = ({
  roles: propRoles,
  placeholder,
  allowAll = false,
  allLabel = 'ทุกระดับสิทธิ์',
  label = 'ระดับสิทธิ์การใช้งาน (Role)',
  id = 'military-role-select',
  ...props
}) => {
  const [internalList, setInternalList] = useState<RoleItem[]>(DEFAULT_ROLES);

  useEffect(() => {
    if (propRoles) return;
    
    fetch('/api/roles')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setInternalList(data);
        }
      })
      .catch(() => {});
  }, [propRoles]);

  const activeList = propRoles || internalList;

  return (
    <Select id={id} label={label} {...props}>
      {allowAll && <option value="">{allLabel}</option>}
      {placeholder && !allowAll && <option value="">{placeholder}</option>}
      {activeList.map((r) => (
        <option key={r.name} value={r.name}>
          {r.displayName} ({r.name})
        </option>
      ))}
    </Select>
  );
};

export default RoleSelect;
