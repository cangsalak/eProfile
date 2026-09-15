'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/modules/core/lib/cn';
import { AltArrowUpIcon } from '@/modules/core/components/ui/icon';
import { isPathActive } from './utils';

export interface NavItemProps {
  id?: string;
  icon?: React.ReactNode;
  label: string;
  href?: string;
  items?: Array<{ title: string; url?: string }>;
  collapsed?: boolean;
  activePath?: string | null;
  onItemClick?: () => void;
}

export default function NavItem({
  icon,
  label,
  href,
  items,
  collapsed,
  activePath,
  onItemClick,
}: NavItemProps) {
  const pathname = usePathname();
  const currentActive = activePath !== undefined ? activePath : pathname;
  const hasItems = Boolean(items && items.length > 0);
  
  const isActive = href ? isPathActive(href, currentActive) : false;
  const hasActiveChild = items?.some((item) => item.url && isPathActive(item.url, currentActive)) ?? false;
  
  // Auto-expand if active child is present
  const [isOpen, setIsOpen] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  // Collapsed Mode: Icon only with floating tooltip on hover
  if (collapsed) {
    const isCurrentActive = isActive || hasActiveChild;
    const targetUrl = href ?? items?.[0]?.url ?? '#';

    return (
      <div className="group relative flex justify-center py-0.5">
        <Link
          href={targetUrl}
          onClick={onItemClick}
          aria-label={label}
          className={cn(
            'relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200',
            isCurrentActive
              ? 'bg-primary-500/15 text-primary-600 dark:text-primary-400 ring-1 ring-primary-500/30 shadow-xs font-semibold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/70',
          )}
        >
          <span className="flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
            {icon}
          </span>
          {isCurrentActive && (
            <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary-600 dark:bg-primary-500" />
          )}
        </Link>

        {/* Floating Tooltip */}
        <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 invisible opacity-0 -translate-x-1 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 flex flex-col min-w-[110px] max-w-[220px] px-3 py-1.5 rounded-lg bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-sm text-white text-xs shadow-xl border border-slate-800 dark:border-slate-700/80">
          <span className="font-semibold truncate leading-tight">{label}</span>
          {hasItems && (
            <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
              {items?.length} รายการย่อย
            </span>
          )}
          {/* Caret arrow */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900/95 dark:border-r-slate-800/95" />
        </div>
      </div>
    );
  }

  // Expanded Mode with Submenu Items (Accordion)
  if (hasItems) {
    const isExpanded = isOpen || hasActiveChild;

    return (
      <div className="flex flex-col py-0.5">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'group relative flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200',
            hasActiveChild
              ? 'bg-primary-500/10 text-primary-700 dark:text-primary-300 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100',
          )}
        >
          {hasActiveChild && (
            <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary-600 dark:bg-primary-500" />
          )}

          <div className="flex flex-1 items-center gap-3 min-w-0">
            <span
              className={cn(
                'flex items-center justify-center shrink-0 w-5 h-5 transition-colors duration-200',
                hasActiveChild
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300',
              )}
            >
              {icon}
            </span>
            <span className="truncate text-left leading-normal">{label}</span>
          </div>

          <AltArrowUpIcon
            className={cn(
              'h-4 w-4 shrink-0 transition-transform duration-200',
              hasActiveChild ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500',
              isExpanded ? 'rotate-0' : 'rotate-180',
            )}
          />
        </button>

        {isExpanded && (
          <div className="relative ml-5 pl-3.5 border-l-2 border-slate-200/80 dark:border-slate-800/80 space-y-0.5 my-1 transition-all duration-200">
            {items?.map((item) => {
              const isChildActive = item.url ? isPathActive(item.url, pathname) : false;

              return (
                <div key={item.title || item.url} className="relative">
                  <Link
                    href={item.url ?? '#'}
                    onClick={onItemClick}
                    className={cn(
                      'group relative flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150',
                      isChildActive
                        ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100',
                    )}
                  >
                    {/* Submenu Indicator Dot */}
                    <span
                      className={cn(
                        'absolute -left-[18px] top-1/2 -translate-y-1/2 rounded-full transition-all duration-200',
                        isChildActive
                          ? 'h-2 w-2 bg-primary-600 dark:bg-primary-500 ring-2 ring-primary-500/20'
                          : 'h-1.5 w-1.5 bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-400 dark:group-hover:bg-slate-500',
                      )}
                    />
                    <span className="truncate">{item.title}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Expanded Simple Nav Link
  return (
    href && (
      <div className="py-0.5">
        <Link
          href={href}
          onClick={onItemClick}
          className={cn(
            'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200',
            isActive
              ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100',
          )}
        >
          {isActive && (
            <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary-600 dark:bg-primary-500 shadow-xs" />
          )}

          <span
            className={cn(
              'flex items-center justify-center shrink-0 w-5 h-5 transition-colors duration-200',
              isActive
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300',
            )}
          >
            {icon}
          </span>
          <span className="truncate text-left leading-normal">{label}</span>
        </Link>
      </div>
    )
  );
}
