import React, { useRef } from 'react';
import { parseExcelFile, downloadPersonnelTemplate } from '@/lib/excelUtils';
import toast from 'react-hot-toast';

interface PersonnelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  setIsLoading: (loading: boolean) => void;
}

export default function PersonnelImportModal({ isOpen, onClose, onRefresh, setIsLoading }: PersonnelImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const data = await parseExcelFile(file);
      let successCount = 0;

      for (const row of data as any[]) {
        const mappedData = {
          id: `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          prefix: row['prefix'] || row['คำนำหน้า'] || 'นาย',
          firstName: row['firstName'] || row['ชื่อ'] || '',
          lastName: row['lastName'] || row['นามสกุล'] || '',
          position: row['position'] || row['ตำแหน่ง'] || '',
          personnelType: row['personnelType'] || row['ประเภท'] || 'นายทหารสัญญาบัตร',
          department: row['department'] || row['หน่วยงาน'] || '',
          subDepartment: row['subDepartment'] || row['แผนก/ฝ่าย'] || '',
          citizenId: String(row['citizenId'] || row['เลขบัตรปชช'] || ''),
          badgeNo: String(row['badgeNo'] || row['รหัสบัตร'] || ''),
          bloodType: row['bloodType'] || row['กรุ๊ปเลือด'] || '',
          phone: String(row['phone'] || row['เบอร์โทร'] || ''),
          email: row['email'] || row['อีเมล'] || '',
          mobile: String(row['mobile'] || row['มือถือ'] || ''),
          education: row['education'] || row['การศึกษา'] || '',
          experience: row['experience'] || row['ประสบการณ์'] || '',
          notes: row['notes'] || row['หมายเหตุ'] || '',
          dateOfBirth: String(row['dateOfBirth'] || row['วันเกิด'] || ''),
          religion: row['religion'] || row['ศาสนา'] || '',
          officialId: String(row['officialId'] || row['หมายเลขข้าราชการ'] || ''),
          militaryBranch: row['militaryBranch'] || row['เหล่า'] || '',
          commissionDate: String(row['commissionDate'] || row['วันบรรจุ'] || ''),
          currentAddress: row['currentAddress'] || row['ที่อยู่ (บ้านเลขที่)'] || row['ที่อยู่'] || '',
          currentTambon: row['currentTambon'] || row['ตำบล/แขวะ'] || '',
          currentAmphoe: row['currentAmphoe'] || row['อำเภอ/เขต'] || '',
          currentProvince: row['currentProvince'] || row['จังหวัด'] || '',
          currentZipcode: String(row['currentZipcode'] || row['รหัสไปรษณีย์'] || ''),
          emergencyContactName: row['emergencyContactName'] || row['ชื่อผู้ติดต่อฉุกเฉิน'] || '',
          emergencyContactPhone: String(row['emergencyContactPhone'] || row['เบอร์ผู้ติดต่อฉุกเฉิน'] || ''),
          emergencyContactRelation: row['emergencyContactRelation'] || row['ความสัมพันธ์ฉุกเฉิน'] || '',
          royalDecorations: row['royalDecorations'] || row['เครื่องราชฯ'] || '',
          trainingHistory: row['trainingHistory'] || row['ประวัติฝึกอบรม'] || '',
          role: 'OFFICER',
          status: 'ปฏิบัติงานปกติ',
          avatarColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)],
          skills: '[]'
        };
        if (!mappedData.firstName || !mappedData.badgeNo) continue;
        
        await fetch('/api/personnel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mappedData)
        });
        successCount++;
      }
      toast.success(`นำเข้าข้อมูลสำเร็จ ${successCount} รายการ`);
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการนำเข้าไฟล์');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            <i className="fa-solid fa-file-import text-blue-500 mr-3"></i> นำเข้าข้อมูลจาก Excel
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div className="p-6 space-y-6 text-sm text-slate-700 dark:text-slate-300">
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-xl border border-blue-200 dark:border-blue-800/30 flex gap-3">
            <i className="fa-solid fa-circle-info mt-0.5"></i>
            <div>
              <p className="font-semibold mb-1">คำแนะนำในการนำเข้าข้อมูล</p>
              <p className="text-xs opacity-90">
                กรุณาเตรียมไฟล์ Excel (.xlsx หรือ .xls) โดยต้องมีหัวคอลัมน์ในบรรทัดแรก (แถวที่ 1) ตามรูปแบบด้านล่างนี้ คุณสามารถดาวน์โหลดฟอร์มตัวอย่างไปกรอกข้อมูลได้เพื่อความถูกต้อง
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">คอลัมน์ที่ระบบต้องการ:</h3>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="py-2 px-4 font-semibold w-1/3">ชื่อคอลัมน์ (Header)</th>
                    <th className="py-2 px-4 font-semibold">คำอธิบาย</th>
                    <th className="py-2 px-4 font-semibold w-20 text-center">บังคับ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr>
                    <td className="py-2 px-4 font-mono text-primary-600 dark:text-primary-400">คำนำหน้า หรือ prefix</td>
                    <td className="py-2 px-4 text-slate-500">เช่น นาย, นาง, นางสาว, ว่าที่ ร.ต.</td>
                    <td className="py-2 px-4 text-center"><i className="fa-solid fa-check text-green-500"></i></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-primary-600 dark:text-primary-400">ชื่อ หรือ firstName</td>
                    <td className="py-2 px-4 text-slate-500">ชื่อจริง (ไม่ต้องใส่คำนำหน้า)</td>
                    <td className="py-2 px-4 text-center"><i className="fa-solid fa-check text-green-500"></i></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-primary-600 dark:text-primary-400">นามสกุล หรือ lastName</td>
                    <td className="py-2 px-4 text-slate-500">นามสกุล</td>
                    <td className="py-2 px-4 text-center"><i className="fa-solid fa-check text-green-500"></i></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-primary-600 dark:text-primary-400">รหัสบัตร หรือ badgeNo</td>
                    <td className="py-2 px-4 text-slate-500">รหัสประจำตัวบนบัตร (ต้องไม่ซ้ำกัน)</td>
                    <td className="py-2 px-4 text-center"><i className="fa-solid fa-check text-green-500"></i></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">ประเภท หรือ personnelType</td>
                    <td className="py-2 px-4 text-slate-500">นายทหารสัญญาบัตร, นายทหารประทวน ฯลฯ</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">ตำแหน่ง หรือ position</td>
                    <td className="py-2 px-4 text-slate-500">ชื่อตำแหน่งงาน</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">หน่วยงาน หรือ department</td>
                    <td className="py-2 px-4 text-slate-500">ชื่อแผนกหรือหน่วยงานสังกัด</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">แผนก/ฝ่าย หรือ subDepartment</td>
                    <td className="py-2 px-4 text-slate-500">ชื่อแผนกย่อย</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">เลขบัตรปชช หรือ citizenId</td>
                    <td className="py-2 px-4 text-slate-500">เลขประจำตัวประชาชน 13 หลัก</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">กรุ๊ปเลือด หรือ bloodType</td>
                    <td className="py-2 px-4 text-slate-500">A, B, O, AB</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">เบอร์โทร หรือ phone</td>
                    <td className="py-2 px-4 text-slate-500">เบอร์โทรศัพท์</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">อีเมล หรือ email</td>
                    <td className="py-2 px-4 text-slate-500">อีเมลที่ติดต่อได้</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">มือถือ หรือ mobile</td>
                    <td className="py-2 px-4 text-slate-500">เบอร์โทรศัพท์มือถือสำรอง</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">การศึกษา หรือ education</td>
                    <td className="py-2 px-4 text-slate-500">ประวัติการศึกษา</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">ประสบการณ์ หรือ experience</td>
                    <td className="py-2 px-4 text-slate-500">ประวัติการทำงาน</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">วันเกิด หรือ dateOfBirth</td>
                    <td className="py-2 px-4 text-slate-500">YYYY-MM-DD</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">ศาสนา หรือ religion</td>
                    <td className="py-2 px-4 text-slate-500">พุทธ, คริสต์, อิสลาม ฯลฯ</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">หมายเลขข้าราชการ หรือ officialId</td>
                    <td className="py-2 px-4 text-slate-500">รหัสข้าราชการประจำตัว</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">เหล่า หรือ militaryBranch</td>
                    <td className="py-2 px-4 text-slate-500">ทหารบก, ทหารเรือ, ทหารอากาศ ฯลฯ</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">วันบรรจุ หรือ commissionDate</td>
                    <td className="py-2 px-4 text-slate-500">วันที่บรรจุเข้ารับราชการ YYYY-MM-DD</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">ที่อยู่ (บ้านเลขที่) หรือ currentAddress</td>
                    <td className="py-2 px-4 text-slate-500">ที่อยู่ปัจจุบัน (บ้านเลขที่, ถนน, หมู่)</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">ตำบล/แขวง หรือ currentTambon</td>
                    <td className="py-2 px-4 text-slate-500">ตำบล หรือ แขวง</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">อำเภอ/เขต หรือ currentAmphoe</td>
                    <td className="py-2 px-4 text-slate-500">อำเภอ หรือ เขต</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">จังหวัด หรือ currentProvince</td>
                    <td className="py-2 px-4 text-slate-500">จังหวัด</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">รหัสไปรษณีย์ หรือ currentZipcode</td>
                    <td className="py-2 px-4 text-slate-500">รหัสไปรษณีย์ 5 หลัก</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">ติดต่อฉุกเฉิน หรือ emergencyContact...</td>
                    <td className="py-2 px-4 text-slate-500">ชื่อ, เบอร์, ความสัมพันธ์</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">อื่นๆ (หมายเหตุ, เครื่องราชฯ ฯลฯ)</td>
                    <td className="py-2 px-4 text-slate-500">notes, royalDecorations, trainingHistory</td>
                    <td className="py-2 px-4 text-center text-slate-300">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
            <button
              onClick={downloadPersonnelTemplate}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl transition-all font-medium text-sm flex items-center justify-center"
            >
              <i className="fa-solid fa-download mr-2 text-green-600"></i> โหลดไฟล์ต้นแบบ (Template)
            </button>
            <div className="w-full sm:w-auto">
              <input 
                id="personnelImportExcelInput"
                type="file" 
                accept=".xlsx, .xls" 
                aria-label="อัปโหลดไฟล์ Excel นำเข้าบุคลากร (.xlsx, .xls)"
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImportExcel} 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-8 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/30 transition-all font-medium text-sm flex items-center justify-center"
              >
                <i className="fa-solid fa-cloud-arrow-up mr-2"></i> เลือกไฟล์และอัปโหลด
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
