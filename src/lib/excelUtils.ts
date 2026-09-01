import * as XLSX from 'xlsx';
import { Personnel } from '../types/personnel';

export const downloadPersonnelTemplate = () => {
  const ws = XLSX.utils.json_to_sheet([{
    'คำนำหน้า': 'นาย',
    'ชื่อ': 'ตัวอย่าง',
    'นามสกุล': 'ทดสอบ',
    'ประเภท': 'พนักงานราชการ',
    'ตำแหน่ง': 'นักวิชาการคอมพิวเตอร์',
    'หน่วยงาน': 'กองเทคโนโลยีสารสนเทศ',
    'แผนก/ฝ่าย': 'แผนกซอฟต์แวร์',
    'รหัสบัตร': 'ID-001',
    'เลขบัตรปชช': '1234567890123',
    'หมายเลขข้าราชการ': '1000000001',
    'เหล่า': 'ทหารบก',
    'วันบรรจุ': '2015-05-01',
    'วันเกิด': '1990-01-01',
    'กรุ๊ปเลือด': 'O',
    'ศาสนา': 'พุทธ',
    'เบอร์โทร': '0812345678',
    'มือถือ': '0899999999',
    'อีเมล': 'test@example.com',
    'ที่อยู่': '123 ถ.สุขุมวิท กทม.',
    'การศึกษา': 'ปริญญาตรี',
    'ประสบการณ์': '5 ปี',
    'ประวัติฝึกอบรม': '-',
    'เครื่องราชฯ': '-',
    'ชื่อผู้ติดต่อฉุกเฉิน': 'นายใจดี',
    'เบอร์ผู้ติดต่อฉุกเฉิน': '0811111111',
    'ความสัมพันธ์ฉุกเฉิน': 'บิดา',
    'หมายเหตุ': '-'
  }]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, 'personnel_template.xlsx');
};

export const exportPersonnelToExcel = (personnelList: Personnel[]) => {
  const exportData = personnelList.map(p => ({
    'รหัสบัตร': p.badgeNo,
    'คำนำหน้า': p.prefix,
    'ชื่อ': p.firstName,
    'นามสกุล': p.lastName,
    'ประเภท': p.personnelType,
    'ตำแหน่ง': p.position,
    'หน่วยงาน': p.department,
    'แผนก/ฝ่าย': p.subDepartment,
    'เลขบัตรปชช': p.citizenId,
    'กรุ๊ปเลือด': p.bloodType,
    'เบอร์โทร': p.phone,
    'อีเมล': p.email,
    'มือถือ': p.mobile,
    'การศึกษา': p.education,
    'ประสบการณ์': p.experience,
    'หมายเหตุ': p.notes,
    'วันเกิด': p.dateOfBirth,
    'ศาสนา': p.religion,
    'หมายเลขข้าราชการ': p.officialId,
    'เหล่า': p.militaryBranch,
    'วันบรรจุ': p.commissionDate,
    'ที่อยู่ (บ้านเลขที่)': p.currentAddress,
    'ตำบล/แขวง': p.currentTambon,
    'อำเภอ/เขต': p.currentAmphoe,
    'จังหวัด': p.currentProvince,
    'รหัสไปรษณีย์': p.currentZipcode,
    'ชื่อผู้ติดต่อฉุกเฉิน': p.emergencyContactName,
    'เบอร์ผู้ติดต่อฉุกเฉิน': p.emergencyContactPhone,
    'ความสัมพันธ์ฉุกเฉิน': p.emergencyContactRelation,
    'เครื่องราชฯ': p.royalDecorations,
    'ประวัติฝึกอบรม': p.trainingHistory
  }));
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Personnel');
  XLSX.writeFile(wb, 'personnel_data.xlsx');
};

export const parseExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { raw: false });
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
};
