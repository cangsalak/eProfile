'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Personnel } from '@/types/personnel';
import LoginModal from './LoginModal';
import Sidebar, { MenuItem } from './layout/Sidebar';
import TopNavbar from './layout/TopNavbar';
import InspectorFloatingButton from './inspector/InspectorFloatingButton';

import { applyThemeSettings } from '@/lib/theme-manager';

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [currentUser, setCurrentUser] = useState<Personnel | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to false for mobile first
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [systemSettings, setSystemSettings] = useState<any>({ systemName: 'ระบบฐานข้อมูลบุคลากร', systemLogo: '' });
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check auth with server session
    fetch('/api/auth/me')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Unauthenticated');
      })
      .then(data => {
        if (data?.user) {
          setCurrentUser(data.user);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        } else {
          setCurrentUser(null);
          localStorage.removeItem('currentUser');
          router.push('/login');
        }
      })
      .catch(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          try {
            setCurrentUser(JSON.parse(savedUser));
          } catch {
            setCurrentUser(null);
            router.push('/login');
          }
        } else {
          router.push('/login');
        }
      });
    
    // Auto-open sidebar on desktop
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }

    // Initialize Theme from localStorage first
    const savedTheme = localStorage.getItem('theme') || 'indigo';
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedFont = localStorage.getItem('systemFont') || 'prompt';
    const savedBorder = localStorage.getItem('borderRadius') || 'rounded';
    const savedSurface = localStorage.getItem('surfaceStyle') || 'shadow';
    
    const initialIsDark = savedDarkMode !== null ? savedDarkMode === 'true' : true;
    setIsDarkMode(initialIsDark);

    applyThemeSettings({
      theme: initialIsDark ? 'dark' : 'light',
      systemColor: savedTheme,
      systemFont: savedFont,
      borderRadius: savedBorder,
      surfaceStyle: savedSurface
    });

    // Fetch Global Settings from server
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSystemSettings({
            systemName: data.systemName || 'ระบบฐานข้อมูลบุคลากร',
            systemLogo: data.systemLogo || ''
          });

          if (data.maintenanceMode === 'true') {
            setIsMaintenanceActive(true);
          }
          
          if (data.isInstalled === 'false' && pathname !== '/install') {
            router.push('/install');
            return;
          }

          if (data.theme) {
            setIsDarkMode(data.theme === 'dark');
          }

          applyThemeSettings(data);
        }
      })
      .catch(console.error);

    // Listen for live theme updates across the application
    const handleLiveThemeUpdate = (e: CustomEvent) => {
      const detail = e.detail;
      if (detail.theme) {
        setIsDarkMode(detail.theme === 'dark');
      }
      if (detail.systemName || detail.systemLogo !== undefined) {
        setSystemSettings((prev: any) => ({
          ...prev,
          ...(detail.systemName ? { systemName: detail.systemName } : {}),
          ...(detail.systemLogo !== undefined ? { systemLogo: detail.systemLogo } : {})
        }));
      }
    };

    window.addEventListener('eprofile-theme-change', handleLiveThemeUpdate as EventListener);
    return () => {
      window.removeEventListener('eprofile-theme-change', handleLiveThemeUpdate as EventListener);
    };
  }, [router, pathname]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    applyThemeSettings({ theme: newVal ? 'dark' : 'light' });
  };

  const handleLoginSuccess = (user: Personnel) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {/* best effort */}
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  const menuItems: MenuItem[] = [
    { name: 'หน้าหลัก (Dashboard)', icon: 'fa-solid fa-chart-pie', path: '/dashboard' },
    { name: 'ปฏิทินปฏิบัติงาน', icon: 'fa-solid fa-calendar-days', path: '/calendar' },
    { name: 'ทำเนียบบุคลากร (Directory)', icon: 'fa-solid fa-address-book', path: '/directory' },
  ];

  if (currentUser) {
    menuItems.push({
      name: 'การลา (Leave)',
      icon: 'fa-solid fa-calendar-alt',
      path: '/leave'
    });
  }

  if (currentUser) {
    const perms = currentUser.permissions || [];
    const isAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';

    if (isAdmin || currentUser.role === 'HR_MANAGER' || currentUser.role === 'DEPARTMENT_COMMANDER' || currentUser.role === 'COMMANDER' || perms.includes('VIEW_COMMAND_DASHBOARD')) {
      menuItems.splice(1, 0, {
        name: 'แดชบอร์ดผู้บังคับบัญชา',
        icon: 'fa-solid fa-chess-king',
        path: '/dashboard/command',
      });
    }

    if (isAdmin || perms.includes('MANAGE_PERSONNEL')) {
      menuItems.push({ name: 'จัดการบุคลากร', icon: 'fa-solid fa-users-gear', path: '/manage/personnel' });
    }
    if (isAdmin || currentUser.role === 'HR_MANAGER' || currentUser.role === 'DEPARTMENT_COMMANDER' || currentUser.role === 'COMMANDER' || perms.includes('APPROVE_LEAVE')) {
      menuItems.push({ name: 'อนุมัติการลา', icon: 'fa-solid fa-clipboard-check', path: '/manage/leave-approvals' });
    }
    if (isAdmin || perms.includes('MANAGE_SYSTEM') || perms.includes('MANAGE_ROLES') || perms.includes('MANAGE_POSTS')) {
      menuItems.push({ name: 'จัดการข่าวสารและการแจ้งเตือน', icon: 'fa-solid fa-bullhorn', path: '/manage/notifications' });
      menuItems.push({ name: 'ตั้งค่าระบบ', icon: 'fa-solid fa-cogs', path: '/settings' });
    }
  } else {
    menuItems.length = 0;
  }

  const isGuest = !currentUser;

  return (
    <div className="flex h-screen print:h-auto bg-slate-50 dark:bg-[var(--bg-dark,#0f172a)] text-slate-800 dark:text-slate-200 overflow-hidden print:overflow-visible font-prompt">
      {/* Mobile Backdrop */}
      {!isGuest && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden for Guests */}
      {!isGuest && (
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen}
          systemSettings={systemSettings} 
          menuItems={menuItems}
          currentUser={currentUser}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible bg-slate-50 dark:bg-[var(--bg-dark,#0f172a)] transition-colors duration-300">
        {/* Maintenance Mode Warning Banner for Admins */}
        {isMaintenanceActive && (
          <div className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md shrink-0 z-50">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation text-amber-200"></i>
              <span>⚠️ คำเตือน: ระบบกำลังเปิดใช้งาน <strong>"โหมดปิดปรับปรุงเว็บไซต์"</strong> — ผู้ใช้ทั่วไปจะไม่สามารถเข้าใช้งานหรือดูข้อมูลได้</span>
            </div>
            <a href="/settings" className="underline hover:text-amber-100 font-bold ml-4">
              ไปที่หน้าตั้งค่าเพื่อปิดโหมดปรับปรุง &rarr;
            </a>
          </div>
        )}

        {/* Header */}
        <TopNavbar 
          isGuest={isGuest}
          systemSettings={systemSettings}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          currentUser={currentUser}
          handleLogout={handleLogout}
          setIsLoginModalOpen={setIsLoginModalOpen}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />

        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto print:overflow-visible p-4 sm:p-6 lg:p-8 scroll-smooth ${isGuest ? 'border-x border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/20' : ''}`}>
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <InspectorFloatingButton currentUser={currentUser} />
    </div>
  );
}
