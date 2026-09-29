# 📦 คู่มือและกฎการใช้งานระบบคลังไฟล์และจัดเก็บข้อมูล (Upload & Storage Manager)

> **มาตรฐานการใช้งานคลังไฟล์ สื่อ และเอกสารสำหรับทุก Extension ในระบบ eProfile**

---

## 📌 1. โครงสร้างและหลักการจัดเก็บไฟล์ (Storage Hierarchy)

ระบบจัดเก็บไฟล์ eProfile รองรับทั้ง **Local Storage** (`/public/uploads/...`) และ **Cloud Object Storage (S3 / MinIO / Cloudflare R2 / Wasabi)** โดยใช้โครงสร้างแบบลำดับชั้นแยกตาม Extension, โฟลเดอร์ย่อย และลำดับเวลา:

```text
uploads/
└── <module>/
    └── <folder>/
        └── <YYYY>/
            └── <MM>/
                └── <sanitized_filename>_<timestamp>_<random>.<ext>
```

### 🏷️ ตารางรหัส Module และ Folder มาตรฐานในระบบ

| ส่วนขยาย (Module) | Folder ย่อยที่แนะนำ | คำอธิบาย | ตัวอย่าง URL ปลายทาง |
|---|---|---|---|
| `users` | `avatars`, `covers`, `rpb1`, `signatures` | รูปประจำตัว, ภาพปก, ลายมือชื่อ, เอกสาร รปภ.๑ | `/uploads/users/avatars/2026/09/avatar_123.jpg` |
| `news` | `posts`, `banners`, `attachments` | รูปภาพข่าว, ป้ายประชาสัมพันธ์, เอกสารแนบ | `/uploads/news/posts/2026/09/news_banner.webp` |
| `badges` | `templates`, `backgrounds`, `exports` | แม่แบบบัตร, ภาพพื้นหลังบัตร, ไฟล์บัตรที่ Export | `/uploads/badges/backgrounds/2026/09/bg_card.png` |
| `e-form` | `templates`, `attachments`, `signed` | ไฟล์แม่แบบ DOCX, เอกสารแนบใบลา, ใบลาที่เซ็นแล้ว | `/uploads/e-form/attachments/2026/09/doc.pdf` |
| `site` | `logos`, `hero`, `branding` | โลโก้หน่วยงาน, ภาพส่วนหัว, กราฟิกเว็บไซต์ | `/uploads/site/branding/2026/09/logo.png` |
| `print` | `exports`, `templates` | ไฟล์ PDF ที่พร้อมพิมพ์, แม่แบบเอกสารราชการ | `/uploads/print/exports/2026/09/doc_a4.pdf` |
| `upload` | `general`, `documents`, `media` | คลังสื่อกลาง, ไฟล์ทั่วไปที่ไม่ได้ขึ้นกับโมดูลใดเฉพาะ | `/uploads/upload/general/2026/09/file.pdf` |

> ⚠️ **กฎข้อบังคับ:** ห้ามอัปโหลดไฟล์ไปกองรวมที่ Root Directory (`/uploads/`) เด็ดขาด ทุกครั้งที่เรียกใช้อัปโหลด **ต้องระบุ `module` และ `folder` เสมอ**

---

## 🛠️ 2. วิธีการเรียกใช้งานในโค้ด (Developer Usage Guide)

### 2.1 การใช้งานผ่าน Component `<ImageUpload />`
ใช้สำหรับฟอร์มที่ต้องการอัปโหลดรูปภาพเดี่ยว เช่น รูปประจำตัว รูปปก เอกสาร รปภ.๑:

```tsx
import { ImageUpload } from '@/modules/upload';

// ตัวอย่าง: อัปโหลดรูปประจำตัวกำลังพล
<ImageUpload
  label="รูปถ่ายหน้าตรง"
  variant="avatar"
  module="users"           // 👈 ระบุชื่อ extension
  folder="avatars"         // 👈 ระบุโฟลเดอร์ย่อย
  value={formData.avatarUrl}
  onChange={(url, fileData) => {
    setFormData({ ...formData, avatarUrl: url });
  }}
  allowWebcam={true}       // เปิดกล้องถ่ายภาพได้
  allowMediaPicker={true}  // เลือกจากคลังสื่อได้
/>
```

---

### 2.2 การใช้งานผ่าน Component `<FileUpload />`
ใช้สำหรับฟอร์มที่ต้องการอัปโหลดเอกสาร ไฟล์แนบหลายไฟล์:

