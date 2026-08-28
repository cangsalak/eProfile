const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const admin = await prisma.personnel.findUnique({ where: { username: '1111111111111' } });
  if (admin && admin.officialId) {
    const passwordHash = await bcrypt.hash(admin.officialId, 10);
    await prisma.personnel.update({
      where: { id: admin.id },
      data: { password: passwordHash }
    });
    console.log(`Password reset for ${admin.username} to ${admin.officialId}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
