# 🛡️ eProfile System - Electronic Personnel Directory (v1.3.0)

[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](VERSION.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-20%2F20%20passed-brightgreen.svg)](tests/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-darkblue.svg)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](Dockerfile)

ระบบทำเนียบบุคลากรและโปรไฟล์อิเล็กทรอนิกส์ส่วนกลาง พัฒนาด้วย **Next.js 14 (App Router)**, **TypeScript**, **Prisma ORM**, **TailwindCSS (NextAdmin HQ Design System)** รองรับฐานข้อมูลหลากหลาย (**SQLite**, **PostgreSQL**, **MySQL/MariaDB**) ออกแบบตามมาตรฐานความมั่นคงปลอดภัยสารสนเทศระดับสูงและรองรับการใช้งานในระดับองค์กรภาครัฐและเอกชน

---

## 🌟 ฟีเจอร์หลัก (Key Features)

### 1. 👥 การจัดการกำลังพลและทำเนียบบุคลากร (Personnel Management & Dashboard)
- **แดชบอร์ดสถิติกำลังพล (Personnel Dashboard Metrics):** แสดงยอดสรุปกำลังพลแบบ Real-time (ยอดทั้งหมด, ปฏิบัติงานปกติ, อยู่ระหว่างการลา, จำแนกตามกอง/ฝ่าย และประเภทบุคลากร)
- **การแบ่งหน้าและค้นหาประสิทธิภาพสูง (Server-side Pagination & Multi-field Search):** รองรับการค้นหาข้ามฟิลด์ (ชื่อ, สกุล, หมายเลขประจำตัว 10 หลัก, ตำแหน่ง, สังกัด) ที่ระดับฐานข้อมูล พร้อมระบบ Safe Sorting Allowlist ป้องกัน Parameter Injection
- **การส่งออกข้อมูลที่ปลอดภัย (Secure Data Export):** ส่งออกไฟล์ CSV (Excel UTF-8 BOM) ตามตัวกรองและสิทธิ์ RBAC พร้อมบันทึก Audit Log ทุกครั้ง
- **ระบบลำดับชั้นองค์กร (Organizational Hierarchy):** โครงสร้าง 2 ระดับ (กอง/ฝ่าย/กองร้อย ➔ แผนก/หมวด/ตอน/ชุด) พร้อมคำย่อและ Dropdown เชื่อมโยง

### 2. 🪪 ระบบบัตรประจำตัวและ QR Verification (ID Badges & QR Code)
- **พิมพ์บัตรประจำตัว:** รองรับทั้งแบบ Modern, Classic และ Access Badge
- **Barcode & QR Code:** สร้าง Barcode Code128 และ QR Code อัตโนมัติรองรับรหัสประจำตัวทหาร 10 หลัก
- **การพิมพ์แบบกลุ่ม (Bulk Print):** จัดวางบัตรหลายใบบนกระดาษ A4 พร้อมสั่งพิมพ์ทันที
- **ระบบตรวจสอบความถูกต้องสาธารณะ (QR Verification):** สแกนตรวจสอบความถูกต้องผ่าน URL `/verify/[id]` โดยเปิดเผยเฉพาะข้อมูลที่จำเป็นและปลอดภัย

### 3. 📝 ระบบการลางานและการอนุมัติ (Leave Management & Approvals)
- **ฟอร์มใบลาตามระเบียบราชการ:** ใบลาพักผ่อน, ลากิจ, ลาป่วย พร้อมคำนวณวันลาและโควตาอัตโนมัติ
- **ระบบอนุมัติการลาตามสายการบังคับบัญชา (Leave Approvals Workflow):** หัวหน้าหน่วยงานอนุมัติ/ไม่อนุมัติคำร้องแบบ Scope-based แยกตามกอง/ฝ่าย พร้อมระบบ Audit Trail และป้องกันการอนุมัติตัวเอง
- **แดชบอร์ดความพร้อมรบและกำลังพล (Command Dashboard):** แสดงสถานะความพร้อมรบ อัตรากำลังพลปฏิบัติงาน และการลาข้ามปีแบบ Real-time

