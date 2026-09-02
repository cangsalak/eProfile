/**
 * Role Permission Source of Truth — eProfile System
 *
 * This is the SINGLE source of truth for all default system role definitions.
 * Both the installer (src/app/api/install/route.ts) and the seed script
 * (prisma/seed-permissions.ts) MUST import from here.
 *
 * When you add, remove, or rename a permission:
 * 1. Update ROLE_DEFINITIONS below.
 * 2. Re-run:  npx tsx prisma/seed-permissions.ts
 */

export const ROLE_DEFINITIONS = [
  {
    name:        'SUPER_ADMIN',
    displayName: 'ผู้ดูแลระบบสูงสุด',
    description: 'มีสิทธิ์ทั้งหมดในระบบ ไม่สามารถถูกจำกัดได้',
    permissions: [
      'MANAGE_PERSONNEL',
      'MANAGE_SYSTEM',
      'MANAGE_POSTS',
      'APPROVE_LEAVE',
      'VIEW_AUDIT_LOGS',
      'VIEW_COMMAND_DASHBOARD',
    ] as string[],
    isSystem: true,
  },
  {
    name:        'ADMIN',
    displayName: 'ผู้ดูแลระบบ',
    description: 'มีสิทธิ์เกือบทั้งหมด ยกเว้นการจัดการ SUPER_ADMIN',
    permissions: [
      'MANAGE_PERSONNEL',
      'MANAGE_SYSTEM',
      'MANAGE_POSTS',
      'APPROVE_LEAVE',
      'VIEW_AUDIT_LOGS',
      'VIEW_COMMAND_DASHBOARD',
    ] as string[],
    isSystem: true,
  },
  {
    name:        'HR_MANAGER',
    displayName: 'เจ้าหน้าที่บุคคล',
    description: 'จัดการข้อมูลบุคลากรและอนุมัติใบลา',
    permissions: [
      'MANAGE_PERSONNEL',
      'APPROVE_LEAVE',
      'VIEW_AUDIT_LOGS',
      'VIEW_COMMAND_DASHBOARD',
    ] as string[],
    isSystem: true,
  },
  {
    name:        'DEPARTMENT_COMMANDER',
    displayName: 'ผู้บังคับบัญชาระดับกอง/สำนัก',
    description: 'ดูแดชบอร์ดกำลังพลและความพร้อมรบทุกหน่วยย่อยในกอง/สำนัก และอนุมัติใบลา',
    permissions: [
      'VIEW_COMMAND_DASHBOARD',
      'APPROVE_LEAVE',
    ] as string[],
    isSystem: true,
  },
  {
    name:        'COMMANDER',
    displayName: 'ผู้บังคับบัญชาหน่วยย่อย/แผนก',
    description: 'ดูแดชบอร์ดกำลังพลและความพร้อมรบเฉพาะหน่วยย่อยในสังกัด และอนุมัติใบลา',
    permissions: [
      'VIEW_COMMAND_DASHBOARD',
      'APPROVE_LEAVE',
    ] as string[],
    isSystem: true,
  },
  {
    name:        'EDITOR',
    displayName: 'บรรณาธิการ',
    description: 'สร้าง/แก้ไข/ลบบทความและไฟล์มีเดีย',
    permissions: [
      'MANAGE_POSTS',
    ] as string[],
    isSystem: true,
  },
  {
    name:        'OFFICER',
    displayName: 'เจ้าหน้าที่',
    description: 'ผู้ใช้งานทั่วไป ดูข้อมูลและจัดการใบลาของตนเอง',
    permissions: [] as string[],
    isSystem: true,
  },
  {
    name:        'USER',
    displayName: 'ผู้ใช้งานทั่วไป',
    description: 'สิทธิ์พื้นฐาน ดูข้อมูลและจัดการข้อมูลส่วนตัว',
    permissions: [] as string[],
    isSystem: true,
  },
] as const;

/** Helper: returns permissions for a given role name as a JSON string */
export function permissionsJsonFor(roleName: string): string {
  const role = ROLE_DEFINITIONS.find(r => r.name === roleName);
  return JSON.stringify(role ? [...role.permissions] : []);
}
