import { ModuleManifest } from '@/lib/modules/types';

export const NewsManifest: ModuleManifest = {
  id: 'news',
  name: 'ระบบข่าวสารและประกาศ',
  nameEn: 'News & Announcements',
  description: 'ระบบจัดการข่าวสารและประกาศแจ้งเตือน',
  version: '1.0.0',
  author: 'System',
  icon: 'fa-bullhorn',
  category: 'tools',
  isCore: false,
  defaultEnabled: true,
  settingsPath: '/modules/news/settings',
  menus: [
    {
      id: 'manage-news',
      title: 'จัดการข่าวสารและการแจ้งเตือน',
      icon: 'fa-solid fa-bullhorn',
      path: '/modules/news',
      requiredPermission: 'MANAGE_POSTS',
      order: 90,
      subItems: [
        { name: 'ประกาศและข่าวสาร', path: '/modules/news' },
        { name: 'ตั้งค่า LINE & Email', path: '/modules/news/settings', requiredPermission: 'MANAGE_SYSTEM' }
      ]
    }
  ],
  permissions: [
    {
      key: 'MANAGE_POSTS',
      name: 'จัดการข่าวสาร',
      description: 'สิทธิ์ในการสร้าง แก้ไข ลบ ข่าวสารและประกาศแจ้งเตือน'
    }
  ],
  legacyRoutes: {
    '/notifications': '/modules/news/inbox',
    '/manage/notifications': '/modules/news',
    '/manage/posts': '/modules/news',
    '/manage/media': '/modules/news/media',
    '/manage/news/settings': '/modules/news/settings',
  }
};
