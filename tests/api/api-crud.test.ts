import assert from 'assert';
import { SignJWT } from 'jose';
import { prisma } from '../../src/lib/prisma';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'eprofile-super-secret-jwt-key-2026-change-in-production';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

async function makeToken(id: string, role: string, username: string): Promise<string> {
  return await new SignJWT({ id, role, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2h')
    .setIssuedAt()
    .sign(encodedSecret);
}

export async function runApiCrudTests() {
  console.log('\n--- Running API CRUD & Business Logic Tests ---');

  const admin = await prisma.personnel.findFirst({
    where: { role: 'SUPER_ADMIN', NOT: [{ id: 'ADMIN' }, { id: 'ALL' }] }
  }) || await prisma.personnel.findFirst({
    where: { role: 'ADMIN', NOT: [{ id: 'ADMIN' }, { id: 'ALL' }] }
  });

  assert.ok(admin, 'Admin must exist in DB for test');
  const adminToken = await makeToken(admin.id, admin.role, admin.username);

  // 1. Personnel CRUD Flow
  let createdPersonnelId = '';
  const testBadgeNo = `TEST-${Date.now().toString().slice(-6)}`;
  const testCitizenId = `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`;

  {
    // CREATE
    const createRes = await fetch(`${BASE_URL}/api/personnel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${adminToken}`,
      },
      body: JSON.stringify({
        badgeNo: testBadgeNo,
        username: testCitizenId,
        citizenId: testCitizenId,
        prefix: 'นาย',
        firstName: 'ทดสอบ',
        lastName: 'ระบบซีอาร์ยูดี',
        position: 'นักวิชาการคอมพิวเตอร์',
        department: 'สำนักเทคโนโลยีสารสนเทศ',
        subDepartment: 'ฝ่ายพัฒนาระบบ',
        personnelType: 'พนักงานราชการ',
        phone: '02-123-4567',
        mobile: '089-123-4567',
        email: 'test_crud@domain.com',
        role: 'USER',
      }),
    });

    assert.strictEqual(createRes.status, 201, `Personnel creation should return 201 (got ${createRes.status})`);
    const createdData = await createRes.json();
    assert.ok(createdData.id, 'Created personnel must have an ID');
    assert.strictEqual(createdData.firstName, 'ทดสอบ');
    assert.strictEqual(createdData.password, undefined, 'Password must not be returned');
    createdPersonnelId = createdData.id;

    // READ
    const getRes = await fetch(`${BASE_URL}/api/personnel/${createdPersonnelId}`, {
      headers: { 'Cookie': `auth_token=${adminToken}` },
    });
    assert.strictEqual(getRes.status, 200, 'Fetching created personnel should return 200');
    const getData = await getRes.json();
    assert.strictEqual(getData.id, createdPersonnelId);
    assert.strictEqual(getData.password, undefined, 'Password should not leak on GET');

    // UPDATE
    const updateRes = await fetch(`${BASE_URL}/api/personnel/${createdPersonnelId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${adminToken}`,
      },
      body: JSON.stringify({
        position: 'หัวหน้าฝ่ายพัฒนาระบบ',
        phone: '02-999-9999',
      }),
    });
    assert.strictEqual(updateRes.status, 200, 'Updating personnel should return 200');
    const updateData = await updateRes.json();
    assert.strictEqual(updateData.position, 'หัวหน้าฝ่ายพัฒนาระบบ');

    console.log('✔ Personnel CREATE, READ, and UPDATE verified');
  }

  // 2. Leave Approval Flow
  let testLeaveId = '';
  {
    // Create leave
    const leaveRes = await fetch(`${BASE_URL}/api/leaves`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${adminToken}`,
      },
      body: JSON.stringify({
        personnelId: createdPersonnelId,
        leaveType: 'ลากิจ',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        reason: 'ทดสอบระบบการลา',
      }),
    });
    assert.ok(leaveRes.status === 200 || leaveRes.status === 201, `Leave creation should return 200 or 201 (got ${leaveRes.status})`);
    const leaveData = await leaveRes.json();
    assert.ok(leaveData.id, 'Leave record should have an ID');
    testLeaveId = leaveData.id;

    // Approve leave via dedicated approval endpoint
    const approveRes = await fetch(`${BASE_URL}/api/leaves/${testLeaveId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${adminToken}`,
      },
      body: JSON.stringify({
        note: 'อนุมัติสำหรับการทดสอบ',
      }),
    });
    assert.strictEqual(approveRes.status, 200, 'Leave approval should return 200');
    const approveData = await approveRes.json();
    assert.strictEqual(approveData.data.status, 'อนุมัติแล้ว');

    // Clean up leave
    const deleteLeaveRes = await fetch(`${BASE_URL}/api/leaves/${testLeaveId}`, {
      method: 'DELETE',
      headers: { 'Cookie': `auth_token=${adminToken}` },
    });
    assert.strictEqual(deleteLeaveRes.status, 200, 'Leave deletion should return 200');

    console.log('✔ Leave request creation and approval workflow verified');
  }

  // 3. Vehicle Management Flow
  let testVehicleId = '';
  {
    const vehicleRes = await fetch(`${BASE_URL}/api/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${adminToken}`,
      },
      body: JSON.stringify({
        personnelId: createdPersonnelId,
        type: 'รถยนต์',
        licensePlate: 'กข 9999 กทม',
        brand: 'Toyota',
        model: 'Camry',
        color: 'ดำ',
      }),
    });
    assert.ok(vehicleRes.status === 200 || vehicleRes.status === 201, `Vehicle creation should return 200 or 201 (got ${vehicleRes.status})`);
    const vehicleData = await vehicleRes.json();
    assert.ok(vehicleData.id, 'Vehicle should have an ID');
    testVehicleId = vehicleData.id;

    // Update vehicle
    const updateVehicleRes = await fetch(`${BASE_URL}/api/vehicles/${testVehicleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${adminToken}`,
      },
      body: JSON.stringify({ color: 'บรอนซ์เงิน' }),
    });
    assert.strictEqual(updateVehicleRes.status, 200, 'Vehicle update should return 200');
    const updateVehicleData = await updateVehicleRes.json();
    assert.strictEqual(updateVehicleData.color, 'บรอนซ์เงิน');

    // Delete vehicle
    const deleteVehicleRes = await fetch(`${BASE_URL}/api/vehicles/${testVehicleId}`, {
      method: 'DELETE',
      headers: { 'Cookie': `auth_token=${adminToken}` },
    });
    assert.strictEqual(deleteVehicleRes.status, 200, 'Vehicle deletion should return 200');

    console.log('✔ Vehicle CRUD workflow verified');
  }

  // 4. Invalid Input Handling across Major APIs
  {
    // Personnel POST with missing fields
    const badPersonnel = await fetch(`${BASE_URL}/api/personnel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${adminToken}`,
      },
      body: JSON.stringify({}),
    });
    assert.strictEqual(badPersonnel.status, 400, 'Missing fields should return 400');

    // Leave POST with missing fields
    const badLeave = await fetch(`${BASE_URL}/api/leaves`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${adminToken}`,
      },
      body: JSON.stringify({ personnelId: createdPersonnelId }),
    });
    assert.strictEqual(badLeave.status, 400, 'Invalid leave request should return 400');

    // Invalid ID format on personnel GET
    const invalidIdGet = await fetch(`${BASE_URL}/api/personnel/malformed-id-!@#$`, {
      headers: { 'Cookie': `auth_token=${adminToken}` },
    });
    assert.strictEqual(invalidIdGet.status, 400, 'Malformed ID parameter should return 400');

    console.log('✔ Invalid inputs properly rejected across major endpoints');
  }

  // Clean up created test personnel & test notifications
  if (createdPersonnelId) {
    const delRes = await fetch(`${BASE_URL}/api/personnel/${createdPersonnelId}`, {
      method: 'DELETE',
      headers: { 'Cookie': `auth_token=${adminToken}` },
    });
    assert.strictEqual(delRes.status, 200, 'Personnel DELETE should return 200');
  }

  // Clean up test notifications created during tests
  await prisma.notification.deleteMany({
    where: {
      OR: [
        { message: { contains: 'ทดสอบ' } },
        { message: { contains: 'ซีอาร์ยูดี' } },
        { title: { contains: 'ทดสอบ' } },
      ],
    },
  });

  console.log('✔ Test personnel and test notifications cleaned up successfully');
}

if (require.main === module) {
  runApiCrudTests()
    .then(() => console.log('\nAll API CRUD tests passed successfully!'))
    .catch((err) => {
      console.error('Test failed:', err);
      process.exit(1);
    });
}
