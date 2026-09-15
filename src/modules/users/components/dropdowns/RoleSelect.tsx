'use client';

import React from 'react';
import { Select, SelectProps } from '@/components/ui';
import { DEFAULT_ROLES } from '@/modules/users/constants';

export interface RoleItem {
  name: string;
  displayName: string;
}

export interface RoleSelectProps extends Omit<SelectProps, 'children'> {
  roles?: RoleItem[];
  placeholder?: string;
  allowAll?: boolean;
  allLabel?: string;
}

export const RoleSelect: React.FC<RoleSelectProps> = ({
  roles = DEFAULT_ROLES,
  placeholder,
  allowAll = false,
  allLabel = 'ทุกระดับสิทธิ์',
  label = 'ระดับสิทธิ์การใช้งาน (Role)',
  id = 'military-role-select',
  ...props
}) => {
  return (
    <Select id={id} label={label} {...props}>
      {allowAll && <option value="">{allLabel}</option>}
      {placeholder && !allowAll && <option value="">{placeholder}</option>}
      {roles.map((r) => (
        <option key={r.name} value={r.name}>
          {r.displayName} ({r.name})
        </option>
      ))}
    </Select>
  );
};

export default RoleSelect;
