import { ModuleManifest } from '@/lib/modules/types';

export const CommandDashboardManifest: ModuleManifest = {
  id: 'command-dashboard',
  name: 'แดชบอร์ดผู้บังคับบัญชา',
  nameEn: 'Command Dashboard',
  description: 'ระบบแสดงผลสถิติความพร้อมรบสำหรับผู้บังคับบัญชา',
  version: '1.0.0',
  author: 'System',
  icon: 'fa-chess-king',
  category: 'operations',
  isCore: false,
  defaultEnabled: true,
  menus: [
    {
      id: 'command-dashboard-view',
      title: 'แดชบอร์ดผู้บังคับบัญชา',
      icon: 'fa-solid fa-chess-king',
      path: '/modules/command-dashboard',
      requiredPermission: 'VIEW_COMMAND_DASHBOARD',
      order: 15
    }
  ],
  permissions: [
    {
      key: 'VIEW_COMMAND_DASHBOARD',
      name: 'ดูข้อมูลผู้บังคับบัญชา',
      description: 'สิทธิ์ในการเข้าถึงแดชบอร์ดสรุปยอดกำลังพลและการลา'
    }
  ],
  legacyRoutes: {
    '/dashboard/command': '/modules/command-dashboard',
  }
};
