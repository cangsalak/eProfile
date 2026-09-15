# 🤖 eProfile AI & Developer Engineering Guide

> **วัตถุประสงค์ของเอกสารนี้:** เอกสารนี้จัดทำขึ้นเพื่อให้ AI Assistants (เช่น Antigravity, Claude, ChatGPT, Gemini) และนักพัฒนาที่เข้ามาเริ่มงานในโปรเจกต์ **eProfile** สามารถเข้าใจภาพรวมสถาปัตยกรรม, รายการโมดูลทั้ง 17 โมดูล, ระบบดีไซน์มัลติเซอร์เฟซ (Multi-Surface Design System: Claymorphism 3D, Neumorphism, Glassmorphism, Modern Shadow, Flat), การเรียกใช้ UI Components ใน `@/components/ui`, และมาตรฐานการเขียนโค้ดได้อย่างถูกต้อง สวยงาม สม่ำเสมอทั่วทั้งโปรเจกต์

---

## 1. ข้อมูลพื้นฐานระบบ (System Tech Stack & Core Defaults)

### Tech Stack
- **Framework:** Next.js 14 (App Router) with TypeScript & React 18
- **Database & ORM:** Prisma ORM with MySQL / SQLite / PostgreSQL support
- **Styling & Design System:** Tailwind CSS 3.4 + Multi-Surface Engine (`claymorphism`, `neumorphism`, `glass`, `shadow`, `flat`) + Multi-Theme (`nextadmin`, `indigo`, `emerald`, `ocean`, `rose`, `custom`)
- **Typography:** Google Fonts (`Nunito`, `Prompt`, `Sarabun`, `Plus Jakarta Sans`, `Kanit`, `DM Sans`)
- **Icons:** FontAwesome 6 (Solid/Regular/Brands) + Lucide Icons
- **Auth & Session:** NextAuth / JWT Cookie (`auth-token`) + API Key Token Authentication (`ep_live_...` with SHA-256)
- **Deployment:** PM2 Process Manager (`ecosystem.config.js`) / Node.js Standalone

---

## 2. กฎเหล็กของ Design System (บังคับใช้ทุกหน้า ทุกโมดูล)

1. **ใช้ Standard UI Component Library ใน `@/components/ui` เสมอ:**
   - ❌ **ห้าม** เขียนกล่องสถิติหรือการ์ดแบบดิบด้วย `div` และ Tailwind คลาสยาวเหยียดที่ไม่รองรับธีม
   - ✅ **ต้องใช้** `<StatCard>`, `<Card>`, `<Button>`, `<Input>`, `<Select>`, `<Textarea>`, `<Badge>`, `<Modal>`, `<Tabs>` จาก `@/components/ui`
2. **ห้ามฮาร์ดโค้ดสีแบรนด์ (No Hardcoded Colors):**
   - ❌ **ห้ามใช้** `bg-indigo-600`, `bg-purple-600`, หรือ HEX codes โดยเด็ดขาด
   - ✅ **ต้องใช้** คลาส `primary-*` (เช่น `bg-primary-600`, `text-primary-500`, `border-primary-200`, `from-primary-600 to-primary-700`) เพื่อให้รองรับการเปลี่ยนธีมสีแบบ Dynamic
3. **รองรับ Multi-Surface Theme และ Dark / Light Mode เสมอ:**
   - ระบบรองรับ 5 สไตล์พื้นผิว (`claymorphism`, `neumorphism`, `glass`, `shadow`, `flat`)
   - คอมโพเนนต์ใน `@/components/ui` ถูกออกแบบมาให้ปรับตามสไตล์ที่ผู้ใช้เลือกอัตโนมัติ
4. **ความโค้งมนและมิติแสงเงา:**
   - การ์ดและคอนเทนเนอร์ใช้ `rounded-[24px]` หรือ `rounded-[28px]` / `rounded-[32px]`
   - ปุ่มกดมีสัมผัส Tactile Squish Physics (`active:scale-[0.94]`, `shadow-clay-button`)
   - ช่องกรอกข้อมูลเป็น Recessed Concave Well (`shadow-clay-pressed`)

---

## 3. โครงสร้างโมดูลทั้งหมดในระบบ (All 17 System Modules)

ระบบ eProfile ขับเคลื่อนด้วยสถาปัตยกรรม **Modular Architecture** อยู่ในไดเรกทอรี `src/modules/` โดยมีโมดูลทั้งหมด 17 โมดูล:

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
| 16 | `theme` | ปรับแต่งธีมระบบ | System | บังคับใช้งาน | `/modules/theme` | สตูดิโอปรับแต่งพื้นผิว 3D, ชุดสี, ฟอนต์, ความโค้งมน |
| 17 | `backup` | สำรองและกู้คืนข้อมูล | System | บังคับใช้งาน | `/modules/backup` | สำรองข้อมูลฐานข้อมูล JSON/SQL, กู้คืนระบบฉุกเฉิน |

---

## 4. Standard UI Component Library (`@/components/ui`)

ทุกหน้าในโปรเจกต์ต้องนำเข้าและใช้งานคอมโพเนนต์จาก `@/components/ui`:

