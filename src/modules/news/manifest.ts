import { ModuleManifest } from '@/modules/core/types';

export const NewsManifest: ModuleManifest = {
  id: 'news',
  name: 'ระบบข่าวสารและการสื่อสาร',
  nameEn: 'News & Communications',
  description: 'ระบบจัดการข่าวสาร บทความประชาสัมพันธ์ การแจ้งเตือนรายบุคคล และ Broadcast ผ่าน LINE / Email SMTP',
  version: '1.2.0',
  author: 'eProfile System',
  icon: 'fa-solid fa-bullhorn',
  category: 'tools',
  isCore: false,
  defaultEnabled: true,
  settingsPath: '/modules/news/settings',
  menus: [
    {
      id: 'news-posts',
      title: 'ข่าวสารและประกาศ',
      icon: 'fa-solid fa-newspaper',
      path: '/modules/news',
      requiredPermission: 'MANAGE_POSTS',
      order: 55,
    },
    {
      id: 'news-inbox',
      title: 'กล่องการแจ้งเตือน',
      icon: 'fa-solid fa-bell',
      path: '/modules/news/inbox',
      order: 56,
    },
    {
      id: 'news-settings',
      title: 'ตั้งค่า LINE & Email',
      icon: 'fa-solid fa-paper-plane',
      path: '/modules/news/settings',
      requiredPermission: 'MANAGE_SYSTEM',
      order: 57,
    },
  ],
  permissions: [
    {
      key: 'MANAGE_POSTS',
      name: 'จัดการข่าวสาร',
      description: 'สิทธิ์ในการสร้าง แก้ไข ลบ ข่าวสาร ประกาศ และบรอดแคสต์ข้อความ',
    },
  ],
  legacyRoutes: {
    '/notifications': '/modules/news/inbox',
    '/manage/notifications': '/modules/news',
    '/manage/posts': '/modules/news',
    '/manage/news/settings': '/modules/news/settings',
  },
  apiRewrites: {
    '/api/posts': '/api/modules/news/posts',
    '/api/posts/:path*': '/api/modules/news/posts/:path*',
    '/api/notifications': '/api/modules/news/notifications',
    '/api/notifications/:path*': '/api/modules/news/notifications/:path*',
  },
};
