import assert from 'assert';
import { prisma } from '../../src/lib/prisma';
import { SignJWT } from 'jose';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-unit-testing-32chars!';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

async function createToken(id: string, role: string, citizenId = '1234567890123') {
  return await new SignJWT({
    id,
    badgeNo: `TEST_${id.slice(0, 5)}`,
    username: citizenId,
    role,
    mustChangePassword: false,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(encodedSecret);
}

export async function runCommandDashboardTests() {
  console.log('\n--- Running Command Dashboard & Readiness Tests (v1.3.0) ---');

  // ── 1. Setup Test Users & Roles ─────────────────────────────────────────────
  // User 1: General User (USER) - No VIEW_COMMAND_DASHBOARD
  const userRegular = await prisma.personnel.upsert({
    where: { badgeNo: 'TEST_REGULAR_USER' },
    update: {},
    create: {
      badgeNo: 'TEST_REGULAR_USER',
      username: 'test_regular_user',
      citizenId: '9000000000001',
      password: 'hash',
      role: 'USER',
      prefix: 'นาย',
      firstName: 'Regular',
      lastName: 'User',
      position: 'Staff',
      department: 'กองบัญชาการ',
      subDepartment: '-',
      phone: '-',
      mobile: '-',
      email: 'regular@test.local',
    },
  });

  // User 2: Unit Commander (COMMANDER) - Department = กองการฝึก (Training)
  const userCommander = await prisma.personnel.upsert({
    where: { badgeNo: 'TEST_UNIT_COMMANDER' },
    update: {},
    create: {
      badgeNo: 'TEST_UNIT_COMMANDER',
      username: 'test_unit_commander',
      citizenId: '9000000000002',
      password: 'hash',
      role: 'COMMANDER',
      prefix: 'พ.อ.',
      firstName: 'Commander',
      lastName: 'Training',
      position: 'ผู้บังคับกอง',
      department: 'กองการฝึก',
      subDepartment: 'แผนกวิชาการ',
      phone: '-',
      mobile: '-',
      email: 'commander@test.local',
    },
  });

  // User 3: Subordinate in Commander's department (กองการฝึก)
  const userSubordinate = await prisma.personnel.upsert({
    where: { badgeNo: 'TEST_SUBORDINATE' },
    update: {},
    create: {
      badgeNo: 'TEST_SUBORDINATE',
      username: 'test_subordinate',
      citizenId: '9000000000003',
      password: 'hash',
      role: 'OFFICER',
      prefix: 'ร.อ.',
      firstName: 'Subordinate',
      lastName: 'Officer',
      position: 'นายทหารยุทธการ',
      department: 'กองการฝึก',
      subDepartment: 'แผนกวิชาการ',
      phone: '-',
      mobile: '-',
      email: 'subordinate@test.local',
    },
  });

  // User 4: Personnel in another department (กองส่งกำลังบำรุง - Logistics)
  const userOtherDept = await prisma.personnel.upsert({
    where: { badgeNo: 'TEST_OTHER_DEPT' },
    update: {},
    create: {
      badgeNo: 'TEST_OTHER_DEPT',
      username: 'test_other_dept',
      citizenId: '9000000000004',
      password: 'hash',
      role: 'OFFICER',
      prefix: 'ร.ท.',
      firstName: 'Logistics',
      lastName: 'Officer',
      position: 'นายทหารส่งกำลัง',
      department: 'กองส่งกำลังบำรุง',
      subDepartment: '-',
      phone: '-',
      mobile: '-',
      email: 'logistics@test.local',
    },
  });

  // User 5: Super Admin
  const userSuperAdmin = await prisma.personnel.upsert({
    where: { badgeNo: 'TEST_SUPER_ADMIN_CMD' },
    update: {},
    create: {
      badgeNo: 'TEST_SUPER_ADMIN_CMD',
      username: 'test_super_admin_cmd',
      citizenId: '9000000000005',
      password: 'hash',
      role: 'SUPER_ADMIN',
      prefix: 'พล.ต.',
      firstName: 'Super',
      lastName: 'Admin',
      position: 'ผู้บัญชาการ',
      department: 'กองบัญชาการ',
      subDepartment: '-',
      phone: '-',
      mobile: '-',
      email: 'superadmin@test.local',
    },
  });

  const tokenRegular = await createToken(userRegular.id, 'USER', userRegular.citizenId);
  const tokenCommander = await createToken(userCommander.id, 'COMMANDER', userCommander.citizenId);
  const tokenSuperAdmin = await createToken(userSuperAdmin.id, 'SUPER_ADMIN', userSuperAdmin.citizenId);

  // Clean any pre-existing test leaves
  await prisma.leaveRecord.deleteMany({
    where: {
      personnelId: {
        in: [userRegular.id, userCommander.id, userSubordinate.id, userOtherDept.id, userSuperAdmin.id],
      },
    },
  });

  let leaveTestId: string | null = null;

  try {
    // ── 2. Test 1: Anonymous access rejection (401) ─────────────────────────────
  const resAnon = await fetch(`${BASE_URL}/api/dashboard/command`);
  assert.strictEqual(resAnon.status, 401, 'Anonymous request must return 401 Unauthorized');
  console.log('✔ Anonymous request correctly blocked with 401');

  // ── 3. Test 2: Regular USER role without VIEW_COMMAND_DASHBOARD (403) ───────
  const resForbidden = await fetch(`${BASE_URL}/api/dashboard/command`, {
    headers: { Cookie: `auth_token=${tokenRegular}` },
  });
  assert.strictEqual(resForbidden.status, 403, 'Regular user without permission must return 403 Forbidden');
  console.log('✔ Regular user without VIEW_COMMAND_DASHBOARD correctly blocked with 403');

  // ── 4. Test 3: SUPER_ADMIN Global Scope (200) ───────────────────────────────
  const resSuperAdmin = await fetch(`${BASE_URL}/api/dashboard/command`, {
    headers: { Cookie: `auth_token=${tokenSuperAdmin}` },
  });
  assert.strictEqual(resSuperAdmin.status, 200, 'SUPER_ADMIN must return 200');
  const dataSuperAdmin = await resSuperAdmin.json();
  assert.strictEqual(dataSuperAdmin.success, true);
  assert.strictEqual(dataSuperAdmin.scope.isGlobalViewer, true, 'SUPER_ADMIN must have global viewer scope');
  assert.ok(dataSuperAdmin.readiness.total >= 4, 'Global viewer should see all personnel across departments');
  console.log('✔ SUPER_ADMIN successfully accessed global command dashboard data');

  // ── 5. Test 4: COMMANDER Scoped Access & IDOR Prevention ────────────────────
  // Commander tries to query 'กองส่งกำลังบำรุง' (Logistics department)
  const resCommander = await fetch(`${BASE_URL}/api/dashboard/command?department=กองส่งกำลังบำรุง`, {
    headers: { Cookie: `auth_token=${tokenCommander}` },
  });
  assert.strictEqual(resCommander.status, 200, 'Commander should access their scoped dashboard');
  const dataCommander = await resCommander.json();
  assert.strictEqual(dataCommander.scope.isGlobalViewer, false, 'Commander must have scoped viewer role');
  assert.strictEqual(
    dataCommander.scope.effectiveDepartment,
    'กองการฝึก',
    'Commander must be locked strictly to their assigned department (กองการฝึก), ignoring query param'
  );
  console.log('✔ Unit Commander is strictly scoped to assigned department with anti-IDOR enforcement');

  // ── 6. Test 5: Active Leave Detection on Target Date ────────────────────────
  // Create an approved leave for subordinate spanning 2026-10-10 to 2026-10-15 (6 days)
  const leaveTest = await prisma.leaveRecord.create({
    data: {
      personnelId: userSubordinate.id,
      leaveType: 'ลาพักผ่อน',
      startDate: new Date('2026-10-10T00:00:00.000Z'),
      endDate: new Date('2026-10-15T23:59:59.999Z'),
      status: 'อนุมัติแล้ว',
      reason: 'ทดสอบการลาสำหรับ Command Dashboard',
    },
  });
  leaveTestId = leaveTest.id;

  // Query on target date = 2026-10-12 (within leave period)
  const resOnLeaveDate = await fetch(`${BASE_URL}/api/dashboard/command?date=2026-10-12`, {
    headers: { Cookie: `auth_token=${tokenSuperAdmin}` },
  });
  const dataOnLeaveDate = await resOnLeaveDate.json();
  const foundLeave = dataOnLeaveDate.activeLeaves.items.find((item: any) => item.id === leaveTest.id);
  assert.ok(foundLeave, 'Subordinate leave must be listed in active leaves on 2026-10-12');
  assert.strictEqual(foundLeave.personnel.firstName, 'Subordinate');
  assert.strictEqual(foundLeave.leaveType, 'ลาพักผ่อน');
  assert.strictEqual(foundLeave.totalDays, 6, 'Total leave duration should be 6 days');

  // Query on target date = 2026-10-25 (outside leave period)
  const resOutsideDate = await fetch(`${BASE_URL}/api/dashboard/command?date=2026-10-25`, {
    headers: { Cookie: `auth_token=${tokenSuperAdmin}` },
  });
  const dataOutsideDate = await resOutsideDate.json();
  const notFoundLeave = dataOutsideDate.activeLeaves.items.find((item: any) => item.id === leaveTest.id);
  assert.strictEqual(notFoundLeave, undefined, 'Leave must NOT be listed on dates outside leave period');
  console.log('✔ Active leave date-range filtering and duration calculations verified accurately');

  // ── 7. Test 6: Leave Quota & Balance Calculations from Database Policy ──────
  const resLeaveSummary = await fetch(
    `${BASE_URL}/api/dashboard/command?year=2026&leaveSummaryType=ลาพักผ่อน&leaveSummarySearch=Subordinate`,
    {
      headers: { Cookie: `auth_token=${tokenSuperAdmin}` },
    }
  );
  const dataLeaveSummary = await resLeaveSummary.json();
  const subordinateSummary = dataLeaveSummary.leaveSummary.items.find(
    (item: any) => item.personnel.id === userSubordinate.id
  );
  assert.ok(subordinateSummary, 'Subordinate leave summary must be found');
  assert.strictEqual(subordinateSummary.quota, 10, 'Default quota for ลาพักผ่อน must be 10 days');
  assert.strictEqual(subordinateSummary.usedApprovedDays, 6, 'Used approved days in 2026 must be 6');
  assert.strictEqual(subordinateSummary.remainingDays, 4, 'Remaining days must be 10 - 6 = 4 days');
  console.log('✔ Database leavePolicy quota and remaining balance calculations verified accurately');
  } finally {
    // ── 8. Cleanup Test Records ────────────────────────────────────────────────
    if (leaveTestId) {
      await prisma.leaveRecord.deleteMany({
        where: { id: leaveTestId },
      });
    }
    await prisma.personnel.deleteMany({
      where: {
        id: {
          in: [
            userRegular.id,
            userCommander.id,
            userSubordinate.id,
            userOtherDept.id,
            userSuperAdmin.id,
          ],
        },
      },
    });
    console.log('✔ Test cleanup completed successfully');
  }
}

if (require.main === module) {
  runCommandDashboardTests()
    .then(() => {
      console.log('All command dashboard tests passed!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Command dashboard test failed:', err);
      process.exit(1);
    });
}