### 4. 📅 ปฏิทินปฏิบัติงานและข่าวสาร (Duty Calendar & Communications)
- **ปฏิทินปฏิบัติงาน (Duty Calendar):** บันทึกการปฏิบัติงาน เวรยาม การประชุม วันหยุดราชการ และข้อมูลการลาแบบเชื่อมโยงอัตโนมัติ
- **ระบบกระจายข่าวสารและการแจ้งเตือน (Notifications & News):** ประชาสัมพันธ์ข่าวสารภายในองค์กร พร้อมระบบแจ้งเตือนแบบ Per-User Isolation

### 5. 🛡️ ความมั่นคงปลอดภัยและบันทึกกิจกรรม (Security, Forensics & Audit Logs)
- **ตรวจจับ IP Address แบบ Real-Time:** บันทึก IP Address จริงของเครื่องต้นทางทุกกิจกรรม (รองรับ Proxy, Cloudflare, Nginx)
- **บันทึกกิจกรรมระบบ (Comprehensive Audit Logs):** บันทึกการเข้าสู่ระบบ, การใส่รหัสผิด, การสร้าง/แก้ไข/ลบข้อมูล, การกู้คืนฐานข้อมูล
- **AI Prompt Generator สำหรับวิเคราะห์ Log:** สร้าง Prompt สำหรับ ChatGPT เพื่อตรวจจับภัยคุกคาม (Anomaly & Threat Detection) และ Root Cause Analysis ด้วยคลิกเดียว
- **การป้องกันการโจมตี (Account Lockout & Rate Limiting):** ระงับบัญชี 15 นาทีอัตโนมัติเมื่อใส่รหัสผ่านผิด 5 ครั้ง และจำกัดความถี่การยิง Request
- **Security Response Headers:** ป้องกัน Clickjacking, MIME-Sniffing, XSS ด้วยมาตรฐานความปลอดภัย 5 หัวข้อ (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)

### 6. 🔍 เครื่องมือวินิจฉัยระบบและเอกสาร API (System Inspector & API Docs)
- **Super Admin System Inspector (`/manage/inspector`):** เครื่องมือวินิจฉัย DOM, การสะกดคำภาษาไทย, ลิงก์เสีย, Accessibility, Responsive Layout และ Security Headers ทั่วทั้งโปรเจกต์
- **Interactive API Documentation (`/manage/api-docs`):** แคตตาล็อกเอกสาร API 83 Endpoints อัตโนมัติ พร้อม Role Matrix และตัวสร้างโค้ดตัวอย่าง (cURL, JavaScript, TypeScript, Python, PHP)
- **ระบบจัดการโมดูลแบบ Plug-and-Play (Module ZIP Uploader):** ติดตั้ง ถอดถอน และเปิด/ปิด โมดูลเสริมด้วยไฟล์ ZIP

---

## 📂 โครงสร้างโมดูลาร์ของโปรเจกต์ (Modular Architecture)

