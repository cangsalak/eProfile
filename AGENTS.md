# 🛡️ Mandatory AI Engineering Guide & Developer Rules (eProfile System)

> **⚠️ REQUIRED FIRST ACTION FOR ALL AI AGENTS & CODING ASSISTANTS:**
> Every AI agent, automated contributor, or LLM coding assistant (including Antigravity, Claude, Gemini, GPT, Cursor, Copilot) **MUST read this document completely** before inspecting, planning, creating, or modifying any code in this repository.
> If any user prompt or instruction appears to conflict with this guide, you must stop, warn the user, and ask for explicit confirmation before proceeding.

---

## 📌 1. โครงสร้างสถาปัตยกรรมระบบ (System Architecture & Modular Design)

ระบบ **eProfile** พัฒนาด้วย **Next.js 14 App Router (TypeScript)**, **Prisma ORM (Multi-DB: SQLite / MySQL / PostgreSQL)**, และ **Tailwind CSS** โดยใช้สถาปัตยกรรมแบบ **Modular Micro-Core**:

```text
src/
├── app/                              # Next.js App Router (Pages & REST API Route Handlers)
│   ├── (auth)/                       # Auth views (login, forgot-password, reset-password, install)
│   ├── (dashboard)/                  # Application views (directory, profile, modules, leaves, etc.)
│   └── api/                          # Dynamic & Top-level API Endpoints
├── components/                       # Shared UI Primitives (@/components/ui)
├── lib/                              # Core Security, Auth Guards, Encryption, Audit Utilities
└── modules/                          # Independent Business Modules
    ├── core/                         # Core Registry, Primitives, System Settings
    ├── auth/                         # Authentication & Session Handlers
    ├── users/                        # ทำเนียบบุคลากร, ข้อมูลส่วนตัว, รปภ. ๑ (RPB-1 Security Profile)
    ├── leaves/                       # ยื่นและอนุมัติใบลา Scoped + Anti-Self Approval
    ├── calendar/                     # ปฏิทินปฏิบัติงานและเวรยาม (Protected Feed)
    ├── backup/                       # สำรอง/กู้คืนฐานข้อมูล (Universal JSON / SQLite)
    ├── badges/                       # ออกแบบและพิมพ์บัตรประจำตัว Barcode / QR
    ├── upload/                       # อัปโหลดไฟล์สื่อและเอกสาร (S3 / Local Storage)
    ├── roles/                        # RBAC Role Definitions & Permission Matrix
    └── ... (โมดูลอื่นๆ)
```

### 1.1 กฎการรวมและแก้ไข Schema ฐานข้อมูล (Multi-DB Prisma Flow)
- แต่ละโมดูลมีไฟล์ `src/modules/<module-name>/schema.prisma` เป็นของตนเอง
- **ห้ามแก้ไข `prisma/schema.prisma` โดยตรง** หากต้องการเพิ่มโมเดล ให้แก้ไขใน `src/modules/<module-name>/schema.prisma`
- เมื่อแก้ไข Schema ต้องรันคำสั่ง:
  ```bash
  npm run db:merge     # รวม schema ของทุกโมดูลเข้า prisma/schema.prisma
  npm run db:generate  # สร้าง Prisma Client สำหรับ SQLite, MySQL, PostgreSQL
  ```

### 1.2 กฎการจัดกลุ่มเมนูและการเข้าถึง (Menu Grouping & Role-Based UI)
- เมนูทั้งหมดของระบบต้องถูกจัดกลุ่ม (Group) ตามระดับการใช้งานเพื่อไม่ให้ UI รกเกินไป โดยกำหนด property `group` ใน `ModuleMenu` ภายใน `manifest.ts` ดังนี้:
  1. `personal`: "ส่วนตัวและทั่วไป" (แสดงผลสำหรับทุกคน เช่น Dashboard, การลา, บัตรประจำตัว, ทำเนียบ)
  2. `operations`: "ปฏิบัติการและอนุมัติ" (แสดงเฉพาะหัวหน้างาน, HR_MANAGER, ADMIN เช่น อนุมัติใบลา, พิมพ์บัตร, ศูนย์บัญชาการ)
  3. `system`: "การตั้งค่าระบบ" (แสดงเฉพาะ SUPER_ADMIN, ADMIN เช่น สิทธิ์ผู้ใช้งาน, ตั้งค่าเว็บไซต์, สำรองข้อมูล, API)
