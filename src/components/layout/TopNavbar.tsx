'use client';

import React, { useState } from 'react';
import ProfileDropdown from './ProfileDropdown';
import NotificationDropdown from './NotificationDropdown';
import SearchBar from './SearchBar';
import { Personnel } from '@/types/personnel';
import { SunIcon, MoonIcon, MenuIcon } from './icons';
import { ThreeDots } from '@/components/common/sidebar/icon';
import { cn } from '@/utils/cn';

interface TopNavbarProps {
  isGuest: boolean;
  systemSettings: any;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isSidebarCollapsed?: boolean;
  setIsSidebarCollapsed?: (collapsed: boolean) => void;
  currentUser: Personnel | null;
  handleLogout: () => void;
  setIsLoginModalOpen: (isOpen: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function TopNavbar({
  isGuest,
  systemSettings,
  isSidebarOpen,
  setIsSidebarOpen,
  currentUser,
  handleLogout,
  setIsLoginModalOpen,
  isDarkMode,
  toggleDarkMode,
}: TopNavbarProps) {
  const [isMobileInfoOpen, setIsMobileInfoOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b-[0.5px] border-card-border bg-card-surface-area px-4 py-4 lg:px-6 shrink-0 flex items-center justify-between print:hidden no-print">
        {isGuest ? (
          <div className="flex items-center">
            {systemSettings?.systemLogo && (
              <img src={systemSettings.systemLogo} alt="Logo" className="h-8 object-contain drop-shadow-md mr-3" />
            )}
            <h1 className="text-xl font-bold text-text-primary">
              {systemSettings?.systemName || 'ระบบฐานข้อมูลบุคลากร'}
            </h1>
          </div>
        ) : (
          <>
            {/* Mobile layout (< lg) — 3-column: menu | title | dots */}
            <div className="flex items-center lg:hidden w-full justify-between">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="rounded-md p-1.5 text-icon-tertiary hover:text-text-primary transition-colors"
                aria-label="Open sidebar menu"
              >
                <MenuIcon />
              </button>

              <span className="font-semibold text-text-primary text-base truncate max-w-45">
                {systemSettings?.systemName || 'eProfile'}
              </span>

              <button
                type="button"
                onClick={() => setIsMobileInfoOpen(!isMobileInfoOpen)}
                aria-label="Open quick access"
                className={cn(
                  'rounded-md p-1.5 transition-colors',
                  isMobileInfoOpen
                    ? 'bg-background-gray-secondary text-text-primary'
                    : 'text-icon-tertiary hover:text-text-primary',
                )}
              >
                <ThreeDots />
              </button>
            </div>

            {/* Desktop layout (lg+) */}
            <div className="hidden lg:flex items-center justify-between w-full">
              {/* Left Side - Search */}
              <div className="max-w-xs flex-1">
                <SearchBar />
              </div>

              {/* Right Side - Actions */}
              <div className="flex items-center gap-2.5">
                <button 
                  type="button"
                  onClick={toggleDarkMode}
                  className="size-10 rounded-lg border border-card-border bg-card-background text-icon-primary shadow-xs flex items-center justify-center hover:bg-background-gray-primary transition-colors"
                  title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? <MoonIcon /> : <SunIcon />}
                </button>

                {currentUser ? (
                  <>
                    <NotificationDropdown currentUser={currentUser} />
                    <ProfileDropdown currentUser={currentUser} handleLogout={handleLogout} />
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-all shadow-xs flex items-center shrink-0"
                  >
                    <i className="fa-solid fa-user-lock mr-2"></i>
                    <span>Login</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Mobile Quick Actions Bar (< lg) */}
      {!isGuest && isMobileInfoOpen && (
        <div className="lg:hidden border-b border-card-border bg-card-surface-area px-4 py-3 shadow-xs animate-slide-down">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <SearchBar />

              <button 
                type="button"
                onClick={toggleDarkMode}
                className="size-10 rounded-lg border border-card-border bg-card-background text-icon-primary shadow-xs flex items-center justify-center hover:bg-background-gray-primary transition-colors shrink-0"
                title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {isDarkMode ? <MoonIcon /> : <SunIcon />}
              </button>

              {currentUser && <NotificationDropdown currentUser={currentUser} />}
            </div>

            {currentUser && (
              <ProfileDropdown currentUser={currentUser} handleLogout={handleLogout} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
