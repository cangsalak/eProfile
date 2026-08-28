const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const settings = await prisma.systemSetting.findMany();
  console.log(settings.reduce((acc, s) => ({...acc, [s.key]: s.value}), {}));
}
main().catch(console.error).finally(() => prisma.$disconnect());
