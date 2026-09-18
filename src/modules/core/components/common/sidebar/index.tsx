'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/modules/core/lib/cn';
import { 
  CloseIcon, 
  SidebarExpandedIcon, 
  ThreeDots, 
} from './icon';
import NavItem from './nav-item';
import { getActiveMenuPath } from './utils';
import { MenuItem } from '@/modules/core/components/layout/Sidebar';

function getMenuIcon(icon?: string) {
  if (icon && (icon.startsWith('fa') || icon.includes('fa-'))) {
    return <i className={cn(icon, 'text-base w-5 text-center shrink-0')} />;
  }
  
  if (icon) {
    return <i className={cn(icon, 'text-base w-5 text-center shrink-0')} />;
  }

  return <i className="fa-solid fa-layer-group text-base w-5 text-center shrink-0" />;
}

export default function Sidebar({
  isSidebarOpen,
  toggleSidebar,
  isSidebarCollapsed,
  isMobileSheet = false,
  systemSettings,
  menuItems,
  isDarkMode,
  onItemClick,
}: {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isSidebarCollapsed?: boolean;
  isMobileSheet?: boolean;
  systemSettings?: any;
  menuItems?: MenuItem[];
  isDarkMode?: boolean;
  onItemClick?: () => void;
}) {
  const isExpanded = !isSidebarCollapsed;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams?.toString();

  // Extract all distinct menu and sub-menu paths to determine single best active match
  const allMenuPaths = React.useMemo(() => {
    const paths: string[] = [];
    menuItems?.forEach((item) => {
      if (item.path) paths.push(item.path);
      item.subItems?.forEach((sub) => {
        if (sub.path) paths.push(sub.path);
      });
    });
    return paths;
  }, [menuItems]);

  const activePath = React.useMemo(() => {
    return getActiveMenuPath(pathname, allMenuPaths, searchParamsStr);
  }, [pathname, allMenuPaths, searchParamsStr]);

  const { personalMenus, operationsMenus, systemMenus } = React.useMemo(() => {
    return {
      personalMenus: menuItems?.filter(i => i.group === 'personal' || !i.group) || [],
      operationsMenus: menuItems?.filter(i => i.group === 'operations') || [],
      systemMenus: menuItems?.filter(i => i.group === 'system') || [],
    };
  }, [menuItems]);

  const renderMenuGroup = (items: MenuItem[], title: string) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-4">
        {isExpanded ? (
          <div className="flex items-center gap-2 px-3 pb-2 pt-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              {title}
            </span>
            <div className="h-px flex-1 bg-slate-200/60 dark:bg-slate-800/60" />
          </div>
        ) : (
          <div className="flex items-center justify-center py-2 text-slate-400 dark:text-slate-600">
            <ThreeDots />
          </div>
        )}

        <div className={cn('space-y-0.5', !isExpanded && 'space-y-1')}>
          {items.map((item) => (
            <NavItem
              key={item.path}
              id={item.path}
              icon={getMenuIcon(item.icon)}
              label={item.name}
              href={item.path}
              items={item.subItems?.map((sub) => ({ title: sub.name, url: sub.path }))}
              collapsed={!isExpanded}
              activePath={activePath}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 transition-colors">
      {/* System Brand Header */}
      <div
        className={cn(
          'flex items-center px-4 pt-5 pb-3 shrink-0 border-b border-slate-100 dark:border-slate-800/60',
          isExpanded ? 'justify-between' : 'flex-col justify-center gap-3',
        )}
      >
        <Link 
          href="/" 
          onClick={onItemClick}
          className="flex items-center gap-3 group min-w-0"
        >
          {systemSettings?.systemLogo ? (
            <img 
              src={systemSettings.systemLogo} 
              alt={systemSettings?.systemName || 'System Logo'} 
              className={cn(
                'object-contain transition-transform group-hover:scale-105 shrink-0',
                isExpanded ? 'h-8.5 max-w-[160px]' : 'h-8.5 w-8.5'
              )} 
            />
          ) : (
            <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-600/25 group-hover:scale-105 transition-transform shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}

          {isExpanded && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate leading-tight">
                {systemSettings?.systemName || 'eProfile'}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                {systemSettings?.siteTitle || systemSettings?.organizationName || 'ระบบฐานข้อมูลบุคลากร'}
              </span>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0"
          aria-label={isMobileSheet ? 'Close sidebar' : 'Toggle sidebar'}
        >
          {isMobileSheet ? <CloseIcon /> : <SidebarExpandedIcon />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav
        className={cn(
          'flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800',
          isExpanded ? 'py-4 px-3 space-y-4' : 'py-3 px-2',
        )}
      >
        <div>
          {renderMenuGroup(personalMenus, 'ส่วนตัวและทั่วไป')}
          {renderMenuGroup(operationsMenus, 'ปฏิบัติการและอนุมัติ')}
          {renderMenuGroup(systemMenus, 'การตั้งค่าระบบ')}
        </div>
      </nav>

      {/* System Status / Organization Footer */}
      {isExpanded && (
        <div className="p-3 shrink-0 border-t border-slate-100 dark:border-slate-800/60">
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 p-2.5 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {systemSettings?.systemName || 'eProfile'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5 flex items-center gap-1.5">
                <span>ออนไลน์</span>
                <span>•</span>
                <span>v2.5.0</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
