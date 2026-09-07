import { ModuleManifest } from '@/lib/modules/types';

export const TestSlipManifest: ModuleManifest = {
  id: 'test-slip',
  name: 'สลิปเงินได้และเงินเดือน (Test Slip)',
  nameEn: 'Pay & Salary Slip System',
  description: 'ระบบออกและพิมพ์สลิปเงินเดือน สลิปเงินได้ ค่าตอบแทน และการคำนวณภาษีหัก ณ ที่จ่าย พร้อมฟังก์ชันพิมพ์เอกสารทางการและสร้างสลิปตัวอย่าง',
  version: '1.1.0',
  author: 'eProfile System',
  icon: 'fa-file-invoice-dollar',
  category: 'operations',
  isCore: false,
  defaultEnabled: true,
  menus: [
    {
      id: 'test-slip-menu',
      title: 'สลิปเงินเดือน / เงินได้',
      icon: 'fa-solid fa-file-invoice-dollar',
      path: '/modules/test-slip',
      order: 38,
    },
    {
      id: 'test-slip-manage',
      title: 'จัดการสลิปเงินเดือน',
      icon: 'fa-solid fa-receipt',
      path: '/modules/test-slip/manage',
      order: 39,
      requiredPermission: 'MANAGE_SALARY_SLIP',
    },
  ],
  permissions: [
    {
      key: 'VIEW_OWN_SLIP',
      name: 'ดูสลิปเงินเดือนตนเอง',
      description: 'สิทธิ์ในการเข้าถึงและพิมพ์สลิปเงินได้ส่วนบุคคล',
    },
    {
      key: 'MANAGE_SALARY_SLIP',
      name: 'จัดการสลิปเงินเดือนทั้งหมด',
      description: 'สิทธิ์ในการสร้าง นำเข้า และแก้ไขสลิปเงินเดือนของกำลังพล',
    },
  ],
};
