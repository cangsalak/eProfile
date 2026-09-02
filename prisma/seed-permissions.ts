/**
 * Permission Seed Script — eProfile System
 *
 * Ensures all default SystemRole records exist and their permissions
 * match PERMISSION_MATRIX.md exactly.
 *
 * Usage (run from project root):
 *   npx ts-node --project tsconfig.json -e "require('./prisma/seed-permissions')"
 * Or:
 *   DATABASE_URL="file:./prisma/dev.db" npx tsx prisma/seed-permissions.ts
 *
 * This script is IDEMPOTENT — safe to run multiple times.
 * It does NOT delete roles; it only upserts them.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Source of truth — must match PERMISSION_MATRIX.md */
const ROLE_DEFINITIONS = [
  {
    name:        'SUPER_ADMIN',
    displayName: 'ผู้ดูแลระบบสูงสุด',
    description: 'มีสิทธิ์ทั้งหมดในระบบ ไม่สามารถถูกจำกัดได้',
    permissions: ['MANAGE_PERSONNEL', 'MANAGE_SYSTEM', 'MANAGE_POSTS', 'APPROVE_LEAVE', 'VIEW_AUDIT_LOGS'],
    isSystem:    true,
  },
  {
    name:        'ADMIN',
    displayName: 'ผู้ดูแลระบบ',
    description: 'มีสิทธิ์เกือบทั้งหมด ยกเว้นการจัดการ SUPER_ADMIN',
    permissions: ['MANAGE_PERSONNEL', 'MANAGE_SYSTEM', 'MANAGE_POSTS', 'APPROVE_LEAVE', 'VIEW_AUDIT_LOGS'],
    isSystem:    true,
  },
  {
    name:        'HR_MANAGER',
    displayName: 'เจ้าหน้าที่บุคคล',
    description: 'จัดการข้อมูลบุคลากรและอนุมัติใบลา',
    permissions: ['MANAGE_PERSONNEL', 'APPROVE_LEAVE', 'VIEW_AUDIT_LOGS'],
    isSystem:    true,
  },
  {
    name:        'EDITOR',
    displayName: 'บรรณาธิการ',
    description: 'สร้าง/แก้ไข/ลบบทความและไฟล์มีเดีย',
    permissions: ['MANAGE_POSTS'],
    isSystem:    true,
  },
  {
    name:        'OFFICER',
    displayName: 'เจ้าหน้าที่',
    description: 'ผู้ใช้งานทั่วไป ดูข้อมูลและจัดการใบลาของตนเอง',
    permissions: [],
    isSystem:    true,
  },
  {
    name:        'USER',
    displayName: 'ผู้ใช้งานทั่วไป',
    description: 'สิทธิ์พื้นฐาน ดูข้อมูลและจัดการข้อมูลส่วนตัว',
    permissions: [],
    isSystem:    true,
  },
] as const;

async function main() {
  console.log('🔐 Seeding role permissions (PERMISSION_MATRIX.md)…\n');

  for (const role of ROLE_DEFINITIONS) {
    const existing = await prisma.systemRole.findUnique({ where: { name: role.name } });
    const permissionsJson = JSON.stringify(role.permissions);

    if (existing) {
      const currentPerms = existing.permissions;
      if (currentPerms !== permissionsJson) {
        await prisma.systemRole.update({
          where: { name: role.name },
          data:  {
            displayName: role.displayName,
            description: role.description,
            permissions: permissionsJson,
            isSystem:    role.isSystem,
          },
        });
        console.log(`  ✏️  Updated  ${role.name}: ${currentPerms} → ${permissionsJson}`);
      } else {
        console.log(`  ✅  OK       ${role.name}: permissions already correct`);
      }
    } else {
      await prisma.systemRole.create({
        data: {
          name:        role.name,
          displayName: role.displayName,
          description: role.description,
          permissions: permissionsJson,
          isSystem:    role.isSystem,
        },
      });
      console.log(`  ➕  Created  ${role.name}: ${permissionsJson}`);
    }
  }

  console.log('\n✅ Permission seed complete.\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
