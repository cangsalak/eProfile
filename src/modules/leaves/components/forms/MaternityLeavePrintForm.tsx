import React from 'react';
import { LeavePrintFormProps } from './types';
import { Field } from './PrintField';
import { PrintFormLayout } from './PrintFormLayout';
import PrintButton from '../PrintButton';

export const MaternityLeavePrintForm: React.FC<LeavePrintFormProps> = ({
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
    <>
      <div className="text-center mb-3 no-print pt-4">
        <PrintButton />
      </div>
      <PrintFormLayout formNumber="แบบ ๔" toPerson={leave.toPerson}>
        {/* Garuda Emblem */}
        <div className="flex justify-center mt-4 mb-1">
          <img
            src="/garuda.png"
            alt="ตราครุฑ"
            style={{ width: '3cm', height: '3cm', objectFit: 'contain' }}
          />
        </div>

        <div className="text-center font-bold text-[13.5pt] mb-2 leading-tight">
          ใบลาคลอดบุตร
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
          <span className="whitespace-nowrap">ขอลาคลอดบุตร</span>
        </div>

        <div className="flex items-baseline mb-2">
          <span className="whitespace-nowrap w-[1.5cm]">เรียน</span>
          <Field width="auto" className="flex-1">{leave.toPerson || 'ผู้บังคับบัญชา'}</Field>
        </div>

        <div className="flex items-baseline mb-1.5 pl-[2cm]">
          <span className="whitespace-nowrap mr-2">ดิฉัน</span>
          <Field width="auto" className="flex-1">{personnel.prefix || ''}{personnel.firstName} {personnel.lastName}</Field>
          <span className="whitespace-nowrap mx-2">ตำแหน่ง</span>
          <Field width="auto" className="flex-1">{personnel.position || ''}</Field>
        </div>

        <div className="flex items-baseline mb-1.5 pl-[2cm]">
          <span className="whitespace-nowrap mr-2">ขอลาคลอดบุตรมีกำหนด</span>
          <Field width="40px">{diffDays}</Field>
          <span className="whitespace-nowrap mx-2">วัน ตั้งแต่วันที่</span>
          <Field width="35px">{startDay}</Field>
          <span className="whitespace-nowrap mx-2">เดือน</span>
          <Field width="auto" className="flex-1">{startMonth}</Field>
          <span className="whitespace-nowrap mx-2">พ.ศ.</span>
          <Field width="45px">{startYear}</Field>
        </div>

        <div className="flex items-baseline mb-1.5">
          <span className="whitespace-nowrap mr-2">จนถึงวันที่</span>
          <Field width="35px">{endDay}</Field>
          <span className="whitespace-nowrap mx-2">เดือน</span>
          <Field width="auto" className="flex-1">{endMonth}</Field>
          <span className="whitespace-nowrap mx-2">พ.ศ.</span>
          <Field width="45px">{endYear}</Field>
          <span className="whitespace-nowrap ml-2">ในระหว่างลานี้พักรักษาตัว</span>
        </div>

        <div className="flex items-baseline mb-1.5">
          <span className="whitespace-nowrap mr-2">อยู่ที่ บ้านเลขที่</span>
          <Field width="auto" className="flex-1">{leave.contactAddress || ''}</Field>
          <span className="whitespace-nowrap mx-2">ตำบล</span>
          <Field width="auto" className="flex-1">{leave.contactTambon || ''}</Field>
        </div>

        <div className="flex items-baseline mb-1.5">
          <span className="whitespace-nowrap mr-2">อำเภอ</span>
          <Field width="auto" className="flex-1">{leave.contactAmphoe || ''}</Field>
          <span className="whitespace-nowrap mx-2">จังหวัด</span>
          <Field width="auto" className="flex-1">{leave.contactProvince || ''}</Field>
        </div>

        <div className="flex items-baseline mb-2 pl-[2cm]">
          <span className="whitespace-nowrap mr-2">ดิฉัน ได้ลาคลอดบุตรอยู่ก่อนแล้วในคราวเดียวกันนี้</span>
          <Field width="40px">{(leave as any).maternityLeaveTimes || ''}</Field>
          <span className="whitespace-nowrap mx-2">ครั้ง รวม</span>
          <Field width="40px">{(leave as any).maternityLeaveDays || ''}</Field>
          <span className="whitespace-nowrap ml-2">วัน</span>
        </div>

        <div className="mb-3 text-center mt-3">
          ควรมิควรแล้วแต่จะกรุณา
        </div>

        <div className="flex justify-end pr-[1.5cm] mb-3">
          <div className="text-center w-[250px] space-y-2">
            <div className="flex items-baseline justify-center">
              <span className="whitespace-nowrap mr-2">(ลงชื่อ)</span>
              <Field width="auto" className="flex-1"></Field>
            </div>
            <div className="flex items-baseline justify-center">
              ({personnel.prefix || ''}{personnel.firstName} {personnel.lastName})
            </div>
            <div className="flex items-baseline justify-center">
              {personnel.position || ''}
            </div>
          </div>
        </div>

        <div className="text-right text-[9pt] text-slate-500 mt-2">
          (พิมพ์ตามระเบียบ ทบ. ว่าด้วยการลา)
        </div>
      </PrintFormLayout>
    </>
  );
};
