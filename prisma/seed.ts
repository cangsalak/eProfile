import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import initialData from '../src/data/personnel.json';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting eProfile SQLite Seeding...');

  console.log('🌱 Starting eProfile SQLite Seeding...');

  // Extract unique departments
  const uniqueDepartments = Array.from(new Set(initialData.map(p => p.department)));
  for (const dept of uniqueDepartments) {
    if (dept) {
      await prisma.department.upsert({
        where: { name: dept },
        update: {},
        create: { name: dept },
      });
    }
  }

  for (const person of initialData) {
    const username = person.citizenId;
    const passwordHash = await bcrypt.hash(person.badgeNo, 10);

    await prisma.personnel.upsert({
      where: { badgeNo: person.badgeNo },
      update: {},
      create: {
        badgeNo: person.badgeNo,
        citizenId: person.citizenId,
        username: username,
        password: passwordHash,
        role: person.badgeNo === '1000000001' ? 'ADMIN' : 'OFFICER',
        prefix: person.prefix,
        firstName: person.firstName,
        lastName: person.lastName,
        position: person.position,
        department: person.department,
        subDepartment: person.subDepartment,
        personnelType: person.personnelType || 'นายทหารสัญญาบัตร',
        phone: person.phone,
        mobile: person.mobile,
        email: person.email,
        status: person.status,
        avatarColor: person.avatarColor,
        skills: JSON.stringify(person.skills),
        education: person.education,
        experience: person.experience,
        notes: person.notes,
      },
    });
  }

  console.log('✅ SQLite Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
