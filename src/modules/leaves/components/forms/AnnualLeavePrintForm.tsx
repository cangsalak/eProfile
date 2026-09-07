import React from 'react';
import { LeavePrintFormProps } from './types';
import { Field } from './PrintField';
import { PrintFormLayout } from './PrintFormLayout';
import PrintButton from '../PrintButton';

export const AnnualLeavePrintForm: React.FC<LeavePrintFormProps> = ({
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
          ใบลาพักผ่อนประจำปี
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
          <span className="whitespace-nowrap">ขอลาพักผ่อนประจำปี</span>
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
          <span className="whitespace-nowrap mr-2">ขออนุญาตลาหยุดราชการเพื่อพักผ่อนประจำปี มีกำหนด</span>
          <Field width="auto" className="flex-1">{diffDays}</Field>
          <span className="whitespace-nowrap mx-2">วัน ตั้งแต่วันที่</span>
          <Field width="auto" className="flex-1">{startDay}</Field>
        </div>

        <div className="flex items-baseline mt-1 mb-1.5">
          <span className="whitespace-nowrap mr-2">เดือน</span>
          <Field width="auto" className="flex-1">{startMonth}</Field>
          <span className="whitespace-nowrap mx-2">พ.ศ.</span>
          <Field width="45px">{startYear}</Field>
          <span className="whitespace-nowrap mx-2">จนถึงวันที่</span>
          <Field width="auto" className="flex-1">{endDay}</Field>
          <span className="whitespace-nowrap mx-2">เดือน</span>
          <Field width="auto" className="flex-1">{endMonth}</Field>
        </div>

        <div className="flex items-baseline mt-1 mb-1.5">
          <span className="whitespace-nowrap mr-2">พ.ศ.</span>
          <Field width="45px">{endYear}</Field>
          <span className="whitespace-nowrap mx-2">ในระหว่างลานี้ กระผม/ดิฉัน จะไปที่จังหวัด</span>
          <Field width="auto" className="flex-1 text-center">
            {leave.contactProvince ? `${leave.contactProvince}` : (leave.contactAddress || '')}
          </Field>
        </div>

        <div className="flex items-baseline mt-1 mb-1.5">
          <span className="whitespace-nowrap mr-2">ในวันที่</span>
          <Field width="35px">{startDay}</Field>
          <span className="whitespace-nowrap mx-2">เดือน</span>
          <Field width="auto" className="flex-1">{startMonth}</Field>
          <span className="whitespace-nowrap mx-2">พ.ศ.</span>
          <Field width="45px">{startYear}</Field>
          <span className="whitespace-nowrap mx-2">และจะกลับในวันที่</span>
          <Field width="auto" className="flex-1">{endDay}</Field>
        </div>

        <div className="flex items-baseline mt-1 mb-1.5">
          <span className="whitespace-nowrap mr-2">เดือน</span>
          <Field width="auto" className="flex-1">{endMonth}</Field>
          <span className="whitespace-nowrap mx-2">พ.ศ.</span>
          <Field width="auto" className="flex-1">{endYear}</Field>
        </div>

        <div className="mt-6 mb-4 text-center">
          ควรมิควรแล้วแต่จะกรุณา
        </div>

        <div className="flex justify-end pr-[1.5cm] mt-5 mb-6">
          <div className="flex items-baseline w-[280px]">
            <span className="whitespace-nowrap mr-2">(ลงชื่อ)</span>
            <Field width="auto" className="flex-1"></Field>
          </div>
        </div>
        <br />
        <hr className="border-black mt-4 mb-3 border-t-[1px]" />
        <br />

        <div className="flex items-baseline mt-5 mb-1.5">
          <div className="flex-1 space-y-2">
            <div className="flex items-baseline pl-[2cm]">
              <span className="whitespace-nowrap mr-2">ในปีงบประมาณที่แล้วตั้งแต่ 1 ต.ค.</span>
              <Field width="auto" className="flex-1"></Field>
              <span className="whitespace-nowrap mx-2">ถึง 30 ก.ย.</span>
              <Field width="auto" className="flex-1"></Field>
            </div>

            <div className="flex items-baseline mt-1">
              <span className="whitespace-nowrap mr-2">ได้ลาพักผ่อนประจำปีรวม</span>
              <Field width="auto" className="flex-1"></Field>
              <span className="whitespace-nowrap mx-2">วันทำการ เหลือวันลาพักผ่อนสะสม</span>
              <Field width="auto" className="flex-1">{leave.accumulatedLeaveDays || ''}</Field>
              <span className="whitespace-nowrap ml-2">วันทำการ</span>
            </div>

            <div className="flex items-baseline mt-1 pl-[2cm]">
              <span className="whitespace-nowrap mr-2">ในปีงบประมาณนี้</span>
              <Field width="auto" className="flex-1"></Field>
              <span className="whitespace-nowrap ml-2">ได้ลาพักผ่อนประจำปีมาแล้ว</span>
            </div>

            <div className="flex items-baseline mt-1">
              <Field width="auto" className="w-[45px]"></Field>
              <span className="whitespace-nowrap mx-2">วันทำการ ทั้งครั้งนี้รวมเป็น</span>
              <Field width="auto" className="w-[45px]"></Field>
              <span className="whitespace-nowrap mx-2">วันทำการ เหลือวันพักผ่อน</span>
              <Field width="auto" className="flex-1"></Field>
              <span className="whitespace-nowrap ml-2">วันทำการ</span>
            </div>

            <div className="flex justify-end pr-[1cm] pt-4 mt-3">
              <div className="w-[320px] space-y-2">
                <div className="flex items-baseline">
                  <span className="whitespace-nowrap mr-2">(ลงชื่อ)</span>
                  <Field width="auto" className="flex-1"></Field>
                  <span className="whitespace-nowrap ml-2">(เจ้าหน้าที่ตรวจสอบ)</span>
                </div>
                <div className="flex items-baseline">
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
