import React from 'react';
import ProfileDropdown from './ProfileDropdown';
import NotificationDropdown from './NotificationDropdown';
import { Personnel } from '@/types/personnel';

interface TopNavbarProps {
  isGuest: boolean;
  systemSettings: any;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
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
  return (
    <header className={`h-16 bg-white dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between px-6 z-40 print:hidden no-print ${isGuest ? 'w-full max-w-7xl mx-auto border-x' : ''}`}>
      
      {isGuest ? (
        <div className="flex items-center">
          {systemSettings?.systemLogo && (
            <img src={systemSettings.systemLogo} alt="Logo" className="h-8 object-contain drop-shadow-md mr-3" />
          )}
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
            {systemSettings?.systemName || 'ระบบฐานข้อมูลบุคลากร'}
          </h1>
        </div>
      ) : (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-white transition-colors"
        >
          <i className="fa-solid fa-bars text-xl"></i>
        </button>
      )}

      <div className="flex items-center space-x-3 sm:space-x-4 ml-auto">
        <button 
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          title={isDarkMode ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
        >
          {isDarkMode ? <i className="fa-solid fa-moon"></i> : <i className="fa-solid fa-sun text-amber-400"></i>}
        </button>

        {currentUser ? (
          <>
            <NotificationDropdown currentUser={currentUser} />
            <ProfileDropdown currentUser={currentUser} handleLogout={handleLogout} />
          </>
        ) : (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20 hover:bg-primary-500/20 transition-all text-sm font-medium shadow-[0_0_10px_rgba(99,102,241,0.1)] flex items-center shrink-0"
          >
            <i className="fa-solid fa-user-lock mr-2"></i>
            <span className="hidden sm:inline">เข้าสู่ระบบสำหรับ Admin</span>
            <span className="sm:hidden">เข้าสู่ระบบ</span>
          </button>
        )}
      </div>
    </header>
  );
}
