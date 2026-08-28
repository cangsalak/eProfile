# eProfile System - Electronic Personnel Directory

ระบบทำเนียบบุคลากรและโปรไฟล์อิเล็กทรอนิกส์ส่วนกลาง พัฒนาด้วย **Next.js 14 (App Router)**, **TypeScript**, **Prisma ORM** และใช้ฐานข้อมูล **SQLite**

## 🌟 ฟีเจอร์หลัก (Key Features)

- **ระบบจัดการบุคลากร (Personnel Management):** ค้นหา, ดูโปรไฟล์, เพิ่ม/แก้ไข ข้อมูลกำลังพล
- **ระบบพิมพ์บัตรประจำตัว (ID Badge Printing):** 
  - รองรับการพิมพ์บัตรทั้งรูปแบบ Modern และ Classic
  - สร้าง Barcode และ QR Code อัตโนมัติ (รองรับรหัสประจำตัวทหาร 10 หลัก)
  - พิมพ์บัตรแบบกลุ่ม (Bulk Print) บนกระดาษ A4
- **ระบบการลางาน (Leave Management):** ระบบสร้างใบลาพักผ่อน, ลากิจ, ลาป่วย พร้อมส่งออกเป็น PDF ตามรูปแบบของทางราชการ
- **ระบบยานพาหนะ (Vehicle Registration):** จัดการและขึ้นทะเบียนยานพาหนะของกำลังพล
- **การตั้งค่าและดูแลระบบ (System Settings & Maintenance):**
  - ตั้งค่าชื่อระบบ, โลโก้, รายการตัวเลือกแบบ Dropdown
  - สำรองข้อมูล (Backup) และกู้คืนข้อมูล (Restore) ฐานข้อมูล SQLite ได้ผ่านหน้าเว็บ
- **ระบบยืนยันตัวตน (Authentication):** ใช้ระบบ JWT Authentication พร้อมระบบ Role-based access control (SUPER_ADMIN, ADMIN, OFFICER, USER)

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```text
/Users/cangsalak/project/eprofile/
├── public/                 # ไฟล์ประเภท Static Assets (รูปภาพ/โลโก้/ไอคอน)
├── prisma/                 
│   ├── schema.prisma       # โครงสร้างฐานข้อมูล (Prisma Schema)
│   └── dev.db              # ไฟล์ฐานข้อมูล SQLite
├── src/
│   ├── app/                # Next.js App Router (หน้าเว็บและ API Routes)
│   │   ├── api/            # Backend API (auth, personnel, leaves, settings, etc.)
│   │   └── ...             # หน้า Pages ต่างๆ (profile, manage, leave, settings)
│   ├── components/         # Modular React Components
│   │   ├── badges/         # ระบบและแบบบัตรประจำตัว
│   │   ├── leaves/         # ระบบฟอร์มใบลา
│   │   ├── vehicles/       # ระบบยานพาหนะ
│   │   └── layout/         # โครงสร้างหลัก (Navbar, Sidebar)
│   ├── lib/                # Utilities, Database connections, Notifications
│   └── types/              # TypeScript Interfaces
├── .env                    # Environment variables (Database URL, JWT Secret)
├── package.json            # Node.js dependencies
└── README.md               # เอกสารคู่มือ
```

## 🚀 การติดตั้งและรันระบบ (Installation & Execution)

### 1. การรันระบบผ่าน Node.js (PM2) สำหรับ Production

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. ซิงค์โครงสร้างฐานข้อมูล
npx prisma generate
npx prisma db push

# 3. Build โปรเจกต์
npm run build

# 4. รันโปรเจกต์ด้วย PM2 (Background Process)
pm2 start npm --name "eprofile" -- start
```
เข้าใช้งานได้ที่: `http://localhost:3000` (หรือตามพอร์ตที่กำหนด)

### 2. การรันระบบด้วย Docker (ทางเลือก)

```bash
# สั่ง build และรัน Container ในโหมด Background
docker compose up -d --build
```

## 🔒 ข้อมูลการเข้าสู่ระบบเบื้องต้น (Default Login)
เมื่อทำการ Setup ครั้งแรก ระบบจะสร้างผู้ดูแลระบบ (Admin)
- **Username:** 10-digit military ID (เลขประจำตัว 10 หลัก) หรือ 13-digit citizen ID
- **Password:** โดยปกติจะถูกตั้งเป็น `เลขประจำตัว 10 หลัก` สำหรับผู้ใช้ใหม่

## 💾 การสำรองข้อมูล (Backup)
ข้อมูลทั้งหมด (บุคลากร, ใบลา, ยานพาหนะ, การตั้งค่า) จะถูกจัดเก็บไว้ในไฟล์ `prisma/dev.db` 
- สามารถสำรองข้อมูลโดยไปที่ **ตั้งค่าระบบ -> การบำรุงรักษาระบบ** และคลิก **ดาวน์โหลด Backup**
- หรือทำการคัดลอกไฟล์ `prisma/dev.db` ไว้ในที่ปลอดภัย