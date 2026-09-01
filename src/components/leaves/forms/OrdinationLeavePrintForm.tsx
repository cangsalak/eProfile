import React from 'react';
import { LeavePrintFormProps } from './types';
import { Field } from './PrintField';

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
  // Safe date parsing helper for Thai dates in DB (e.g. "24/12/2529" or "3 พฤศจิกายน 2550" or ISO Date)
  const parseThaiDateStr = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return { day: '  ', month: '          ', year: '    ' };
    
    // If it's a valid Date object or ISO string
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const y = date.getFullYear();
      return {
        day: date.getDate().toString(),
        month: date.toLocaleDateString('th-TH', { month: 'long' }),
        year: (y > 2500 ? y : y + 543).toString()
      };
    }

    // If it's a string like "24/12/2529"
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
      // If it's a string like "3 พฤศจิกายน 2550"
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

  const dob = parseThaiDateStr(personnel?.dateOfBirth);
  const dobDay = dob.day;
  const dobMonth = dob.month;
  const dobYear = dob.year;

  const comm = parseThaiDateStr(personnel?.commissionDate);
  const commDay = comm.day;
  const commMonth = comm.month;
  const commYear = comm.year;

  // @ts-ignore - these fields exist in our updated schema
  const { ordainedBefore, ordainTempleName, ordainTempleLocation, ordainDate, stayTempleName, stayTempleLocation } = leave;

  const oDate = parseThaiDateStr(ordainDate);
  const oDay = oDate.day;
  const oMonth = oDate.month;
  const oYear = oDate.year;

  return (
    <div className="bg-slate-200 min-h-screen py-8 print:bg-white print:py-0">
      <div className="a4-page relative leading-relaxed">
        
        <div className="text-center font-bold text-2xl mb-8">แบบใบลาอุปสมบท</div>

        <div className="flex justify-end pr-4 mb-4">
          <div className="w-[300px]">
            <div className="flex items-baseline mb-2">
              <span className="w-16 whitespace-nowrap">เขียนที่</span>
              <Field width="auto" className="flex-1 text-center">{leave.writtenAt}</Field>
            </div>
            <div className="flex items-baseline">
              <span className="mr-2 whitespace-nowrap">วันที่</span>
              <Field width="auto" className="w-12 text-center">{todayDay}</Field>
              <span className="mx-2 whitespace-nowrap">เดือน</span>
              <Field width="auto" className="flex-1 text-center">{todayMonth}</Field>
              <span className="mx-2 whitespace-nowrap">พ.ศ.</span>
              <Field width="auto" className="w-16 text-center">{todayYear}</Field>
            </div>
          </div>
        </div>

        <div className="flex items-baseline mb-2 mt-8">
          <span className="w-[1.5cm] whitespace-nowrap">เรื่อง</span>
          <span className="ml-2 whitespace-nowrap">ขอลาอุปสมบท</span>
        </div>

        <div className="flex items-baseline mb-6">
          <span className="w-[1.5cm] whitespace-nowrap">เรียน</span>
          <Field width="auto" className="ml-2 flex-1">{leave.toPerson}</Field>
        </div>

        <div className="pl-[2.5cm] flex flex-wrap items-baseline mb-2">
          <span className="mr-2 whitespace-nowrap">ข้าพเจ้า</span>
          <Field width="auto" className="flex-1 min-w-[200px] text-center">{`${personnel?.prefix || ''}${personnel?.firstName || ''} ${personnel?.lastName || ''}`}</Field>
          <span className="mx-2 whitespace-nowrap">ตำแหน่ง</span>
          <Field width="auto" className="flex-1 min-w-[200px] text-center">{personnel?.position || ''}</Field>
        </div>

        <div className="flex items-baseline mb-2">
          <span className="mr-2 whitespace-nowrap">สังกัด</span>
          <Field width="auto" className="flex-1 text-center">{`${personnel?.department || ''} ${personnel?.subDepartment || ''}`}</Field>
        </div>

        <div className="flex flex-wrap items-baseline mb-2">
          <span className="mr-2 whitespace-nowrap">เกิดวันที่</span>
          <Field width="auto" className="w-12 text-center">{dobDay}</Field>
          <span className="mx-2 whitespace-nowrap">เดือน</span>
          <Field width="auto" className="w-32 text-center">{dobMonth}</Field>
          <span className="mx-2 whitespace-nowrap">พ.ศ.</span>
          <Field width="auto" className="w-20 text-center">{dobYear}</Field>
          <span className="mx-2 whitespace-nowrap">เข้ารับราชการเมื่อวันที่</span>
          <Field width="auto" className="w-12 text-center">{commDay}</Field>
          <span className="mx-2 whitespace-nowrap">เดือน</span>
          <Field width="auto" className="w-32 text-center">{commMonth}</Field>
          <span className="mx-2 whitespace-nowrap">พ.ศ.</span>
          <Field width="auto" className="w-20 text-center">{commYear}</Field>
        </div>

        <div className="flex items-baseline mb-2">
          <span className="mr-4 whitespace-nowrap">ข้าพเจ้า</span>
          <div className="flex items-center gap-2 mr-4 whitespace-nowrap">
            <div className="w-4 h-4 border border-black flex items-center justify-center">
              {!ordainedBefore && <span className="text-xs">✓</span>}
            </div>
            <span>ยังไม่เคย</span>
          </div>
          <div className="flex items-center gap-2 mr-4 whitespace-nowrap">
            <div className="w-4 h-4 border border-black flex items-center justify-center">
              {ordainedBefore && <span className="text-xs">✓</span>}
            </div>
            <span>เคย อุปสมบท</span>
          </div>
          <span className="whitespace-nowrap">บัดนี้มีศรัทธาจะอุปสมบทในพระพุทธศาสนา</span>
        </div>

        <div className="flex items-baseline mb-2">
          <span className="mr-2 whitespace-nowrap">ณ วัด</span>
          <Field width="auto" className="flex-1 text-center">{ordainTempleName || ''}</Field>
          <span className="mx-2 whitespace-nowrap">ตั้งอยู่ ณ</span>
          <Field width="auto" className="flex-1 text-center">{ordainTempleLocation || ''}</Field>
        </div>

        <div className="flex flex-wrap items-baseline mb-2">
          <span className="mr-2 whitespace-nowrap">กำหนดวันที่</span>
          <Field width="auto" className="w-12 text-center">{oDay}</Field>
          <span className="mx-2 whitespace-nowrap">เดือน</span>
          <Field width="auto" className="w-32 text-center">{oMonth}</Field>
          <span className="mx-2 whitespace-nowrap">พ.ศ.</span>
          <Field width="auto" className="w-20 text-center">{oYear}</Field>
          <span className="mx-2 whitespace-nowrap">และจะจำพรรษาอยู่ ณ วัด</span>
          <Field width="auto" className="flex-1 text-center">{stayTempleName || ''}</Field>
        </div>

        <div className="flex items-baseline mb-2">
          <span className="mr-2 whitespace-nowrap">ตั้งอยู่ ณ</span>
          <Field width="auto" className="flex-1 text-center">{stayTempleLocation || ''}</Field>
        </div>

        <div className="flex flex-wrap items-baseline mb-6">
          <span className="mr-2 whitespace-nowrap">จึงขออนุญาตลาอุปสมบทมีกำหนด</span>
          <Field width="auto" className="w-16 text-center">{diffDays?.toString() || ''}</Field>
          <span className="mx-2 whitespace-nowrap">วัน ตั้งแต่วันที่</span>
          <Field width="auto" className="w-12 text-center">{startDay}</Field>
          <span className="mx-2 whitespace-nowrap">เดือน</span>
          <Field width="auto" className="w-32 text-center">{startMonth}</Field>
          <span className="mx-2 whitespace-nowrap">พ.ศ.</span>
          <Field width="auto" className="w-20 text-center">{startYear}</Field>
          <span className="mx-2 whitespace-nowrap">ถึงวันที่</span>
          <Field width="auto" className="w-12 text-center">{endDay}</Field>
          <span className="mx-2 whitespace-nowrap">เดือน</span>
          <Field width="auto" className="w-32 text-center">{endMonth}</Field>
          <span className="mx-2 whitespace-nowrap">พ.ศ.</span>
          <Field width="auto" className="w-20 text-center">{endYear}</Field>
        </div>

        <div className="flex flex-col items-center mt-6 pl-[50%]">
          <div className="mb-4 whitespace-nowrap">ขอแสดงความนับถือ</div>
          
          <div className="flex items-baseline mb-2">
            <span className="whitespace-nowrap">(ลงชื่อ)</span>
            <Field width="auto" className="w-48 text-center" />
          </div>
          
          <div className="flex items-baseline">
            <span className="whitespace-nowrap">(</span>
            <Field 
              width="auto"
              className="w-48 text-center"
            >
              {`${personnel?.prefix || ''}${personnel?.firstName || ''} ${personnel?.lastName || ''}`}
            </Field>
            <span className="whitespace-nowrap">)</span>
          </div>
        </div>

        {/* ผู้บังคับบัญชา & คำสั่ง Section */}
        <div className="mt-8">
          <div className="mb-2 font-bold underline whitespace-nowrap">ความเห็นผู้บังคับบัญชา</div>
          <div className="flex items-baseline mb-2">
            <Field width="auto" className="flex-1" />
          </div>
          <div className="flex items-baseline mb-4">
            <Field width="auto" className="flex-1" />
          </div>
          <div className="flex flex-col items-center pl-[50%] mb-4">
            <div className="flex items-baseline mb-2">
              <span className="whitespace-nowrap">(ลงชื่อ)</span>
              <Field width="auto" className="w-48" />
            </div>
            <div className="flex items-baseline mb-2">
              <span className="whitespace-nowrap">(ตำแหน่ง)</span>
              <Field width="auto" className="w-48" />
            </div>
            <div className="flex items-baseline">
              <span className="whitespace-nowrap">วันที่</span>
              <Field width="auto" className="w-8 text-center" />
              <span className="whitespace-nowrap">/</span>
              <Field width="auto" className="w-24 text-center" />
              <span className="whitespace-nowrap">/</span>
              <Field width="auto" className="w-16 text-center" />
            </div>
          </div>

          <div className="mb-2 font-bold underline whitespace-nowrap">คำสั่ง</div>
          <div className="flex items-center gap-8 mb-2 ml-8">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-4 h-4 border border-black"></div>
              <span>อนุญาต</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-4 h-4 border border-black"></div>
              <span>ไม่อนุญาต</span>
            </div>
          </div>
          <div className="flex items-baseline mb-2">
            <Field width="auto" className="flex-1" />
          </div>
          <div className="flex items-baseline mb-2">
            <Field width="auto" className="flex-1" />
          </div>
          <div className="flex flex-col items-center pl-[50%]">
            <div className="flex items-baseline mb-2">
              <span className="whitespace-nowrap">(ลงชื่อ)</span>
              <Field width="auto" className="w-48" />
            </div>
            <div className="flex items-baseline mb-2">
              <span className="whitespace-nowrap">(ตำแหน่ง)</span>
              <Field width="auto" className="w-48" />
            </div>
            <div className="flex items-baseline">
              <span className="whitespace-nowrap">วันที่</span>
              <Field width="auto" className="w-8 text-center" />
              <span className="whitespace-nowrap">/</span>
              <Field width="auto" className="w-24 text-center" />
              <span className="whitespace-nowrap">/</span>
              <Field width="auto" className="w-16 text-center" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
