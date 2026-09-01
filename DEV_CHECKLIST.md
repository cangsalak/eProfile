# PROMPT — eProfile Full System Audit & Production Readiness

คุณคือ Senior Software Engineer, Senior Security Engineer, DevSecOps Engineer และ QA Engineer

ให้ตรวจสอบโปรเจกต์ **eProfile** แบบละเอียดจาก Source Code จริงทั้งโปรเจกต์ โดยต้องวิเคราะห์ทั้ง Architecture, Code Quality, Security, Authentication, Authorization, Database, API, Frontend, Backend, File Upload, Backup/Restore, Logging, Testing, Deployment และ Production Readiness

## ⚠️ กฎสำคัญ

1. **ห้ามแก้ไข Source Code**
2. **ห้ามสร้างไฟล์ใหม่**
3. **ห้ามลบไฟล์**
4. **ห้ามติดตั้ง package เพิ่ม**
5. **ห้ามเปลี่ยน Database**
6. **ห้ามเปลี่ยน Configuration**
7. อนุญาตเฉพาะคำสั่งสำหรับ "ตรวจสอบ" เท่านั้น
8. ห้ามเปิดเผยค่า Secret จริง เช่น:

   * JWT_SECRET
   * ADMIN_SETUP_SECRET
   * API KEY
   * SMTP PASSWORD
   * DATABASE PASSWORD
   * TOKEN
9. หากพบ Secret ให้รายงานเพียงว่า "พบ Secret" และระบุตำแหน่งไฟล์/บรรทัด โดยไม่แสดงค่าจริง
10. ห้ามถือว่า Checklist ที่เขียนไว้แล้วหมายถึงระบบทำงานจริง ต้องตรวจจาก Source Code และ Runtime Test
11. ถ้าไม่สามารถตรวจสอบบางรายการได้ ให้ระบุว่า `NOT VERIFIED`
12. ห้ามสรุปว่า "ปลอดภัย" เพียงเพราะ Build ผ่าน
13. ต้องแยก:

    * PASS
    * FAIL
    * WARNING
    * NOT VERIFIED

---

# 1. PROJECT DISCOVERY

เริ่มจากสำรวจโครงสร้างโปรเจกต์ทั้งหมด

ตรวจ:

* package.json
* package-lock.json
* next.config.*
* tsconfig.json
* middleware.*
* prisma/
* src/
* app/
* components/
* lib/
* hooks/
* services/
* scripts/
* public/
* tests/
* Dockerfile
* docker-compose.*
* PM2 configuration
* .env
* .env.example
* .gitignore
* README
* CHANGELOG
* VERSION
* DEV_CHECKLIST

ให้สร้าง Project Map ในรายงาน:

```text
eProfile
├── Frontend
├── Backend/API
├── Authentication
├── Authorization
├── Database
├── File Storage
├── Backup
├── Logging
├── Notification
├── QR Verification
├── Personnel
├── Leave
├── Vehicle
├── Calendar
├── Posts
├── Contacts
└── Administration
```

ระบุหน้าที่ของแต่ละส่วน

---

# 2. PACKAGE & DEPENDENCY AUDIT

ตรวจ package ทั้งหมด

ตรวจ:

```bash
npm outdated
npm audit
npm ls
```

ถ้าคำสั่งใดไม่สามารถทำได้ ให้ระบุ NOT VERIFIED

ตรวจ:

* package ที่ obsolete
* package ที่ deprecated
* package ที่มี known vulnerability
* dependency conflict
* dependency ที่ไม่ได้ใช้งาน
* dependency ที่ใช้เฉพาะ development
* dependency ที่ควรเป็น production dependency

ห้ามติดตั้งหรือ update package

รายงาน:

| Package | Version | Status | Risk | Recommendation |
| ------- | ------- | ------ | ---- | -------------- |

---

# 3. TYPESCRIPT AUDIT

รัน:

