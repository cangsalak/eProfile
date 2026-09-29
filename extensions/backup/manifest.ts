import { ModuleManifest } from '@/modules/core/types';

export const backupManifest: ModuleManifest = {
  id: 'backup',
  name: 'สำรองและกู้คืนข้อมูล',
  nameEn: 'Backup & Restore',
  description: 'จัดการการสำรองข้อมูลฐานข้อมูล กู้คืนระบบ และควบคุมความมั่นคงปลอดภัยของข้อมูล',
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
      isSetting: true,
      order: 80,
      group: 'system',
    },
  ],
  permissions: [
    {
      key: 'MANAGE_BACKUP',
      name: 'จัดการการสำรองข้อมูล',
      description: 'สามารถสำรอง กู้คืน และดาวน์โหลดข้อมูลฐานข้อมูลได้',
    },
  ],
  widgets: [
    {
      id: 'backup-quick-widget',
      title: 'การสำรองข้อมูลและความปลอดภัยระบบ',
      description: 'สถานะฐานข้อมูล สถิติไฟล์สำรองระบบล่าสุด และเครื่องมือสำรองด่วน',
      defaultSize: 'md',
      requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
    },
  ],
  legacyRoutes: {
    '/manage/backup': '/modules/backup',
  },
  apiRewrites: {
    '/api/restore': '/api/modules/backup/restore',
    '/api/restore/:path*': '/api/modules/backup/restore/:path*',
  },
};
