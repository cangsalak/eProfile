'use client';

import React from 'react';
import { cn } from '@/modules/core/lib/cn';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'candy';
export type BadgeSize = 'xs' | 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: string | React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  primary: {
    container: 'bg-primary-500/15 text-primary-700 dark:text-primary-300 border border-primary-500/25',
    dot: 'bg-primary-500',
  },
  candy: {
    container: 'bg-gradient-to-r from-violet-500/20 to-pink-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 shadow-xs',
    dot: 'bg-purple-500',
  },
  success: {
    container: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25',
    dot: 'bg-emerald-500',
  },
  warning: {
    container: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25',
    dot: 'bg-amber-500',
  },
  danger: {
    container: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25',
    dot: 'bg-rose-500',
  },
  info: {
    container: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/25',
    dot: 'bg-sky-500',
  },
  neutral: {
    container: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80',
    dot: 'bg-slate-400',
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'px-2 py-0.5 text-[10px] gap-1 rounded-full font-black',
  sm: 'px-2.5 py-1 text-xs gap-1.5 rounded-full font-black',
  md: 'px-3.5 py-1.5 text-xs gap-2 rounded-full font-black',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'sm',
  dot = false,
  icon,
  className,
  children,
  ...props
}) => {
  const styles = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={cn(
        'inline-flex items-center font-prompt whitespace-nowrap leading-none select-none shadow-xs transition-all',
        styles.container,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', styles.dot)} />}
      {icon && (
        typeof icon === 'string' ? <i className={cn(icon, 'text-[10px] shrink-0')} /> : icon
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
