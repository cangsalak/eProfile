import { ModuleManifest } from '@/modules/core/types';

export const ApiDocsManifest: ModuleManifest = {
  id: 'api-docs',
  name: 'ระบบจัดการ API & เอกสาร',
  nameEn: 'API & Developer Portal',
  description: 'ศูนย์รวมเอกสารอ้างอิง API (API Reference) และระบบออก/จัดการ API Tokens สำหรับระบบภายนอก',
  version: '1.0.0',
  author: 'System',
  icon: 'fa-code',
  category: 'system',
  isCore: false,
  defaultEnabled: true,
  settingsPath: '/modules/api-docs/tokens',
  menus: [
    {
      id: 'api-reference-menu',
      title: 'เอกสาร API (API Docs)',
      icon: 'fa-solid fa-book',
      path: '/modules/api-docs',
      requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
      isSetting: true,
      order: 104,
      group: 'system',
    },
  ],
  permissions: [
    {
      key: 'MANAGE_API',
      name: 'จัดการ API และ Token',
      description: 'สามารถเข้าถึงเอกสารอ้างอิง API และออกโทเค็นสำหรับเชื่อมต่อระบบภายนอกได้',
    },
  ],
  widgets: [
    {
      id: 'api-docs-widget',
      title: 'ศูนย์กลาง API & นักพัฒนา',
      description: 'สรุปภาพรวม Endpoints, OpenAPI Spec และสถานะ API Tokens เชื่อมต่อภายนอก',
      defaultSize: 'md',
      requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
    },
  ],
  legacyRoutes: {
    '/manage/api-docs': '/modules/api-docs',
    '/api-documentation': '/modules/api-docs',
    '/inspector/api-docs': '/modules/api-docs',
    '/modules/system-inspector/api-docs': '/modules/api-docs',
    '/manage/api-tokens': '/modules/api-docs/tokens',
    '/modules/api-tokens': '/modules/api-docs/tokens',
    '/api-tokens': '/modules/api-docs/tokens',
    '/inspector/api-tokens': '/modules/api-docs/tokens',
  },
  apiRewrites: {
    '/api/admin/api-docs': '/api/modules/api-docs',
    '/api/admin/api-docs/:path*': '/api/modules/api-docs/:path*',
    '/api/admin/api-tokens': '/api/modules/api-docs/tokens',
    '/api/admin/api-tokens/:path*': '/api/modules/api-docs/tokens/:path*',
    '/api/api-docs': '/api/modules/api-docs',
    '/api/api-docs/:path*': '/api/modules/api-docs/:path*',
    '/api/api-tokens': '/api/modules/api-docs/tokens',
    '/api/api-tokens/:path*': '/api/modules/api-docs/tokens/:path*',
  },
};
