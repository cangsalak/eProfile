const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const admins = await prisma.personnel.findMany({ where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } } });
  console.log('Admins found:', admins.map(a => ({ id: a.id, username: a.username, role: a.role })));
  
  if (admins.length > 0) {
    const passwordHash = await bcrypt.hash('admin1234', 10);
    for (const admin of admins) {
      await prisma.personnel.update({
        where: { id: admin.id },
        data: { password: passwordHash }
      });
      console.log(`Password reset for ${admin.username} to admin1234`);
    }
  } else {
    console.log("No admin found.");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