```text
eprofile/
├── prisma/                 
│   ├── schema.prisma       # โครงสร้างฐานข้อมูล (Prisma Schema 18 Models)
│   ├── seed.ts             # ข้อมูลเริ่มต้นสำหรับระบบ
│   └── dev.db              # ไฟล์ฐานข้อมูล SQLite
├── public/                 # Static Assets และโฟลเดอร์ uploads/
├── src/
│   ├── app/                # Next.js 14 App Router (Pages, Layouts & REST APIs)
│   ├── components/         # Shared UI Components & Layouts (DashboardShell, SearchBar)
│   ├── lib/                # Utilities, Prisma Client, Auth Guards, Encryption, Audit
│   └── modules/            # Modular Subsystem Architecture
│       ├── backup/         # โมดูลสำรองและกู้คืนฐานข้อมูล (Universal JSON / SQLite)
│       ├── badges/         # โมดูลบัตรประจำตัวและระบบพิมพ์บาร์โค้ด
│       ├── calendar/       # โมดูลปฏิทินปฏิบัติงานและเวรยาม
│       ├── command-dashboard/ # โมดูลแดชบอร์ดความพร้อมรบสำหรับผู้บังคับบัญชา
│       ├── contacts/       # โมดูลข้อมูลการติดต่อและกล่องข้อความ
│       ├── leaves/         # โมดูลจัดการการลาและระบบอนุมัติใบลา
│       ├── menus/          # โมดูลจัดการเมนูและแถบนำทาง
│       ├── module-manager/ # โมดูลติดตั้งและจัดการส่วนขยาย
│       ├── news/           # โมดูลข่าวสารและระบบแจ้งเตือน
│       ├── personnel/      # โมดูลทำเนียบกำลังพล สถิติ และผังหน่วยงาน
│       ├── system-inspector/ # โมดูลวินิจฉัยระบบและเอกสาร API
│       └── theme/          # โมดูลปรับแต่งธีม (NextAdmin HQ Tokens)
├── tests/                  # Automated Test Suite (19 Suites ครบถ้วน)
├── Dockerfile              # Production Multi-Stage Dockerfile
├── Dockerfile.standalone   # Fast Standalone Dockerfile (Zero-Download)
├── docker-compose.yml      # Docker Compose Orchestration
└── docker-entrypoint.sh    # Container Lifecycle & Database Init Script
```

---

## 🚀 วิธีการติดตั้งและใช้งานในรูปแบบต่างๆ (Deployment & Usage Methods)

### ข้อกำหนดเบื้องต้น (Prerequisites)
- **Node.js:** เวอร์ชัน 18.17.0 หรือ 20.x ขึ้นไป
- **npm:** เวอร์ชัน 9.x ขึ้นไป (หรือ Docker Engine / Docker Desktop)

---

### วิธีที่ 1: การรันในโหมดพัฒนา (Development Mode)

เหมาะสำหรับนักพัฒนาที่ต้องการแก้ไขโค้ดและทดสอบระบบบนเครื่อง Local:

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. คัดลอกไฟล์ Environment
cp .env.example .env

# 3. เตรียมฐานข้อมูล SQLite และสร้าง Prisma Client
npx prisma generate
npx prisma db push
npx prisma db seed

# 4. สตาร์ต Development Server
npm run dev
```
เปิดเบราว์เซอร์เข้าใช้งานที่: `http://localhost:3000`

---

### วิธีที่ 2: การรันบน Production Server ด้วย PM2 Daemon (แนะนำสำหรับ Bare-metal / VPS)

เหมาะสำหรับ Linux/macOS Server ที่ต้องการความเสถียร มีระบบ Auto-Restart และ Zero Downtime:

```bash
# 1. ติดตั้ง Dependencies สำหรับ Production
npm ci

# 2. Build โปรเจกต์ Next.js
npm run build

# 3. สตาร์ตระบบด้วย PM2
pm2 start npm --name "eprofile" -- start

# คำสั่งจัดการระบบ:
pm2 status          # ตรวจสอบสถานะการทำงาน
pm2 logs eprofile   # ดู Log การทำงานแบบ Real-time
pm2 restart eprofile# สั่งรีสตาร์ทเซอร์วิส
pm2 save            # บันทึกสถานะเพื่อให้เปิดอัตโนมัติเมื่อเปิดเครื่อง
```

---

### วิธีที่ 3: การรันผ่าน Docker Compose (Standard Multi-Stage Build)

เหมาะสำหรับองค์กรที่มีการเชื่อมต่ออินเทอร์เน็ตปกติ และต้องการรันระบบแบบ Containerized:

```bash
# สั่ง Build และ Start Container ในโหมด Background
docker compose up -d --build

# ตรวจสอบสถานะและ Log:
docker compose ps
docker compose logs -f
```
ระบบจะเปิดให้บริการที่: `http://<IP-Address>:8085`

---