```bash
npx tsc --noEmit --pretty false
```

ตรวจ:

* Type errors
* implicit any
* explicit any
* unsafe casts
* `as any`
* `@ts-ignore`
* `@ts-expect-error`
* nullable errors
* Prisma type mismatch
* API response type mismatch

ค้นหา:

```text
any
@ts-ignore
@ts-expect-error
as unknown
as any
```

รายงานทุก Error:

```text
File:
Line:
Error:
Severity:
Cause:
Recommendation:
```

---

# 4. ESLINT AUDIT

ตรวจว่า ESLint ถูกติดตั้งและ Configuration สมบูรณ์หรือไม่

ตรวจ:

```bash
npm run lint
```

ถ้าไม่มี lint script ให้ตรวจ package.json และ config

ตรวจ:

* React errors
* React Hooks
* unused variables
* unused imports
* accessibility
* security-related lint
* TypeScript lint
* Next.js lint

ห้ามปิด ESLint เพื่อให้ Build ผ่าน

ตรวจว่ามี:

```text
ignoreBuildErrors
ignoreDuringBuilds
```

หรือไม่

ถ้ามีให้รายงาน

---

# 5. PRODUCTION BUILD AUDIT

ตรวจ:

```bash
npm run build
```

หรือคำสั่ง Build ที่ระบุใน package.json

ตรวจ:

* Compile errors
* Build warnings
* ESLint errors
* TypeScript errors
* Static generation errors
* Server component errors
* Client component errors
* Environment variable errors
* Deprecated Next.js APIs

ห้ามสรุปว่า Production Ready เพียงเพราะ Build ผ่าน

---

# 6. AUTHENTICATION AUDIT

ตรวจระบบ Authentication ทั้งหมด

ตรวจ:

* Login
* Logout
* JWT
* Session
* Cookie
* Password hashing
* Password reset
* Change password
* Account creation
* Account lockout
* Failed login
* Rate limiting
* Session expiration

ตรวจ JWT:

```text
algorithm
secret
expiration
issuer
audience
signature verification
```

ตรวจว่ามี fallback secret หรือไม่ เช่น:

```ts
process.env.JWT_SECRET || "default-secret"
```

ถ้าพบให้รายงาน Critical

---

# 7. COOKIE SECURITY

ตรวจ Authentication Cookie

ต้องตรวจ:

```text
httpOnly
secure
sameSite
path
maxAge/expires
```

Production ต้องไม่ใช้:

```text
secure: false
```

โดยไม่มีเหตุผล

ตรวจ Session Fixation และ Token Theft risk

---

# 8. PASSWORD SECURITY

ตรวจ:

* bcrypt / argon2
* password hashing
* password policy
* minimum length
* password complexity
* default password
* temporary password
* forced password change
* password reuse
* password reset

ค้นหา:

```text
password
defaultPassword
dummy
test123
123456
admin
```

ห้ามแสดง password จริงในรายงาน

ถ้าพบ Default Password ที่เดาได้จาก:

```text
officialId
badgeNo
citizenId
username
```

ให้จัดเป็น HIGH

---

# 9. AUTHORIZATION / RBAC AUDIT

นี่คือส่วนสำคัญที่สุด

ตรวจ:

```text
USER
OFFICER
ADMIN
SUPER_ADMIN
```

และ Permission ทั้งหมด

ค้นหา:

```text
requireAuth
requireRole
requirePermission
verifyAuth
```

สร้าง API Permission Matrix จาก Source Code จริง

ตัวอย่าง:

| API       | Method | Auth | Role  | Permission       | Result |
| --------- | ------ | ---- | ----- | ---------------- | ------ |
| personnel | GET    | ✓    | User  | VIEW_PERSONNEL   | PASS   |
| personnel | POST   | ✓    | Admin | MANAGE_PERSONNEL | PASS   |
| personnel | DELETE | ✓    | Admin | MANAGE_PERSONNEL | PASS   |
| backup    | GET    | ✓    | Admin | BACKUP           | PASS   |

