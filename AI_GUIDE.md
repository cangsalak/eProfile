# 🤖 eProfile AI & Developer Engineering Guide

> **วัตถุประสงค์ของเอกสารนี้:** เอกสารนี้จัดทำขึ้นเพื่อให้ AI Assistants (เช่น Antigravity, Claude, ChatGPT, Gemini) และนักพัฒนาที่เข้ามาเริ่มงานในโปรเจกต์ **eProfile** สามารถเข้าใจภาพรวมสถาปัตยกรรม, รายการโมดูลทั้ง 17 โมดูล, การตั้งค่าพื้นฐาน (System Defaults), ระบบธีม, และวิธีเริ่มงานได้อย่างถูกต้อง รวดเร็ว โดยไม่เขียนโค้ดซ้ำซ้อน

---

## 1. ข้อมูลพื้นฐานระบบ (System Tech Stack & Core Defaults)

### Tech Stack
- **Framework:** Next.js 14 (App Router) with TypeScript & React 18
- **Database & ORM:** Prisma ORM with MySQL / SQLite / PostgreSQL support
- **Styling:** Tailwind CSS 3.4 + Custom Multi-Theme Engine (`indigo`, `emerald`, `rose`, `ocean`)
- **Icons:** FontAwesome 6 (Solid/Regular/Brands) + Lucide Icons
- **Auth & Session:** NextAuth / JWT Cookie (`auth-token`) + API Key Token Authentication (`ep_live_...` with SHA-256)
- **Deployment:** PM2 Process Manager (`ecosystem.config.js`) / Node.js Standalone

### กฎเหล็กของ Design System (บังคับใช้ทุกหน้า)
1. **ห้ามฮาร์ดโค้ดสีแบรนด์ (No Hardcoded Colors):** ห้ามใช้ `bg-indigo-600`, `bg-purple-600`, หรือ HEX codes โดยเด็ดขาด ให้ใช้คลาส `primary-*` (เช่น `bg-primary-600`, `text-primary-500`, `border-primary-200`) เพื่อให้รองรับการเปลี่ยนธีมสีแบบ Dynamic
2. **รองรับ Dark / Light Mode เสมอ:** การ์ดและพื้นผิวต้องใช้ `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800`
3. **ใช้ Standard UI & Form Components ใน `src/components/ui/`:** ก่อนสร้างปุ่ม การ์ด โมดัล ฟอร์ม หรือดรอปดาวน์ใหม่ ให้ตรวจสอบและเรียกใช้จาก `@/components/ui` เสมอ
4. **ใช้ Standard Form Classes จาก `src/app/globals.css`:** `.form-control`, `.form-input`, `.form-select`, `.form-textarea`, `.form-label`

---

## 2. โครงสร้างโมดูลทั้งหมดในระบบ (All 17 System Modules)

ระบบ eProfile ขับเคลื่อนด้วยสถาปัตยกรรม **Modular Architecture** อยู่ในไดเรกทอรี `src/modules/` โดยมีโมดูลทั้งหมด 17 โมดูล ดังนี้:

