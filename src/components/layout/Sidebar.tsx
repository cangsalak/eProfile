import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface MenuItem {
  name: string;
  icon: string;
  path: string;
  subItems?: { name: string; path: string }[];
}

interface SidebarProps {
  isSidebarOpen: boolean;
  systemSettings: any;
  menuItems: MenuItem[];
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isSidebarOpen, systemSettings, menuItems, setIsSidebarOpen }: SidebarProps) {
  const pathname = usePathname();
  const [openSubMenus, setOpenSubMenus] = React.useState<Record<string, boolean>>({});

  const toggleSubMenu = (path: string) => {
    setOpenSubMenus(prev => ({ ...prev, [path]: !prev[path] }));
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700/50 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0 flex flex-col print:hidden no-print`}
    >
      <div className="flex flex-col items-center justify-center h-24 border-b border-slate-200 dark:border-slate-700/50 pt-2 shrink-0">
        {systemSettings?.systemLogo ? (
          <img src={systemSettings.systemLogo} alt="Logo" className="h-10 object-contain drop-shadow-md mb-2" />
        ) : (
          <div className="h-10 w-10 bg-gradient-to-tr from-primary-500 to-purple-500 rounded-xl mb-2 flex items-center justify-center shadow-lg text-white font-bold text-xl">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
        )}
        <h1 className="text-lg font-bold bg-gradient-to-r from-primary-300 to-purple-300 bg-clip-text text-transparent tracking-wide text-center px-4 leading-tight truncate w-full">
          {systemSettings?.systemName || 'ระบบฐานข้อมูลบุคลากร'}
        </h1>
      </div>
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isSubMenuOpen = openSubMenus[item.path];
          const isAnyChildActive = hasSubItems && item.subItems!.some(sub => pathname === sub.path || pathname?.startsWith(sub.path + '?'));
          
          const isExactActive = item.path === '/' ? pathname === '/' : (isActive || isAnyChildActive);

          return (
            <div key={item.path} className="flex flex-col">
              {hasSubItems ? (
                <button
                  onClick={() => toggleSubMenu(item.path)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 w-full ${
                    isExactActive
                      ? 'bg-primary-500/20 text-primary-600 dark:text-primary-300 border border-primary-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <i className={`${item.icon} w-5 text-center`}></i>
                    <span>{item.name}</span>
                  </div>
                  <i className={`fa-solid fa-chevron-down text-xs transition-transform ${isSubMenuOpen ? 'rotate-180' : ''}`}></i>
                </button>
              ) : (
                <Link
                  href={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isExactActive
                      ? 'bg-primary-500/20 text-primary-600 dark:text-primary-300 border border-primary-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <i className={`${item.icon} w-5 text-center`}></i>
                  <span>{item.name}</span>
                </Link>
              )}

              {/* Sub Items */}
              {hasSubItems && (
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSubMenuOpen || isAnyChildActive ? 'max-h-64 mt-1 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-col space-y-1 pl-11 pr-2 py-1">
                    {item.subItems!.map((sub) => {
                      const isSubActive = pathname === sub.path;
                      // Support query params in path for active state check if needed, but Next.js pathname doesn't include query. 
                      // For /leave?type=xxx, pathname is just /leave. So we won't highlight exact query matches out of the box unless we use useSearchParams, 
                      // but basic highlight of the parent is enough.
                      
                      return (
                        <Link
                          key={sub.name}
                          href={sub.path}
                          onClick={() => {
                            if (window.innerWidth < 1024) {
                              setIsSidebarOpen(false);
                            }
                          }}
                          className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                            isSubActive // Might just highlight the parent, sub won't perfectly highlight without useSearchParams. It's acceptable.
                              ? 'text-primary-600 dark:text-primary-400 font-medium'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <i className="fa-solid fa-angle-right mr-2 text-xs opacity-50"></i>
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
