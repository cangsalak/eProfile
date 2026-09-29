export interface TemplateFieldTag {
  id: string;
  tag: string; // e.g. '{{fullName}}'
  name: string; // e.g. 'ชื่อ-นามสกุล'
  category: 'personnel' | 'leave' | 'date' | 'stats';
  defaultValue: string;
  description?: string;
}

export interface CanvasTagElement {
  id: string;
  tag: string; // e.g. '{{fullName}}'
  label: string;
  x: number; // in pt or px on standard A4 canvas (standard A4 pt: 595.28 x 841.89)
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  page?: number; // 1-based page index
  isCustom?: boolean; // Custom static text or admin-defined tag
  customValue?: string; // Text content entered by admin

  // Form Generation Configuration
  includeInForm?: boolean; // นำไปสร้างเป็นช่องกรอกในแบบฟอร์มหรือไม่
  formInputType?: 'text' | 'textarea' | 'date' | 'number' | 'readonly'; // ชนิดของช่องกรอกในฟอร์ม
  formLabel?: string; // ป้ายชื่อช่องกรอกในฟอร์ม
  isRequired?: boolean; // บังคับกรอกหรือไม่
}

export interface TemplateMappingConfig {
  version: string;
  pageWidth: number; // Standard A4 width = 595.28
  pageHeight: number; // Standard A4 height = 841.89
  elements: CanvasTagElement[];
}

