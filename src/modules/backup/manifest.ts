import { ModuleManifest } from '@/lib/modules/types';

export const backupManifest: ModuleManifest = {
  id: 'backup',
  name: 'สำรองและกู้คืนข้อมูล',
  nameEn: 'Backup & Restore',
  description: 'จัดการการสำรองข้อมูลฐานข้อมูลและกู้คืนระบบ',
  version: '1.0.0',
  author: 'eProfile System',
  icon: 'fa-database',
  category: 'system',
  isCore: true,
  defaultEnabled: true,
  settingsPath: '/modules/backup',
  menus: [],
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
};