ตรวจทุก:

```text
GET
POST
PUT
PATCH
DELETE
```

โดยเฉพาะ Mutation

**Authorization ต้องเกิดก่อน Database Mutation**

ตรวจ Pattern อันตราย:

```text
Database Update
      ↓
verifyAuth()
```

ถือว่า FAIL

ต้องเป็น:

```text
verifyAuth()
      ↓
requirePermission()
      ↓
Validate Input
      ↓
Database Update
```

---

# 10. API SECURITY AUDIT

ค้นหา API Route ทั้งหมด:

```text
src/app/api/**/route.ts
```

สร้างรายการ API ทั้งหมด

ตรวจแต่ละ Route:

* Authentication
* Authorization
* Input validation
* Rate limiting
* Error handling
* Response filtering
* Logging
* HTTP method
* Status code

ค้นหา API ที่ไม่มี Guard

ยกเว้นเฉพาะ:

```text
health
public verify
login
initial installation
```

แต่ต้องตรวจว่า Public Endpoint เหล่านั้นออกแบบอย่างปลอดภัยหรือไม่

---

# 11. API INPUT VALIDATION

ตรวจทุก:

```text
request.json()
searchParams
params
headers
cookies
formData
file uploads
```

ต้องมี validation

แนะนำตรวจ Zod หรือ Schema validation

ค้นหา:

```ts
const body = await request.json()
```

แล้วตรวจว่ามี Validation หลังจากนั้นหรือไม่

หากนำ `body` เข้า Prisma โดยตรง:

```ts
prisma.personnel.create({
  data: body
})
```

ให้จัดเป็น WARNING/HIGH ตามความเสี่ยง

---

# 12. MASS ASSIGNMENT

ตรวจว่าผู้ใช้สามารถส่ง field ที่ไม่ควรแก้ได้หรือไม่

ตัวอย่าง:

```json
{
  "role": "SUPER_ADMIN",
  "permissions": ["MANAGE_SYSTEM"],
  "isAdmin": true
}
```

ผู้ใช้ทั่วไปต้องไม่สามารถเปลี่ยน field เหล่านี้ผ่าน API ได้

ตรวจ:

```text
role
permissions
isAdmin
status
departmentId
createdBy
approvedBy
audit fields
```

---

# 13. SENSITIVE DATA EXPOSURE

ตรวจ Response ของ API

ห้ามส่ง:

```text
password
passwordHash
resetToken
sessionToken
JWT
secret
API key
private key
```

โดยไม่จำเป็น

ตรวจ Personnel API โดยเฉพาะ

ข้อมูลอย่าง:

```text
Citizen ID
Address
Phone
Emergency Contact
Date of Birth
Medical-related fields
```

ต้องมี Authorization ที่เหมาะสม

Public QR API ต้องแสดงเฉพาะข้อมูลที่จำเป็น

---

# 14. QR VERIFICATION SECURITY

ตรวจ:

```text
/api/verify/*
```

ตรวจว่า:

* Public หรือ Protected
* สามารถ enumerate ID ได้หรือไม่
* เปิดข้อมูลเกินจำเป็นหรือไม่
* Rate Limit หรือไม่
* มี random identifier หรือไม่
* QR token สามารถปลอมได้หรือไม่
* QR สามารถนำกลับมาใช้ซ้ำได้หรือไม่
* QR มี expiration หรือไม่ ถ้าจำเป็น
* มี Audit Log หรือไม่

ห้ามเปิดข้อมูล Personnel ทั้ง record

---

# 15. FILE UPLOAD SECURITY

ตรวจทุก File Upload

ตรวจ:

* MIME validation
* extension validation
* file size
* filename sanitization
* path traversal
* executable file
* SVG XSS
* HTML upload
* archive upload
* storage location
* public URL exposure