export const TEMPLATE_TAG_DEFINITIONS: TemplateFieldTag[] = [
  // Personnel Info
  { id: 'fullName', tag: '{{fullName}}', name: 'ยศ ชื่อ-นามสกุล', category: 'personnel', defaultValue: 'พ.อ. สมชาย ใจกล้า', description: 'คำนำหน้า/ยศ พร้อมชื่อและนามสกุลเต็ม' },
  { id: 'rank', tag: '{{rank}}', name: 'ยศ / คำนำหน้า', category: 'personnel', defaultValue: 'พ.อ.', description: 'ยศทหารหรือคำนำหน้านาม' },
  { id: 'firstName', tag: '{{firstName}}', name: 'ชื่อตัว', category: 'personnel', defaultValue: 'สมชาย' },
  { id: 'lastName', tag: '{{lastName}}', name: 'นามสกุล', category: 'personnel', defaultValue: 'ใจกล้า' },
  { id: 'position', tag: '{{position}}', name: 'ตำแหน่ง', category: 'personnel', defaultValue: 'นายทหารปฏิบัติการ' },
  { id: 'department', tag: '{{department}}', name: 'สังกัด / กอง', category: 'personnel', defaultValue: 'สำนักปลัดบัญชี' },
  { id: 'subDepartment', tag: '{{subDepartment}}', name: 'แผนก / ฝ่าย', category: 'personnel', defaultValue: 'ฝ่ายแผนและโครงการ' },
  { id: 'phone', tag: '{{phone}}', name: 'เบอร์โทรศัพท์ติดต่อ', category: 'personnel', defaultValue: '081-234-5678' },
  { id: 'citizenId', tag: '{{citizenId}}', name: 'เลขประจำตัวประชาชน', category: 'personnel', defaultValue: '1-1004-99999-99-9' },

  // Leave Specific Fields
  { id: 'leaveType', tag: '{{leaveType}}', name: 'ประเภทการลา', category: 'leave', defaultValue: 'ลาพักผ่อน' },
  { id: 'reason', tag: '{{reason}}', name: 'เหตุผลการลา', category: 'leave', defaultValue: 'เพื่อไปพักผ่อนกับครอบครัว' },
  { id: 'startDate', tag: '{{startDate}}', name: 'วันที่เริ่มลา (เต็ม)', category: 'leave', defaultValue: '๑๕ ตุลาคม ๒๕๖๙' },
  { id: 'startDay', tag: '{{startDay}}', name: 'วันเริ่มลา (เฉพาะวันที่)', category: 'leave', defaultValue: '๑๕' },
  { id: 'startMonth', tag: '{{startMonth}}', name: 'วันเริ่มลา (เฉพาะเดือน)', category: 'leave', defaultValue: 'ตุลาคม' },
  { id: 'startYear', tag: '{{startYear}}', name: 'วันเริ่มลา (เฉพาะปี พ.ศ.)', category: 'leave', defaultValue: '๒๕๖๙' },
  { id: 'endDate', tag: '{{endDate}}', name: 'วันสิ้นสุดการลา (เต็ม)', category: 'leave', defaultValue: '๑๙ ตุลาคม ๒๕๖๙' },
  { id: 'endDay', tag: '{{endDay}}', name: 'วันสิ้นสุด (เฉพาะวันที่)', category: 'leave', defaultValue: '๑๙' },
  { id: 'endMonth', tag: '{{endMonth}}', name: 'วันสิ้นสุด (เฉพาะเดือน)', category: 'leave', defaultValue: 'ตุลาคม' },
  { id: 'endYear', tag: '{{endYear}}', name: 'วันสิ้นสุด (เฉพาะปี พ.ศ.)', category: 'leave', defaultValue: '๒๕๖๙' },
  { id: 'totalDays', tag: '{{totalDays}}', name: 'จำนวนวันลาทั้งหมด', category: 'leave', defaultValue: '๕' },
  { id: 'writtenAt', tag: '{{writtenAt}}', name: 'เขียนที่ (สถานที่)', category: 'leave', defaultValue: 'ที่ว่าการอำเภอ/ค่ายทหาร' },
  { id: 'toPerson', tag: '{{toPerson}}', name: 'เรียน (ผู้บังคับบัญชา)', category: 'leave', defaultValue: 'ผู้บัญชาการ' },
  { id: 'substitutePerson', tag: '{{substitutePerson}}', name: 'ผู้รับมอบหน้าที่แทน', category: 'leave', defaultValue: 'ร.อ. วินัย สุจริต' },
  { id: 'contactAddress', tag: '{{contactAddress}}', name: 'ที่อยู่ติดต่อระหว่างลา', category: 'leave', defaultValue: '๑๒๓ หมู่ ๔ ถ.วิภาวดีรังสิต แขวงสนามบิน เขตดอนเมือง กทม.' },

  // Current Date Fields
  { id: 'todayFull', tag: '{{todayFull}}', name: 'วันที่ปัจจุบัน (เต็ม)', category: 'date', defaultValue: '๑๐ ตุลาคม ๒๕๖๙' },
  { id: 'todayDay', tag: '{{todayDay}}', name: 'วันที่ปัจจุบัน (วัน)', category: 'date', defaultValue: '๑๐' },
  { id: 'todayMonth', tag: '{{todayMonth}}', name: 'วันที่ปัจจุบัน (เดือน)', category: 'date', defaultValue: 'ตุลาคม' },
  { id: 'todayYear', tag: '{{todayYear}}', name: 'วันที่ปัจจุบัน (ปี พ.ศ.)', category: 'date', defaultValue: '๒๕๖๙' },

  // Leave Balance & History Stats
  { id: 'accumulatedLeaveDays', tag: '{{accumulatedLeaveDays}}', name: 'วันลาสะสมยกมา', category: 'stats', defaultValue: '๑๐' },
  { id: 'thisYearLeaveDays', tag: '{{thisYearLeaveDays}}', name: 'สิทธิลาปีนี้', category: 'stats', defaultValue: '๑๐' },
  { id: 'totalAvailableDays', tag: '{{totalAvailableDays}}', name: 'รวมวันลาที่ใช้ได้', category: 'stats', defaultValue: '๒๐' },
  { id: 'pastPersonalDays', tag: '{{pastPersonalDays}}', name: 'จำนวนวันลากิจที่ผ่านมา', category: 'stats', defaultValue: '๒' },
  { id: 'pastSickDays', tag: '{{pastSickDays}}', name: 'จำนวนวันลาป่วยที่ผ่านมา', category: 'stats', defaultValue: '๑' },
];
