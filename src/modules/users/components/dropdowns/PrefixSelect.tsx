'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectProps } from '@/components/ui';
import { DEFAULT_PREFIXES } from '@/modules/users/constants';

export interface PrefixSelectProps extends Omit<SelectProps, 'children'> {
  prefixes?: string[]; // Optional override
  placeholder?: string;
}

export const PrefixSelect: React.FC<PrefixSelectProps> = ({
  prefixes: propPrefixes,
  placeholder = '-- เลือกคำนำหน้า/ยศ --',
  label = 'คำนำหน้า / ยศ',
  id = 'personal-prefix-select',
  ...props
}) => {
  const [internalList, setInternalList] = useState<string[]>(DEFAULT_PREFIXES);

  useEffect(() => {
    if (propPrefixes) return;
    
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : {}))
      .then((settings: any) => {
        if (settings?.prefixes) {
          try {
            const parsed = JSON.parse(settings.prefixes);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setInternalList(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {});
  }, [propPrefixes]);

  const activeList = propPrefixes || internalList;

  return (
    <Select id={id} label={label} {...props}>
      <option value="">{placeholder}</option>
      {activeList.map((p, idx) => (
        <option key={idx} value={p}>
          {p}
        </option>
      ))}
    </Select>
  );
};

export default PrefixSelect;
