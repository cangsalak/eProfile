import { runAuthUnitTests } from './unit/auth.test';
import { runApiSecurityTests } from './api/api-security.test';
import { runApiCrudTests } from './api/api-crud.test';
import { runSecurityAttacksTests } from './security/attacks.test';
import { runRoleMatrixTests } from './security/role-matrix.test';

async function main() {
  console.log('=====================================================');
  console.log('       eProfile Automated Test Suite (PHASE 10)       ');
  console.log('=====================================================');

  const startTime = Date.now();
  let passedSuites = 0;
  let totalSuites = 5;

  try {
    // 1. Unit Tests
    await runAuthUnitTests();
    passedSuites++;

    // 2. API Security Tests
    await runApiSecurityTests();
    passedSuites++;

    // 3. API CRUD & Business Logic Tests
    await runApiCrudTests();
    passedSuites++;

    // 4. Security & Attacks Simulation Tests
    await runSecurityAttacksTests();
    passedSuites++;

    // 5. Complete Role Matrix Tests
    await runRoleMatrixTests();
    passedSuites++;

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
