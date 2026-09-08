# Changelog — eProfile System

รูปแบบตาม Semantic Versioning (SemVer)

## [1.3.0] — 2026-09-08

### Added
- **Google Calendar Duty & Operational Roster System (ระบบปฏิทินปฏิบัติงานและเข้าเวรยาม)**:
  - **4 Interactive View Modes**: รองรับมุมมอง ปฏิทินรายเดือน (Month), ปฏิทินรายสัปดาห์แบบ 24 ชั่วโมงพร้อมเส้นบอกเวลาปัจจุบันสีแดงสด (Week Grid), ปฏิทินรายวัน (Day Grid), และกำหนดการเรียงตามลำดับเวลา (Agenda)
  - **Left Sidebar Controls**: ปุ่มสร้างกิจกรรมด่วน (+ สร้างกิจกรรม), ปฏิทินย่อเลือกวัน (MiniCalendar), สวิตช์เปิด/ปิดเลเยอร์แสดงผลตามหมวดหมู่ (เวรยาม, การฝึก, ภารกิจ, การลา, ประชุม, อื่นๆ), ระบบสมัครสมาชิกปฏิทินสด (Live Webcal Feed URL) และส่งออกไฟล์ iCal (.ics)
  - **Military Duty Personnel Tagging**: กำหนดและระบุกำลังพลเข้าเวรตาม 10 ตำแหน่งหน้าที่ราชการทหาร (`นายทหารเวรผู้ใหญ่`, `นายทหารเวร`, `ผบ.กองรักษาการณ์`, `ผช.ผบ.กองรักษาการณ์ 1-2`, `สิบเวร ร้อย.บร.`, `สิบเวร ฝขส.ฯ`, `สิบเวร กคค./กตส.ปม.ฯ`, `สิบเวรโรงเลี้ยง`, `เสมียนเวร`)
  - **Printable Official Duty Roster (A4 Landscape)**: พิมพ์ตารางเวรประจำเดือนราชการ พร้อมช่องลงนามตรวจเวรและผู้บังคับบัญชาตามแบบฟอร์มมาตรฐาน
  - **Dynamic Duty Roles Configuration**: ระบบจัดการเพิ่ม/ลด/แก้ไขรายชื่อตำแหน่งหน้าที่เวรยามในระบบตั้งค่าปฏิทิน (`/manage/calendar/settings`)
- **Notification Settings & Event Triggers (ระบบแจ้งเตือน LINE Messaging API & Email SMTP)**:
  - **Event Trigger Matrix**: กำหนดเงื่อนไขเปิด-ปิดการแจ้งเตือนอัตโนมัติ 4 หมวด (ตารางเวรประจำวัน 07:00 น., แจ้งเตือนเวรล่วงหน้า 1 วัน, แจ้งเตือนสลับเวร, แจ้งเตือนยื่นและอนุมัติใบลา, ประกาศข่าวด่วน, แจ้งเตือนความปลอดภัย)
  - **LINE Group & Target Configuration**: รองรับการส่งแจ้งเตือนเข้ากลุ่มไลน์เวรยามของหน่วยงาน และปุ่มทดสอบส่งข้อความจริง
  - **Email SMTP Configuration**: รองรับการตั้งค่าชื่อผู้ส่ง อีเมลผู้ส่ง และปุ่มทดสอบส่งอีเมล
  - **Test Notification API (`POST /api/notifications/test`)**: ตรวจสอบการส่งข้อความจริงแบบ Real-time
- **Executive Command Dashboard & Readiness Analysis**:
  - แดชบอร์ดสรุปความพร้อมรบ อัตรากำลังพล ยอดกำลังพลปฏิบัติงานปกติ และโควตาวันลา แยกตามสังกัดกอง/ฝ่าย
- **Self-Service Password Reset Workflow**:
  - ระบบกู้คืนรหัสผ่านด้วยตนเองผ่านการยืนยันตัวตน พร้อมระบบ Token แบบใช้ครั้งเดียวและ Rate Limit
- **Universal Multi-Database Backup & Restore**:
  - ระบบสำรองและกู้คืนข้อมูลแบบ Universal JSON รองรับการย้ายข้อมูลข้ามฐานข้อมูล (SQLite, PostgreSQL, MySQL) ได้อย่างไร้รอยต่อ
- **Multi-Database Provider Support & Modern 3-Step Installer Wizard**:
  - รองรับ SQLite, PostgreSQL, และ MySQL พร้อมระบบทดสอบการเชื่อมต่อแบบ Real-Time และการตรวจสอบเลข 13 หลัก/10 หลักอย่างเข้มงวด
- **Layout & Design Cleanup**:
  - ลบ Sub-header Cards ที่ซ้ำซ้อนในทุกโมดูล ปรับดีไซน์ตามมาตรฐาน Single Design System รองรับ Dynamic Themes (`indigo`, `emerald`, `rose`, `ocean`) และ Dark/Light Mode

### Security & Quality
- **Automated Test Suite (20/20 Test Suites Passed - 100%)**:
  - ครอบคลุม Authentication, Authorization RBAC, SSRF Protection, XSS Sanitization, SQL/Prisma Injection resistance, Rate Limiting, Command Dashboard Scopes, Database Config & Reset Security, และ Module Lifecycle

---

## [1.2.0] — 2026-09-01