```tsx
import { FileUpload } from '@/modules/upload';

// ตัวอย่าง: แนบเอกสารประกอบการลา
<FileUpload
  label="เอกสารแนบประกอบการลา"
  module="e-form"          // 👈 ระบุชื่อ extension
  folder="attachments"     // 👈 ระบุโฟลเดอร์ย่อย
  acceptedTypes=".pdf,.docx,.xlsx,.jpg,.png"
  maxFiles={5}
  value={attachments}
  onChange={(files) => setAttachments(files)}
/>
```

---

### 2.3 การใช้งานผ่าน Helper `uploadFileToServer()`
ใช้เมื่อต้องการเขียนฟังก์ชันอัปโหลดเองใน Logic หรือ Event Handler:

```typescript
import { uploadFileToServer } from '@/modules/upload/lib/client-upload';

async function handleCustomUpload(file: File) {
  const result = await uploadFileToServer(file, {
    module: 'news',        // 👈 ระบุ extension
    folder: 'banners',     // 👈 ระบุ folder
    onProgress: (percent) => {
      console.log(`Upload progress: ${percent}%`);
    },
  });

  if (result.success && result.data) {
    console.log('File URL:', result.data.url);
    console.log('File ID:', result.data.id);
  } else {
    alert(result.error || 'Upload failed');
  }
}
```

---

### 2.4 การเรียกใช้ผ่าน REST API Handlers (FormData)
Endpoint หลัก: `POST /api/modules/upload/upload` (หรือ `POST /api/media` ผ่าน Rewrite)

```typescript
const formData = new FormData();
formData.append('file', fileObject);
formData.append('module', 'badges');     // 👈 ฟิลด์ระบุ module
formData.append('folder', 'templates');  // 👈 ฟิลด์ระบุ folder

const res = await fetch('/api/modules/upload/upload', {
  method: 'POST',
  body: formData,
});

const data = await res.json();
// Response: { success: true, file: { id, filename, url, size, mimetype, module, folder, createdAt } }
```

---

### 2.5 การเลือกไฟล์จากคลังสื่อเดิม `<MediaPickerModal />`

```tsx
import { MediaPickerModal } from '@/modules/upload';

<MediaPickerModal
  isOpen={isPickerOpen}
  onClose={() => setIsPickerOpen(false)}
  defaultModule="news"        // 👈 กรองไฟล์เริ่มต้นตาม module
  filterCategory="image"      // 👈 กรองเฉพาะรูปภาพ
  onSelectFile={(selected) => {
    setImageUrl(selected.url);
    setIsPickerOpen(false);
  }}
/>
```

---

## 🔒 3. กฎความปลอดภัยและสิทธิ์การเข้าถึง (RBAC & Security)

1. **สิทธิ์ในการจัดการไฟล์ (`MANAGE_MEDIA`):**
   - ผู้ใช้งานที่ต้องการอัปโหลดหรือลบไฟล์ต้องมีสิทธิ์ `MANAGE_MEDIA` (หรือบทบาท `EDITOR`, `ADMIN`, `SUPER_ADMIN`)
2. **การป้องกันชื่อไฟล์และ Path Traversal:**
   - ชื่อไฟล์จะถูก Sanitize อัตโนมัติ โดยรองรับตัวอักษรภาษาไทย (`\u0E00-\u0E7F`), ละติน, ตัวเลข และขีด (`-`, `_`)
   - ต่อท้ายด้วย Timestamp และ Random String เพื่อป้องกันชื่อไฟล์ซ้ำ
   - การลบไฟล์ใน Local Storage มีระบบ Safe Base Directory Check ป้องกัน Path Traversal ออกนอกโฟลเดอร์ `/public/uploads`
3. **การปกป้องความลับ Cloud Storage (Zero Secret Leakage):**
   - ห้ามเปิดเผย S3 Secret Access Key ออกทาง Client หรือ Public API เด็ดขาด (ตั้งค่าผ่าน `/modules/upload/settings` โดยผู้ดูแลระบบเท่านั้น)

---

## 🕒 4. กฎการเรียงลำดับและการแสดงผล (Sorting & UX)

1. **การเรียงลำดับเริ่มต้น (Default Sort Order):**
   - API และ View คลังไฟล์ต้องตั้งค่าการเรียงลำดับเริ่มต้นเป็น **`createdAt: 'desc'`** (ไฟล์ใหม่ล่าสุดต้องอยู่บนสุดเสมอ)
2. **การแสดงผลที่มาของไฟล์:**
   - การ์ดและตารางแสดงผลต้องแสดง Badge ระบุว่าไฟล์มาจาก Extension ใด (`module`) และจัดเก็บไว้ในโฟลเดอร์ใด (`folder`)
   - แสดงวันเวลาที่อัปโหลดในรูปแบบภาษาไทยอย่างถูกต้อง
