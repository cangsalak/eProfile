import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating Test Users for Roles...');

  const testUsers = [
    {
      badgeNo: 'SA00000001',
      citizenId: '9999999999991',
      prefix: 'นาย',
      firstName: 'ทดสอบ',
      lastName: 'ซุปเปอร์แอดมิน',
      position: 'Super Admin',
      department: 'กองเทคโนโลยีสารสนเทศ',
      subDepartment: 'ผู้บริหารระบบ',
      personnelType: 'นายทหารสัญญาบัตร',
      phone: '000',
      mobile: '000',
      email: 'sa@rta.mi.th',
      status: 'ปฏิบัติงานปกติ',
      avatarColor: '#10b981',
      skills: JSON.stringify([]),
      education: '',
      experience: '',
      notes: 'Test SUPER_ADMIN',
      role: 'SUPER_ADMIN'
    },
    {
      badgeNo: 'AD00000001',
      citizenId: '9999999999992',
      prefix: 'นาย',
      firstName: 'ทดสอบ',
      lastName: 'แอดมิน',
      position: 'Admin',
      department: 'กองเทคโนโลยีสารสนเทศ',
      subDepartment: 'ผู้บริหารระบบ',
      personnelType: 'นายทหารสัญญาบัตร',
      phone: '000',
      mobile: '000',
      email: 'admin@rta.mi.th',
      status: 'ปฏิบัติงานปกติ',
      avatarColor: '#3b82f6',
      skills: JSON.stringify([]),
      education: '',
      experience: '',
      notes: 'Test ADMIN',
      role: 'ADMIN'
    },
    {
      badgeNo: 'ED00000001',
      citizenId: '9999999999993',
      prefix: 'นาย',
      firstName: 'ทดสอบ',
      lastName: 'อีดิเตอร์',
      position: 'Editor',
      department: 'กองเทคโนโลยีสารสนเทศ',
      subDepartment: 'ประชาสัมพันธ์',
      personnelType: 'พนักงานราชการ',
      phone: '000',
      mobile: '000',
      email: 'editor@rta.mi.th',
      status: 'ปฏิบัติงานปกติ',
      avatarColor: '#f59e0b',
      skills: JSON.stringify([]),
      education: '',
      experience: '',
      notes: 'Test EDITOR',
      role: 'EDITOR'
    },
    {
      badgeNo: 'US00000001',
      citizenId: '9999999999994',
      prefix: 'นาย',
      firstName: 'ทดสอบ',
      lastName: 'ยูสเซอร์',
      position: 'User',
      department: 'กองกำลังพล',
      subDepartment: 'เจ้าหน้าที่',
      personnelType: 'พนักงานราชการ',
      phone: '000',
      mobile: '000',
      email: 'user@rta.mi.th',
      status: 'ปฏิบัติงานปกติ',
      avatarColor: '#6b7280',
      skills: JSON.stringify([]),
      education: '',
      experience: '',
      notes: 'Test USER',
      role: 'USER'
    }
  ];

  for (const user of testUsers) {
    const username = user.citizenId;
    const passwordHash = await bcrypt.hash(user.badgeNo, 10);

    try {
      await prisma.personnel.upsert({
        where: { badgeNo: user.badgeNo },
        update: { role: user.role },
        create: {
          ...user,
          username: username,
          password: passwordHash,
        },
      });
      console.log(`✅ Created test user: ${user.firstName} ${user.lastName} (Username: ${username}, Password: ${user.badgeNo}, Role: ${user.role})`);
    } catch (e) {
      console.error(`❌ Failed to create test user ${user.badgeNo}:`, e);
    }
  }

  console.log('✅ Test Users Creation Completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
