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

export async function runRpb1Tests() {
  console.log('\n--- Running RPB-1 Security Profile Form Tests (v1.3.0) ---');

  // 1. Setup Test Personnel
  const testPersonnel = await prisma.personnel.upsert({
    where: { badgeNo: 'TEST_RPB1_USER' },
    update: {},
    create: {
      badgeNo: 'TEST_RPB1_USER',
      username: 'test_rpb1_user',
      citizenId: '9876543210123',
      password: 'hashed_password',
      role: 'USER',
      prefix: 'น.ต.',
      firstName: 'วีรยุทธ',
      lastName: 'เก่งกาจ',
      position: 'นายทหารยุทธการ',
      department: 'กองบิน ๖',
      subDepartment: 'ฝูงบิน ๖๐๑',
      phone: '02-534-1111',
      mobile: '081-234-5678',
      email: 'weerayuth@rtaf.mi.th',
      currentAddress: '123/45 ซ.พหลโยธิน 54',
      currentTambon: 'คลองถนน',
      currentAmphoe: 'สายไหม',
      currentProvince: 'กรุงเทพมหานคร',
      currentZipcode: '10220',
      bloodType: 'O',
      religion: 'พุทธ',
    },
  });

  const token = await createToken(testPersonnel.id, 'USER', testPersonnel.citizenId);

  // 2. Test Anonymous access blocked
  const anonRes = await fetch(`${BASE_URL}/api/rpb1/${testPersonnel.id}`);
  assert.strictEqual(anonRes.status, 401, 'Anonymous request to GET /api/rpb1/[id] should return 401');
  console.log('✔ Anonymous access blocked (401)');

  // 3. Test GET auto-fill defaults
  const getRes = await fetch(`${BASE_URL}/api/rpb1/${testPersonnel.id}`, {
    headers: { Cookie: `auth_token=${token}` },
  });
  if (getRes.status !== 200) {
    const errText = await getRes.text();
    console.error('GET Error response:', getRes.status, errText);
  }
  assert.strictEqual(getRes.status, 200, 'GET /api/rpb1/[id] should return 200');
  const getData = await getRes.json();
  assert.strictEqual(getData.data.firstName, 'วีรยุทธ');
  assert.strictEqual(getData.data.lastName, 'เก่งกาจ');
  assert.strictEqual(getData.data.citizenId, '9876543210123');
  assert.strictEqual(getData.data.bloodGroup, 'O');
  console.log('✔ Smart Auto-fill from Personnel verified');

  // 4. Test POST Save RPB-1 Form Data
  const savePayload = {
    ...getData.data,
    status: 'COMPLETED',
    height: 175,
    weight: 70,
    scarsDistinguishingMarks: 'ไฝที่คิ้วซ้าย',
    educations: [
      {
        fromYear: '2550',
        toYear: '2554',
        schoolName: 'โรงเรียนนายเรืออากาศฯ',
        degree: 'วศ.บ.',
        major: 'วิศวกรรมอากาศยาน',
        gpa: '3.45',
      },
    ],
    fatherDetails: {
      titleName: 'นายประสิทธิ์ เก่งกาจ',
      dob: '1 ม.ค. 2500',
      birthPlace: 'จ.นครราชสีมา',
      citizenId: '3300000000001',
      race: 'ไทย',
      religion: 'พุทธ',
      nationalityOriginal: 'ไทย',
      nationalityCurrent: 'ไทย',
      addressPhone: 'กทม. 081-111-1111',
      occupation: 'ข้าราชการบำนาญ',
      workplacePhone: 'ทอ.',
    },
    motherDetails: {
      titleName: 'นางสมศรี เก่งกาจ',
      dob: '1 ม.ค. 2505',
      birthPlace: 'จ.นครราชสีมา',
      citizenId: '3300000000002',
      race: 'ไทย',
      religion: 'พุทธ',
      nationalityOriginal: 'ไทย',
      nationalityCurrent: 'ไทย',
      addressPhone: 'กทม. 082-222-2222',
      occupation: 'แม่บ้าน',
      workplacePhone: '-',
    },
    maritalStatus: 'สมรส',
    spouseCurrentDetails: {
      titleNameOriginal: 'นางสาวพิมพ์ใจ ใจดี',
      dob: '15 ก.ค. 2538',
      birthPlace: 'จ.เชียงใหม่',
      race: 'ไทย',
      religion: 'พุทธ',
      nationalityOriginal: 'ไทย',
      nationalityCurrent: 'ไทย',
      occupation: 'อาจารย์',
      workplacePhone: 'ม.เกษตรศาสตร์',
      marriageDate: '10 ธ.ค. 2563',
      marriagePlace: 'สำนักงานเขตบางเขน',
      currentAddressPhone: 'กทม. 083-333-3333',
    },
    children: [
      {
        order: 1,
        titleName: 'ด.ช.ธนภูมิ เก่งกาจ',
        dob: '1 ม.ค. 2565',
        race: 'ไทย',
        nationality: 'ไทย',
        religion: 'พุทธ',
        currentAddress: 'กทม.',
        occupation: 'ในความอุปการะ',
        schoolWorkplace: '-',
        phone: '-',
      },
    ],
  };

  const saveRes = await fetch(`${BASE_URL}/api/rpb1/${testPersonnel.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `auth_token=${token}`,
    },
    body: JSON.stringify(savePayload),
  });

  assert.strictEqual(saveRes.status, 200, 'POST /api/rpb1/[id] should return 200');
  const saveJson = await saveRes.json();
  assert.strictEqual(saveJson.success, true);
  console.log('✔ Complete 10-page RPB-1 record saved successfully');

  // 5. Verify record in Database & Fetch API
  const refetchRes = await fetch(`${BASE_URL}/api/rpb1/${testPersonnel.id}`, {
    headers: { Cookie: `auth_token=${token}` },
  });
  const refetchData = await refetchRes.json();
  assert.strictEqual(refetchData.exists, true);
  assert.strictEqual(refetchData.data.height, 175);
  assert.strictEqual(refetchData.data.maritalStatus, 'สมรส');
  assert.strictEqual(refetchData.data.educations.length, 1);
  assert.strictEqual(refetchData.data.fatherDetails.titleName, 'นายประสิทธิ์ เก่งกาจ');
  assert.strictEqual(refetchData.data.children.length, 1);
  console.log('✔ RPB-1 data integrity and sub-table JSON parsing verified');

  // 6. Verify List Endpoint
  const listRes = await fetch(`${BASE_URL}/api/rpb1?search=วีรยุทธ`, {
    headers: { Cookie: `auth_token=${token}` },
  });
  assert.strictEqual(listRes.status, 200, 'GET /api/rpb1 list should return 200');
  const listData = await listRes.json();
  const matched = listData.find((p: any) => p.id === testPersonnel.id);
  assert(matched, 'Personnel should be found in list');
  assert.strictEqual(matched.rpb1Status, 'COMPLETED');
  console.log('✔ Personnel RPB-1 status in Directory list verified');

  // 7. Test Strict Self-Service Authorization:
  // "แบบฟอร์ม รปภ. ๑ กรอกของใครของมัน ไม่สามารถกรอกให้กันได้ admin สามารถอ่านได้อย่างเดี่ยว"
  const otherUser = await prisma.personnel.upsert({
    where: { badgeNo: 'TEST_RPB1_OTHER' },
    update: {},
    create: {
      badgeNo: 'TEST_RPB1_OTHER',
      username: 'test_rpb1_other',
      citizenId: '9876543210999',
      password: 'hashed_password',
      role: 'USER',
      prefix: 'ร.อ.',
      firstName: 'สมศักดิ์',
      lastName: 'ใจสู้',
      position: 'นายทหารการเงิน',
      department: 'กองบิน ๖',
      subDepartment: 'แผนกการเงิน',
      phone: '02-534-2222',
      mobile: '089-999-9999',
      email: 'somsak@rtaf.mi.th',
    },
  });


  const otherUserToken = await createToken(otherUser.id, 'USER', otherUser.citizenId);
  const adminToken = await createToken('ADMIN_USER_ID', 'ADMIN', '1111111111111');

  // A) Other user tries to GET User A's RPB-1 -> 403 Forbidden
  const otherGetRes = await fetch(`${BASE_URL}/api/rpb1/${testPersonnel.id}`, {
    headers: { Cookie: `auth_token=${otherUserToken}` },
  });
  assert.strictEqual(otherGetRes.status, 403, 'Other user should be blocked (403) from viewing another person RPB-1');
  console.log('✔ Cross-user GET blocked with 403 Forbidden (view own only)');

  // B) Other user tries to POST / edit User A's RPB-1 -> 403 Forbidden
  const otherPostRes = await fetch(`${BASE_URL}/api/rpb1/${testPersonnel.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `auth_token=${otherUserToken}`,
    },
    body: JSON.stringify(savePayload),
  });
  assert.strictEqual(otherPostRes.status, 403, 'Other user should be blocked (403) from editing another person RPB-1');
  console.log('✔ Cross-user POST blocked with 403 Forbidden (edit own only)');

  // C) ADMIN can GET User A's RPB-1 -> 200 (Read Only access)
  const adminGetRes = await fetch(`${BASE_URL}/api/rpb1/${testPersonnel.id}`, {
    headers: { Cookie: `auth_token=${adminToken}` },
  });
  assert.strictEqual(adminGetRes.status, 200, 'ADMIN should be allowed to view/read another person RPB-1');
  console.log('✔ ADMIN GET permitted with 200 OK (Read-Only access)');

  // D) ADMIN tries to POST / edit User A's RPB-1 -> 403 Forbidden ("ไม่สามารถกรอกให้กันได้ admin สามารถอ่านได้อย่างเดียว")
  const adminPostRes = await fetch(`${BASE_URL}/api/rpb1/${testPersonnel.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `auth_token=${adminToken}`,
    },
    body: JSON.stringify(savePayload),
  });
  assert.strictEqual(adminPostRes.status, 403, 'ADMIN should be blocked (403) from editing another person RPB-1');
  console.log('✔ ADMIN POST blocked with 403 Forbidden (Admin Read-Only policy verified)');

  // E) SUPER_ADMIN CAN POST / edit User A's RPB-1 -> 200 OK ("super admin สามารถแก้ไขได้")
  const superAdminToken = await createToken('SUPER_ADMIN_USER_ID', 'SUPER_ADMIN', '0000000000000');
  const superAdminPostRes = await fetch(`${BASE_URL}/api/rpb1/${testPersonnel.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `auth_token=${superAdminToken}`,
    },
    body: JSON.stringify({
      ...savePayload,
      scarsDistinguishingMarks: 'รอยสักแขนขวา (แก้ไขโดย Super Admin)',
    }),
  });
  assert.strictEqual(superAdminPostRes.status, 200, 'SUPER_ADMIN should be permitted to edit another person RPB-1');
  const superAdminPostData = await superAdminPostRes.json();
  assert.strictEqual(superAdminPostData.success, true);
  console.log('✔ SUPER_ADMIN POST permitted with 200 OK (Super Admin edit power verified)');

  // 8. Cleanup test records
  await prisma.rpb1Record.deleteMany({ where: { personnelId: testPersonnel.id } });
  await prisma.personnel.delete({ where: { id: testPersonnel.id } });
  await prisma.personnel.delete({ where: { id: otherUser.id } }).catch(() => {});
  console.log('✔ Test records cleaned up successfully');

}

