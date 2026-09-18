import { ModuleManifest } from '@/modules/core/types';

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
  settingsPath: '/modules/users/departments',
  menus: [
    {
      id: 'directory',
      title: 'ทำเนียบบุคลากร (Directory)',
      icon: 'fa-solid fa-address-book',
      path: '/modules/users/directory',
      order: 30,
      group: 'personal'
    },
    {
      id: 'manage-personnel',
      title: 'จัดการบุคลากร',
      icon: 'fa-solid fa-users-gear',
      path: '/modules/users/manage',
      requiredPermission: 'MANAGE_PERSONNEL',
      order: 70,
      group: 'operations',
      subItems: [
        { name: 'ข้อมูลกำลังพล', path: '/modules/users/manage' },
        { name: 'โครงสร้างหน่วยงาน', path: '/modules/users/departments' },
      ]
    }
  ],
  permissions: [
    {
      key: 'MANAGE_PERSONNEL',
      name: 'จัดการข้อมูลบุคลากร',
      description: 'สิทธิ์ในการเพิ่ม ลบ แก้ไข ข้อมูลประวัติและโครงสร้างหน่วยงานของกำลังพล'
    },
    {
      key: 'VIEW_RPB1',
      name: 'ดูแบบ รปภ. 1',
      description: 'สิทธิ์ในการเข้าดูและดาวน์โหลด/พิมพ์แบบ รปภ. 1',
    },
    {
      key: 'MANAGE_RPB1',
      name: 'จัดการแบบ รปภ. 1',
      description: 'สิทธิ์ในการแก้ไขหรือบันทึกข้อมูลแบบ รปภ. 1 ของกำลังพล',
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
  },
  apiRewrites: {
    '/api/departments': '/api/modules/users/departments',
    '/api/departments/:path*': '/api/modules/users/departments/:path*',
    '/api/personnel': '/api/modules/users',
    '/api/personnel/:path*': '/api/modules/users/:path*',
    '/api/modules/personnel': '/api/modules/users',
    '/api/modules/personnel/:path*': '/api/modules/users/:path*',
  }
};

// Backward compat alias
export const PersonnelManifest = UsersManifest;
