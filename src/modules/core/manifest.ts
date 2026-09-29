import { ModuleManifest } from './types';

export const SettingsManifest: ModuleManifest = {
  id: 'settings',
  name: 'การตั้งค่าระบบส่วนกลาง',
  nameEn: 'System Settings',
  description: 'จัดการการตั้งค่าระบบ, โหมดปิดปรับปรุง (Maintenance Mode), และการล้างข้อมูลระบบ',
  version: '1.0.0',
  author: 'eProfile System',
  icon: 'fa-solid fa-gear',
  category: 'core',
  isCore: true,
  defaultEnabled: true,
  menus: [
    {
      id: 'core-system-settings',
      title: 'ตั้งค่าระบบ',
      icon: 'fa-solid fa-gear',
      path: '/modules/settings',
      requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
      requiredPermission: 'MANAGE_SETTINGS',
      order: 99,
      group: 'system',
    },
  ],
  permissions: [
    {
      key: 'MANAGE_SETTINGS',
      name: 'จัดการการตั้งค่าระบบ',
      description: 'สามารถแก้ไขการตั้งค่าส่วนกลางของระบบได้',
    },
  ],
  legacyRoutes: {
    '/settings': '/modules/settings',
  },
};


