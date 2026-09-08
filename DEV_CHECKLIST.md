# 🛡️ eProfile System — Comprehensive Audit & Production Readiness Checklist (v1.3.0)

> **เอกสารคู่มือและเกณฑ์การตรวจสอบระบบ (Audit & DevSecOps Checklist)**  
> **เวอร์ชันระบบ:** v1.3.0  
> **อัปเดตล่าสุด:** 2026-09-08  
> **สถาปัตยกรรม:** Next.js 14 App Router, TypeScript 5.5, Prisma ORM 5.22, TailwindCSS (NextAdmin HQ Tokens)  
> **ฐานข้อมูลที่รองรับ:** Multi-Database (SQLite / MySQL / MariaDB / PostgreSQL)  

---

## ⚠️ กฎและข้อบังคับในการตรวจสอบระบบ (Audit Ground Rules)

1. **ห้ามแก้ไข Source Code หรือลบไฟล์ใดๆ ในขั้นตอนการ Audit** (Audit Phase เป็น Read-only)
2. **ห้ามเปิดเผยค่า Secret จริงในรายงาน** (เช่น `JWT_SECRET`, `ADMIN_SETUP_SECRET`, รหัสผ่านฐานข้อมูล, API Token, Private Key ให้ระบุเพียงตำแหน่งไฟล์และบรรทัด)
3. **ตรวจสอบจาก Source Code และ Runtime Test จริงเสมอ** (ห้ามคาดเดาหรือถือว่าเขียน Checklist แล้วแปลว่าทำงานจริง)
4. **ถ้าไม่สามารถตรวจสอบบางรายการได้** ให้ระบุผลลัพธ์เป็น `NOT VERIFIED`
5. **เกณฑ์สถานะการตรวจสอบ:**
   - 🟢 `PASS` — ผ่านตามเกณฑ์ความปลอดภัยและมาตรฐานสถาปัตยกรรม
   - 🟠 `WARNING` — ใช้งานได้แต่มีจุดที่ควรปรับปรุงเพื่อความสมบูรณ์
   - 🔴 `FAIL` — มีข้อบกพร่องหรือช่องโหว่ความปลอดภัยที่ต้องแก้ไข
   - ⚪ `NOT VERIFIED` — ไม่สามารถทดสอบได้ในสภาพแวดล้อมปัจจุบัน

---

# 1. โครงสร้างโปรเจกต์และสถาปัตยกรรมโมดูลาร์ (Project Map & Discovery)

### 1.1 แผนผังระบบ eProfile (Modular System Architecture)