| ลำดับ | Module ID | ชื่อภาษาไทย | หมวดหมู่ | ประเภท | Main Route | คำอธิบายฟังก์ชันหลัก |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `personnel` | ระบบจัดการบุคลากร | Core | บังคับใช้งาน | `/modules/personnel/directory` | ข้อมูลประวัติกำลังพล, ทำเนียบบุคลากร, ผังโครงสร้างองค์กร, บทบาทหน้าที่ |
| 2 | `leaves` | ระบบการลา | HR | ติดตั้งแล้ว | `/modules/leaves` | ยื่นใบลาออนไลน์, ตรวจสอบโควตา, พิมพ์แบบฟอร์มการลา, อนุมัติการลา |
| 3 | `vehicles` | ระบบจองยานพาหนะ | Operations | ติดตั้งแล้ว | `/modules/vehicles` | ขอใช้รถราชการ, ตารางการใช้รถ, การจัดสรรพลขับและอนุมัติการเดินทาง |
| 4 | `badges` | ออกแบบและพิมพ์บัตร | Tools | ติดตั้งแล้ว | `/modules/badges` | Badge Canvas Studio, ออกแบบบัตรประจำตัว, พิมพ์บัตรพนักงาน |
| 5 | `calendar` | ปฏิทินปฏิบัติงาน | Operations | ติดตั้งแล้ว | `/modules/calendar` | ปฏิทินกิจกรรม, ตารางเวรปฏิบัติหน้าที่, นัดหมายราชการ |
| 6 | `news` | ข่าวสารและประกาศ | Operations | ติดตั้งแล้ว | `/modules/news` | ข่าวประชาสัมพันธ์ภายใน, แบนเนอร์สไลด์หน้าแรก, ระบบกระจายข่าวสาร |
| 7 | `contacts` | สมุดโทรศัพท์และข้อมูลติดต่อ | Operations | ติดตั้งแล้ว | `/modules/contacts` | เบอร์โทรศัพท์ภายใน, สายด่วนฉุกเฉิน, ข้อมูลติดต่อแผนก/กองบังคับการ |
| 8 | `command-dashboard` | แดชบอร์ดผู้บังคับบัญชา | Executive | ติดตั้งแล้ว | `/modules/command-dashboard` | ภาพรวมสถิติกำลังพล, ยอดเข้าเวร/การลาประจำวัน, ผู้บริหารระดับสูง |
| 9 | `test-slip` | สลิปเงินได้และเงินเดือน | Operations | ติดตั้งแล้ว | `/modules/test-slip` | สลิปเงินเดือนรายบุคคล, คำนวณภาษีหัก ณ ที่จ่าย, พิมพ์เอกสารสลิปเงินได้ |
| 10 | `rpb1` | ระบบ รพบ.1 (RPB1) | Operations | ติดตั้งแล้ว | `/modules/rpb1` | แบบฟอร์มรายงาน รพบ.1, บันทึกการปฏิบัติงานพิเศษและเอกสารราชการ |
| 11 | `api-docs` | ระบบจัดการ API & เอกสาร | System | ติดตั้งแล้ว | `/modules/api-docs` | แคตตาล็อก API Reference ทั้งระบบ, ออกและเพิกถอน API Tokens ภายนอก |
| 12 | `site-content` | จัดการเนื้อหาหน้าเว็บ | System | ติดตั้งแล้ว | `/site-content` | CMS บริหารข้อความ รูปภาพ หน้าแรก (Hero), เกี่ยวกับเรา, บริการ, ติดต่อเรา |
| 13 | `system-inspector` | ตรวจสอบระบบ (Inspector) | System | ติดตั้งแล้ว | `/inspector` | ตรวจสุขภาพ DOM, ลิงก์เสีย, Accessibility (A11y), Security Headers |
| 14 | `module-manager` | จัดการโมดูลระบบ | System | บังคับใช้งาน | `/modules/module-manager` | เปิด/ปิดการใช้งานโมดูล, ตรวจสอบเวอร์ชันโมดูล, ติดตั้งโมดูลเสริม |
| 15 | `menus` | จัดการเมนูระบบ | System | บังคับใช้งาน | `/modules/menus` | จัดเรียงลำดับเมนู Sidebar, เปลี่ยนชื่อ/ไอคอน, ซ่อนเมนู, สร้าง Custom Menu |
| 16 | `theme` | ปรับแต่งธีมระบบ | System | บังคับใช้งาน | `/modules/theme` | ปรับแต่งชุดสี (`indigo`, `emerald`, `rose`, `ocean`), ฟอนต์, ความโค้งมน |
| 17 | `backup` | สำรองและกู้คืนข้อมูล | System | บังคับใช้งาน | `/modules/backup` | สำรองข้อมูลฐานข้อมูล JSON/SQL, กู้คืนระบบฉุกเฉิน |

---

## 3. มาตรฐานการแสดงผล Page Header & Sub-menu Theme

ระบบใช้ **Universal Page Header** (`src/components/layout/PageBreadcrumb.tsx`) ตัวเดียวที่ทำงานร่วมกับ `PageHeaderContext`:

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ หน้าหลัก / จัดการเนื้อหาหน้าเว็บ / จัดการเนื้อหาหน้าเว็บ                                   │
│ ┌────┐  จัดการเนื้อหาหน้าเว็บ                               ┌────────────────────────────┐ │
│ │ 🖼️ │  ปรับแต่งข้อความและรูปภาพของเว็บไซต์                │ [Home] [About] [Services]  │ │
│ └────┘                                                      └────────────────────────────┘ │
│                                                               (Sub-menus / Header Extra)   │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

