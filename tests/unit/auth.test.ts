import assert from 'assert';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { passwordPolicySchema, changePasswordSchema, loginSchema } from '../../src/lib/validations';
import { isValidId, validateUploadedFile } from '../../src/lib/validate-utils';

const JWT_SECRET = process.env.JWT_SECRET || 'eprofile-super-secret-jwt-key-2026-change-in-production';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function runAuthUnitTests() {
  console.log('\n--- Running Unit Tests: Authentication & Password Policy ---');

  // 1. Password Hashing & Comparison
  {
    const rawPassword = 'SecurePassword123';
    const hash = await bcrypt.hash(rawPassword, 10);
    assert.strictEqual(typeof hash, 'string', 'Hash should be a string');
    assert.ok(hash.startsWith('$2'), 'Hash should be bcrypt format');
    
    const isValid = await bcrypt.compare(rawPassword, hash);
    assert.strictEqual(isValid, true, 'Valid password should match hash');

    const isInvalid = await bcrypt.compare('WrongPassword999', hash);
    assert.strictEqual(isInvalid, false, 'Invalid password should not match hash');
    console.log('✔ Password hashing & comparison passed');
  }

  // 2. Password Policy Rules
  {
    // Valid password
    const valid = passwordPolicySchema.safeParse('Password123');
    assert.strictEqual(valid.success, true, 'Password123 should be valid');

    // Too short (< 8 chars)
    const tooShort = passwordPolicySchema.safeParse('Pass1');
    assert.strictEqual(tooShort.success, false, 'Short password should fail');

    // Missing uppercase
    const noUpper = passwordPolicySchema.safeParse('password123');
    assert.strictEqual(noUpper.success, false, 'No uppercase password should fail');

    // Missing lowercase
    const noLower = passwordPolicySchema.safeParse('PASSWORD123');
    assert.strictEqual(noLower.success, false, 'No lowercase password should fail');

    // Missing number
    const noNumber = passwordPolicySchema.safeParse('PasswordOnly');
    assert.strictEqual(noNumber.success, false, 'No number password should fail');

    console.log('✔ Password policy validation rules passed');
  }

  // 3. Change Password Schema Confirmation Matching
  {
    const matching = changePasswordSchema.safeParse({
      currentPassword: 'OldPassword123',
      newPassword: 'NewSecurePass456',
      confirmPassword: 'NewSecurePass456'
    });
    assert.strictEqual(matching.success, true, 'Matching new and confirm password should pass');

    const mismatch = changePasswordSchema.safeParse({
      currentPassword: 'OldPassword123',
      newPassword: 'NewSecurePass456',
      confirmPassword: 'DifferentPass789'
    });
    assert.strictEqual(mismatch.success, false, 'Mismatched passwords should fail');
    console.log('✔ Change password schema matching passed');
  }

  // 4. JWT Signing & Verification
  {
    const payload = { id: 'user-123', role: 'ADMIN', username: 'admin_test' };
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .setIssuedAt()
      .sign(encodedSecret);

    const verified = await jwtVerify(token, encodedSecret);
    assert.strictEqual(verified.payload.id, payload.id);
    assert.strictEqual(verified.payload.role, payload.role);
    assert.strictEqual(verified.payload.username, payload.username);
    console.log('✔ JWT signing and verification passed');
  }

  // 5. Expired JWT Rejection
  {
    const expiredToken = await new SignJWT({ id: 'user-expired', role: 'USER' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('-1h') // Expired 1 hour ago
      .setIssuedAt()
      .sign(encodedSecret);

    let failedAsExpected = false;
    try {
      await jwtVerify(expiredToken, encodedSecret);
    } catch (e: any) {
      failedAsExpected = true;
    }
    assert.strictEqual(failedAsExpected, true, 'Expired JWT must be rejected');
    console.log('✔ Expired JWT verification rejection passed');
  }

  // 6. Tampered JWT Rejection
  {
    const validToken = await new SignJWT({ id: 'user-legit', role: 'USER' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .sign(encodedSecret);

    // Tamper with payload
    const parts = validToken.split('.');
    const tamperedPayload = Buffer.from(JSON.stringify({ id: 'user-legit', role: 'SUPER_ADMIN' })).toString('base64url');
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    let rejected = false;
    try {
      await jwtVerify(tamperedToken, encodedSecret);
    } catch (e) {
      rejected = true;
    }
    assert.strictEqual(rejected, true, 'Tampered token must fail signature verification');
    console.log('✔ Tampered JWT rejection passed');
  }

  // 7. Validation Utils: ID & Path Traversal & File Uploads
  {
    // Valid and invalid IDs
    assert.strictEqual(isValidId('cmtiarqcp0006grr95yf5oyr9'), true, 'CUID should be valid');
    assert.strictEqual(isValidId('123e4567-e89b-12d3-a456-426614174000'), true, 'UUID should be valid');
    assert.strictEqual(isValidId('../etc/passwd'), false, 'Path traversal in ID should fail');
    assert.strictEqual(isValidId('<script>'), false, 'Special chars in ID should fail');
    assert.strictEqual(isValidId('invalid id with spaces'), false, 'Spaces in ID should fail');

    // File upload validation
    const validFileCheck = validateUploadedFile({ name: 'photo.jpg', type: 'image/jpeg', size: 1024 * 500 });
    assert.strictEqual(validFileCheck.valid, true, 'Valid JPG file should pass');

    const maliciousExt = validateUploadedFile({ name: 'malicious.php', type: 'image/jpeg', size: 1024 });
    assert.strictEqual(maliciousExt.valid, false, 'Disallowed extension .php must fail');

    const mimeMismatch = validateUploadedFile({ name: 'document.pdf', type: 'image/jpeg', size: 1024 });
    assert.strictEqual(mimeMismatch.valid, false, 'MIME mismatch must fail');

    const oversized = validateUploadedFile({ name: 'huge.png', type: 'image/png', size: 20 * 1024 * 1024 }); // 20MB
    assert.strictEqual(oversized.valid, false, 'Oversized file (>10MB) must fail');

    const pathTraversalFile = validateUploadedFile({ name: '../../etc/passwd.jpg', type: 'image/jpeg', size: 1024 });
    assert.strictEqual(pathTraversalFile.valid, false, 'Path traversal in filename must fail');

    console.log('✔ Input validation utils & file upload checks passed');
  }
}

if (require.main === module) {
  runAuthUnitTests()
    .then(() => console.log('\nAll auth unit tests passed successfully!'))
    .catch((err) => {
      console.error('Test failed:', err);
      process.exit(1);
    });
}
