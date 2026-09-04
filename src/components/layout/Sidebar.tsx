import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Personnel } from '@/types/personnel';

export interface MenuItem {
  name: string;
  icon: string;
  path: string;
  subItems?: { name: string; path: string }[];
}

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  systemSettings: any;
  menuItems: MenuItem[];
  currentUser?: Personnel | null;
}

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  systemSettings,
  menuItems,
}: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQueryString = searchParams?.toString();
  const currentFullUrl = pathname + (currentQueryString ? `?${currentQueryString}` : '');
  const [openSubMenus, setOpenSubMenus] = React.useState<Record<string, boolean>>({});

  const toggleSubMenu = (path: string) => {
    setOpenSubMenus(prev => ({ ...prev, [path]: !prev[path] }));
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#1A222C] text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-[#2E3A47] transform transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0 ${
        isSidebarCollapsed ? 'lg:w-20' : 'lg:w-67.5'
      } flex flex-col print:hidden no-print shrink-0`}
    >
      {/* NextAdmin HQ Header / Logo & Collapse Toggle */}
      <div className={`flex items-center justify-between h-18 border-b border-slate-200 dark:border-[#2E3A47] shrink-0 transition-all ${
        isSidebarCollapsed ? 'px-3 justify-center' : 'px-6'
      }`}>
        <Link href="/" className="flex items-center gap-3 group">
          {systemSettings?.systemLogo ? (
            <img src={systemSettings.systemLogo} alt="Logo" className="h-9 object-contain drop-shadow-md" />
          ) : (
            <div className="h-9 w-9 bg-[#5750F1] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-[#5750F1]/20 group-hover:scale-105 transition-transform shrink-0">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
          )}
          
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-wide truncate max-w-[130px]">
                {systemSettings?.systemName || 'eProfile'}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">NextAdmin v2</span>
            </div>
          )}
        </Link>

        {/* Desktop Sidebar Collapse Toggle Button */}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#2E3A47]"
          title={isSidebarCollapsed ? 'ขยาย Sidebar' : 'ย่อ Sidebar'}
        >
          <i className={`fa-solid ${isSidebarCollapsed ? 'fa-angles-right' : 'fa-angles-left'} text-sm`}></i>
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1"
          title="ปิดเมนู"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      {/* Main Navigation Menu */}
      <nav className="p-3 space-y-6 flex-1 overflow-y-auto scrollbar-thin">
        <div>
          <p className={`text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ${
            isSidebarCollapsed ? 'text-center' : 'px-3'
          }`}>
            {isSidebarCollapsed ? '•••' : 'MAIN MENU'}
          </p>

          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const hasMoreSpecificMatch = menuItems.some(
                other => other.path !== item.path && other.path.startsWith(item.path + '/') && (pathname === other.path || pathname?.startsWith(other.path + '/'))
              );
              const isActive = pathname === item.path || (pathname?.startsWith(item.path + '/') && !hasMoreSpecificMatch);
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isSubMenuOpen = openSubMenus[item.path];
              const isAnyChildActive = hasSubItems && item.subItems!.some(sub => pathname === sub.path || pathname?.startsWith(sub.path + '?'));
              
              const isExactActive = item.path === '/' ? pathname === '/' : (isActive || isAnyChildActive);

              return (
                <div key={item.path} className="flex flex-col">
                  {hasSubItems ? (
                    <button
                      type="button"
                      title={isSidebarCollapsed ? item.name : undefined}
                      onClick={() => toggleSubMenu(item.path)}
                      className={`flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 w-full ${
                        isSidebarCollapsed
                          ? 'justify-center p-3'
                          : 'justify-between px-3.5 py-2.5'
                      } ${
                        isExactActive
                          ? 'bg-[#5750F1]/10 dark:bg-[#5750F1]/20 text-[#5750F1] dark:text-[#818cf8] font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2E3A47]/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                        <i className={`${item.icon} text-sm ${isSidebarCollapsed ? 'w-auto' : 'w-5 text-center'} ${isExactActive ? 'text-[#5750F1] dark:text-[#818cf8]' : 'text-slate-400 dark:text-slate-500'}`}></i>
                        {!isSidebarCollapsed && <span>{item.name}</span>}
                      </div>

                      {!isSidebarCollapsed && (
                        <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${isSubMenuOpen ? 'rotate-180' : ''}`}></i>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.path}
                      title={isSidebarCollapsed ? item.name : undefined}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          setIsSidebarOpen(false);
                        }
                      }}
                      className={`flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                        isSidebarCollapsed
                          ? 'justify-center p-3'
                          : 'space-x-3 px-3.5 py-2.5'
                      } ${
                        isExactActive
                          ? 'bg-[#5750F1]/10 dark:bg-[#5750F1]/20 text-[#5750F1] dark:text-[#818cf8] font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2E3A47]/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <i className={`${item.icon} text-sm ${isSidebarCollapsed ? 'w-auto' : 'w-5 text-center'} ${isExactActive ? 'text-[#5750F1] dark:text-[#818cf8]' : 'text-slate-400 dark:text-slate-500'}`}></i>
                      {!isSidebarCollapsed && <span>{item.name}</span>}
                    </Link>
                  )}

                  {/* Sub Items */}
                  {hasSubItems && (
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isSubMenuOpen || isAnyChildActive ? 'max-h-96 mt-1 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className={`flex flex-col space-y-1 ${isSidebarCollapsed ? 'px-1 py-1 items-center' : 'pl-9 pr-2 py-1'}`}>
                        {item.subItems!.map((sub) => {
                          const isSubActive = pathname === sub.path || currentFullUrl === sub.path;
                          
                          return (
                            <Link
                              key={sub.name}
                              href={sub.path}
                              title={isSidebarCollapsed ? sub.name : undefined}
                              onClick={() => {
                                if (window.innerWidth < 1024) {
                                  setIsSidebarOpen(false);
                                }
                              }}
                              className={`flex items-center rounded-lg text-xs font-medium transition-colors ${
                                isSidebarCollapsed ? 'p-2 justify-center w-full' : 'px-3 py-2'
                              } ${
                                isSubActive
                                  ? 'text-[#5750F1] dark:text-[#818cf8] font-bold bg-[#5750F1]/10 dark:bg-[#5750F1]/20'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2E3A47]/40'
                              }`}
                            >
                              {!isSidebarCollapsed && <i className="fa-solid fa-angle-right mr-2 text-[10px] opacity-60"></i>}
                              <span>{isSidebarCollapsed ? sub.name.substring(0, 2) : sub.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}
