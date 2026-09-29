import { ModuleManifest } from '@/modules/core/types';

export const EFormManifest: ModuleManifest = {
  id: 'e-form',
  name: 'ระบบยื่นแบบฟอร์ม (e-Forms)',
  nameEn: 'e-Forms System',
  description: 'ระบบยื่นและจัดการเอกสารแบบฟอร์มคำขออิเล็กทรอนิกส์ออนไลน์',
  version: '1.1.0',
  author: 'eProfile System',
  icon: 'fa-solid fa-file-signature',
  category: 'tools',
  isCore: false,
  defaultEnabled: true,
  menus: [
    {
      id: 'e-form',
      title: 'ยื่นแบบฟอร์ม (e-Forms)',
      icon: 'fa-solid fa-file-signature',
      path: '/modules/e-form',
      order: 40,
      group: 'personal',
    },
  ],
  widgets: [
    {
      id: 'eform-quick-stats',
      title: 'ระบบยื่นแบบฟอร์ม (e-Forms)',
      description: 'ภาพรวมแบบฟอร์มคำขออิเล็กทรอนิกส์และประวัติคำขอออนไลน์',
      defaultSize: 'md',
    },
  ],
  permissions: [],
  legacyRoutes: {
    '/forms': '/modules/e-form',
  },
};

export default EFormManifest;
