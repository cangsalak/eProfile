import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.systemSetting.upsert({
    where: { key: 'isInstalled' },
    update: { value: 'true' },
    create: { key: 'isInstalled', value: 'true' }
  });
  console.log('✅ System marked as installed');
}
main().catch(console.error).finally(() => prisma.$disconnect());
