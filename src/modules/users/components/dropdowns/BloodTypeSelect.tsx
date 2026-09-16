'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectProps } from '@/components/ui';
import { DEFAULT_BLOOD_GROUPS } from '@/modules/users/constants';

export interface BloodTypeSelectProps extends Omit<SelectProps, 'children'> {
  bloodGroups?: string[]; // Optional override
  placeholder?: string;
}

export const BloodTypeSelect: React.FC<BloodTypeSelectProps> = ({
  bloodGroups: propBloodGroups,
  placeholder = '-- ไม่ระบุ / เลือกกรุ๊ปเลือด --',
  label = 'กรุ๊ปเลือด',
  id = 'personal-bloodtype-select',
  ...props
}) => {
  const [internalList, setInternalList] = useState<string[]>(DEFAULT_BLOOD_GROUPS);

  useEffect(() => {
    if (propBloodGroups) return;
    
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : {}))
      .then((settings: any) => {
        if (settings?.bloodGroups) {
          try {
            const parsed = JSON.parse(settings.bloodGroups);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setInternalList(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {});
  }, [propBloodGroups]);

  const activeList = propBloodGroups || internalList;

  return (
    <Select id={id} label={label} {...props}>
      <option value="">{placeholder}</option>
      {activeList.map((bg, idx) => (
        <option key={idx} value={bg}>
          {bg}
        </option>
      ))}
    </Select>
  );
};

export default BloodTypeSelect;
