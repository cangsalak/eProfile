import assert from 'assert';
import JSZip from 'jszip';
import { SignJWT } from 'jose';
import { prisma } from '../../src/lib/prisma';
import { GET as getTemplate } from '../../src/app/api/modules/template/route';
import { POST as installModule } from '../../src/app/api/modules/install/route';
import { GET as getModules } from '../../src/app/api/modules/route';
import { DELETE as uninstallModule } from '../../src/app/api/modules/[id]/route';

const JWT_SECRET = process.env.JWT_SECRET || 'eprofile-super-secret-jwt-key-2026-change-in-production';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

async function makeToken(id: string, role: string, username: string, department = 'IT'): Promise<string> {
  return await new SignJWT({ id, role, username, department })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2h')
    .setIssuedAt()
    .sign(encodedSecret);
}

export async function runModuleInstallerTests() {
  console.log('\n--- Running Module ZIP Uploader & Lifecycle Tests ---');

  // Find or create test superadmin
  let superAdmin = await prisma.personnel.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });

  if (!superAdmin) {
    superAdmin = await prisma.personnel.create({
      data: {
        badgeNo: 'TEST-MOD-01',
        username: 'test_module_superadmin',
        password: 'hashed_password_placeholder',
        role: 'SUPER_ADMIN',
        prefix: 'พ.อ.',
        firstName: 'Module',
        lastName: 'SuperAdmin',
        position: 'ผู้ดูแลระบบ',
        department: 'IT',
        subDepartment: '',
        phone: '',
        mobile: '',
        email: '',
      },
    });
  }

  // Find or create test user
  let regularUser = await prisma.personnel.findFirst({
    where: { role: 'USER' },
  });

  if (!regularUser) {
    regularUser = await prisma.personnel.create({
      data: {
        badgeNo: 'TEST-MOD-02',
        username: 'test_module_user',
        password: 'hashed_password_placeholder',
        role: 'USER',
        prefix: 'ส.อ.',
        firstName: 'Module',
        lastName: 'User',
        position: 'เจ้าหน้าที่',
        department: 'IT',
        subDepartment: '',
        phone: '',
        mobile: '',
        email: '',
      },
    });
  }

  const superAdminToken = await makeToken(superAdmin.id, superAdmin.role, superAdmin.username, superAdmin.department);
  const regularUserToken = await makeToken(regularUser.id, regularUser.role, regularUser.username, regularUser.department);

  // 1. Template Download RBAC
  {
    // Anon
    const anonReq = new Request('http://localhost:3000/api/modules/template');
    const anonRes = await getTemplate(anonReq);
    assert.strictEqual(anonRes.status, 401, 'Anonymous must be blocked from downloading template');

    // User
    const userReq = new Request('http://localhost:3000/api/modules/template', {
      headers: { Authorization: `Bearer ${regularUserToken}` },
    });
    const userRes = await getTemplate(userReq);
    assert.strictEqual(userRes.status, 403, 'Regular user must be blocked from downloading template');

    // SuperAdmin
    const saReq = new Request('http://localhost:3000/api/modules/template', {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    const saRes = await getTemplate(saReq);
    assert.strictEqual(saRes.status, 200, 'SuperAdmin must be able to download template');
    assert.strictEqual(saRes.headers.get('Content-Type'), 'application/zip', 'Should return zip Content-Type');
    console.log('✔ Module Template download RBAC & generation verified');
  }

  // 2. Install Validation & Security Safeguards
  {
    // A. Anonymous upload blocked
    const anonReq = new Request('http://localhost:3000/api/modules/install', { method: 'POST' });
    const anonRes = await installModule(anonReq);
    assert.strictEqual(anonRes.status, 401, 'Anonymous upload must return 401');

    // B. Regular user blocked
    const userReq = new Request('http://localhost:3000/api/modules/install', {
      method: 'POST',
      headers: { Authorization: `Bearer ${regularUserToken}` },
    });
    const userRes = await installModule(userReq);
    assert.strictEqual(userRes.status, 403, 'Regular user upload must return 403');

    // C. Non-zip extension rejected
    const textFormData = new FormData();
    const textBlob = new Blob(['sample text'], { type: 'text/plain' });
    textFormData.append('file', textBlob, 'badfile.txt');
    const txtReq = new Request('http://localhost:3000/api/modules/install', {
      method: 'POST',
      headers: { Authorization: `Bearer ${superAdminToken}` },
      body: textFormData,
    });
    const txtRes = await installModule(txtReq);
    assert.strictEqual(txtRes.status, 400, 'Non-zip file must return 400');

    // D. Fake zip (wrong magic bytes) rejected
    const fakeZipFormData = new FormData();
    const fakeZipBlob = new Blob(['not a real zip content header'], { type: 'application/zip' });
    fakeZipFormData.append('file', fakeZipBlob, 'fake.zip');
    const fakeZipReq = new Request('http://localhost:3000/api/modules/install', {
      method: 'POST',
      headers: { Authorization: `Bearer ${superAdminToken}` },
      body: fakeZipFormData,
    });
    const fakeZipRes = await installModule(fakeZipReq);
    assert.strictEqual(fakeZipRes.status, 400, 'Fake zip magic bytes must return 400');

    // E. Missing manifest.json rejected
    const noManifestZip = new JSZip();
    noManifestZip.file('test.txt', 'hello');
    const noManifestBuf = await noManifestZip.generateAsync({ type: 'nodebuffer' });
    const noManifestFormData = new FormData();
    noManifestFormData.append('file', new Blob([new Uint8Array(noManifestBuf)]), 'nomanifest.zip');
    const noManifestReq = new Request('http://localhost:3000/api/modules/install', {
      method: 'POST',
      headers: { Authorization: `Bearer ${superAdminToken}` },
      body: noManifestFormData,
    });
    const noManifestRes = await installModule(noManifestReq);
    assert.strictEqual(noManifestRes.status, 400, 'Missing manifest.json must return 400');

    // F. Overwriting core module rejected
    const coreOverrideZip = new JSZip();
    coreOverrideZip.file('manifest.json', JSON.stringify({
      id: 'personnel',
      name: 'Malicious Core Override',
      version: '9.9.9',
      isCore: false,
    }));
    const coreOverrideBuf = await coreOverrideZip.generateAsync({ type: 'nodebuffer' });
    const coreOverrideFormData = new FormData();
    coreOverrideFormData.append('file', new Blob([new Uint8Array(coreOverrideBuf)]), 'override.zip');
    const coreOverrideReq = new Request('http://localhost:3000/api/modules/install', {
      method: 'POST',
      headers: { Authorization: `Bearer ${superAdminToken}` },
      body: coreOverrideFormData,
    });
    const coreOverrideRes = await installModule(coreOverrideReq);
    assert.strictEqual(coreOverrideRes.status, 400, 'Overwriting core module must return 400');

    // G. Zip Slip path traversal rejected
    const zipSlip = new JSZip();
    zipSlip.file('manifest.json', JSON.stringify({
      id: 'test-slip',
      name: 'Test Slip',
      version: '1.0.0',
    }));
    zipSlip.file('../../escaped.txt', 'hacked');
    const zipSlipBuf = await zipSlip.generateAsync({ type: 'nodebuffer' });
    const zipSlipFormData = new FormData();
    zipSlipFormData.append('file', new Blob([new Uint8Array(zipSlipBuf)]), 'slip.zip');
    const zipSlipReq = new Request('http://localhost:3000/api/modules/install', {
      method: 'POST',
      headers: { Authorization: `Bearer ${superAdminToken}` },
      body: zipSlipFormData,
    });
    const zipSlipRes = await installModule(zipSlipReq);
    assert.strictEqual(zipSlipRes.status, 400, 'Zip slip attempt must be blocked with 400');

    // H. Forbidden dangerous extension rejected
    const badExtZip = new JSZip();
    badExtZip.file('manifest.json', JSON.stringify({
      id: 'test-malicious',
      name: 'Test Malicious',
      version: '1.0.0',
    }));
    badExtZip.file('exploit.sh', 'rm -rf /');
    const badExtBuf = await badExtZip.generateAsync({ type: 'nodebuffer' });
    const badExtFormData = new FormData();
    badExtFormData.append('file', new Blob([new Uint8Array(badExtBuf)]), 'badext.zip');
    const badExtReq = new Request('http://localhost:3000/api/modules/install', {
      method: 'POST',
      headers: { Authorization: `Bearer ${superAdminToken}` },
      body: badExtFormData,
    });
    const badExtRes = await installModule(badExtReq);
    assert.strictEqual(badExtRes.status, 400, 'Dangerous file extensions must be rejected with 400');

    // I. Route collision with reserved core route rejected
    const routeCollisionZip = new JSZip();
    routeCollisionZip.file('manifest.json', JSON.stringify({
      id: 'test-collision',
      name: 'Test Route Collision',
      version: '1.0.0',
      menus: [
        {
          id: 'bad-menu',
          title: 'Bad Route',
          icon: 'fa-cog',
          path: '/settings/categories',
          order: 10,
        },
      ],
    }));
    const routeCollisionBuf = await routeCollisionZip.generateAsync({ type: 'nodebuffer' });
    const routeCollisionFormData = new FormData();
    routeCollisionFormData.append('file', new Blob([new Uint8Array(routeCollisionBuf)]), 'collision.zip');
    const routeCollisionReq = new Request('http://localhost:3000/api/modules/install', {
      method: 'POST',
      headers: { Authorization: `Bearer ${superAdminToken}` },
      body: routeCollisionFormData,
    });
    const routeCollisionRes = await installModule(routeCollisionReq);
    assert.strictEqual(routeCollisionRes.status, 400, 'Route collision with reserved routes must be rejected with 400');

    console.log('✔ Zip upload security & attack prevention verified (magic bytes, core protection, zip slip, forbidden extensions, reserved route collisions)');
  }


  // 3. Successful Module Installation & Discovery
  {
    const validModuleZip = new JSZip();
    const manifest = {
      id: 'equipment-loan-test',
      name: 'ระบบยืม-คืนอุปกรณ์ทดสอบ',
      nameEn: 'Equipment Loan Test',
      description: 'ระบบทดสอบการติดตั้งโมดูล',
      version: '1.0.0',
      author: 'Test Team',
      icon: 'fa-toolbox',
      category: 'operations',
      isCore: false,
      defaultEnabled: true,
      menus: [
        {
          id: 'test-loan-menu',
          title: 'ยืมคืนทดสอบ',
          icon: 'fa-solid fa-toolbox',
          path: '/equipment-loan-test',
          order: 48,
        },
      ],
      permissions: [
        {
          key: 'MANAGE_TEST_EQUIPMENT',
          name: 'จัดการยืมคืนทดสอบ',
          description: 'สิทธิ์ทดสอบ',
        },
      ],
    };

    validModuleZip.file('manifest.json', JSON.stringify(manifest, null, 2));
    validModuleZip.file('index.ts', 'export default function TestView() { return null; }');
    const validBuf = await validModuleZip.generateAsync({ type: 'nodebuffer' });

    const validFormData = new FormData();
    validFormData.append('file', new Blob([new Uint8Array(validBuf)]), 'equipment-loan-test.zip');

    const installReq = new Request('http://localhost:3000/api/modules/install', {
      method: 'POST',
      headers: { Authorization: `Bearer ${superAdminToken}` },
      body: validFormData,
    });

    const installRes = await installModule(installReq);
    assert.strictEqual(installRes.status, 200, 'Valid module install must return 200');
    const installData = await installRes.json();
    assert.strictEqual(installData.success, true);
    assert.strictEqual(installData.manifest.id, 'equipment-loan-test');

    // Verify GET /api/modules includes the new module
    const listReq = new Request('http://localhost:3000/api/modules', {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    const listRes = await getModules(listReq);
    assert.strictEqual(listRes.status, 200);
    const listData = await listRes.json();
    const found = listData.modules.find((m: any) => m.id === 'equipment-loan-test');
    assert.ok(found, 'Installed module must appear in /api/modules list');


    // Verify AuditLog
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'MODULE_INSTALLED',
        entityId: 'equipment-loan-test',
      },
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(audit, 'AuditLog must record MODULE_INSTALLED');

    console.log('✔ Valid module ZIP installation and dynamic registration verified');
  }

  // 4. Uninstall Custom Module
  {
    // Attempting to delete core module blocked
    const delCoreReq = new Request('http://localhost:3000/api/modules/personnel', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    const delCoreRes = await uninstallModule(delCoreReq, { params: { id: 'personnel' } });
    assert.strictEqual(delCoreRes.status, 400, 'Deleting core module must return 400');

    // Uninstall custom module succeeds
    const delReq = new Request('http://localhost:3000/api/modules/equipment-loan-test', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    const delRes = await uninstallModule(delReq, { params: { id: 'equipment-loan-test' } });
    assert.strictEqual(delRes.status, 200, 'Uninstall custom module must return 200');

    // Verify AuditLog for uninstall
    const delAudit = await prisma.auditLog.findFirst({
      where: {
        action: 'MODULE_UNINSTALLED',
        entityId: 'equipment-loan-test',
      },
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(delAudit, 'AuditLog must record MODULE_UNINSTALLED');

    console.log('✔ Module uninstall & core module protection verified');
  }
}
