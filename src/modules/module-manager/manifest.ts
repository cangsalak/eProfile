import { ModuleManifest } from '@/lib/modules/types';

export const ModuleManagerManifest: ModuleManifest = {
  id: 'module-manager',
  name: 'ระบบจัดการโมดูลส่วนเสริม',
  nameEn: 'Module Manager',
  description: 'ระบบบริหารจัดการ เปิด-ปิด ติดตั้ง และถอนการติดตั้งโมดูลส่วนเสริมในระบบ',
  version: '1.0.0',
  author: 'System',
  icon: 'fa-puzzle-piece',
  category: 'system',
  isCore: true,
  defaultEnabled: true,
  menus: [
    {
      id: 'module-manager-view',
      title: 'จัดการโมดูล (Modules)',
      icon: 'fa-solid fa-puzzle-piece',
      path: '/modules/module-manager',
      requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
      order: 990,
    },
  ],
  permissions: [],
  legacyRoutes: {
    '/manage/modules': '/modules/module-manager',
    '/modules/system-inspector/manage': '/modules/module-manager',
  },
};
