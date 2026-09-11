'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  containerClassName?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, disabled, className, containerClassName, id, ...props }, ref) => {
    const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('flex items-start gap-2.5 font-prompt select-none', containerClassName)}>
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          disabled={disabled}
          className={cn(
            'mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500/20 bg-slate-50 dark:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-rose-500',
            className
          )}
          {...props}
        />

        {(label || description) && (
          <label htmlFor={checkboxId} className="flex flex-col cursor-pointer">
            {label && (
              <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">
                {label}
              </span>
            )}
            {description && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                {description}
              </span>
            )}
            {error && (
              <span className="text-[11px] text-rose-500 mt-0.5">{error}</span>
            )}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
