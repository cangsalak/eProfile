# Permission Matrix — eProfile System

> อัปเดตล่าสุด: 2026-09-01
> ใช้เป็นเอกสารอ้างอิง Permission ที่กำหนดในระบบ

## Permission ที่มีในระบบ

| Permission | คำอธิบาย |
|---|---|
| `MANAGE_PERSONNEL` | เพิ่ม / แก้ไข / ลบข้อมูลบุคลากร |
| `MANAGE_SYSTEM` | จัดการ Role, Department, Vehicle, Calendar, Settings |
| `MANAGE_POSTS` | สร้าง / แก้ไข / ลบบทความ / ไฟล์มีเดีย |
| `APPROVE_LEAVE` | อนุมัติ / ปฏิเสธใบลา |
| `VIEW_AUDIT_LOGS` | ดูประวัติการทำงาน (Audit Log) |
| `VIEW_COMMAND_DASHBOARD` | ดูแดชบอร์ดผู้บังคับบัญชาและรายงานความพร้อมกำลังพล |

---

## Role Matrix (เริ่มต้น)

| Role | MANAGE_PERSONNEL | MANAGE_SYSTEM | MANAGE_POSTS | APPROVE_LEAVE | VIEW_AUDIT_LOGS | VIEW_COMMAND_DASHBOARD |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `SUPER_ADMIN` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `ADMIN` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `HR_MANAGER` | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `DEPARTMENT_COMMANDER` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `COMMANDER` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `EDITOR` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `OFFICER` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `USER` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## API ↔ Permission Mapping

| API Route | Method | Permission Required |
|---|---|---|
| `/api/dashboard/command` | GET | `VIEW_COMMAND_DASHBOARD` (Scoped by department/subDepartment) |
| `/api/personnel` | POST | `MANAGE_PERSONNEL` |
| `/api/personnel/[id]` | PUT | `MANAGE_PERSONNEL` (หรือเจ้าของ Profile) |
| `/api/personnel/[id]` | DELETE | `MANAGE_PERSONNEL` |
| `/api/roles` | POST | `MANAGE_SYSTEM` |
| `/api/roles/[id]` | PUT, DELETE | `MANAGE_SYSTEM` |
| `/api/departments` | POST | `MANAGE_SYSTEM` |
| `/api/departments/[id]` | PUT, DELETE | `MANAGE_SYSTEM` |
| `/api/vehicles` | POST | `MANAGE_SYSTEM` |
| `/api/vehicles/[id]` | PUT, DELETE | `MANAGE_SYSTEM` |
| `/api/calendar` | POST | `MANAGE_SYSTEM` |
| `/api/calendar/[id]` | PUT, DELETE | `MANAGE_SYSTEM` |
| `/api/settings` | PUT | `MANAGE_SYSTEM` |
| `/api/leaves/approvals` | GET | `APPROVE_LEAVE` (Scoped by department/subDepartment) |
| `/api/leaves/[id]/approve` | POST | `APPROVE_LEAVE` (Atomic concurrency, scoped, self-approval blocked) |
| `/api/leaves/[id]/reject` | POST | `APPROVE_LEAVE` (Atomic concurrency, scoped, self-approval blocked) |
| `/api/media` | GET, POST | `MANAGE_POSTS` |
| `/api/media/[id]` | DELETE | `MANAGE_POSTS` |
| `/api/audit-logs` | GET | `VIEW_AUDIT_LOGS` |
| `/api/backup` | GET | Role: SUPER_ADMIN, ADMIN |
| `/api/restore` | POST | Role: SUPER_ADMIN, ADMIN |
| `/api/install` | POST | Admin Secret Header |

---

## Password Policy

- อย่างน้อย **8 ตัวอักษร**
- มีตัวพิมพ์ใหญ่ (A-Z) **อย่างน้อย 1 ตัว**
- มีตัวพิมพ์เล็ก (a-z) **อย่างน้อย 1 ตัว**
- มีตัวเลข (0-9) **อย่างน้อย 1 ตัว**
- ไม่เกิน **128 ตัวอักษร**
- Account จะถูก **ระงับชั่วคราว 15 นาที** หากล็อกอินผิดเกิน 5 ครั้ง

---

## Session Policy

- JWT Token มีอายุ **24 ชั่วโมง**
- Cookie เป็นแบบ `HttpOnly`, `SameSite=Lax`
- `Secure=true` เฉพาะ Production (HTTPS เท่านั้น)
- การ Logout จะล้าง Cookie และบันทึก Audit Log ทันที