```tsx
import {
  StatCard,
  Card,
  CardHeader,
  Button,
  Badge,
  Input,
  Select,
  Textarea,
  Modal,
  Tabs,
  Switch,
  Checkbox,
  Dropdown,
} from '@/components/ui';
```

### รายละเอียดและตัวอย่างการใช้งานแต่ละคอมโพเนนต์:

### 1. `StatCard` (การ์ดแสดงสถิติและตัวเลขสำคัญ)
```tsx
<StatCard
  title="กำลังพลทั้งหมด"
  value={stats.totalPersonnel}
  unit="นาย"
  icon={<Users className="w-5 h-5 text-white" />}
  iconBgGradient="from-violet-500 to-primary-600"
  trend={{ value: '+12.5%', isPositive: true }}
  progress={{ value: 85, color: 'bg-gradient-to-r from-primary-500 to-emerald-400' }}
  footer={
    <>
      <span>พร้อมปฏิบัติหน้าที่</span>
      <span className="font-black text-emerald-600 dark:text-emerald-400">120 นาย</span>
    </>
  }
/>
```

### 2. `Card` & `CardHeader` (การ์ดครอบเนื้อหา ตาราง และฟอร์ม)
```tsx
<Card variant="convex">
  <CardHeader
    title="รายชื่อกำลังพลในสังกัด"
    subtitle="ค้นหาและจัดการประวัติบุคลากรทั้งหมด"
    icon="fa-solid fa-users"
    iconGradient="from-violet-500 to-primary-600"
    action={
      <Button variant="primary" size="xs" icon="fa-solid fa-plus">
        เพิ่มกำลังพล
      </Button>
    }
  />
  <div className="space-y-4">
    {/* เนื้อหาภายใน */}
  </div>
</Card>
```

### 3. `Button` (ปุ่มกดแบบ Squish Physics)
```tsx
<Button variant="primary" size="md" icon="fa-solid fa-floppy-disk" isLoading={isSaving}>
  บันทึกข้อมูล
</Button>
<Button variant="candy" size="sm" icon="fa-solid fa-wand-magic-sparkles">
  ปรับแต่งธีม
</Button>
<Button variant="secondary" size="sm" icon="fa-solid fa-rotate-left">
  รีเซ็ต
</Button>
<Button variant="danger" size="sm" icon="fa-solid fa-trash">
  ลบรายการ
</Button>
```

### 4. `Input`, `Select`, `Textarea` (ฟอร์มกรอกข้อมูลแบบ Recessed Well)
```tsx
<Input
  label="ชื่อ-นามสกุล"
  icon="fa-solid fa-user"
  placeholder="กรอกชื่อและนามสกุล"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
  error={errors.name}
/>

<Select
  label="ตำแหน่ง/สังกัด"
  icon="fa-solid fa-building"
  value={departmentId}
  onChange={(e) => setDepartmentId(e.target.value)}
  options={[
    { value: '1', label: 'กองบังคับการ' },
    { value: '2', label: 'ฝ่ายยุทธการ' },
  ]}
/>

<Textarea
  label="หมายเหตุ / รายละเอียดเพิ่มเติม"
  rows={3}
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
/>
```

### 5. `Badge` (ป้ายสถานะ Pill Capsule)
```tsx
<Badge variant="success" dot>พร้อมรบ 100%</Badge>
<Badge variant="candy">Digital Clay 3D</Badge>
<Badge variant="warning">รอดำเนินการ</Badge>
<Badge variant="danger">ระงับการใช้งาน</Badge>
```

### 6. `Modal` (ป๊อปอัปโมดัล)
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="แก้ไขข้อมูลบุคลากร"
  icon="fa-solid fa-user-pen"
  size="lg"
  footer={
    <>
      <Button variant="secondary" onClick={() => setIsOpen(false)}>ยกเลิก</Button>
      <Button variant="primary" onClick={handleSave}>บันทึกข้อมูล</Button>
    </>
  }
>
  <div className="space-y-4">
    {/* ฟอร์มในโมดัล */}
  </div>
</Modal>
```

---

## 5. มาตรฐาน Page Header & Sub-menu Navigation

ระบบใช้ **Universal Page Header** (`src/components/layout/PageBreadcrumb.tsx`) ร่วมกับ `PageHeaderContext`:

```tsx
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';
import { Button } from '@/components/ui';

export default function MyModuleView() {
  return (
    <div className="space-y-6 animate-fade-in font-prompt">
      <PageHeaderExtra>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" icon="fa-solid fa-plus">
            เพิ่มข้อมูลใหม่
          </Button>
        </div>
      </PageHeaderExtra>

      {/* เนื้อหาหน้าเว็บเริ่มต้นที่นี่ */}
    </div>
  );
}
```

---

## 6. ข้อกำหนดในการส่งมอบงานและตรวจสอบคุณภาพ (Quality Checklist)

ก่อนส่งมอบงานทุกครั้ง AI ต้องรันคำสั่งตรวจสอบ:

1. **TypeScript Typecheck:**
   ```bash
   npx tsc --noEmit
   ```
2. **ESLint Validation:**
   ```bash
   npm run lint
   ```
3. **Automated Test Suite (21 suites):**
   ```bash
   npm test
   ```
4. **Next.js Production Build & PM2:**
   ```bash
   npm run build && pm2 restart eprofile
   ```
