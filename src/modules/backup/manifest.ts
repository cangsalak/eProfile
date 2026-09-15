import { ModuleManifest } from '@/modules/core/types';

export const backupManifest: ModuleManifest = {
  id: 'backup',
  name: 'สำรองและกู้คืนข้อมูล',
  nameEn: 'Backup & Restore',
  description: 'จัดการการสำรองข้อมูลฐานข้อมูลและกู้คืนระบบ',
  version: '1.0.0',
  author: 'eProfile System',
  icon: 'fa-solid fa-database',
  category: 'system',
  isCore: true,
  defaultEnabled: true,
  settingsPath: '/modules/backup',
  menus: [
    {
      id: 'backup-main-menu',
      title: 'สำรองและกู้คืนข้อมูล',
      icon: 'fa-solid fa-database',
      path: '/modules/backup',
      requiredPermission: 'MANAGE_BACKUP',
      requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
      order: 80,
    },
  ],
  permissions: [
    {
      key: 'MANAGE_BACKUP',
      name: 'จัดการการสำรองข้อมูล',
      description: 'สามารถสำรอง กู้คืน และดาวน์โหลดข้อมูลฐานข้อมูลได้',
    }
  ],
  legacyRoutes: {
    '/manage/backup': '/modules/backup',
  },
  apiRewrites: {
    '/api/restore': '/api/modules/backup/restore',
    '/api/restore/:path*': '/api/modules/backup/restore/:path*',
  },
};