ตรวจ:

```text
../
..\
/etc/passwd
```

และ filename ที่เป็นอันตราย

---

# 16. XSS AUDIT

ค้นหา:

```text
dangerouslySetInnerHTML
innerHTML
eval()
new Function()
document.write()
```

ทุกจุด

หากพบ `dangerouslySetInnerHTML` ต้องตรวจว่า:

```text
Input
 ↓
Sanitize
 ↓
Render
```

หรือไม่

ถ้าเป็น:

```text
Database
 ↓
dangerouslySetInnerHTML
```

โดยไม่มี Sanitization ให้จัดเป็น HIGH

---

# 17. CSRF AUDIT

ถ้า Authentication ใช้ Cookie ให้ตรวจ CSRF protection

ตรวจ:

* SameSite
* CSRF token
* Origin validation
* Referer validation
* mutation protection

ตรวจ:

```text
POST
PUT
PATCH
DELETE
```

ทั้งหมด

---

# 18. CORS AUDIT

ตรวจ:

```text
Access-Control-Allow-Origin
Access-Control-Allow-Credentials
```

ห้ามใช้:

```text
*
```

ร่วมกับ Credentials

ถ้าไม่จำเป็นไม่ควรเปิด CORS

---

# 19. SECURITY HEADERS

ตรวจ:

```text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
X-Frame-Options
Referrer-Policy
Permissions-Policy
```

ตรวจ Next.js headers configuration

---

# 20. SQL / DATABASE SECURITY

ตรวจ Prisma Query ทั้งหมด

ค้นหา:

```text
$executeRaw
$queryRaw
executeRawUnsafe
queryRawUnsafe
```

ถ้าพบต้องตรวจ SQL Injection

ตรวจ:

* Prisma relations
* unique constraints
* indexes
* foreign keys
* cascade delete
* transaction
* race condition
* duplicate record
* concurrency

---

# 21. DATABASE SCHEMA AUDIT

ตรวจ Prisma schema

วิเคราะห์:

```text
Personnel
User
Role
Permission
Department
Leave
Vehicle
Calendar
Notification
Post
Contact
Audit
Media
```

ตรวจว่ามี:

```text
createdAt
updatedAt
createdBy
updatedBy
```

ใน entity ที่เหมาะสมหรือไม่

---

# 22. BACKUP / RESTORE AUDIT

ตรวจระบบ Backup/Restore แบบละเอียด

ตรวจ:

* Authorization
* Backup format
* File validation
* SQLite integrity
* WAL
* SHM
* atomic replacement
* temporary file
* backup before restore
* schema version
* application version
* rollback
* audit log
* backup retention

ทดสอบเชิง Static Analysis ว่า:

```text
Restore Corrupt DB
Restore Non-SQLite
Restore Old Schema
Restore Large File
Restore Unauthorized
```

มีการป้องกันหรือไม่

---

# 23. AUDIT LOG

ตรวจว่าเหตุการณ์สำคัญมี Audit Log หรือไม่

อย่างน้อย:

```text
LOGIN_SUCCESS
LOGIN_FAILED
LOGOUT
PASSWORD_CHANGED
PASSWORD_RESET
ACCOUNT_LOCKED
PERSONNEL_CREATED
PERSONNEL_UPDATED
PERSONNEL_DELETED
ROLE_CHANGED
PERMISSION_CHANGED
BACKUP_CREATED
BACKUP_RESTORED
SETTINGS_CHANGED
```

ตรวจว่า User ทั่วไปไม่สามารถแก้ไข Audit Log

---

# 24. RATE LIMITING

ตรวจ:

```text
Login
Setup Admin
Install
Password Reset
QR Verify
API
File Upload
```

ว่ามี Rate Limit หรือไม่

ตรวจ:

```text
IP based
User based
Endpoint based
```

---

# 25. ERROR HANDLING

