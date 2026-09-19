import { PrismaClient } from '@prisma/client';
import { seedDocumentCategories } from '../lib/seed-categories';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Document Categories Seeding (Leaves & Forms)...');
  const { count } = await seedDocumentCategories(prisma);
  console.log(`✅ Successfully seeded/updated ${count} document categories!`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
