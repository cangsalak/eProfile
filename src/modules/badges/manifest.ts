import { ModuleManifest } from '@/lib/modules/types';

export const BadgesManifest: ModuleManifest = {
  id: 'badges',
  name: 'ระบบพิมพ์บัตร',
  nameEn: 'Badge Studio',
  description: 'ระบบออกแบบและพิมพ์บัตรประจำตัว',
  version: '1.0.0',
  author: 'System',
  icon: 'fa-id-badge',
  category: 'tools',
  isCore: false,
  defaultEnabled: true,
  settingsPath: '/modules/badges/settings',
  menus: [],
  permissions: [],
  legacyRoutes: {
    '/manage/personnel/print-badges': '/modules/badges',
    '/profile/badges': '/modules/badges/my',
    '/verify/:id': '/modules/badges/verify/:id',
  }
};
