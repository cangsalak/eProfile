'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ALL_SYSTEM_MODULES } from '@/modules/core/registry';
import { ModuleMenu } from '@/modules/core/types';
import { usePageHeader } from './PageHeaderContext';

interface BreadcrumbItem {
  href: string;
  label: string;
}

interface PageMeta {
  title: string;
  description?: string;
  icon?: string;
  items: BreadcrumbItem[];
  moduleMenus?: ModuleMenu[];
  currentModuleId?: string;
}

// Static Base Pages (Non-module routes)
const staticPageMap: Record<string, PageMeta> = {
  '/': {
    title: 'หน้าหลัก (Dashboard)',
    description: 'ภาพรวมระบบและสถิติข้อมูลบุคลากร',
    icon: 'fa-solid fa-house',
    items: [{ href: '/', label: 'หน้าหลัก' }, { href: '/dashboard', label: 'Dashboard' }],
  },
  '/dashboard': {
    title: 'หน้าหลัก (Dashboard)',
    description: 'ภาพรวมระบบและสถิติข้อมูลบุคลากร',
    icon: 'fa-solid fa-house',
    items: [{ href: '/', label: 'หน้าหลัก' }, { href: '/dashboard', label: 'Dashboard' }],
  },
  '/settings': {
    title: 'ตั้งค่าระบบ',
    description: 'จัดการข้อมูลหน่วยงาน ธีม และการตั้งค่าทั่วไปของระบบ',
    icon: 'fa-solid fa-gear',
    items: [{ href: '/', label: 'หน้าหลัก' }, { href: '/settings', label: 'ตั้งค่าระบบ' }],
  },
  '/profile': {
    title: 'โปรไฟล์ของฉัน',
    description: 'ข้อมูลส่วนตัวและประวัติการทำงาน',
    icon: 'fa-solid fa-user',
    items: [{ href: '/', label: 'หน้าหลัก' }, { href: '/profile', label: 'โปรไฟล์' }],
  },
  '/notifications': {
    title: 'การแจ้งเตือนทั้งหมด',
    description: 'ข้อความและรายการแจ้งเตือนในระบบ',
    icon: 'fa-solid fa-bell',
    items: [{ href: '/', label: 'หน้าหลัก' }, { href: '/notifications', label: 'การแจ้งเตือน' }],
  },
  '/about': {
    title: 'เกี่ยวกับระบบ',
    description: 'รายละเอียดและข้อมูลระบบ eProfile',
    icon: 'fa-solid fa-circle-info',
    items: [{ href: '/', label: 'หน้าหลัก' }, { href: '/about', label: 'เกี่ยวกับระบบ' }],
  },
  '/contact': {
    title: 'ติดต่อเรา',
    description: 'ข้อมูลการติดต่อและส่งข้อความถึงผู้ดูแลระบบ',
    icon: 'fa-solid fa-envelope',
    items: [{ href: '/', label: 'หน้าหลัก' }, { href: '/contact', label: 'ติดต่อเรา' }],
  },
  '/inspector': {
    title: 'ตรวจสอบระบบ (System Inspector)',
    description: 'วินิจฉัย DOM, Broken Links, Accessibility และ Security Headers',
    icon: 'fa-solid fa-shield-halved',
    items: [{ href: '/', label: 'หน้าหลัก' }, { href: '/inspector', label: 'System Inspector' }],
  },
};

/**
 * Automatically resolves Page Title, Subtitle, Icon, Breadcrumbs, and Sub-menus for any module.
 * Reads directly from Module Manifests so new modules work with zero configuration.
 */
