import { ModuleManifest } from '@/modules/core/types';

export const UploadManifest: ModuleManifest = {
  id: 'upload',
  name: 'ระบบคลังไฟล์และจัดเก็บข้อมูล',
  nameEn: 'Upload & Storage Manager',
  description: 'ศูนย์กลางการอัปโหลดไฟล์ รูปภาพ เสียง วิดีโอ เอกสาร PDF พร้อมระบบจัดเก็บ Cloud Object Storage (S3 / MinIO / Local)',
  version: '1.0.0',
  author: 'eProfile System',
  icon: 'fa-solid fa-cloud-arrow-up',
  category: 'system',
  isCore: true,
  defaultEnabled: true,
  menus: [
    {
      id: 'upload-gallery',
      title: 'คลังไฟล์และสื่อ',
      icon: 'fa-solid fa-photo-film',
      path: '/modules/upload',
      requiredPermission: 'MANAGE_MEDIA',
      order: 70,
      group: 'personal',
    },
    {
      id: 'upload-settings',
      title: 'ตั้งค่า Cloud S3',
      icon: 'fa-solid fa-server',
      path: '/modules/upload/settings',
      requiredPermission: 'MANAGE_SYSTEM',
      isSetting: true,
      order: 71,
      group: 'personal',
    },
  ],
  permissions: [
    {
      key: 'MANAGE_MEDIA',
      name: 'จัดการคลังไฟล์และสื่อ',
      description: 'สิทธิ์ในการอัปโหลด ลบ คัดลอกลิงก์ และจัดการไฟล์ในคลังสื่อ',
    },
  ],
  legacyRoutes: {
    '/manage/media': '/modules/upload',
    '/media': '/modules/upload',
    '/modules/news/media': '/modules/upload',
  },
  apiRewrites: {
    '/api/media': '/api/modules/upload',
    '/api/media/:path*': '/api/modules/upload/:path*',
  },
};
