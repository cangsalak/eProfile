'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { 
  CloseIcon, 
  SidebarExpandedIcon, 
  ThreeDots, 
  HomeIcon, 
  CalendarIcon, 
  UserIcon, 
  AlphabetIcon, 
  TableIcon, 
  LetterIcon, 
  ChatIcon, 
  Widget4Icon 
} from './icon';
import NavItem from './nav-item';
import { MenuItem } from '@/components/layout/Sidebar';

function getMenuSvgIcon(path: string, iconStr: string) {
  if (path === '/' || path.includes('dashboard')) return <HomeIcon />;
  if (path.includes('calendar')) return <CalendarIcon />;
  if (path.includes('personnel') || path.includes('directory')) return <UserIcon />;
  if (path.includes('leave')) return <AlphabetIcon />;
  if (path.includes('vehicle')) return <TableIcon />;
  if (path.includes('news')) return <LetterIcon />;
  if (path.includes('contact')) return <ChatIcon />;
  if (path.includes('module')) return <Widget4Icon />;
  return <i className={cn(iconStr, 'text-base w-5 text-center')} />;
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

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* System Brand Header */}
      <div
        className={cn(
          'flex items-center px-4 pt-6 pb-2 text-text-primary shrink-0',
          isExpanded ? 'justify-between' : 'flex-col justify-center gap-4',
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
                isExpanded ? 'h-9 max-w-[170px]' : 'h-9 w-9'
              )} 
            />
          ) : (
            <>
              <div className="h-9 w-9 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform shrink-0">
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

              {isExpanded && (
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-extrabold text-text-primary tracking-tight truncate leading-tight">
                    {systemSettings?.systemName || 'eProfile'}
                  </span>
                  <span className="text-[11px] font-medium text-text-tertiary truncate leading-tight mt-0.5">
                    {systemSettings?.siteTitle || systemSettings?.organizationName || 'ระบบฐานข้อมูลบุคลากร'}
                  </span>
                </div>
              )}
            </>
          )}
        </Link>

        <button
          type="button"
          onClick={toggleSidebar}
          className={cn(
            'p-1.5 transition-colors',
            isMobileSheet
              ? 'rounded-lg text-icon-tertiary hover:bg-background-gray-primary hover:text-text-primary'
              : 'text-icon-tertiary hover:text-text-secondary',
          )}
          aria-label={isMobileSheet ? 'Close sidebar' : 'Toggle sidebar'}
        >
          {isMobileSheet ? <CloseIcon /> : <SidebarExpandedIcon />}
        </button>
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          'scrollbar-thin flex-1 overflow-y-auto',
          isExpanded ? 'mt-5 space-y-6 px-4' : 'mt-4 px-2',
        )}
      >
        <div>
          {isExpanded ? (
            <p className="mt-4 mb-4 text-xs text-text-tertiary uppercase font-semibold tracking-wider">
              MAIN MENU
            </p>
          ) : (
            <span className="flex items-center justify-center pt-4 pb-4 text-icon-secondary">
              <ThreeDots />
            </span>
          )}

          <div className={cn('space-y-1', !isExpanded && 'space-y-1.5')}>
            {menuItems?.map((item) => (
              <NavItem
                key={item.path}
                id={item.path}
                icon={getMenuSvgIcon(item.path, item.icon)}
                label={item.name}
                href={item.path}
                items={item.subItems?.map((sub) => ({ title: sub.name, url: sub.path }))}
                collapsed={!isExpanded}
                onItemClick={onItemClick}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* System Status / Organization Footer */}
      {isExpanded && (
        <div className="px-4 py-3 shrink-0">
          <div className="rounded-xl border border-card-border bg-background-gray-primary/60 dark:bg-card-surface-area/40 px-3.5 py-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-text-primary truncate">
                {systemSettings?.systemName || 'eProfile'}
              </p>
              <p className="text-[10px] text-text-tertiary truncate">
                พร้อมใช้งาน • v2.5.0
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
