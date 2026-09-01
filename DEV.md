# eProfile v1.2.0 Development Checklist

> **Release Target**: v1.2.0 (Personnel Management Enhancement, System Inspector & API Documentation)  
> **Release Date**: 2026-09-01  
> **Status**: Verified & Ready for Tagging  

---

## 🎯 Phase Checklist

### Core Features (v1.2.0)
- [x] **Baseline Verified**: `tsc`, `eslint`, `build`, `test` ผ่าน 100%
- [x] **Server-side Pagination**: `GET /api/personnel` รองรับ `page` & `limit` (1 <= limit <= 100)
- [x] **Multi-field Search**: ค้นหาครอบคลุมชื่อ, สกุล, หมายเลขประจำตัว, ตำแหน่ง, สังกัด ที่ระดับ Database
- [x] **Personnel Filtering**: กรองตาม `department`, `subDepartment`, `status`, `personnelType`
- [x] **Safe Sorting**: เรียงลำดับตาม Allowlist ป้องกัน Parameter Injection
- [x] **Personnel Dashboard**: แสดงสถิติและกราฟสรุปยอดกำลังพลผ่าน `GET /api/personnel/stats`
- [x] **Secure Export**: ส่งออก Excel/CSV ผ่าน `GET /api/personnel/export` พร้อมสิทธิ์ RBAC และ Audit Log
- [x] **Document Foundation**: เพิ่มโมเดล `PersonnelDocument` และ API พื้นฐานสำหรับแนบเอกสาร
- [x] **Super Admin System Inspector**:
  - [x] `SUPER_ADMIN` only RBAC access on UI and API
  - [x] Current Page Live Inspection (DOM, Typography, Links, Images, Buttons, Forms, Accessibility, Responsive, Security Headers)
  - [x] Thai Dictionary & Placeholder detection
  - [x] Inspection history & finding management
  - [x] AI Fix Prompt Generator for ChatGPT
  - [x] Sensitive data protection (No password/JWT/PII logging)
  - [x] No automatic code/database mutation
- [x] **Super Admin API Documentation / API Reference (DocuSeal-style)**:
  - [x] API Discovery (Dynamic scan from `src/app/api/**/route.ts` - 69 endpoints)
  - [x] API Categories & Method filtering
  - [x] API Detail & Purpose description
  - [x] Authentication & Authorization Matrix
  - [x] Path Parameters & Query Parameters
  - [x] Request Body & Validation Schemas
  - [x] Responses & Error Documentation
  - [x] Multi-language Code Generator (cURL, JavaScript, TypeScript, Python, PHP)
  - [x] Copy Button (`✓ Copied` feedback & accessible ARIA labels)
  - [x] Multi-field Search & Filters
  - [x] Responsive UI & Accessibility
  - [x] Sensitive Data Protection (Zero secret/credential exposure)
  - [x] `SUPER_ADMIN` Access Control (401 for anon, 403 for user/officer/editor/admin, 200 for super_admin)
  - [x] Security Tests & Regression Tests
  - [x] TypeScript PASS, ESLint PASS, Tests PASS, Build PASS

### Security & Hardening
- [x] **Authentication**: JWT `HS256` + HttpOnly Cookies
- [x] **Authorization / RBAC**: ตรวจ `requireAuth` และ `requireRole` ทุก API
- [x] **IDOR & Data Protection**: ตรวจสอบ `isValidId` และสิทธิ์ความเป็นเจ้าของ/Admin
- [x] **Input Validation**: ใช้ Zod Schema และ Safe Parameter Parsing
- [x] **Security Response Headers**: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`
- [x] **File Upload Security**: MIME type whitelist, Extension whitelist, Path traversal guard (max 10MB)
- [x] **Sensitive Data**: ปิดกั้น Password hashes และ Sensitive fields จาก Public responses
- [x] **Audit Logging**: บันทึก `INSPECT_PAGE`, `CHANGE_FINDING_STATUS`, `EXPORT_PERSONNEL`, `DOCUMENT_UPLOADED`

### Code Quality & Testing
- [x] **TypeScript**: `npx tsc --noEmit` ผ่าน 0 errors
- [x] **ESLint**: `npm run lint` ผ่าน 0 errors
- [x] **Production Build**: `npm run build` ผ่าน 100% (ทุก Route)
- [x] **Unit & API Tests**: 10/10 Test Suites ผ่านสมบูรณ์
- [x] **Regression Tests**: ฟังก์ชันเดิม (Auth, Leaves, Vehicles, QR Verify, Backup/Restore) ทำงานปกติ 100%
- [x] **Performance Tests**: รองรับ Concurrent requests ตอบสนองภายใน < 50ms

### Release Documentation
- [x] **CHANGELOG.md**: อัปเดตรายการเปลี่ยนแปลง `v1.2.0`
- [x] **VERSION.md**: อัปเดตเวอร์ชัน `v1.2.0`
- [x] **package.json & version.ts**: ซิงค์เวอร์ชัน `1.2.0` ตรงกันทุกตำแหน่ง
- [x] **Version Check**: `npm run version:check` ผ่าน 100%
