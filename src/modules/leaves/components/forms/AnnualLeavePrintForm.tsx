import React from 'react';
import { LeavePrintFormProps } from './types';
import { Field } from './PrintField';
import { PrintFormLayout } from './PrintFormLayout';

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
    <PrintFormLayout formNumber="แบบ ๗" toPerson={leave.toPerson}>
      <div className="text-center font-bold text-xl mt-12 mb-8 underline">ใบลาพักผ่อนประจำปี</div>

      <div className="flex justify-end pr-8 mb-4">
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
            <Field width="50px">{todayYear}</Field>
          </div>
        </div>
      </div>

      <div className="flex items-baseline mb-4">
        <span className="whitespace-nowrap mr-4 w-[1.5cm]">เรื่อง</span>
        <span>ขอลาพักผ่อนประจำปี</span>
      </div>

      <div className="flex items-baseline mb-4">
        <span className="whitespace-nowrap mr-4 w-[1.5cm]">เรียน</span>
        <Field width="auto" className="flex-1">{leave.toPerson}</Field>
      </div>

      <div className="flex items-baseline mb-4 pl-[2.5cm]">
        <span className="whitespace-nowrap mr-2">กระผม ดิฉัน</span>
        <Field width="auto" className="flex-1">{personnel.prefix}{personnel.firstName} {personnel.lastName}</Field>
        <span className="whitespace-nowrap mx-2">ตำแหน่ง</span>
        <Field width="auto" className="flex-1">{personnel.position}</Field>
      </div>

      <div className="flex items-baseline mb-4">
        <span className="whitespace-nowrap mr-2">ขออนุญาตหยุดราชการเพื่อพักผ่อนประจำปี มีกำหนด</span>
        <Field width="60px">{diffDays}</Field>
        <span className="whitespace-nowrap mx-2">วัน ตั้งแต่วันที่</span>
        <Field width="60px">{startDay}</Field>
      </div>

      <div className="flex items-baseline mb-4">
        <span className="whitespace-nowrap mr-2">เดือน</span>
        <Field width="auto" className="flex-1">{startMonth}</Field>
        <span className="whitespace-nowrap mx-2">พ.ศ.</span>
        <Field width="60px">{startYear}</Field>
        <span className="whitespace-nowrap mx-2">ถึงวันที่</span>
        <Field width="60px">{endDay}</Field>
        <span className="whitespace-nowrap mx-2">เดือน</span>
        <Field width="auto" className="flex-1">{endMonth}</Field>
      </div>

      <div className="flex items-baseline mb-4">
        <span className="whitespace-nowrap mr-2">พ.ศ.</span>
        <Field width="60px">{endYear}</Field>
        <span className="whitespace-nowrap mx-2">ในระหว่างลานี้ กระผม ดิฉัน จะไปที่จังหวัด</span>
        <Field width="auto" className="flex-1">
          {leave.contactProvince ? `${leave.contactProvince}` : (leave.contactAddress || '')}
        </Field>
      </div>

      <div className="flex items-baseline mb-4">
        <span className="whitespace-nowrap mr-2">ในวันที่</span>
        <Field width="60px">{startDay}</Field>
        <span className="whitespace-nowrap mx-2">เดือน</span>
        <Field width="auto" className="flex-1">{startMonth}</Field>
        <span className="whitespace-nowrap mx-2">พ.ศ.</span>
        <Field width="60px">{startYear}</Field>
        <span className="whitespace-nowrap mx-2">และจะกลับในวันที่</span>
        <Field width="60px">{endDay}</Field>
      </div>

      <div className="flex items-baseline mb-4">
        <span className="whitespace-nowrap mr-2">เดือน</span>
        <Field width="auto" className="flex-1">{endMonth}</Field>
        <span className="whitespace-nowrap mx-2">พ.ศ.</span>
        <Field width="60px">{endYear}</Field>
      </div>

      <div className="mb-6 text-center mt-8">
        ควรมิควรแล้วแต่จะกรุณา
      </div>

      <div className="flex justify-end pr-[2cm] mb-12">
        <div className="text-center w-[250px]">
          <div className="flex items-baseline justify-center">
            <span className="whitespace-nowrap mr-2">(ลงชื่อ)</span>
            <Field width="auto" className="flex-1"></Field>
          </div>
        </div>
      </div>

      <hr className="border-black mb-6 border-t-[1.5px]" />

      <div className="flex text-sm">
        <div className="flex-1 space-y-4">
          <div className="flex items-baseline pl-12">
            <span className="whitespace-nowrap mr-2">ในปีงบประมาณที่แล้วตั้งแต่ ๑ ต.ค.</span>
            <Field width="60px"></Field>
            <span className="whitespace-nowrap mx-2">ถึง ๓0 ก.ย.</span>
            <Field width="60px"></Field>
          </div>
          
          <div className="flex items-baseline pl-12">
            <span className="whitespace-nowrap mr-2">ได้ลาพักผ่อนประจำปีรวม</span>
            <Field width="60px"></Field>
            <span className="whitespace-nowrap mx-2">วันทำการ เหลือวันลาพักผ่อนสะสม</span>
            <Field width="60px">{leave.accumulatedLeaveDays || ''}</Field>
            <span className="whitespace-nowrap ml-2">วันทำการ</span>
          </div>

          <div className="flex items-baseline pl-12">
            <span className="whitespace-nowrap mr-2">ในปีงบประมาณนี้</span>
            <Field width="150px"></Field>
            <span className="whitespace-nowrap ml-2">ได้ลาพักผ่อนประจำปีมาแล้ว</span>
          </div>

          <div className="flex items-baseline pl-12">
            <Field width="60px"></Field>
            <span className="whitespace-nowrap mx-2">วันทำการ ทั้งครั้งนี้รวมเป็น</span>
            <Field width="60px"></Field>
            <span className="whitespace-nowrap mx-2">วันทำการ เหลือวันลาพักผ่อน</span>
            <Field width="60px"></Field>
            <span className="whitespace-nowrap ml-2">วันทำการ</span>
          </div>

          <div className="flex justify-end pr-[1cm] pt-8">
            <div className="text-center w-[350px]">
              <div className="flex items-baseline justify-center mb-2">
                <span className="whitespace-nowrap mr-2">(ลงชื่อ)</span>
                <Field width="auto" className="flex-1"></Field>
                <span className="whitespace-nowrap ml-2">(เจ้าหน้าที่ตรวจสอบ)</span>
              </div>
              <div className="flex items-baseline justify-center pl-8">
                <span className="whitespace-nowrap mr-2">ตำแหน่ง</span>
                <Field width="auto" className="flex-1"></Field>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrintFormLayout>
  );
};

