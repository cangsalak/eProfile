export interface ApiDocMetadata {
  description: string;
  purpose: string;
  category: string;
  requestBodyDescription?: string;
  sampleRequestBody?: Record<string, any>;
  sampleResponse?: Record<string, any>;
  queryParamDescriptions?: Record<string, string>;
  pathParamDescriptions?: Record<string, string>;
  rateLimit?: string;
}

export const API_CATALOGUE_METADATA: Record<string, Record<string, ApiDocMetadata>> = {
  // Authentication
  '/api/auth/login': {
    POST: {
      category: 'Authentication',
      description: 'เข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่าน',
      purpose: 'ใช้สำหรับตรวจสอบข้อมูลประจำตัวผู้ใช้และสร้าง Secure JWT HttpOnly Cookie',
      sampleRequestBody: { username: 'admin', password: '••••••••••••' },
      sampleResponse: { success: true, user: { id: '...', username: 'admin', role: 'SUPER_ADMIN' } },
      rateLimit: '10 requests / minute (Lockout after 5 failed attempts)',
    },
  },
  '/api/auth/logout': {
    POST: {
      category: 'Authentication',
      description: 'ออกจากระบบและยกเลิก Session',
      purpose: 'ล้างค่า JWT Cookie และบันทึก Audit Log การออกจากระบบ',
      sampleResponse: { success: true, message: 'Logged out' },
    },
  },
  '/api/auth/me': {
    GET: {
      category: 'Authentication',
      description: 'ดึงข้อมูลผู้ใช้ปัจจุบันที่กำลัง Login อยู่',
      purpose: 'ใช้สำหรับตรวจสอบสถานะ Session, สิทธิ์ Role และ Permissions ในฝั่ง Client',
      sampleResponse: { id: '...', username: 'admin', role: 'SUPER_ADMIN', permissions: [] },
    },
  },
  '/api/auth/forgot-password': {
    POST: {
      category: 'Authentication',
      description: 'ขอรีเซ็ตรหัสผ่านผ่านอีเมล',
      purpose: 'สร้าง Password Reset Token ส่งไปยังอีเมลผู้ใช้งาน',
      sampleRequestBody: { email: 'user@example.com' },
      sampleResponse: { success: true, message: 'Reset email sent' },
      rateLimit: '5 requests / 15 minutes',
    },
  },
  '/api/auth/setup-admin': {
    POST: {
      category: 'Authentication',
      description: 'สร้างบัญชี Super Admin เริ่มต้นเมื่อติดตั้งระบบ',
      purpose: 'ใช้เฉพาะครั้งแรกเมื่อยังไม่มีผู้ใช้ในระบบ',
      sampleRequestBody: { username: 'admin', password: '••••••••••••', firstName: 'Super', lastName: 'Admin' },
      sampleResponse: { success: true, message: 'Admin created' },
    },
  },

  // Personnel
  '/api/personnel': {
    GET: {
      category: 'Personnel',
      description: 'ดึงรายการกำลังพลแบบแบ่งหน้า พร้อมระบบค้นหาและตัวกรอง',
      purpose: 'ใช้แสดงผลในหน้าตารางทำเนียบบุคลากรและหน้าจัดการกำลังพล',
      queryParamDescriptions: {
        page: 'หมายเลขหน้าที่ต้องการ (เริ่มต้น 1)',
        limit: 'จำนวนรายการต่อหน้า (1-100, ค่าเริ่มต้น 20)',
        search: 'คำค้นหาครอบคลุม ชื่อ, สกุล, หมายเลขประจำตัว, ตำแหน่ง, สังกัด',
        department: 'กรองตามหน่วยงานหลัก',
        subDepartment: 'กรองตามฝ่าย/กลุ่มงานย่อย',
        status: 'กรองตามสถานะการปฏิบัติงาน (ปกติ/ไม่ปกติ)',
        personnelType: 'กรองตามประเภทกำลังพล (ข้าราชการ/พนักงาน/ลูกจ้าง)',
        sortBy: 'คอลัมน์ที่ใช้เรียงลำดับ (firstName, lastName, badgeNo, department, createdAt)',
        sortOrder: 'ทิศทางการเรียงลำดับ (asc / desc)',
      },
      sampleResponse: {
        data: [{ id: '...', firstName: 'สมชาย', lastName: 'ใจดี', position: 'นักวิเคราะห์', department: 'กองบริหาร' }],
        pagination: { page: 1, limit: 20, total: 100, totalPages: 5 },
      },
    },
    POST: {
      category: 'Personnel',
      description: 'สร้างข้อมูลกำลังพลใหม่',
      purpose: 'ใช้เพิ่มบุคลากรใหม่เข้าสู่ระบบฐานข้อมูล',
      sampleRequestBody: {
        firstName: 'สมชาย',
        lastName: 'ใจดี',
        badgeNo: '67001',
        position: 'นักวิเคราะห์นโยบายและแผน',
        department: 'กองบริหาร',
        personnelType: 'ข้าราชการ',
      },
      sampleResponse: { success: true, data: { id: '...', firstName: 'สมชาย', lastName: 'ใจดี' } },
    },
  },
  '/api/personnel/[id]': {
    GET: {
      category: 'Personnel',
      description: 'ดึงข้อมูลกำลังพลรายบุคคลตาม ID',
      purpose: 'ใช้สำหรับเปิดดูหน้าประวัติบุคลากรและการพิมพ์บัตรประจำตัว',
      pathParamDescriptions: { id: 'Personnel ID (CUID หรือ ID ในระบบ)' },
      sampleResponse: { id: '...', firstName: 'สมชาย', lastName: 'ใจดี', position: 'นักวิเคราะห์', department: 'กองบริหาร' },
    },
    PUT: {
      category: 'Personnel',
      description: 'แก้ไขข้อมูลกำลังพลตาม ID',
      purpose: 'ใช้สำหรับอัปเดตข้อมูลประวัติบุคลากร',
      pathParamDescriptions: { id: 'Personnel ID ที่ต้องการแก้ไข' },
      sampleRequestBody: { firstName: 'สมชาย', lastName: 'ใจดี', position: 'ชำนาญการพิเศษ' },
      sampleResponse: { success: true, data: { id: '...', firstName: 'สมชาย' } },
    },
    DELETE: {
      category: 'Personnel',
      description: 'ลบข้อมูลกำลังพลตาม ID',
      purpose: 'ใช้สำหรับนำบุคลากรออกจากฐานข้อมูล',
      pathParamDescriptions: { id: 'Personnel ID ที่ต้องการลบ' },
      sampleResponse: { success: true, message: 'Personnel deleted' },
    },
  },
  '/api/personnel/stats': {
    GET: {
      category: 'Personnel',
      description: 'ดึงสถิติภาพรวมกำลังพล',
      purpose: 'คำนวณยอดรวมกำลังพล, แยกตามสถานะปกติ/ไม่ปกติ, แยกตามกอง/ฝ่าย และประเภทกำลังพล',
      sampleResponse: { total: 120, active: 110, inactive: 10, byDepartment: {}, byType: {} },
    },
  },
  '/api/personnel/export': {
    GET: {
      category: 'Personnel',
      description: 'ส่งออกข้อมูลกำลังพลเป็นไฟล์ CSV หรือ Excel',
      purpose: 'ส่งออกข้อมูลบุคลากรตามตัวกรองที่ระบุ พร้อมบันทึก Audit Log',
      queryParamDescriptions: { format: 'csv หรือ excel', search: 'คำค้นหา', department: 'หน่วยงาน' },
    },
  },
  '/api/personnel/[id]/documents': {
    GET: {
      category: 'Personnel',
      description: 'ดึงรายการเอกสารแนบของบุคลากร',
      purpose: 'แสดงรายการเอกสาร เช่น คำสั่ง, บัตร, วุฒิบัตร ของบุคลากรรายนั้น',
      pathParamDescriptions: { id: 'Personnel ID' },
    },
    POST: {
      category: 'Personnel',
      description: 'อัปโหลดเอกสารแนบให้บุคลากร',
      purpose: 'แนบไฟล์เอกสารคำสั่ง หรือใบประกาศนียบัตร พร้อมตรวจสอบ MIME Type',
      pathParamDescriptions: { id: 'Personnel ID' },
    },
  },

  // Departments
  '/api/departments': {
    GET: {
      category: 'Departments',
      description: 'ดึงรายชื่อหน่วยงานและโครงสร้างฝ่ายงานทั้งหมด',
      purpose: 'ใช้แสดงผลใน Dropdown และการจัดโครงสร้างองค์กร',
    },
    POST: {
      category: 'Departments',
      description: 'เพิ่มหน่วยงานหรือฝ่ายงานใหม่',
      purpose: 'สร้างโครงสร้างหน่วยงานใหม่ในระบบ',
      sampleRequestBody: { name: 'กองดิจิทัลและสารสนเทศ', subDepartments: ['ฝ่ายพัฒนาระบบ'] },
    },
  },
  '/api/departments/[id]': {
    PUT: {
      category: 'Departments',
      description: 'แก้ไขข้อมูลหน่วยงาน',
      purpose: 'อัปเดตชื่อหรือรายชื่อฝ่ายงานย่อยของหน่วยงาน',
      pathParamDescriptions: { id: 'Department ID' },
    },
    DELETE: {
      category: 'Departments',
      description: 'ลบหน่วยงาน',
      purpose: 'ลบหน่วยงานออกจากระบบ',
      pathParamDescriptions: { id: 'Department ID' },
    },
  },

  // Leaves
  '/api/leaves': {
    GET: {
      category: 'Leaves',
      description: 'ดึงรายการใบลา',
      purpose: 'แสดงประวัติและรายการขอลางานของตนเองหรือบุคลากรในสังกัด',
    },
    POST: {
      category: 'Leaves',
      description: 'ยื่นคำร้องขอลางานใหม่',
      purpose: 'ส่งคำขอลาประเภทต่างๆ (ลาป่วย, ลากิจ, ลาพักผ่อน) เข้าสู่กระบวนการอนุมัติ',
    },
  },
  '/api/leaves/[id]': {
    PUT: {
      category: 'Leaves',
      description: 'อนุมัติ / ปฏิเสธ หรือแก้ไขสถานะใบลา',
      purpose: 'สำหรับผู้บังคับบัญชาหรือเจ้าหน้าที่บุคคลในการอนุมัติใบลา',
      pathParamDescriptions: { id: 'Leave Request ID' },
    },
  },

  // Vehicles
  '/api/vehicles': {
    GET: {
      category: 'Vehicles',
      description: 'ดึงรายการคำขอใช้ยานพาหนะ',
      purpose: 'แสดงสถานะการจองยานพาหนะของหน่วยงาน',
    },
    POST: {
      category: 'Vehicles',
      description: 'ยื่นคำขอใช้ยานพาหนะใหม่',
      purpose: 'ส่งคำขอใช้รถยนต์ส่วนกลางสำหรับปฏิบัติภารกิจราชการ',
    },
  },
  '/api/vehicles/[id]': {
    PUT: {
      category: 'Vehicles',
      description: 'อนุมัติหรือแก้ไขคำขอใช้ยานพาหนะ',
      purpose: 'อัปเดตสถานะการอนุมัติหรือจัดสรรยานพาหนะ',
      pathParamDescriptions: { id: 'Vehicle Booking ID' },
    },
    DELETE: {
      category: 'Vehicles',
      description: 'ยกเลิกคำขอใช้ยานพาหนะ',
      purpose: 'ยกเลิกรายการจองยานพาหนะ',
      pathParamDescriptions: { id: 'Vehicle Booking ID' },
    },
  },

  // Roles & Permissions
  '/api/roles': {
    GET: {
      category: 'Roles',
      description: 'ดึงรายชื่อบทบาทและสิทธิ์ทั้งหมดในระบบ',
      purpose: 'แสดงรายการ System Roles สำหรับการจัดการสิทธิ์',
    },
    POST: {
      category: 'Roles',
      description: 'สร้างบทบาทใหม่และกำหนดชุดสิทธิ์',
      purpose: 'เพิ่ม Role ใหม่ เช่น HR_OFFICER พร้อมระบุ Permissions',
    },
  },
  '/api/roles/[id]': {
    PUT: {
      category: 'Roles',
      description: 'แก้ไขชุดสิทธิ์ของบทบาท',
      purpose: 'อัปเดต Permissions ของ Role ที่กำหนด',
      pathParamDescriptions: { id: 'Role ID' },
    },
    DELETE: {
      category: 'Roles',
      description: 'ลบบทบาท',
      purpose: 'ลบ Custom Role ที่ไม่ได้ใช้งาน',
      pathParamDescriptions: { id: 'Role ID' },
    },
  },

  // System & Settings
  '/api/settings': {
    GET: {
      category: 'Settings',
      description: 'ดึงการตั้งค่าระบบ (ชื่อระบบ, องค์กร, ธีม, โลโก้)',
      purpose: 'โหลดคอนฟิกสำหรับการแสดงผลหน้าเว็บและส่วนหัวของระบบ',
    },
    POST: {
      category: 'Settings',
      description: 'บันทึกการตั้งค่าระบบ',
      purpose: 'อัปเดตการตั้งค่าระบบ เช่น ชื่อองค์กร, ที่อยู่, สีธีม, ข้อความหลังบัตร',
    },
  },
  '/api/backup': {
    GET: {
      category: 'Backup',
      description: 'ดาวน์โหลดไฟล์สำรองฐานข้อมูล (Database Backup)',
      purpose: 'ส่งออกไฟล์ SQLite/JSON Backup พร้อมบันทึก Audit Log',
    },
  },
  '/api/restore': {
    POST: {
      category: 'Backup',
      description: 'กู้คืนฐานข้อมูลจากไฟล์สำรอง',
      purpose: 'นำเข้าข้อมูลจากไฟล์ Backup เพื่อกู้คืนระบบ',
    },
  },
  '/api/audit-logs': {
    GET: {
      category: 'Audit',
      description: 'ดึงประวัติการใช้งานและบันทึกความปลอดภัย (Audit Logs)',
      purpose: 'สำหรับ Super Admin ตรวจสอบประวัติการเข้าใช้งาน, การ Export, และการเปลี่ยนแปลงข้อมูลสำคัญ',
      queryParamDescriptions: {
        page: 'หมายเลขหน้า',
        limit: 'จำนวนรายการ',
        action: 'กรองตามการกระทำ เช่น LOGIN, EXPORT_PERSONNEL',
      },
    },
  },
  '/api/verify/[id]': {
    GET: {
      category: 'QR',
      description: 'ตรวจสอบความถูกต้องของบัตรประจำตัวผ่าน QR Code สาธารณะ',
      purpose: 'ให้บุคคลภายนอกสแกน QR Code ตรวจสอบสถานะการเป็นกำลังพลโดยแสดงเฉพาะข้อมูลที่ไม่เป็นความลับ',
      pathParamDescriptions: { id: 'Personnel ID หรือ Verification Token' },
    },
  },

  // System Inspector
  '/api/admin/inspector': {
    GET: {
      category: 'Inspector',
      description: 'ดึงประวัติการตรวจสอบหน้าเว็บย้อนหลัง',
      purpose: 'แสดงรายการ Scan Report ในหน้า Super Admin System Inspector',
    },
    POST: {
      category: 'Inspector',
      description: 'บันทึกผลการตรวจสอบหน้าเว็บและ Findings',
      purpose: 'จัดเก็บสถิติและข้อบกพร่องที่ตรวจพบจาก Browser ลงฐานข้อมูล',
    },
  },
  '/api/admin/inspector/[id]': {
    GET: {
      category: 'Inspector',
      description: 'ดึงรายละเอียดการตรวจและ Findings ทั้งหมด',
      purpose: 'แสดงรายละเอียดของแต่ละ Finding เพื่อการวิเคราะห์และแก้ไข',
      pathParamDescriptions: { id: 'Inspection ID' },
    },
    DELETE: {
      category: 'Inspector',
      description: 'ลบประวัติการตรวจ',
      purpose: 'ลบรายงานการตรวจสอบที่ไม่ต้องการ',
      pathParamDescriptions: { id: 'Inspection ID' },
    },
  },
  '/api/admin/inspector/[id]/findings/[findingId]': {
    PATCH: {
      category: 'Inspector',
      description: 'อัปเดตสถานะของข้อบกพร่อง (OPEN, REVIEWED, FIXED, IGNORED, FALSE_POSITIVE)',
      purpose: 'ใช้ติดตามความคืบหน้าในการแก้ไขข้อบกพร่อง',
      pathParamDescriptions: { id: 'Inspection ID', findingId: 'Finding ID' },
    },
  },
  '/api/admin/inspector/check-headers': {
    GET: {
      category: 'Inspector',
      description: 'ตรวจสอบ Security Response Headers ของเซิร์ฟเวอร์',
      purpose: 'ตรวจเช็ค X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, CSP',
    },
  },
};
