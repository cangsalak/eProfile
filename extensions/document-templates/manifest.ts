import { ModuleManifest } from '@/modules/core/types';

export const documentTemplatesManifest: ModuleManifest = {
  id: 'document-templates',
  name: 'ระบบแม่แบบเอกสารส่วนกลาง',
  nameEn: 'Document Templates',
  description: 'จัดการแม่แบบเอกสารราชการ PDF และ Word สำหรับระบบ eProfile',
  version: '1.0.0',
  author: 'eProfile System',
  icon: 'fa-solid fa-file-invoice',
  category: 'system',
  isCore: false,
  defaultEnabled: true,
  menus: [
    {
      id: 'document-templates-manage',
      title: 'จัดการแม่แบบเอกสารส่วนกลาง',
      icon: 'fa-solid fa-file-invoice',
      path: '/modules/document-templates',
      order: 92,
      group: 'system',
      requiredRoles: ['ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'],
      isSetting: true,
    },
  ],
  widgets: [
    {
      id: 'document-templates-widget',
      title: 'คลังแม่แบบเอกสารส่วนกลาง',
      description: 'ศูนย์รวมแม่แบบเอกสารราชการ PDF และ Word สำหรับระบบ eProfile',
      defaultSize: 'md',
      requiredRoles: ['ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'],
    },
  ],
  settingsPath: '/modules/document-templates',
  permissions: [
    {
      key: 'MANAGE_TEMPLATES',
      name: 'จัดการแม่แบบเอกสาร',
      description: 'สิทธิ์ในการสร้าง ลบ แก้ไข แม่แบบเอกสารและหมวดหมู่',
    },
  ],
};

export const manifest = documentTemplatesManifest;
export default documentTemplatesManifest;