### วิธีวาง Sub-menu หรือปุ่ม Action บนแถบ Header ด้านขวา:
ในไฟล์ View ของแต่ละโมดูล ให้ใช้คอมโพเนนต์ `<PageHeaderExtra>`:

```tsx
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';
import { Button, Tabs } from '@/components/ui';

export default function MyModuleView() {
  return (
    <div className="space-y-6">
      {/* วาง Sub-menus หรือ Actions บนแถบ Header ขวา */}
      <PageHeaderExtra>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" icon="fa-solid fa-plus">
            เพิ่มข้อมูล
          </Button>
        </div>
      </PageHeaderExtra>

      {/* เนื้อหาหน้าเว็บเริ่มต้นที่นี่ ไม่ต้องสร้าง Header Banner ซ้ำซ้อน */}
      <div>...</div>
    </div>
  );
}
```

---

## 4. Standard UI & Form Component Library (`@/components/ui`)

ระบบจัดเตรียมคอมโพเนนต์มาตรฐานไว้ใน `@/components/ui` เพื่อให้เรียกใช้ได้สะดวกและหน้าตาเหมือนกันทั้งระบบ:

### การ Import:
```tsx
import {
  Button,
  Badge,
  Card,
  CardHeader,
  Modal,
  Tabs,
  Input,
  Select,
  Textarea,
  Switch,
  Checkbox,
  Dropdown,
} from '@/components/ui';
```

### สรุป Component ที่มีให้ใช้งาน:

1. **`Button`:** ปุ่มมาตรฐาน
   ```tsx
   <Button variant="primary" icon="fa-solid fa-floppy-disk" isLoading={isSaving}>บันทึก</Button>
   <Button variant="secondary" icon="fa-solid fa-rotate-left">คืนค่า</Button>
   <Button variant="danger" icon="fa-solid fa-trash">ลบข้อมูล</Button>
   ```

2. **`Input`:** กล่องข้อความพร้อม Label, Icon และ Error Message
   ```tsx
   <Input
     label="ชื่อ-นามสกุล"
     icon="fa-solid fa-user"
     value={name}
     onChange={(e) => setName(e.target.value)}
     placeholder="กรอกชื่อ-นามสกุล"
     required
     error={errors.name}
   />
   ```

3. **`Select`:** ดรอปดาวน์เลือกข้อมูล
   ```tsx
   <Select
     label="ตำแหน่ง/บทบาท"
     icon="fa-solid fa-briefcase"
     value={role}
     onChange={(e) => setRole(e.target.value)}
     options={[
       { value: 'ADMIN', label: 'ผู้ดูแลระบบ (Admin)' },
       { value: 'USER', label: 'ผู้ใช้ทั่วไป (User)' },
     ]}
   />
   ```

4. **`Textarea`:** กล่องข้อความยาว
   ```tsx
   <Textarea
     label="คำอธิบาย / รายละเอียด"
     rows={4}
     value={description}
     onChange={(e) => setDescription(e.target.value)}
   />
   ```

5. **`Switch`:** สวิตช์เปิด/ปิด (Toggle)
   ```tsx
   <Switch
     checked={isEnabled}
     onChange={setIsEnabled}
     label="เปิดใช้งานโมดูลนี้"
     description="เมื่อเปิดใช้งาน จะแสดงในแถบเมนูด้านข้าง"
   />
   ```

6. **`Checkbox`:** เช็กบ็อกซ์เลือกข้อมูล
   ```tsx
   <Checkbox
     checked={agree}
     onChange={(e) => setAgree(e.target.checked)}
     label="ฉันยอมรับเงื่อนไขและข้อกำหนด"
   />
   ```

7. **`Dropdown`:** เมนูดรอปดาวน์ Popup Actions
   ```tsx
   <Dropdown
     trigger={
       <Button variant="secondary" size="xs" icon="fa-solid fa-ellipsis-vertical" />
     }
     items={[
       { label: 'แก้ไขข้อมูล', icon: 'fa-solid fa-pen', onClick: handleEdit },
       { label: 'ดูรายละเอียด', icon: 'fa-solid fa-eye', href: `/view/${id}` },
       { divider: true },
       { label: 'ลบรายการ', icon: 'fa-solid fa-trash', danger: true, onClick: handleDelete },
     ]}
   />
   ```

