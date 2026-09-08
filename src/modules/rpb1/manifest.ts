import { ModuleManifest } from '@/lib/modules/types';

export const Rpb1Manifest: ModuleManifest = {
  id: 'rpb1',
  name: 'แบบฟอร์ม รปภ. ๑',
  nameEn: 'Security Profile Form (RPB-1)',
  description: 'ระบบบันทึกและพิมพ์แบบรายงานประวัติบุคคล (รปภ. ๑) ๑๐ หน้า ๓๐ หมวดหมู่ ตามระเบียบสำนักนายกรัฐมนตรีฯ และ ทอ.',
  version: '1.0.0',
  author: 'eProfile System',
  icon: 'fa-solid fa-file-shield',
  category: 'hr',
  isCore: false,
  defaultEnabled: true,
  menus: [
    {
      id: 'rpb1-list',
      title: 'ทะเบียนแบบ รปภ. ๑',
      icon: 'fa-solid fa-file-shield',
      path: '/modules/rpb1',
      order: 40,
    },
  ],
  permissions: [
    {
      key: 'VIEW_RPB1',
      name: 'ดูแบบ รปภ. ๑',
      description: 'สิทธิ์ในการเข้าดูและดาวน์โหลด/พิมพ์แบบ รปภ. ๑',
    },
    {
      key: 'MANAGE_RPB1',
      name: 'จัดการแบบ รปภ. ๑',
      description: 'สิทธิ์ในการแก้ไขหรือบันทึกข้อมูลแบบ รปภ. ๑ ของกำลังพล',
    },
  ],
};

