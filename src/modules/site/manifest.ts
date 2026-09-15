import { ModuleManifest } from '@/modules/core/types';

export const SiteManifest: ModuleManifest = {
  id: 'site',
  name: 'จัดการเนื้อหาเว็บไซต์',
  nameEn: 'Site & CMS',
  description: 'แก้ไขข้อความ รูปภาพ และหัวข้อของหน้าแรก (Home), เกี่ยวกับเรา (About), ติดต่อเรา (Contact), บริการ (Services) และ SEO',
  version: '1.0.0',
  author: 'eProfile System',
  icon: 'fa-solid fa-window-maximize',
  category: 'system',
  isCore: true,
  defaultEnabled: true,
  settingsPath: '/modules/site',
  menus: [
    {
      id: 'site-manage',
      title: 'จัดการเนื้อหาหน้าเว็บ (CMS)',
      icon: 'fa-solid fa-window-maximize',
      path: '/modules/site',
      requiredPermission: 'MANAGE_SYSTEM',
      isSetting: true,
      order: 95,
      subItems: [
        { name: 'หน้าแรก (Home)', path: '/modules/site' },
        { name: 'เกี่ยวกับเรา (About)', path: '/modules/site' },
        { name: 'ติดต่อเรา (Contact)', path: '/modules/site' },
        { name: 'บริการ (Services)', path: '/modules/site' },
      ],
    },
  ],
  permissions: [
    {
      key: 'MANAGE_SYSTEM',
      name: 'จัดการเนื้อหาและตั้งค่าระบบ',
      description: 'สามารถปรับแต่งเนื้อหาหน้าแรก เกี่ยวกับเรา ข้อมูลติดต่อ และบริการต่างๆ ของเว็บไซต์ได้',
    },
  ],
  legacyRoutes: {
    '/site-content': '/modules/site',
    '/manage/site-content': '/modules/site',
    '/modules/site-content': '/modules/site',
    '/admin/site': '/modules/site',
  },
};

// Backward compatibility aliases
export const SiteContentManifest = SiteManifest;
