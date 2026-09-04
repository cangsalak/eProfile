'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { AltArrowUpIcon } from '@/utils/icon';
import { isPathActive } from './utils';

export interface NavItemProps {
  id?: string;
  icon?: React.ReactNode;
  label: string;
  href?: string;
  items?: Array<{ title: string; url?: string }>;
  collapsed?: boolean;
  onItemClick?: () => void;
}

export default function NavItem({
  icon,
  label,
  href,
  items,
  collapsed,
  onItemClick,
}: NavItemProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = href ? isPathActive(href, pathname) : false;
  const hasActiveChild = items?.some((item) => item.url && isPathActive(item.url, pathname));
  const isExpanded = isOpen || hasActiveChild;

  // Collapsed: icon-only button centered
  if (collapsed) {
    return (
      <div className="flex justify-center" title={label}>
        <Link
          href={href ?? items?.[0]?.url ?? '#'}
          onClick={onItemClick}
          className={cn(
            'flex items-center justify-center rounded-lg px-3 py-2.5 transition-colors duration-200',
            isActive || hasActiveChild
              ? 'bg-sidebar-navigation-nav-item-nav-hover-background text-icon-primary'
              : 'text-icon-tertiary hover:bg-sidebar-navigation-nav-item-nav-hover-background hover:text-icon-primary',
          )}
        >
          {icon}
        </Link>
      </div>
    );
  }

  // Expanded with sub-items -> collapsible
  if (items && items.length > 0) {
    return (
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'group flex w-full items-center justify-between gap-3 rounded-lg border-none bg-transparent px-3 py-2 text-sm font-medium transition-colors duration-200',
            hasActiveChild
              ? 'bg-sidebar-navigation-nav-item-nav-hover-background text-text-primary'
              : 'text-text-secondary hover:bg-sidebar-navigation-nav-item-nav-hover-background hover:text-text-primary',
          )}
        >
          <div className="flex flex-1 items-center gap-3">
            <span
              className={cn(
                'transition-colors duration-200',
                hasActiveChild ? 'text-icon-primary' : 'text-icon-tertiary group-hover:text-icon-primary',
              )}
            >
              {icon}
            </span>
            <span>{label}</span>
          </div>

          <AltArrowUpIcon
            className={cn(
              'text-icon-tertiary transition-transform duration-200',
              isExpanded ? 'rotate-0' : 'rotate-180',
            )}
          />
        </button>

        {isExpanded && (
          <div className="space-y-1 mt-1 pl-4 pr-0 transition-all duration-200">
            {items.map((item) => {
              const isChildActive = item.url ? isPathActive(item.url, pathname) : false;

              return (
                <div key={item.title} className="px-0">
                  <Link
                    href={item.url ?? '#'}
                    onClick={onItemClick}
                    className={cn(
                      'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isChildActive
                        ? 'bg-sidebar-navigation-nav-item-nav-hover-background text-text-primary'
                        : 'text-text-secondary hover:bg-sidebar-navigation-nav-item-nav-hover-background hover:text-text-primary',
                    )}
                  >
                    {item.title}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Expanded simple link
  return (
    href && (
      <Link
        href={href}
        onClick={onItemClick}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
          isActive
            ? 'bg-sidebar-navigation-nav-item-nav-hover-background text-text-primary'
            : 'text-text-secondary hover:bg-sidebar-navigation-nav-item-nav-hover-background hover:text-text-primary',
        )}
      >
        <span
          className={cn(
            'transition-colors duration-200',
            isActive ? 'text-icon-primary' : 'text-icon-tertiary',
          )}
        >
          {icon}
        </span>
        <span>{label}</span>
      </Link>
    )
  );
}