```text
eprofile/
├── prisma/                          # Multi-DB Prisma Schemas & Database Seeds
│   ├── schema.prisma                # SQLite Provider Schema (19 Models)
│   ├── schema.mysql.prisma          # MySQL / MariaDB Provider Schema
│   ├── schema.postgresql.prisma     # PostgreSQL Provider Schema
│   ├── seed.ts                      # ข้อมูลเริ่มต้น SQLite
│   └── seed-permissions.ts          # ตัวซิงค์ System Roles & Permissions
├── public/                          # Static Assets และ /uploads (เก็บบัตรประจำตัว, สลิป, สื่อ)
├── scripts/
│   └── generate-schemas.js          # Generator สร้าง Multi-DB Schema อัตโนมัติ
├── src/
│   ├── app/                         # Next.js 14 App Router
│   │   ├── (auth)/                  # เส้นทาง Authentication (login, forgot-password, reset-password, install)
│   │   ├── (dashboard)/             # เส้นทางแอปพลิเคชันหลัก (directory, profile, modules, leaves, calendar ฯลฯ)
│   │   ├── api/                     # REST API Route Handlers (93 Endpoints)
│   │   └── globals.css              # Theme Tokens (indigo, emerald, rose, ocean) & Form Controls
│   ├── components/                  # Shared UI (DashboardShell, Breadcrumbs, Modals, Pagination)
│   ├── lib/                         # Core Utilities (Auth Guards, DB Client, Encryption, Audit, Zod Schemas)
│   └── modules/                     # Modular Subsystem Architecture (15 Modules)
│       ├── backup/                  # สำรองและกู้คืนฐานข้อมูลข้าม DB (Universal JSON / SQLite)
│       ├── badges/                  # ออกแบบ พิมพ์บัตรประจำตัว Barcode Code128 & QR Code
│       ├── calendar/                # ปฏิทินปฏิบัติงาน กิจกรรม และเวรยาม
│       ├── command-dashboard/       # แดชบอร์ดความพร้อมรบและสรุปยอดกำลังพลตามสายบังคับบัญชา
│       ├── contacts/                # ระบบข้อมูลติดต่อและกล่องข้อความร้องเรียน
│       ├── leaves/                  # ยื่นใบลา อนุมัติใบลา Scoped และคำนวณโควตาวันลา
│       ├── menus/                   # จัดการแถบนำทาง (Sidebar Menu Management)
│       ├── module-manager/          # ติดตั้ง ถอดถอน และเปิด/ปิด โมดูลส่วนเสริมด้วยไฟล์ ZIP
│       ├── news/                    # ข่าวสารประชาสัมพันธ์และระบบแจ้งเตือนแยกรายบุคคล
│       ├── personnel/               # ทำเนียบบุคลากร ประวัติ ค้นหา แบ่งหน้า และโครงสร้างหน่วยงาน
│       ├── rpb1/                    # แบบฟอร์ม ทบ.100-009 (RPB-1 Security Profile 10 หน้า)
│       ├── site-content/            # จัดการเนื้อหาเว็บไซต์หน้าแรก หน้าติดต่อ หน้าเกี่ยวกับเรา
│       ├── system-inspector/        # วินิจฉัยระบบ DOM, Accessibility, Security & API Documentation
│       ├── test-slip/               # ออกและจัดการสลิปเงินเดือน/เงินได้ พร้อมพิมพ์เอกสาร
│       ├── theme/                   # ปรับแต่งธีมระบบและชุดสี
│       └── vehicles/                # ทะเบียนและประวัติการใช้ยานพาหนะ
├── tests/                           # ชุดทดสอบอัตโนมัติครบ 21 Test Suites
├── Dockerfile                       # Production Multi-Stage Build
├── Dockerfile.standalone            # Fast Standalone Dockerfile (Zero-Download for Synology NAS)
├── docker-compose.yml               # Docker Compose Stack
└── docker-entrypoint.sh             # Runtime Container Lifecycle & Auto DB Schema Push
```

---

# 2. การตรวจสอบการจัดการสิทธิ์และความมั่นคงปลอดภัย (Security & RBAC Audit)