### วิธีที่ 4: การรันด้วย `Dockerfile.standalone` (⭐ แนะนำสำหรับ Synology NAS / Offline Server)

เหมาะสำหรับ **Synology NAS (Container Manager)**, **QNAP**, หรือ **Server ที่มีข้อจำกัดด้าน DNS/Network** เนื่องจากวิธีนี้จะใช้โค้ดที่ Build เสร็จแล้วโดย **ไม่ต้องดาวน์โหลดผ่าน `npm install` ซ้ำใน Docker** (Build เร็วภายในไม่กี่วินาที และไม่มีปัญหา `getaddrinfo EAI_AGAIN`):

```bash
# 1. สั่ง Build Standalone Bundle บนเครื่องเครื่องพัฒนา
npm run build

# 2. Build Docker Image ด้วย Dockerfile.standalone
docker build -f Dockerfile.standalone -t eprofile:latest .

# 3. สตาร์ต Container พร้อม Mount Persistent Volumes
docker run -d \
  --name eprofile-app \
  --restart always \
  -p 8085:3000 \
  -v eprofile_data:/app/data \
  -v eprofile_uploads:/app/public/uploads \
  eprofile:latest
```

---

### วิธีที่ 5: การติดตั้งผ่าน Web Installation Wizard (GUI Installer)

หากต้องการตั้งค่าและเลือกประเภทฐานข้อมูล (**SQLite**, **PostgreSQL**, **MySQL/MariaDB**) ผ่านหน้าเว็บ:

1. เปิดเบราว์เซอร์ไปยัง URL: `http://localhost:3000/install`
2. เลือก Database Engine ที่ต้องการ (ระบบมีปุ่มทดสอบการเชื่อมต่อ Test Connection)
3. กำหนดรหัสผ่าน Super Admin
4. เลือกว่าต้องการติดตั้งชุดข้อมูลตัวอย่าง (Demo Dataset) หรือไม่
5. คลิก **"ยืนยันและติดตั้งระบบ"** ระบบจะสร้าง Schema และเริ่มต้นใช้งานทันที

---

## 🧪 การทดสอบระบบอัตโนมัติ (Automated Test Suite)

ระบบมาพร้อมกับชุดทดสอบแบบอัตโนมัติครบถ้วน **19 Test Suites** ครอบคลุม Security, RBAC, Data Integrity, Forensic Audit และ Attack Simulation:

```bash
npm test
```

**ชุดทดสอบ 19 รายการประกอบด้วย:**
1. `Authentication & Password Policy`: ทดสอบการแฮชรหัสผ่าน, กฎความปลอดภัย, การตรวจสอบ JWT
2. `Auth Session Persistence (P0)`: ตรวจสอบความถูกต้องของคุกกี้ Session, การรีไดเรกต์ และ Logout Invalidation
3. `API Security & QR Verification`: ตรวจสอบ 401 Unauthorized, 403 Forbidden และความปลอดภัยของ QR
4. `API CRUD & Business Logic`: ตรวจสอบการสร้าง/แก้ไขบุคลากร, ใบลา, ยานพาหนะ และ Teardown
5. `Personnel Pagination, Search & Stats`: ตรวจสอบการแบ่งหน้า, ค้นหาหลายฟิลด์ และสถิติแดชบอร์ด
6. `Security & Attack Simulation`: ทดสอบ Account Lockout, ป้องกัน XSS, SQL Injection และ 20 Concurrent Requests
7. `Complete Security Role Matrix`: ตรวจสอบสิทธิ์ 6 ระดับ (ANONYMOUS, USER, OFFICER, EDITOR, ADMIN, SUPER_ADMIN)
8. `Super Admin System Inspector`: ตรวจสอบสิทธิ์, การสร้างรายงาน, และการอัปเดต Finding Status
9. `Security Response Headers`: ตรวจสอบ Security Headers 5 หัวข้อบน Public, Auth และ API
10. `Super Admin API Documentation`: ตรวจสอบการสแกน 83 Endpoints และการสร้างโค้ดตัวอย่าง
11. `Multi-Database Support & Installer Validation`: ตรวจสอบ Connection URL ของ SQLite, PostgreSQL, MySQL
12. `Database Reset & Wipe Security`: ตรวจสอบความปลอดภัยในการล้างฐานข้อมูล (401/403 Block, Password Re-auth)
13. `Website Maintenance Mode`: ตรวจสอบระบบปิดปรับปรุงเว็บไซต์ชั่วคราว
14. `Universal Multi-Database Backup & Restore`: ตรวจสอบการสำรองและกู้คืนข้ามฐานข้อมูลแบบ Universal JSON
15. `Vulnerability Fixes & Security Hardening`: ทดสอบป้องกัน SSRF, Settings Allowlist, Leaves RBAC, 410 Setup Lock, NotificationRead Isolation
16. `Command Dashboard & Force Readiness`: ตรวจสอบสถิติความพร้อมรบและการคำนวณวันลาข้ามปี
17. `Leave Approvals Management`: ตรวจสอบ Workflow การอนุมัติใบลาแบบ Transactional และป้องกัน Self-approval
18. `Installer & Demo Dataset Seeder`: ตรวจสอบการสร้างชุดข้อมูลตัวอย่างกำลังพล ยานพาหนะ เอกสาร และปฏิทิน
19. `Module ZIP Uploader & Lifecycle`: ตรวจสอบการติดตั้ง/ถอนการติดตั้งโมดูลเสริมด้วยไฟล์ ZIP และป้องกัน Zip Slip Attack

