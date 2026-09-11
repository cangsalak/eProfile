# 📦 eProfile Module System & Extension Guide

เอกสารนี้อธิบายสถาปัตยกรรมโมดูล (Modular Architecture) และขั้นตอนการสร้างโมดูลใหม่ หรือการต่อยอดโมดูลที่มีอยู่เดิมในระบบ **eProfile**

---

## 1. โครงสร้างไฟล์มาตรฐานของโมดูล (Module File Structure)

ทุกโมดูลจะอยู่ในโฟลเดอร์ `src/modules/<module-id>/` โดยมีโครงสร้างมาตรฐานดังนี้:

```
src/modules/<module-id>/
├── manifest.ts          # ไฟล์ Manifest ระบุชื่อ ไอคอน เมนู และสิทธิ์ของโมดูล
├── index.ts             # Barrel export รวม Views, Manifest, Lib และ API Handlers
├── api/                 # 👈 API Route Handlers ทั้งหมดของโมดูล (Controller / Handlers)
│   ├── index.ts
│   └── handlers.ts
├── lib/                 # 👈 Logic เฉพาะโมดูล (Services, Helpers, Scanners, Calculators) ห้ามนำไปปนใน src/lib/ ส่วนกลาง
│   ├── helpers.ts
│   └── service.ts
├── views/               # คอมโพเนนต์หน้า View หลักของแต่ละเมนู
│   ├── MainView.tsx
│   └── SubMenuView.tsx
├── components/          # คอมโพเนนต์เฉพาะภายในโมดูล (Cards, Forms, Modals)
│   ├── FilterToolbar.tsx
│   └── ItemModal.tsx
└── types/               # TypeScript interfaces เฉพาะของโมดูล
    └── index.ts
```

> **หลักการ Thin Route Adapter สำหรับ Next.js App Router:**
> Next.js กำหนดให้ HTTP endpoints อยู่ที่ `src/app/api/.../route.ts` ดังนั้นเพื่อรักษาความเป็น Modular Monolith:
> - **Logic ทั้งหมด (Validation, DB Query, Permission Check)** ต้องเขียนใน `src/modules/<module-id>/api/`
> - ไฟล์ใน `src/app/api/.../route.ts` จะเป็นเพียง **Thin Adapter** ที่ Re-export หรือเรียกใช้ Handler จาก Module เท่านั้น (ความยาวเพียง 3-5 บรรทัด)


---

## 2. โครงสร้างไฟล์ Manifest (`manifest.ts`)

ไฟล์ `manifest.ts` เป็นหัวใจสำคัญในการลงทะเบียนโมดูลเข้ากับระบบ:

```typescript
import { ModuleManifest } from '@/lib/modules/types';

export const MyNewModuleManifest: ModuleManifest = {
  id: 'my-new-module',
  name: 'ชื่อโมดูลภาษาไทย',
  nameEn: 'My New Module',
  description: 'คำอธิบายสั้นๆ เกี่ยวกับหน้าที่ของโมดูลนี้',
  version: '1.0.0',
  author: 'eProfile System',
  icon: 'fa-solid fa-folder-open',
  category: 'operations', // 'core' | 'hr' | 'operations' | 'tools' | 'system'
  isCore: false,          // true = บังคับเปิดใช้งานเสมอ / false = ปิด/เปิดได้ผ่าน Module Manager
  defaultEnabled: true,
  settingsPath: '/modules/my-new-module/settings',
  menus: [
    {
      id: 'my-module-main-menu',
      title: 'รายการหลัก',
      icon: 'fa-solid fa-list',
      path: '/modules/my-new-module',
      order: 45,
    },
    {
      id: 'my-module-sub-menu',
      title: 'จัดการข้อมูล',
      icon: 'fa-solid fa-gear',
      path: '/modules/my-new-module/manage',
      requiredPermission: 'MANAGE_MY_MODULE',
      requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
      order: 46,
    },
  ],
  permissions: [
    {
      key: 'MANAGE_MY_MODULE',
      name: 'จัดการข้อมูลโมดูล',
      description: 'สิทธิ์ในการเพิ่ม ลบ และแก้ไขข้อมูลในโมดูลนี้',
    },
  ],
  legacyRoutes: {
    '/old-route': '/modules/my-new-module',
  },
};
```

---

## 3. การลงทะเบียนโมดูลในระบบ (Module Registration)

เมื่อสร้างโมดูลเสร็จ ให้ลงทะเบียนใน 2 จุดหลัก:

1. **[`src/lib/modules/registry.ts`](file:///Users/cangsalak/project/eprofile/src/lib/modules/registry.ts):**
   ```typescript
   import { MyNewModuleManifest } from '@/modules/my-new-module/manifest';

   export const ALL_SYSTEM_MODULES: ModuleManifest[] = [
     // ... โมดูลเดิม
     MyNewModuleManifest,
   ];
   ```

2. **[`src/lib/modules/view-registry.ts`](file:///Users/cangsalak/project/eprofile/src/lib/modules/view-registry.ts):**
   ```typescript
   import { MyNewModule } from '@/modules/my-new-module';

   export const BUILT_IN_MODULE_VIEWS: Record<string, ModuleDefinition> = {
     // ... โมดูลเดิม
     'my-new-module': MyNewModule,
   };
   ```

---

## 4. การจัดการ Dynamic Routing (Zero-touch Next.js)

ระบบ eProfile รองรับ **Zero-touch Next.js Configuration** ทั้งฝั่ง UI และ API:

### 4.1 ฝั่ง UI Routing (`/modules/[moduleId]/...`):
- Next.js App Router แมป URL เข้ากับ View อัตโนมัติผ่าน `src/app/modules/[...slug]/page.tsx`
- หน้าหลัก: `/modules/<module-id>` ➔ ดึง `views['']`
- หน้าย่อย: `/modules/<module-id>/<subPath>` ➔ ดึง `views[subPath]`

### 4.2 ฝั่ง API Routing (`/api/modules/[moduleId]/...`):
- Next.js App Router มี Universal API Dispatcher อยู่ที่ `src/app/api/modules/[...slug]/route.ts`
- ทำการ Dispatch Request ทุก Method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) ไปยัง Handler ใน `api[subPath]` ของโมดูลโดยอัตโนมัติ
- ตรวจสอบสถานะการเปิด/ปิดโมดูลในฐานข้อมูลให้อัตโนมัติ (ถ้าปิดโมดูลใน Module Manager คำขอ API จะถูกปฏิเสธทันที)
- รองรับ Dynamic Parameter เช่น `tokens/[id]` ใน `api` map

---

## 5. การใช้ Theme Header & Sub-menu Slot ในแต่ละ View

ห้ามสร้าง Header Banner ซ้ำซ้อน ให้ใช้ `<PageHeaderExtra>` เพื่อวาง Sub-menu หรือปุ่ม Action เข้าไปใน Header ส่วนกลางทางด้านขวา:

```tsx
'use client';

import React from 'react';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';
import { Button, Card, CardHeader, Badge } from '@/components/ui';

export default function MyView() {
  return (
    <div className="space-y-6 pb-16">
      <PageHeaderExtra>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" icon="fa-solid fa-plus">
            เพิ่มข้อมูลใหม่
          </Button>
        </div>
      </PageHeaderExtra>

      <Card>
        <CardHeader title="เนื้อหาข้อมูล" icon="fa-solid fa-table-list" />
        <div className="p-4">
          <Badge variant="success">พร้อมใช้งาน</Badge>
        </div>
      </Card>
    </div>
  );
}
```
