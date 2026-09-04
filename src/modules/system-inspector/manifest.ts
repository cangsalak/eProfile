import { ModuleManifest } from '@/lib/modules/types';

export const SystemInspectorManifest: ModuleManifest = {
  id: 'system-inspector',
  name: 'ระบบตรวจสอบความปลอดภัย',
  nameEn: 'System Inspector',
  description: 'เครื่องมือตรวจสอบระบบและ API Documentation',
  version: '1.0.0',
  author: 'System',
  icon: 'fa-shield-halved',
  category: 'system',
  isCore: false,
  defaultEnabled: true,
  settingsPath: '/modules/system-inspector/categories',
  menus: [
    {
      id: 'system-inspector-view',
      title: 'ตรวจสอบระบบ (Inspector)',
      icon: 'fa-solid fa-shield-halved',
      path: '/modules/system-inspector',
      requiredRoles: ['SUPER_ADMIN'],
      order: 100
    },
    {
      id: 'api-docs',
      title: 'API Documentation',
      icon: 'fa-solid fa-book',
      path: '/modules/system-inspector/api-docs',
      requiredRoles: ['SUPER_ADMIN'],
      order: 110
    }
  ],
  permissions: [], // SUPER_ADMIN only
  legacyRoutes: {
    '/manage/inspector': '/modules/system-inspector',
    '/manage/inspector/categories': '/modules/system-inspector/categories',
    '/manage/audit-logs': '/modules/system-inspector/audit-logs',
    '/api-documentation': '/modules/system-inspector/api-docs',
    '/manage/api-docs': '/modules/system-inspector/api-docs',
    '/manage/modules': '/modules/module-manager',
    '/modules/system-inspector/manage': '/modules/module-manager',
  }
};