ตรวจ API Error ทั้งหมด

ไม่ควรส่ง:

```text
stack trace
database error
SQL
filesystem path
environment variable
secret
```

ให้ Client

ควรมี Standard Error Response เช่น:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied"
  }
}
```

ตรวจ HTTP Status Code:

```text
400
401
403
404
409
422
429
500
```

ว่าใช้อย่างเหมาะสมหรือไม่

---

# 26. LOGGING

ตรวจ Logger

ค้นหา:

```text
console.log
console.error
console.warn
```

ตรวจว่า Log มี:

```text
timestamp
requestId
userId
action
endpoint
status
duration
```

หรือไม่

ห้าม Log:

```text
password
JWT
API key
secret
citizen ID แบบเต็ม
```

---

# 27. REQUEST ID / TRACEABILITY

ตรวจว่าระบบสามารถติดตาม Request ได้หรือไม่

แนะนำ:

```text
requestId
```

เชื่อม:

```text
Request
 ↓
API
 ↓
Database
 ↓
Logger
 ↓
Audit
```

---

# 28. FRONTEND SECURITY

ตรวจ:

* Authentication state
* Authorization UI
* Protected routes
* Role-based menu
* Permission-based buttons
* Sensitive data
* localStorage
* sessionStorage
* token storage
* XSS
* open redirect

สำคัญ:

Frontend ซ่อนปุ่มอย่างเดียว **ไม่ถือว่าเป็น Authorization**

ต้องตรวจ Backend API ด้วย

---

# 29. NEXT.JS SECURITY

ตรวจ:

* Server Components
* Client Components
* Server Actions
* Route Handlers
* Middleware
* Dynamic Routes
* Environment variables

ตรวจว่าตัวแปร:

```text
NEXT_PUBLIC_*
```

ไม่มี Secret

---

# 30. ENVIRONMENT SECURITY

ตรวจ:

```text
.env
.env.local
.env.production
.env.example
```

ห้ามแสดงค่า Secret จริง

ค้นหา Source Code สำหรับ:

```text
secret
password
token
apiKey
privateKey
```

และตรวจ Git:

```bash
git status
git ls-files
git log --all -S "JWT_SECRET"
git log --all -S "ADMIN_SETUP_SECRET"
```

ถ้าพบ Secret ใน Git history ให้รายงาน HIGH/CRITICAL

---

# 31. GIT SECURITY

ตรวจ:

```bash
git status
git ls-files
git log --oneline -20
```

ตรวจว่าไม่ Track:

```text
.env
*.db
*.sqlite
backup
uploads
logs
```

ตรวจ `.gitignore`

---

# 32. VERSION MANAGEMENT

ตรวจ:

```text
package.json
package-lock.json
VERSION.md
CHANGELOG.md
src/lib/version.ts
```

ต้องตรงกัน

ตรวจ:

```bash
npm run version:check
```

ถ้ามี Git Tag ให้ตรวจ:

```bash
git tag
```

ตรวจ Version ตาม Semantic Versioning:

```text
MAJOR.MINOR.PATCH
```

---

# 33. INSTALLATION SECURITY

ตรวจ `/api/install`

ต้องเป็น One-Time Installation

ตรวจ:

```text
Already installed
      ↓
403
```

หากยังไม่ติดตั้ง:

```text
Installation Secret
 ↓
Validation
 ↓
Create Admin
 ↓
