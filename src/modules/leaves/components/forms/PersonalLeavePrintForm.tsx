import React from 'react';
import PrintButton from '../PrintButton';
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
    <>
      <div className="text-center mb-3 no-print pt-4">
        <PrintButton />
      </div>
      <PrintFormLayout formNumber="แบบ ๕" toPerson={leave.toPerson}>
        {/* Garuda Emblem */}
        <div className="flex justify-center mt-4 mb-1">
          <img
            src="/garuda.png"
            alt="ตราครุฑ"
            style={{ width: '3cm', height: '3cm', objectFit: 'contain' }}
          />
        </div>

        <div className="text-center font-bold text-[13.5pt] mb-2 leading-tight">
          ใบลากิจ
        </div>
        <br />

        <div className="flex justify-end mb-2">
          <div className="w-[40%]">
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
        <br />

        <div className="flex items-baseline mt-3 mb-2">
          <span className="whitespace-nowrap w-[1.5cm]">เรื่อง</span>
          <span className="whitespace-nowrap">ขอลากิจ</span>
        </div>

        <div className="flex items-baseline mt-2 mb-3">
          <span className="whitespace-nowrap w-[1.5cm]">เรียน</span>
          <Field width="auto" className="flex-1">{leave.toPerson || 'ผู้บังคับบัญชา'}</Field>
        </div>

        <div className="flex items-baseline mt-5 mb-2 pl-[2cm]">
          <span className="whitespace-nowrap mr-2">กระผม/ดิฉัน</span>
          <Field width="auto" className="flex-1">{personnel.prefix || ''}{personnel.firstName} {personnel.lastName}</Field>
          <span className="whitespace-nowrap mx-2">ตำแหน่ง</span>
          <Field width="auto" className="flex-1">{personnel.position || ''}</Field>
        </div>

        <div className="flex items-baseline mt-1 mb-1.5">
          <span className="whitespace-nowrap mr-2">ขออนุญาตลาหยุดราชการเพื่อ</span>
          <Field width="auto" className="flex-1">{leave.reason || ''}</Field>
        </div>

        <div className="flex items-baseline mt-1 mb-1.5">
          <span className="whitespace-nowrap mr-2">มีกำหนด</span>
          <Field width="40px">{diffDays}</Field>
          <span className="whitespace-nowrap mx-2">วัน ตั้งแต่วันที่</span>
          <Field width="35px">{startDay}</Field>
          <span className="whitespace-nowrap mx-2">เดือน</span>
          <Field width="auto" className="flex-1">{startMonth}</Field>
          <span className="whitespace-nowrap mx-2">พ.ศ.</span>
          <Field width="45px">{startYear}</Field>
        </div>

        <div className="flex items-baseline mt-1 mb-1.5">
          <span className="whitespace-nowrap mr-2">จนถึงวันที่</span>
          <Field width="35px">{endDay}</Field>
          <span className="whitespace-nowrap mx-2">เดือน</span>
          <Field width="auto" className="flex-1">{endMonth}</Field>
          <span className="whitespace-nowrap mx-2">พ.ศ.</span>
          <Field width="45px">{endYear}</Field>
          <span className="whitespace-nowrap ml-2">ในระหว่างลานี้</span>
        </div>

        <div className="flex items-baseline mt-1 mb-1.5">
          <span className="whitespace-nowrap mr-2">กระผม/ดิฉันจะไป</span>
          <Field width="auto" className="flex-1">{leave.contactAddress || ''}</Field>
        </div>

        <div className="flex items-baseline mt-1 mb-1.5">
          <span className="whitespace-nowrap mr-2">ตำบล/แขวง</span>
          <Field width="auto" className="flex-1">{leave.contactTambon || ''}</Field>
          <span className="whitespace-nowrap mx-2">อำเภอ/เขต</span>
          <Field width="auto" className="flex-1">{leave.contactAmphoe || ''}</Field>
          <span className="whitespace-nowrap mx-2">จังหวัด</span>
          <Field width="auto" className="flex-1">{leave.contactProvince || ''}</Field>
        </div>

        <div className="flex items-baseline mt-1 mb-1.5">
          <span className="whitespace-nowrap mr-2">ในวันที่</span>
          <Field width="35px">{startDay}</Field>
          <span className="whitespace-nowrap mx-2">เดือน</span>
          <Field width="auto" className="flex-1">{startMonth}</Field>
          <span className="whitespace-nowrap mx-2">พ.ศ.</span>
          <Field width="45px">{startYear}</Field>
        </div>

        <div className="flex items-baseline mt-1 mb-1.5">
          <span className="whitespace-nowrap mr-2">และจะกลับในวันที่</span>
          <Field width="35px">{endDay}</Field>
          <span className="whitespace-nowrap mx-2">เดือน</span>
          <Field width="120px">{endMonth}</Field>
          <span className="whitespace-nowrap mx-2">พ.ศ.</span>
          <Field width="45px">{endYear}</Field>
        </div>

        <div className="flex items-baseline mt-4 mb-2 pl-[2cm]">
          <span className="whitespace-nowrap mr-2">กระผม/ดิฉัน ได้ลาอยู่เดิมแล้วในคราวเดียวกันนี้</span>
          <Field width="40px"></Field>
          <span className="whitespace-nowrap mx-2">ครั้ง รวม</span>
          <Field width="40px"></Field>
          <span className="whitespace-nowrap ml-2">วัน</span>
        </div>
        <div className="mt-4 mb-3 text-center">
          ควรมิควรแล้วแต่จะกรุณา
        </div>

        <div className="flex justify-end pr-[1.5cm] mt-5 mb-4">
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
        <br />
        <hr className="border-black mt-4 mb-3 border-t-[1px]" />
        <br />
        <div className="flex items-baseline mt-5 mb-1.5">
          <div className="flex-1 space-y-2">
            <div className="flex items-baseline pl-[2cm]">
              <span className="whitespace-nowrap mr-2">ในปีงบประมาณนี้</span>
              <Field width="auto" className="flex-1">{personnel.prefix || ''}{personnel.firstName} {personnel.lastName}</Field>
              <span className="whitespace-nowrap mx-2">ได้ลากิจมาแล้ว</span>
              <Field width="40px">{pastPersonalLeaveCount || '-'}</Field>
              <span className="whitespace-nowrap mx-2">ครั้ง</span>
              <Field width="40px">{pastPersonalLeaveDays || '-'}</Field>
              <span className="whitespace-nowrap ml-2">วันทำการ</span>
            </div>

            <div className="flex items-baseline mt-1">
              <span className="whitespace-nowrap mr-2">ทั้งครั้งนี้รวมเป็น</span>
              <Field width="40px">{(pastPersonalLeaveCount || 0) + 1}</Field>
              <span className="whitespace-nowrap mx-2">ครั้ง รวม</span>
              <Field width="auto" className="flex-1">{(pastPersonalLeaveDays || 0) + diffDays}</Field>
              <span className="whitespace-nowrap ml-2">วันทำการ</span>
            </div>

            <div className="flex items-baseline mt-1">
              <span className="whitespace-nowrap mr-2">ในปีงบประมาณนี้ ผู้นี้เคยลาป่วยมาแล้ว</span>
              <Field width="40px">{pastSickLeaveCount || '-'}</Field>
              <span className="whitespace-nowrap mx-2">ครั้ง รวม</span>
              <Field width="60px">{pastSickLeaveDays || '-'}</Field>
              <span className="whitespace-nowrap ml-2">วัน</span>
            </div>

            <div className="flex items-baseline mt-1">
              <span className="whitespace-nowrap mr-2 pl-[2cm]">การลากิจในครั้งนี้อยู่ในอำนาจของ</span>
              <Field width="auto" className="flex-1">{leave.toPerson || 'ผู้บังคับบัญชา'}</Field>
              <span className="whitespace-nowrap ml-2">อนุญาตได้ตามข้อบังคับฯ</span>
            </div>

            <div className="flex justify-end pr-[1.5cm] pt-3 mt-3">
              <div className="text-center w-[220px]">
                <div className="flex items-baseline justify-center mb-2">
                  <span className="whitespace-nowrap mr-2">(ลงชื่อ)</span>
                  <Field width="auto" className="flex-1"></Field>
                </div>
                <div className="text-center mb-2 text-[10pt]">(เจ้าหน้าที่ตรวจสอบ)</div>
                <div className="flex items-baseline justify-center">
                  <span className="whitespace-nowrap mr-2">ตำแหน่ง</span>
                  <Field width="auto" className="flex-1"></Field>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-right text-[9pt] mt-3 text-slate-500">
          (พิมพ์ตามระเบียบ ทบ. ว่าด้วยการลา)
        </div>
      </PrintFormLayout>
    </>
  );
};
