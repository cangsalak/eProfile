'use client';

import React from 'react';
import { Select, SelectProps } from '@/components/ui';
import { DEFAULT_PREFIXES } from '@/modules/users/constants';

export interface PrefixSelectProps extends Omit<SelectProps, 'children'> {
  prefixes?: string[];
  placeholder?: string;
}

export const PrefixSelect: React.FC<PrefixSelectProps> = ({
  prefixes = DEFAULT_PREFIXES,
  placeholder = '-- เลือกคำนำหน้า/ยศ --',
  label = 'คำนำหน้า / ยศ',
  id = 'personal-prefix-select',
  ...props
}) => {
  return (
    <Select id={id} label={label} {...props}>
      <option value="">{placeholder}</option>
      {prefixes.map((p, idx) => (
        <option key={idx} value={p}>
          {p}
        </option>
      ))}
    </Select>
  );
};

export default PrefixSelect;
