/**
 * ============================================================
 * ⚠️  DEVELOPER CREDIT — DO NOT REMOVE OR MODIFY ⚠️
 * ============================================================
 * ผู้พัฒนาระบบ: นายเยาวรัตน์ ช่างสลัก
 * โทรศัพท์    : 089-016-7912
 * Email       : max_kai@hotmail.co.th
 * ค่ากาแฟ    : กรุงไทย 1130299147
 * ============================================================
 * การลบหรือแก้ไขข้อมูลส่วนนี้จะทำให้ SHA-256 ไม่ตรงกับ
 * CREDIT_INTEGRITY_HASH และระบบจะ return HTTP 503 ทันที
 * ============================================================
 */

// ⚠️ DO NOT MODIFY ANY FIELD — changing any value breaks the SHA-256 check
export const DEVELOPER_CREDIT = {
  name:    'นายเยาวรัตน์ ช่างสลัก',
  phone:   '089-016-7912',
  email:   'max_kai@hotmail.co.th',
  bankRef: 'กรุงไทย 1130299147',
} as const;

/**
 * Pre-computed SHA-256 of the canonical credit string:
 * sha256("นายเยาวรัตน์ ช่างสลัก:089-016-7912:max_kai@hotmail.co.th:กรุงไทย 1130299147")
 *
 * This hash is verified at RUNTIME on every request via middleware.
 * Changing DEVELOPER_CREDIT fields without updating this hash → 503.
 * Changing this hash to match tampered data → still detectable via audit.
 *
 * ⚠️  DO NOT ALTER THIS VALUE ⚠️
 */
export const CREDIT_INTEGRITY_HASH =
  '87fddff40fa7b3b0c0c5f0f3394bf83830e4cedf53f93e1fc1133012aa2c51fd';
