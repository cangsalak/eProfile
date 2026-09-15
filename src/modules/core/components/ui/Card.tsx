'use client';

import React from 'react';
import { cn } from '@/modules/core/lib/cn';

export type CardVariant = 'default' | 'convex' | 'glass' | 'interactive' | 'recessed';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: CardVariant;
  hoverEffect?: boolean;
}

const paddingStyles = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      padding = 'md',
      variant = 'convex',
      hoverEffect = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[24px] sm:rounded-[28px] font-prompt transition-all duration-300 relative',
          variant === 'convex' &&
            'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-clay-card',
          variant === 'glass' &&
            'bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg',
          variant === 'interactive' &&
            'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-clay-card hover:-translate-y-1.5 hover:shadow-clay-card-hover cursor-pointer',
          variant === 'recessed' &&
            'bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 shadow-clay-pressed',
          variant === 'default' &&
            'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm',
          hoverEffect &&
            'hover:-translate-y-1 hover:shadow-clay-card-hover hover:border-primary-400/50 dark:hover:border-primary-500/50',
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: string | React.ReactNode;
  iconGradient?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  icon,
  iconGradient = 'from-primary-500 to-primary-700',
  action,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <span
            className={cn(
              'flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-clay-orb text-sm shrink-0 transition-transform duration-300 group-hover:scale-105',
              iconGradient
            )}
          >
            {typeof icon === 'string' ? <i className={icon} /> : icon}
          </span>
        )}
        <div className="min-w-0">
          {title && (
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg leading-tight truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
};

export default Card;
