import React from 'react';
import { Field } from './PrintField';
import { LeavePrintFormProps } from './types';
import { PrintFormLayout } from './PrintFormLayout';

export const PersonalLeavePrintForm: React.FC<LeavePrintFormProps> = ({
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
    <PrintFormLayout 
      formCode="ทบ. ๑๐๐ – ๐๐๖" 
      formNumber="แบบ ๕" 
      toPerson={leave.toPerson}
      leaveId={leave.id}
    >
      {/* Garuda Emblem */}
      <div className="flex justify-center mt-1 mb-1">
        <img
          src="/garuda.png"
          alt="ตราครุฑ"
          style={{ width: '3cm', height: '3cm', objectFit: 'contain' }}
        />
      </div>

      <div className="text-center font-bold text-[14pt] underline mb-2 leading-tight">
        ใบลากิจ
      </div>

      <div className="flex justify-end mb-2">
        <div className="w-[50%]">
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
        <span className="whitespace-nowrap">ขอลากิจ</span>
      </div>

      <div className="flex items-baseline mb-2">
        <span className="whitespace-nowrap w-[1.5cm]">เรียน</span>
        <Field width="auto" className="flex-1">{leave.toPerson || 'ผู้บังคับบัญชา'}</Field>
      </div>

      <div className="flex items-baseline mb-1 pl-[2cm]">
        <span className="whitespace-nowrap mr-2">กระผม/ดิฉัน</span>
        <Field width="auto" className="flex-1">{personnel.prefix || ''}{personnel.firstName} {personnel.lastName}</Field>
        <span className="whitespace-nowrap mx-2">ตำแหน่ง</span>
        <Field width="auto" className="flex-1">{personnel.position || ''}</Field>
      </div>

      <div className="flex items-baseline mb-1">
        <span className="whitespace-nowrap mr-2">ขออนุญาตลาหยุดราชการเพื่อ</span>
        <Field width="auto" className="flex-1">{leave.reason || ''}</Field>
      </div>

      <div className="flex items-baseline mb-1">
        <Field width="100%" />
      </div>

      <div className="flex items-baseline mb-1">
        <span className="whitespace-nowrap mr-2">มีกำหนด</span>
        <Field width="35px">{diffDays}</Field>
        <span className="whitespace-nowrap mx-2">วัน ตั้งแต่วันที่</span>
        <Field width="30px">{startDay}</Field>
        <span className="whitespace-nowrap mx-2">เดือน</span>
        <Field width="auto" className="flex-1">{startMonth}</Field>
        <span className="whitespace-nowrap mx-2">พ.ศ.</span>
        <Field width="45px">{startYear}</Field>
      </div>

      <div className="flex items-baseline mb-1">
        <span className="whitespace-nowrap mr-2">จนถึงวันที่</span>
        <Field width="30px">{endDay}</Field>
        <span className="whitespace-nowrap mx-2">เดือน</span>
        <Field width="auto" className="flex-1">{endMonth}</Field>
        <span className="whitespace-nowrap mx-2">พ.ศ.</span>
        <Field width="45px">{endYear}</Field>
        <span className="whitespace-nowrap ml-2">ในระหว่างลานี้</span>
      </div>

      <div className="flex items-baseline mb-1">
        <span className="whitespace-nowrap mr-2">กระผม/ดิฉันจะไป</span>
        <Field width="auto" className="flex-1">{leave.contactAddress || ''}</Field>
      </div>

      <div className="flex items-baseline mb-1">
        <span className="whitespace-nowrap mr-2">ที่</span>
        <Field width="auto" className="flex-1">{[leave.contactTambon, leave.contactAmphoe].filter(Boolean).join(' ') || ''}</Field>
      </div>

      <div className="flex items-baseline mb-1">
        <span className="whitespace-nowrap mr-2">จังหวัด</span>
        <Field width="auto" className="w-36">{leave.contactProvince || ''}</Field>
        <span className="whitespace-nowrap mx-2">ในวันที่</span>
        <Field width="30px">{startDay}</Field>
        <span className="whitespace-nowrap mx-2">เดือน</span>
        <Field width="auto" className="flex-1">{startMonth}</Field>
        <span className="whitespace-nowrap mx-2">พ.ศ.</span>
        <Field width="45px">{startYear}</Field>
      </div>

      <div className="flex items-baseline mb-1">
        <span className="whitespace-nowrap mr-2">และจะกลับในวันที่</span>
        <Field width="30px">{endDay}</Field>
        <span className="whitespace-nowrap mx-2">เดือน</span>
        <Field width="auto" className="flex-1">{endMonth}</Field>
        <span className="whitespace-nowrap mx-2">พ.ศ.</span>
        <Field width="45px">{endYear}</Field>
      </div>

      <div className="flex items-baseline mb-2 pl-[2cm]">
        <span className="whitespace-nowrap mr-2">กระผม/ดิฉัน ได้ลาอยู่เดิมแล้วในคราวเดียวกันนี้</span>
        <Field width="45px"></Field>
        <span className="whitespace-nowrap mx-2">ครั้ง รวม</span>
        <Field width="45px"></Field>
        <span className="whitespace-nowrap ml-2">วัน</span>
      </div>

      <div className="mt-2 mb-2 text-center">
        ควรมิควรแล้วแต่จะกรุณา
      </div>

      <div className="flex justify-end mb-3">
        <div className="text-center w-[250px] space-y-1">
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

      <hr className="border-black mt-2 mb-2 border-t-[1.5px]" />

      <div className="space-y-1">
        <div className="flex items-baseline pl-[2cm]">
          <span className="whitespace-nowrap mr-2">ในปีงบประมาณนี้</span>
          <Field width="auto" className="flex-1" />
          <span className="whitespace-nowrap mx-2">ได้ลากิจมาแล้ว</span>
          <Field width="40px">{pastPersonalLeaveCount || '-'}</Field>
          <span className="whitespace-nowrap ml-2">ครั้ง</span>
        </div>

        <div className="flex items-baseline">
          <span className="whitespace-nowrap mr-2">รวม</span>
          <Field width="45px">{pastPersonalLeaveDays || '-'}</Field>
          <span className="whitespace-nowrap mx-2">วันทำการ ทั้งครั้งนี้รวมเป็น</span>
          <Field width="45px">{(pastPersonalLeaveDays || 0) + diffDays}</Field>
          <span className="whitespace-nowrap ml-2">วันทำการ</span>
        </div>

        <div className="flex items-baseline">
          <span className="whitespace-nowrap mr-2">ในปีงบประมาณนี้ ผู้นี้เคยลาป่วยมาแล้ว</span>
          <Field width="40px">{pastSickLeaveCount || '-'}</Field>
          <span className="whitespace-nowrap mx-2">ครั้ง รวม</span>
          <Field width="40px">{pastSickLeaveDays || '-'}</Field>
          <span className="whitespace-nowrap ml-2">วัน</span>
        </div>

        <div className="flex items-baseline">
          <span className="whitespace-nowrap mr-2">การลากิจในครั้งนี้อยู่ในอำนาจของ</span>
          <Field width="auto" className="flex-1">{leave.toPerson || 'ผู้บังคับบัญชา'}</Field>
          <span className="whitespace-nowrap ml-2">อนุญาตได้ตามข้อบังคับฯ</span>
        </div>

        <div className="flex justify-end pt-1">
          <div className="space-y-1 w-[320px]">
            <div className="flex items-baseline">
              <span className="whitespace-nowrap mr-1">(ลงชื่อ)</span>
              <Field width="110px"></Field>
              <span className="whitespace-nowrap ml-1">(เจ้าหน้าที่ตรวจสอบ)</span>
            </div>
            <div className="flex items-baseline">
              <span className="whitespace-nowrap mr-2">ตำแหน่ง</span>
              <Field width="auto" className="flex-1"></Field>
            </div>
          </div>
        </div>
      </div>

      <div className="text-right text-[9.5pt] text-black mt-1">
        (พิมพ์ตามระเบียบ ทบ. ว่าด้วยการลา พ.ศ. ๒๕๓๖)
      </div>
    </PrintFormLayout>
  );
};
