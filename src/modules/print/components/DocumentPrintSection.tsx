'use client';

import React, { useState } from 'react';
import { DocCategory, PaperSettings } from '../types';
import { Card, Button, Badge } from '@/components/ui';

interface DocumentPrintSectionProps {
  person: any;
  paperSettings: PaperSettings;
  allPersonnel?: any[];
}

export default function DocumentPrintSection({
  person,
  paperSettings,
  allPersonnel = [],
}: DocumentPrintSectionProps) {
  const [docCategory, setDocCategory] = useState<DocCategory>('leave');

  const docCategories: { id: DocCategory; name: string; icon: string; desc: string }[] = [
    { id: 'leave', name: 'ใบลาและแบบฟอร์มการลา', icon: 'fa-solid fa-calendar-xmark', desc: 'แบบฟอร์มการลาพักผ่อน / ลากิจ / ลาป่วย ราชการ' },
    { id: 'slip', name: 'สลิปเงินได้และเงินเดือน', icon: 'fa-solid fa-file-invoice-dollar', desc: 'หนังสือรับรองการจ่ายเงินเดือนและเงินได้รายบุคคล' },
    { id: 'rpb1', name: 'แบบประวัติ รพบ.1 (ทบ.100-009)', icon: 'fa-solid fa-shield-halved', desc: 'เอกสารระเบียนประวัติความมั่นคงมาตรฐานราชการ' },
    { id: 'roster', name: 'บัญชีรายชื่อและทำเนียบกำลังพล', icon: 'fa-solid fa-users-line', desc: 'บัญชีสรุปยอดกำลังพลจำแนกตามหน่วยงาน' },
    { id: 'duty', name: 'ตารางเวรปฏิบัติหน้าที่', icon: 'fa-solid fa-calendar-days', desc: 'ตารางคำสั่งเวรยามและภารกิจประจำเดือน' },
  ];

  const deptName = person.department?.name || person.department || 'กองบังคับการและหน่วยปฏิบัติการพิเศษ';
  const subDeptName = person.subDepartment?.name || person.subDepartment || 'ฝ่ายอำนวยการและยุทธการ';
  const rankPrefix = person.rank || person.prefix || '';
  const fullName = `${rankPrefix} ${person.firstName || ''} ${person.lastName || ''}`.trim();

  return (
    <div className="space-y-6">
      {/* Category selector buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 no-print">
        {docCategories.map((cat) => {
          const isSelected = docCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setDocCategory(cat.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-br from-primary-500/15 to-indigo-500/15 border-primary-500 shadow-clay-card ring-2 ring-primary-500/20'
                  : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                  isSelected
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <i className={cat.icon}></i>
              </div>
              <div>
                <h4
                  className={`text-xs font-black truncate ${
                    isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {cat.name}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {cat.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* A4 Paper Document Preview */}
      <div className="flex justify-center p-4 sm:p-8 bg-slate-100 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 print:bg-transparent print:border-none print:p-0">
        <div
          className={`bg-white text-black shadow-2xl transition-all duration-300 relative print:shadow-none print:m-0 font-serif ${
            paperSettings.orientation === 'landscape' ? 'w-[297mm] min-h-[210mm]' : 'w-[210mm] min-h-[297mm]'
          }`}
          style={{ padding: paperSettings.margin }}
        >
          {/* Watermark Overlay */}
          {paperSettings.watermark !== 'none' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none overflow-hidden opacity-[0.06]">
              <span className="text-7xl sm:text-8xl font-black uppercase transform -rotate-45 tracking-widest text-slate-900 border-8 border-slate-900 px-8 py-4 rounded-3xl">
                {paperSettings.watermark === 'original' && 'ORIGINAL'}
                {paperSettings.watermark === 'copy' && 'CERTIFIED COPY'}
                {paperSettings.watermark === 'confidential' && 'TOP SECRET'}
              </span>
            </div>
          )}

          {/* 1. แบบฟอร์มการลา */}
          {docCategory === 'leave' && (
            <div className="space-y-6 text-sm leading-relaxed">
              {paperSettings.showGaruda && (
                <div className="flex justify-center mb-2">
                  {/* Garuda Emblem */}
                  <div className="w-16 h-16 flex items-center justify-center text-3xl text-amber-800">
                    <i className="fa-solid fa-feather-pointed"></i>
                  </div>
                </div>
              )}

              <div className="text-right text-xs">
                <p>แบบใบลาพักผ่อน / ลากิจ / ลาป่วย</p>
                <p className="text-slate-500">เขียนที่ {deptName}</p>
                <p className="text-slate-500">วันที่ ..... เดือน .................... พ.ศ. ...........</p>
              </div>

              <div className="text-left space-y-1">
                <p><strong>เรื่อง</strong> ขอลาพักผ่อนประจำปี</p>
                <p><strong>เรียน</strong> ผู้บังคับการ{deptName}</p>
              </div>

              <div className="indent-8 text-justify space-y-3 pt-2">
                <p>
                  ข้าพเจ้า <strong>{fullName || '...................................................'}</strong> ตำแหน่ง <strong>{person.position || 'สารวัตรฝ่ายยุทธการ'}</strong> สังกัด <strong>{deptName}</strong> ({subDeptName}) รหัสประจำตัว <strong>{person.badgeNo || person.id || 'EP-XXXXX'}</strong> มีความประสงค์ขอลาพักผ่อนประจำปี ตั้งแต่วันที่ ..... เดือน .................... พ.ศ. ........... ถึงวันที่ ..... เดือน .................... พ.ศ. ........... มีกำหนด ..... วัน
                </p>
                <p>
                  ในระหว่างลาพักผ่อนนี้ สามารถติดต่อข้าพเจ้าได้ที่ <strong>{person.address || 'ที่อยู่ตามระเบียนประวัติกำลังพล'}</strong> โทรศัพท์ <strong>{person.phone || person.mobile || '08X-XXX-XXXX'}</strong> และได้มอบหมายหน้าที่ในความรับผิดชอบให้ ................................................... ปฏิบัติราชการแทน
                </p>
              </div>

              {/* Signature Section */}
              {paperSettings.showSignature && (
                <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs">
                  <div className="space-y-8">
                    <p>ความเห็นของผู้บังคับบัญชาขั้นต้น</p>
                    <div className="pt-6 border-b border-dotted border-black w-48 mx-auto"></div>
                    <p>(.........................................................)</p>
                    <p>ตำแหน่ง .........................................................</p>
                    <p>วันที่ ...../...../..........</p>
                  </div>

                  <div className="space-y-8">
                    <p>คำสั่ง / อนุมัติ</p>
                    <div className="pt-6 border-b border-dotted border-black w-48 mx-auto"></div>
                    <p>(.........................................................)</p>
                    <p>ตำแหน่ง ผู้บังคับการ{deptName}</p>
                    <p>วันที่ ...../...../..........</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. สลิปเงินได้และเงินเดือน */}
          {docCategory === 'slip' && (
            <div className="space-y-6 text-sm">
              <div className="text-center pb-3 border-b-2 border-black">
                <h3 className="text-base font-bold uppercase tracking-wider">{deptName}</h3>
                <h4 className="text-lg font-black mt-1">หนังสือรับรองการจ่ายเงินเดือนและเงินได้รายบุคคล</h4>
                <p className="text-xs text-slate-600 mt-0.5">ประจำเดือน กันยายน พ.ศ. 2569</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p><strong>ชื่อ-สกุล:</strong> {fullName}</p>
                  <p><strong>ตำแหน่ง:</strong> {person.position || 'ข้าราชการประจำ'}</p>
                  <p><strong>สังกัด:</strong> {deptName} ({subDeptName})</p>
                </div>
                <div>
                  <p><strong>เลขประจำตัวประชาชน:</strong> {person.citizenId || '1-1002-XXXXX-XX-X'}</p>
                  <p><strong>รหัสกำลังพล:</strong> {person.badgeNo || person.id}</p>
                  <p><strong>สถานะ:</strong> ปฏิบัติหน้าที่ปกติ</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Income */}
                <div className="border border-slate-300 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 p-2 font-bold text-xs border-b border-slate-300 flex justify-between">
                    <span>รายการรับ (Income)</span>
                    <span>จำนวนเงิน (บาท)</span>
                  </div>
                  <div className="p-3 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span>เงินเดือนประจำตำแหน่ง</span>
                      <span>{(person.salary || 38500).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>เงินเพิ่มค่าครองชีพชั่วคราว</span>
                      <span>2,500.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>เงินประจำตำแหน่ง</span>
                      <span>3,500.00</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-slate-200 text-primary-900">
                      <span>รวมเงินได้ทั้งสิ้น</span>
                      <span>{((person.salary || 38500) + 6000).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-300 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 p-2 font-bold text-xs border-b border-slate-300 flex justify-between">
                    <span>รายการหัก (Deduction)</span>
                    <span>จำนวนเงิน (บาท)</span>
                  </div>
                  <div className="p-3 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span>กบข. / ประกันสังคม</span>
                      <span>1,155.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ภาษีหัก ณ ที่จ่าย</span>
                      <span>850.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>สหกรณ์ออมทรัพย์</span>
                      <span>2,000.00</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-slate-200 text-rose-900">
                      <span>รวมรายการหักทั้งสิ้น</span>
                      <span>4,005.00</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center text-emerald-950 font-bold text-sm">
                <span>ยอดเงินได้สุทธิที่ได้รับ (Net Income)</span>
                <span className="text-base">{((person.salary || 38500) + 6000 - 4005).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
              </div>
            </div>
          )}

          {/* 3. แบบประวัติ รพบ. ๑ */}
          {docCategory === 'rpb1' && (
            <div className="space-y-4 text-xs">
              <div className="text-center pb-2 border-b-2 border-black">
                <span className="text-[10px] text-slate-500 float-right">แบบ ทบ. ๑๐๐-๐๐๙</span>
                <h3 className="text-sm font-bold">ระเบียนประวัติความปลอดภัย รปภ. ๑</h3>
                <h4 className="text-xs text-slate-600">{deptName}</h4>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <p><strong>ชื่อ:</strong> {fullName}</p>
                  <p><strong>ตำแหน่ง:</strong> {person.position || '-'}</p>
                </div>
                <div>
                  <p><strong>สังกัด:</strong> {deptName}</p>
                  <p><strong>หมู่โลหิต:</strong> {person.bloodType || 'O'}</p>
                </div>
                <div>
                  <p><strong>เลขประจำตัว:</strong> {person.badgeNo || person.id}</p>
                  <p><strong>สถานะ รปภ.:</strong> ผ่านการตรวจสอบขั้นสูง</p>
                </div>
              </div>

              <div className="p-3 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold border-b pb-1">ข้อมูลการศึกษาและการฝึกอบรมทางยุทธวิธี</h4>
                <p>• สำเร็จการศึกษาหลักสูตรชั้นนายร้อยและนายพัน ประจำปีการศึกษา 2562</p>
                <p>• ผ่านการอบรมหลักสูตรต่อต้านการก่อการร้ายสากลและยุทธวิธีพิเศษ</p>
                <p>• ผ่านการทดสอบสมรรถภาพร่างกายระดับมาตรฐานความมั่นคง ระดับดีเยี่ยม</p>
              </div>

              <div className="p-3 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold border-b pb-1">การประเมินชั้นความลับความปลอดภัย</h4>
                <p>ได้รับการอนุมัติให้เข้าถึงเอกสารและข้อมูลความมั่นคงระดับ <strong>ลับที่สุด (TOP SECRET)</strong></p>
              </div>
            </div>
          )}

          {/* 4. ทำเนียบและบัญชีกำลังพล */}
          {docCategory === 'roster' && (
            <div className="space-y-4 text-xs">
              <div className="text-center pb-2 border-b-2 border-black">
                <h3 className="text-sm font-bold">บัญชีรายชื่อและทำเนียบกำลังพล</h3>
                <p className="text-[11px] text-slate-600">{deptName}</p>
              </div>

              <table className="w-full border-collapse border border-slate-300 text-left text-[11px]">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-300 p-1.5 text-center w-10">ลำดับ</th>
                    <th className="border border-slate-300 p-1.5">ยศ - ชื่อ - สกุล</th>
                    <th className="border border-slate-300 p-1.5">ตำแหน่ง</th>
                    <th className="border border-slate-300 p-1.5">สังกัด / แผนก</th>
                    <th className="border border-slate-300 p-1.5 text-center">รหัสบัตร</th>
                  </tr>
                </thead>
                <tbody>
                  {(allPersonnel.length > 0 ? allPersonnel.slice(0, 10) : [person]).map((p, idx) => (
                    <tr key={p.id || idx}>
                      <td className="border border-slate-300 p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-slate-300 p-1.5 font-bold">
                        {p.rank || p.prefix || ''} {p.firstName} {p.lastName}
                      </td>
                      <td className="border border-slate-300 p-1.5">{p.position || '-'}</td>
                      <td className="border border-slate-300 p-1.5">
                        {p.department?.name || p.department || deptName}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-center font-mono">
                        {p.badgeNo || p.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. ตารางเวร */}
          {docCategory === 'duty' && (
            <div className="space-y-4 text-xs">
              <div className="text-center pb-2 border-b-2 border-black">
                <h3 className="text-sm font-bold">ตารางคำสั่งเวรยามและภารกิจประจำเดือน</h3>
                <p className="text-[11px] text-slate-600">หน่วย: {deptName}</p>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'].map((day, dIdx) => (
                  <div key={day} className="border border-slate-200 p-2 rounded-lg bg-slate-50">
                    <p className="font-bold text-primary-900 border-b border-slate-200 pb-1 mb-1">
                      เวรวัน{day}
                    </p>
                    <p className="text-[10px] text-slate-700"><strong>นายทหารเวร:</strong> {fullName}</p>
                    <p className="text-[10px] text-slate-500"><strong>พลขับ:</strong> ส.อ. สุรชัย ชัยชนะ</p>
                    <p className="text-[10px] text-slate-500"><strong>เวรยาม:</strong> 08:00 - 08:00 น.</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
