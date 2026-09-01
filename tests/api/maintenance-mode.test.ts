import assert from 'assert';
import { GET as getMaintenanceHandler, POST as postMaintenanceHandler } from '../../src/app/api/settings/maintenance/route';
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

export async function runMaintenanceModeTests() {
  console.log('\n--- Running Website Maintenance Mode Tests (v1.3.0) ---');

  // Find or create an admin user and regular user
  let admin = await prisma.personnel.findFirst({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }
  });

  if (!admin) {
    const pwHash = await bcrypt.hash('admin1234', 10);
    admin = await prisma.personnel.create({
      data: {
        citizenId: '9999999999991',
        badgeNo: '9999999991',
        username: 'admin_test_maint',
        password: pwHash,
        role: 'ADMIN',
        prefix: 'พ.อ.',
        firstName: 'ทดสอบ',
        lastName: 'แอดมินบำรุงรักษา',
        position: 'Admin',
        department: 'กองเทคโนโลยีสารสนเทศ',
        subDepartment: 'แผนกพัฒนาระบบ',
        personnelType: 'นายทหารสัญญาบัตร',
        phone: '0812345678',
        mobile: '0812345678',
        email: 'admin_maint@eprofile.local',
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
        citizenId: '8888888888881',
        badgeNo: '8888888881',
        username: 'user_test_maint',
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
        email: 'user_maint@eprofile.local',
        status: 'ปฏิบัติงานปกติ',
      }
    });
  }

  const adminToken = await makeToken(admin.id, admin.role, admin.username);
  const userToken = await makeToken(regularUser.id, 'USER', regularUser.username);

  // Test 1: Public GET maintenance status
  const getRes = await getMaintenanceHandler();
  assert.strictEqual(getRes.status, 200, 'Public GET /api/settings/maintenance should return 200');
  const getData = await getRes.json();
  assert.ok(typeof getData.isMaintenance === 'boolean', 'isMaintenance should be boolean');
  assert.ok(typeof getData.message === 'string', 'message should be string');
  console.log('✔ Public GET /api/settings/maintenance verified');

  // Test 2: Anonymous POST rejected (401)
  const anonReq = new Request('http://localhost:3000/api/settings/maintenance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isMaintenance: true })
  });
  const anonRes = await postMaintenanceHandler(anonReq);
  assert.strictEqual(anonRes.status, 401, 'Anonymous POST should return 401');
  console.log('✔ Anonymous modification blocked (401)');

  // Test 3: Regular USER POST rejected (403)
  const userReq = new Request('http://localhost:3000/api/settings/maintenance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `auth_token=${userToken}`,
    },
    body: JSON.stringify({ isMaintenance: true })
  });
  const userRes = await postMaintenanceHandler(userReq);
  assert.strictEqual(userRes.status, 403, 'Regular USER POST should return 403');
  console.log('✔ Regular USER blocked from updating maintenance (403)');

  // Test 4: ADMIN enables maintenance mode
  const enableReq = new Request('http://localhost:3000/api/settings/maintenance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `auth_token=${adminToken}`,
    },
    body: JSON.stringify({
      isMaintenance: true,
      message: 'ระบบกำลังปิดปรับปรุงเซิร์ฟเวอร์ประจำเดือน',
      endTime: '02 ก.ย. 2569 เวลา 08:00 น.',
    })
  });
  const enableRes = await postMaintenanceHandler(enableReq);
  assert.strictEqual(enableRes.status, 200, 'ADMIN should be able to enable maintenance mode');
  const enableData = await enableRes.json();
  assert.strictEqual(enableData.isMaintenance, true);
  assert.strictEqual(enableData.message, 'ระบบกำลังปิดปรับปรุงเซิร์ฟเวอร์ประจำเดือน');
  console.log('✔ ADMIN enabled maintenance mode verified');

  // Verify GET status after enable
  const verifyGetRes = await getMaintenanceHandler();
  const verifyGetData = await verifyGetRes.json();
  assert.strictEqual(verifyGetData.isMaintenance, true);
  assert.strictEqual(verifyGetData.message, 'ระบบกำลังปิดปรับปรุงเซิร์ฟเวอร์ประจำเดือน');
  assert.strictEqual(verifyGetData.endTime, '02 ก.ย. 2569 เวลา 08:00 น.');

  // Test 5: ADMIN disables maintenance mode (restore normal state)
  const disableReq = new Request('http://localhost:3000/api/settings/maintenance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `auth_token=${adminToken}`,
    },
    body: JSON.stringify({
      isMaintenance: false,
    })
  });
  const disableRes = await postMaintenanceHandler(disableReq);
  assert.strictEqual(disableRes.status, 200, 'ADMIN should be able to disable maintenance mode');
  const disableData = await disableRes.json();
  assert.strictEqual(disableData.isMaintenance, false);
  console.log('✔ ADMIN disabled maintenance mode (restored to normal)');

  // Cleanup synthetic users
  if (admin.username === 'admin_test_maint') {
    await prisma.personnel.delete({ where: { id: admin.id } }).catch(() => {});
  }
  if (regularUser.username === 'user_test_maint') {
    await prisma.personnel.delete({ where: { id: regularUser.id } }).catch(() => {});
  }
}

if (require.main === module) {
  runMaintenanceModeTests()
    .then(() => {
      console.log('All maintenance mode tests passed!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Maintenance mode test failed:', err);
      process.exit(1);
    });
}
