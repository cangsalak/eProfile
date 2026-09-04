import { ModuleManifest } from '@/lib/modules/types';

export const PersonnelManifest: ModuleManifest = {
  id: 'personnel',
  name: 'ระบบจัดการบุคลากร',
  nameEn: 'Personnel Management',
  description: 'ระบบฐานข้อมูลและประวัติบุคลากร (Core Module)',
  version: '1.0.0',
  author: 'System',
  icon: 'fa-users',
  category: 'core',
  isCore: true,
  defaultEnabled: true,
  settingsPath: '/modules/personnel/roles',
  menus: [
    {
      id: 'directory',
      title: 'ทำเนียบบุคลากร (Directory)',
      icon: 'fa-solid fa-address-book',
      path: '/modules/personnel/directory',
      order: 30
    },
    {
      id: 'manage-personnel',
      title: 'จัดการบุคลากร',
      icon: 'fa-solid fa-users-gear',
      path: '/modules/personnel/manage',
      requiredPermission: 'MANAGE_PERSONNEL',
      order: 70,
      subItems: [
        { name: 'ข้อมูลกำลังพล', path: '/modules/personnel/manage' },
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
    '/dashboard': '/modules/personnel',
    '/directory': '/modules/personnel/directory',
    '/profile': '/modules/personnel/profile',
    '/manage/personnel': '/modules/personnel/manage',
    '/manage/roles': '/modules/personnel/roles',
  }
};
