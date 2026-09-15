'use client';

import React from 'react';
import { Select, SelectProps } from '@/components/ui';
import { DEFAULT_BLOOD_GROUPS } from '@/modules/users/constants';

export interface BloodTypeSelectProps extends Omit<SelectProps, 'children'> {
  bloodGroups?: string[];
  placeholder?: string;
}

export const BloodTypeSelect: React.FC<BloodTypeSelectProps> = ({
  bloodGroups = DEFAULT_BLOOD_GROUPS,
  placeholder = '-- ไม่ระบุ / เลือกกรุ๊ปเลือด --',
  label = 'กรุ๊ปเลือด',
  id = 'personal-bloodtype-select',
  ...props
}) => {
  return (
    <Select id={id} label={label} {...props}>
      <option value="">{placeholder}</option>
      {bloodGroups.map((bg, idx) => (
        <option key={idx} value={bg}>
          {bg}
        </option>
      ))}
    </Select>
  );
};

export default BloodTypeSelect;