### 2.1 ตรวจสอบ 8 บทบาทระบบ (System Role Matrix)
อ้างอิงตาม `ROLE_DEFINITIONS` ใน [src/lib/role-definitions.ts](file:///Users/cangsalak/project/eprofile/src/lib/role-definitions.ts):

- [ ] `SUPER_ADMIN` — มีสิทธิ์ทุกอย่างในระบบ, สแกน Inspector, ดู API Docs, Reset DB, ติดตั้งโมดูล, แก้ไข RPB-1 ทุกคน
- [ ] `ADMIN` — จัดการกำลังพล, ตั้งค่าระบบ, ข่าวสาร, อนุมัติใบลา, สำรองข้อมูล (ไม่สามารถก้าวก่าย SUPER_ADMIN หรือแก้ไข RPB-1 คนอื่น)
- [ ] `HR_MANAGER` — จัดการข้อมูลกำลังพล, อนุมัติใบลาทั่วทั้งองค์กร, ดู Audit Logs, ดู Command Dashboard
- [ ] `DEPARTMENT_COMMANDER` — ผบ.ระดับกอง/สำนัก (ดู Dashboard และอนุมัติใบลาเฉพาะในสังกัด `department` ของตน)
- [ ] `COMMANDER` — ผบ.หน่วยย่อย/แผนก (ดู Dashboard และอนุมัติใบลาเฉพาะในสังกัด `department` + `subDepartment` ของตน)
- [ ] `EDITOR` — จัดการเนื้อหา ข่าวสาร และไฟล์มีเดีย (`MANAGE_POSTS`)
- [ ] `OFFICER` — เจ้าหน้าที่ ดูข้อมูลทั่วไปและจัดการใบลา/ประวัติตนเอง
- [ ] `USER` — ผู้ใช้งานทั่วไป

### 2.2 ตรวจสอบ Scoped Access & Anti-Self Approval
- [ ] **Query Layer Scoping:** การดึงข้อมูลกำลังพล, แดชบอร์ดผู้บังคับบัญชา, และรายการรออนุมัติใบลา ต้องถูกกรองที่ระดับ SQL/Prisma Query เสมอ
- [ ] **Anti-Self Approval:** ผู้บังคับบัญชา/Admin ต้องไม่สามารถกดอนุมัติใบลาของตนเองได้ (ต้องบล็อกทั้งใน UI และ Backend API)
- [ ] **RPB-1 Security Profile Isolation:** 
  - บุคลากรทั่วไป (`USER`, `OFFICER`, `EDITOR`) เข้าถึงได้เฉพาะระเบียนของตนเอง
  - `ADMIN` ดูได้แบบ Read-only ทั่วระบบ (ห้ามแก้ไข)
  - `SUPER_ADMIN` เท่านั้นที่มีสิทธิ์แก้ไขระเบียนของผู้อื่น

---

# 3. การตรวจสอบ API Endpoints และ Input Validation (API Audit)

### 3.1 ตรวจสอบ API Guards
- [ ] ทุก Mutation (`POST`, `PUT`, `PATCH`, `DELETE`) ต้องมี `requireAuth`, `requirePermission`, หรือ `requireRole`
- [ ] ลำดับการทำงานต้องถูกต้อง: `verifyAuth()` ➔ `requirePermission()` ➔ `Validate Input (Zod)` ➔ `Database Mutation`
- [ ] ห้ามมี Public Mutation API ยกเว้น `/api/auth/login`, `/api/auth/forgot-password`, และ `/api/install` (One-time locked)

### 3.2 ตรวจสอบ Input Validation & Safe Sorting
- [ ] ทุก Request Body และ SearchParams ต้องผ่านการตรวจสอบ Type และ Format ด้วย Zod Schemas
- [ ] ฟิลด์ Sorting (เช่น `sortBy`, `sortOrder`) ต้องใช้ Allowlist เพื่อป้องกัน Parameter/SQL Injection
- [ ] ป้องกัน **Mass Assignment:** ผู้ใช้ทั่วไปต้องไม่สามารถส่งฟิลด์ `role`, `permissions`, `isSystem`, `status` ไปแก้ไขเองได้

### 3.3 ตรวจสอบ Sensitive Data Exposure
- [ ] ห้ามส่ง `password`, `passwordHash`, `resetToken`, Private Keys ใน API Response
- [ ] ข้อมูลสาธารณะของ QR Verification (`/verify/[id]`) ต้องเปิดเผยเฉพาะชื่อ-สกุล, ตำแหน่ง, สังกัด และสถานะบัตร (ห้ามเปิดเผยเลขบัตรประชาชน 13 หลัก, ที่อยู่, เบอร์โทรส่วนตัว)

---

# 4. การตรวจสอบระบบฐานข้อมูลและการรองรับ Multi-Database (Database Audit)

- [ ] **Prisma Schemas Sync:** ตรวจสอบความสอดคล้องระหว่าง `schema.prisma`, `schema.mysql.prisma`, และ `schema.postgresql.prisma`
- [ ] **Generator Script:** สคริปต์ `scripts/generate-schemas.js` สร้าง Schema ของทุกฐานข้อมูลได้ถูกต้องสมบูรณ์
- [ ] **Database Preflight Check:** ตรวจสอบ `DATABASE_URL` ก่อนการเริ่มทำงานและ Push Schema อัตโนมัติใน `docker-entrypoint.sh`
- [ ] **Transaction Integrity:** การดำเนินการที่มีผลกระทบหลายตาราง (เช่น อนุมัติใบลา + บันทึก Audit Log + อัปเดตโควตา) ต้องครอบด้วย `prisma.$transaction`
- [ ] **Safe Destruction:** Endpoint ล้างฐานข้อมูล (`/api/admin/database-reset`) ต้องจำกัดเฉพาะ `SUPER_ADMIN` และบังคับยืนยันรหัสผ่านซ้ำ (Password Re-authentication)

---

# 5. การตรวจสอบระบบสำรองและกู้คืนข้อมูล (Universal Backup & Restore)

- [ ] **Universal JSON Backup:** รองรับการ Export ข้อมูลครบ 19 Models เป็น JSON เพื่อกู้คืนข้าม Database Engine ได้ (เช่น SQLite ➔ MariaDB/PostgreSQL)
- [ ] **Native SQLite Backup:** รองรับการสำรองและกู้คืนไฟล์ไบนารี `.db` โดยตรงสำหรับ SQLite
- [ ] **Pre-restore Safety Backup:** ระบบต้องสร้างไฟล์สำรองฉุกเฉินอัตโนมัติก่อนเริ่มกระบวนการกู้คืน (Rollback Protection)
- [ ] **File Validation:** ตรวจสอบ Schema Version, โครงสร้างไฟล์ และประเภทไฟล์อย่างเข้มงวดก่อนดำเนินการกู้คืน

---

# 6. การตรวจสอบการอัปโหลดไฟล์และความปลอดภัยของเนื้อหา (File Upload & XSS)

- [ ] **MIME & Extension Whitelist:** จำกัดเฉพาะไฟล์รูปภาพและเอกสารที่อนุญาต (`.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`, `.zip` สำหรับโมดูล)
- [ ] **Path Traversal Protection:** ตรวจสอบชื่อไฟล์ ป้องกัน `../`, `..\`, หรือ Null Byte Injection
- [ ] **Zip Slip Protection:** การแตกไฟล์โมดูล ZIP ใน `src/modules/module-manager` ต้องตรวจสอบปลายทางของไฟล์ทุกไฟล์ว่าไม่ออกนอกโฟลเดอร์เป้าหมาย
- [ ] **XSS Prevention:** หลีกเลี่ยงการใช้ `dangerouslySetInnerHTML` หรือต้องผ่าน HTML Sanitization ก่อน Render ทุกครั้ง

---

# 7. การตรวจสอบการติดตั้งและ Deployment (DevOps & Production Readiness)

- [ ] **Web Installer Locked:** หลังจากติดตั้งครั้งแรกแล้ว `/install` และ `/api/install` ต้องส่งสถานะ `410 Gone` หรือ `403 Forbidden` ป้องกันการติดตั้งซ้ำ
- [ ] **Docker Multi-Stage Build:** `Dockerfile` ทำงานผ่าน Build Pipeline แยก Layer สำหรับ Production ชัดเจน
- [ ] **Synology NAS Standalone:** `Dockerfile.standalone` รันได้โดยไม่ต้องเชื่อมต่ออินเทอร์เน็ตเพื่อ `npm install` ภายใน Container
- [ ] **PM2 Standalone:** รันผ่าน `node .next/standalone/server.js` พร้อมระบบ Auto-restart และ Log Management
- [ ] **Security Response Headers:** มี Headers ครบถ้วน (`HSTS`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`)

