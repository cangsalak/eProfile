import React from 'react';
import PrintButton from '../PrintButton';
import { Field } from './PrintField';
import { LeavePrintFormProps } from './types';
import { PrintFormLayout } from './PrintFormLayout';

export const SickLeavePrintForm: React.FC<LeavePrintFormProps> = ({
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
}) => {
  return (
    <>
      <div className="text-center mb-3 no-print pt-4">
        <PrintButton />
      </div>
      <PrintFormLayout formNumber="แบบ ๓" toPerson={leave.toPerson}>
        {/* Garuda Emblem */}
        <div className="flex justify-center mt-4 mb-1">
          <img
            src="/garuda.png"
            alt="ตราครุฑ"
            style={{ width: '3cm', height: '3cm', objectFit: 'contain' }}
          />
        </div>

        <div className="text-center font-bold text-[13.5pt] mb-2 leading-tight">
          ใบลาป่วย
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
          <span className="whitespace-nowrap">ขอลาป่วย</span>
        </div>

        <div className="flex items-baseline mb-2">
          <span className="whitespace-nowrap w-[1.5cm]">เรียน</span>
          <Field width="auto" className="flex-1">{leave.toPerson || 'ผู้บังคับบัญชา'}</Field>
        </div>

        <div className="flex items-baseline mb-1.5 pl-[2cm]">
          <span className="whitespace-nowrap mr-2">ด้วยกระผม/ดิฉัน</span>
          <Field width="auto" className="flex-1">{personnel.prefix || ''}{personnel.firstName} {personnel.lastName}</Field>
          <span className="whitespace-nowrap mx-2">ตำแหน่ง</span>
          <Field width="auto" className="flex-1">{personnel.position || ''}</Field>
        </div>

        <div className="flex items-baseline mb-1.5">
          <span className="whitespace-nowrap mr-2">ป่วยเป็น</span>
          <Field width="auto" className="flex-1">{leave.reason || ''}</Field>
        </div>

        <div className="flex items-baseline mb-1.5">
          <span className="whitespace-nowrap mr-2">จึงขอลาป่วยเพื่อรักษาตัวมีกำหนด</span>
          <Field width="35px">{diffDays}</Field>
          <span className="whitespace-nowrap mx-1.5">วัน ตั้งแต่วันที่</span>
          <Field width="30px">{startDay}</Field>
          <span className="whitespace-nowrap mx-1.5">เดือน</span>
          <Field width="85px">{startMonth}</Field>
          <span className="whitespace-nowrap mx-1.5">พ.ศ.</span>
          <Field width="40px">{startYear}</Field>
        </div>

        <div className="flex items-baseline mb-1.5">
          <span className="whitespace-nowrap mr-2">จนถึงวันที่</span>
          <Field width="30px">{endDay}</Field>
          <span className="whitespace-nowrap mx-1.5">เดือน</span>
          <Field width="85px">{endMonth}</Field>
          <span className="whitespace-nowrap mx-1.5">พ.ศ.</span>
          <Field width="40px">{endYear}</Field>
          <span className="whitespace-nowrap ml-2">ในระหว่างลาป่วยนี้ได้รักษาตัวอยู่ที่</span>
        </div>

        <div className="flex items-baseline mb-1.5">
          <Field width="auto" className="flex-1">{leave.contactAddress || ''}</Field>
        </div>

        <div className="flex items-baseline mb-1.5">
          <span className="whitespace-nowrap mr-2">ตำบล/แขวง</span>
          <Field width="auto" className="flex-1">{leave.contactTambon || ''}</Field>
          <span className="whitespace-nowrap mx-2">อำเภอ/เขต</span>
          <Field width="auto" className="flex-1">{leave.contactAmphoe || ''}</Field>
          <span className="whitespace-nowrap mx-2">จังหวัด</span>
          <Field width="auto" className="flex-1">{leave.contactProvince || ''}</Field>
        </div>

        <div className="flex items-baseline mb-2 pl-[2cm]">
          <span className="whitespace-nowrap mr-2">กระผม/ดิฉัน ได้ลาป่วยอยู่เดิมแล้วในคราวเดียวกันนี้</span>
          <Field width="40px"></Field>
          <span className="whitespace-nowrap mx-2">ครั้ง รวม</span>
          <Field width="40px"></Field>
          <span className="whitespace-nowrap ml-2">วัน</span>
        </div>

        <div className="mb-3 text-center">
          ควรมิควรแล้วแต่จะกรุณา
        </div>

        <div className="flex justify-end pr-[1cm] mb-3">
          <div className="text-center w-[240px] space-y-2">
            <div className="flex items-baseline justify-center">
              <span className="whitespace-nowrap mr-2">(ลงชื่อ)</span>
              <Field width="130px"></Field>
            </div>
            <div className="text-center">
              ({personnel.prefix || ''}{personnel.firstName} {personnel.lastName})
            </div>
            <div className="text-center">
              {personnel.position || ''}
            </div>
          </div>
        </div>

        <hr className="border-black mb-2 border-t-[1px]" />

        <div className="flex text-[9pt] leading-normal">
          <div className="flex-1 space-y-1">
            <div className="flex items-baseline pl-6">
              <span className="whitespace-nowrap mr-2">ในปีงบประมาณนี้</span>
              <Field width="auto" className="flex-1">{personnel.prefix || ''}{personnel.firstName} {personnel.lastName}</Field>
              <span className="whitespace-nowrap mx-2">ได้ลาป่วยมาแล้ว</span>
              <Field width="40px">{pastSickLeaveCount || '-'}</Field>
              <span className="whitespace-nowrap mx-2">ครั้ง</span>
              <Field width="40px">{pastSickLeaveDays || '-'}</Field>
              <span className="whitespace-nowrap ml-2">วันทำการ</span>
            </div>
            <div className="flex items-baseline pl-6">
              <span className="whitespace-nowrap mr-2">ทั้งครั้งนี้รวมเป็น</span>
              <Field width="40px">{(pastSickLeaveCount || 0) + 1}</Field>
              <span className="whitespace-nowrap mx-2">ครั้ง รวม</span>
              <Field width="auto" className="flex-1">{(pastSickLeaveDays || 0) + diffDays}</Field>
              <span className="whitespace-nowrap ml-2">วันทำการ</span>
            </div>
            <div className="flex items-baseline pl-6">
              <span className="whitespace-nowrap mr-2">ในปีงบประมาณนี้ ผู้นี้เคยลากิจมาแล้ว</span>
              <Field width="40px">{pastPersonalLeaveCount || '-'}</Field>
              <span className="whitespace-nowrap mx-2">ครั้ง รวม</span>
              <Field width="60px">{pastPersonalLeaveDays || '-'}</Field>
              <span className="whitespace-nowrap ml-2">วัน</span>
            </div>
            <div className="flex items-baseline pl-6 mt-1">
              <span className="whitespace-nowrap mr-2">การลาป่วยครั้งนี้อยู่ในอำนาจของ</span>
              <Field width="auto" className="flex-1">{leave.toPerson || 'ผู้บังคับบัญชา'}</Field>
              <span className="whitespace-nowrap ml-2">อนุญาตได้ตามข้อบังคับ ฯ</span>
            </div>

            <div className="flex justify-end pr-[1cm] pt-2">
              <div className="text-center w-[240px] space-y-1">
                <div className="flex items-baseline justify-center">
                  <span className="whitespace-nowrap mr-2">(ลงชื่อ)</span>
                  <Field width="130px"></Field>
                </div>
                <div className="text-center text-[10pt]">(เจ้าหน้าที่ตรวจสอบ)</div>
                <div className="flex items-baseline justify-center">
                  <span className="whitespace-nowrap mr-2">ตำแหน่ง</span>
                  <Field width="130px"></Field>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 flex text-[9.5pt] text-slate-600">
          <div className="font-bold underline w-14">หมายเหตุ</div>
          <div className="flex-1">
            ในกรณีที่บุคคลอื่นเป็นผู้ยื่นใบลาป่วยแทน ให้ชื่อผู้ขออนุญาตลาให้ลงว่ามีความสัมพันธ์เป็นอะไรกับผู้ป่วยด้วย
          </div>
        </div>
      </PrintFormLayout>
    </>
  );
};
