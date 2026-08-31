const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const mockCitizenIds = ['1111111111111', '2222222222222', '3333333333333', '4444444444444'];
  const result = await prisma.personnel.deleteMany({
    where: {
      citizenId: {
        in: mockCitizenIds
      }
    }
  });
  console.log(`Deleted ${result.count} mock users.`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
