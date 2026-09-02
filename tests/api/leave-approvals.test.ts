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

export async function runLeaveApprovalsTests() {
  console.log('\n--- Running Leave Approvals Management Tests (v1.3.0) ---');

  const testPersonnelIds: string[] = [];
  const testLeaveIds: string[] = [];

  try {
    // ── 1. Setup Test Personnel ───────────────────────────────────────────────
    // User 1: Regular Officer (No APPROVE_LEAVE)
    const userOfficer = await prisma.personnel.upsert({
      where: { badgeNo: 'TEST_LA_OFFICER' },
      update: {},
      create: {
        badgeNo: 'TEST_LA_OFFICER',
        username: 'test_la_officer',
        citizenId: '9200000000001',
        password: 'hash',
        role: 'OFFICER',
        prefix: 'ส.ต.',
        firstName: 'Officer',
        lastName: 'Regular',
        position: 'เจ้าหน้าที่ธุรการ',
        department: 'กองการฝึก',
        subDepartment: 'แผนกวิชาการ',
        phone: '0811111111',
        mobile: '0811111111',
        email: 'la_officer@test.local',
      },
    });
    testPersonnelIds.push(userOfficer.id);

    // User 2: Sub-Unit Commander (COMMANDER: กองการฝึก / แผนกวิชาการ)
    const userSubCommander = await prisma.personnel.upsert({
      where: { badgeNo: 'TEST_LA_SUB_CMD' },
      update: {},
      create: {
        badgeNo: 'TEST_LA_SUB_CMD',
        username: 'test_la_sub_cmd',
        citizenId: '9200000000002',
        password: 'hash',
        role: 'COMMANDER',
        prefix: 'พ.ต.',
        firstName: 'Sub',
        lastName: 'CommanderLA',
        position: 'หัวหน้าแผนกวิชาการ',
        department: 'กองการฝึก',
        subDepartment: 'แผนกวิชาการ',
        phone: '0822222222',
        mobile: '0822222222',
        email: 'la_sub_cmd@test.local',
      },
    });
    testPersonnelIds.push(userSubCommander.id);

    // User 3: Officer in another sub-unit (กองการฝึก / แผนกธุรการ)
    const userOtherSubOfficer = await prisma.personnel.upsert({
      where: { badgeNo: 'TEST_LA_OTHER_SUB' },
      update: {},
      create: {
        badgeNo: 'TEST_LA_OTHER_SUB',
        username: 'test_la_other_sub',
        citizenId: '9200000000003',
        password: 'hash',
        role: 'OFFICER',
        prefix: 'จ.ส.อ.',
        firstName: 'OtherSub',
        lastName: 'OfficerLA',
        position: 'เจ้าหน้าที่กำลังพล',
        department: 'กองการฝึก',
        subDepartment: 'แผนกธุรการ',
        phone: '0833333333',
        mobile: '0833333333',
        email: 'la_other_sub@test.local',
      },
    });
    testPersonnelIds.push(userOtherSubOfficer.id);

    // User 4: Super Admin
    const userSuperAdmin = await prisma.personnel.upsert({
      where: { badgeNo: 'TEST_LA_SUPER' },
      update: {},
      create: {
        badgeNo: 'TEST_LA_SUPER',
        username: 'test_la_super',
        citizenId: '9200000000004',
        password: 'hash',
        role: 'SUPER_ADMIN',
        prefix: 'พล.ต.',
        firstName: 'Super',
        lastName: 'AdminLA',
        position: 'ผู้บัญชาการ',
        department: 'กองบัญชาการ',
        subDepartment: '-',
        phone: '0844444444',
        mobile: '0844444444',
        email: 'la_super@test.local',
      },
    });
    testPersonnelIds.push(userSuperAdmin.id);

    const tokenOfficer = await createToken(userOfficer.id, 'OFFICER', userOfficer.citizenId);
    const tokenSubCommander = await createToken(userSubCommander.id, 'COMMANDER', userSubCommander.citizenId);
    const tokenSuperAdmin = await createToken(userSuperAdmin.id, 'SUPER_ADMIN', userSuperAdmin.citizenId);

    // ── 2. Setup Test Leave Records ───────────────────────────────────────────
    // Leave 1: Submitted by Academic Officer (userOfficer) -> In SubCommander's scope
    const leaveAcademic = await prisma.leaveRecord.create({
      data: {
        personnelId: userOfficer.id,
        leaveType: 'ลาพักผ่อน',
        startDate: new Date('2026-10-01T00:00:00.000Z'),
        endDate: new Date('2026-10-03T23:59:59.999Z'),
        reason: 'พักผ่อนประจำปี',
        status: 'รออนุมัติ',
      },
    });
    testLeaveIds.push(leaveAcademic.id);

    // Leave 2: Submitted by Admin Sub-unit Officer (userOtherSubOfficer) -> Outside SubCommander's scope
    const leaveAdminSub = await prisma.leaveRecord.create({
      data: {
        personnelId: userOtherSubOfficer.id,
        leaveType: 'ลากิจ',
        startDate: new Date('2026-10-05T00:00:00.000Z'),
        endDate: new Date('2026-10-06T23:59:59.999Z'),
        reason: 'ติดต่อราชการส่วนตัว',
        status: 'รออนุมัติ',
      },
    });
    testLeaveIds.push(leaveAdminSub.id);

    // Leave 3: Submitted by SubCommander himself -> To test Self-Approval rejection
    const leaveSelf = await prisma.leaveRecord.create({
      data: {
        personnelId: userSubCommander.id,
        leaveType: 'ลาพักผ่อน',
        startDate: new Date('2026-10-10T00:00:00.000Z'),
        endDate: new Date('2026-10-12T23:59:59.999Z'),
        reason: 'ลากิจธุระ',
        status: 'รออนุมัติ',
      },
    });
    testLeaveIds.push(leaveSelf.id);

    // ── 3. Test 1: Anonymous Access (401) ─────────────────────────────────────
    const resAnon = await fetch(`${BASE_URL}/api/leaves/approvals`);
    assert.strictEqual(resAnon.status, 401, 'Anonymous request must return 401 Unauthorized');
    console.log('✔ Anonymous request correctly blocked with 401');

    // ── 4. Test 2: Regular Officer Without APPROVE_LEAVE (403) ────────────────
    const resOfficerGet = await fetch(`${BASE_URL}/api/leaves/approvals`, {
      headers: { Cookie: `auth_token=${tokenOfficer}` },
    });
    assert.strictEqual(resOfficerGet.status, 403, 'Regular officer without APPROVE_LEAVE must return 403');

    const resOfficerApprove = await fetch(`${BASE_URL}/api/leaves/${leaveAcademic.id}/approve`, {
      method: 'POST',
      headers: { Cookie: `auth_token=${tokenOfficer}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: 'Unauthorized attempt' }),
    });
    assert.strictEqual(resOfficerApprove.status, 403, 'Regular officer cannot approve leaves');
    console.log('✔ Regular officer without APPROVE_LEAVE blocked with 403 on GET & POST');

    // ── 5. Test 3: Sub-Commander Scoping on GET /api/leaves/approvals ─────────
    const resSubCmdGet = await fetch(`${BASE_URL}/api/leaves/approvals`, {
      headers: { Cookie: `auth_token=${tokenSubCommander}` },
    });
    assert.strictEqual(resSubCmdGet.status, 200);
    const dataSubCmd = await resSubCmdGet.json();
    assert.strictEqual(dataSubCmd.success, true);
    assert.strictEqual(dataSubCmd.scope.userRole, 'COMMANDER');
    assert.strictEqual(dataSubCmd.scope.effectiveDepartment, 'กองการฝึก');
    assert.strictEqual(dataSubCmd.scope.effectiveSubDepartment, 'แผนกวิชาการ');

    // Must contain leaveAcademic (Academic sub-unit), must NOT contain leaveAdminSub (Admin sub-unit)
    const foundAcademic = dataSubCmd.items.some((i: any) => i.id === leaveAcademic.id);
    const foundAdminSub = dataSubCmd.items.some((i: any) => i.id === leaveAdminSub.id);
    assert.strictEqual(foundAcademic, true, 'SubCommander must see subordinates in their assigned sub-unit');
    assert.strictEqual(foundAdminSub, false, 'SubCommander must NOT see personnel outside their sub-unit');
    console.log('✔ Sub-department COMMANDER is strictly locked to assigned sub-unit on approvals query');

    // ── 6. Test 4: Scope Protection on POST Approve/Reject (403) ──────────────
    // SubCommander attempts to approve leave from Admin sub-unit (outside scope)
    const resCrossUnitApprove = await fetch(`${BASE_URL}/api/leaves/${leaveAdminSub.id}/approve`, {
      method: 'POST',
      headers: { Cookie: `auth_token=${tokenSubCommander}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: 'Cross unit attempt' }),
    });
    assert.strictEqual(resCrossUnitApprove.status, 403, 'COMMANDER cannot approve leave outside their sub-unit');
    console.log('✔ Cross-unit approval correctly rejected with 403 Forbidden');

    // ── 7. Test 5: Self-Approval Prevention (403) ─────────────────────────────
    const resSelfApprove = await fetch(`${BASE_URL}/api/leaves/${leaveSelf.id}/approve`, {
      method: 'POST',
      headers: { Cookie: `auth_token=${tokenSubCommander}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: 'Self approve attempt' }),
    });
    assert.strictEqual(resSelfApprove.status, 403, 'Self-approval must be rejected with 403');
    const selfApproveErr = await resSelfApprove.json();
    assert.ok(selfApproveErr.error.includes('ไม่อนุญาตให้อนุมัติใบลาของตนเอง'));
    console.log('✔ Self-approval strictly blocked with 403 Forbidden');

    // ── 8. Test 6: Successful Approve Action (200 + Notification + AuditLog) ──
    const resValidApprove = await fetch(`${BASE_URL}/api/leaves/${leaveAcademic.id}/approve`, {
      method: 'POST',
      headers: { Cookie: `auth_token=${tokenSubCommander}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: 'อนุมัติเรียบร้อย ปฏิบัติหน้าที่ได้' }),
    });
    assert.strictEqual(resValidApprove.status, 200);
    const approveJson = await resValidApprove.json();
    assert.strictEqual(approveJson.success, true);

    // Verify DB update
    const updatedLeave = await prisma.leaveRecord.findUnique({ where: { id: leaveAcademic.id } });
    assert.strictEqual(updatedLeave?.status, 'อนุมัติแล้ว');
    assert.strictEqual(updatedLeave?.approvedById, userSubCommander.id);
    assert.strictEqual(updatedLeave?.approvalNote, 'อนุมัติเรียบร้อย ปฏิบัติหน้าที่ได้');
    assert.ok(updatedLeave?.approvedAt, 'approvedAt must be set');

    // Verify Notification sent to applicant
    const notification = await prisma.notification.findFirst({
      where: { personnelId: userOfficer.id, title: { contains: 'ได้รับการอนุมัติแล้ว' } },
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(notification, 'Notification must be created for applicant');

    // Verify AuditLog written
    const audit = await prisma.auditLog.findFirst({
      where: { entityId: leaveAcademic.id, action: 'LEAVE_APPROVED' },
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(audit, 'AuditLog must be recorded for LEAVE_APPROVED');
    console.log('✔ Approve action successfully updated status, recorded approver, sent notification, and logged audit');

    // ── 9. Test 7: Concurrency / Non-pending Conflict (409) ───────────────────
    // Re-attempting to approve an already approved leave must return 409
    const resDuplicateApprove = await fetch(`${BASE_URL}/api/leaves/${leaveAcademic.id}/approve`, {
      method: 'POST',
      headers: { Cookie: `auth_token=${tokenSubCommander}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: 'Duplicate attempt' }),
    });
    assert.strictEqual(resDuplicateApprove.status, 409, 'Duplicate approval on non-pending leave must return 409 Conflict');
    console.log('✔ Atomic concurrency protection verified: non-pending status returns 409 Conflict');

    // ── 10. Test 8: Reject Action (Validation + Execution + Notification) ─────
    // Sub-test 8a: Reject without reason -> 400
    const resRejectNoReason = await fetch(`${BASE_URL}/api/leaves/${leaveAdminSub.id}/reject`, {
      method: 'POST',
      headers: { Cookie: `auth_token=${tokenSuperAdmin}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: '' }),
    });
    assert.strictEqual(resRejectNoReason.status, 400, 'Rejection without reason must return 400');

    // Sub-test 8b: Valid Reject by Super Admin
    const resValidReject = await fetch(`${BASE_URL}/api/leaves/${leaveAdminSub.id}/reject`, {
      method: 'POST',
      headers: { Cookie: `auth_token=${tokenSuperAdmin}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'ติดภารกิจราชการเร่งด่วน', note: 'ขอให้เลื่อนไปสัปดาห์ถัดไป' }),
    });
    assert.strictEqual(resValidReject.status, 200);

    const rejectedLeave = await prisma.leaveRecord.findUnique({ where: { id: leaveAdminSub.id } });
    assert.strictEqual(rejectedLeave?.status, 'ไม่อนุมัติ');
    assert.strictEqual(rejectedLeave?.rejectionReason, 'ติดภารกิจราชการเร่งด่วน');
    assert.strictEqual(rejectedLeave?.approvedById, userSuperAdmin.id);

    // Verify Rejection Notification
    const rejectNotif = await prisma.notification.findFirst({
      where: { personnelId: userOtherSubOfficer.id, title: { contains: 'ไม่ได้รับการอนุมัติ' } },
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(rejectNotif, 'Rejection notification must be created for applicant');

    // Verify Rejection AuditLog
    const rejectAudit = await prisma.auditLog.findFirst({
      where: { entityId: leaveAdminSub.id, action: 'LEAVE_REJECTED' },
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(rejectAudit, 'AuditLog must be recorded for LEAVE_REJECTED');
    console.log('✔ Reject action validated reason requirement, updated status to ไม่อนุมัติ, sent notification, and logged audit');

    // ── 11. Test 9: Super Admin Self-Approval Allowed with Audit Flag ─────────
    // Super Admin submits own leave
    const leaveSuperSelf = await prisma.leaveRecord.create({
      data: {
        personnelId: userSuperAdmin.id,
        leaveType: 'ลาพักผ่อน',
        startDate: new Date('2026-11-01T00:00:00.000Z'),
        endDate: new Date('2026-11-02T23:59:59.999Z'),
        reason: 'พักผ่อน',
        status: 'รออนุมัติ',
      },
    });
    testLeaveIds.push(leaveSuperSelf.id);

    const resSuperSelfApprove = await fetch(`${BASE_URL}/api/leaves/${leaveSuperSelf.id}/approve`, {
      method: 'POST',
      headers: { Cookie: `auth_token=${tokenSuperAdmin}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: 'Super admin self approval' }),
    });
    assert.strictEqual(resSuperSelfApprove.status, 200, 'SUPER_ADMIN self-approval must be allowed');

    const superAudit = await prisma.auditLog.findFirst({
      where: { entityId: leaveSuperSelf.id, action: 'LEAVE_APPROVED' },
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(superAudit, 'Audit log must exist for SUPER_ADMIN self approval');
    assert.ok(superAudit.details?.includes('"selfApproval":true'), 'Audit log must flag selfApproval: true');
    console.log('✔ SUPER_ADMIN self-approval permitted and explicitly audited with selfApproval: true');

    // ── 12. Test 10: Query Filters & Pagination ───────────────────────────────
    const resFilter = await fetch(`${BASE_URL}/api/leaves/approvals?status=อนุมัติแล้ว&limit=5&page=1`, {
      headers: { Cookie: `auth_token=${tokenSuperAdmin}` },
    });
    assert.strictEqual(resFilter.status, 200);
    const filterData = await resFilter.json();
    assert.ok(filterData.items.length >= 2, 'Should return approved leaves');
    assert.ok(filterData.summary.totalInScope >= 3, 'Summary KPI totalInScope must be counted');
    console.log('✔ Query filters, status filter, and KPI summary counters successfully verified');
  } finally {
    // ── 13. Cleanup Test Data ─────────────────────────────────────────────────
    if (testLeaveIds.length > 0) {
      await prisma.notification.deleteMany({
        where: { personnelId: { in: testPersonnelIds } },
      });
      await prisma.auditLog.deleteMany({
        where: { entityId: { in: testLeaveIds } },
      });
      await prisma.leaveRecord.deleteMany({
        where: { id: { in: testLeaveIds } },
      });
    }
    if (testPersonnelIds.length > 0) {
      await prisma.personnel.deleteMany({
        where: { id: { in: testPersonnelIds } },
      });
    }
    console.log('✔ All test records cleaned up successfully');
  }
}

if (require.main === module) {
  runLeaveApprovalsTests()
    .then(() => {
      console.log('All leave approval tests passed!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Leave approval test failed:', err);
      process.exit(1);
    });
}
