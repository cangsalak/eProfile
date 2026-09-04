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

export async function runSystemInspectorTests() {
  console.log('\n--- Running Super Admin System Inspector Tests (v1.2.0) ---');

  async function ensureRoleUser(role: string) {
    let u = await prisma.personnel.findFirst({ where: { role, NOT: [{ id: 'ADMIN' }, { id: 'ALL' }] } });
    if (!u) {
      u = await prisma.personnel.create({
        data: {
          badgeNo: `TEST-${role}`,
          username: `test_${role.toLowerCase()}`,
          password: 'test_password_hash',
          role,
          prefix: 'นาย',
          firstName: `Test${role}`,
          lastName: 'User',
          position: 'ตำแหน่งทดสอบ',
          department: 'บก.ศฝยว.ทบ.',
          subDepartment: '',
          phone: '',
          mobile: '',
          email: `test_${role.toLowerCase()}@eprofile.local`,
        },
      });
    }
    return u;
  }

  // Find or create test users for all roles
  const superAdmin = await ensureRoleUser('SUPER_ADMIN');
  const admin = await ensureRoleUser('ADMIN');
  const editor = await ensureRoleUser('EDITOR');
  const officer = await ensureRoleUser('OFFICER');
  const user = await ensureRoleUser('USER');

  const superAdminToken = await makeToken(superAdmin.id, superAdmin.role, superAdmin.username);
  const adminToken = await makeToken(admin.id, admin.role, admin.username);
  const editorToken = await makeToken(editor.id, editor.role, editor.username);
  const officerToken = await makeToken(officer.id, officer.role, officer.username);
  const userToken = await makeToken(user.id, user.role, user.username);

  // 1. RBAC Check: Anonymous -> 401
  const anonRes = await fetch(`${BASE_URL}/api/admin/inspector`);
  assert.strictEqual(anonRes.status, 401, 'Anonymous must be 401');

  // 2. RBAC Check: USER, OFFICER, EDITOR, ADMIN -> 403 Forbidden (SUPER_ADMIN ONLY)
  const userRes = await fetch(`${BASE_URL}/api/admin/inspector`, { headers: { Cookie: `auth_token=${userToken}` } });
  assert.strictEqual(userRes.status, 403, 'USER must be 403');

  const officerRes = await fetch(`${BASE_URL}/api/admin/inspector`, { headers: { Cookie: `auth_token=${officerToken}` } });
  assert.strictEqual(officerRes.status, 403, 'OFFICER must be 403');

  const editorRes = await fetch(`${BASE_URL}/api/admin/inspector`, { headers: { Cookie: `auth_token=${editorToken}` } });
  assert.strictEqual(editorRes.status, 403, 'EDITOR must be 403');

  const adminRes = await fetch(`${BASE_URL}/api/admin/inspector`, { headers: { Cookie: `auth_token=${adminToken}` } });
  assert.strictEqual(adminRes.status, 403, 'ADMIN must be 403 (Inspector is strictly SUPER_ADMIN)');

  // 3. RBAC Check: SUPER_ADMIN -> 200 OK
  const superAdminRes = await fetch(`${BASE_URL}/api/admin/inspector`, { headers: { Cookie: `auth_token=${superAdminToken}` } });
  assert.strictEqual(superAdminRes.status, 200, 'SUPER_ADMIN must be 200');
  console.log('✔ Strict SUPER_ADMIN RBAC protection verified (401 for anon, 403 for user/officer/editor/admin, 200 for super_admin)');

  // 4. Check Security Headers endpoint
  const headersRes = await fetch(`${BASE_URL}/api/admin/inspector/check-headers`, { headers: { Cookie: `auth_token=${superAdminToken}` } });
  assert.strictEqual(headersRes.status, 200, 'check-headers must return 200');
  const headersData = await headersRes.json();
  assert.ok(Array.isArray(headersData.missingHeaders), 'missingHeaders must be array');
  console.log('✔ Security Headers diagnostic endpoint verified');

  // 5. Create Inspection Report
  let createdId = '';
  let firstFindingId = '';
  const createRes = await fetch(`${BASE_URL}/api/admin/inspector`, {
    method: 'POST',
    headers: {
      'Cookie': `auth_token=${superAdminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      page: 'หน้าจัดการบุคลากร',
      url: '/manage/personnel',
      scanMode: 'STANDARD',
      durationMs: 350,
      overallResult: 'NEEDS_REVIEW',
      criticalCount: 0,
      highCount: 1,
      mediumCount: 1,
      lowCount: 1,
      infoCount: 0,
      findings: [
        {
          findingCode: 'TX-001',
          category: 'Typography',
          severity: 'MEDIUM',
          title: 'พบคำสะกดผิด: "ข้อมุล"',
          description: 'พบคำว่า "ข้อมุล" ในส่วนหัวข้อ',
          expected: '"ข้อมูล"',
          actual: '"ข้อมุล"',
          element: 'span',
          recommendation: 'แก้ไขเป็น: "ข้อมูล"',
        },
        {
          findingCode: 'UI-002',
          category: 'UI',
          severity: 'HIGH',
          title: 'ปุ่มไม่มี Accessible Name',
          description: 'พบปุ่มไม่มีข้อความหรือ aria-label',
          element: 'button',
          recommendation: 'เพิ่ม aria-label บนปุ่ม',
        },
        {
          findingCode: 'AX-003',
          category: 'Accessibility',
          severity: 'LOW',
          title: 'รูปภาพไม่มี attribute alt',
          description: 'พบรูปภาพไม่มีคำอธิบาย alt',
          element: 'img',
          recommendation: 'เพิ่ม alt="รูปภาพประจำตัว"',
        },
      ],
    }),
  });

  assert.strictEqual(createRes.status, 201, 'Create inspection must return 201');
  const createData = await createRes.json();
  assert.ok(createData.data.id, 'Created inspection must have ID');
  assert.strictEqual(createData.data.findings.length, 3, 'Findings count must match 3');
  createdId = createData.data.id;
  firstFindingId = createData.data.findings[0].id;
  console.log('✔ Create Inspection report with findings verified');

  // 6. Read Inspection Detail
  const detailRes = await fetch(`${BASE_URL}/api/admin/inspector/${createdId}`, {
    headers: { Cookie: `auth_token=${superAdminToken}` },
  });
  assert.strictEqual(detailRes.status, 200, 'Get inspection detail must return 200');
  const detailData = await detailRes.json();
  assert.strictEqual(detailData.data.id, createdId, 'Inspection ID must match');
  assert.strictEqual(detailData.data.findings.length, 3, 'Findings count must match');
  console.log('✔ Read Inspection detail verified');

  // 7. Update Finding Status
  const updateFindingRes = await fetch(`${BASE_URL}/api/admin/inspector/${createdId}/findings/${firstFindingId}`, {
    method: 'PATCH',
    headers: {
      'Cookie': `auth_token=${superAdminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'REVIEWED',
      notes: 'ตรวจสอบแล้ว รอแก้ไขในการอัปเดตถัดไป',
    }),
  });
  assert.strictEqual(updateFindingRes.status, 200, 'Update finding status must return 200');
  const updateData = await updateFindingRes.json();
  assert.strictEqual(updateData.data.status, 'REVIEWED', 'Finding status must be REVIEWED');
  console.log('✔ Update Finding Status and notes verified');

  // 8. Delete Inspection
  const deleteRes = await fetch(`${BASE_URL}/api/admin/inspector/${createdId}`, {
    method: 'DELETE',
    headers: { Cookie: `auth_token=${superAdminToken}` },
  });
  assert.strictEqual(deleteRes.status, 200, 'Delete inspection must return 200');
  console.log('✔ Delete Inspection record verified');
}
