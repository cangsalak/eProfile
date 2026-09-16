'use client';

import React, { useRef } from 'react';
import { parseExcelFile, downloadPersonnelTemplate } from '../lib/excelUtils';
import toast from 'react-hot-toast';
import { Modal, Button } from '@/components/ui';

interface PersonnelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  setIsLoading: (loading: boolean) => void;
}

export default function PersonnelImportModal({
  isOpen,
  onClose,
  onRefresh,
  setIsLoading,
}: PersonnelImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          skills: '[]',
        };
        if (!mappedData.firstName || !mappedData.badgeNo) continue;

        await fetch('/api/personnel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mappedData),
        });
        successCount++;
      }

      toast.success(`นำเข้าข้อมูลบุคลากรสำเร็จ ${successCount} รายการ`);
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'เกิดข้อผิดพลาดในการนำเข้าไฟล์ Excel');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="นำเข้าข้อมูลจาก Excel"
      subtitle="อัปโหลดไฟล์ตารางข้อมูล Excel เพื่อนำเข้ากำลังพลเข้าสู่ระบบโดยอัตโนมัติ"
      icon="fa-solid fa-file-import"
      size="xl"
      className="p-0 overflow-hidden"
      footer={
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between w-full">
          <Button
            type="button"
            variant="outline"
            onClick={downloadPersonnelTemplate}
            icon="fa-solid fa-download text-emerald-600"
            className="rounded-xl text-xs sm:text-sm"
          >
            ดาวน์โหลดไฟล์ต้นแบบ (Template)
          </Button>
          <div className="flex items-center gap-2">
            <input
              id="personnelImportExcelInput"
              type="file"
              accept=".xlsx, .xls"
              aria-label="อัปโหลดไฟล์ Excel นำเข้าบุคลากร (.xlsx, .xls)"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImportExcel}
            />
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs sm:text-sm"
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              icon="fa-solid fa-cloud-arrow-up"
              className="rounded-xl text-xs sm:text-sm font-bold shadow-xs"
            >
              เลือกไฟล์และนำเข้าข้อมูล
            </Button>
          </div>
        </div>
      }
    >
      <div className="p-6 space-y-6 text-sm text-slate-700 dark:text-slate-300 max-h-[70vh] overflow-y-auto font-prompt">
        <div className="bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 p-4 rounded-2xl border border-primary-200 dark:border-primary-800/40 flex gap-3">
          <i className="fa-solid fa-circle-info mt-0.5 text-base text-primary-500"></i>
          <div>
            <p className="font-semibold mb-1">คำแนะนำในการนำเข้าข้อมูล</p>
            <p className="text-xs opacity-90 leading-relaxed">
              กรุณาเตรียมไฟล์ Excel (.xlsx หรือ .xls) โดยต้องมีหัวคอลัมน์ในบรรทัดแรก (แถวที่ 1) ตามรูปแบบด้านล่างนี้ คุณสามารถดาวน์โหลดฟอร์มตัวอย่างไปกรอกข้อมูลได้เพื่อความถูกต้อง
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <i className="fa-solid fa-table-columns text-primary-500 text-xs"></i>
            <span>คอลัมน์ที่ระบบรองรับ:</span>
          </h3>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-4 font-semibold w-1/3">ชื่อคอลัมน์ (Header)</th>
                  <th className="py-2.5 px-4 font-semibold">คำอธิบาย</th>
                  <th className="py-2.5 px-4 font-semibold w-20 text-center">จำเป็น</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <td className="py-2 px-4 font-mono text-primary-600 dark:text-primary-400 font-bold">คำนำหน้า หรือ prefix</td>
                  <td className="py-2 px-4 text-slate-500">เช่น นาย, นาง, นางสาว, ว่าที่ ร.ต.</td>
                  <td className="py-2 px-4 text-center"><i className="fa-solid fa-check text-emerald-500"></i></td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-mono text-primary-600 dark:text-primary-400 font-bold">ชื่อ หรือ firstName</td>
                  <td className="py-2 px-4 text-slate-500">ชื่อจริง (ไม่ต้องใส่คำนำหน้า)</td>
                  <td className="py-2 px-4 text-center"><i className="fa-solid fa-check text-emerald-500"></i></td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-mono text-primary-600 dark:text-primary-400 font-bold">นามสกุล หรือ lastName</td>
                  <td className="py-2 px-4 text-slate-500">นามสกุล</td>
                  <td className="py-2 px-4 text-center"><i className="fa-solid fa-check text-emerald-500"></i></td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-mono text-primary-600 dark:text-primary-400 font-bold">รหัสบัตร หรือ badgeNo</td>
                  <td className="py-2 px-4 text-slate-500">รหัสประจำตัวบนบัตร (ต้องไม่ซ้ำกัน)</td>
                  <td className="py-2 px-4 text-center"><i className="fa-solid fa-check text-emerald-500"></i></td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">ประเภท หรือ personnelType</td>
                  <td className="py-2 px-4 text-slate-500">นายทหารสัญญาบัตร, นายทหารประทวน ฯลฯ</td>
                  <td className="py-2 px-4 text-center text-slate-400">-</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">ตำแหน่ง หรือ position</td>
                  <td className="py-2 px-4 text-slate-500">ชื่อตำแหน่งงาน</td>
                  <td className="py-2 px-4 text-center text-slate-400">-</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">หน่วยงาน หรือ department</td>
                  <td className="py-2 px-4 text-slate-500">ชื่อแผนกหรือหน่วยงานสังกัด</td>
                  <td className="py-2 px-4 text-center text-slate-400">-</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">แผนก/ฝ่าย หรือ subDepartment</td>
                  <td className="py-2 px-4 text-slate-500">ชื่อฝ่ายย่อย</td>
                  <td className="py-2 px-4 text-center text-slate-400">-</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">เลขบัตรปชช หรือ citizenId</td>
                  <td className="py-2 px-4 text-slate-500">เลขบัตรประชาชน 13 หลัก</td>
                  <td className="py-2 px-4 text-center text-slate-400">-</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">เบอร์โทร หรือ phone / mobile</td>
                  <td className="py-2 px-4 text-slate-500">เบอร์โทรศัพท์</td>
                  <td className="py-2 px-4 text-center text-slate-400">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}
