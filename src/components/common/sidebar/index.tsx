'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { Logo, LogoWithText, LogoWithTextDark } from '@/utils/icon';
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
      {/* NextAdmin Header */}
      <div
        className={cn(
          'flex items-center px-4 pt-7 text-text-primary shrink-0',
          isExpanded ? 'justify-between' : 'flex-col justify-center gap-4',
        )}
      >
        <Link href="/" onClick={onItemClick}>
          {isExpanded ? (
            systemSettings?.systemLogo ? (
              <img src={systemSettings.systemLogo} alt="Logo" className="h-8 object-contain" />
            ) : isDarkMode ? (
              <LogoWithTextDark />
            ) : (
              <LogoWithText />
            )
          ) : (
            <Logo />
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
          isExpanded ? 'mt-7 space-y-6 px-4' : 'mt-5 px-2',
        )}
      >
        <div>
          {isExpanded ? (
            <p className="mt-6 mb-4 text-xs text-text-tertiary uppercase font-medium tracking-wider">
              MAIN MENU
            </p>
          ) : (
            <span className="flex items-center justify-center pt-6 pb-4 text-icon-secondary">
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

      {/* NextAdmin Footer Card */}
      {isExpanded && (
        <div className="px-4 py-4 shrink-0">
          <div className="rounded-2xl bg-background-gray-primary px-4 py-5 text-center">
            <p className="mb-2 leading-6 font-semibold text-text-primary">
              Upgrade to Pro
            </p>
            <small className="text-sm leading-5 tracking-[-0.15px] text-text-tertiary">
              Get all dashboard and 200+ essential UI elements
            </small>
            <Link
              href="https://nextadmin.co/pricing"
              className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition-colors shadow-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
