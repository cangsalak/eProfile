import assert from 'assert';
import { POST as resetDbHandler } from '../../src/app/api/settings/reset-db/route';
import { SignJWT } from 'jose';
import { prisma } from '../../src/lib/prisma';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'eprofile-super-secret-jwt-key-2026-change-in-production';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

async function makeToken(id: string, role: string, username: string): Promise<string> {
  return await new SignJWT({ id, role, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2h')
    .setIssuedAt()
    .sign(encodedSecret);
}

export async function runDatabaseResetTests() {
  console.log('\n--- Running Database Reset & Wipe Security Tests (v1.3.0) ---');

  // Find or create a test super admin
  let superAdmin = await prisma.personnel.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });

  if (!superAdmin) {
    const pwHash = await bcrypt.hash('admin1234', 10);
    superAdmin = await prisma.personnel.create({
      data: {
        citizenId: '9999999999999',
        badgeNo: '9999999999',
        username: 'superadmin_test_reset',
        password: pwHash,
        role: 'SUPER_ADMIN',
        prefix: 'พล.อ.',
        firstName: 'ทดสอบ',
        lastName: 'แอดมินสูงสุด',
        position: 'Super Admin',
        department: 'สำนักผู้บังคับบัญชา',
        subDepartment: 'ฝ่ายบริหาร',
        personnelType: 'นายทหารสัญญาบัตร',
        phone: '0812345678',
        mobile: '0812345678',
        email: 'superadmin_reset@eprofile.local',
        status: 'ปฏิบัติงานปกติ',
      }
    });
  }

  let regularUser = await prisma.personnel.findFirst({
    where: { role: 'USER' }
  });

  if (!regularUser) {
    const pwHash = await bcrypt.hash('user1234', 10);
    regularUser = await prisma.personnel.create({
      data: {
        citizenId: '8888888888888',
        badgeNo: '8888888888',
        username: 'regular_user_test_reset',
        password: pwHash,
        role: 'USER',
        prefix: 'นาย',
        firstName: 'ทดสอบ',
        lastName: 'ผู้ใช้ทั่วไป',
        position: 'เจ้าหน้าที่',
        department: 'กองเทคโนโลยีสารสนเทศ',
        subDepartment: 'แผนกสนับสนุน',
        personnelType: 'พนักงานราชการ',
        phone: '0811111111',
        mobile: '0811111111',
        email: 'user_reset@eprofile.local',
        status: 'ปฏิบัติงานปกติ',
      }
    });
  }

  const superAdminToken = await makeToken(superAdmin.id, 'SUPER_ADMIN', superAdmin.username);
  const userToken = await makeToken(regularUser.id, 'USER', regularUser.username);

  // Test 1: Anonymous request rejected (401)
  const anonReq = new Request('http://localhost:3000/api/settings/reset-db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmText: 'RESET-DATABASE', password: 'admin' })
  });
  const anonRes = await resetDbHandler(anonReq);
  assert.strictEqual(anonRes.status, 401, 'Anonymous request should return 401');
  console.log('✔ Anonymous access blocked (401)');

  // Test 2: Regular USER role rejected (403)
  const userReq = new Request('http://localhost:3000/api/settings/reset-db', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `auth_token=${userToken}`,
    },
    body: JSON.stringify({ confirmText: 'RESET-DATABASE', password: 'admin' })
  });
  const userRes = await resetDbHandler(userReq);
  assert.strictEqual(userRes.status, 403, 'Regular USER should be forbidden (403)');
  console.log('✔ Non-SuperAdmin access blocked (403)');

  // Test 3: Invalid confirmation phrase rejected (400)
  const badPhraseReq = new Request('http://localhost:3000/api/settings/reset-db', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `auth_token=${superAdminToken}`,
    },
    body: JSON.stringify({ confirmText: 'WRONG-PHRASE', password: 'admin' })
  });
  const badPhraseRes = await resetDbHandler(badPhraseReq);
  assert.strictEqual(badPhraseRes.status, 400, 'Bad confirmation phrase should return 400');
  console.log('✔ Invalid confirmation phrase rejected (400)');

  // Test 4: Wrong password rejected (401)
  const wrongPwReq = new Request('http://localhost:3000/api/settings/reset-db', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `auth_token=${superAdminToken}`,
    },
    body: JSON.stringify({ confirmText: 'RESET-DATABASE', password: 'wrong_super_password' })
  });
  const wrongPwRes = await resetDbHandler(wrongPwReq);
  assert.strictEqual(wrongPwRes.status, 401, 'Wrong password should return 401');
  console.log('✔ Wrong password verification rejected (401)');

  // Cleanup test users if we created synthetic ones
  if (superAdmin.username === 'superadmin_test_reset') {
    await prisma.personnel.delete({ where: { id: superAdmin.id } }).catch(() => {});
  }
  if (regularUser.username === 'regular_user_test_reset') {
    await prisma.personnel.delete({ where: { id: regularUser.id } }).catch(() => {});
  }
}

if (require.main === module) {
  runDatabaseResetTests()
    .then(() => {
      console.log('All database reset tests passed!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database reset test failed:', err);
      process.exit(1);
    });
}
