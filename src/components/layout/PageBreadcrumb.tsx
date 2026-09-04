'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Breadcrumbs } from '@/components/tailgrids/core/breadcrumbs';
import { ALL_SYSTEM_MODULES } from '@/lib/modules/registry';

interface BreadcrumbItem {
  href: string;
  label: string;
}

interface PageMeta {
  title: string;
  items: BreadcrumbItem[];
}

// Static Base Pages (Non-module routes)
const staticPageMap: Record<string, PageMeta> = {
  '/': {
    title: 'หน้าหลัก (Dashboard)',
    items: [{ href: '/', label: 'Home' }, { href: '/dashboard', label: 'Dashboard' }],
  },
  '/dashboard': {
    title: 'หน้าหลัก (Dashboard)',
    items: [{ href: '/', label: 'Home' }, { href: '/dashboard', label: 'Dashboard' }],
  },
  '/settings': {
    title: 'ตั้งค่าระบบ',
    items: [{ href: '/', label: 'Home' }, { href: '/settings', label: 'Settings' }],
  },
  '/profile': {
    title: 'โปรไฟล์ของฉัน',
    items: [{ href: '/', label: 'Home' }, { href: '/profile', label: 'My Profile' }],
  },
  '/notifications': {
    title: 'การแจ้งเตือนทั้งหมด',
    items: [{ href: '/', label: 'Home' }, { href: '/notifications', label: 'Notifications' }],
  },
  '/about': {
    title: 'เกี่ยวกับระบบ',
    items: [{ href: '/', label: 'Home' }, { href: '/about', label: 'About' }],
  },
  '/contact': {
    title: 'ติดต่อเรา',
    items: [{ href: '/', label: 'Home' }, { href: '/contact', label: 'Contact Us' }],
  },
};

/**
 * Automatically resolves Page Title and Breadcrumbs for any module (Built-in or newly added).
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
    const modNameEn = mod.nameEn || mod.name;

    // A. Exact match with module base URL
    if (path === modBaseUrl) {
      return {
        title: modName,
        items: [{ href: '/', label: 'Home' }, { href: modBaseUrl, label: modNameEn }],
      };
    }

    // B. Match menus or subItems defined in the manifest
    for (const menu of mod.menus) {
      if (menu.path === path) {
        return {
          title: menu.title,
          items: [{ href: '/', label: 'Home' }, { href: modBaseUrl, label: modNameEn }, { href: path, label: menu.title }],
        };
      }

      if (menu.subItems) {
        for (const sub of menu.subItems) {
          if (sub.path === path) {
            return {
              title: sub.name,
              items: [
                { href: '/', label: 'Home' },
                { href: modBaseUrl, label: modNameEn },
                { href: menu.path, label: menu.title },
                { href: sub.path, label: sub.name },
              ],
            };
          }
        }
      }
    }

    // C. Check Legacy Routes mapping in the manifest
    if (mod.legacyRoutes) {
      for (const [legacyPath, targetPath] of Object.entries(mod.legacyRoutes)) {
        if (path === legacyPath || path.startsWith(`${legacyPath}/`)) {
          return resolvePageMeta(targetPath);
        }
      }
    }

    // D. Path is within this module (/modules/[mod.id]/[...slug])
    if (path.startsWith(`${modBaseUrl}/`)) {
      const subSlug = path.slice(modBaseUrl.length + 1);
      const subSegments = subSlug.split('/').filter(Boolean);
      const lastSegment = subSegments[subSegments.length - 1];
      const formattedSlug = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');

      return {
        title: `${modName} (${formattedSlug})`,
        items: [
          { href: '/', label: 'Home' },
          { href: modBaseUrl, label: modNameEn },
          { href: path, label: formattedSlug },
        ],
      };
    }
  }

  // 3. Fallback Auto-Parser for any dynamic URL or unlisted custom page
  const segments = path.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [{ href: '/', label: 'Home' }];

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
    items,
  };
}

export default function PageBreadcrumb() {
  const pathname = usePathname();

  // Don't render breadcrumbs on auth/install pages
  if (['/login', '/register', '/install', '/forgot-password'].includes(pathname)) {
    return null;
  }

  const { title, items } = resolvePageMeta(pathname);

  return (
    <div className="mb-6 flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
      <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">
        {title}
      </h1>

      <div>
        <Breadcrumbs dividerType="chevron" items={items} />
      </div>
    </div>
  );
}
