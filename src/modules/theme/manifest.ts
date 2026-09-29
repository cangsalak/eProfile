import { ModuleManifest } from '@/modules/core/types';

export const themeManifest: ModuleManifest = {
  id: 'theme',
  name: 'โลโก้ อัตลักษณ์ และธีมระบบ',
  nameEn: 'Logo, Branding & Theme',
  description: 'อัปโหลดโลโก้เว็บไซต์ กำหนดชื่อระบบ ชื่อหน่วยงาน ธีมสี และแบบอักษร',
  version: '1.0.0',
  author: 'eProfile System',
  icon: 'fa-solid fa-paintbrush',
  category: 'system',
  isCore: true,
  defaultEnabled: true,
  settingsPath: '/modules/theme',
  menus: [],
  permissions: [
    {
      key: 'MANAGE_THEME',
      name: 'จัดการธีม',
      description: 'สามารถปรับแต่งธีม โลโก้ และรูปแบบการแสดงผลของระบบได้',
    }
  ],
  legacyRoutes: {
    '/manage/theme': '/modules/theme',
  },
};
