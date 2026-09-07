import { ModuleManifest } from '@/lib/modules/types';

export const SiteContentManifest: ModuleManifest = {
  id: 'site-content',
  name: 'จัดการเนื้อหาหน้าเว็บ',
  nameEn: 'Site Content Management',
  description: 'แก้ไขข้อความ รูปภาพ และหัวข้อของหน้าแรก (Home), เกี่ยวกับเรา (About), และติดต่อเรา (Contact)',
  version: '1.0.0',
  author: 'eProfile System',
  icon: 'fa-window-maximize',
  category: 'system',
  isCore: true,
  defaultEnabled: true,
  settingsPath: '/site-content',
  menus: [
    {
      id: 'site-content-manage',
      title: 'จัดการเนื้อหาหน้าเว็บ',
      icon: 'fa-solid fa-window-maximize',
      path: '/site-content',
      requiredPermission: 'MANAGE_SYSTEM',
      order: 95,
    },
  ],
  permissions: [
    {
      key: 'MANAGE_SYSTEM',
      name: 'จัดการเนื้อหาและตั้งค่าระบบ',
      description: 'สามารถปรับแต่งเนื้อหาหน้าแรก เกี่ยวกับเรา และข้อมูลติดต่อได้',
    },
  ],
  legacyRoutes: {
    '/manage/site-content': '/site-content',
  },
};
