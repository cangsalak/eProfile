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

export async function runRoleMatrixTests() {
  console.log('\n--- Running Complete Security Role Matrix Tests ---');

  // Roles to test
  const roles = ['ANONYMOUS', 'USER', 'OFFICER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'] as const;
  const tokens: Record<string, string | null> = {
    ANONYMOUS: null,
  };

  for (const r of ['USER', 'OFFICER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN']) {
    let dbUser = await prisma.personnel.findFirst({
      where: { role: r, NOT: [{ id: 'ADMIN' }, { id: 'ALL' }] }
    });
    if (!dbUser) {
      dbUser = await prisma.personnel.create({
        data: {
          badgeNo: `TEST-MATRIX-${r}`,
          username: `matrix_test_${r.toLowerCase()}`,
          password: 'test_password_hash',
          role: r,
          prefix: 'นาย',
          firstName: `Test${r}`,
          lastName: 'Matrix',
          position: 'ตำแหน่งทดสอบ',
          department: 'บก.ศฝยว.ทบ.',
          subDepartment: '',
          phone: '',
          mobile: '',
          email: `test_${r.toLowerCase()}@eprofile.local`,
        }
      });
    }
    tokens[r] = await makeToken(dbUser.id, dbUser.role, dbUser.username);
  }

  // Endpoints matrix definition: [name, method, url, body, expectedStatuses per role]
  const matrix: Array<{
    name: string;
    method: string;
    url: string;
    body?: any;
    expected: Record<(typeof roles)[number], number[]>;
  }> = [
    {
      name: 'GET Personnel List',
      method: 'GET',
      url: `${BASE_URL}/api/personnel`,
      expected: {
        ANONYMOUS: [401],
        USER: [200],
        OFFICER: [200],
        EDITOR: [200],
        ADMIN: [200],
        SUPER_ADMIN: [200],
      },
    },
    {
      name: 'POST Personnel (Create)',
      method: 'POST',
      url: `${BASE_URL}/api/personnel`,
      body: { citizenId: '1234567890123', firstName: 'Test', lastName: 'User' },
      expected: {
        ANONYMOUS: [401],
        USER: [403],
        OFFICER: [403],
        EDITOR: [403],
        ADMIN: [201, 400], // 400 if validation fails, 201 if created
        SUPER_ADMIN: [201, 400],
      },
    },
    {
      name: 'GET Audit Logs',
      method: 'GET',
      url: `${BASE_URL}/api/audit-logs`,
      expected: {
        ANONYMOUS: [401],
        USER: [403],
        OFFICER: [403],
        EDITOR: [403],
        ADMIN: [200], // ADMIN has VIEW_AUDIT_LOGS per PERMISSION_MATRIX.md
        SUPER_ADMIN: [200],
      },
    },
    {
      name: 'GET Database Backup',
      method: 'GET',
      url: `${BASE_URL}/api/backup`,
      expected: {
        ANONYMOUS: [401],
        USER: [403],
        OFFICER: [403],
        EDITOR: [403],
        ADMIN: [200],
        SUPER_ADMIN: [200],
      },
    },
    {
      name: 'POST Roles (Create Role)',
      method: 'POST',
      url: `${BASE_URL}/api/roles`,
      body: { name: `CUSTOM_${Date.now()}`, displayName: 'Test Role', permissions: [] },
      expected: {
        ANONYMOUS: [401],
        USER: [403],
        OFFICER: [403],
        EDITOR: [403],
        ADMIN: [200, 201, 400], // ADMIN has MANAGE_SYSTEM per PERMISSION_MATRIX.md
        SUPER_ADMIN: [200, 201, 400],
      },
    },
    {
      name: 'POST Posts (Create News)',
      method: 'POST',
      url: `${BASE_URL}/api/posts`,
      body: { title: 'Test News', content: 'Content' },
      expected: {
        ANONYMOUS: [401],
        USER: [403],
        OFFICER: [403],
        EDITOR: [200, 201, 400], // EDITOR has MANAGE_POSTS
        ADMIN: [200, 201, 400],  // ADMIN has MANAGE_POSTS
        SUPER_ADMIN: [200, 201, 400],
      },
    },
  ];

  console.log('| API Endpoint | ANONYMOUS | USER | OFFICER | EDITOR | ADMIN | SUPER_ADMIN |');
  console.log('|---|:---:|:---:|:---:|:---:|:---:|:---:|');

  for (const item of matrix) {
    const rowResults: string[] = [];

    for (const role of roles) {
      const token = tokens[role];
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Cookie'] = `auth_token=${token}`;
      }

      const res = await fetch(item.url, {
        method: item.method,
        headers,
        body: item.body ? JSON.stringify(item.body) : undefined,
      });

      const allowedStatuses = item.expected[role];
      const pass = allowedStatuses.includes(res.status);
      assert.ok(
        pass,
        `[Role Matrix] ${item.name} for ${role} expected [${allowedStatuses.join('/')}] but got ${res.status}`
      );
      rowResults.push(`${res.status} ✅`);
    }

    console.log(`| ${item.name} | ${rowResults.join(' | ')} |`);
  }

  // Cleanup all matrix test users, created test posts, and created test roles
  await prisma.post.deleteMany({
    where: {
      OR: [
        { title: { contains: 'Test' } },
        { title: { contains: 'ทดสอบ' } },
      ],
    },
  });

  await prisma.systemRole.deleteMany({
    where: {
      OR: [
        { name: { startsWith: 'CUSTOM_' } },
        { displayName: 'Test Role' },
        { name: { startsWith: 'test_' } },
      ],
    },
  });

  await prisma.personnel.deleteMany({
    where: {
      username: { startsWith: 'matrix_test_' },
    },
  });

  console.log('✔ Complete Security Role Matrix verified successfully');
}

if (require.main === module) {
  runRoleMatrixTests()
    .then(() => console.log('\nAll role matrix tests passed!'))
    .catch((err) => {
      console.error('Role matrix test failed:', err);
      process.exit(1);
    });
}
