'use client';

import React from 'react';
import { cn } from '@/modules/core/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'candy' | 'success';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string | React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  loadingText?: string;
  squishEffect?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-400 hover:to-primary-600 text-white shadow-clay-button hover:shadow-clay-button-hover active:shadow-clay-pressed border border-white/20',
  candy:
    'bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] hover:from-[#B89EFB] hover:to-[#8B5CF6] text-white shadow-clay-button hover:shadow-clay-button-hover active:shadow-clay-pressed border border-white/25',
  success:
    'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-clay-button hover:shadow-clay-button-hover active:shadow-clay-pressed border border-white/20',
  secondary:
    'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-md',
  outline:
    'bg-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700',
  ghost:
    'bg-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent',
  danger:
    'bg-gradient-to-br from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 text-white shadow-clay-button hover:shadow-clay-button-hover active:shadow-clay-pressed border border-white/20',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-3 py-1 text-xs rounded-xl gap-1.5 font-bold',
  sm: 'px-4 py-2 text-xs font-black rounded-2xl gap-2',
  md: 'px-5 py-2.5 text-sm font-black rounded-2xl gap-2.5',
  lg: 'px-7 py-3.5 text-base font-black rounded-[20px] gap-3',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = 'button',
      variant = 'primary',
      size = 'sm',
      icon,
      iconPosition = 'left',
      isLoading = false,
      loadingText,
      disabled,
      squishEffect = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-prompt transition-all duration-200 select-none cursor-pointer',
          squishEffect && 'active:scale-[0.94]',
          variantStyles[variant],
          sizeStyles[size],
          isDisabled && 'opacity-50 cursor-not-allowed transform-none active:scale-100 shadow-none',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <i className="fa-solid fa-circle-notch fa-spin text-xs" />
            {loadingText ? <span>{loadingText}</span> : children ? <span>{children}</span> : null}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              typeof icon === 'string' ? <i className={cn(icon, 'text-xs shrink-0')} /> : icon
            )}
            {children && <span>{children}</span>}
            {icon && iconPosition === 'right' && (
              typeof icon === 'string' ? <i className={cn(icon, 'text-xs shrink-0')} /> : icon
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
