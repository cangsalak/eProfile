# Changelog — eProfile System

รูปแบบตาม Semantic Versioning (SemVer)

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
