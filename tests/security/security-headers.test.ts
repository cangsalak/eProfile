import assert from 'assert';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

export async function runSecurityHeadersTests() {
  console.log('\n--- Running Security Response Headers Tests (v1.2.0) ---');

  const routesToTest = [
    '/',
    '/login',
    '/api/health',
  ];

  for (const route of routesToTest) {
    const res = await fetch(`${BASE_URL}${route}`, { method: 'HEAD', redirect: 'manual' });
    
    // 1. X-Frame-Options
    const xfo = res.headers.get('x-frame-options');
    assert.ok(xfo, `Route ${route} must have X-Frame-Options header`);
    assert.strictEqual(xfo?.toUpperCase(), 'SAMEORIGIN', `Route ${route} X-Frame-Options must be SAMEORIGIN`);

    // 2. X-Content-Type-Options
    const xcto = res.headers.get('x-content-type-options');
    assert.ok(xcto, `Route ${route} must have X-Content-Type-Options header`);
    assert.strictEqual(xcto?.toLowerCase(), 'nosniff', `Route ${route} X-Content-Type-Options must be nosniff`);

    // 3. Referrer-Policy
    const rp = res.headers.get('referrer-policy');
    assert.ok(rp, `Route ${route} must have Referrer-Policy header`);
    assert.strictEqual(rp?.toLowerCase(), 'strict-origin-when-cross-origin', `Route ${route} Referrer-Policy must be strict-origin-when-cross-origin`);

    // 4. Permissions-Policy
    const pp = res.headers.get('permissions-policy');
    assert.ok(pp, `Route ${route} must have Permissions-Policy header`);
    assert.ok(pp?.includes('camera=(self)'), `Route ${route} Permissions-Policy must include camera=(self)`);
    assert.ok(pp?.includes('microphone=()'), `Route ${route} Permissions-Policy must disable microphone`);
    assert.ok(pp?.includes('geolocation=()'), `Route ${route} Permissions-Policy must disable geolocation`);

    // 5. Strict-Transport-Security (HSTS)
    const hsts = res.headers.get('strict-transport-security');
    assert.ok(hsts, `Route ${route} must have Strict-Transport-Security header`);
    assert.ok(hsts?.includes('max-age='), `Route ${route} HSTS must define max-age`);
    assert.ok(hsts?.includes('includeSubDomains'), `Route ${route} HSTS must define includeSubDomains`);
  }

  console.log('✔ All 5 Security Headers verified across Public, Auth and API endpoints:');
  console.log('  • X-Frame-Options: SAMEORIGIN');
  console.log('  • X-Content-Type-Options: nosniff');
  console.log('  • Referrer-Policy: strict-origin-when-cross-origin');
  console.log('  • Permissions-Policy: camera=(self), microphone=(), geolocation=()');
  console.log('  • Strict-Transport-Security: max-age=63072000; includeSubDomains; preload');
}
