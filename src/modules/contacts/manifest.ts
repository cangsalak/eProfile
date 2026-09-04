import { ModuleManifest } from '@/lib/modules/types';

export const ContactsManifest: ModuleManifest = {
  id: 'contacts',
  name: 'ระบบข้อมูลติดต่อ',
  nameEn: 'Contact Management',
  description: 'จัดการข้อมูลการติดต่อ แผนที่ และข้อความร้องเรียน',
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
      requiredPermission: 'MANAGE_SYSTEM', // Re-using manage_system for now, can be updated
      order: 95
    }
  ],
  permissions: [],
  legacyRoutes: {
    '/manage/contacts': '/modules/contacts',
  }
};
