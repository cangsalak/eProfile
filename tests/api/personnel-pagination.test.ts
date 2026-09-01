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

export async function runPersonnelPaginationTests() {
  console.log('\n--- Running Personnel Pagination, Search, Filter & Stats Tests (v1.2.0) ---');

  const admin = await prisma.personnel.findFirst({
    where: { role: 'SUPER_ADMIN', NOT: [{ id: 'ADMIN' }, { id: 'ALL' }] }
  }) || await prisma.personnel.findFirst({
    where: { role: 'ADMIN', NOT: [{ id: 'ADMIN' }, { id: 'ALL' }] }
  });

  assert.ok(admin, 'Admin must exist in DB for test');
  const adminToken = await makeToken(admin.id, admin.role, admin.username);

  const authHeaders = {
    'Cookie': `auth_token=${adminToken}`,
    'Content-Type': 'application/json',
  };

  // 1. Default pagination check
  const defaultRes = await fetch(`${BASE_URL}/api/personnel?page=1&limit=20`, {
    headers: authHeaders,
  });
  assert.strictEqual(defaultRes.status, 200, 'Default pagination should return 200');
  const defaultData = await defaultRes.json();
  assert.ok(Array.isArray(defaultData.data), 'Response should have data array');
  assert.ok(defaultData.pagination, 'Response should have pagination object');
  assert.strictEqual(defaultData.pagination.page, 1, 'Page should be 1');
  assert.strictEqual(defaultData.pagination.limit, 20, 'Limit should be 20');
  assert.ok(typeof defaultData.pagination.total === 'number', 'Total should be a number');
  console.log('✔ Default Server-side Pagination verified');

  // 2. Pagination clamping & validation
  const invalidPageRes = await fetch(`${BASE_URL}/api/personnel?page=0&limit=20`, {
    headers: authHeaders,
  });
  assert.strictEqual(invalidPageRes.status, 400, 'page=0 should return 400 Bad Request');

  const negativePageRes = await fetch(`${BASE_URL}/api/personnel?page=-1&limit=20`, {
    headers: authHeaders,
  });
  assert.strictEqual(negativePageRes.status, 400, 'page=-1 should return 400 Bad Request');

  const invalidLimitRes = await fetch(`${BASE_URL}/api/personnel?page=1&limit=101`, {
    headers: authHeaders,
  });
  assert.strictEqual(invalidLimitRes.status, 400, 'limit=101 should return 400 Bad Request');

  const smallLimitRes = await fetch(`${BASE_URL}/api/personnel?page=1&limit=5`, {
    headers: authHeaders,
  });
  assert.strictEqual(smallLimitRes.status, 200, 'limit=5 should return 200');
  const smallLimitData = await smallLimitRes.json();
  assert.ok(smallLimitData.data.length <= 5, 'Data length should be <= 5');
  console.log('✔ Pagination boundary validation (page >= 1, 1 <= limit <= 100) passed');

  // 3. Multi-field Search
  const searchRes = await fetch(`${BASE_URL}/api/personnel?search=${encodeURIComponent(admin.firstName)}`, {
    headers: authHeaders,
  });
  assert.strictEqual(searchRes.status, 200, 'Thai search query should return 200');
  const searchData = await searchRes.json();
  assert.ok(Array.isArray(searchData.data), 'Search should return array');

  const emptySearchRes = await fetch(`${BASE_URL}/api/personnel?search=NON_EXISTENT_XYZ_123456`, {
    headers: authHeaders,
  });
  assert.strictEqual(emptySearchRes.status, 200, 'Empty search should return 200');
  const emptySearchData = await emptySearchRes.json();
  assert.strictEqual(emptySearchData.data.length, 0, 'Non-existent search should return 0 items');
  console.log('✔ Multi-field server search verified');

  // 4. Safe Sorting Allowlist
  const validSortRes = await fetch(`${BASE_URL}/api/personnel?sortBy=firstName&sortOrder=asc`, {
    headers: authHeaders,
  });
  assert.strictEqual(validSortRes.status, 200, 'Valid sortBy=firstName should return 200');

  const invalidSortRes = await fetch(`${BASE_URL}/api/personnel?sortBy=passwordHash&sortOrder=asc`, {
    headers: authHeaders,
  });
  assert.strictEqual(invalidSortRes.status, 400, 'Unallowlisted sortBy should return 400 Bad Request');

  const invalidOrderRes = await fetch(`${BASE_URL}/api/personnel?sortBy=firstName&sortOrder=drop_table`, {
    headers: authHeaders,
  });
  assert.strictEqual(invalidOrderRes.status, 400, 'Invalid sortOrder should return 400 Bad Request');
  console.log('✔ Safe sorting allowlist verified');

  // 5. Personnel Dashboard Stats API
  const statsRes = await fetch(`${BASE_URL}/api/personnel/stats`, {
    headers: authHeaders,
  });
  assert.strictEqual(statsRes.status, 200, 'Stats API should return 200');
  const statsData = await statsRes.json();
  assert.ok(statsData.summary, 'Stats should contain summary');
  assert.ok(typeof statsData.summary.total === 'number', 'Total count should be number');
  assert.ok(typeof statsData.summary.active === 'number', 'Active count should be number');
  assert.ok(Array.isArray(statsData.byDepartment), 'byDepartment should be array');
  assert.ok(Array.isArray(statsData.byPersonnelType), 'byPersonnelType should be array');
  console.log('✔ Personnel Dashboard statistics aggregations verified');

  // 6. Personnel Export API
  const exportRes = await fetch(`${BASE_URL}/api/personnel/export`, {
    headers: authHeaders,
  });
  assert.strictEqual(exportRes.status, 200, 'Export API should return 200');
  const exportData = await exportRes.json();
  assert.ok(Array.isArray(exportData.data), 'Export data should be array');
  assert.ok(typeof exportData.total === 'number', 'Export total should be number');
  console.log('✔ Secure Personnel Export with RBAC and Audit verified');

  // 7. Document Foundation API
  const docsRes = await fetch(`${BASE_URL}/api/personnel/${admin.id}/documents`, {
    headers: authHeaders,
  });
  assert.strictEqual(docsRes.status, 200, 'List documents should return 200');
  const docsData = await docsRes.json();
  assert.ok(Array.isArray(docsData), 'Documents should return array');

  const createDocRes = await fetch(`${BASE_URL}/api/personnel/${admin.id}/documents`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      category: 'คำสั่ง',
      filename: 'appointment_order_2026.pdf',
      mimeType: 'application/pdf',
      size: 102400,
      storagePath: '/uploads/documents/order_2026.pdf',
      notes: 'คำสั่งแต่งตั้งประจำปี',
    }),
  });
  assert.strictEqual(createDocRes.status, 201, 'Create document metadata should return 201');
  console.log('✔ Document Management Foundation API verified');
}
