'use client';

import React from 'react';
import { cn } from '@/modules/core/lib/cn';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className,
  id,
}) => {
  const switchId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={cn('flex items-start gap-3 font-prompt select-none', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        id={switchId}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed',
          size === 'sm' ? 'h-5 w-9' : 'h-6 w-11',
          checked ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-md transform ring-0 transition duration-200 ease-in-out',
            size === 'sm' ? 'h-3.5 w-3.5 mt-[3px] ml-[3px]' : 'h-4.5 w-4.5 mt-[3px] ml-[3px]',
            checked
              ? size === 'sm'
                ? 'translate-x-4'
                : 'translate-x-5'
              : 'translate-x-0'
          )}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col cursor-pointer" onClick={() => !disabled && onChange(!checked)}>
          {label && (
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Switch;
