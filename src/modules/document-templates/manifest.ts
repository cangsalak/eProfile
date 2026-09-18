import { ModuleManifest } from '@/modules/core/types';

export const manifest: ModuleManifest = {
  id: 'document-templates',
  name: 'ระบบแม่แบบเอกสารส่วนกลาง',
  nameEn: 'Document Templates',
  description: 'จัดการแม่แบบเอกสาร PDF และ Word สำหรับโมดูลต่างๆ',
  version: '1.0.0',
  author: 'eProfile System',
  icon: 'fa-solid fa-file-invoice',
  category: 'system',
  isCore: false,
  defaultEnabled: true,
  menus: [],
  settingsPath: '/modules/document-templates/dashboard',
  permissions: [
    {
      key: 'MANAGE_TEMPLATES',
      name: 'จัดการแม่แบบเอกสาร',
      description: 'สิทธิ์ในการสร้าง ลบ แก้ไข แม่แบบเอกสารและหมวดหมู่'
    }
  ]
};
