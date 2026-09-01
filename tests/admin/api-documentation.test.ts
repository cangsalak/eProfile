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

export async function runApiDocumentationTests() {
  console.log('\n--- Running Super Admin API Documentation Tests (v1.2.0) ---');

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

  // Find test users for each role
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
  const anonRes = await fetch(`${BASE_URL}/api/admin/api-docs`);
  assert.strictEqual(anonRes.status, 401, 'Anonymous must receive 401 Unauthorized');

  // 2. RBAC Check: USER, OFFICER, EDITOR, ADMIN -> 403 Forbidden (SUPER_ADMIN ONLY)
  const userRes = await fetch(`${BASE_URL}/api/admin/api-docs`, { headers: { Cookie: `auth_token=${userToken}` } });
  assert.strictEqual(userRes.status, 403, 'USER must receive 403 Forbidden');

  const officerRes = await fetch(`${BASE_URL}/api/admin/api-docs`, { headers: { Cookie: `auth_token=${officerToken}` } });
  assert.strictEqual(officerRes.status, 403, 'OFFICER must receive 403 Forbidden');

  const editorRes = await fetch(`${BASE_URL}/api/admin/api-docs`, { headers: { Cookie: `auth_token=${editorToken}` } });
  assert.strictEqual(editorRes.status, 403, 'EDITOR must receive 403 Forbidden');

  const adminRes = await fetch(`${BASE_URL}/api/admin/api-docs`, { headers: { Cookie: `auth_token=${adminToken}` } });
  assert.strictEqual(adminRes.status, 403, 'ADMIN must receive 403 Forbidden (API Docs is strictly SUPER_ADMIN)');

  // 3. RBAC Check: SUPER_ADMIN -> 200 OK
  const superAdminRes = await fetch(`${BASE_URL}/api/admin/api-docs`, { headers: { Cookie: `auth_token=${superAdminToken}` } });
  assert.strictEqual(superAdminRes.status, 200, 'SUPER_ADMIN must receive 200 OK');
  console.log('✔ Strict SUPER_ADMIN RBAC protection verified (401 for anon, 403 for user/officer/editor/admin, 200 for super_admin)');

  // 4. Validate API Discovery Payload
  const json = await superAdminRes.json();
  assert.ok(json.success, 'Response must be success');
  const data = json.data;

  assert.ok(data.totalApis >= 40, `Total APIs should be >= 40 (found: ${data.totalApis})`);
  assert.ok(data.methodCounts.GET > 0, 'GET count must be > 0');
  assert.ok(data.methodCounts.POST > 0, 'POST count must be > 0');
  assert.ok(Array.isArray(data.apis), 'apis must be an array');
  console.log(`✔ API Discovery successfully found ${data.totalApis} endpoints (GET: ${data.methodCounts.GET}, POST: ${data.methodCounts.POST}, PUT: ${data.methodCounts.PUT}, DELETE: ${data.methodCounts.DELETE})`);

  // 5. Check Endpoint coverage
  const endpoints = data.apis.map((a: any) => a.endpoint);
  assert.ok(endpoints.includes('/api/auth/login'), 'Must include /api/auth/login');
  assert.ok(endpoints.includes('/api/personnel'), 'Must include /api/personnel');
  assert.ok(endpoints.includes('/api/personnel/[id]'), 'Must include /api/personnel/[id]');
  assert.ok(endpoints.includes('/api/departments'), 'Must include /api/departments');
  assert.ok(endpoints.includes('/api/leaves'), 'Must include /api/leaves');
  assert.ok(endpoints.includes('/api/vehicles'), 'Must include /api/vehicles');
  assert.ok(endpoints.includes('/api/roles'), 'Must include /api/roles');
  assert.ok(endpoints.includes('/api/settings'), 'Must include /api/settings');
  assert.ok(endpoints.includes('/api/backup'), 'Must include /api/backup');
  assert.ok(endpoints.includes('/api/verify/[id]'), 'Must include /api/verify/[id]');
  assert.ok(endpoints.includes('/api/admin/inspector'), 'Must include /api/admin/inspector');
  console.log('✔ Key system endpoints confirmed present in API Reference catalogue');

  // 6. Check Role Matrix Structure
  const personnelGet = data.apis.find((a: any) => a.endpoint === '/api/personnel' && a.method === 'GET');
  assert.ok(personnelGet, 'GET /api/personnel must exist');
  assert.strictEqual(personnelGet.roleMatrix.superAdmin, true, 'SUPER_ADMIN must have access');
  assert.strictEqual(personnelGet.roleMatrix.anonymous, false, 'Anonymous must NOT have access');
  console.log('✔ Role Access Matrix verified for endpoints');

  // 7. Test Code Example Generator (cURL, JavaScript, TypeScript, Python, PHP)
  const { generateCodeExample } = await import('../../src/lib/api-docs/code-generator');
  const curlCode = generateCodeExample(personnelGet, 'curl', 'https://example.com');
  const jsCode = generateCodeExample(personnelGet, 'javascript', 'https://example.com');
  const tsCode = generateCodeExample(personnelGet, 'typescript', 'https://example.com');
  const pyCode = generateCodeExample(personnelGet, 'python', 'https://example.com');
  const phpCode = generateCodeExample(personnelGet, 'php', 'https://example.com');

  assert.ok(curlCode.includes('curl -X GET') && curlCode.includes('https://example.com/api/personnel'), 'cURL code format valid');
  assert.ok(jsCode.includes('fetch("https://example.com/api/personnel') && jsCode.includes('credentials: "include"'), 'JS fetch code format valid');
  assert.ok(tsCode.includes('interface') && tsCode.includes('fetch('), 'TypeScript code format valid');
  assert.ok(pyCode.includes('import requests') && pyCode.includes('requests.get('), 'Python code format valid');
  assert.ok(phpCode.includes('curl_init') && phpCode.includes('curl_exec'), 'PHP code format valid');

  // Verify no hardcoded secrets in generated code
  [curlCode, jsCode, tsCode, pyCode, phpCode].forEach((code) => {
    assert.strictEqual(code.includes(JWT_SECRET), false, 'Generated code must NOT expose JWT secret');
    assert.strictEqual(code.includes('password123'), false, 'Generated code must NOT expose real passwords');
  });
  console.log('✔ Code Example Generator verified across cURL, JS, TS, Python, PHP with 0 secret exposure');
}

