import { ModuleManifest } from '@/lib/modules/types';

export const MenusManifest: ModuleManifest = {
  id: 'menus',
  name: 'จัดการเมนูนำทาง',
  nameEn: 'Menu & Navigation Management',
  description: 'จัดการเมนูนำทาง (Sidebar Navigation) การจัดลำดับ และการกำหนดสิทธิ์ของแต่ละโมดูลในระบบ',
  version: '1.0.0',
  author: 'eProfile System',
  icon: 'fa-compass',
  category: 'system',
  isCore: true,
  defaultEnabled: true,
  settingsPath: '/modules/menus',
  menus: [
    {
      id: 'manage-menus',
      title: 'จัดการเมนูระบบ',
      icon: 'fa-solid fa-compass',
      path: '/modules/menus',
      requiredPermission: 'MANAGE_SYSTEM',
      order: 980,
    },
  ],
  permissions: [
    {
      key: 'MANAGE_MENUS',
      name: 'จัดการเมนูนำทาง',
      description: 'สามารถจัดการโครงสร้าง จัดเรียง และกำหนดการมองเห็นเมนูนำทางของระบบได้',
    },
  ],
  legacyRoutes: {
    '/manage/menus': '/modules/menus',
  },
};
