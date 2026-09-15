'use client';

import React from 'react';
import { Select, SelectProps } from '@/components/ui';
import { DEFAULT_STATUS_LIST } from '@/modules/users/constants';

export interface PersonnelStatusSelectProps extends Omit<SelectProps, 'children'> {
  statusList?: string[];
  placeholder?: string;
  allowAll?: boolean;
  allLabel?: string;
}

export const PersonnelStatusSelect: React.FC<PersonnelStatusSelectProps> = ({
  statusList = DEFAULT_STATUS_LIST,
  placeholder,
  allowAll = false,
  allLabel = 'ทุกสถานะ',
  label = 'สถานะการปฏิบัติงาน',
  id = 'military-status-select',
  ...props
}) => {
  return (
    <Select id={id} label={label} {...props}>
      {allowAll && <option value="">{allLabel}</option>}
      {placeholder && !allowAll && <option value="">{placeholder}</option>}
      {statusList.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </Select>
  );
};

export default PersonnelStatusSelect;
