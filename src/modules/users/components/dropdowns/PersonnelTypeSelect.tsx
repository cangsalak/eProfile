'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectProps } from '@/components/ui';
import { DEFAULT_PERSONNEL_TYPES } from '@/modules/users/constants';

export interface PersonnelTypeSelectProps extends Omit<SelectProps, 'children'> {
  personnelTypes?: string[];
  placeholder?: string;
  allowAll?: boolean;
  allLabel?: string;
}

export const PersonnelTypeSelect: React.FC<PersonnelTypeSelectProps> = ({
  personnelTypes: propPersonnelTypes,
  placeholder,
  allowAll = false,
  allLabel = 'ทุกประเภทกำลังพล',
  label = 'ประเภทกำลังพล',
  id = 'military-type-select',
  ...props
}) => {
  const [internalList, setInternalList] = useState<string[]>(DEFAULT_PERSONNEL_TYPES);

  useEffect(() => {
    if (propPersonnelTypes) return;
    
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : {}))
      .then((settings: any) => {
        if (settings?.personnelTypes) {
          try {
            const parsed = JSON.parse(settings.personnelTypes);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setInternalList(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {});
  }, [propPersonnelTypes]);

  const activeList = propPersonnelTypes || internalList;

  return (
    <Select id={id} label={label} {...props}>
      {allowAll && <option value="">{allLabel}</option>}
      {placeholder && !allowAll && <option value="">{placeholder}</option>}
      {activeList.map((type) => (
        <option key={type} value={type}>
          {type}
        </option>
      ))}
    </Select>
  );
};

export default PersonnelTypeSelect;