---

## 🔒 ข้อมูลการเข้าสู่ระบบเริ่มต้น (Default Credentials)

เมื่อติดตั้งระบบครั้งแรกผ่านหน้า `/setup` หรือ `/install`:
- **Super Admin Username:** `admin` หรือเลขประจำตัว 10 หลัก
- **Default Password:** `admin1234` *(ระบบจะบังคับให้เปลี่ยนรหัสผ่านทันทีเมื่อเข้าสู่ระบบครั้งแรก)*

---

## 💾 การสำรองและกู้คืนข้อมูล (Backup & Restore)

- **Universal JSON Backup (ข้ามฐานข้อมูล):** สำรองข้อมูลเป็นไฟล์ JSON เพื่อนำไปกู้คืนบนฐานข้อมูลชนิดอื่นได้ (เช่น ย้ายจาก SQLite ไปยัง PostgreSQL/MySQL)
- **Native SQLite Backup (.db):** สำรองไฟล์ฐานข้อมูล SQLite แบบไบนารีโดยตรง
- **กู้คืนข้อมูลผ่านหน้าเว็บ:** เข้าสู่ระบบด้วยสิทธิ์ `SUPER_ADMIN` ไปที่ **การจัดการระบบ ➔ สำรองและกู้คืนข้อมูล**

---

## 📜 รายการคำสั่งที่เป็นประโยชน์ (Useful Scripts)

| คำสั่ง | คำอธิบาย |
|---|---|
| `npm run dev` | เริ่มต้น Development Server ที่พอร์ต 3000 |
| `npm run build` | ทำการ Type-check และสร้าง Production Standalone Bundle |
| `npm start` | รันเซิร์ฟเวอร์ Production |
| `npm test` | รันชุดทดสอบอัตโนมัติครบทั้ง 19 Test Suites |
| `npm run lint` | ตรวจสอบคุณภาพโค้ดด้วย ESLint |
| `npx prisma generate` | สร้าง Type Definitions ล่าสุดของ Prisma Client |
| `npx prisma db push` | ซิงค์ Schema ใน `schema.prisma` เข้าสู่ฐานข้อมูล |
| `docker compose up -d --build` | สั่ง Build และรันระบบผ่าน Docker Compose |

---

## 📄 ลิขสิทธิ์ (License)

โปรเจกต์นี้เผยแพร่ภายใต้ลิขสิทธิ์ [MIT License](LICENSE)