'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Breadcrumbs } from '@/components/tailgrids/core/breadcrumbs';

interface BreadcrumbItem {
  href: string;
  label: string;
}

interface PageMeta {
  title: string;
  items: BreadcrumbItem[];
}

function resolvePageMeta(pathname: string): PageMeta {
  // Normalize path (remove trailing slashes)
  const path = pathname.replace(/\/+$/, '') || '/';

  // Exact Match Mapping
  const exactMap: Record<string, PageMeta> = {
    '/': {
      title: 'หน้าหลัก (Dashboard)',
      items: [{ href: '/', label: 'Home' }, { href: '/dashboard', label: 'Dashboard' }],
    },
    '/dashboard': {
      title: 'หน้าหลัก (Dashboard)',
      items: [{ href: '/', label: 'Home' }, { href: '/dashboard', label: 'Dashboard' }],
    },
    '/modules/command-dashboard': {
      title: 'ศูนย์บัญชาการและรายงานความพร้อม',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/command-dashboard', label: 'Command Dashboard' }],
    },
    '/dashboard/command': {
      title: 'ศูนย์บัญชาการและรายงานความพร้อม',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/command-dashboard', label: 'Command Dashboard' }],
    },
    '/modules/personnel': {
      title: 'ระบบทำเนียบบุคลากร',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/personnel', label: 'Personnel' }],
    },
    '/personnel': {
      title: 'ระบบทำเนียบบุคลากร',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/personnel', label: 'Personnel' }],
    },
    '/modules/personnel/directory': {
      title: 'ทำเนียบบุคลากร (Directory)',
      items: [
        { href: '/', label: 'Home' },
        { href: '/modules/personnel', label: 'Personnel' },
        { href: '/modules/personnel/directory', label: 'Directory' },
      ],
    },
    '/directory': {
      title: 'ทำเนียบบุคลากร (Directory)',
      items: [
        { href: '/', label: 'Home' },
        { href: '/modules/personnel', label: 'Personnel' },
        { href: '/modules/personnel/directory', label: 'Directory' },
      ],
    },
    '/modules/personnel/manage': {
      title: 'จัดการข้อมูลบุคลากร',
      items: [
        { href: '/', label: 'Home' },
        { href: '/modules/personnel', label: 'Personnel' },
        { href: '/modules/personnel/manage', label: 'Manage Personnel' },
      ],
    },
    '/manage/personnel': {
      title: 'จัดการข้อมูลบุคลากร',
      items: [
        { href: '/', label: 'Home' },
        { href: '/modules/personnel', label: 'Personnel' },
        { href: '/modules/personnel/manage', label: 'Manage Personnel' },
      ],
    },
    '/modules/personnel/roles': {
      title: 'จัดการบทบาทและสิทธิ์',
      items: [
        { href: '/', label: 'Home' },
        { href: '/modules/personnel', label: 'Personnel' },
        { href: '/manage/roles', label: 'Roles & Permissions' },
      ],
    },
    '/manage/roles': {
      title: 'จัดการบทบาทและสิทธิ์',
      items: [
        { href: '/', label: 'Home' },
        { href: '/modules/personnel', label: 'Personnel' },
        { href: '/manage/roles', label: 'Roles & Permissions' },
      ],
    },
    '/modules/badges': {
      title: 'พิมพ์บัตรประจำตัว',
      items: [
        { href: '/', label: 'Home' },
        { href: '/modules/personnel', label: 'Personnel' },
        { href: '/modules/badges', label: 'ID Badges' },
      ],
    },
    '/modules/leaves': {
      title: 'ระบบการลา',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/leaves', label: 'Leave Management' }],
    },
    '/leaves': {
      title: 'ระบบการลา',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/leaves', label: 'Leave Management' }],
    },
    '/leave': {
      title: 'ระบบการลา',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/leaves', label: 'Leave Management' }],
    },
    '/modules/leaves/approvals': {
      title: 'อนุมัติการลา (Leave Approvals)',
      items: [
        { href: '/', label: 'Home' },
        { href: '/modules/leaves', label: 'Leave Management' },
        { href: '/modules/leaves/approvals', label: 'Approvals' },
      ],
    },
    '/manage/leave-approvals': {
      title: 'อนุมัติการลา (Leave Approvals)',
      items: [
        { href: '/', label: 'Home' },
        { href: '/modules/leaves', label: 'Leave Management' },
        { href: '/modules/leaves/approvals', label: 'Approvals' },
      ],
    },
    '/modules/vehicles': {
      title: 'ระบบยานพาหนะ',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/vehicles', label: 'Vehicle Management' }],
    },
    '/vehicles': {
      title: 'ระบบยานพาหนะ',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/vehicles', label: 'Vehicle Management' }],
    },
    '/modules/calendar': {
      title: 'ปฏิทินปฏิบัติงาน',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/calendar', label: 'Duty Calendar' }],
    },
    '/calendar': {
      title: 'ปฏิทินปฏิบัติงาน',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/calendar', label: 'Duty Calendar' }],
    },
    '/modules/news': {
      title: 'ข่าวสารและประกาศ',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/news', label: 'News & Announcements' }],
    },
    '/news': {
      title: 'ข่าวสารและประกาศ',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/news', label: 'News & Announcements' }],
    },
    '/manage/news/settings': {
      title: 'ตั้งค่าหมวดหมู่ข่าวสาร',
      items: [
        { href: '/', label: 'Home' },
        { href: '/modules/news', label: 'News' },
        { href: '/manage/news/settings', label: 'Category Settings' },
      ],
    },
    '/modules/contacts': {
      title: 'จัดการข้อมูลติดต่อ',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/contacts', label: 'Contact Management' }],
    },
    '/contacts': {
      title: 'จัดการข้อมูลติดต่อ',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/contacts', label: 'Contact Management' }],
    },
    '/contact': {
      title: 'จัดการข้อมูลติดต่อ',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/contacts', label: 'Contact Management' }],
    },
    '/modules/system-inspector': {
      title: 'ระบบตรวจสอบความปลอดภัย (System Inspector)',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/system-inspector', label: 'System Inspector' }],
    },
    '/manage/inspector': {
      title: 'ระบบตรวจสอบความปลอดภัย (System Inspector)',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/system-inspector', label: 'System Inspector' }],
    },
    '/manage/inspector/categories': {
      title: 'จัดการหมวดหมู่การตรวจสอบความปลอดภัย',
      items: [
        { href: '/', label: 'Home' },
        { href: '/modules/system-inspector', label: 'System Inspector' },
        { href: '/manage/inspector/categories', label: 'Categories' },
      ],
    },
    '/modules/menus': {
      title: 'จัดการเมนูและแถบนำทาง',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/menus', label: 'Menu Manager' }],
    },
    '/manage/menus': {
      title: 'จัดการเมนูและแถบนำทาง',
      items: [{ href: '/', label: 'Home' }, { href: '/modules/menus', label: 'Menu Manager' }],
    },
    '/modules/theme': {
      title: 'ตั้งค่าการแสดงผลและธีม',
      items: [{ href: '/', label: 'Home' }, { href: '/manage/theme', label: 'Theme Settings' }],
    },
    '/manage/theme': {
      title: 'ตั้งค่าการแสดงผลและธีม',
      items: [{ href: '/', label: 'Home' }, { href: '/manage/theme', label: 'Theme Settings' }],
    },
    '/modules/backup': {
      title: 'สำรองและฟื้นฟูข้อมูล',
      items: [{ href: '/', label: 'Home' }, { href: '/manage/backup', label: 'Backup & Restore' }],
    },
    '/manage/backup': {
      title: 'สำรองและฟื้นฟูข้อมูล',
      items: [{ href: '/', label: 'Home' }, { href: '/manage/backup', label: 'Backup & Restore' }],
    },
    '/modules/module-manager': {
      title: 'จัดการโมดูลส่วนเสริม',
      items: [{ href: '/', label: 'Home' }, { href: '/manage/modules', label: 'Module Manager' }],
    },
    '/manage/modules': {
      title: 'จัดการโมดูลส่วนเสริม',
      items: [{ href: '/', label: 'Home' }, { href: '/manage/modules', label: 'Module Manager' }],
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
  };

  if (exactMap[path]) {
    return exactMap[path];
  }

  // Dynamic prefix matching
  if (path.startsWith('/news/')) {
    return {
      title: 'รายละเอียดข่าวสาร',
      items: [
        { href: '/', label: 'Home' },
        { href: '/modules/news', label: 'News' },
        { href: path, label: 'News Detail' },
      ],
    };
  }

  if (path.startsWith('/personnel/')) {
    return {
      title: 'รายละเอียดข้อมูลบุคลากร',
      items: [
        { href: '/', label: 'Home' },
        { href: '/modules/personnel', label: 'Personnel' },
        { href: path, label: 'Personnel Detail' },
      ],
    };
  }

  // Fallback parser: build from path segments
  const segments = path.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [{ href: '/', label: 'Home' }];

  let accumulated = '';
  segments.forEach((seg, idx) => {
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
