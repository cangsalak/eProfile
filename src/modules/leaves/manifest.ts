import { ModuleManifest } from '@/lib/modules/types';

export const LeavesManifest: ModuleManifest = {
  id: 'leaves',
  name: 'ระบบการลา',
  nameEn: 'Leave Management',
  description: 'ระบบขออนุมัติการลาและโควตาการลา',
  version: '1.0.0',
  author: 'System',
  icon: 'fa-calendar-alt',
  category: 'hr',
  isCore: false,
  defaultEnabled: true,
  menus: [
    {
      id: 'leave',
      title: 'การลา (Leave)',
      icon: 'fa-solid fa-calendar-alt',
      path: '/modules/leaves',
      order: 40
    },
    {
      id: 'manage-leave-approvals',
      title: 'อนุมัติการลา',
      icon: 'fa-solid fa-clipboard-check',
      path: '/modules/leaves/approvals',
      requiredPermission: 'APPROVE_LEAVE',
      order: 80
    }
  ],
  permissions: [
    {
      key: 'APPROVE_LEAVE',
      name: 'อนุมัติการลา',
      description: 'สิทธิ์ในการตรวจสอบและอนุมัติการลาของกำลังพลในสังกัด'
    }
  ],
  legacyRoutes: {
    '/leave': '/modules/leaves',
    '/leave/print/:id': '/print/leave/:id',
    '/manage/leave-approvals': '/modules/leaves/approvals',
  }
};
