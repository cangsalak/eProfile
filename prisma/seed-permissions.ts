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
import { ROLE_DEFINITIONS } from '../src/lib/role-definitions';

const prisma = new PrismaClient();

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

  // Ensure default leavePolicy exists in SystemSetting table in Database
  const defaultLeavePolicy = JSON.stringify({
    'ลาพักผ่อน': 10,
    'ลากิจ': 45,
    'ลาป่วย': 60,
    'ลาคลอดบุตร': 90,
    'ลาอุปสมบท': 120,
  });

  const existingPolicy = await prisma.systemSetting.findUnique({ where: { key: 'leavePolicy' } });
  if (!existingPolicy) {
    await prisma.systemSetting.create({
      data: { key: 'leavePolicy', value: defaultLeavePolicy }
    });
    console.log('  ➕  Created SystemSetting: leavePolicy');
  } else {
    console.log('  ✅  OK       SystemSetting: leavePolicy already exists');
  }

  console.log('\n✅ Permission & Settings seed complete.\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
