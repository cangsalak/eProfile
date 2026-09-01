'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Personnel } from '@/types/personnel';
import LoginModal from './LoginModal';
import Sidebar, { MenuItem } from './layout/Sidebar';
import TopNavbar from './layout/TopNavbar';
import InspectorFloatingButton from './inspector/InspectorFloatingButton';

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [currentUser, setCurrentUser] = useState<Personnel | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to false for mobile first
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [systemSettings, setSystemSettings] = useState<any>({ systemName: 'ระบบฐานข้อมูลบุคลากร', systemLogo: '' });
  const [isDarkMode, setIsDarkMode] = useState(true);
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

    // Apply local fallback theme if any, but backend will override it
    const savedTheme = localStorage.getItem('theme') || 'indigo';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Check Dark Mode
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setIsDarkMode(savedDarkMode === 'true');
    } else {
      // Default to dark mode if not set
      setIsDarkMode(true);
    }

    // Fetch Global Settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSystemSettings({
            systemName: data.systemName || 'ระบบฐานข้อมูลบุคลากร',
            systemLogo: data.systemLogo || ''
          });
          
          if (data.isInstalled === 'false' && pathname !== '/install') {
            router.push('/install');
            return;
          }
          
          if (data.systemColor === 'custom' && data.customPrimaryColor) {
            document.documentElement.setAttribute('data-theme', 'custom');
            
            // Simple Hex to RGB logic
            let hex = data.customPrimaryColor;
            let r = 0, g = 0, b = 0;
            if (hex.length === 4) {
              r = parseInt(hex[1] + hex[1], 16);
              g = parseInt(hex[2] + hex[2], 16);
              b = parseInt(hex[3] + hex[3], 16);
            } else if (hex.length === 7) {
              r = parseInt(hex.substring(1, 3), 16);
              g = parseInt(hex.substring(3, 5), 16);
              b = parseInt(hex.substring(5, 7), 16);
            }
            
            // Set basic shades
            document.documentElement.style.setProperty('--color-primary-500', `${r} ${g} ${b}`);
            document.documentElement.style.setProperty('--color-primary-600', `${Math.max(0, r-30)} ${Math.max(0, g-30)} ${Math.max(0, b-30)}`);
            document.documentElement.style.setProperty('--color-primary-400', `${Math.min(255, r+30)} ${Math.min(255, g+30)} ${Math.min(255, b+30)}`);
            document.documentElement.style.setProperty('--color-primary-100', `${Math.min(255, r+150)} ${Math.min(255, g+150)} ${Math.min(255, b+150)}`);
            document.documentElement.style.setProperty('--color-primary-50', `${Math.min(255, r+180)} ${Math.min(255, g+180)} ${Math.min(255, b+180)}`);
            
            localStorage.setItem('theme', 'custom');
          } else if (data.systemColor) {
            document.documentElement.setAttribute('data-theme', data.systemColor);
            localStorage.setItem('theme', data.systemColor);
          }
          
          if (data.systemFont) {
            document.documentElement.style.setProperty('--font-primary', `var(--font-${data.systemFont})`);
          }
          
          if (data.borderRadius) {
            document.documentElement.setAttribute('data-border', data.borderRadius);
          }
          
          if (data.layoutDensity) {
            document.documentElement.setAttribute('data-density', data.layoutDensity);
          }
          
          if (data.surfaceStyle) {
            if (data.surfaceStyle === 'flat') {
              document.documentElement.style.setProperty('--surface-bg', 'rgba(255, 255, 255, 1)');
              document.documentElement.style.setProperty('--surface-bg-dark', 'var(--bg-dark)');
              document.documentElement.style.setProperty('--surface-blur', '0px');
              document.documentElement.style.setProperty('--surface-shadow', 'none');
            } else if (data.surfaceStyle === 'shadow') {
              document.documentElement.style.setProperty('--surface-bg', 'rgba(255, 255, 255, 1)');
              document.documentElement.style.setProperty('--surface-bg-dark', 'var(--surface-card)');
              document.documentElement.style.setProperty('--surface-blur', '0px');
              document.documentElement.style.setProperty('--surface-shadow', '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)');
            } else { // glass
              document.documentElement.style.setProperty('--surface-bg', 'rgba(255, 255, 255, 0.8)');
              document.documentElement.style.setProperty('--surface-bg-dark', 'var(--surface-card)');
              document.documentElement.style.setProperty('--surface-blur', '16px');
              document.documentElement.style.setProperty('--surface-shadow', 'none');
            }
          }
        }
      })
      .catch(console.error);
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
    localStorage.setItem('darkMode', String(newVal));
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

    if (isAdmin || perms.includes('MANAGE_PERSONNEL')) {
      menuItems.push({ name: 'จัดการบุคลากร', icon: 'fa-solid fa-users-gear', path: '/manage/personnel' });
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
    <div className="flex h-screen print:h-auto bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 overflow-hidden print:overflow-visible font-prompt">
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
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
