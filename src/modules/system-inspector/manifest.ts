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
  settingsPath: '/inspector/categories',
  menus: [
    {
      id: 'system-inspector-view',
      title: 'ตรวจสอบระบบ (Inspector)',
      icon: 'fa-solid fa-shield-halved',
      path: '/inspector',
      requiredRoles: ['SUPER_ADMIN'],
      order: 100
    },
    {
      id: 'api-docs',
      title: 'API Documentation',
      icon: 'fa-solid fa-book',
      path: '/inspector/api-docs',
      requiredRoles: ['SUPER_ADMIN'],
      order: 110
    }
  ],
  permissions: [], // SUPER_ADMIN only
  legacyRoutes: {
    '/manage/inspector': '/inspector',
    '/manage/inspector/categories': '/inspector/categories',
    '/manage/audit-logs': '/inspector/audit-logs',
    '/api-documentation': '/inspector/api-docs',
    '/manage/api-docs': '/inspector/api-docs',
    '/manage/modules': '/module-manager',
    '/modules/system-inspector/manage': '/module-manager',
    '/modules/system-inspector': '/inspector',
    '/modules/system-inspector/api-docs': '/inspector/api-docs',
    '/modules/system-inspector/audit-logs': '/inspector/audit-logs',
    '/modules/system-inspector/categories': '/inspector/categories',
    '/modules/system-inspector/modules': '/inspector/modules',
  }
};
