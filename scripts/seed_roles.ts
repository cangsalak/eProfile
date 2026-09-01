import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.systemRole.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      displayName: 'ผู้ดูแลระบบสูงสุด',
      description: 'มีสิทธิ์เข้าถึงทุกส่วนของระบบ',
      permissions: JSON.stringify([
        'MANAGE_SYSTEM',
        'MANAGE_PERSONNEL',
        'MANAGE_ROLES',
        'MANAGE_POSTS',
        'MANAGE_DEPARTMENTS',
        'VIEW_AUDIT_LOGS'
      ]),
      isSystem: true
    }
  });
  console.log('Admin Role ensured:', adminRole.name);

  const userRole = await prisma.systemRole.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      displayName: 'ผู้ใช้งานทั่วไป',
      description: 'สิทธิ์พื้นฐานสำหรับกำลังพล',
      permissions: JSON.stringify([]),
      isSystem: true
    }
  });
  console.log('User Role ensured:', userRole.name);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
