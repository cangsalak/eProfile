const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.personnel.findMany();
  console.log('Users found:', users.map(u => ({ id: u.id, role: u.role, officialId: u.officialId, badgeNo: u.badgeNo })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
