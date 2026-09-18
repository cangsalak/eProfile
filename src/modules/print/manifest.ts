import { ModuleManifest } from '@/modules/core/types';

export const PrintManifest: ModuleManifest = {
  id: 'print-service',
  name: 'ระบบการพิมพ์ส่วนกลาง',
  nameEn: 'Print Service',
  description: 'ศูนย์รวมการพิมพ์แบบฟอร์มเอกสารราชการ ใบลา สลิปเงินเดือน บัตรประจำตัว รพบ.1 ทำเนียบกำลังพล และตารางเวร พร้อมตัวจำลองกระดาษ A4',
  version: '1.0.0',
  author: 'eProfile Team',
  icon: 'fa-solid fa-print',
  category: 'core',
  isCore: true,
  defaultEnabled: true,
  menus: [],
  permissions: [
    {
      key: 'PRINT_DOCUMENTS',
      name: 'พิมพ์เอกสารราชการ',
      description: 'สามารถเข้าถึงและพิมพ์เอกสารราชการจากศูนย์รวมการพิมพ์ได้',
    },
  ],
};

export default PrintManifest;
