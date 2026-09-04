'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Personnel } from '@/types/personnel';
import LoginModal from './LoginModal';
import NextAdminSidebar from './common/sidebar';
import { MenuItem } from './layout/Sidebar';
import TopNavbar from './layout/TopNavbar';
import PageBreadcrumb from './layout/PageBreadcrumb';
import InspectorFloatingButton from '@/modules/system-inspector/components/InspectorFloatingButton';
import { MenuOverride, ModuleRegistry } from '@/lib/modules';
import { cn } from '@/utils/cn';

import { applyThemeSettings } from '@/lib/theme-manager';

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [currentUser, setCurrentUser] = useState<Personnel | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default for mobile
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop collapse state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [systemSettings, setSystemSettings] = useState<any>({
    systemName: 'ระบบฐานข้อมูลบุคลากร',
    systemLogo: '',
    enabledModules: [],
  });
  const [customModules, setCustomModules] = useState<any[]>([]);
  const [menuOverrides, setMenuOverrides] = useState<MenuOverride[]>([]);
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
            systemLogo: data.systemLogo || '',
            enabledModules: data.enabledModules || [],
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

    // Use the same module registry as Menu Manager so installed modules appear in Sidebar.
    fetch('/api/modules')
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to load modules')))
      .then(data => {
        if (Array.isArray(data?.customModules)) {
          setCustomModules(data.customModules);
        }
      })
      .catch(console.error);

    fetch('/api/menus')
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to load menu settings')))
      .then(data => {
        if (Array.isArray(data?.overrides)) setMenuOverrides(data.overrides);
      })
      .catch(() => {});

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
      if (detail.enabledModules !== undefined) {
        setSystemSettings((prev: any) => ({
          ...prev,
          enabledModules: detail.enabledModules,
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

  // Compute dynamic navigation menu items based on enabled modules and user permissions
  let enabledModuleIds: string[] = [];
  try {
    if (typeof systemSettings?.enabledModules === 'string') {
      enabledModuleIds = JSON.parse(systemSettings.enabledModules);
    } else if (Array.isArray(systemSettings?.enabledModules)) {
      enabledModuleIds = systemSettings.enabledModules;
    }
  } catch {
    // fallback to empty
  }

  const menuItems: MenuItem[] = currentUser
    ? ModuleRegistry.getNavigationMenus(currentUser, enabledModuleIds, customModules, menuOverrides)
    : [];

  const isGuest = !currentUser;

  return (
    <div className="flex h-screen print:h-auto bg-[#F4F4F5] dark:bg-[#18181B] text-text-primary overflow-hidden print:overflow-visible font-prompt">
      {/* Mobile Drawer Sidebar (< lg) */}
      {!isGuest && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {!isGuest && (
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-67.5 max-w-67.5 border-r border-card-border bg-card-surface-area transition-transform duration-300 ease-in-out lg:hidden',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <NextAdminSidebar
            isSidebarOpen={true}
            toggleSidebar={() => setIsSidebarOpen(false)}
            isSidebarCollapsed={false}
            isMobileSheet={true}
            systemSettings={systemSettings}
            menuItems={menuItems}
            isDarkMode={isDarkMode}
            onItemClick={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      {/* Desktop Sidebar (lg+) — always in DOM, toggles width */}
      {!isGuest && (
        <aside
          style={{
            width: !isSidebarCollapsed ? '270px' : '72px',
            minWidth: !isSidebarCollapsed ? '270px' : '72px',
            transition: 'width 300ms cubic-bezier(0.4,0,0.2,1), min-width 300ms cubic-bezier(0.4,0,0.2,1)',
          }}
          className="hidden shrink-0 overflow-hidden lg:block border-r border-card-border bg-card-surface-area"
        >
          <NextAdminSidebar 
            isSidebarOpen={!isSidebarCollapsed} 
            toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isSidebarCollapsed={isSidebarCollapsed}
            systemSettings={systemSettings} 
            menuItems={menuItems}
            isDarkMode={isDarkMode}
          />
        </aside>
      )}

      {/* Main Content Column with NextAdmin HQ Surface Container */}
      <div className={cn('min-w-0 flex-1 flex flex-col overflow-hidden print:overflow-visible transition-all duration-300', !isGuest ? (!isSidebarCollapsed ? 'lg:p-4 lg:pr-4' : 'lg:py-4 lg:px-4') : '')}>
        <div className="flex h-full flex-col overflow-hidden border-[0.5px] border-card-surface-border bg-card-surface-area lg:rounded-2xl lg:shadow-[0_3px_6px_-2px_rgba(0,0,0,0.02),0_1px_1px_0_rgba(0,0,0,0.04)]">
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

          {/* Header Inside Surface Container */}
          <TopNavbar 
            isGuest={isGuest}
            systemSettings={systemSettings}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
            currentUser={currentUser}
            handleLogout={handleLogout}
            setIsLoginModalOpen={setIsLoginModalOpen}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />

          {/* Page Content Inside Surface Container */}
          <main className="scrollbar-thin flex-1 min-h-0 overflow-y-auto print:overflow-visible p-4 sm:p-6 lg:p-8 scroll-smooth">
            <div className="mx-auto w-full max-w-384 pb-5">
              {!isGuest && <PageBreadcrumb />}
              {children}
            </div>
          </main>
        </div>
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