Mark Installed
```

ห้ามเปิดช่องให้สร้าง SUPER_ADMIN ซ้ำ

---

# 34. DEFAULT ADMIN SECURITY

ตรวจ:

* Default username
* Default password
* Setup secret
* Initial admin
* Forced password change
* Admin enumeration

ห้ามมี:

```text
admin/admin
admin/password
admin/123456
```

---

# 35. BUSINESS LOGIC SECURITY

ตรวจ Business Rules

ตัวอย่าง:

### Personnel

* User เปลี่ยน Role ตัวเองได้หรือไม่
* User ลบ Admin ได้หรือไม่
* User เปลี่ยน Department ได้หรือไม่

### Leave

* User อนุมัติใบลาตัวเองได้หรือไม่
* User แก้ใบลาที่ Approved แล้วได้หรือไม่
* Admin สามารถแก้สถานะโดยไม่ Audit หรือไม่

### Vehicle

* User ใช้รถที่ไม่ได้รับอนุญาตได้หรือไม่

### Visitor

* Visitor QR หมดอายุหรือไม่

---

# 36. CONCURRENCY / RACE CONDITION

ตรวจ operation เช่น:

```text
Create User
Create Badge
Create QR
Approve Leave
Check-in
Check-out
Backup
Restore
```

ว่ามี transaction/unique constraint ป้องกัน duplicate หรือไม่

---

# 37. PERFORMANCE AUDIT

ตรวจ:

* N+1 queries
* unnecessary Prisma queries
* large API response
* pagination
* database indexes
* image optimization
* large file processing
* server-side filtering

ค้นหา API ที่:

```text
findMany()
```

โดยไม่มี:

```text
pagination
```

ถ้าข้อมูลอาจโตมาก ให้รายงาน

---

# 38. DATABASE SCALE

ประเมิน SQLite ว่าเหมาะสมกับระบบปัจจุบันหรือไม่

พิจารณา:

```text
จำนวนบุคลากร
จำนวน Transaction
จำนวน Check-in/out
จำนวน Audit Log
จำนวน File
Concurrent Users
```

ถ้าไม่เหมาะ ให้เสนอ PostgreSQL เป็นระยะถัดไป

**ห้ามเปลี่ยน Database**

---

# 39. HEALTH CHECK

ตรวจ `/api/health`

ควรตรวจ:

```text
Application
Version
Database
Latency
Uptime
```

หากมี monitoring:

```text
Disk
Memory
Backup
SSL
```

ให้ตรวจด้วย

---

# 40. TEST COVERAGE

ตรวจว่ามี Tests หรือไม่

ค้นหา:

```text
*.test.*
*.spec.*
__tests__
```

ประเมิน:

```text
Authentication
Authorization
Personnel
Leave
Vehicle
QR
Backup
Restore
```

ว่ามี Test หรือไม่

---

# 41. SECURITY TEST MATRIX

สร้าง Matrix:

| Feature          | Anonymous | USER | OFFICER | ADMIN | SUPER_ADMIN |
| ---------------- | --------: | ---: | ------: | ----: | ----------: |
| Login            |         ✓ |    ✓ |       ✓ |     ✓ |           ✓ |
| Personnel View   |         ? |    ? |       ? |     ? |           ? |
| Personnel Create |         ✗ |    ✗ |       ? |     ? |           ? |
| Personnel Delete |         ✗ |    ✗ |       ✗ |     ? |           ✓ |
| Backup           |         ✗ |    ✗ |       ✗ |     ? |           ✓ |
| Restore          |         ✗ |    ✗ |       ✗ |     ? |           ✓ |
| Role Management  |         ✗ |    ✗ |       ✗ |     ? |           ✓ |

ต้องอ้างอิงจาก Permission Matrix จริงในระบบ

---

# 42. RED ERROR / IDE DIAGNOSTICS

ตรวจปัญหาที่มักแสดงเป็นเส้นแดงใต้ข้อความใน VS Code:

* TypeScript errors
* Import errors
* Module not found
* Path alias
* Prisma types
* JSX errors
* React Hook errors
* ESLint errors
* Invalid props
* Invalid function arguments
* Undefined variables
* Unused imports
* Invalid environment variables

ต้องระบุ:

```text
FILE
LINE
COLUMN
ERROR
CAUSE
SEVERITY
RECOMMENDATION
```

ห้ามบอกเพียงว่า "มี Error"

---

# 43. DEAD CODE

ค้นหา:

```text
TODO
FIXME
HACK
XXX
unused
deprecated
```

ตรวจ:

* unused components
* unused API
* unused functions
* duplicate code
* legacy code
* commented-out code

---

# 44. ARCHITECTURE REVIEW

ประเมิน:

```text
Route Handler
Service Layer
Repository Layer
Validation
Authentication
Authorization
Database
Logger
```

ตรวจว่าความรับผิดชอบแยกกันเหมาะสมหรือไม่

ค้นหา Route ที่มี Business Logic มากเกินไป

---

# 45. CODE DUPLICATION

ค้นหา:

* duplicate auth code
* duplicate validation
* duplicate error response
* duplicate Prisma query
* duplicate permission checks

เสนอจุดที่ควร refactor

---

# 46. PRODUCTION DEPLOYMENT

ตรวจ:

```text
PM2
Synology
Reverse Proxy
HTTPS
Environment
Database
File Storage
Backup
Logs
```

ตรวจ:

* auto restart
* health check
* log rotation
* disk usage
* backup schedule
* rollback procedure

---

# 47. RELEASE READINESS

ตรวจว่า Release Gate ผ่านหรือไม่

ต้องผ่าน:

```text
[ ] TypeScript
[ ] ESLint
[ ] Build
[ ] Authentication
[ ] Authorization
[ ] Input Validation
[ ] XSS
[ ] CSRF
[ ] CORS
[ ] File Upload
[ ] Backup
[ ] Restore
[ ] Audit
[ ] Rate Limit
[ ] Secrets
[ ] Git
[ ] Tests
[ ] Version
[ ] HTTPS
```

---

# 48. SEVERITY CLASSIFICATION

ใช้เกณฑ์:

## 🔴 CRITICAL

ตัวอย่าง:

* Authentication bypass
* Authorization bypass
* Remote code execution
* Database destruction
* Secret exposure
* Password exposure
* Unauthenticated Admin access

ต้องแก้ก่อน Release

## 🟠 HIGH

ตัวอย่าง:

* Sensitive data exposure
* Missing authorization
* Stored XSS
* Unsafe file upload
* Weak password
* Unsafe Restore
* Missing CSRF

ควรแก้ก่อน Production

## 🟡 MEDIUM

ตัวอย่าง:

* Missing security headers
* Missing rate limit บาง endpoint
* Weak logging
* Code duplication
* Performance issue

ควรแก้ในรอบถัดไป

## 🔵 LOW

ตัวอย่าง:

* Naming
* Documentation
* Minor refactoring

## 🟢 PASS

ตรวจแล้วไม่มีปัญหาตามเกณฑ์

---

# 49. ห้ามให้คะแนนจากจำนวน Issue อย่างเดียว

ประเมิน Risk ตาม:

```text
Impact × Likelihood
```

ไม่ใช่:

```text
จำนวน Error
```

ตัวอย่าง:

```text
1 Critical
```

มีความสำคัญมากกว่า:

```text
20 Low
```

---

# 50. FINAL REPORT

สุดท้ายให้สร้างรายงานโดยมีรูปแบบดังนี้:

# eProfile System Audit Report

## Executive Summary

```text
Overall Status:
Production Readiness:
Security Status:
Code Quality:
Testing Status:
```

---

## Score

ให้คะแนน:

```text
Architecture       /100
Security           /100
Authentication     /100
Authorization      /100
API Security       /100
Database           /100
Frontend           /100
Code Quality       /100
Testing            /100
DevOps             /100
Production Ready   /100
```

---

## Critical Issues

| ID | Severity | File | Line | Issue | Impact | Recommendation |
| -- | -------- | ---- | ---- | ----- | ------ | -------------- |

---

## High Issues

| ID | File | Line | Issue | Recommendation |
| -- | ---- | ---- | ----- | -------------- |

---

## Medium Issues

| ID | File | Line | Issue | Recommendation |
| -- | ---- | ---- | ----- | -------------- |

---

## Low Issues

| ID | File | Line | Issue | Recommendation |
| -- | ---- | ---- | ----- | -------------- |

---

# API SECURITY MATRIX

แสดงทุก API:

```text
Method
Path
Authentication
Authorization
Permission
Input Validation
Rate Limit
Audit
Status
```

---

# ROLE / PERMISSION MATRIX

แสดง:

```text
USER
OFFICER
ADMIN
SUPER_ADMIN
```

กับทุก Permission

---

# RED ERROR REPORT

แสดง:

```text
File
Line
Column
Error
Cause
Severity
Recommendation
```

---

# SECURITY FINDINGS

จัดกลุ่ม:

```text
Authentication
Authorization
Session
Input Validation
XSS
CSRF
CORS
File Upload
Database
Secrets
Logging
Backup
```

---

# PERFORMANCE FINDINGS

แสดง:

```text
Issue
Location
Impact
Recommendation
```

---

# TESTING STATUS

```text
TypeScript       PASS/FAIL
ESLint           PASS/FAIL
Build            PASS/FAIL
Unit Tests       PASS/FAIL/NOT VERIFIED
Integration      PASS/FAIL/NOT VERIFIED
Security Tests   PASS/FAIL/NOT VERIFIED
```

---

# VERSION STATUS

ตรวจ:

```text
package.json
VERSION.md
CHANGELOG.md
version.ts
Git Tag
```

รายงานว่า Version ตรงกันหรือไม่

---

# PRODUCTION RELEASE DECISION

ให้เลือกเพียงหนึ่ง:

### 🟢 READY FOR PRODUCTION

ไม่มี Critical/High และ Release Gate ผ่าน

### 🟠 CONDITIONALLY READY

ไม่มี Critical แต่ยังมี High/Medium ที่ควรแก้

### 🔴 NOT READY

มี Critical หรือ High ที่เกี่ยวข้องกับ Security/Authorization/Database

---

# NEXT ACTION PLAN

จัดลำดับ:

```text
1. Critical
2. High
3. Medium
4. Low
5. Refactoring
6. New Features
```

ห้ามแนะนำ Feature ใหม่ก่อนแก้ Security Critical/High

---

# สำคัญที่สุด

เมื่อจบการตรวจสอบ ให้ตอบผมด้วย Summary แบบนี้:

```text
========================================
eProfile FULL AUDIT
========================================

