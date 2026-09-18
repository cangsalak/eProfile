import { ModuleManifest } from '@/modules/core/types';

export const InspectorManifest: ModuleManifest = {
  id: 'inspector',
  name: 'ระบบตรวจสอบและวินิจฉัยระบบ',
  nameEn: 'System Inspector & Diagnostics',
  description: 'เครื่องมือตรวจสอบสถานะระบบ Runtime, สแกนความปลอดภัย, แผนผังเส้นทาง API, บันทึกการใช้งาน (Audit Logs), ข้อมูลพื้นฐาน และฐานข้อมูล',
  version: '1.0.0',
  author: 'eProfile System',
  icon: 'fa-solid fa-gauge-high',
  category: 'system',
  isCore: false,
  defaultEnabled: true,
  settingsPath: '/modules/inspector/categories',
  menus: [
    {
      id: 'inspector-main',
      title: 'ตรวจสอบระบบ (System Inspector)',
      icon: 'fa-solid fa-gauge-high',
      path: '/modules/inspector',
      requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
      isSetting: true,
      order: 100,
      group: 'personal',
      subItems: [
        { name: 'ภาพรวมสถานะ (Health)', path: '/modules/inspector' },
        { name: 'ความพร้อมระบบ (Checklist)', path: '/modules/inspector/checklist' },
        { name: 'ประสิทธิภาพ (Performance)', path: '/modules/inspector/performance' },
        { name: 'แผนผัง API (Route Map)', path: '/modules/inspector/routes' },
        { name: 'สถานะโมดูล (Modules)', path: '/modules/inspector/modules' },
        { name: 'บันทึกการใช้งาน (Audit Logs)', path: '/modules/inspector/audit-logs' },
        { name: 'สแกนความปลอดภัย (Security)', path: '/modules/inspector/security' },
        { name: 'ตรวจประเมินหน้าจอ (Scan)', path: '/modules/inspector/scan' },
        { name: 'ข้อมูลพื้นฐาน (Categories)', path: '/modules/inspector/categories' },
        { name: 'ฐานข้อมูล (Database)', path: '/modules/inspector/database' },
        { name: 'สภาพแวดล้อม (Environment)', path: '/modules/inspector/environment' },
      ],
    },
  ],
  permissions: [
    {
      key: 'VIEW_RUNTIME_INSPECTOR',
      name: 'เข้าถึง System & Runtime Inspector',
      description: 'สามารถดูข้อมูลสถานะระบบ, ประสิทธิภาพ, สแกนหน้าจอ และตรวจสอบ Audit Logs ได้',
    },
  ],
  legacyRoutes: {
    '/inspector': '/modules/inspector',
    '/inspector/checklist': '/modules/inspector/checklist',
    '/inspector/audit-logs': '/modules/inspector/audit-logs',
    '/inspector/categories': '/modules/inspector/categories',
    '/manage/inspector': '/modules/inspector',
    '/manage/inspector/categories': '/modules/inspector/categories',
    '/manage/audit-logs': '/modules/inspector/audit-logs',
    '/modules/system-inspector': '/modules/inspector',
    '/modules/system-inspector/audit-logs': '/modules/inspector/audit-logs',
    '/modules/system-inspector/categories': '/modules/inspector/categories',
    '/admin/inspector': '/modules/inspector',
    '/admin/runtime': '/modules/inspector',
    '/admin/health': '/modules/inspector',
  },
  apiRewrites: {
    '/api/audit-logs': '/api/modules/inspector/audit-logs',
    '/api/audit-logs/:path*': '/api/modules/inspector/audit-logs/:path*',
    '/api/inspector': '/api/modules/inspector',
    '/api/inspector/:path*': '/api/modules/inspector/:path*',
    '/api/admin/inspector': '/api/modules/inspector',
    '/api/admin/inspector/:path*': '/api/modules/inspector/:path*',
  },
};

// Backward compatibility alias
export const SystemInspectorManifest = InspectorManifest;
