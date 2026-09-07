import React from 'react';
import { LeavePrintFormProps } from './types';
import { Field } from './PrintField';
import { PrintFormLayout } from './PrintFormLayout';
import PrintButton from '../PrintButton';

export const OrdinationLeavePrintForm: React.FC<LeavePrintFormProps> = ({
  leave,
  personnel,
  startDay,
  startMonth,
  startYear,
  endDay,
  endMonth,
  endYear,
  diffDays,
  todayDay,
  todayMonth,
  todayYear,
}) => {
  const parseThaiDateStr = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return { day: '  ', month: '          ', year: '    ' };
    
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const y = date.getFullYear();
      return {
        day: date.getDate().toString(),
        month: date.toLocaleDateString('th-TH', { month: 'long' }),
        year: (y > 2500 ? y : y + 543).toString()
      };
    }

    if (typeof dateStr === 'string') {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        const mIndex = parseInt(parts[1]) - 1;
        return {
          day: parts[0],
          month: mIndex >= 0 && mIndex < 12 ? months[mIndex] : parts[1],
          year: parts[2]
        };
      }
      const spaceParts = dateStr.split(' ');
      if (spaceParts.length >= 3) {
        return {
          day: spaceParts[0],
          month: spaceParts[1],
          year: spaceParts[2]
        };
      }
      return { day: dateStr, month: '', year: '' };
    }
    
    return { day: '  ', month: '          ', year: '    ' };
  };

  const { day: dobDay, month: dobMonth, year: dobYear } = parseThaiDateStr(personnel?.dateOfBirth);
  const { day: commDay, month: commMonth, year: commYear } = parseThaiDateStr(personnel?.commissionDate);

  // @ts-ignore
  const { ordainedBefore, ordainTempleName, ordainTempleLocation, ordainDate, stayTempleName, stayTempleLocation } = leave;
  const { day: oDay, month: oMonth, year: oYear } = parseThaiDateStr(ordainDate);

  return (
    <>
      <div className="text-center mb-3 no-print pt-4">
        <PrintButton />
      </div>
      <PrintFormLayout formNumber="แบบ ๖" toPerson={leave.toPerson}>
        {/* Garuda Emblem */}
        <div className="flex justify-center mt-4 mb-1">
          <img
            src="/garuda.png"
            alt="ตราครุฑ"
            style={{ width: '3cm', height: '3cm', objectFit: 'contain' }}
          />
        </div>

        <div className="text-center font-bold text-[13.5pt] mb-2 leading-tight">
          ใบขอลาอุปสมบท
        </div>

        <div className="flex justify-end pr-2 mb-2">
          <div className="w-[50%]">
            <div className="flex items-baseline mb-0.5">
              <span className="whitespace-nowrap mr-2">เขียนที่</span>
              <Field width="auto" className="flex-1">{leave.writtenAt || 'กองบัญชาการ'}</Field>
            </div>
            <div className="flex items-baseline">
              <span className="whitespace-nowrap mr-1">วันที่</span>
              <Field width="30px">{todayDay}</Field>
              <span className="whitespace-nowrap mx-1">เดือน</span>
              <Field width="auto" className="flex-1">{todayMonth}</Field>
              <span className="whitespace-nowrap mx-1">พ.ศ.</span>
              <Field width="45px">{todayYear}</Field>
            </div>
          </div>
        </div>

        <div className="flex items-baseline mb-1.5">
          <span className="whitespace-nowrap w-[1.5cm]">เรื่อง</span>
          <span className="whitespace-nowrap">ขอลาอุปสมบท</span>
        </div>

        <div className="flex items-baseline mb-2">
          <span className="whitespace-nowrap w-[1.5cm]">เรียน</span>
          <Field width="auto" className="flex-1">{leave.toPerson || 'ผู้บังคับบัญชา'}</Field>
        </div>

        <div className="flex flex-wrap items-baseline mb-1.5 pl-[2cm]">
          <span className="mr-2 whitespace-nowrap">ข้าพเจ้า</span>
          <Field width="auto" className="flex-1 text-center">
            {`${personnel?.prefix || ''}${personnel?.firstName || ''} ${personnel?.lastName || ''}`}
          </Field>
          <span className="mx-2 whitespace-nowrap">ตำแหน่ง</span>
          <Field width="auto" className="flex-1 text-center">{personnel?.position || ''}</Field>
          <span className="mx-2 whitespace-nowrap">สังกัด</span>
          <Field width="auto" className="flex-1 text-center">
            {typeof personnel?.department === 'object' && personnel?.department !== null ? (personnel.department as any).name : (personnel?.department || '')}
          </Field>
        </div>

        <div className="flex flex-wrap items-baseline mb-1.5">
          <span className="mr-2 whitespace-nowrap">เกิดวันที่</span>
          <Field width="auto" className="w-10 text-center">{dobDay}</Field>
          <span className="mx-2 whitespace-nowrap">เดือน</span>
          <Field width="auto" className="w-28 text-center">{dobMonth}</Field>
          <span className="mx-2 whitespace-nowrap">พ.ศ.</span>
          <Field width="auto" className="w-16 text-center">{dobYear}</Field>
          <span className="mx-2 whitespace-nowrap">เข้ารับราชการเมื่อวันที่</span>
          <Field width="auto" className="w-10 text-center">{commDay}</Field>
          <span className="mx-2 whitespace-nowrap">เดือน</span>
          <Field width="auto" className="w-28 text-center">{commMonth}</Field>
          <span className="mx-2 whitespace-nowrap">พ.ศ.</span>
          <Field width="auto" className="w-16 text-center">{commYear}</Field>
        </div>

        <div className="flex items-baseline mb-1.5">
          <span className="mr-4 whitespace-nowrap">ข้าพเจ้า</span>
          <div className="flex items-center gap-2 mr-4 whitespace-nowrap">
            <div className="w-3.5 h-3.5 border border-black flex items-center justify-center">
              {!ordainedBefore && <span className="text-xs">✓</span>}
            </div>
            <span>ยังไม่เคย</span>
          </div>
          <div className="flex items-center gap-2 mr-4 whitespace-nowrap">
            <div className="w-3.5 h-3.5 border border-black flex items-center justify-center">
              {ordainedBefore && <span className="text-xs">✓</span>}
            </div>
            <span>เคย อุปสมบท</span>
          </div>
          <span className="whitespace-nowrap">บัดนี้มีศรัทธาจะอุปสมบทในพระพุทธศาสนา</span>
        </div>

        <div className="flex items-baseline mb-1.5">
          <span className="mr-2 whitespace-nowrap">ณ วัด</span>
          <Field width="auto" className="flex-1 text-center">{ordainTempleName || ''}</Field>
          <span className="mx-2 whitespace-nowrap">ตั้งอยู่ ณ</span>
          <Field width="auto" className="flex-1 text-center">{ordainTempleLocation || ''}</Field>
        </div>

        <div className="flex flex-wrap items-baseline mb-1.5">
          <span className="mr-2 whitespace-nowrap">กำหนดวันที่</span>
          <Field width="auto" className="w-10 text-center">{oDay}</Field>
          <span className="mx-2 whitespace-nowrap">เดือน</span>
          <Field width="auto" className="w-28 text-center">{oMonth}</Field>
          <span className="mx-2 whitespace-nowrap">พ.ศ.</span>
          <Field width="auto" className="w-16 text-center">{oYear}</Field>
          <span className="mx-2 whitespace-nowrap">และจะจำพรรษาอยู่ ณ วัด</span>
          <Field width="auto" className="flex-1 text-center">{stayTempleName || ''}</Field>
        </div>

        <div className="flex items-baseline mb-1.5">
          <span className="mr-2 whitespace-nowrap">ตั้งอยู่ ณ</span>
          <Field width="auto" className="flex-1 text-center">{stayTempleLocation || ''}</Field>
        </div>

        <div className="flex flex-wrap items-baseline mb-3">
          <span className="mr-2 whitespace-nowrap">จึงขออนุญาตลาอุปสมบทมีกำหนด</span>
          <Field width="auto" className="w-12 text-center">{diffDays?.toString() || ''}</Field>
          <span className="mx-2 whitespace-nowrap">วัน ตั้งแต่วันที่</span>
          <Field width="auto" className="w-10 text-center">{startDay}</Field>
          <span className="mx-2 whitespace-nowrap">เดือน</span>
          <Field width="auto" className="w-28 text-center">{startMonth}</Field>
          <span className="mx-2 whitespace-nowrap">พ.ศ.</span>
          <Field width="auto" className="w-16 text-center">{startYear}</Field>
          <span className="mx-2 whitespace-nowrap">ถึงวันที่</span>
          <Field width="auto" className="w-10 text-center">{endDay}</Field>
          <span className="mx-2 whitespace-nowrap">เดือน</span>
          <Field width="auto" className="w-28 text-center">{endMonth}</Field>
          <span className="mx-2 whitespace-nowrap">พ.ศ.</span>
          <Field width="auto" className="w-16 text-center">{endYear}</Field>
        </div>

        <div className="flex flex-col items-center mt-3 pl-[50%]">
          <div className="mb-2 whitespace-nowrap">ขอแสดงความนับถือ</div>
          
          <div className="flex items-baseline mb-0.5">
            <span className="whitespace-nowrap">(ลงชื่อ)</span>
            <Field width="auto" className="w-40 text-center" />
          </div>
          
          <div className="flex items-baseline">
            <span className="whitespace-nowrap">(</span>
            <Field 
              width="auto"
              className="w-40 text-center"
            >
              {`${personnel?.prefix || ''}${personnel?.firstName || ''} ${personnel?.lastName || ''}`}
            </Field>
            <span className="whitespace-nowrap">)</span>
          </div>
        </div>

        {/* ผู้บังคับบัญชา & คำสั่ง Section */}
        <div className="mt-4 text-[8.5pt]">
          <div className="mb-0.5 font-bold underline whitespace-nowrap">ความเห็นผู้บังคับบัญชา</div>
          <div className="flex items-baseline mb-0.5">
            <Field width="auto" className="flex-1" />
          </div>
          <div className="flex flex-col items-center pl-[50%] mb-2">
            <div className="flex items-baseline mb-0.5">
              <span className="whitespace-nowrap">(ลงชื่อ)</span>
              <Field width="auto" className="w-40" />
            </div>
            <div className="flex items-baseline mb-0.5">
              <span className="whitespace-nowrap">(ตำแหน่ง)</span>
              <Field width="auto" className="w-40" />
            </div>
            <div className="flex items-baseline">
              <span className="whitespace-nowrap">วันที่</span>
              <Field width="auto" className="w-8 text-center" />
              <span className="whitespace-nowrap">/</span>
              <Field width="auto" className="w-20 text-center" />
              <span className="whitespace-nowrap">/</span>
              <Field width="auto" className="w-12 text-center" />
            </div>
          </div>

          <div className="mb-0.5 font-bold underline whitespace-nowrap">คำสั่ง</div>
          <div className="flex items-center gap-6 mb-0.5 ml-6">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-3.5 h-3.5 border border-black flex items-center justify-center text-xs">✓</div>
              <span>อนุญาต</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-3.5 h-3.5 border border-black"></div>
              <span>ไม่อนุญาต</span>
            </div>
          </div>
          <div className="flex items-baseline mb-0.5">
            <Field width="auto" className="flex-1" />
          </div>
          <div className="flex flex-col items-center pl-[50%]">
            <div className="flex items-baseline mb-0.5">
              <span className="whitespace-nowrap">(ลงชื่อ)</span>
              <Field width="auto" className="w-40" />
            </div>
            <div className="flex items-baseline mb-0.5">
              <span className="whitespace-nowrap">(ตำแหน่ง)</span>
              <Field width="auto" className="w-40" />
            </div>
            <div className="flex items-baseline">
              <span className="whitespace-nowrap">วันที่</span>
              <Field width="auto" className="w-8 text-center" />
              <span className="whitespace-nowrap">/</span>
              <Field width="auto" className="w-20 text-center" />
              <span className="whitespace-nowrap">/</span>
              <Field width="auto" className="w-12 text-center" />
            </div>
          </div>
        </div>

        <div className="text-right text-[9pt] text-slate-500 mt-1">
          (พิมพ์ตามระเบียบ ทบ. ว่าด้วยการลา)
        </div>
      </PrintFormLayout>
    </>
  );
};
