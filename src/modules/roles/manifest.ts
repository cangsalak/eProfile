import { ModuleManifest } from '@/modules/core/types';

export const RolesManifest: ModuleManifest = {
  id: 'roles',
  name: 'จัดการบทบาทและสิทธิ์',
  nameEn: 'Roles & Permissions',
  description: 'กำหนดบทบาทและสิทธิ์การเข้าถึงระบบสำหรับผู้ใช้งานและกลุ่มงานต่างๆ (RBAC)',
  version: '1.0.0',
  author: 'eProfile System',
  icon: 'fa-solid fa-user-shield',
  category: 'system',
  isCore: true,
  defaultEnabled: true,
  settingsPath: '/modules/roles',
  menus: [
    {
      id: 'roles-manage',
      title: 'สิทธิ์การใช้งาน (Roles)',
      icon: 'fa-solid fa-user-shield',
      path: '/modules/roles',
      requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
      requiredPermission: 'MANAGE_ROLES',
      isSetting: true,
      order: 75,
    },
  ],
  permissions: [
    {
      key: 'MANAGE_ROLES',
      name: 'จัดการบทบาทและสิทธิ์',
      description: 'สามารถสร้าง แก้ไข กำหนดสิทธิ์ และลบบทบาทในระบบได้',
    },
  ],
  legacyRoutes: {
    '/users/roles': '/modules/roles',
    '/modules/users/roles': '/modules/roles',
    '/manage/roles': '/modules/roles',
    '/admin/roles': '/modules/roles',
  },
};
