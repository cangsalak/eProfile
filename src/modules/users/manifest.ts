import { ModuleManifest } from '@/lib/modules/types';

export const UsersManifest: ModuleManifest = {
  id: 'users',
  name: 'ระบบจัดการบุคลากร',
  nameEn: 'Users Management',
  description: 'ระบบฐานข้อมูลและประวัติบุคลากร (Core Module)',
  version: '1.0.0',
  author: 'System',
  icon: 'fa-users',
  category: 'core',
  isCore: true,
  defaultEnabled: true,
  settingsPath: '/modules/users/roles',
  menus: [
    {
      id: 'directory',
      title: 'ทำเนียบบุคลากร (Directory)',
      icon: 'fa-solid fa-address-book',
      path: '/modules/users/directory',
      order: 30
    },
    {
      id: 'manage-personnel',
      title: 'จัดการบุคลากร',
      icon: 'fa-solid fa-users-gear',
      path: '/modules/users/manage',
      requiredPermission: 'MANAGE_PERSONNEL',
      order: 70,
      subItems: [
        { name: 'ข้อมูลกำลังพล', path: '/modules/users/manage' },
        { name: 'พิมพ์บัตรประจำตัว', path: '/modules/badges' },
      ]
    }
  ],
  permissions: [
    {
      key: 'MANAGE_PERSONNEL',
      name: 'จัดการข้อมูลบุคลากร',
      description: 'สิทธิ์ในการเพิ่ม ลบ แก้ไข ข้อมูลประวัติและโครงสร้างหน่วยงานของกำลังพล'
    }
  ],
  legacyRoutes: {
    '/dashboard': '/modules/users',
    '/directory': '/modules/users/directory',
    '/profile': '/modules/users/profile',
    '/manage/personnel': '/modules/users/manage',
    '/manage/roles': '/modules/users/roles',
    // Backward compat: old /modules/personnel/* → /modules/users/*
    '/modules/personnel': '/modules/users',
    '/modules/personnel/directory': '/modules/users/directory',
    '/modules/personnel/profile': '/modules/users/profile',
    '/modules/personnel/manage': '/modules/users/manage',
    '/modules/personnel/roles': '/modules/users/roles',
    '/modules/personnel/departments': '/modules/users/departments',
  }
};

// Backward compat alias
export const PersonnelManifest = UsersManifest;
