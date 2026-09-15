import { ModuleManifest } from '@/modules/core/types';

export const DashboardManifest: ModuleManifest = {
  id: 'dashboard',
  name: 'หน้าหลักและศูนย์บัญชาการ',
  nameEn: 'Command & Executive Dashboard',
  description: 'ภาพรวมสถิติกำลังพล ความพร้อมปฏิบัติการ สรุปการลา ยานพาหนะ และศูนย์บัญชาการ',
  version: '1.2.0',
  author: 'eProfile System',
  icon: 'fa-solid fa-chart-pie',
  category: 'core',
  isCore: true,
  defaultEnabled: true,
  menus: [
    {
      id: 'dashboard-overview',
      title: 'หน้าหลัก (Dashboard)',
      icon: 'fa-solid fa-chart-pie',
      path: '/modules/dashboard',
      order: 10,
    },
    {
      id: 'dashboard-command',
      title: 'ศูนย์บัญชาการและติดตามเวร',
      icon: 'fa-solid fa-shield-halved',
      path: '/modules/dashboard/command',
      requiredPermission: 'VIEW_COMMAND_DASHBOARD',
      requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'DEPARTMENT_COMMANDER', 'COMMANDER'],
      order: 11,
    },
  ],
  permissions: [
    {
      key: 'VIEW_COMMAND_DASHBOARD',
      name: 'เข้าถึงศูนย์บัญชาการและติดตามเวร',
      description: 'สามารถดูแดชบอร์ดความพร้อมกำลังพล สถิติการลา และภาพรวมการปฏิบัติการระดับหน่วยได้',
    },
  ],
  legacyRoutes: {
    '/command-dashboard': '/modules/dashboard/command',
    '/command-dashboard/:path*': '/modules/dashboard/command',
    '/dashboard': '/modules/dashboard',
    '/dashboard/command': '/modules/dashboard/command',
  },
  apiRewrites: {
    '/api/dashboard': '/api/modules/dashboard',
    '/api/dashboard/:path*': '/api/modules/dashboard/:path*',
  },
};
