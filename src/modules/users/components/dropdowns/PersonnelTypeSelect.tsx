'use client';

import React from 'react';
import { Select, SelectProps } from '@/components/ui';
import { DEFAULT_PERSONNEL_TYPES } from '@/modules/users/constants';

export interface PersonnelTypeSelectProps extends Omit<SelectProps, 'children'> {
  personnelTypes?: string[];
  placeholder?: string;
  allowAll?: boolean;
  allLabel?: string;
}

export const PersonnelTypeSelect: React.FC<PersonnelTypeSelectProps> = ({
  personnelTypes = DEFAULT_PERSONNEL_TYPES,
  placeholder,
  allowAll = false,
  allLabel = 'ทุกประเภทกำลังพล',
  label = 'ประเภทกำลังพล',
  id = 'military-type-select',
  ...props
}) => {
  return (
    <Select id={id} label={label} {...props}>
      {allowAll && <option value="">{allLabel}</option>}
      {placeholder && !allowAll && <option value="">{placeholder}</option>}
      {personnelTypes.map((type) => (
        <option key={type} value={type}>
          {type}
        </option>
      ))}
    </Select>
  );
};

export default PersonnelTypeSelect;
