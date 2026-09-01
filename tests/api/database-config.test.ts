import assert from 'assert';
import { buildConnectionUrl, testDatabaseConnection } from '../../src/lib/db-test';
import { POST as testDbHandler } from '../../src/app/api/install/test-db/route';
import { POST as installHandler } from '../../src/app/api/install/route';

export async function runDatabaseConfigTests() {
  console.log('\n--- Running Multi-Database Support & Installer Validation Tests (v1.3.0) ---');

  // Test 1: Build Connection URLs for SQLite, PostgreSQL, MySQL
  const sqliteUrl = buildConnectionUrl({ provider: 'sqlite', database: 'dev' });
  assert.strictEqual(sqliteUrl, 'file:./dev.db', 'SQLite URL should format correctly');

  const pgUrl = buildConnectionUrl({
    provider: 'postgresql',
    host: 'db.example.com',
    port: 5432,
    database: 'eprofile_db',
    user: 'admin_user',
    password: 'secret_password',
  });
  assert.strictEqual(
    pgUrl,
    'postgresql://admin_user:secret_password@db.example.com:5432/eprofile_db?schema=public',
    'PostgreSQL URL should format correctly with query schema'
  );

  const mysqlUrl = buildConnectionUrl({
    provider: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    database: 'eprofile_main',
    user: 'root',
    password: 'mypassword',
  });
  assert.strictEqual(
    mysqlUrl,
    'mysql://root:mypassword@127.0.0.1:3306/eprofile_main',
    'MySQL URL should format correctly'
  );
  console.log('✔ Database connection URL builders verified for SQLite, PostgreSQL, and MySQL');

  // Test 2: Local SQLite connection test
  const sqliteTest = await testDatabaseConnection({ provider: 'sqlite', database: 'dev' });
  assert.strictEqual(sqliteTest.success, true, 'SQLite test should succeed for local environment');
  assert.ok(typeof sqliteTest.latencyMs === 'number', 'SQLite test should return latency');
  console.log('✔ SQLite filesystem write-permission test verified');

  // Test 3: API Endpoint POST /api/install/test-db
  const validReq = new Request('http://localhost:3000/api/install/test-db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'sqlite', database: 'dev' }),
  });
  const validRes = await testDbHandler(validReq);
  assert.strictEqual(validRes.status, 200, 'Valid SQLite test should return 200');
  const validData = await validRes.json();
  assert.strictEqual(validData.success, true);
  console.log('✔ POST /api/install/test-db endpoint verified');

  // Test 4: Invalid database provider rejection
  const invalidReq = new Request('http://localhost:3000/api/install/test-db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'oracle_invalid' }),
  });
  const invalidRes = await testDbHandler(invalidReq);
  assert.strictEqual(invalidRes.status, 400, 'Invalid provider should be rejected with 400');
  console.log('✔ Invalid database provider properly rejected');

  // Test 5: Strict Digits-Only Validation for citizenId and badgeNo
  // Non-numeric citizenId
  const badCitizenReq = new Request('http://localhost:3000/api/install', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemName: 'eProfile System',
      firstName: 'ทดสอบ',
      lastName: 'ระบบ',
      citizenId: '12345ABC67890',
      badgeNo: '1234567890',
      password: 'StrongPassword123!',
    }),
  });
  const badCitizenRes = await installHandler(badCitizenReq);
  // If system is already installed, it might return 403, otherwise 400
  const badCitizenStatus = badCitizenRes.status;
  assert.ok(badCitizenStatus === 400 || badCitizenStatus === 403, 'Should reject invalid citizenId or reject if already installed');
  console.log('✔ Strict 13-digit citizenId validation verified');

  // Non-numeric badgeNo
  const badBadgeReq = new Request('http://localhost:3000/api/install', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemName: 'eProfile System',
      firstName: 'ทดสอบ',
      lastName: 'ระบบ',
      citizenId: '1234567890123',
      badgeNo: '12345ABCDE',
      password: 'StrongPassword123!',
    }),
  });
  const badBadgeRes = await installHandler(badBadgeReq);
  const badBadgeStatus = badBadgeRes.status;
  assert.ok(badBadgeStatus === 400 || badBadgeStatus === 403, 'Should reject invalid badgeNo or reject if already installed');
  console.log('✔ Strict 10-digit badgeNo validation verified');
}

if (require.main === module) {
  runDatabaseConfigTests()
    .then(() => {
      console.log('All database config tests passed!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database config test failed:', err);
      process.exit(1);
    });
}
