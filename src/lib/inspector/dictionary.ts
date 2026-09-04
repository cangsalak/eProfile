export interface DictionaryEntry {
  wrong: string;
  correct: string;
  category: 'Spelling' | 'OfficialTerm' | 'Placeholder' | 'Grammar';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  recommendation: string;
}

export const THAI_DICTIONARY: DictionaryEntry[] = [
  { wrong: 'ข้อมุล', correct: 'ข้อมูล', category: 'Spelling', severity: 'MEDIUM', recommendation: 'แก้ไขสระอุเป็นสระอู: "ข้อมูล"' },
  { wrong: 'บันทึกขอมูล', correct: 'บันทึกข้อมูล', category: 'Spelling', severity: 'MEDIUM', recommendation: 'แก้ไขเป็น: "บันทึกข้อมูล"' },
  { wrong: 'บุคลากรณ์', correct: 'บุคลากร', category: 'Spelling', severity: 'MEDIUM', recommendation: 'ตัด ณ การันต์ ออก: "บุคลากร"' },
  { wrong: 'อนุมัติิ', correct: 'อนุมัติ', category: 'Spelling', severity: 'LOW', recommendation: 'ลบสระอิซ้ำซ้อน: "อนุมัติ"' },
  { wrong: 'อนุมัต', correct: 'อนุมัติ', category: 'Spelling', severity: 'MEDIUM', recommendation: 'เติมสระอิ: "อนุมัติ"' },
  { wrong: 'สังกัดด', correct: 'สังกัด', category: 'Spelling', severity: 'LOW', recommendation: 'ลบ ด ซ้ำ: "สังกัด"' },
  { wrong: 'ลายเซ็นต์', correct: 'ลายเซ็น', category: 'Spelling', severity: 'LOW', recommendation: 'คำที่ถูกต้องไม่มี ต์: "ลายเซ็น"' },
  { wrong: 'ประสิทธภาพ', correct: 'ประสิทธิภาพ', category: 'Spelling', severity: 'HIGH', recommendation: 'เติมสระอิ: "ประสิทธิภาพ"' },
  { wrong: 'ประวติ', correct: 'ประวัติ', category: 'Spelling', severity: 'MEDIUM', recommendation: 'เติมไม้หันอากาศ: "ประวัติ"' },
  { wrong: 'ตำแหนง', correct: 'ตำแหน่ง', category: 'Spelling', severity: 'MEDIUM', recommendation: 'เติมไม้เอก: "ตำแหน่ง"' },
  { wrong: 'เอกสารลแนบ', correct: 'เอกสารแนบ', category: 'Spelling', severity: 'LOW', recommendation: 'แก้ไขเป็น: "เอกสารแนบ"' },
  { wrong: 'เวปไซต์', correct: 'เว็บไซต์', category: 'Spelling', severity: 'LOW', recommendation: 'ใช้ บ ใบไม้: "เว็บไซต์"' },
  { wrong: 'กุมภาพันธ์์', correct: 'กุมภาพันธ์', category: 'Spelling', severity: 'LOW', recommendation: 'ลบไม้ทัณฑฆาตซ้ำ: "กุมภาพันธ์"' },
  { wrong: 'คำนำหนา', correct: 'คำนำหน้า', category: 'Spelling', severity: 'MEDIUM', recommendation: 'เติมไม้โท: "คำนำหน้า"' },
  { wrong: 'วันเกด', correct: 'วันเกิด', category: 'Spelling', severity: 'MEDIUM', recommendation: 'แก้ไขเป็น: "วันเกิด"' },
  { wrong: 'เบอรโทร', correct: 'เบอร์โทร', category: 'Spelling', severity: 'LOW', recommendation: 'เติมการันต์: "เบอร์โทรศัพท์"' },
  { wrong: 'เงนเดือน', correct: 'เงินเดือน', category: 'Spelling', severity: 'HIGH', recommendation: 'เติมสระอิ: "เงินเดือน"' },
  { wrong: 'สงออก', correct: 'ส่งออก', category: 'Spelling', severity: 'LOW', recommendation: 'เติมไม้เอก: "ส่งออก"' },
  { wrong: 'นำเขา', correct: 'นำเข้า', category: 'Spelling', severity: 'LOW', recommendation: 'เติมไม้โท: "นำเข้า"' },
  { wrong: 'พิมพ', correct: 'พิมพ์', category: 'Spelling', severity: 'LOW', recommendation: 'เติมไม้ทัณฑฆาต: "พิมพ์"' },
  { wrong: 'ปฏิทน', correct: 'ปฏิทิน', category: 'Spelling', severity: 'MEDIUM', recommendation: 'เติมสระอิ: "ปฏิทิน"' },
  { wrong: 'ยานพาหนะะ', correct: 'ยานพาหนะ', category: 'Spelling', severity: 'LOW', recommendation: 'ลบ สระอะ ซ้ำ: "ยานพาหนะ"' },
  { wrong: 'ทะเบยน', correct: 'ทะเบียน', category: 'Spelling', severity: 'MEDIUM', recommendation: 'เติมสระอี: "ทะเบียน"' },
  { wrong: 'การตงคา', correct: 'การตั้งค่า', category: 'Spelling', severity: 'HIGH', recommendation: 'แก้ไขเป็น: "การตั้งค่า"' },
  { wrong: 'รหสผาน', correct: 'รหัสผ่าน', category: 'Spelling', severity: 'CRITICAL', recommendation: 'แก้ไขเป็น: "รหัสผ่าน"' },
  { wrong: 'เขาบรการ', correct: 'เข้าบริการ', category: 'Spelling', severity: 'MEDIUM', recommendation: 'แก้ไขเป็น: "เข้าบริการ"' },
];

export const PLACEHOLDER_PATTERNS = [
  { regex: /lorem ipsum/i, name: 'Lorem Ipsum Dummy Text', severity: 'HIGH' as const },
  { regex: /todo:?\s+[a-z0-9]/i, name: 'TODO Marker in UI', severity: 'MEDIUM' as const },
  { regex: /fixme:?\s+[a-z0-9]/i, name: 'FIXME Marker in UI', severity: 'HIGH' as const },
  { regex: /test\s+data/i, name: 'Hardcoded Test Data', severity: 'MEDIUM' as const },
  { regex: /xxxx+/i, name: 'Placeholder Pattern (XXXX)', severity: 'LOW' as const },
  { regex: /\[placeholder\]/i, name: 'Explicit [Placeholder] Tag', severity: 'HIGH' as const },
  { regex: /undefined|null|\[object object\]/i, name: 'Raw JS String Leak (undefined/null)', severity: 'HIGH' as const },
];
