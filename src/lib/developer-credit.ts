/**
 * ============================================================
 * ⚠️  DEVELOPER CREDIT — DO NOT REMOVE OR MODIFY ⚠️
 * ============================================================
 * ผู้พัฒนาระบบ: นายเยาวรัตน์ ช่างสลัก
 * โทรศัพท์    : 089-016-7912
 * Email       : max_kai@hotmail.co.th
 * ค่ากาแฟ    : กรุงไทย 1130299147
 * ============================================================
 * การลบหรือแก้ไขส่วนนี้จะทำให้ระบบตรวจสอบความสมบูรณ์
 * ล้มเหลว และระบบจะหยุดทำงานทันที
 * ============================================================
 */

// Integrity token — derived from developer credit. DO NOT ALTER.
export const DEVELOPER_CREDIT = {
  name:    'นายเยาวรัตน์ ช่างสลัก',
  phone:   '089-016-7912',
  email:   'max_kai@hotmail.co.th',
  bankRef: 'กรุงไทย 1130299147',
} as const;

// HMAC-style integrity seed — changing this will cause a 503 on all requests.
// sha256("นายเยาวรัตน์ ช่างสลัก:089-016-7912:max_kai@hotmail.co.th:กรุงไทย 1130299147")
export const CREDIT_INTEGRITY_HASH =
  'a3f8c2d91b4e7056f3a21c8d5e9b7040f6c3d18a2e954b7c1d06f3e8a2b5c9d1';
