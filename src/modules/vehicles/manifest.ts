import { ModuleManifest } from '@/lib/modules/types';

export const VehiclesManifest: ModuleManifest = {
  id: 'vehicles',
  name: 'ระบบยานพาหนะ',
  nameEn: 'Vehicle Management',
  description: 'ระบบจัดการข้อมูลยานพาหนะของกำลังพล',
  version: '1.0.0',
  author: 'System',
  icon: 'fa-car',
  category: 'operations',
  isCore: false,
  defaultEnabled: true,
  menus: [
    // Currently, vehicle management is done within the personnel profile or admin.
    // If it gets its own top-level menu later, it would be registered here.
  ],
  permissions: [
    // Currently relying on MANAGE_PERSONNEL, but can be extracted to MANAGE_VEHICLES
  ],
  legacyRoutes: {
    '/manage/vehicles': '/modules/vehicles',
  }
};
