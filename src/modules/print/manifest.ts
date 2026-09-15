import { ModuleManifest } from '@/modules/core/types';

export const PrintManifest: ModuleManifest = {
  id: 'print',
  name: 'ศูนย์รวมการพิมพ์เอกสารราชการ',
  nameEn: 'Print Center',
  description: 'ศูนย์รวมการพิมพ์แบบฟอร์มเอกสารราชการ ใบลา สลิปเงินเดือน บัตรประจำตัว รพบ.1 ทำเนียบกำลังพล และตารางเวร พร้อมตัวจำลองกระดาษ A4',
  version: '1.0.0',
  author: 'eProfile Team',
  icon: 'fa-solid fa-print',
  category: 'tools',
  isCore: false,
  defaultEnabled: true,
  menus: [
    {
      id: 'print-center-menu',
      title: 'ศูนย์รวมการพิมพ์เอกสาร',
      icon: 'fa-solid fa-print',
      path: '/modules/print',
      requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'DEPARTMENT_COMMANDER', 'COMMANDER', 'OFFICER', 'EDITOR', 'USER'],
      order: 38,
    },
  ],
  permissions: [
    {
      key: 'PRINT_DOCUMENTS',
      name: 'พิมพ์เอกสารราชการ',
      description: 'สามารถเข้าถึงและพิมพ์เอกสารราชการจากศูนย์รวมการพิมพ์ได้',
    },
  ],
};

export default PrintManifest;
