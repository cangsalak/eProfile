import { ModuleManifest } from '@/modules/core/types';

export const ContactsManifest: ModuleManifest = {
  id: 'contacts',
  name: 'ระบบข้อมูลติดต่อ',
  nameEn: 'Contact Management',
  description: 'จัดการข้อมูลการติดต่อ แผนที่ และข้อความร้องเรียนจากประชาชนและผู้รับบริการ',
  version: '1.0.0',
  author: 'System',
  icon: 'fa-envelope',
  category: 'tools',
  isCore: false,
  defaultEnabled: true,
  menus: [
    {
      id: 'manage-contacts',
      title: 'ข้อความติดต่อ',
      icon: 'fa-solid fa-envelope',
      path: '/modules/contacts',
      requiredPermission: 'MANAGE_CONTACTS',
      requiredRoles: ['ADMIN', 'SUPER_ADMIN'],
      order: 95,
      group: 'operations',
    },
  ],
  permissions: [
    {
      key: 'MANAGE_CONTACTS',
      name: 'จัดการข้อความติดต่อ',
      description: 'สามารถตรวจสอบ ตอบกลับ และจัดการข้อความติดต่อหรือเรื่องร้องเรียนได้',
    },
  ],
  widgets: [
    {
      id: 'contacts-inbox-widget',
      title: 'กล่องข้อความติดต่อและสอบถาม',
      description: 'สรุปข้อความติดต่อและเรื่องร้องเรียนล่าสุด พร้อมสถิติการตอบกลับและช่องทางติดต่อ',
      defaultSize: 'md',
      requiredRoles: ['ADMIN', 'SUPER_ADMIN'],
    },
  ],
  legacyRoutes: {
    '/manage/contacts': '/modules/contacts',
  },
};
