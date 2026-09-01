# 🛡️ eProfile System - Electronic Personnel Directory (v1.3.0)

[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](VERSION.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-11%2F11%20passed-brightgreen.svg)](tests/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-darkblue.svg)](https://www.prisma.io/)

ระบบทำเนียบบุคลากรและโปรไฟล์อิเล็กทรอนิกส์ส่วนกลาง พัฒนาด้วย **Next.js 14 (App Router)**, **TypeScript**, **Prisma ORM**, **TailwindCSS** รองรับฐานข้อมูลหลากหลาย (**SQLite**, **PostgreSQL**, **MySQL/MariaDB**) ออกแบบตามมาตรฐานความมั่นคงปลอดภัยสารสนเทศและรองรับการใช้งานในระดับองค์กร

---

## 🌟 ฟีเจอร์หลัก (Key Features)

### 1. 👥 การจัดการกำลังพลและทำเนียบบุคลากร (Personnel Management & Dashboard)
- **แดชบอร์ดสถิติกำลังพล (Personnel Dashboard Metrics):** แสดงยอดสรุปกำลังพลแบบ Real-time (ยอดทั้งหมด, ปฏิบัติงานปกติ, ไม่ปกติ, จำแนกตามกอง/ฝ่าย และประเภทบุคลากร)
- **การแบ่งหน้าและค้นหาประสิทธิภาพสูง (Server-side Pagination & Multi-field Search):** รองรับการค้นหาข้ามฟิลด์ (ชื่อ, สกุล, หมายเลขประจำตัว 10 หลัก, ตำแหน่ง, สังกัด) ที่ระดับฐานข้อมูล พร้อมระบบ Safe Sorting Allowlist ป้องกัน Parameter Injection
- **การส่งออกข้อมูลที่ปลอดภัย (Secure Data Export):** ส่งออกไฟล์ CSV (Excel UTF-8 BOM) ตามตัวกรองและสิทธิ์ RBAC พร้อมบันทึก Audit Log ทุกครั้ง
- **ระบบลำดับชั้นองค์กร (Organizational Hierarchy):** โครงสร้าง 2 ระดับ (กอง/ฝ่าย/กองร้อย ➔ แผนก/หมวด/ตอน/ชุด) พร้อมคำย่อและ Dropdown เชื่อมโยง

### 2. 🪪 ระบบบัตรประจำตัวและ QR Verification (ID Badges & QR Code)
- **พิมพ์บัตรประจำตัว:** รองรับทั้งแบบ Modern, Classic และ Access Badge
- **Barcode & QR Code:** สร้าง Barcode Code128 และ QR Code อัตโนมัติรองรับรหัสประจำตัวทหาร 10 หลัก
- **การพิมพ์แบบกลุ่ม (Bulk Print):** จัดวางบัตรหลายใบบนกระดาษ A4 พร้อมสั่งพิมพ์ทันที
- **ระบบตรวจสอบความถูกต้องสาธารณะ (QR Verification):** สแกนตรวจสอบความถูกต้องผ่าน URL `/verify/[id]` โดยเปิดเผยเฉพาะข้อมูลที่จำเป็นและปลอดภัย

### 3. 📝 ระบบการลางานและเอกสารราชการ (Leave Management & Forms)
- **ฟอร์มใบลาตามระเบียบราชการ:** ใบลาพักผ่อน, ลากิจ, ลาป่วย พร้อมคำนวณวันลาอัตโนมัติ
- **พิมพ์และส่งออกเอกสาร:** สร้างเอกสารพร้อมพิมพ์ตามรูปแบบของทางราชการ
- **ระบบจัดการยานพาหนะ (Vehicle Registration):** ขึ้นทะเบียนและออกบัตรผ่านยานพาหนะของกำลังพล

### 4. 🛡️ ความมั่นคงปลอดภัยและบันทึกกิจกรรม (Security, Forensics & Audit Logs)
- **การตรวจจับ IP Address แบบ Real-Time:** บันทึก IP Address จริงของเครื่องต้นทางทุกกิจกรรม (รองรับ Proxy, Cloudflare, Nginx)
- **บันทึกกิจกรรมระบบ (Comprehensive Audit Logs):** บันทึกการเข้าสู่ระบบ, การใส่รหัสผิด, การสร้าง/แก้ไข/ลบข้อมูล, การกู้คืนฐานข้อมูล
- **AI Prompt Generator สำหรับวิเคราะห์ Log:** สร้าง Prompt สำหรับ ChatGPT เพื่อตรวจจับภัยคุกคาม (Anomaly & Threat Detection) และ Root Cause Analysis ด้วยคลิกเดียว
- **การป้องกันการโจมตี (Account Lockout & Rate Limiting):** ระงับบัญชี 15 นาทีอัตโนมัติเมื่อใส่รหัสผ่านผิด 5 ครั้ง และจำกัดความถี่การยิง Request
- **Security Response Headers:** ป้องกัน Clickjacking, MIME-Sniffing, XSS ด้วยมาตรฐานความปลอดภัย 5 หัวข้อ (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)

### 5. 🔍 เครื่องมือวินิจฉัยระบบและเอกสาร API (System Inspector & API Docs)
- **Super Admin System Inspector (`/manage/inspector`):** เครื่องมือวินิจฉัย DOM, การสะกดคำภาษาไทย, ลิงก์เสีย, Accessibility, Responsive Layout และ Security Headers ทั่วทั้งโปรเจกต์
- **Interactive API Documentation (`/manage/api-docs`):** แคตตาล็อกเอกสาร API 69 Endpoints อัตโนมัติ พร้อม Role Matrix และตัวสร้างโค้ดตัวอย่าง (cURL, JavaScript, TypeScript, Python, PHP)

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```text
eprofile/
├── public/                 # Static Assets (รูปภาพ โลโก้ ไอคอน)
├── prisma/                 
│   ├── schema.prisma       # โครงสร้างฐานข้อมูล (Prisma Schema 18 Models)
│   ├── seed.ts             # ข้อมูลเริ่มต้นสำหรับระบบ
│   └── dev.db              # ไฟล์ฐานข้อมูล SQLite
├── src/
│   ├── app/                # Next.js App Router (Pages & API Routes)
│   │   ├── (auth)/         # หน้า Authentication (login, forgot-password, install, setup)
│   │   ├── (member)/       # หน้าระบบสมาชิกและผู้ดูแล (dashboard, manage, profile, leave)
│   │   ├── (public)/       # หน้าสาธารณะ (home, news, about, services, contact, verify)
│   │   └── api/            # REST API Endpoints ทั้งหมด
│   ├── components/         # Modular React Components
│   │   ├── badges/         # ระบบและแบบบัตรประจำตัว
│   │   ├── inspector/      # โมดอลและเครื่องมือ System Inspector
│   │   ├── layout/         # TopNavbar, Sidebar, ProfileDropdown
│   │   ├── leaves/         # ระบบฟอร์มใบลาและพิมพ์ใบลา
│   │   ├── personnel/      # ตารางบุคลากร แดชบอร์ดสถิติ และฟอร์มข้อมูลกำลังพล
│   │   └── settings/       # ฟอร์มตั้งค่าระบบ สำรองข้อมูล จัดการสิทธิ์
│   ├── lib/                # Utilities, Database, Audit, Auth Guards, Inspector, Logger
│   └── types/              # TypeScript Interfaces & Types
├── tests/                  # Automated Test Suite (10 Test Suites)
│   ├── admin/              # ทดสอบ Inspector และ API Docs
│   ├── api/                # ทดสอบ CRUD, Pagination, Session Persistence
│   ├── security/           # ทดสอบ Attack Simulation, Role Matrix, Headers
│   └── run-all.ts          # ตัวรันชุดทดสอบทั้งหมด
├── .env.example            # ตัวอย่างการกำหนดค่า Environment Variables
├── package.json            # Node.js Dependencies & Scripts
├── CHANGELOG.md            # ประวัติการอัปเดตเวอร์ชัน
├── VERSION.md              # รายละเอียดเวอร์ชันและ Release Policy
└── README.md               # เอกสารคู่มือโปรเจกต์
```

---

## 🚀 การติดตั้งและรันระบบ (Installation & Setup)

### ข้อกำหนดเบื้องต้น (Prerequisites)
- **Node.js:** เวอร์ชัน 18.17.0 หรือ 20.x ขึ้นไป
- **npm:** เวอร์ชัน 9.x ขึ้นไป

### 1. การรันระบบในโหมดพัฒนา (Development Mode)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. ตั้งค่าไฟล์ Environment
cp .env.example .env

# 3. เตรียมฐานข้อมูล SQLite
npx prisma generate
npx prisma db push

# 4. รัน Dev Server
npm run dev
```
เปิดเบราว์เซอร์เข้าใช้งานที่: `http://localhost:3000`

---

### 2. การรันระบบบน Production Server ด้วย PM2

```bash
# 1. Build โปรเจกต์
npm run build

# 2. เริ่มต้นการทำงานด้วย PM2 (Zero-Downtime Daemon)
pm2 start npm --name "eprofile" -- start

# คำสั่งจัดการ PM2:
pm2 status          # ดูสถานะการทำงาน
pm2 logs eprofile   # ดูบันทึกการทำงาน
pm2 restart eprofile# สั่งรีสตาร์ทระบบ
```

---

### 3. การติดตั้งด้วย Docker (Production Single Command)

```bash
docker run -d \
  --name eprofile \
  --restart always \
  -p 3000:3000 \
  -v eprofile_data:/app/prisma \
  ghcr.io/cangsalak/eprofile:main
```

---

## 🧪 การทดสอบระบบอัตโนมัติ (Automated Test Suite)

ระบบมาพร้อมกับ Automated Test Suite ครบถ้วน 10 ชุดทดสอบ ครอบคลุมทั้ง Unit Test, API Security, Session Persistence, Brute-force Simulation และ Role Access Matrix:

```bash
npm test
```

**ชุดทดสอบ 10 รายการประกอบด้วย:**
1. `Authentication & Password Policy`: ทดสอบการแฮชรหัสผ่าน, กฎความปลอดภัย, การตรวจสอบ JWT
2. `Auth Session Persistence (P0)`: ตรวจสอบความถูกต้องของคุกกี้ Session, การรีไดเรกต์ และ Logout Invalidation
3. `API Security & QR Verification`: ตรวจสอบ 401 Unauthorized, 403 Forbidden และความปลอดภัยของ QR
4. `API CRUD & Business Logic`: ตรวจสอบการสร้าง/แก้ไขบุคลากร, ใบลา, ยานพาหนะ และ Teardown
5. `Personnel Pagination, Search & Stats`: ตรวจสอบการแบ่งหน้า, ค้นหาหลายฟิลด์ และสถิติแดชบอร์ด
6. `Security & Attack Simulation`: ทดสอบ Account Lockout, ป้องกัน XSS, SQL Injection และ 20 Concurrent Requests
7. `Complete Security Role Matrix`: ตรวจสอบสิทธิ์ 6 ระดับ (ANONYMOUS, USER, OFFICER, EDITOR, ADMIN, SUPER_ADMIN)
8. `Super Admin System Inspector`: ตรวจสอบสิทธิ์, การสร้างรายงาน, และการอัปเดต Finding Status
9. `Security Response Headers`: ตรวจสอบ Security Headers 5 หัวข้อบน Public, Auth และ API
10. `Super Admin API Documentation`: ตรวจสอบการสแกน 69 Endpoints และการสร้างโค้ดตัวอย่าง

---

## 🔒 ข้อมูลการเข้าสู่ระบบเริ่มต้น (Default Credentials)

เมื่อติดตั้งระบบครั้งแรกผ่านหน้า `/setup` หรือ `/install`:
- **Super Admin Username:** `admin` หรือเลขประจำตัว 10 หลัก
- **Default Password:** `admin1234` *(ระบบจะบังคับให้เปลี่ยนรหัสผ่านทันทีเมื่อเข้าสู่ระบบ)*

---

## 💾 การสำรองและกู้คืนข้อมูล (Backup & Restore)

- **ผ่านหน้าเว็บ:** เข้าสู่ระบบด้วยสิทธิ์ `ADMIN` หรือ `SUPER_ADMIN` ไปที่ **ตั้งค่าระบบ ➔ การบำรุงรักษาระบบ** เพื่อคลิก **ดาวน์โหลด Backup (.db)** หรืออัปโหลดไฟล์กู้คืน
- **ผ่านไฟล์ระบบ:** คัดลอกไฟล์ `prisma/dev.db` ไปเก็บไว้ในที่ปลอดภัย

---

## 📜 รายการคำสั่งที่เป็นประโยชน์ (Useful Scripts)

| คำสั่ง | คำอธิบาย |
|---|---|
| `npm run dev` | เริ่มต้น Development Server ที่พอร์ต 3000 |
| `npm run build` | ทำการ Type-check และสร้าง Production Bundle |
| `npm start` | รันเซิร์ฟเวอร์ Production |
| `npm test` | รันชุดทดสอบอัตโนมัติครบ 10 Suites |
| `npm run lint` | ตรวจสอบคุณภาพโค้ดด้วย ESLint |
| `npx prisma generate` | สร้าง Type Definitions ล่าสุดของ Prisma Client |
| `npx prisma db push` | ซิงค์ Schema ใน `schema.prisma` เข้าสู่ฐานข้อมูล SQLite |

---

## 📄 ลิขสิทธิ์ (License)

โปรเจกต์นี้เผยแพร่ภายใต้ลิขสิทธิ์ [MIT License](LICENSE)