---

# 8. ชุดทดสอบระบบอัตโนมัติครบ 21 รายการ (Automated Test Checklist)

รันคำสั่ง `npm test` เพื่อตรวจสอบผลลัพธ์:

- [ ] **Suite 01:** `Authentication & Password Policy` — แฮชรหัสผ่าน bcrypt, ความซับซ้อนของรหัสผ่าน, ตรวจสอบ JWT
- [ ] **Suite 02:** `Auth Session Persistence (P0)` — Cookie HttpOnly, SameSite, การ Redirect และ Logout
- [ ] **Suite 03:** `API Security & QR Verification` — 401 Unauthorized, 403 Forbidden, QR Safe View
- [ ] **Suite 04:** `API CRUD & Business Logic` — การสร้าง/แก้ไขบุคลากร, การลา, ยานพาหนะ, Clean Teardown
- [ ] **Suite 05:** `Personnel Pagination, Search & Stats` — แบ่งหน้าฐานข้อมูล, ค้นหาหลายฟิลด์, สถิติแดชบอร์ด
- [ ] **Suite 06:** `Security & Attack Simulation` — Account Lockout 5 ครั้งระงับ 15 นาที, ป้องกัน XSS/SQLi, 20 Concurrent Requests
- [ ] **Suite 07:** `Complete Security Role Matrix` — สิทธิ์ 8 บทบาทระบบ และ Scope Permission
- [ ] **Suite 08:** `Super Admin System Inspector` — สิทธิ์การเข้าถึง, การสร้างผลตรวจ และการอัปเดต Finding
- [ ] **Suite 09:** `Security Response Headers` — ตรวจสอบ Security Headers 5 รายการบนทุก Layer
- [ ] **Suite 10:** `Super Admin API Documentation` — ตรวจสอบการค้นพบ 93 Endpoints และตัวสร้างโค้ดตัวอย่าง
- [ ] **Suite 11:** `Multi-Database Support & Installer Validation` — ตรวจสอบ Database URLs (SQLite, MySQL, Postgres)
- [ ] **Suite 12:** `Database Reset & Wipe Security` — ล้างฐานข้อมูลเฉพาะ Super Admin + Password Re-auth
- [ ] **Suite 13:** `Website Maintenance Mode` — ระบบปิดปรับปรุงเว็บไซต์ชั่วคราว
- [ ] **Suite 14:** `Universal Multi-Database Backup & Restore` — สำรองและกู้คืนข้อมูลข้าม Database Engine
- [ ] **Suite 15:** `Vulnerability Fixes & Security Hardening` — ป้องกัน SSRF, Settings Allowlist, Setup Lock, NotificationRead Isolation
- [ ] **Suite 16:** `Command Dashboard & Force Readiness` — สถิติความพร้อมรบและการคำนวณวันลาข้ามปี
- [ ] **Suite 17:** `Leave Approvals Management` — Workflow การอนุมัติใบลาแบบ Transactional และป้องกัน Self-approval
- [ ] **Suite 18:** `Installer & Demo Dataset Seeder` — สร้างชุดข้อมูลตัวอย่างกำลังพล ยานพาหนะ และปฏิทิน
- [ ] **Suite 19:** `Module ZIP Uploader & Lifecycle` — ติดตั้ง/ถอนการติดตั้งโมดูล ZIP และป้องกัน Zip Slip
- [ ] **Suite 20:** `Self-Service Forgot & Reset Password Flow` — ยืนยันตัวตน, Reset Token แบบใช้ครั้งเดียว, Password Policy
- [ ] **Suite 21:** `RPB-1 Security Profile Form` — สิทธิ์แบบฟอร์ม 10 หน้า, Auto-fill, Cross-user Isolation

