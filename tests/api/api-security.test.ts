import assert from 'assert';
import { SignJWT } from 'jose';
import { prisma } from '../../src/lib/prisma';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'eprofile-super-secret-jwt-key-2026-change-in-production';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

async function makeToken(id: string, role: string, username: string): Promise<string> {
  return await new SignJWT({ id, role, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2h')
    .setIssuedAt()
    .sign(encodedSecret);
}

export async function runApiSecurityTests() {
  console.log('\n--- Running API Security Tests: 401, 403, QR Verify, Backup/Restore ---');

  // Find or create test user and admin in DB
  let adminUser = await prisma.personnel.findFirst({
    where: { role: 'SUPER_ADMIN', NOT: [{ id: 'ADMIN' }, { id: 'ALL' }] }
  }) || await prisma.personnel.findFirst({
    where: { role: 'ADMIN', NOT: [{ id: 'ADMIN' }, { id: 'ALL' }] }
  });

  if (!adminUser) {
    adminUser = await prisma.personnel.create({
      data: {
        badgeNo: 'TEST-ADMIN-01',
        username: 'test_admin_suite',
        password: 'hashed_password_placeholder',
        role: 'SUPER_ADMIN',
        prefix: 'พ.อ.',
        firstName: 'ทดสอบแอดมิน',
        lastName: 'ระบบ',
        position: 'ผู้ดูแลระบบ',
        department: 'บก.ศฝยว.ทบ.',
        subDepartment: '',
        phone: '',
        mobile: '',
        email: 'test_admin@eprofile.local',
      }
    });
  }

  let normalUser = await prisma.personnel.findFirst({
    where: { role: 'USER', NOT: [{ id: 'ADMIN' }, { id: 'ALL' }] }
  }) || await prisma.personnel.findFirst({
    where: { role: 'OFFICER', NOT: [{ id: 'ADMIN' }, { id: 'ALL' }] }
  });

  if (!normalUser) {
    normalUser = await prisma.personnel.create({
      data: {
        badgeNo: 'TEST-USER-01',
        username: 'test_user_suite',
        password: 'hashed_password_placeholder',
        role: 'USER',
        prefix: 'ส.อ.',
        firstName: 'ทดสอบกำลังพล',
        lastName: 'ทั่วไป',
        position: 'เสมียน',
        department: 'บก.ศฝยว.ทบ.',
        subDepartment: '',
        phone: '',
        mobile: '',
        email: 'test_user@eprofile.local',
      }
    });
  }

  assert.ok(adminUser, 'Admin user should exist in DB');
  assert.ok(normalUser, 'Normal user should exist in DB');

  const adminToken = await makeToken(adminUser.id, adminUser.role, adminUser.username);
  const userToken = await makeToken(normalUser.id, normalUser.role, normalUser.username);

  // 1. API test: 401 Unauthorized (No token)
  {
    const protectedRoutes = [
      { url: `${BASE_URL}/api/personnel`, method: 'GET' },
      { url: `${BASE_URL}/api/roles`, method: 'GET' },
      { url: `${BASE_URL}/api/departments`, method: 'GET' },
      { url: `${BASE_URL}/api/vehicles`, method: 'GET' },
      { url: `${BASE_URL}/api/settings`, method: 'PUT', body: JSON.stringify({ siteName: 'Test' }) },
      { url: `${BASE_URL}/api/backup`, method: 'GET' },
      { url: `${BASE_URL}/api/audit-logs`, method: 'GET' },
    ];

    for (const r of protectedRoutes) {
      const res = await fetch(r.url, {
        method: r.method,
        headers: { 'Content-Type': 'application/json' },
        body: r.body,
      });
      assert.strictEqual(
        res.status,
        401,
        `Unauthenticated request to ${r.method} ${r.url} should return 401 (got ${res.status})`
      );
    }
    console.log('✔ 401 Unauthorized verified for unauthenticated requests');
  }

  // 2. API test: 403 Forbidden (Insufficient permissions / roles)
  {
    // Normal user trying to access admin-only / role management
    const forbiddenTests = [
      {
        name: 'Normal user creating a role',
        url: `${BASE_URL}/api/roles`,
        method: 'POST',
        body: JSON.stringify({ name: 'HACKER_ROLE', displayName: 'Hacker', permissions: ['MANAGE_SYSTEM'] }),
      },
      {
        name: 'Normal user accessing audit logs',
        url: `${BASE_URL}/api/audit-logs`,
        method: 'GET',
      },
      {
        name: 'Normal user downloading database backup',
        url: `${BASE_URL}/api/backup`,
        method: 'GET',
      },
      {
        name: 'Normal user changing system settings',
        url: `${BASE_URL}/api/settings`,
        method: 'PUT',
        body: JSON.stringify({ siteName: 'Hacked Site' }),
      },
      {
        name: 'Normal user creating personnel',
        url: `${BASE_URL}/api/personnel`,
        method: 'POST',
        body: JSON.stringify({ firstName: 'Test', lastName: 'Hacker', citizenId: '1234567890123' }),
      },
    ];

    for (const test of forbiddenTests) {
      const res = await fetch(test.url, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `auth_token=${userToken}`,
        },
        body: test.body,
      });

      assert.ok(
        res.status === 403 || res.status === 401,
        `${test.name} should be rejected with 403 or 401 (got ${res.status})`
      );
    }
    console.log('✔ 403 Forbidden verified for unauthorized role operations');
  }

  // 3. API test: QR Verification Endpoint (`/api/verify/[id]`)
  {
    // Valid personnel
    const res = await fetch(`${BASE_URL}/api/verify/${normalUser.id}`);
    assert.strictEqual(res.status, 200, 'Valid personnel verification should return 200');
    const data = await res.json();
    
    assert.ok(data.firstName, 'Verified data should include firstName');
    assert.ok(data.lastName, 'Verified data should include lastName');
    assert.strictEqual(data.password, undefined, 'Password must never be exposed');
    assert.strictEqual(data.passwordHash, undefined, 'Password hash must never be exposed');
    
    // Non-existent ID
    const nonExistent = await fetch(`${BASE_URL}/api/verify/cmtiarqe70007grr9m39v9999`);
    assert.strictEqual(nonExistent.status, 404, 'Non-existent ID should return 404');

    // Malformed / Injection ID
    const malformed = await fetch(`${BASE_URL}/api/verify/invalid-id-with-special!@#`);
    assert.strictEqual(malformed.status, 400, 'Malformed ID should return 400');
    console.log('✔ QR Verification endpoint tested for security & data protection');
  }

  // 4. API test: Backup & Restore Endpoint Protection
  {
    // Backup with admin token
    const backupRes = await fetch(`${BASE_URL}/api/backup`, {
      headers: { 'Cookie': `auth_token=${adminToken}` },
    });
    assert.strictEqual(backupRes.status, 200, 'Admin backup request should return 200');
    const buffer = Buffer.from(await backupRes.arrayBuffer());
    assert.ok(buffer.length > 0, 'Backup file should not be empty');
    // Check SQLite header magic bytes
    const magic = buffer.slice(0, 16).toString('binary');
    assert.strictEqual(magic, 'SQLite format 3\0', 'Backup must be a valid SQLite database');

    // Restore rejection of invalid file
    const formData = new FormData();
    const fakeFile = new Blob(['not a sqlite db content'], { type: 'application/octet-stream' });
    formData.append('file', fakeFile, 'fake.db');

    const restoreRes = await fetch(`${BASE_URL}/api/restore`, {
      method: 'POST',
      headers: { 'Cookie': `auth_token=${adminToken}` },
      body: formData,
    });
    assert.strictEqual(restoreRes.status, 400, 'Restore with fake DB file must return 400');
    const restoreData = await restoreRes.json();
    assert.ok(restoreData.error, 'Error message should be returned for fake DB');
    console.log('✔ Backup generation & Restore integrity checks passed');
  }
}

if (require.main === module) {
  runApiSecurityTests()
    .then(() => console.log('\nAll API security tests passed successfully!'))
    .catch((err) => {
      console.error('Test failed:', err);
      process.exit(1);
    });
}
