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

  // Seed default System Roles
  console.log('🌱 Seeding System Roles...');
  const defaultRoles = [
    {
      name: 'SUPER_ADMIN',
      displayName: 'ผู้ดูแลระบบสูงสุด',
      description: 'มีสิทธิ์เข้าถึงทุกส่วนของระบบ (Super Admin)',
      permissions: JSON.stringify([
        'MANAGE_SYSTEM', 'MANAGE_ROLES', 'MANAGE_PERSONNEL', 
        'MANAGE_DEPARTMENTS', 'MANAGE_POSTS', 'VIEW_AUDIT_LOGS', 
        'MANAGE_CONTACTS', 'APPROVE_LEAVE'
      ]),
      isSystem: true
    },
    {
      name: 'ADMIN',
      displayName: 'ผู้ดูแลระบบ',
      description: 'มีสิทธิ์ดูแลจัดการข้อมูลบุคลากรและระบบบางส่วน',
      permissions: JSON.stringify([
        'MANAGE_PERSONNEL', 'MANAGE_DEPARTMENTS', 'MANAGE_POSTS', 'APPROVE_LEAVE'
      ]),
      isSystem: true
    },
    {
      name: 'EDITOR',
      displayName: 'ผู้จัดการเนื้อหา',
      description: 'มีสิทธิ์จัดการข่าวสารและเนื้อหา',
      permissions: JSON.stringify([
        'MANAGE_POSTS'
      ]),
      isSystem: true
    },
    {
      name: 'USER',
      displayName: 'ผู้ใช้งานทั่วไป',
      description: 'สิทธิ์พื้นฐานสำหรับกำลังพล',
      permissions: JSON.stringify([]),
      isSystem: true
    }
  ];

  for (const role of defaultRoles) {
    await prisma.systemRole.upsert({
      where: { name: role.name },
      update: {}, // Don't override if user already modified it
      create: role
    });
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

  // Create dummy users for system notifications
  console.log('🌱 Seeding System Notification Dummy Users...');
  const passwordHash = await bcrypt.hash(Math.random().toString(36) + Date.now(), 10);
  await prisma.personnel.upsert({
    where: { id: 'ALL' },
    update: {},
    create: {
      id: 'ALL',
      badgeNo: 'SYSTEM_ALL',
      username: 'SYSTEM_ALL',
      password: passwordHash,
      role: 'USER',
      prefix: '-',
      firstName: 'System',
      lastName: 'All Users',
      position: '-',
      department: '-',
      subDepartment: '-',
      phone: '-',
      mobile: '-',
      email: 'all@system.local'
    }
  });

  await prisma.personnel.upsert({
    where: { id: 'ADMIN' },
    update: {},
    create: {
      id: 'ADMIN',
      badgeNo: 'SYSTEM_ADMIN',
      username: 'SYSTEM_ADMIN',
      password: passwordHash,
      role: 'ADMIN',
      prefix: '-',
      firstName: 'System',
      lastName: 'Admins',
      position: '-',
      department: '-',
      subDepartment: '-',
      phone: '-',
      mobile: '-',
      email: 'admin@system.local'
    }
  });

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