---

# 9. แบบฟอร์มรายงานผลการตรวจสอบระบบ (Audit Report Template)

```text
============================================================
eProfile v1.3.0 FULL SYSTEM AUDIT & PRODUCTION READINESS REPORT
============================================================

ภาพรวมระบบ:
- เวอร์ชัน: v1.3.0
- สถานะ: [READY FOR PRODUCTION / CONDITIONALLY READY / NOT READY]
- TypeScript Check: [PASS / FAIL] (npx tsc --noEmit)
- ESLint Check: [PASS / FAIL] (npm run lint)
- Automated Test Suite: [21/21 PASSED]

สรุปผลการประเมินรายด้าน:
1. สถาปัตยกรรมและการจัดโครงสร้างโมดูล (Architecture): [PASS]
2. ความมั่นคงปลอดภัยและการพิสูจน์ตัวตน (Authentication): [PASS]
3. การควบคุมสิทธิ์ตามบทบาทและสายบังคับบัญชา (RBAC & Scoping): [PASS]
4. ความปลอดภัยของ API และการตรวจสอบข้อมูล (API Security & Validation): [PASS]
5. ความสมบูรณ์ของฐานข้อมูลและการรองรับ Multi-DB (Database & Transactions): [PASS]
6. ระบบการสำรองและกู้คืนข้อมูล (Universal Backup & Restore): [PASS]
7. การจัดการไฟล์และการป้องกันช่องโหว่ (File Upload & XSS/ZipSlip): [PASS]
8. บันทึกประวัติและนิติวิทยาศาสตร์สารสนเทศ (Forensic Audit Logs): [PASS]
9. ความพร้อมด้านการติดตั้งและ Deployment (Production DevOps): [PASS]
10. ผลการทดสอบอัตโนมัติ (Automated Test Coverage): [PASS]

ข้อเสนอแนะและแผนงานระยะถัดไป (Next Actions):
1. ...
2. ...
============================================================
```