### Added
- **Server-side Personnel Pagination**: อัปเกรด `GET /api/personnel` รองรับ `page`, `limit` (1–100), `search`, `department`, `subDepartment`, `status`, `personnelType`, `sortBy`, `sortOrder`
- **Multi-field Personnel Search**: ค้นหาครอบคลุมชื่อ, สกุล, หมายเลขประจำตัว/BadgeNo, ตำแหน่ง, สังกัด ที่ระดับ Database
- **Safe Sorting Allowlist**: รองรับการเรียงลำดับคอลัมน์ผ่าน allowlist ป้องกัน Parameter Injection
- **Personnel Dashboard Metrics**: เพิ่ม `GET /api/personnel/stats` คำนวณสรุปยอดกำลังพล (ทั้งหมด, ปฏิบัติงานปกติ, ไม่ปกติ, จำแนกตามกอง/ฝ่ายและประเภท) ด้วย Database Aggregations
- **Secure Personnel Export**: เพิ่ม `GET /api/personnel/export` ส่งออกข้อมูล Excel/CSV ผูกกับตัวกรองปัจจุบัน พร้อมสิทธิ์ RBAC และบันทึก Audit Log (`EXPORT_PERSONNEL`)
- **Super Admin System Inspector**: ระบบตรวจสอบและวิเคราะห์คุณภาพหน้าเว็บแบบ Live ใน Browser (ตรวจจับคำผิดภาษาไทยตาม Dictionary, ลิงก์เสีย, รูปภาพเสีย, โครงสร้าง UI/Accessibility, Responsive Overflow และ Security Headers) พร้อม AI Fix Prompt Generator
- **Super Admin API Documentation / API Reference**: หน้าระบบเอกสารคู่มือ API (`/manage/api-docs` และ `GET /api/admin/api-docs`) สแกนและวิเคราะห์โครงสร้าง Route Handlers, Role Matrix, Parameters, Validation และ Audit Log จาก Source Code จริง พร้อมฟังก์ชัน Export Markdown/JSON
- **Automated Test Suite (v1.2.0)**: เพิ่มชุดทดสอบ `tests/api/personnel-pagination.test.ts`, `tests/api/auth-session-persistence.test.ts`, `tests/admin/system-inspector.test.ts`, `tests/security/security-headers.test.ts`, และ `tests/admin/api-documentation.test.ts` (รวม 10 Suites)

### Performance
- เพิ่ม Database Indexes: `@@index([personnelType])`, `@@index([createdAt])`, `@@index([firstName, lastName])`
- ปรับปรุงการโหลดข้อมูลหน้าจัดการกำลังพลด้วย Debounced Search (300ms) และ Server-side skip/take

---

## [1.1.0] — 2026-09-01

### Security

- เพิ่ม `requirePermission()` สำหรับตรวจ Permission จากฐานข้อมูล
- เพิ่ม Permission Matrix สำหรับ Role และ API
- เพิ่ม Authorization ให้ Personnel, Roles, Departments, Calendar และ Settings
- ปรับ Backup/Restore ให้จำกัดสิทธิ์ Admin
- เพิ่ม Public QR Verification API แบบจำกัดข้อมูล
- ป้องกัน password/password hash ไม่ให้ส่งออกจาก Personnel API
- เพิ่ม rate limiting และ account security controls
- เพิ่ม password policy และ account lockout
- เพิ่ม HTML sanitization สำหรับ News content
- แยก Production secrets ออกจาก source code และเพิ่ม `.env.example`

### Reliability

- เพิ่ม Health Check endpoint
- เพิ่ม Backup/Restore validation และ integrity checks
- เพิ่ม Audit Log สำหรับ security และ administrative actions
- เพิ่ม Production monitoring/PM2 configuration

### Code Quality

- เปิด TypeScript build error checking
- เปิด ESLint build error checking
- เพิ่ม Zod validation utilities
- เพิ่ม centralized API response utilities
- เพิ่ม centralized auth guards
- เพิ่ม application logger

- เพิ่ม Dynamic Dropdown Data Categories ใน Settings และเชื่อมโยงทุกฟอร์ม
- เพิ่ม Military Organizational Hierarchy (กอง/ฝ่าย/กองร้อย ➔ แผนก/หมวด/ตอน/ชุด) พร้อมคำย่อและ Cascading Dropdowns
- เพิ่ม 2-Tier Quick Filtering สำหรับหน้าจัดการบุคลากร
- เพิ่ม Automated Security & Role Matrix Test Suites (5 Suites)
- ปรับแต่ง Design System และมาตรฐาน CSS ทุก Form ให้เป็นหนึ่งเดียวกัน

### Documentation

- เพิ่ม `DEV_CHECKLIST.md`
- เพิ่ม `PERMISSION_MATRIX.md`
- เพิ่ม `VERSION.md`
- เพิ่ม `log.md` (Full System Audit & Production Readiness Log)

---

## [Roadmap — Future Releases]

- **v1.2.0**: Personnel Management Enhancement (Server-side Pagination, Advanced Search, Timeline & Career History)
- **v1.3.0**: Document Management (Orders, IDs, Certificates, Expiry & Access Control)
- **v1.4.0**: Smart QR Verification (Multi-purpose QR: Personnel, Vehicle, Document)
- **v1.5.0**: Access Control & Multi-gate Check-in/out
- **v1.6.0**: Visitor Management System
- **v1.7.0**: Executive Command Dashboard & Analytics
- **v2.0.0**: Enterprise Core Architecture (Modular Domain Separation)

## [1.0.0]

Initial eProfile System baseline.
