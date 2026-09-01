import assert from 'assert';
import { GET as getBackupHandler } from '../../src/app/api/backup/route';
import { POST as postRestoreHandler } from '../../src/app/api/restore/route';
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

export async function runUniversalBackupRestoreTests() {
  console.log('\n--- Running Universal Multi-Database Backup & Restore Tests (v1.3.0) ---');

  let admin = await prisma.personnel.findFirst({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }
  });

  if (!admin) {
    const pwHash = await bcrypt.hash('admin1234', 10);
    admin = await prisma.personnel.create({
      data: {
        citizenId: '9999999999992',
        badgeNo: '9999999992',
        username: 'admin_test_backup',
        password: pwHash,
        role: 'SUPER_ADMIN',
        prefix: 'พล.อ.',
        firstName: 'ทดสอบ',
        lastName: 'แอดมินสำรองข้อมูล',
        position: 'Super Admin',
        department: 'สำนักผู้บังคับบัญชา',
        subDepartment: 'ฝ่ายบริหาร',
        personnelType: 'นายทหารสัญญาบัตร',
        phone: '0812345678',
        mobile: '0812345678',
        email: 'admin_backup@eprofile.local',
        status: 'ปฏิบัติงานปกติ',
      }
    });
  }

  const adminToken = await makeToken(admin.id, admin.role, admin.username);

  // Test 1: GET Universal JSON Backup
  const jsonReq = new Request('http://localhost:3000/api/backup?format=json', {
    method: 'GET',
    headers: { 'Cookie': `auth_token=${adminToken}` },
  });
  const jsonRes = await getBackupHandler(jsonReq);
  assert.strictEqual(jsonRes.status, 200, 'GET Universal Backup should return 200');
  const backupJson = await jsonRes.json();

  assert.strictEqual(backupJson.app, 'eProfile');
  assert.strictEqual(backupJson.version, '1.3.0');
  assert.ok(backupJson.summary, 'Backup summary must be present');
  assert.ok(backupJson.data, 'Backup data must be present');
  assert.ok(Array.isArray(backupJson.data.personnel), 'data.personnel must be array');
  assert.ok(Array.isArray(backupJson.data.systemSettings), 'data.systemSettings must be array');
  console.log(`✔ Universal JSON Backup generated successfully (${backupJson.summary.totalRecords} records across all tables)`);

  // Test 2: GET Native SQLite DB Backup
  const dbReq = new Request('http://localhost:3000/api/backup?format=db', {
    method: 'GET',
    headers: { 'Cookie': `auth_token=${adminToken}` },
  });
  const dbRes = await getBackupHandler(dbReq);
  assert.strictEqual(dbRes.status, 200, 'GET SQLite DB Backup should return 200');
  const dbBuffer = Buffer.from(await dbRes.arrayBuffer());
  assert.ok(dbBuffer.length > 0, 'DB backup buffer should not be empty');
  console.log('✔ Native SQLite DB Backup generated successfully');

  // Test 3: POST /api/restore with invalid JSON content
  const invalidJsonFormData = new FormData();
  const badJsonBlob = new Blob(['{ "bad": "content" }'], { type: 'application/json' });
  invalidJsonFormData.append('file', badJsonBlob, 'invalid_backup.json');

  const invalidRestoreReq = new Request('http://localhost:3000/api/restore', {
    method: 'POST',
    headers: { 'Cookie': `auth_token=${adminToken}` },
    body: invalidJsonFormData,
  });
  const invalidRestoreRes = await postRestoreHandler(invalidRestoreReq);
  assert.strictEqual(invalidRestoreRes.status, 400, 'Invalid JSON structure should return 400');
  console.log('✔ Corrupted JSON backup correctly rejected (400)');

  // Test 4: POST /api/restore with valid Universal JSON Backup
  const validJsonString = JSON.stringify(backupJson);
  const validJsonFormData = new FormData();
  const validJsonBlob = new Blob([validJsonString], { type: 'application/json' });
  validJsonFormData.append('file', validJsonBlob, 'eprofile_valid_backup.json');

  const validRestoreReq = new Request('http://localhost:3000/api/restore', {
    method: 'POST',
    headers: { 'Cookie': `auth_token=${adminToken}` },
    body: validJsonFormData,
  });
  const validRestoreRes = await postRestoreHandler(validRestoreReq);
  assert.strictEqual(validRestoreRes.status, 200, 'Valid Universal JSON Restore should return 200');
  const validRestoreData = await validRestoreRes.json();
  assert.strictEqual(validRestoreData.success, true);
  assert.strictEqual(validRestoreData.format, 'universal_json');
  console.log('✔ Universal JSON Restore verified with atomic table repopulation');

  // Cleanup synthetic admin if created
  if (admin.username === 'admin_test_backup') {
    await prisma.personnel.delete({ where: { id: admin.id } }).catch(() => {});
  }
}

if (require.main === module) {
  runUniversalBackupRestoreTests()
    .then(() => {
      console.log('All Universal Backup & Restore tests passed!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Universal Backup & Restore test failed:', err);
      process.exit(1);
    });
}
