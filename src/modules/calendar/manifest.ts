import { ModuleManifest } from '@/lib/modules/types';

export const CalendarManifest: ModuleManifest = {
  id: 'calendar',
  name: 'ระบบปฏิทินปฏิบัติงาน',
  nameEn: 'Duty Calendar',
  description: 'ปฏิทินกิจกรรมและการปฏิบัติงาน',
  version: '1.0.0',
  author: 'System',
  icon: 'fa-calendar-days',
  category: 'operations',
  isCore: false,
  defaultEnabled: true,
  settingsPath: '/modules/calendar/settings',
  menus: [
    {
      id: 'calendar-view',
      title: 'ปฏิทินปฏิบัติงาน',
      icon: 'fa-solid fa-calendar-days',
      path: '/modules/calendar',
      order: 20
    }
  ],
  legacyRoutes: {
    '/calendar': '/modules/calendar',
  },
  permissions: [] // Uses general auth
};
