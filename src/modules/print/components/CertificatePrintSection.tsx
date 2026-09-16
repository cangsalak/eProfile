'use client';

import React, { useState } from 'react';
import { PaperSettings } from '../types';
import { Select } from '@/components/ui';

interface CertificatePrintSectionProps {
  person: any;
  paperSettings: PaperSettings;
}

export default function CertificatePrintSection({
  person,
  paperSettings,
}: CertificatePrintSectionProps) {
  const [certType, setCertType] = useState<'salary' | 'employment'>('salary');

  const deptName = person.department?.name || person.department || 'กองบังคับการและหน่วยปฏิบัติการพิเศษ';
  const subDeptName = person.subDepartment?.name || person.subDepartment || 'ฝ่ายยุทธการ';
  const fullName = `${person.rank || person.prefix || ''} ${person.firstName} ${person.lastName}`.trim();

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm no-print">
        <Select
          label="ประเภทหนังสือรับรอง"
          value={certType}
          onChange={(e) => setCertType(e.target.value as any)}
          options={[
            { value: 'salary', label: 'หนังสือรับรองเงินเดือนและรายได้' },
            { value: 'employment', label: 'หนังสือรับรองการปฏิบัติราชการและการทำงาน' },
          ]}
        />
      </div>

      {/* A4 Certificate Preview */}
      <div className="flex justify-center p-6 sm:p-10 bg-slate-100 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 print:bg-transparent print:border-none print:p-0">
        <div
          className="bg-white text-black shadow-2xl transition-all duration-300 relative print:shadow-none print:m-0 font-serif w-[210mm] min-h-[297mm] space-y-6 text-sm leading-relaxed"
          style={{ padding: paperSettings.margin }}
        >
          {paperSettings.showGaruda && (
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 flex items-center justify-center text-3xl text-amber-800">
                <i className="fa-solid fa-feather-pointed"></i>
              </div>
            </div>
          )}

          <div className="text-center pb-2">
            <h3 className="text-lg font-black tracking-wide">
              {certType === 'salary' ? 'หนังสือรับรองเงินเดือน' : 'หนังสือรับรองการปฏิบัติราชการ'}
            </h3>
            <p className="text-xs text-slate-600">ที่ ........................................</p>
          </div>

          <div className="indent-8 text-justify space-y-4 pt-4">
            <p>
              หนังสือฉบับนี้ให้ไว้เพื่อรับรองว่า <strong>{fullName}</strong> ตำแหน่ง <strong>{person.position || 'ข้าราชการประจำ'}</strong> สังกัด <strong>{deptName}</strong> ({subDeptName}) เลขประจำตัวประชาชน <strong>{person.citizenId || '1-1002-XXXXX-XX-X'}</strong>
            </p>
            {certType === 'salary' ? (
              <p>
                ได้รับเงินเดือนในอัตราเดือนละ <strong>{(person.salary || 38500).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</strong> และเงินประจำตำแหน่งเดือนละ <strong>3,500.00 บาท</strong> รวมเป็นเงินได้ทั้งสิ้น <strong>{((person.salary || 38500) + 3500).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</strong> และเป็นผู้มีความประพฤติเรียบร้อย ปฏิบัติราชการด้วยความซื่อสัตย์สุจริต
              </p>
            ) : (
              <p>
                ได้เริ่มปฏิบัติราชการ ณ หน่วยงานนี้ตั้งแต่วันที่ ..... เดือน .................... พ.ศ. ........... จนถึงปัจจุบัน เป็นระยะเวลา ..... ปี มีความเชี่ยวชาญในหน้าที่ที่ได้รับมอบหมาย และเป็นผู้มีวินัย ซื่อสัตย์สุจริตต่อหน้าที่ราชการ
              </p>
            )}
            <p>
              ให้ไว้ ณ วันที่ ..... เดือน .................... พ.ศ. ........... เพื่อใช้เป็นหลักฐานประกอบการดำเนินการตามความประสงค์
            </p>
          </div>

          {/* Signature Section */}
          {paperSettings.showSignature && (
            <div className="pt-20 text-center text-xs space-y-8 float-right w-64">
              <div className="pt-8 border-b border-dotted border-black w-48 mx-auto"></div>
              <p>(.........................................................)</p>
              <p>ตำแหน่ง ผู้บังคับการ{deptName}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
