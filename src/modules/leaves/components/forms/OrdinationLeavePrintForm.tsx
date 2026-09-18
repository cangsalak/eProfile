import React from 'react';
import { LeavePrintFormProps } from './types';
import { Field } from './PrintField';
import { PrintFormLayout } from './PrintFormLayout';

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
    <PrintFormLayout formCode="ทบ. ๑๐๐ – ๐๐๘" formNumber="แบบ ๗" toPerson={leave.toPerson}>
      {/* Garuda Emblem */}
      <div className="flex justify-center mt-1 mb-1">
        <img
          src="/garuda.png"
          alt="ตราครุฑ"
          style={{ width: '3cm', height: '3cm', objectFit: 'contain' }}
        />
      </div>

      <div className="text-center font-bold text-[14pt] underline mb-2 leading-tight">
        ใบขอลาอุปสมบท
      </div>

      <div className="flex justify-end mb-2">
        <div className="w-[45%]">
          <div className="flex items-baseline mb-1">
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

      <div className="flex items-baseline mb-1">
        <span className="whitespace-nowrap w-[1.5cm]">เรื่อง</span>
        <span className="whitespace-nowrap">ขอลาอุปสมบท</span>
      </div>

      <div className="flex items-baseline mb-2">
        <span className="whitespace-nowrap w-[1.5cm]">เรียน</span>
        <Field width="auto" className="flex-1">{leave.toPerson || 'ผู้บังคับบัญชา'}</Field>
      </div>

      <div className="flex items-baseline mb-1 pl-[2cm]">
        <span className="mr-2 whitespace-nowrap">ข้าพเจ้า</span>
        <Field width="auto" className="flex-1">
          {`${personnel?.prefix || ''}${personnel?.firstName || ''} ${personnel?.lastName || ''}`}
        </Field>
        <span className="mx-2 whitespace-nowrap">ตำแหน่ง</span>
        <Field width="auto" className="flex-1">{personnel?.position || ''}</Field>
        <span className="mx-2 whitespace-nowrap">สังกัด</span>
        <Field width="auto" className="flex-1">
          {typeof personnel?.department === 'object' && personnel?.department !== null ? (personnel.department as any).name : (personnel?.department || '')}
        </Field>
      </div>

      <div className="flex items-baseline mb-1">
        <span className="mr-2 whitespace-nowrap">เกิดวันที่</span>
        <Field width="30px">{dobDay}</Field>
        <span className="mx-2 whitespace-nowrap">เดือน</span>
        <Field width="auto" className="flex-1">{dobMonth}</Field>
        <span className="mx-2 whitespace-nowrap">พ.ศ.</span>
        <Field width="45px">{dobYear}</Field>
        <span className="mx-2 whitespace-nowrap">เข้ารับราชการเมื่อวันที่</span>
        <Field width="30px">{commDay}</Field>
        <span className="mx-2 whitespace-nowrap">เดือน</span>
        <Field width="auto" className="flex-1">{commMonth}</Field>
        <span className="mx-2 whitespace-nowrap">พ.ศ.</span>
        <Field width="45px">{commYear}</Field>
      </div>

      <div className="flex items-baseline mb-1">
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

      <div className="flex items-baseline mb-1">
        <span className="mr-2 whitespace-nowrap">ณ วัด</span>
        <Field width="auto" className="flex-1">{ordainTempleName || ''}</Field>
        <span className="mx-2 whitespace-nowrap">ตั้งอยู่ ณ</span>
        <Field width="auto" className="flex-1">{ordainTempleLocation || ''}</Field>
      </div>

      <div className="flex items-baseline mb-1">
        <span className="mr-2 whitespace-nowrap">กำหนดวันที่</span>
        <Field width="30px">{oDay}</Field>
        <span className="mx-2 whitespace-nowrap">เดือน</span>
        <Field width="auto" className="flex-1">{oMonth}</Field>
        <span className="mx-2 whitespace-nowrap">พ.ศ.</span>
        <Field width="45px">{oYear}</Field>
        <span className="mx-2 whitespace-nowrap">และจะจำพรรษาอยู่ ณ วัด</span>
        <Field width="auto" className="flex-1">{stayTempleName || ''}</Field>
      </div>

      <div className="flex items-baseline mb-1">
        <span className="mr-2 whitespace-nowrap">ตั้งอยู่ ณ</span>
        <Field width="auto" className="flex-1">{stayTempleLocation || ''}</Field>
      </div>

      <div className="flex items-baseline mb-2">
        <span className="mr-2 whitespace-nowrap">จึงขออนุญาตลาอุปสมบทมีกำหนด</span>
        <Field width="35px">{diffDays?.toString() || ''}</Field>
        <span className="mx-2 whitespace-nowrap">วัน ตั้งแต่วันที่</span>
        <Field width="30px">{startDay}</Field>
        <span className="mx-2 whitespace-nowrap">เดือน</span>
        <Field width="auto" className="flex-1">{startMonth}</Field>
        <span className="mx-2 whitespace-nowrap">พ.ศ.</span>
        <Field width="45px">{startYear}</Field>
        <span className="mx-2 whitespace-nowrap">ถึงวันที่</span>
        <Field width="30px">{endDay}</Field>
        <span className="mx-2 whitespace-nowrap">เดือน</span>
        <Field width="auto" className="flex-1">{endMonth}</Field>
        <span className="mx-2 whitespace-nowrap">พ.ศ.</span>
        <Field width="45px">{endYear}</Field>
      </div>

      <div className="flex justify-end mb-3">
        <div className="text-center w-[250px] space-y-1">
          <div className="mb-1 text-center">ขอแสดงความนับถือ</div>
          <div className="flex items-baseline justify-center">
            <span className="whitespace-nowrap mr-2">(ลงชื่อ)</span>
            <Field width="130px" />
          </div>
          <div className="text-center">
            ({`${personnel?.prefix || ''}${personnel?.firstName || ''} ${personnel?.lastName || ''}`})
          </div>
          <div className="text-center">
            {personnel?.position || ''}
          </div>
        </div>
      </div>

      <hr className="border-black mt-2 mb-2 border-t-[1px]" />

      {/* ผู้บังคับบัญชา & คำสั่ง Section */}
      <div className="space-y-1.5">
        <div className="font-bold underline whitespace-nowrap">ความเห็นผู้บังคับบัญชา</div>
        <div className="flex items-baseline">
          <Field width="auto" className="flex-1" />
        </div>
        <div className="flex justify-end pt-1">
          <div className="text-center w-[250px] space-y-1">
            <div className="flex items-baseline justify-center">
              <span className="whitespace-nowrap mr-2">(ลงชื่อ)</span>
              <Field width="130px" />
            </div>
            <div className="flex items-baseline justify-center">
              <span className="whitespace-nowrap mr-2">ตำแหน่ง</span>
              <Field width="130px" />
            </div>
            <div className="flex items-baseline justify-center">
              <span className="whitespace-nowrap mr-1">วันที่</span>
              <Field width="25px" />
              <span className="whitespace-nowrap mx-1">/</span>
              <Field width="50px" />
              <span className="whitespace-nowrap mx-1">/</span>
              <Field width="35px" />
            </div>
          </div>
        </div>

        <div className="font-bold underline whitespace-nowrap mt-2">คำสั่ง</div>
        <div className="flex items-center gap-6 ml-6">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-3.5 h-3.5 border border-black flex items-center justify-center text-xs">✓</div>
            <span>อนุญาต</span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-3.5 h-3.5 border border-black"></div>
            <span>ไม่อนุญาต</span>
          </div>
        </div>
        <div className="flex items-baseline">
          <Field width="auto" className="flex-1" />
        </div>
        <div className="flex justify-end pt-1">
          <div className="text-center w-[250px] space-y-1">
            <div className="flex items-baseline justify-center">
              <span className="whitespace-nowrap mr-2">(ลงชื่อ)</span>
              <Field width="130px" />
            </div>
            <div className="flex items-baseline justify-center">
              <span className="whitespace-nowrap mr-2">ตำแหน่ง</span>
              <Field width="130px" />
            </div>
            <div className="flex items-baseline justify-center">
              <span className="whitespace-nowrap mr-1">วันที่</span>
              <Field width="25px" />
              <span className="whitespace-nowrap mx-1">/</span>
              <Field width="50px" />
              <span className="whitespace-nowrap mx-1">/</span>
              <Field width="35px" />
            </div>
          </div>
        </div>
      </div>

      <div className="text-right text-[10pt] text-slate-500 mt-1">
        (พิมพ์ตามระเบียบ ทบ. ว่าด้วยการลา)
      </div>
    </PrintFormLayout>
  );
};
