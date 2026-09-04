import { ModuleManifest } from '@/lib/modules/types';

export const themeManifest: ModuleManifest = {
  id: 'theme',
  name: 'ดีไซน์และธีม',
  nameEn: 'Theme & Branding',
  description: 'ตั้งค่ารูปแบบการแสดงผล สีสัน โลโก้ และธีมของระบบ',
  version: '1.0.0',
  author: 'eProfile System',
  icon: 'fa-palette',
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
