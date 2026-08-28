# eProfile System - Electronic Personnel Directory

ระบบทำเนียบบุคลากรและโปรไฟล์อิเล็กทรอนิกส์ส่วนกลาง พัฒนาด้วย **Next.js 14 (App Router)**, **TypeScript**, และ **Docker**

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```
/Volumes/web/eprofile/
├── public/                 # ไฟล์ประเภท Static Assets (รูปภาพ/ไอคอน)
├── src/
│   ├── app/                # Next.js App Router (globals.css, layout.tsx, page.tsx)
│   ├── components/         # Modular Components
│   │   ├── Navbar.tsx             # แถบเมนูด้านบน
│   │   ├── BannerSummary.tsx      # บอร์ดสรุปจำนวนบุคลากร
│   │   ├── SearchFilter.tsx       # ค้นหาและกรองตามกอง/ฝ่าย
│   │   ├── PersonnelCard.tsx      # การ์ดบุคลากรแบบ 3D
│   │   ├── ProfileModal.tsx       # หน้าต่างดูประวัติยศ ตำแหน่ง วุฒิการศึกษา
│   │   ├── AddPersonnelModal.tsx  # ฟอร์มเพิ่มบุคลากรใหม่
│   │   └── PrintBadgeView.tsx     # เลย์เอาต์สำหรับพิมพ์บัตรประจำตัว
│   ├── data/
│   │   └── personnel.json  # ฐานข้อมูลตัวอย่างบุคลากร
│   └── types/
│       └── personnel.ts    # TypeScript Interface ของบุคลากร
├── Dockerfile              # Production Multi-stage Docker Container
├── docker-compose.yml      # Docker Compose Config (Port 8085:3000)
├── next.config.js          # Next.js Config (Standalone output)
├── package.json            # Node.js dependencies
└── tsconfig.json           # TypeScript configuration
```

## 🚀 การสั่งรันด้วย Docker (Docker Execution)

```bash
# 1. เข้าสู่โฟลเดอร์โปรเจกต์
cd /Volumes/web/eprofile

# 2. สั่ง build และรัน Container ในโหมด Background
docker compose up -d --build
```

เข้าใช้งานได้ที่พอร์ต: `http://localhost:8085` หรือ `http://192.168.2.35:8085`
