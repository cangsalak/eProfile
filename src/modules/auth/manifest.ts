import { ModuleManifest } from '@/modules/core/types';

export const AuthManifest: ModuleManifest = {
  id: 'auth',
  name: 'ระบบยืนยันตัวตนและการเข้าสู่ระบบ',
  nameEn: 'Authentication & Identity',
  description: 'ระบบเข้าสู่ระบบ (Login), ลงทะเบียน (Register), รีเซ็ตรหัสผ่าน (Self-Service Password Reset), เซสชัน และความปลอดภัยบัญชี',
  version: '1.0.0',
  author: 'eProfile System',
  icon: 'fa-solid fa-right-to-bracket',
  category: 'core',
  isCore: true,
  defaultEnabled: true,
  menus: [],
  permissions: [],
  legacyRoutes: {
    '/login': '/modules/auth/login',
    '/register': '/modules/auth/register',
    '/forgot-password': '/modules/auth/forgot-password',
  },
};