8. **`Card` & `CardHeader`:** การ์ดเนื้อหา
   ```tsx
   <Card>
     <CardHeader
       title="ข้อมูลบุคลากร"
       subtitle="รายชื่อกำลังพลทั้งหมดในสังกัด"
       icon="fa-solid fa-users"
       action={<Button size="xs">ส่งออก Excel</Button>}
     />
     <div className="p-4">...</div>
   </Card>
   ```

9. **`Badge`:** ป้ายสถานะ
   ```tsx
   <Badge variant="success" dot>พร้อมใช้งาน</Badge>
   <Badge variant="warning">รอดำเนินการ</Badge>
   <Badge variant="danger">ระงับการใช้งาน</Badge>
   ```

10. **`Modal`:** กล่องข้อความ Pop-up Modal
    ```tsx
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="เพิ่มข้อมูลใหม่"
      icon="fa-solid fa-plus"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>ยกเลิก</Button>
          <Button variant="primary" onClick={handleSave}>บันทึก</Button>
        </>
      }
    >
      <div className="space-y-4">...</div>
    </Modal>
    ```

---

## 5. สิทธิ์และบทบาทในระบบ (Roles & Permissions)

### บทบาทผู้ใช้ (User Roles)
- `SUPER_ADMIN`: สิทธิ์สูงสุด ดูแลและตั้งค่าได้ทุกโมดูล
- `ADMIN`: ผู้ดูแลระบบ สามารถจัดการข้อมูลบุคลากรและโมดูลปฏิบัติการได้
- `DEPARTMENT_COMMANDER` / `COMMANDER`: ผู้บังคับบัญชา ดูแดชบอร์ดและอนุมัติการลา/ยานพาหนะของสังกัดได้
- `HR_MANAGER`: เจ้าหน้าที่ฝ่ายกำลังพล จัดการประวัติและคำขอลา
- `USER`: ผู้ใช้งานทั่วไป ดูข้อมูลส่วนตัว สลิปเงินเดือน และยื่นคำขอ

### สิทธิ์โมดูล (Module Permissions Allowlist)
- `MANAGE_PERSONNEL`: จัดการข้อมูลบุคลากร
- `APPROVE_LEAVE`: อนุมัติการลา
- `MANAGE_VEHICLES`: จัดการยานพาหนะ
- `MANAGE_SYSTEM`: จัดการเนื้อหาเว็บไซต์และตั้งค่าระบบ
- `MANAGE_SALARY_SLIP`: จัดการสลิปเงินเดือน

---

## 6. คู่มือขั้นตอนการเริ่มทำงานสำหรับ AI (Workflow Checklist)

เมื่อได้รับมอบหมายงานจากผู้ใช้ ให้ดำเนินการตามลำดับขั้นตอนนี้เสมอ:

1. **Preflight Check (ห้ามข้าม):**
   - ตรวจสอบ `prisma/schema.prisma` ก่อนแก้ไขฐานข้อมูล
   - ห้ามรัน Migration หรือ Reset ฐานข้อมูลโดยไม่ได้รับอนุญาตจากผู้ใช้
2. **ห้าม Commit หรือ Push to Git:**
   - ทำการแก้ไขใน Local Workspace เท่านั้นจนกว่าผู้ใช้จะสั่ง Commit
3. **Module Encapsulation (การแยกโฟลเดอร์โมดูล):**
   - Logic, Services, Helper, Generator หรือ Scanner ที่เป็นของโมดูลนั้นๆ **ต้องใส่ไว้ใน `src/modules/<module-id>/lib/` เสมอ**
   - ห้ามนำโค้ดเฉพาะของโมดูลไปวางไว้ใน `src/lib/` ส่วนกลาง (`src/lib/` สงวนไว้เฉพาะ Core Framework และ System-wide Utilities เช่น `auth.ts`, `prisma.ts`, `permissions.ts`)
4. **ใช้ UI & Form Components มาตรฐาน:**
   - นำเข้าคอมโพเนนต์จาก `@/components/ui` (`Button`, `Input`, `Select`, `Dropdown`, `Card`, ฯลฯ)
5. **ตรวจสอบคุณภาพโค้ดก่อนส่งงานเสมอ:**
   ```bash
   npx tsc --noEmit
   npm run lint
   ```
5. **เขียนสรุปผลงานตามโครงสร้าง:**
   - ไฟล์ที่แก้ไขและเหตุผล
   - พฤติกรรมความปลอดภัย/สิทธิ์ที่เปลี่ยนแปลง
   - ผลการรันตรวจสอบ TypeScript และ Lint