Version:
Status:

CRITICAL: X
HIGH: X
MEDIUM: X
LOW: X
PASS: X

TypeScript:
ESLint:
Build:

Authentication:
Authorization:
API Security:
Database:
Backup:
File Upload:
XSS:
CSRF:
CORS:
Secrets:
Audit Log:
Testing:

Production Ready:
YES / NO

========================================
TOP 10 ACTIONS
========================================

1.
2.
3.
4.
5.
6.
7.
8.
9.
10.
```

## ข้อกำหนดสุดท้าย

**อย่าแก้ไขอะไรทั้งสิ้น**

ผมต้องการผลการตรวจสอบก่อน

หลังจากได้รับ Audit Report แล้ว ผมจะเป็นผู้ตัดสินใจเองว่าจะให้คุณแก้ไขส่วนใด

หากพบปัญหาเดียวกันหลายไฟล์ ให้รวมเป็น Issue เดียวและระบุทุกไฟล์ที่เกี่ยวข้อง

หากไม่พบปัญหา ให้เขียน `PASS` อย่างชัดเจน

หากตรวจไม่ได้ ให้เขียน `NOT VERIFIED` ห้ามเดา

**เป้าหมายสุดท้ายคือทำให้ eProfile มีความพร้อมระดับ Production และมี Security/Authorization ที่เหมาะสมกับระบบข้อมูลบุคลากร**
