'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PaperSettings } from '../types';
import { Badge, Select } from '@/components/ui';

interface BarcodeQrPrintSectionProps {
  person: any;
  allPersonnel?: any[];
  paperSettings: PaperSettings;
}

export default function BarcodeQrPrintSection({
  person,
  allPersonnel = [],
  paperSettings,
}: BarcodeQrPrintSectionProps) {
  const [labelStyle, setLabelStyle] = useState<'qr_badge' | 'barcode_strip' | 'nametag'>('qr_badge');
  const [repeatCount, setRepeatCount] = useState<number>(8);

  const activeList = allPersonnel.length > 0 ? allPersonnel.slice(0, repeatCount) : Array(repeatCount).fill(person);
  const fullName = `${person.rank || person.prefix || ''} ${person.firstName} ${person.lastName}`.trim();
  const deptName = person.department?.name || person.department || 'กองบังคับการ';
  const subDeptName = person.subDepartment?.name || person.subDepartment || 'ฝ่ายยุทธการ';

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm no-print">
        <div className="flex items-center gap-3">
          <Select
            label="รูปแบบป้ายสติกเกอร์"
            value={labelStyle}
            onChange={(e) => setLabelStyle(e.target.value as any)}
            options={[
              { value: 'qr_badge', label: 'สติกเกอร์ QR Code ประจำตัว + ตราหน่วย' },
              { value: 'barcode_strip', label: 'แถบบาร์โค้ดรหัสกำลังพล (ID Sticker)' },
              { value: 'nametag', label: 'ป้ายชื่อติดหน้าอก / ป้ายติดโต๊ะทำงาน' },
            ]}
          />

          <Select
            label="จำนวนพิมพ์ซ้ำต่อแผ่น"
            value={String(repeatCount)}
            onChange={(e) => setRepeatCount(Number(e.target.value))}
            options={[
              { value: '4', label: '4 ชิ้น / แผ่น' },
              { value: '8', label: '8 ชิ้น / แผ่น' },
              { value: '12', label: '12 ชิ้น / แผ่น' },
              { value: '16', label: '16 ชิ้น / แผ่น' },
            ]}
          />
        </div>

        <Badge variant="primary" size="xs">
          Sticker Sheet Ready (A4)
        </Badge>
      </div>

      {/* A4 Sheet Preview */}
      <div className="flex justify-center p-6 sm:p-10 bg-slate-100 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 print:bg-transparent print:border-none print:p-0">
        <div
          className="bg-white text-black shadow-2xl p-6 print:p-2 transition-all duration-300 print:shadow-none print:m-0 w-[210mm] min-h-[297mm]"
          style={{ padding: paperSettings.margin }}
        >
          <div className="grid grid-cols-2 gap-4">
            {activeList.map((p, idx) => {
              const pFullName = `${p.rank || p.prefix || ''} ${p.firstName} ${p.lastName}`.trim();
              const pBadgeNo = p.badgeNo || p.id || 'EP-00000';
              const pDept = p.department?.name || p.department || deptName;

              return (
                <div
                  key={idx}
                  className="p-3 border border-dashed border-slate-300 rounded-xl flex items-center gap-3 bg-white print:border-slate-400 break-inside-avoid"
                >
                  {labelStyle === 'qr_badge' && (
                    <>
                      <div className="p-1 bg-white border border-slate-200 rounded-lg shrink-0">
                        <QRCodeSVG
                          value={typeof window !== 'undefined' ? `${window.location.origin}/verify/${p.id}` : pBadgeNo}
                          size={58}
                        />
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        <p className="text-xs font-bold truncate text-slate-900">{pFullName}</p>
                        <p className="text-[10px] text-slate-600 truncate">{p.position || 'เจ้าหน้าที่'}</p>
                        <p className="text-[9px] text-slate-500 truncate">{pDept}</p>
                        <p className="text-[9px] font-mono font-bold text-primary-700">{pBadgeNo}</p>
                      </div>
                    </>
                  )}

                  {labelStyle === 'barcode_strip' && (
                    <div className="w-full text-center space-y-1 py-1">
                      <p className="text-xs font-bold text-slate-900">{pFullName}</p>
                      <div className="h-8 bg-slate-900 text-white font-mono flex items-center justify-center text-xs tracking-widest px-4 rounded">
                        ||| | |||| | ||| || |||
                      </div>
                      <p className="text-[10px] font-mono tracking-widest font-bold">{pBadgeNo}</p>
                    </div>
                  )}

                  {labelStyle === 'nametag' && (
                    <div className="w-full text-center py-2 space-y-1 border-2 border-slate-800 rounded-lg">
                      <p className="text-sm font-black text-slate-900">{pFullName}</p>
                      <p className="text-[10px] font-bold text-slate-600">{p.position || '-'}</p>
                      <p className="text-[9px] text-slate-500">{pDept}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
