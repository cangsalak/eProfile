import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

/**
 * Seeds a comprehensive and realistic demo dataset for testing all system capabilities:
 * - Departments & Sub-departments (as structured JSON array)
 * - Personnel of all 5 types (สัญญาบัตร, ประทวน, พนักงานราชการ, ลูกจ้าง, ทหารกองประจำการ)
 * - Various Roles (HR_MANAGER, OFFICER, COMMANDER, EDITOR, USER)
 * - Leave Records (รออนุมัติ, อนุมัติแล้ว, ไม่อนุมัติ)
 * - Vehicles (Personal & Official)
 * - News Posts & Announcements
 * - Calendar Events
 * - Personnel Documents
 */
export async function seedDemoDataset(prisma: PrismaClient) {
  const demoPasswordHash = await bcrypt.hash('Demo@123456', 10);

  // 1. Create Departments & Sub-departments
  const departmentsData = [
    {
      name: 'กองบังคับการ',
      shortName: 'บก.',
      subDepartments: JSON.stringify([
        { name: 'แผนกธุรการและกำลังพล', shortName: 'ธร./กพ.' },
        { name: 'แผนกการเงิน', shortName: 'กง.' },
        { name: 'แผนกเทคโนโลยีสารสนเทศ', shortName: 'ทส.' },
      ]),
    },
    {
      name: 'ฝ่ายยุทธการและการข่าว',
      shortName: 'ยก.-ขว.',
      subDepartments: JSON.stringify([
        { name: 'แผนกยุทธการและการฝึก', shortName: 'ยก.' },
        { name: 'แผนกการข่าวและสารสนเทศ', shortName: 'ขว.' },
      ]),
    },
    {
      name: 'ฝ่ายส่งกำลังบำรุง',
      shortName: 'กบ.',
      subDepartments: JSON.stringify([
        { name: 'แผนกพลาธิการและส่งกำลัง', shortName: 'พธ.' },
        { name: 'แผนกซ่อมบำรุงและยานพาหนะ', shortName: 'ซบ.' },
      ]),
    },
    {
      name: 'ฝ่ายกิจการพลเรือน',
      shortName: 'กร.',
      subDepartments: JSON.stringify([
        { name: 'แผนกประชาสัมพันธ์และสารนิเทศ', shortName: 'ปชส.' },
        { name: 'แผนกประสานงานมวลชน', shortName: 'ปสม.' },
      ]),
    },
  ];

  for (const dept of departmentsData) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {
        shortName: dept.shortName,
        subDepartments: dept.subDepartments,
      },
      create: dept,
    });
  }

  // 2. Create Sample Personnel across all types and ranks
  const samplePersonnel = [
    {
      id: 'DEMO_001',
      badgeNo: '1001000001',
      citizenId: '1100100000001',
      username: 'somchai.c',
      password: demoPasswordHash,
      prefix: 'พ.อ.',
      firstName: 'สมชาย',
      lastName: 'ชาญสมร',
      personnelType: 'นายทหารสัญญาบัตร',
      position: 'เสนาธิการ / ผู้บังคับบัญชา',
      department: 'กองบังคับการ',
      subDepartment: 'แผนกธุรการและกำลังพล',
      role: 'COMMANDER',
      phone: '02-123-4501',
      mobile: '081-111-0001',
      email: 'somchai.c@eprofile.mil',
      bloodType: 'O',
      education: 'ปริญญาโท',
      status: 'ปฏิบัติงานปกติ',
    },
    {
      id: 'DEMO_002',
      badgeNo: '1001000002',
      citizenId: '1100100000002',
      username: 'wichai.h',
      password: demoPasswordHash,
      prefix: 'พ.ท.',
      firstName: 'วิชัย',
      lastName: 'พัฒนาการ',
      personnelType: 'นายทหารสัญญาบัตร',
      position: 'หัวหน้าฝ่ายกำลังพล',
      department: 'กองบังคับการ',
      subDepartment: 'แผนกธุรการและกำลังพล',
      role: 'HR_MANAGER',
      phone: '02-123-4502',
      mobile: '081-111-0002',
      email: 'wichai.h@eprofile.mil',
      bloodType: 'A',
      education: 'ปริญญาตรี',
      status: 'ปฏิบัติงานปกติ',
    },
    {
      id: 'DEMO_003',
      badgeNo: '1001000003',
      citizenId: '1100100000003',
      username: 'prasert.k',
      password: demoPasswordHash,
      prefix: 'ร.อ.',
      firstName: 'ประเสริฐ',
      lastName: 'กิจจานุรักษ์',
      personnelType: 'นายทหารสัญญาบัตร',
      position: 'นายทหารยุทธการ',
      department: 'ฝ่ายยุทธการและการข่าว',
      subDepartment: 'แผนกยุทธการและการฝึก',
      role: 'OFFICER',
      phone: '02-123-4503',
      mobile: '081-111-0003',
      email: 'prasert.k@eprofile.mil',
      bloodType: 'B',
      education: 'ปริญญาตรี',
      status: 'ปฏิบัติงานปกติ',
    },
    {
      id: 'DEMO_004',
      badgeNo: '1001000004',
      citizenId: '1100100000004',
      username: 'anong.p',
      password: demoPasswordHash,
      prefix: 'ร.ต.',
      firstName: 'อนงค์',
      lastName: 'พงษ์เพียร',
      personnelType: 'นายทหารสัญญาบัตร',
      position: 'นายทหารประชาสัมพันธ์',
      department: 'ฝ่ายกิจการพลเรือน',
      subDepartment: 'แผนกประชาสัมพันธ์และสารนิเทศ',
      role: 'EDITOR',
      phone: '02-123-4504',
      mobile: '081-111-0004',
      email: 'anong.p@eprofile.mil',
      bloodType: 'AB',
      education: 'ปริญญาตรี',
      status: 'ปฏิบัติงานปกติ',
    },
    {
      id: 'DEMO_005',
      badgeNo: '1001000005',
      citizenId: '1100100000005',
      username: 'sukit.s',
      password: demoPasswordHash,
      prefix: 'จ.ส.อ.',
      firstName: 'สุกิจ',
      lastName: 'สุขสมบูรณ์',
      personnelType: 'นายทหารประทวน',
      position: 'เสมียนกำลังพลอาวุโส',
      department: 'กองบังคับการ',
      subDepartment: 'แผนกธุรการและกำลังพล',
      role: 'OFFICER',
      phone: '02-123-4505',
      mobile: '081-111-0005',
      email: 'sukit.s@eprofile.mil',
      bloodType: 'O',
      education: 'อนุปริญญา / ปวส.',
      status: 'ปฏิบัติงานปกติ',
    },
    {
      id: 'DEMO_006',
      badgeNo: '1001000006',
      citizenId: '1100100000006',
      username: 'thiraphong.y',
      password: demoPasswordHash,
      prefix: 'ส.อ.',
      firstName: 'ธีรพงษ์',
      lastName: 'ยิ่งยศ',
      personnelType: 'นายทหารประทวน',
      position: 'นายสิบส่งกำลังบำรุง',
      department: 'ฝ่ายส่งกำลังบำรุง',
      subDepartment: 'แผนกพลาธิการและส่งกำลัง',
      role: 'USER',
      phone: '02-123-4506',
      mobile: '081-111-0006',
      email: 'thiraphong.y@eprofile.mil',
      bloodType: 'B',
      education: 'มัธยมศึกษาตอนปลาย / ปวช.',
      status: 'ปฏิบัติงานปกติ',
    },
    {
      id: 'DEMO_007',
      badgeNo: '1001000007',
      citizenId: '1100100000007',
      username: 'kannika.m',
      password: demoPasswordHash,
      prefix: 'นางสาว',
      firstName: 'กรรณิการ์',
      lastName: 'มณีรัตน์',
      personnelType: 'พนักงานราชการ',
      position: 'นักวิชาการคอมพิวเตอร์',
      department: 'กองบังคับการ',
      subDepartment: 'แผนกเทคโนโลยีสารสนเทศ',
      role: 'USER',
      phone: '02-123-4507',
      mobile: '081-111-0007',
      email: 'kannika.m@eprofile.mil',
      bloodType: 'A',
      education: 'ปริญญาตรี',
      status: 'ปฏิบัติงานปกติ',
    },
    {
      id: 'DEMO_008',
      badgeNo: '1001000008',
      citizenId: '1100100000008',
      username: 'buncha.t',
      password: demoPasswordHash,
      prefix: 'นาย',
      firstName: 'บัญชา',
      lastName: 'ทองประดับ',
      personnelType: 'ลูกจ้าง',
      position: 'พนักงานขับรถยนต์และซ่อมบำรุง',
      department: 'ฝ่ายส่งกำลังบำรุง',
      subDepartment: 'แผนกซ่อมบำรุงและยานพาหนะ',
      role: 'USER',
      phone: '02-123-4508',
      mobile: '081-111-0008',
      email: 'buncha.t@eprofile.mil',
      bloodType: 'O',
      education: 'มัธยมศึกษาตอนปลาย / ปวช.',
      status: 'ปฏิบัติงานปกติ',
    },
    {
      id: 'DEMO_009',
      badgeNo: '1001000009',
      citizenId: '1100100000009',
      username: 'pattana.k',
      password: demoPasswordHash,
      prefix: 'พลทหาร',
      firstName: 'พัฒนา',
      lastName: 'กล้าหาญ',
      personnelType: 'ทหารกองประจำการ',
      position: 'พลสารวัตร / พลบริการ',
      department: 'กองบังคับการ',
      subDepartment: 'แผนกธุรการและกำลังพล',
      role: 'USER',
      phone: '02-123-4509',
      mobile: '081-111-0009',
      email: 'pattana.k@eprofile.mil',
      bloodType: 'AB',
      education: 'มัธยมศึกษาตอนต้น',
      status: 'ปฏิบัติงานปกติ',
    },
  ];

  for (const person of samplePersonnel) {
    await prisma.personnel.upsert({
      where: { id: person.id },
      update: {},
      create: person,
    });
  }

  // 3. Create Sample Leave Records
  const today = new Date();
  const sampleLeaves = [
    {
      personnelId: 'DEMO_005', // จ.ส.อ. สุกิจ
      leaveType: 'ลาพักผ่อน',
      startDate: new Date(today.getTime() + 86400000 * 2),
      endDate: new Date(today.getTime() + 86400000 * 4),
      reason: 'เดินทางกลับภูมิลำเนาเยี่ยมครอบครัวต่างจังหวัด',
      status: 'รออนุมัติ',
    },
    {
      personnelId: 'DEMO_006', // ส.อ. ธีรพงษ์
      leaveType: 'ลากิจ',
      startDate: new Date(today.getTime() - 86400000 * 5),
      endDate: new Date(today.getTime() - 86400000 * 4),
      reason: 'ติดต่อทำธุรกรรมโอนกรรมสิทธิ์ที่ดิน',
      status: 'อนุมัติแล้ว',
      approvedById: 'DEMO_001',
      approvedAt: new Date(today.getTime() - 86400000 * 6),
    },
    {
      personnelId: 'DEMO_007', // พนักงานราชการ กรรณิการ์
      leaveType: 'ลาป่วย',
      startDate: new Date(today.getTime() - 86400000 * 10),
      endDate: new Date(today.getTime() - 86400000 * 9),
      reason: 'มีไข้สูงและพบแพทย์โรงพยาบาล มีใบรับรองแพทย์',
      status: 'อนุมัติแล้ว',
      approvedById: 'DEMO_002',
      approvedAt: new Date(today.getTime() - 86400000 * 9),
    },
  ];

  for (const leave of sampleLeaves) {
    await prisma.leaveRecord.create({
      data: leave,
    });
  }

  // 4. Create Sample Vehicles
  const sampleVehicles = [
    {
      personnelId: 'DEMO_001',
      licensePlate: '1กข 4567',
      brand: 'Toyota',
      model: 'Camry Hybrid',
      color: 'ดำ',
      type: 'รถยนต์ส่วนบุคคล',
    },
    {
      personnelId: 'DEMO_003',
      licensePlate: '2ขค 8910',
      brand: 'Honda',
      model: 'Civic',
      color: 'ขาว',
      type: 'รถยนต์ส่วนบุคคล',
    },
    {
      personnelId: 'DEMO_005',
      licensePlate: '1กง 9988',
      brand: 'Yamaha',
      model: 'NMAX',
      color: 'น้ำเงิน',
      type: 'รถจักรยานยนต์',
    },
    {
      personnelId: 'DEMO_008',
      licensePlate: 'ตรากงจักร 12345',
      brand: 'Isuzu',
      model: 'D-Max 4WD',
      color: 'เขียวขี้ม้า',
      type: 'รถยนต์ราชการ',
    },
  ];

  for (const v of sampleVehicles) {
    await prisma.vehicle.create({
      data: v,
    });
  }

  // 5. Create Sample News / Announcements
  const samplePosts = [
    {
      title: 'กำหนดการตรวจความพร้อมรบและฝึกประจำปี 2569',
      content: 'ขอให้กำลังพลทุกนายเตรียมความพร้อมทั้งด้านเอกสาร ยุทโธปกรณ์ และเครื่องแต่งกายสำหรับการตรวจความพร้อมรบในสัปดาห์หน้า รายละเอียดติดตามได้จากคำสั่งหน่วย',
      category: 'ประกาศทั่วไป',
      published: true,
      authorId: 'DEMO_004',
    },
    {
      title: 'ประชาสัมพันธ์: สิทธิการเบิกจ่ายค่ารักษาพยาบาลและการตรวจสุขภาพประจำปี',
      content: 'หน่วยได้จัดบริการตรวจสุขภาพประจำปีสำหรับข้าราชการ ลูกจ้าง และครอบครัว ณ ห้องพยาบาลกองบังคับการ ระหว่างวันที่ 15-20 ของเดือนนี้',
      category: 'สวัสดิการ',
      published: true,
      authorId: 'DEMO_002',
    },
    {
      title: 'แนวทางการใช้งานระบบทำเนียบบุคลากรและโปรไฟล์อิเล็กทรอนิกส์ (eProfile v1.3.0)',
      content: 'กำลังพลสามารถเข้าสู่ระบบเพื่อตรวจสอบข้อมูลประวัติ ยื่นคำขอลาออนไลน์ และพิมพ์บัตรประจำตัวอิเล็กทรอนิกส์ผ่านสมาร์ตโฟนได้ตลอด 24 ชั่วโมง',
      category: 'เทคโนโลยีสารสนเทศ',
      published: true,
      authorId: 'DEMO_007',
    },
  ];

  for (const post of samplePosts) {
    await prisma.post.create({
      data: post,
    });
  }

  // 6. Create Sample Calendar Events
  const sampleEvents = [
    {
      title: 'การประชุมหัวหน้าฝ่ายประจำเดือน',
      description: 'ประชุมติดตามความคืบหน้างานและประเมินผลการปฏิบัติราชการ ณ ห้องประชุม 1',
      startDate: new Date(today.getTime() + 86400000 * 3),
      endDate: new Date(today.getTime() + 86400000 * 3 + 7200000),
      type: 'meeting',
    },
    {
      title: 'การฝึกทบทวนยุทธวิธีประจำไตรมาส',
      description: 'กำลังพลสังกัดฝ่ายยุทธการเข้ารับการฝึกทบทวน ณ ลานอเนกประสงค์',
      startDate: new Date(today.getTime() + 86400000 * 7),
      endDate: new Date(today.getTime() + 86400000 * 7 + 14400000),
      type: 'operation',
    },
  ];

  for (const ev of sampleEvents) {
    await prisma.calendarEvent.create({
      data: ev,
    });
  }

  // 7. Create Sample Personnel Documents Metadata
  const sampleDocs = [
    {
      personnelId: 'DEMO_001',
      category: 'คำสั่ง',
      filename: 'คำสั่งแต่งตั้งและมอบหมายหน้าที่_2569.pdf',
      mimeType: 'application/pdf',
      size: 512000,
      storagePath: '/uploads/documents/demo_order_001.pdf',
      uploadedBy: 'DEMO_002',
      notes: 'คำสั่งแต่งตั้งนายทหารสัญญาบัตรประจำปี',
    },
    {
      personnelId: 'DEMO_007',
      category: 'วุฒิการศึกษา',
      filename: 'ใบรับรองคุณวุฒิ_วิทยาการคอมพิวเตอร์.pdf',
      mimeType: 'application/pdf',
      size: 320000,
      storagePath: '/uploads/documents/demo_cert_007.pdf',
      uploadedBy: 'DEMO_007',
      notes: 'วุฒิปริญญาตรี วิทยาศาสตรบัณฑิต',
    },
  ];

  for (const doc of sampleDocs) {
    await prisma.personnelDocument.create({
      data: doc,
    });
  }
}
