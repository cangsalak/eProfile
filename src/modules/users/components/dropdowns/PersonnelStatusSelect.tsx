'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectProps } from '@/components/ui';
import { DEFAULT_STATUS_LIST } from '@/modules/users/constants';

export interface PersonnelStatusSelectProps extends Omit<SelectProps, 'children'> {
  statusList?: string[]; // Optional override
  placeholder?: string;
  allowAll?: boolean;
  allLabel?: string;
}

export const PersonnelStatusSelect: React.FC<PersonnelStatusSelectProps> = ({
  statusList: propStatusList,
  placeholder,
  allowAll = false,
  allLabel = 'ทุกสถานะ',
  label = 'สถานะการปฏิบัติงาน',
  id = 'military-status-select',
  ...props
}) => {
  const [internalList, setInternalList] = useState<string[]>(DEFAULT_STATUS_LIST);

  useEffect(() => {
    if (propStatusList) return;
    
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : {}))
      .then((settings: any) => {
        if (settings?.statusList) {
          try {
            const parsed = JSON.parse(settings.statusList);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setInternalList(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {});
  }, [propStatusList]);

  const activeList = propStatusList || internalList;

  return (
    <Select id={id} label={label} {...props}>
      {allowAll && <option value="">{allLabel}</option>}
      {placeholder && !allowAll && <option value="">{placeholder}</option>}
      {activeList.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </Select>
  );
};

export default PersonnelStatusSelect;
