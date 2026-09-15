'use client';

import React from 'react';
import { cn } from '@/modules/core/lib/cn';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options?: SelectOption[];
  error?: string;
  hint?: string;
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  containerClassName?: string;
  children?: React.ReactNode;
}

const sizeStyles = {
  sm: 'py-1.5 pl-3 pr-8 text-xs rounded-xl',
  md: 'py-2.5 pl-3.5 pr-10 text-xs sm:text-sm rounded-xl',
  lg: 'py-3 pl-4 pr-10 text-sm sm:text-base rounded-2xl',
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      hint,
      icon,
      size = 'md',
      disabled,
      className,
      containerClassName,
      id,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('w-full font-prompt', containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <i className={cn(icon, 'text-xs sm:text-sm')} />
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={cn(
              'w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed',
              sizeStyles[size],
              icon && 'pl-9 sm:pl-10',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          {/* Custom Dropdown Chevron Icon */}
          <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <i className="fa-solid fa-chevron-down text-[10px]" />
          </div>
        </div>

        {error && (
          <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
            <i className="fa-solid fa-circle-exclamation text-[10px]" />
            <span>{error}</span>
          </p>
        )}

        {hint && !error && (
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
