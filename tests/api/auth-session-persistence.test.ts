import assert from 'assert';
import { SignJWT } from 'jose';
import { prisma } from '../../src/lib/prisma';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'eprofile-super-secret-jwt-key-2026-change-in-production';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

async function makeToken(id: string, role: string, username: string, exp = '2h'): Promise<string> {
  return await new SignJWT({ id, role, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(exp)
    .setIssuedAt()
    .sign(encodedSecret);
}

export async function runAuthSessionPersistenceTests() {
  console.log('\n--- Running Authentication Session Persistence Tests (P0 Fix) ---');

  const admin = await prisma.personnel.findFirst({
    where: { role: 'SUPER_ADMIN', NOT: [{ id: 'ADMIN' }, { id: 'ALL' }] }
  }) || await prisma.personnel.findFirst({
    where: { role: 'ADMIN', NOT: [{ id: 'ADMIN' }, { id: 'ALL' }] }
  });

  assert.ok(admin, 'Admin must exist in DB for test');
  const validToken = await makeToken(admin.id, admin.role, admin.username);

  // 1. Unauthenticated /api/auth/me -> 401
  const unauthMeRes = await fetch(`${BASE_URL}/api/auth/me`);
  assert.strictEqual(unauthMeRes.status, 401, 'Unauthenticated /api/auth/me should return 401');
  console.log('✔ Unauthenticated /api/auth/me returns 401');

  // 2. Authenticated /api/auth/me -> 200 + user profile
  const authMeRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {
      'Cookie': `auth_token=${validToken}`,
    },
  });
  assert.strictEqual(authMeRes.status, 200, 'Authenticated /api/auth/me should return 200');
  const authMeData = await authMeRes.json();
  assert.ok(authMeData.user, 'Should return user object');
  assert.strictEqual(authMeData.user.username, admin.username, 'Username must match');
  assert.strictEqual(authMeData.user.password, undefined, 'Password must never be returned');
  console.log('✔ Authenticated /api/auth/me returns 200 and sanitizes password');

  // 3. Authenticated Navigate to Home (/) -> Accessible (200 OK)
  const homeAccessRes = await fetch(`${BASE_URL}/`, {
    headers: {
      'Cookie': `auth_token=${validToken}`,
    },
    redirect: 'manual',
  });
  assert.strictEqual(homeAccessRes.status, 200, 'Authenticated users should be able to view the public home page');
  console.log('✔ Authenticated navigation to / correctly renders public home page');

  // 4. Authenticated Navigate to /login -> Middleware redirects to /modules/personnel
  const loginRedirectRes = await fetch(`${BASE_URL}/login`, {
    headers: {
      'Cookie': `auth_token=${validToken}`,
    },
    redirect: 'manual',
  });
  assert.ok(
    [307, 308, 302].includes(loginRedirectRes.status),
    `Authenticated /login should redirect to /modules/personnel (got status ${loginRedirectRes.status})`
  );
  console.log('✔ Authenticated navigation to /login correctly redirects to /modules/personnel');

  // 5. Unauthenticated Navigate to /modules/personnel -> Middleware redirects to /login
  const protectedRedirectRes = await fetch(`${BASE_URL}/modules/personnel`, {
    redirect: 'manual',
  });
  assert.ok(
    [307, 308, 302].includes(protectedRedirectRes.status),
    `Unauthenticated /modules/personnel should redirect to /login (got status ${protectedRedirectRes.status})`
  );
  const protectedLocation = protectedRedirectRes.headers.get('location');
  assert.ok(protectedLocation?.includes('/login'), `Location should point to /login (got ${protectedLocation})`);
  console.log('✔ Unauthenticated navigation to protected route redirects to /login');

  // 6. Expired Token -> 401
  const expiredToken = await makeToken(admin.id, admin.role, admin.username, '-10s');
  const expiredRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {
      'Cookie': `auth_token=${expiredToken}`,
    },
  });
  assert.strictEqual(expiredRes.status, 401, 'Expired token should return 401');
  console.log('✔ Expired JWT token is properly rejected');

  // 7. Tampered Token -> 401
  const tamperedToken = validToken.slice(0, -5) + 'xxxxx';
  const tamperedRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {
      'Cookie': `auth_token=${tamperedToken}`,
    },
  });
  assert.strictEqual(tamperedRes.status, 401, 'Tampered token should return 401');
  console.log('✔ Tampered JWT token is properly rejected');

  // 8. Logout endpoint clears cookie
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Cookie': `auth_token=${validToken}`,
    },
  });
  assert.strictEqual(logoutRes.status, 200, 'Logout should return 200');
  const setCookie = logoutRes.headers.get('set-cookie');
  assert.ok(setCookie, 'Logout response must have Set-Cookie header');
  assert.ok(setCookie.includes('auth_token='), 'Set-Cookie must target auth_token');
  console.log('✔ Logout endpoint invalidates session and clears cookie');
}
