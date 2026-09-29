import { ModuleManifest } from '@/modules/core/types';

export const PrintManifest: ModuleManifest = {
  id: 'print',
  name: 'ระบบการพิมพ์ส่วนกลาง',
  nameEn: 'Print Service',
  description: 'ศูนย์รวมการพิมพ์แบบฟอร์มเอกสารราชการ ใบลา สลิปเงินเดือน บัตรประจำตัว รปภ.๑ ทำเนียบกำลังพล และตารางเวร พร้อมตัวจำลองกระดาษ A4',
  version: '1.0.0',
  author: 'eProfile Team',
  icon: 'fa-solid fa-print',
  category: 'core',
  isCore: true,
  defaultEnabled: true,
  menus: [
    {
      id: 'print-center',
      title: 'ศูนย์รวมการพิมพ์',
      icon: 'fa-solid fa-print',
      path: '/modules/print',
      requiredPermission: 'PRINT_DOCUMENTS',
      order: 65,
      group: 'operations',
    },
    {
      id: 'print-settings',
      title: 'ตั้งค่าการพิมพ์และกระดาษ',
      icon: 'fa-solid fa-sliders',
      path: '/modules/print/settings',
      requiredPermission: 'MANAGE_SYSTEM',
      isSetting: true,
      order: 66,
      group: 'system',
    },
  ],
  widgets: [
    {
      id: 'print-quick-hub',
      title: 'ศูนย์พิมพ์เอกสารและบัตร',
      description: 'ทางลัดสั่งพิมพ์เอกสารราชการ ใบลา บัตรประจำตัว และทำเนียบกำลังพล',
      defaultSize: 'md',
      requiredPermission: 'PRINT_DOCUMENTS',
    },
  ],
  permissions: [
    {
      key: 'PRINT_DOCUMENTS',
      name: 'พิมพ์เอกสารราชการ',
      description: 'สามารถเข้าถึงและพิมพ์เอกสารราชการจากศูนย์รวมการพิมพ์ได้',
    },
  ],
  legacyRoutes: {
    '/print-service': '/modules/print',
    '/print': '/modules/print',
  },
};

export default PrintManifest;
