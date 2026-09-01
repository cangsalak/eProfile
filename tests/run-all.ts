import { runAuthUnitTests } from './unit/auth.test';
import { runApiSecurityTests } from './api/api-security.test';
import { runApiCrudTests } from './api/api-crud.test';
import { runSecurityAttacksTests } from './security/attacks.test';
import { runRoleMatrixTests } from './security/role-matrix.test';
import { runPersonnelPaginationTests } from './api/personnel-pagination.test';
import { runAuthSessionPersistenceTests } from './api/auth-session-persistence.test';
import { runSystemInspectorTests } from './admin/system-inspector.test';
import { runSecurityHeadersTests } from './security/security-headers.test';
import { runApiDocumentationTests } from './admin/api-documentation.test';
import { runDatabaseConfigTests } from './api/database-config.test';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('=====================================================');
  console.log('       eProfile Automated Test Suite (v1.3.0)        ');
  console.log('=====================================================');

  const startTime = Date.now();
  let passedSuites = 0;
  let totalSuites = 11;

  try {
    // 1. Unit Tests
    await runAuthUnitTests();
    passedSuites++;

    // 2. Authentication & Session Persistence Tests
    await runAuthSessionPersistenceTests();
    passedSuites++;

    // 3. API Security Tests
    await runApiSecurityTests();
    passedSuites++;

    // 4. API CRUD & Business Logic Tests
    await runApiCrudTests();
    passedSuites++;

    // 5. Personnel Pagination, Search, Filter & Stats Tests
    await runPersonnelPaginationTests();
    passedSuites++;

    // 6. Security & Attacks Simulation Tests
    await runSecurityAttacksTests();
    passedSuites++;

    // 7. Complete Role Matrix Tests
    await runRoleMatrixTests();
    passedSuites++;

    // 8. Super Admin System Inspector Tests
    await runSystemInspectorTests();
    passedSuites++;

    // 9. Security Response Headers Tests
    await runSecurityHeadersTests();
    passedSuites++;

    // 10. Super Admin API Documentation Tests
    await runApiDocumentationTests();
    passedSuites++;

    // 11. Multi-Database & Installer Tests
    await runDatabaseConfigTests();
    passedSuites++;

    // Final Teardown: Clean up any test notifications, test posts, or test users
    await prisma.notification.deleteMany({
      where: {
        OR: [
          { message: { contains: 'ทดสอบ' } },
          { message: { contains: 'ซีอาร์ยูดี' } },
          { title: { contains: 'ทดสอบ' } },
        ],
      },
    });

    await prisma.post.deleteMany({
      where: {
        OR: [
          { title: { contains: 'Test' } },
          { title: { contains: 'ทดสอบ' } },
        ],
      },
    });

    await prisma.personnel.deleteMany({
      where: {
        OR: [
          { username: { startsWith: 'matrix_test_' } },
          { username: 'test_user_suite' },
        ],
      },
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n=====================================================');
    console.log(`✅ ALL TEST SUITES PASSED! (${passedSuites}/${totalSuites}) in ${duration}s`);
    console.log('=====================================================\n');
    process.exit(0);
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error('\n=====================================================');
    console.error(`❌ TEST SUITE FAILED after ${duration}s:`, error);
    console.error('=====================================================\n');
    process.exit(1);
  }
}

main();
