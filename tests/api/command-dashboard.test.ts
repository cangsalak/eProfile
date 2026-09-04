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

  // User 2: Sub-Unit Commander (COMMANDER) - Department = กองการฝึก, SubDept = แผนกวิชาการ
  const userSubCommander = await prisma.personnel.upsert({
    where: { badgeNo: 'TEST_SUB_COMMANDER' },
    update: {},
    create: {
      badgeNo: 'TEST_SUB_COMMANDER',
      username: 'test_sub_commander',
      citizenId: '9000000000002',
      password: 'hash',
      role: 'COMMANDER',
      prefix: 'พ.ท.',
      firstName: 'Sub',
      lastName: 'Commander',
      position: 'หัวหน้าแผนกวิชาการ',
      department: 'กองการฝึก',
      subDepartment: 'แผนกวิชาการ',
      phone: '-',
      mobile: '-',
      email: 'subcommander@test.local',
    },
  });

  // User 3: Subordinate in แผนกวิชาการ (same subDept as SubCommander)
  const userSubordinateAcademic = await prisma.personnel.upsert({
    where: { badgeNo: 'TEST_SUBORDINATE_ACAD' },
    update: {},
    create: {
      badgeNo: 'TEST_SUBORDINATE_ACAD',
      username: 'test_subordinate_acad',
      citizenId: '9000000000003',
      password: 'hash',
      role: 'OFFICER',
      prefix: 'ร.อ.',
      firstName: 'Academic',
      lastName: 'Officer',
      position: 'นายทหารวิชาการ',
      department: 'กองการฝึก',
      subDepartment: 'แผนกวิชาการ',
      phone: '-',
      mobile: '-',
      email: 'academic@test.local',
    },
  });

  // User 4: Subordinate in แผนกธุรการ (same department กองการฝึก, but DIFFERENT subDept)
  const userSubordinateAdmin = await prisma.personnel.upsert({
    where: { badgeNo: 'TEST_SUBORDINATE_ADM' },
    update: {},
    create: {
      badgeNo: 'TEST_SUBORDINATE_ADM',
      username: 'test_subordinate_adm',
      citizenId: '9000000000004',
      password: 'hash',
      role: 'OFFICER',
      prefix: 'ร.ท.',
      firstName: 'Admin',
      lastName: 'Officer',
      position: 'นายทหารธุรการ',
      department: 'กองการฝึก',
      subDepartment: 'แผนกธุรการ',
      phone: '-',
      mobile: '-',
      email: 'admin_officer@test.local',
    },
  });

  // User 5: Department Commander (DEPARTMENT_COMMANDER) - Department = กองการฝึก (whole dept)
  const userDeptCommander = await prisma.personnel.upsert({
    where: { badgeNo: 'TEST_DEPT_COMMANDER' },
    update: {},
    create: {
      badgeNo: 'TEST_DEPT_COMMANDER',
      username: 'test_dept_commander',
      citizenId: '9000000000005',
      password: 'hash',
      role: 'DEPARTMENT_COMMANDER',
      prefix: 'พ.อ.',
      firstName: 'Dept',
      lastName: 'Commander',
      position: 'ผู้บังคับกองการฝึก',
      department: 'กองการฝึก',
      subDepartment: '-',
      phone: '-',
      mobile: '-',
      email: 'deptcommander@test.local',
    },
  });

  // User 6: Personnel in another department (กองส่งกำลังบำรุง)
  const userOtherDept = await prisma.personnel.upsert({
    where: { badgeNo: 'TEST_OTHER_DEPT' },
    update: {},
    create: {
      badgeNo: 'TEST_OTHER_DEPT',
      username: 'test_other_dept',
      citizenId: '9000000000006',
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

  // User 7: Super Admin
  const userSuperAdmin = await prisma.personnel.upsert({
    where: { badgeNo: 'TEST_SUPER_ADMIN_CMD' },
    update: {},
    create: {
      badgeNo: 'TEST_SUPER_ADMIN_CMD',
      username: 'test_super_admin_cmd',
      citizenId: '9000000000007',
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

  const testPersonnelIds = [
    userRegular.id,
    userSubCommander.id,
    userSubordinateAcademic.id,
    userSubordinateAdmin.id,
    userDeptCommander.id,
    userOtherDept.id,
    userSuperAdmin.id,
  ];

  const tokenRegular = await createToken(userRegular.id, 'USER', userRegular.citizenId);
  const tokenSubCommander = await createToken(userSubCommander.id, 'COMMANDER', userSubCommander.citizenId);
  const tokenDeptCommander = await createToken(userDeptCommander.id, 'DEPARTMENT_COMMANDER', userDeptCommander.citizenId);
  const tokenSuperAdmin = await createToken(userSuperAdmin.id, 'SUPER_ADMIN', userSuperAdmin.citizenId);

  // Clean any pre-existing test leaves
  await prisma.leaveRecord.deleteMany({
    where: { personnelId: { in: testPersonnelIds } },
  });

  const createdLeaveIds: string[] = [];
  const multiPagePersonnelIds: string[] = [];

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

    // ── 4. Test 3: Query Input Validation (400) ─────────────────────────────────
    // Invalid date format
    const resInvalidDate = await fetch(`${BASE_URL}/api/dashboard/command?date=invalid-date`, {
      headers: { Cookie: `auth_token=${tokenSuperAdmin}` },
    });
    assert.strictEqual(resInvalidDate.status, 400, 'Invalid date format must return 400 Bad Request');

    const resSlashDate = await fetch(`${BASE_URL}/api/dashboard/command?date=2026/09/02`, {
      headers: { Cookie: `auth_token=${tokenSuperAdmin}` },
    });
    assert.strictEqual(resSlashDate.status, 400, 'Slash date format must return 400 Bad Request');

    // Invalid year format
    const resInvalidYear = await fetch(`${BASE_URL}/api/dashboard/command?year=9999`, {
      headers: { Cookie: `auth_token=${tokenSuperAdmin}` },
    });
    assert.strictEqual(resInvalidYear.status, 400, 'Out-of-range year must return 400 Bad Request');

    // Invalid leave type
    const resInvalidType = await fetch(`${BASE_URL}/api/dashboard/command?leaveSummaryType=invalid-leave-type`, {
      headers: { Cookie: `auth_token=${tokenSuperAdmin}` },
    });
    assert.strictEqual(resInvalidType.status, 400, 'Unrecognized leave type must return 400 Bad Request');
    console.log('✔ Strict query input validation (date, year, leaveSummaryType) verified with 400');

    // ── 5. Test 4: SUPER_ADMIN Global Scope (200) ───────────────────────────────
    const resSuperAdmin = await fetch(`${BASE_URL}/api/dashboard/command`, {
      headers: { Cookie: `auth_token=${tokenSuperAdmin}` },
    });
    assert.strictEqual(resSuperAdmin.status, 200, 'SUPER_ADMIN must return 200');
    const dataSuperAdmin = await resSuperAdmin.json();
    assert.strictEqual(dataSuperAdmin.success, true);
    assert.strictEqual(dataSuperAdmin.scope.isGlobalViewer, true, 'SUPER_ADMIN must have global viewer scope');
    console.log('✔ SUPER_ADMIN successfully accessed global command dashboard data');

    // ── 6. Test 5: Sub-department Commander Scoping (P1 Fix) ────────────────────
    // Sub-department commander (แผนกวิชาการ) MUST NOT see personnel from แผนกธุรการ
    const resSubCommander = await fetch(`${BASE_URL}/api/dashboard/command?includeSubDepartments=true`, {
      headers: { Cookie: `auth_token=${tokenSubCommander}` },
    });
    assert.strictEqual(resSubCommander.status, 200);
    const dataSubCommander = await resSubCommander.json();
    assert.strictEqual(dataSubCommander.scope.effectiveDepartment, 'กองการฝึก');
    assert.strictEqual(dataSubCommander.scope.effectiveSubDepartment, 'แผนกวิชาการ');

    // Check personnel in leave summary: should include userSubCommander & userSubordinateAcademic, but NOT userSubordinateAdmin
    const subCommanderFoundAcademic = dataSubCommander.leaveSummary.items.some(
      (p: any) => p.personnel.id === userSubordinateAcademic.id
    );
    const subCommanderFoundAdmin = dataSubCommander.leaveSummary.items.some(
      (p: any) => p.personnel.id === userSubordinateAdmin.id
    );
    assert.strictEqual(subCommanderFoundAcademic, true, 'Sub-commander must see personnel in their sub-unit');
    assert.strictEqual(subCommanderFoundAdmin, false, 'Sub-commander must NOT see personnel in other sub-units');
    console.log('✔ Sub-department COMMANDER is strictly locked to assigned sub-unit');

    // ── 7. Test 6: Department Commander Scoping (P1 Fix) ────────────────────────
    // Department commander (กองการฝึก) MUST see all sub-departments (วิชาการ and ธุรการ)
    const resDeptCommander = await fetch(`${BASE_URL}/api/dashboard/command`, {
      headers: { Cookie: `auth_token=${tokenDeptCommander}` },
    });
    assert.strictEqual(resDeptCommander.status, 200);
    const dataDeptCommander = await resDeptCommander.json();
    assert.strictEqual(dataDeptCommander.scope.effectiveDepartment, 'กองการฝึก');

    const deptFoundAcademic = dataDeptCommander.leaveSummary.items.some(
      (p: any) => p.personnel.id === userSubordinateAcademic.id
    );
    const deptFoundAdmin = dataDeptCommander.leaveSummary.items.some(
      (p: any) => p.personnel.id === userSubordinateAdmin.id
    );
    assert.strictEqual(deptFoundAcademic, true, 'Department commander must see academic sub-unit');
    assert.strictEqual(deptFoundAdmin, true, 'Department commander must see admin sub-unit');
    console.log('✔ DEPARTMENT_COMMANDER sees all sub-departments across the department');

    // ── 8. Test 7: Active Leave Date Range & Cross-Year Calculation (P1 Fix) ───
    // Create cross-year leave: 2025-12-28 to 2026-01-04 (8 total calendar days: 4 in 2025, 4 in 2026)
    const crossYearLeave = await prisma.leaveRecord.create({
      data: {
        personnelId: userSubordinateAcademic.id,
        leaveType: 'ลาพักผ่อน',
        startDate: new Date('2025-12-28T00:00:00.000Z'),
        endDate: new Date('2026-01-04T23:59:59.999Z'),
        status: 'อนุมัติแล้ว',
        reason: 'ทดสอบการลาข้ามปี 2025-2026',
      },
    });
    createdLeaveIds.push(crossYearLeave.id);

    // Active leave check on 2026-01-02
    const resActiveCrossYear = await fetch(`${BASE_URL}/api/dashboard/command?date=2026-01-02`, {
      headers: { Cookie: `auth_token=${tokenSuperAdmin}` },
    });
    const dataActiveCrossYear = await resActiveCrossYear.json();
    const foundCrossYearActive = dataActiveCrossYear.activeLeaves.items.find(
      (item: any) => item.id === crossYearLeave.id
    );
    assert.ok(foundCrossYearActive, 'Cross-year leave must be detected as active on 2026-01-02');
    assert.strictEqual(foundCrossYearActive.totalDays, 8, 'Total duration of cross-year leave should be 8 days');

    // Leave Summary check in Year 2026: must count ONLY the 4 days falling in 2026 (Jan 1, 2, 3, 4)
    const resSummary2026 = await fetch(
      `${BASE_URL}/api/dashboard/command?year=2026&leaveSummaryType=ลาพักผ่อน&leaveSummarySearch=Academic`,
      {
        headers: { Cookie: `auth_token=${tokenSuperAdmin}` },
      }
    );
    const dataSummary2026 = await resSummary2026.json();
    const acadSummary2026 = dataSummary2026.leaveSummary.items.find(
      (item: any) => item.personnel.id === userSubordinateAcademic.id
    );
    assert.ok(acadSummary2026, 'Academic officer leave summary in 2026 must be found');
    assert.strictEqual(acadSummary2026.usedApprovedDays, 4, 'Used approved days in 2026 must strictly be 4 days');
    assert.strictEqual(acadSummary2026.remainingDays, 6, 'Remaining days in 2026 must be 10 - 4 = 6 days');

    // Leave Summary check in Year 2025: must count ONLY the 4 days falling in 2025 (Dec 28, 29, 30, 31)
    const resSummary2025 = await fetch(
      `${BASE_URL}/api/dashboard/command?year=2025&leaveSummaryType=ลาพักผ่อน&leaveSummarySearch=Academic`,
      {
        headers: { Cookie: `auth_token=${tokenSuperAdmin}` },
      }
    );
    const dataSummary2025 = await resSummary2025.json();
    const acadSummary2025 = dataSummary2025.leaveSummary.items.find(
      (item: any) => item.personnel.id === userSubordinateAcademic.id
    );
    assert.ok(acadSummary2025, 'Academic officer leave summary in 2025 must be found');
    assert.strictEqual(acadSummary2025.usedApprovedDays, 4, 'Used approved days in 2025 must strictly be 4 days');
    console.log('✔ Cross-year leave date overlap accurately calculated per year (4 days in 2025, 4 days in 2026)');

    // ── 9. Test 8: Pagination Totals Over Whole Unit Scope (P1 Fix) ────────────
    // Create 15 personnel in a distinct department 'กองสถิติทดสอบ'
    for (let i = 1; i <= 15; i++) {
      const p = await prisma.personnel.create({
        data: {
          badgeNo: `TEST_PAGINATED_${i.toString().padStart(3, '0')}`,
          username: `test_paginated_${i}`,
          citizenId: `91000000000${i.toString().padStart(2, '0')}`,
          password: 'hash',
          role: 'OFFICER',
          prefix: 'ส.อ.',
          firstName: `Staff${i}`,
          lastName: 'PaginationTest',
          position: 'เจ้าหน้าที่',
          department: 'กองสถิติทดสอบ',
          subDepartment: '-',
          phone: '-',
          mobile: '-',
          email: `paginated${i}@test.local`,
        },
      });
      multiPagePersonnelIds.push(p.id);
    }

    // Query page 1 with limit = 5
    const resPagination = await fetch(
      `${BASE_URL}/api/dashboard/command?department=กองสถิติทดสอบ&leaveSummaryLimit=5&leaveSummaryPage=1&leaveSummaryType=ลาพักผ่อน`,
      {
        headers: { Cookie: `auth_token=${tokenSuperAdmin}` },
      }
    );
    assert.strictEqual(resPagination.status, 200);
    const dataPagination = await resPagination.json();

    assert.strictEqual(dataPagination.leaveSummary.items.length, 5, 'Page 1 must contain exactly 5 items');
    assert.strictEqual(dataPagination.leaveSummary.pagination.total, 15, 'Total personnel count must be 15');
    assert.strictEqual(dataPagination.leaveSummary.pagination.totalPages, 3, 'Total pages must be 3');

    // Verify realistic unit metrics in totals banner across whole scope (15 personnel)
    assert.strictEqual(
      dataPagination.leaveSummary.totals.policyQuota,
      10,
      'Policy quota per person must be 10 days/person'
    );
    assert.strictEqual(
      dataPagination.leaveSummary.totals.totalPersonnel,
      15,
      'Total personnel count in scope must be 15'
    );
    assert.strictEqual(
      dataPagination.leaveSummary.totals.totalUsedApproved,
      0,
      'Total used approved days across scope must be 0'
    );
    assert.strictEqual(
      dataPagination.leaveSummary.totals.utilizationRate,
      0,
      'Utilization rate across scope must be 0%'
    );
    console.log('✔ Pagination totals correctly report realistic unit metrics (policyQuota: 10 days/person, totalPersonnel: 15) across all 3 pages');
  } finally {
    // ── 10. Cleanup Test Records ───────────────────────────────────────────────
    if (createdLeaveIds.length > 0) {
      await prisma.leaveRecord.deleteMany({
        where: { id: { in: createdLeaveIds } },
      });
    }
    const allIdsToClean = [...testPersonnelIds, ...multiPagePersonnelIds];
    await prisma.leaveRecord.deleteMany({
      where: { personnelId: { in: allIdsToClean } },
    });
    await prisma.personnel.deleteMany({
      where: { id: { in: allIdsToClean } },
    });
    console.log('✔ All test records cleaned up successfully');
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