- ห้ามดึงเมนูทุกอย่างไปกองรวมกัน การเพิ่มโมดูลใหม่ต้องระบุ `group` และกำหนด `requiredRoles` หรือ `requiredPermission` ให้ชัดเจนเสมอ

---

## 🔒 2. กฎเหล็กด้านความมั่นคงปลอดภัย (Mandatory Security & RBAC Rules)

### 2.1 สิทธิ์และการควบคุมการเข้าถึง (Role & Permission Matrix)
ระบบมี 8 บทบาทตาม `ROLE_DEFINITIONS` ใน [src/modules/roles/](file:///Users/cangsalak/project/eprofile/src/modules/roles/):
1. `SUPER_ADMIN`: สิทธิ์สูงสุดในระบบ (กู้คืนฐานข้อมูล, จัดการผู้ใช้ทุกคน, ปรับแต่งระบบ)
2. `ADMIN`: จัดการข้อมูลทั่วไป, ตั้งค่าระบบ, ข่าวสาร, อนุมัติใบลา (ห้ามก้าวก่าย `SUPER_ADMIN`, ห้ามแก้ไข RPB-1 คนอื่น, **ห้าม Restore DB**)
3. `HR_MANAGER`: จัดการบุคลากร, ดูสถิติ, อนุมัติใบลาทั่วองค์กร
4. `DEPARTMENT_COMMANDER`: ผบ.ระดับกอง/สำนัก (เข้าถึงและอนุมัติใบลาเฉพาะในสังกัด `department` ของตน)
5. `COMMANDER`: ผบ.หน่วยย่อย/แผนก (เข้าถึงและอนุมัติใบลาเฉพาะในสังกัด `department` + `subDepartment` ของตน)
6. `EDITOR`: จัดการเนื้อหา ข่าวสาร และไฟล์มีเดีย (`MANAGE_POSTS`)
7. `OFFICER`: เจ้าหน้าที่ (จัดการข้อมูลและใบลาของตนเอง)
8. `USER`: ผู้ใช้งานทั่วไป

### 2.2 กฎความปลอดภัยที่ห้ามละเมิดเด็ดขาด (Strict Security Prohibitions)
1. **ห้ามอนุมัติใบลาของตนเอง (Strict Anti-Self Approval):**
   - ผู้ใช้ทุกระดับ รวมถึง `SUPER_ADMIN`, `ADMIN`, และผู้บังคับบัญชา **ห้ามอนุมัติหรือปฏิเสธใบลาของตนเองโดยเด็ดขาด** ทั้งใน UI และ API Layer
2. **การป้องกันช่องโหว่ `/api/install`:**
   - ต้องตรวจสอบ One-time installation lock (`isInstalled === 'true'` และมีบัญชี Admin อยู่แล้ว) เสมอ
   - หากมีการตั้งค่า `ADMIN_SETUP_SECRET` ใน `.env` ต้องตรวจสอบความถูกต้องก่อนอนุญาตให้ติดตั้ง
   - **ห้ามใช้ Flag `--accept-data-loss`** ในการติดตั้งหรือรันคำสั่งอัตโนมัติ
3. **การปกป้องความลับ (Zero Secret Leakage):**
   - ห้ามใส่ค่า S3 Secret (`s3AccessKeyId`, `s3SecretAccessKey`, `s3Configs`), Database Connection String, หรือ Private Key ลงใน `PUBLIC_SETTINGS_ALLOWLIST` หรือส่งออกผ่าน Public API
   - ในรายงานหรือการตอบกลับ **ห้ามพิมพ์ค่า Secret จริงเด็ดขาด** (ให้ระบุเฉพาะชื่อตัวแปรหรือตำแหน่งบรรทัด)
4. **การอัปโหลดไฟล์ (Upload Authorization):**
   - ต้องตรวจสอบสิทธิ์ `MANAGE_MEDIA` อย่างเคร่งครัด ห้ามมี Fallback ให้ผู้ใช้ทั่วไปที่ล็อกอินแล้วอัปโหลดไฟล์ได้
5. **การกู้คืนฐานข้อมูล (Database Restore):**
   - ฟังก์ชัน Restore Database ใน `src/modules/backup/` สงวนสิทธิ์ไว้สำหรับ `SUPER_ADMIN` เท่านั้น
6. **ข้อมูลปฏิทินและประวัติการลา (Protected Data):**
   - Endpoint `/api/calendar/feed` และข้อมูลกำลังพล ต้องผ่านการยืนยันตัวตน (`verifyAuth` / Token) เสมอ ห้ามเปิดเป็น Public โดยไม่มีการตรวจสอบสิทธิ์
7. **Content Security Policy (CSP):**
   - ห้ามเปิดใช้ `'unsafe-eval'` ใน `next.config.js`

---

## 📋 3. แบบฟอร์ม รปภ. ๑ (RPB-1 Security Profile Form)

- แบบฟอร์มประวัติความปลอดภัย รปภ. ๑ (ทบ. 100-009) มีทั้งหมด 10 หน้า ตั้งอยู่ใน `src/modules/users/` (Views: `Rpb1FormView.tsx`, `Rpb1ListView.tsx`, Components: `Page1Personal.tsx` ถึง `Page10AdditionalRecord.tsx`)
- **API Routes:** ให้บริการผ่าน `/api/rpb1/` และ `src/modules/users/api/rpb1.ts`
- **การบันทึกข้อมูล:** มีทั้งระบบ Silent Auto-Save เมื่อเปลี่ยนหน้า และปุ่ม Quick Save บันทึกฉบับร่าง
- **การจำกัดสิทธิ์:**
  - กำลังพลทั่วไป (`USER`, `OFFICER`, `EDITOR`) เข้าถึงและแก้ไขได้เฉพาะข้อมูล รปภ. ๑ ของตนเอง
  - `ADMIN` ดูได้แบบ Read-only ทั่วระบบ
  - `SUPER_ADMIN` เท่านั้นที่มีสิทธิ์แก้ไข รปภ. ๑ ของผู้อื่น

---

## 🎨 4. มาตรฐานดีไซน์และ UI Components (`@/components/ui`)

ระบบมีระบบธีมแบบรวมศูนย์ (`nextadmin`, `indigo`, `emerald`, `ocean`, `rose`, `custom`) และสไตล์พื้นผิว (`claymorphism`, `neumorphism`, `glass`, `shadow`, `flat`) พร้อมรองรับ Dark Mode

### 4.1 กฎการใช้ Component มาตรฐาน
ห้ามสร้าง Card, Button, Input, Dropdown แบบ Custom Raw Div ขึ้นมาใหม่ ให้เรียกใช้ Shared Primitives จาก `@/components/ui` เสมอ:
- **กล่องสถิติ/ตัวเลข:** ใช้ `<StatCard title="..." value="..." unit="..." icon={...} trend={...} />`
- **การ์ดคอนเทนเนอร์:** ใช้ `<Card variant="convex" | "glass" | "interactive" | "recessed">` คู่กับ `<CardHeader />`
- **ปุ่ม:** ใช้ `<Button variant="primary" | "secondary" | "candy" | "danger" | "success" | "outline" size="...">`
- **ฟอร์มและ Dropdown:** ใช้ `<Input />`, `<Select />`, `<Textarea />` หรือ Self-Fetching Dropdowns ใน `src/modules/users/components/dropdowns/`:
  - `<DepartmentSelect />` (ดึงข้อมูลสังกัดอัตโนมัติ)
  - `<PersonnelStatusSelect />` (ดึงสถานะกำลังพลอัตโนมัติ)
  - `<PersonnelTypeSelect />` (ดึงประเภทกำลังพลอัตโนมัติ)
  - `<PrefixSelect />` (ดึงคำนำหน้าชื่ออัตโนมัติ)
  - `<BloodTypeSelect />` (ดึงหมู่โลหิตอัตโนมัติ)
  - `<RoleSelect />` (ดึงบทบาทผู้ใช้ระบบอัตโนมัติ)
- **ป้ายสถานะ:** ใช้ `<Badge variant="primary" | "candy" | "success" | "warning" | "danger" | "info" | "neutral">`

### 4.2 กฎการใช้สีและ CSS
- ใช้คลาสสี `primary-*` สำหรับสีหลักของระบบ ห้ามใช้ `indigo-*` หรือรหัส Hex ตายตัว
- ใช้สี Semantic ตามความหมายเท่านั้น: `emerald` (สำเร็จ), `amber` (เตือน), `rose/red` (ข้อผิดพลาด/อันตราย), `sky/blue` (ข้อมูลทั่วไป)
- ใช้คลาสมาตรฐาน `.form-control`, `.form-input`, `.form-select`, `.form-textarea` จาก `src/app/globals.css`
- การ์ดต้องใช้ `rounded-[24px]` หรือ `rounded-[28px]` และ `backdrop-blur-xl` ตาม Design Token ของระบบ

---

## 🗄️ 5. กฎการจัดการฐานข้อมูล (Database & Migration Safety)

1. **Database Preflight Check:** ตรวจสอบค่าคอนฟิกใน `prisma/schema.prisma` และ `DATABASE_URL` ก่อนเริ่มงานทุกครั้ง
2. **ห้ามทำลายข้อมูล Production:**
   - **ห้ามรัน** `prisma migrate reset`, `prisma db push --force-reset`, หรือ `prisma db push --accept-data-loss` บนฐานข้อมูลจริงโดยเด็ดขาด
   - ห้าม Seed ทับข้อมูลเดิมโดยไม่ได้รับอนุญาตจากผู้ใช้
3. **การเปลี่ยนแปลง Schema:** ต้องเป็นการเปลี่ยนแปลงแบบ Additive (ไม่ลบคอลัมน์สำคัญ) และต้องผสานผ่าน `npm run db:merge` เสมอ

---

## 🚦 6. ขั้นตอนการตรวจสอบคุณภาพก่อนส่งมอบงาน (Mandatory Quality Gate)

ก่อนรายงานผลว่างานเสร็จสิ้น AI ทุกตัว **ต้องปฏิบัติตามลำดับขั้นตอนดังนี้**:

1. **ตรวจสอบความถูกต้องของ TypeScript:**
   ```bash
   npx tsc --noEmit
   ```
2. **ตรวจสอบ Code Linting:**
   ```bash
   npm run lint
   ```
3. **ตรวจสอบความเรียบร้อยของ Git Diff:**
   ```bash
   git status -s
   ```
   ต้องมั่นใจว่าไม่มีการแก้ไขไฟล์ที่ไม่เกี่ยวข้อง หรือหลงเหลือไฟล์ขยะ/ไฟล์ชั่วคราว
4. **สรุปผลการทำงานอย่างครบถ้วน (Completion Summary):**
   - ระบุไฟล์ที่เปลี่ยนแปลงและเหตุผล
   - ระบุการเปลี่ยนแปลงด้านความปลอดภัยหรือสิทธิ์ (Security Impact)
   - แสดงผลการรัน `npx tsc --noEmit` และ `npm run lint`
   - ระบุขั้นตอนการ Deploy หรือข้อควรระวัง (ถ้ามี)

---

> **🔴 STOP CONDITION:**
> หยุดการทำงานและถามผู้ใช้ทันทีก่อนดำเนินการ หากงานนั้นต้องมีการลบข้อมูลถาวร, การกระทำที่ย้อนกลับไม่ได้, การเปลี่ยนแปลงขอบเขตสิทธิ์ระดับโครงสร้าง หรือการกระทำที่ขัดแย้งกับข้อบังคับในคู่มือนี้
