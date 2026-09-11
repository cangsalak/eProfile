'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  containerClassName?: string;
}

const sizeStyles = {
  sm: 'py-1.5 px-3 text-xs rounded-xl',
  md: 'py-2.5 px-3.5 text-xs sm:text-sm rounded-xl',
  lg: 'py-3 px-4 text-sm sm:text-base rounded-2xl',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      size = 'md',
      disabled,
      className,
      containerClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('w-full font-prompt', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <i className={cn(icon, 'text-xs sm:text-sm')} />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed',
              sizeStyles[size],
              icon && iconPosition === 'left' && 'pl-9 sm:pl-10',
              icon && iconPosition === 'right' && 'pr-9 sm:pr-10',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <i className={cn(icon, 'text-xs sm:text-sm')} />
            </div>
          )}
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

Input.displayName = 'Input';

export default Input;
