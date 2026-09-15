import { ModuleManifest } from '@/modules/core/types';

export const CalendarManifest: ModuleManifest = {
  id: 'calendar',
  name: 'ระบบปฏิทินปฏิบัติงาน',
  nameEn: 'Duty Calendar',
  description: 'ระบบปฏิทินกิจกรรม ตารางเวรปฏิบัติการ และเชื่อมต่อ Google Calendar / iCal',
  version: '1.0.0',
  author: 'eProfile System',
  icon: 'fa-solid fa-calendar-days',
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
      order: 20,
    },
    {
      id: 'calendar-settings',
      title: 'ตั้งค่าปฏิทินและเวร',
      icon: 'fa-solid fa-sliders',
      path: '/modules/calendar/settings',
      requiredPermission: 'MANAGE_CALENDAR',
      requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
      order: 21,
    },
  ],
  permissions: [
    {
      key: 'MANAGE_CALENDAR',
      name: 'จัดการปฏิทินและกิจกรรม',
      description: 'สามารถสร้าง แก้ไข ลบกิจกรรมในปฏิทิน และจัดการการตั้งค่าปฏิทินภายนอกได้',
    },
  ],
  legacyRoutes: {
    '/calendar': '/modules/calendar',
    '/calendar/duty': '/modules/calendar',
    '/calendar/settings': '/modules/calendar/settings',
  },
};

