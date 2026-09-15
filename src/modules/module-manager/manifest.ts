import { ModuleManifest } from '@/modules/core/types';

export const ModuleManagerManifest: ModuleManifest = {
  id: 'module-manager',
  name: 'จัดการโมดูลและเมนูระบบ',
  nameEn: 'Module & Menu Manager',
  description: 'จัดการเปิด/ปิดโมดูล ติดตั้งโมดูลเสริม (.zip) และปรับแต่งเมนูแถบนำทาง',
  version: '1.2.0',
  author: 'eProfile System',
  icon: 'fa-solid fa-puzzle-piece',
  category: 'system',
  isCore: true,
  defaultEnabled: true,
  menus: [
    {
      id: 'manage-modules',
      title: 'จัดการโมดูลเสริม',
      icon: 'fa-solid fa-puzzle-piece',
      path: '/modules/module-manager',
      requiredPermission: 'MANAGE_SYSTEM',
      order: 88,
    },
    {
      id: 'manage-module-menus',
      title: 'ปรับแต่งเมนูระบบ',
      icon: 'fa-solid fa-bars-staggered',
      path: '/modules/module-manager/menus',
      requiredPermission: 'MANAGE_SYSTEM',
      isSetting: true,
      order: 89,
    },
  ],
  permissions: [
    {
      key: 'MANAGE_SYSTEM',
      name: 'จัดการโมดูลและระบบ',
      description: 'สิทธิ์ในการติดตั้ง ถอนการติดตั้ง เปิด/ปิดโมดูล และปรับแต่งเมนูในระบบ',
    },
  ],
  legacyRoutes: {
    '/manage/modules': '/modules/module-manager',
    '/manage/menus': '/modules/module-manager/menus',
  },
};
