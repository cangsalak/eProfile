'use client';

import React from 'react';
import { cn } from '@/modules/core/lib/cn';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  unit?: string;
  icon?: string | React.ReactNode;
  iconBgGradient?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  subtitle?: React.ReactNode;
  progress?: {
    value: number; // 0 to 100
    color?: string;
  };
  footer?: React.ReactNode;
  variant?: 'default' | 'convex' | 'glass';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon,
  iconBgGradient = 'from-violet-500 to-primary-600',
  trend,
  subtitle,
  progress,
  footer,
  variant = 'convex',
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] transition-all duration-300 font-prompt overflow-hidden group',
        // Default / Convex 3D Marshmallow Surface
        variant === 'convex' &&
          'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-clay-card hover:-translate-y-1.5 hover:shadow-clay-card-hover',
        variant === 'glass' &&
          'bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg hover:-translate-y-1',
        variant === 'default' &&
          'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {/* Top Row: Icon Well & Trend Badge */}
      <div className="flex items-center justify-between gap-3">
        {icon && (
          <div
            className={cn(
              'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl sm:rounded-[20px] bg-gradient-to-br shadow-clay-orb flex items-center justify-center text-white text-lg shrink-0 transition-transform duration-300 group-hover:scale-110',
              iconBgGradient
            )}
          >
            {typeof icon === 'string' ? (
              <i className={cn(icon, 'text-base sm:text-lg')} />
            ) : (
              icon
            )}
          </div>
        )}

        {trend && (
          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-black shadow-xs flex items-center gap-1.5 shrink-0',
              trend.isPositive !== false
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
            )}
          >
            <span>{trend.value}</span>
            <i
              className={cn(
                'fa-solid text-[10px]',
                trend.isPositive !== false ? 'fa-arrow-up' : 'fa-arrow-down'
              )}
            />
          </span>
        )}
      </div>

      {/* Main Metric Value & Title */}
      <div className="mt-4 space-y-1">
        <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 truncate">
          {title}
        </p>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            {value}
          </span>
          {unit && (
            <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Optional Subtitle */}
      {subtitle && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </div>
      )}

      {/* Optional Progress Bar */}
      {progress && (
        <div className="mt-3.5 space-y-1.5">
          <div className="w-full bg-slate-100 dark:bg-slate-700/60 h-2 sm:h-2.5 rounded-full overflow-hidden shadow-inner p-0.5">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700 shadow-sm',
                progress.color || 'bg-gradient-to-r from-primary-500 to-emerald-400'
              )}
              style={{ width: `${Math.min(100, Math.max(0, progress.value))}%` }}
            />
          </div>
        </div>
      )}

      {/* Optional Footer Divider */}
      {footer && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};

export default StatCard;
