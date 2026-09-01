import React from 'react';
import Image from 'next/image';
import { Field } from './PrintField';
import { ApprovalTable } from './ApprovalTable';

interface MaternityLeavePrintFormProps {
  leave: any;
  personnel: any;
  startDay: string | number;
  startMonth: string;
  startYear: string | number;
  endDay: string | number;
  endMonth: string;
  endYear: string | number;
  diffDays: number;
  todayDay: string | number;
  todayMonth: string;
  todayYear: string | number;
}

export const MaternityLeavePrintForm: React.FC<MaternityLeavePrintFormProps> = ({
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
  return (
    <div className="bg-slate-200 min-h-screen py-8 print:bg-white print:py-0">
      <div className="a4-page relative leading-relaxed">
        <div className="absolute top-8 right-8 text-sm text-right leading-tight">
          <div>ทบ.๑๐๐ - ๐๐๕</div>
          <div>แบบ ๔</div>
        </div>

        <div className="flex justify-center mt-4 mb-2">
          <Image src="/garuda.png" alt="Garuda" width={80} height={80} className="object-contain grayscale" priority />
        </div>

        <div className="text-center font-bold text-xl mt-4 mb-8 underline">ใบลาคลอดบุตร</div>

        <div className="flex justify-end pr-[2cm] mb-4">
          <div className="w-[350px]">
            <div className="flex items-baseline mb-2">
              <span className="whitespace-nowrap mr-2">เขียนที่</span>
              <Field width="auto" className="flex-1">{leave.writtenAt}</Field>
            </div>
            <div className="flex items-baseline">
              <span className="whitespace-nowrap mr-2">วันที่</span>
              <Field width="40px">{todayDay}</Field>
              <span className="whitespace-nowrap mx-2">เดือน</span>
              <Field width="auto" className="flex-1">{todayMonth}</Field>
              <span className="whitespace-nowrap mx-2">พ.ศ.</span>
              <Field width="60px">{todayYear}</Field>
            </div>
          </div>
        </div>

        <div className="flex items-baseline mb-2 mt-8">
          <span className="whitespace-nowrap w-[1.5cm]">เรื่อง</span>
          <span className="whitespace-nowrap">ขอลาคลอดบุตร</span>
        </div>

        <div className="flex items-baseline mb-6">
          <span className="whitespace-nowrap w-[1.5cm]">เรียน</span>
          <Field width="auto" className="flex-1">{leave.toPerson}</Field>
        </div>

        <div className="flex items-baseline mb-2 pl-[2.5cm]">
          <span className="whitespace-nowrap mr-2">ดิฉัน</span>
          <Field width="auto" className="flex-1">{personnel.prefix}{personnel.firstName} {personnel.lastName}</Field>
          <span className="whitespace-nowrap mx-2">ตำแหน่ง</span>
          <Field width="auto" className="flex-1">{personnel.position}</Field>
        </div>

        <div className="flex items-baseline mb-2 pl-[2.5cm]">
          <span className="whitespace-nowrap mr-2">ขอลาคลอดบุตรมีกำหนด</span>
          <Field width="60px">{diffDays}</Field>
          <span className="whitespace-nowrap mx-2">วัน ตั้งแต่วันที่</span>
          <Field width="60px">{startDay}</Field>
          <span className="whitespace-nowrap mx-2">เดือน</span>
          <Field width="auto" className="flex-1">{startMonth}</Field>
          <span className="whitespace-nowrap mx-2">พ.ศ.</span>
          <Field width="60px">{startYear}</Field>
        </div>

        <div className="flex items-baseline mb-2">
          <span className="whitespace-nowrap mr-2">จนถึงวันที่</span>
          <Field width="60px">{endDay}</Field>
          <span className="whitespace-nowrap mx-2">เดือน</span>
          <Field width="auto" className="flex-1">{endMonth}</Field>
          <span className="whitespace-nowrap mx-2">พ.ศ.</span>
          <Field width="60px">{endYear}</Field>
          <span className="whitespace-nowrap ml-2">ในระหว่างลานี้พักรักษาตัว</span>
        </div>

        <div className="flex items-baseline mb-2">
          <span className="whitespace-nowrap mr-2">อยู่ที่ บ้านเลขที่</span>
          <Field width="auto" className="flex-1">{leave.contactAddress}</Field>
          <span className="whitespace-nowrap mx-2">ถนน</span>
          <Field width="auto" className="flex-1"></Field>
          <span className="whitespace-nowrap mx-2">ตำบล</span>
          <Field width="auto" className="flex-1">{leave.contactTambon}</Field>
        </div>

        <div className="flex items-baseline mb-2">
          <span className="whitespace-nowrap mr-2">อำเภอ</span>
          <Field width="auto" className="flex-1">{leave.contactAmphoe}</Field>
          <span className="whitespace-nowrap mx-2">จังหวัด</span>
          <Field width="auto" className="flex-1">{leave.contactProvince}</Field>
        </div>

        <div className="flex items-baseline mb-4 pl-[2.5cm]">
          <span className="whitespace-nowrap mr-2">ดิฉัน ได้ลาคลอดบุตรอยู่ก่อนแล้วในคราวเดียวกันนี้</span>
          <Field width="60px">{leave.maternityLeaveTimes || ''}</Field>
          <span className="whitespace-nowrap mx-2">ครั้ง รวม</span>
          <Field width="60px">{leave.maternityLeaveDays || ''}</Field>
          <span className="whitespace-nowrap ml-2">วัน</span>
        </div>

        <div className="mb-6 mt-8 flex flex-col items-center pl-[50%]">
          <div className="mb-4 whitespace-nowrap">ควรมิควรแล้วแต่จะกรุณา</div>
          
          <div className="flex items-baseline mb-2">
            <span className="whitespace-nowrap">(ลงชื่อ)</span>
            <Field width="auto" className="w-48 text-center" />
          </div>
        </div>

      </div>

      <div className="a4-page break-before-page relative leading-relaxed mt-8 print:mt-0">
        <ApprovalTable toPerson={leave.toPerson} />
      </div>

      <script dangerouslySetInnerHTML={{ __html: `setTimeout(function(){window.print();}, 500);` }} />
    </div>
  );
};
