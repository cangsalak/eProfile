import { ModuleManifest } from '@/modules/core/types';

export const BadgesManifest: ModuleManifest = {
  id: 'badges',
  name: 'ระบบพิมพ์บัตร',
  nameEn: 'Badge Studio',
  description: 'ระบบออกแบบบัตรประจำตัว สตูดิโอ Canvas และพิมพ์บัตรบุคลากร',
  version: '1.0.0',
  author: 'eProfile System',
  icon: 'fa-solid fa-id-card',
  category: 'tools',
  isCore: false,
  defaultEnabled: true,
  settingsPath: '/modules/badges/settings',
  menus: [
    {
      id: 'badges-print-menu',
      title: 'พิมพ์บัตรประจำตัว',
      icon: 'fa-solid fa-print',
      path: '/modules/badges',
      requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'OFFICER', 'EDITOR', 'USER'],
      order: 35,
    },
    {
      id: 'badges-studio-menu',
      title: 'สตูดิโอออกแบบบัตร',
      icon: 'fa-solid fa-palette',
      path: '/modules/badges/settings',
      requiredPermission: 'MANAGE_BADGES',
      requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
      order: 36,
    },
    {
      id: 'badges-my-menu',
      title: 'บัตรประจำตัวของฉัน',
      icon: 'fa-solid fa-address-card',
      path: '/modules/badges/my',
      requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'OFFICER', 'EDITOR', 'USER'],
      order: 37,
    },
  ],
  permissions: [
    {
      key: 'MANAGE_BADGES',
      name: 'จัดการและออกแบบบัตร',
      description: 'สามารถออกแบบเทมเพลตบัตร และตั้งค่ารูปแบบการพิมพ์บัตรประจำตัวได้',
    },
  ],
  legacyRoutes: {
    '/manage/personnel/print-badges': '/modules/badges',
    '/profile/badges': '/modules/badges/my',
    '/verify/:id': '/modules/badges/verify/:id',
  },
  apiRewrites: {
    '/api/verify/:id': '/api/modules/badges/verify/:id',
    '/api/verify/:path*': '/api/modules/badges/verify/:path*',
  },
};
