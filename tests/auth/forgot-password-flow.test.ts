import assert from 'assert';
import bcrypt from 'bcryptjs';
import { prisma } from '../../src/lib/prisma';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

export async function runForgotPasswordFlowTests() {
  console.log('\n--- Running Self-Service Password Reset Workflow Tests (v1.3.0) ---');

  const testUsername = 'reset_test_user_2026';
  const testCitizenId = '9876543210123';
  const testPhone = '0899998888';
  const initialPassword = 'InitialPass123!';
  const newPassword = 'NewSecretPass2026!';

  // 1. Setup Test User
  const initialHash = await bcrypt.hash(initialPassword, 10);
  const testUser = await prisma.personnel.upsert({
    where: { username: testUsername },
    update: {
      password: initialHash,
      citizenId: testCitizenId,
      phone: testPhone,
    },
    create: {
      badgeNo: 'TEST_RESET_01',
      username: testUsername,
      citizenId: testCitizenId,
      password: initialHash,
      role: 'USER',
      prefix: 'ร.อ.',
      firstName: 'ทดสอบรีเซ็ต',
      lastName: 'รหัสผ่าน',
      position: 'นายทหาร',
      department: 'กองยุทธการ',
      subDepartment: 'แผนกกำลังพล',
      phone: testPhone,
      mobile: testPhone,
      email: 'reset_test@internal.local',
    },
  });

  try {
    // ── Test 1: Account Lookup (Found) ──────────────────────────────────────────
    const lookupRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'lookup', username: testUsername }),
    });
    const lookupData = await lookupRes.json();
    assert.strictEqual(lookupRes.status, 200, 'Lookup should return 200');
    assert.strictEqual(lookupData.success, true, 'Lookup should be successful');
    assert.strictEqual(lookupData.found, true, 'User should be found');
    assert.ok(lookupData.maskedName.includes('*'), 'Name should be masked for security');
    console.log('✔ Account lookup & identity masking verified');

    // ── Test 2: Account Lookup (Not Found) ──────────────────────────────────────
    const lookupNotFoundRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'lookup', username: 'non_existent_user_9999' }),
    });
    assert.strictEqual(lookupNotFoundRes.status, 404, 'Non-existent lookup should return 404');
    console.log('✔ Non-existent account lookup properly rejected');

    // ── Test 3: Identity Verification (Failed with wrong info) ───────────────────
    const verifyFailRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify',
        username: testUsername,
        citizenId: '0000000000000',
        phone: '0811111111',
      }),
    });
    assert.strictEqual(verifyFailRes.status, 400, 'Wrong verification info must return 400');
    console.log('✔ Invalid verification data rejected with 400');

    // ── Test 4: Identity Verification (Success) ─────────────────────────────────
    const verifySuccessRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify',
        username: testUsername,
        citizenId: testCitizenId,
        phone: testPhone,
      }),
    });
    const verifyData = await verifySuccessRes.json();
    assert.strictEqual(verifySuccessRes.status, 200, 'Valid verification must return 200');
    assert.strictEqual(verifyData.verified, true, 'Verification should succeed');
    assert.ok(verifyData.resetToken && typeof verifyData.resetToken === 'string', 'Should issue a reset token');
    const resetToken = verifyData.resetToken;
    console.log('✔ Identity verification passed and secure Reset Token issued');

    // ── Test 5: Reset Password (Fails Weak Password Policy) ──────────────────────
    const resetWeakRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        newPassword: 'weak',
        confirmPassword: 'weak',
      }),
    });
    assert.strictEqual(resetWeakRes.status, 400, 'Weak password must be rejected');
    console.log('✔ Password policy validation enforced on reset endpoint');

    // ── Test 6: Reset Password (Success) ────────────────────────────────────────
    const resetSuccessRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        newPassword: newPassword,
        confirmPassword: newPassword,
      }),
    });
    const resetSuccessData = await resetSuccessRes.json();
    assert.strictEqual(resetSuccessRes.status, 200, 'Valid reset must return 200');
    assert.strictEqual(resetSuccessData.success, true, 'Reset should be successful');
    console.log('✔ Password reset executed inside transaction and token invalidated');

    // ── Test 7: Re-use of same token must be rejected ───────────────────────────
    const reuseRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        newPassword: 'AnotherPassword123!',
        confirmPassword: 'AnotherPassword123!',
      }),
    });
    assert.strictEqual(reuseRes.status, 400, 'Re-used token must be rejected');
    console.log('✔ Token single-use guarantee verified');

    // ── Test 8: Login with New Password ─────────────────────────────────────────
    const loginNewRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        password: newPassword,
      }),
    });
    assert.strictEqual(loginNewRes.status, 200, 'Login with new password must succeed');
    console.log('✔ Authentication with updated password verified');

    // ── Test 9: Login with Old Password must fail ───────────────────────────────
    const loginOldRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        password: initialPassword,
      }),
    });
    assert.strictEqual(loginOldRes.status, 401, 'Login with old password must fail');
    console.log('✔ Old password successfully invalidated');

  } finally {
    // Cleanup
    await prisma.passwordResetToken.deleteMany({
      where: { personnelId: testUser.id },
    });
    await prisma.notification.deleteMany({
      where: { personnelId: testUser.id },
    });
    await prisma.personnel.delete({
      where: { id: testUser.id },
    }).catch(() => {});
  }
}

if (require.main === module) {
  runForgotPasswordFlowTests()
    .then(() => {
      console.log('All forgot-password tests passed!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Test failed:', err);
      process.exit(1);
    });
}
