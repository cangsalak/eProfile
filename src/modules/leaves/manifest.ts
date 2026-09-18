import { ModuleManifest } from '@/modules/core/types';

export const LeavesManifest: ModuleManifest = {
  id: 'leaves',
  name: 'ระบบยื่นแบบฟอร์ม (e-Forms)',
  nameEn: 'e-Forms System',
  description: 'ระบบยื่นและจัดการเอกสารแบบฟอร์มตามแม่แบบ',
  version: '1.0.0',
  author: 'System',
  icon: 'fa-file-signature',
  category: 'hr',
  isCore: false,
  defaultEnabled: true,
  menus: [
    {
      id: 'leave',
      title: 'ยื่นแบบฟอร์ม (e-Forms)',
      icon: 'fa-solid fa-file-signature',
      path: '/modules/leaves',
      order: 40,
      group: 'personal'
    }
  ],
  settingsPath: '/modules/leaves/templates',
  permissions: [],
  legacyRoutes: {
    '/leave': '/modules/leaves',
    '/leave/print/:id': '/print/leave/:id',
  }
};
