import React from 'react';
import PrintButton from '../PrintButton';
import { Field } from './PrintField';
import { ApprovalTable } from './ApprovalTable';
import { LeavePrintFormProps } from './types';

export const SickLeavePrintForm = ({
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
  pastPersonalLeaveCount,
  pastPersonalLeaveDays,
  pastSickLeaveCount,
  pastSickLeaveDays,
}: LeavePrintFormProps) => {
  return (
    <div className="bg-slate-200 min-h-screen py-8 print:bg-white print:py-0">
      <div className="text-center mb-4 no-print">
        <PrintButton />
      </div>
      <div className="a4-page relative leading-relaxed">
        <div className="absolute top-4 right-8 text-xs text-right leading-tight font-bold">
          <div>ทบ.๑๐๐ - ๐๐๗</div>
          <div>แบบ ๓</div>
        </div>

        <div className="flex justify-center mt-4 mb-2">
          <img src="/garuda.png" alt="ตราครุฑ" style={{ width: '3cm', height: '3cm', objectFit: 'contain' }} />
        </div>

        <h1 className="text-center font-bold text-xl mb-4">ใบลาป่วย</h1>

        <div className="flex justify-end mb-2 pr-8">
          <div className="flex items-baseline w-[50%]">
            <span className="whitespace-nowrap mr-2">เขียนที่</span>
            <Field width="auto" className="flex-1">{leave.writtenAt}</Field>
          </div>
        </div>

        <div className="flex justify-end mb-4 pr-8">
          <div className="flex items-baseline w-[50%]">
            <span className="whitespace-nowrap mr-2">วันที่</span>
            <Field width="auto" className="flex-1">{todayDay}</Field>
            <span className="whitespace-nowrap mx-2">เดือน</span>
            <Field width="auto" className="flex-1">{todayMonth}</Field>
            <span className="whitespace-nowrap mx-2">พ.ศ.</span>
            <Field width="60px">{todayYear}</Field>
          </div>
        </div>

        <div className="flex items-baseline mb-2">
          <span className="whitespace-nowrap w-[1.5cm]">เรื่อง</span>
          <span className="whitespace-nowrap">ขอลาป่วย</span>
        </div>

        <div className="flex items-baseline mb-4">
          <span className="whitespace-nowrap w-[1.5cm]">เรียน</span>
          <Field width="auto" className="flex-1">{leave.toPerson}</Field>
        </div>

        <div className="flex items-baseline mb-2 pl-[2.5cm]">
          <span className="whitespace-nowrap mr-2">ด้วยกระผม/ดิฉัน</span>
          <Field width="auto" className="flex-1">{personnel.prefix}{personnel.firstName} {personnel.lastName}</Field>
        </div>

        <div className="flex items-baseline mb-2">
          <span className="whitespace-nowrap mr-2">ตำแหน่ง</span>
          <Field width="auto" className="flex-1">{personnel.position}</Field>
          <span className="whitespace-nowrap mx-2">ป่วยเป็น</span>
          <Field width="auto" className="flex-1">{leave.reason}</Field>
        </div>

        <div className="flex items-baseline mb-2">
          <span className="whitespace-nowrap mr-2">จึงขอลาป่วยเพื่อรักษาตัวมีกำหนด</span>
          <Field width="60px">{diffDays}</Field>
          <span className="whitespace-nowrap mx-2">วัน ตั้งแต่วันที่</span>
          <Field width="60px">{startDay}</Field>
          <span className="whitespace-nowrap mx-2">เดือน</span>
          <Field width="auto" className="flex-1">{startMonth}</Field>
        </div>

        <div className="flex items-baseline mb-2">
          <span className="whitespace-nowrap mr-2">พ.ศ.</span>
          <Field width="60px">{startYear}</Field>
          <span className="whitespace-nowrap mx-2">จนถึงวันที่</span>
          <Field width="60px">{endDay}</Field>
          <span className="whitespace-nowrap mx-2">เดือน</span>
          <Field width="auto" className="flex-1">{endMonth}</Field>
          <span className="whitespace-nowrap mx-2">พ.ศ.</span>
          <Field width="60px">{endYear}</Field>
        </div>

        <div className="flex items-baseline mb-2">
          <span className="whitespace-nowrap mr-2">ในระหว่างลาป่วยนี้ได้รักษาตัวอยู่ที่</span>
          <Field width="auto" className="flex-1">{leave.contactAddress}</Field>
        </div>

        <div className="flex items-baseline mb-2">
          <span className="whitespace-nowrap mr-2">ตำบล/แขวง</span>
          <Field width="auto" className="flex-1">{leave.contactTambon}</Field>
          <span className="whitespace-nowrap mx-2">อำเภอ/เขต</span>
          <Field width="auto" className="flex-1">{leave.contactAmphoe}</Field>
          <span className="whitespace-nowrap mx-2">จังหวัด</span>
          <Field width="auto" className="flex-1">{leave.contactProvince}</Field>
        </div>

        <div className="flex items-baseline mb-4 pl-[2.5cm]">
          <span className="whitespace-nowrap mr-2">กระผม/ดิฉัน ได้ลาป่วยอยู่เดิมแล้วในคราวเดียวกันนี้</span>
          <Field width="60px"></Field>
          <span className="whitespace-nowrap mx-2">ครั้ง รวม</span>
          <Field width="60px"></Field>
          <span className="whitespace-nowrap ml-2">วัน</span>
        </div>

        <div className="mb-6 text-center">
          ควรมิควรแล้วแต่จะกรุณา
        </div>

        <div className="flex justify-end pr-[2cm] mb-8">
          <div className="text-center w-[250px]">
            <div className="flex items-baseline justify-center">
              <span className="whitespace-nowrap mr-2">(ลงชื่อ)</span>
              <Field width="auto" className="flex-1"></Field>
            </div>
          </div>
        </div>

        <hr className="border-black mb-6 border-t-[1.5px]" />

        <div className="flex text-sm">
          <div className="flex-1 space-y-2">
            <div className="flex items-baseline pl-12">
              <span className="whitespace-nowrap mr-2">ในปีงบประมาณนี้</span>
              <Field width="auto" className="flex-1">{personnel.prefix}{personnel.firstName} {personnel.lastName}</Field>
              <span className="whitespace-nowrap mx-2">ได้ลาป่วยมาแล้ว</span>
              <Field width="60px">{pastSickLeaveCount || '-'}</Field>
              <span className="whitespace-nowrap mx-2">ครั้ง</span>
              <Field width="60px">{pastSickLeaveDays || '-'}</Field>
              <span className="whitespace-nowrap ml-2">วันทำการ</span>
            </div>
            <div className="flex items-baseline">
              <span className="whitespace-nowrap mr-2">ทั้งครั้งนี้รวมเป็น</span>
              <Field width="60px">{pastSickLeaveCount + 1}</Field>
              <span className="whitespace-nowrap mx-2">ครั้ง รวม</span>
              <Field width="auto" className="flex-1">{pastSickLeaveDays + diffDays}</Field>
              <span className="whitespace-nowrap ml-2">วันทำการ</span>
            </div>
            <div className="flex items-baseline pl-12">
              <span className="whitespace-nowrap mr-2">ในปีงบประมาณนี้ ผู้นี้เคยลากิจมาแล้ว</span>
              <Field width="60px">{pastPersonalLeaveCount || '-'}</Field>
              <span className="whitespace-nowrap mx-2">ครั้ง รวม</span>
              <Field width="80px">{pastPersonalLeaveDays || '-'}</Field>
              <span className="whitespace-nowrap ml-2">วัน</span>
            </div>
            <div className="flex items-baseline pl-12 mt-2">
              <span className="whitespace-nowrap mr-2">การลาป่วยครั้งนี้อยู่ในอำนาจของ</span>
              <Field width="auto" className="flex-1">{leave.toPerson}</Field>
              <span className="whitespace-nowrap ml-2">อนุญาตได้ตามข้อบังคับ ฯ</span>
            </div>

            <div className="flex justify-end pr-[2cm] pt-6">
              <div className="text-center w-[250px]">
                <div className="flex items-baseline justify-center mb-1">
                  <span className="whitespace-nowrap mr-2">(ลงชื่อ)</span>
                  <Field width="auto" className="flex-1"></Field>
                </div>
                <div className="text-center mb-1">(เจ้าหน้าที่ตรวจสอบ)</div>
                <div className="flex items-baseline justify-center">
                  <span className="whitespace-nowrap mr-2">ตำแหน่ง</span>
                  <Field width="auto" className="flex-1"></Field>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex text-xs">
          <div className="font-bold underline w-16">หมายเหตุ</div>
          <div className="flex-1">
            ในกรณีที่บุคคลอื่นเป็นผู้ยื่นใบลาป่วยแทน ให้ชื่อผู้ขออนุญาตลาให้ลงว่ามีความสัมพันธ์เป็นอะไรกับผู้ป่วยด้วย
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