function resolvePageMeta(pathname: string): PageMeta {
  const path = pathname.replace(/\/+$/, '') || '/';

  // 1. Static base pages lookup
  if (staticPageMap[path]) {
    return staticPageMap[path];
  }

  // 2. Search across ALL registered Module Manifests dynamically
  for (const mod of ALL_SYSTEM_MODULES) {
    const modBaseUrl = `/modules/${mod.id}`;
    const modName = mod.name;
    const modIcon = mod.icon || 'fa-cubes';
    const modDesc = mod.description;

    // A. Exact match with module base URL
    if (path === modBaseUrl) {
      return {
        title: modName,
        description: modDesc,
        icon: modIcon,
        items: [{ href: '/', label: 'หน้าหลัก' }, { href: modBaseUrl, label: modName }],
        moduleMenus: mod.menus,
        currentModuleId: mod.id,
      };
    }

    // B. Match menus or subItems defined in the manifest
    for (const menu of mod.menus) {
      if (menu.path === path) {
        return {
          title: menu.title,
          description: modDesc,
          icon: menu.icon || modIcon,
          items: [{ href: '/', label: 'หน้าหลัก' }, { href: modBaseUrl, label: modName }, { href: path, label: menu.title }],
          moduleMenus: mod.menus,
          currentModuleId: mod.id,
        };
      }

      if (menu.subItems) {
        for (const sub of menu.subItems) {
          if (sub.path === path) {
            return {
              title: sub.name,
              description: modDesc,
              icon: menu.icon || modIcon,
              items: [
                { href: '/', label: 'หน้าหลัก' },
                { href: modBaseUrl, label: modName },
                { href: menu.path, label: menu.title },
                { href: sub.path, label: sub.name },
              ],
              moduleMenus: mod.menus,
              currentModuleId: mod.id,
            };
          }
        }
      }
    }

    // C. Check Legacy Routes mapping in the manifest
    if (mod.legacyRoutes) {
      for (const [legacyPath, targetPath] of Object.entries(mod.legacyRoutes)) {
        if (path === legacyPath || path.startsWith(`${legacyPath}/`)) {
          const resolved = resolvePageMeta(targetPath);
          return {
            ...resolved,
            moduleMenus: mod.menus,
            currentModuleId: mod.id,
          };
        }
      }
    }

    // D. Path is within this module (/modules/[mod.id]/[...slug])
    if (path.startsWith(`${modBaseUrl}/`)) {
      const subSlug = path.slice(modBaseUrl.length + 1);
      const subSegments = subSlug.split('/').filter(Boolean);
      const lastSegment = subSegments[subSegments.length - 1];
      const formattedSlug = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');

      // Check if there is a menu item matching this path
      const matchedMenu = mod.menus.find(m => m.path === path);

      return {
        title: matchedMenu ? matchedMenu.title : `${modName} (${formattedSlug})`,
        description: modDesc,
        icon: matchedMenu?.icon || modIcon,
        items: [
          { href: '/', label: 'หน้าหลัก' },
          { href: modBaseUrl, label: modName },
          { href: path, label: matchedMenu ? matchedMenu.title : formattedSlug },
        ],
        moduleMenus: mod.menus,
        currentModuleId: mod.id,
      };
    }
  }

  // 3. Fallback Auto-Parser for any dynamic URL or unlisted custom page
  const segments = path.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [{ href: '/', label: 'หน้าหลัก' }];

  let accumulated = '';
  segments.forEach((seg) => {
    accumulated += `/${seg}`;
    const formatted = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
    items.push({
      href: accumulated,
      label: formatted,
    });
  });

  const lastSegment = segments[segments.length - 1] || 'Dashboard';
  const autoTitle = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');

  return {
    title: autoTitle,
    icon: 'fa-solid fa-layer-group',
    items,
  };
}

function formatFontAwesomeIcon(iconStr?: string): string {
  if (!iconStr) return 'fa-solid fa-layer-group';
  
  const trimmed = iconStr.trim();
  
  if (/^(fa-solid|fa-regular|fa-brands|fa-light|fa-thin|fa-duotone|fas|far|fab)\s+/.test(trimmed)) {
    return trimmed;
  }
  
  if (trimmed.startsWith('fa-')) {
    return `fa-solid ${trimmed}`;
  }
  
  return `fa-solid fa-${trimmed}`;
}

export default function PageBreadcrumb() {
  const pathname = usePathname();
  const { extraContent, customTitle, customSubtitle } = usePageHeader();

  // Don't render breadcrumbs on auth/install pages
  if (['/login', '/register', '/install', '/forgot-password'].includes(pathname)) {
    return null;
  }

  const { title, description, icon, items, moduleMenus, currentModuleId } = resolvePageMeta(pathname);
  const formattedIcon = formatFontAwesomeIcon(icon);

  const hasSubMenus = moduleMenus && moduleMenus.length > 1;

  return (
    <div className="mb-6 animate-fade-in font-prompt no-print print:hidden">
      {/* Small Top Breadcrumb Trail */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <React.Fragment key={item.href + idx}>
              {idx > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
              {isLast ? (
                <span className="text-slate-700 dark:text-slate-200 font-medium">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Main Page Title Header Bar with Right-side Sub-Menu / Action Slot (Yellow Box Area) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Side: Icon & Title & Description */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary-50 dark:bg-primary-950/50 border border-primary-100 dark:border-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 shadow-xs shrink-0 mt-0.5 sm:mt-0">
            <i className={`${formattedIcon} text-lg`}></i>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight truncate">
              {customTitle || title}
            </h1>
            {(customSubtitle || description) && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                {customSubtitle || description}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Sub-Menus / Module Navigation Tabs / Custom Page Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {extraContent ? (
            extraContent
          ) : hasSubMenus ? (
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              {moduleMenus.map((menu) => {
                const isActive = pathname === menu.path || (menu.path !== `/modules/${currentModuleId}` && pathname.startsWith(menu.path));
                const menuIcon = formatFontAwesomeIcon(menu.icon);
                return (
                  <Link
                    key={menu.id || menu.path}
                    href={menu.path}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50 border border-transparent'
                    }`}
                  >
                    <i className={`${menuIcon} text-[11px]`}></i>
                    <span>{menu.title}</span>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
