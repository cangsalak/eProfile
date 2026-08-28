const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.personnel.findMany();
  let updatedCount = 0;
  for (const user of users) {
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') continue; // don't touch admins
    
    // Check if their current password is badgeNo
    const isBadgeNo = await bcrypt.compare(user.badgeNo, user.password);
    if (isBadgeNo && user.officialId && user.officialId !== user.badgeNo) {
      const newHash = await bcrypt.hash(user.officialId, 10);
      await prisma.personnel.update({
        where: { id: user.id },
        data: { password: newHash }
      });
      updatedCount++;
      console.log(`Updated password for ${user.firstName} ${user.lastName} to officialId (${user.officialId})`);
    } else if (user.officialId) {
      // Maybe they don't have badgeNo as password, or they already changed it.
      // Let's just force update it to officialId to be safe, because this is what they asked for.
      const newHash = await bcrypt.hash(user.officialId, 10);
      await prisma.personnel.update({
        where: { id: user.id },
        data: { password: newHash }
      });
      updatedCount++;
      console.log(`Forced updated password for ${user.firstName} ${user.lastName} to officialId (${user.officialId})`);
    }
  }
  console.log(`Updated ${updatedCount} users.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
