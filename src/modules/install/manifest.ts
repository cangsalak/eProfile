import { ModuleManifest } from '@/modules/core/types';

export const InstallManifest: ModuleManifest = {
  id: 'install',
  name: 'ระบบติดตั้งและตั้งค่าฐานข้อมูล',
  nameEn: 'System Installer',
  version: '1.0.0',
  description: 'ตัวช่วยติดตั้งระบบเริ่มต้นและตั้งค่าฐานข้อมูล (Installation Wizard)',
  author: 'System Team',
  icon: 'fa-solid fa-wrench',
  category: 'core',
  isCore: true,
  defaultEnabled: true,
  permissions: [],
  menus: [],
  legacyRoutes: {
    '/install': '/modules/install',
  },
};
