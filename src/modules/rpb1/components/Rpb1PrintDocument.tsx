'use client';

import React from 'react';
import { Rpb1FormData } from '../types';

interface PrintDocumentProps {
  data: Rpb1FormData;
}

function Dot({ label, value, className = '', minWidth, suffix }: { label?: string; value?: string | number | null; className?: string; minWidth?: string; suffix?: string }) {
  const val = value !== undefined && value !== null ? String(value).trim() : '';
  return (
    <div className={`inline-flex items-baseline whitespace-nowrap overflow-hidden ${className}`} style={minWidth ? { minWidth } : undefined}>
      {label && <span className="mr-1 shrink-0 text-slate-950 font-normal">{label}</span>}
      <span className="flex-1 border-b border-dotted border-black px-1.5 text-center font-normal text-black overflow-hidden text-ellipsis min-h-[1.35em] inline-block leading-tight">
        {val || '\u00A0'}
      </span>
      {suffix && <span className="ml-1 shrink-0 text-slate-950 font-normal">{suffix}</span>}
    </div>
  );
}

function parseHouseAndMoo(houseNo?: string | null, moo?: string | null): { cleanHouseNo: string; cleanMoo: string } {
  let h = (houseNo || '').trim();
  let m = (moo || '').trim();

  const match = h.match(/^(.*?)(?:\s+|,|\/)*(?:หมู่ที่|หมู่|ม\.)\s*([0-9\u0E50-\u0E59]+)\s*$/);
  if (match) {
    h = match[1].trim();
    if (!m) {
      m = match[2].trim();
    }
  }
  return { cleanHouseNo: h, cleanMoo: m };
}

export default function Rpb1PrintDocument({ data }: PrintDocumentProps) {
  const classification = data.classification || 'ลับ';
  const regAddress = parseHouseAndMoo(data.registeredHouseNo, data.registeredMoo);
  const curAddress = parseHouseAndMoo(data.currentHouseNo, data.currentMoo);

  return (
    <div className="rpb1-print-root bg-white text-black font-sarabun text-[14.5px] leading-[1.5]">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 20mm;
          }
          body {
            background: white !important;
            color: black !important;
            font-size: 14.5px;
          }
          .no-print {
            display: none !important;
          }
          .rpb1-page {
            page-break-after: always;
            page-break-inside: avoid;
            min-height: 260mm;
            position: relative;
            box-sizing: border-box;
          }
          .rpb1-page:last-child {
            page-break-after: auto;
          }
        }
        @media screen {
          .rpb1-page {
            width: 210mm;
            min-height: 297mm;
            padding: 18mm 18mm 18mm 22mm;
            margin: 20px auto;
            background: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            position: relative;
            box-sizing: border-box;
          }
        }
      `}</style>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 1 (หมวด ๑ - ๗)
      ───────────────────────────────────────────────────────────── */}
      <div className="rpb1-page flex flex-col justify-between">
        <div>
          {/* Top Classification Header & Top-Right Label */}
          <div className="relative mb-2">
            <div className="text-right font-normal text-base pr-2">รปภ.๑</div>
            <div className="text-center">
              <div className="text-sm">.............................</div>
              <div className="text-sm">({classification || 'ชั้นความลับ'})</div>
            </div>

            {/* Photo Frame Box on the Right */}
            <div className="absolute right-0 top-6 w-[125px] flex flex-col items-center">
              <div className="w-[125px] h-[155px] border border-black flex flex-col items-center justify-center text-center p-2 text-[12px] leading-tight text-slate-800 bg-white">
                {data.photoUrl ? (
                  <img src={data.photoUrl} alt="รูปถ่าย" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <p className="font-normal">ติดภาพถ่ายครึ่งตัว</p>
                    <p className="font-normal mt-0.5">หน้าตรงไม่สวมหมวก</p>
                    <p className="font-normal mt-4">ขนาด ๔.๕ x ๖ ซ.ม.</p>
                  </>
                )}
              </div>
              <div className="w-full text-left text-[13px] mt-1 whitespace-nowrap">
                ถ่ายเมื่อ <span className="border-b border-dotted border-black inline-block min-w-[70px] text-center">{data.photoTakenDate || '\u00A0'}</span>
              </div>
            </div>
          </div>

          {/* Form Title */}
          <div className="text-center text-2xl font-bold mt-10 mb-20 tracking-wide">
            ประวัติบุคคล
          </div>


          {/* Form Content Lines matching official layout */}
          <div className="space-y-2 text-[14.5px] leading-snug">
            {/* ๑. คำนำหน้านาม/ยศ */}
            <div className="flex items-baseline gap-2">
              <Dot label="๑. คำนำหน้านาม/ยศ" value={data.titleRank} className="w-[32%]" />
              <Dot label="ชื่อตัว" value={data.firstName} className="w-[35%]" />
              <Dot label="ชื่อรอง" value={data.middleName} className="w-[33%]" />
            </div>

            <div className="flex items-baseline gap-2 pl-4">
              <Dot label="ชื่อสกุล" value={data.lastName} className="w-[45%]" />
              <Dot label="เพศ" value={data.gender} className="w-[25%]" />
              <Dot label="อายุ" value={data.age} suffix="ปี" className="w-[30%]" />
            </div>

            {/* ๒. ชื่อตัวเดิม */}
            <div className="flex items-baseline gap-2">
              <Dot label="๒. ชื่อตัวเดิม" value={data.formerFirstName} className="w-[45%]" />
              <Dot label="หลักฐานการเปลี่ยนชื่อ" value={data.nameChangeDoc} className="w-[55%]" />
            </div>

            <div className="flex items-baseline gap-2 pl-4">
              <Dot label="ชื่อสกุลเดิม" value={data.formerLastName} className="w-[45%]" />
              <Dot label="หลักฐานการเปลี่ยนชื่อสกุล" value={data.lastNameChangeDoc} className="w-[55%]" />
            </div>

            <div className="flex items-baseline gap-2 pl-4">
              <Dot label="ชื่อเล่นหรือชื่ออื่น ๆ (ถ้ามี)" value={data.nickname} className="w-full" />
            </div>

            {/* ๓. เลขประจำตัวประชาชน */}
            <div className="flex items-baseline gap-2">
              <Dot label="๓. เลขประจำตัวประชาชน" value={data.citizenId} className="w-full" />
            </div>

            {/* ๔. วัน เดือน ปี เกิด */}
            <div className="flex items-baseline gap-2">
              <Dot label="๔. วัน เดือน ปี เกิด" value={data.dateOfBirth} className="w-[42%]" />
              <Dot label="สถานที่จดทะเบียนเกิด/โรงพยาบาลที่เกิด" value={data.birthPlaceHospital} className="w-[58%]" />
            </div>

            <div className="flex items-baseline gap-2 pl-4">
              <Dot label="เชื้อชาติ" value={data.race} className="w-[25%]" />
              <Dot label="สัญชาติ" value={data.nationality} className="w-[25%]" />
              <Dot label="ศาสนา" value={data.religion} className="w-[25%]" />
              <Dot label="ศาสนาเดิม" value={data.formerReligion} className="w-[25%]" />
            </div>

            <div className="flex items-baseline gap-2 pl-4">
              <Dot label="สัญชาติเดิม" value={data.formerNationality} className="w-[35%]" />
              <Dot label="หลักฐานการแปลงสัญชาติ" value={data.naturalizationDoc} className="w-[65%]" />
            </div>

            {/* ๕. ที่อยู่ตามทะเบียนบ้าน */}
            <div className="flex items-baseline gap-2">
              <Dot label="๕. ที่อยู่ตามทะเบียนบ้าน บ้านเลขที่" value={regAddress.cleanHouseNo} className="w-[38%]" />
              <Dot label="หมู่บ้าน" value={data.registeredVillage} className="w-[37%]" />
              <Dot label="หมู่ที่" value={regAddress.cleanMoo} className="w-[25%]" />
            </div>

            <div className="flex items-baseline gap-2 pl-4">
              <Dot label="ตรอก/ซอย" value={data.registeredSoi} className="w-[30%]" />
              <Dot label="ถนน" value={data.registeredRoad} className="w-[30%]" />
              <Dot label="ตำบล/แขวง" value={data.registeredSubdistrict} className="w-[40%]" />
            </div>

            <div className="flex items-baseline gap-2 pl-4">
              <Dot label="อำเภอ/เขต" value={data.registeredDistrict} className="w-[33%]" />
              <Dot label="จังหวัด" value={data.registeredProvince} className="w-[33%]" />
              <Dot label="โทรศัพท์" value={data.registeredPhone} className="w-[34%]" />
            </div>

            {/* ๖. ที่อยู่ปัจจุบัน */}
            <div className="flex items-baseline gap-2">
              <Dot label="๖. ที่อยู่ปัจจุบัน บ้านเลขที่" value={curAddress.cleanHouseNo} className="w-[38%]" />
              <Dot label="หมู่บ้าน" value={data.currentVillage} className="w-[37%]" />
              <Dot label="หมู่ที่" value={curAddress.cleanMoo} className="w-[25%]" />
            </div>

            <div className="flex items-baseline gap-2 pl-4">
              <Dot label="ตรอก/ซอย" value={data.currentSoi} className="w-[30%]" />
              <Dot label="ถนน" value={data.currentRoad} className="w-[30%]" />
              <Dot label="ตำบล/แขวง" value={data.currentSubdistrict} className="w-[40%]" />
            </div>

            <div className="flex items-baseline gap-2 pl-4">
              <Dot label="อำเภอ/เขต" value={data.currentDistrict} className="w-[33%]" />
              <Dot label="จังหวัด" value={data.currentProvince} className="w-[33%]" />
              <Dot label="โทรศัพท์" value={data.currentPhone} className="w-[34%]" />
            </div>

            {/* ช่องทางการติดต่อ */}
            <div className="flex items-baseline gap-2 pl-4">
              <Dot label="ช่องทางการติดต่อ : โทรศัพท์" value={data.phoneLandline} className="w-[35%]" />
              <Dot label="โทรศัพท์มือถือ" value={data.phoneMobile} className="w-[35%]" />
              <Dot label="e-mail" value={data.email} className="w-[30%]" />
            </div>

            <div className="flex items-baseline gap-2 pl-4">
              <Dot label="Line ID" value={data.lineId} className="w-[33%]" />
              <Dot label="Facebook" value={data.facebook} className="w-[33%]" />
              <Dot label="Instagram" value={data.instagram} className="w-[34%]" />
            </div>

            <div className="flex items-baseline gap-2 pl-4">
              <Dot label="อื่น ๆ" value={data.otherContact} className="w-full" />
            </div>

            {/* ๗. ถ้าเป็นต่างด้าว / บุคคลบนพื้นที่สูง */}
            <div className="pt-1 space-y-1.5">
              <div>๗. ถ้าเป็นต่างด้าว/บุคคลบนพื้นที่สูง</div>
              <div className="space-y-1.5 pl-4">
                <div className="flex items-baseline gap-2">
                  <Dot label="ใบสำคัญประจำตัวคนต่างด้าวเลขที่" value={data.alienCardNo} className="w-[60%]" />
                  <Dot label="ลงวันที่" value={data.alienCardDate} className="w-[40%]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <Dot label="ออกให้ ณ" value={data.alienCardIssuedAt} className="w-[34%]" />
                  <Dot label="อำเภอ/เขต" value={data.alienCardDistrict} className="w-[33%]" />
                  <Dot label="จังหวัด" value={data.alienCardProvince} className="w-[33%]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <Dot label="ใบสำคัญถิ่นที่อยู่เลขที่" value={data.alienResidenceDocNo} className="w-[60%]" />
                  <Dot label="ลงวันที่" value={data.alienResidenceDocDate} className="w-[40%]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <Dot label="ออกให้ ณ" value={data.alienResidenceIssuedAt} className="w-[34%]" />
                  <Dot label="อำเภอ/เขต" value={data.alienResidenceDistrict} className="w-[33%]" />
                  <Dot label="จังหวัด" value={data.alienResidenceProvince} className="w-[33%]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <Dot label="เลขประจำตัวผู้มีถิ่นที่อยู่ในประเทศไทย" value={data.alienIdInThailand} className="w-full" />
                </div>
                <div className="flex items-baseline gap-2">
                  <Dot label="ประเทศที่เกิด" value={data.birthCountry} className="w-[40%]" />
                  <Dot label="วัน เดือน ปี ที่เข้าประเทศไทย" value={data.entryDateToThailand} className="w-[60%]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <Dot label="ใบอนุญาตทำงานเลขที่" value={data.workPermitNo} className="w-[55%]" />
                  <Dot label="ออกให้โดย" value={data.workPermitIssuedBy} className="w-[45%]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <Dot label="วันออกใบอนุญาต" value={data.workPermitIssueDate} className="w-[50%]" />
                  <Dot label="วันที่ใบอนุญาตหมดอายุ" value={data.workPermitExpiryDate} className="w-[50%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Classification */}
        <div className="text-center font-normal text-xs pt-2">({classification || 'ชั้นความลับ'})</div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 2 (หมวด 8 - 11)
      ───────────────────────────────────────────────────────────── */}
      <div className="rpb1-page flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div className="w-16"></div>
            <div className="text-center font-bold">({classification})</div>
            <div className="text-right font-bold text-sm">- ๒ -</div>
          </div>

          {/* Section 8 */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div><strong>๘. ส่วนสูง</strong> {data.height ? `${data.height} ซม.` : '..... ซม.'}</div>
            <div><strong>น้ำหนัก</strong> {data.weight ? `${data.weight} กก.` : '..... กก.'}</div>
            <div><strong>ตำหนิ</strong> {data.scarsDistinguishingMarks || 'ไม่มี'}</div>
            <div><strong>กลุ่มเลือด</strong> {data.bloodGroup || '.....'}</div>
          </div>

          {/* Section 9 */}
          <div className="mb-4">
            <div className="font-bold mb-1">๙. ที่อยู่ในระยะ ๑๕ ปี ที่ผ่านมา (ให้กรอกตามลำดับก่อนหลัง)</div>
            <table className="w-full border-collapse border border-black text-[13px]">
              <thead>
                <tr className="bg-slate-100 text-center">
                  <th className="border border-black p-1 w-24">ปี พ.ศ. (จาก-ถึง)</th>
                  <th className="border border-black p-1">บ้านเลขที่ / ซอย / ถนน</th>
                  <th className="border border-black p-1">ตำบล / อำเภอ</th>
                  <th className="border border-black p-1">จังหวัด / ประเทศ</th>
                </tr>
              </thead>
              <tbody>
                {data.addressesPast15Years.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border border-black p-2 text-center text-slate-400">
                      -
                    </td>
                  </tr>
                ) : (
                  data.addressesPast15Years.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-1 text-center">{item.fromYear} - {item.toYear}</td>
                      <td className="border border-black p-1">{item.houseNo} {item.soi ? `ซ.${item.soi}` : ''} {item.road ? `ถ.${item.road}` : ''}</td>
                      <td className="border border-black p-1">ต.{item.subdistrict} อ.{item.district}</td>
                      <td className="border border-black p-1">จ.{item.province} ({item.country})</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Section 10 */}
          <div className="mb-4">
            <div className="font-bold mb-1">๑๐. การศึกษา (ให้กรอกตามลำดับก่อนหลัง)</div>
            <table className="w-full border-collapse border border-black text-[13px]">
              <thead>
                <tr className="bg-slate-100 text-center">
                  <th className="border border-black p-1 w-24">ปี พ.ศ. (จาก-ถึง)</th>
                  <th className="border border-black p-1">ชื่อสถานศึกษา</th>
                  <th className="border border-black p-1">วุฒิการศึกษา (สาขาวิชาเอก)</th>
                  <th className="border border-black p-1 w-20">เกรดเฉลี่ย</th>
                </tr>
              </thead>
              <tbody>
                {data.educations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border border-black p-2 text-center text-slate-400">
                      -
                    </td>
                  </tr>
                ) : (
                  data.educations.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-1 text-center">{item.fromYear} - {item.toYear}</td>
                      <td className="border border-black p-1">{item.schoolName}</td>
                      <td className="border border-black p-1">{item.degree} {item.major ? `(${item.major})` : ''}</td>
                      <td className="border border-black p-1 text-center">{item.gpa || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Section 11 */}
          <div>
            <div className="font-bold mb-1">๑๑. กิจกรรมพิเศษในสถานศึกษา</div>
            <table className="w-full border-collapse border border-black text-[13px]">
              <thead>
                <tr className="bg-slate-100 text-center">
                  <th className="border border-black p-1 w-24">ปี พ.ศ.</th>
                  <th className="border border-black p-1">ชื่อสถานศึกษา</th>
                  <th className="border border-black p-1">ตำแหน่งหน้าที่</th>
                </tr>
              </thead>
              <tbody>
                {data.specialActivities.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="border border-black p-2 text-center text-slate-400">
                      -
                    </td>
                  </tr>
                ) : (
                  data.specialActivities.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-1 text-center">{item.fromYear} - {item.toYear}</td>
                      <td className="border border-black p-1">{item.schoolName}</td>
                      <td className="border border-black p-1">{item.positionRole}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center font-bold pt-4">({classification})</div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 3 (หมวด 12 - 15)
      ───────────────────────────────────────────────────────────── */}
      <div className="rpb1-page flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div className="w-16"></div>
            <div className="text-center font-bold">({classification})</div>
            <div className="text-right font-bold text-sm">- ๓ -</div>
          </div>

          {/* Section 12 */}
          <div className="mb-4">
            <div className="font-bold mb-1">๑๒. รู้ภาษาไทยถิ่นต่าง ๆ และภาษาต่างประเทศ (ดีมาก, ดี, พอใช้)</div>
            <table className="w-full border-collapse border border-black text-[13px]">
              <thead>
                <tr className="bg-slate-100 text-center">
                  <th className="border border-black p-1">ภาษา</th>
                  <th className="border border-black p-1 w-20">อ่าน</th>
                  <th className="border border-black p-1 w-20">ฟัง</th>
                  <th className="border border-black p-1 w-20">เขียน</th>
                  <th className="border border-black p-1 w-20">พูด</th>
                </tr>
              </thead>
              <tbody>
                {data.languages.map((item, idx) => (
                  <tr key={idx} className="text-center">
                    <td className="border border-black p-1 text-left">{item.language}</td>
                    <td className="border border-black p-1">{item.readLevel || '-'}</td>
                    <td className="border border-black p-1">{item.listenLevel || '-'}</td>
                    <td className="border border-black p-1">{item.writeLevel || '-'}</td>
                    <td className="border border-black p-1">{item.speakLevel || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 13 */}
          <div className="mb-4">
            <div className="font-bold mb-1">๑๓. ประวัติการทำงานหรือการรับราชการ (ให้กรอกตามลำดับก่อนหลัง)</div>
            <table className="w-full border-collapse border border-black text-[13px]">
              <thead>
                <tr className="bg-slate-100 text-center">
                  <th className="border border-black p-1 w-20">ปี พ.ศ.</th>
                  <th className="border border-black p-1">นายจ้างหรือส่วนราชการ / ที่ตั้ง</th>
                  <th className="border border-black p-1">ตำแหน่งหน้าที่</th>
                  <th className="border border-black p-1">เหตุผลที่ออก/ย้าย</th>
                </tr>
              </thead>
              <tbody>
                {data.workHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border border-black p-2 text-center text-slate-400">
                      -
                    </td>
                  </tr>
                ) : (
                  data.workHistory.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-1 text-center">{item.fromYear} - {item.toYear}</td>
                      <td className="border border-black p-1">
                        <div>{item.employerOrAgency}</div>
                        <div className="text-[11px] text-slate-500">{item.locationPhone}</div>
                      </td>
                      <td className="border border-black p-1">{item.position}</td>
                      <td className="border border-black p-1">{item.reasonForLeaving}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Section 14 */}
          <div className="mb-3 text-[14px]">
            <strong>๑๔. อาชีพพิเศษอื่น ๆ และงานอดิเรก:</strong> {data.specialOccupationsHobbies || 'ไม่มี'}
          </div>

          {/* Section 15 */}
          <div className="space-y-1 text-[14px]">
            <div className="font-bold">๑๕. การรับราชการทหาร</div>
            <div className="grid grid-cols-2 gap-1 pl-4">
              <div>ปัจจุบันเป็น: {data.militaryStatus || 'ทหารประจำการ'}</div>
              <div>ยศ: {data.militaryRank || '-'}</div>
              <div>เครื่องหมายทะเบียนทหาร: {data.militaryRegNumber || '-'}</div>
              <div>เหล่าและสังกัด: {data.militaryBranchUnit || '-'}</div>
              <div>ที่ตั้งของหน่วย: {data.militaryUnitLocation || '-'}</div>
              <div>เข้าประจำการเมื่อ: {data.militaryServiceFrom || '-'} ถึง {data.militaryServiceTo || 'ปัจจุบัน'}</div>
              <div>จำนวนปีที่รับราชการ: {data.militaryYearsServed || '-'}</div>
              <div>ผู้บังคับบัญชาโดยตรงคนสุดท้าย: {data.militaryLastCommander || '-'}</div>
              <div className="col-span-2">เคยไปปฏิบัติราชการพิเศษที่: {data.militarySpecialOperations || 'ไม่มี'}</div>
            </div>
          </div>
        </div>

        <div className="text-center font-bold pt-4">({classification})</div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 4 (หมวด 16 - 18)
      ───────────────────────────────────────────────────────────── */}
      <div className="rpb1-page flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div className="w-16"></div>
            <div className="text-center font-bold">({classification})</div>
            <div className="text-right font-bold text-sm">- ๔ -</div>
          </div>

          {/* Section 16 */}
          <div className="mb-4 text-[14px]">
            <div className="font-bold mb-1">
              ๑๖. การเป็นนักเขียน นามปากกา และการสื่อสารผ่านสื่อสังคมออนไลน์
            </div>
            <div className="p-2 border border-black min-h-[50px]">
              {data.writerDetails || 'ไม่มี'}
            </div>
          </div>

          {/* Section 17 */}
          <div className="mb-4">
            <div className="font-bold mb-1">
              ๑๗. การเป็นสมาชิกในพรรคการเมือง สมาคม สโมสร องค์กร หรือกลุ่มสื่อสังคมออนไลน์
            </div>
            <table className="w-full border-collapse border border-black text-[13px]">
              <thead>
                <tr className="bg-slate-100 text-center">
                  <th className="border border-black p-1 w-24">ปี พ.ศ.</th>
                  <th className="border border-black p-1">ชื่อองค์กร / สมาคม</th>
                  <th className="border border-black p-1">ที่ตั้ง</th>
                  <th className="border border-black p-1 w-28">หมายเลขสมาชิก</th>
                </tr>
              </thead>
              <tbody>
                {data.politicalSocialMemberships.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border border-black p-2 text-center text-slate-400">
                      -
                    </td>
                  </tr>
                ) : (
                  data.politicalSocialMemberships.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-1 text-center">{item.fromYear} - {item.toYear}</td>
                      <td className="border border-black p-1">{item.organizationName}</td>
                      <td className="border border-black p-1">{item.location}</td>
                      <td className="border border-black p-1 text-center">{item.memberNo}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Section 18 */}
          <div>
            <div className="font-bold mb-1">๑๘. การเดินทางไปต่างประเทศ (ให้กรอกตามลำดับก่อนหลัง)</div>
            <table className="w-full border-collapse border border-black text-[13px]">
              <thead>
                <tr className="bg-slate-100 text-center">
                  <th className="border border-black p-1 w-24">ปี พ.ศ.</th>
                  <th className="border border-black p-1">เมืองและประเทศ</th>
                  <th className="border border-black p-1">ความมุ่งหมายที่ไปและทุนที่ได้รับ</th>
                </tr>
              </thead>
              <tbody>
                {data.foreignTravels.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="border border-black p-2 text-center text-slate-400">
                      -
                    </td>
                  </tr>
                ) : (
                  data.foreignTravels.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-1 text-center">{item.fromYear} - {item.toYear}</td>
                      <td className="border border-black p-1">{item.cityCountry}</td>
                      <td className="border border-black p-1">{item.purposeAndSponsorship}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center font-bold pt-4">({classification})</div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 5 (หมวด 19 - 21)
      ───────────────────────────────────────────────────────────── */}
      <div className="rpb1-page flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div className="w-16"></div>
            <div className="text-center font-bold">({classification})</div>
            <div className="text-right font-bold text-sm">- ๕ -</div>
          </div>

          {/* Section 19 */}
          <div className="mb-4">
            <div className="font-bold mb-1">๑๙. หนังสือสำคัญแสดงตน (บัตรข้าราชการ, ใบขับขี่, Passport ฯลฯ)</div>
            <table className="w-full border-collapse border border-black text-[13px]">
              <thead>
                <tr className="bg-slate-100 text-center">
                  <th className="border border-black p-1">ชนิดหนังสือสำคัญ</th>
                  <th className="border border-black p-1">หมายเลข</th>
                  <th className="border border-black p-1">ออกให้ที่</th>
                  <th className="border border-black p-1">วันออกและวันสิ้นอายุ</th>
                </tr>
              </thead>
              <tbody>
                {data.identificationDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border border-black p-2 text-center text-slate-400">
                      -
                    </td>
                  </tr>
                ) : (
                  data.identificationDocuments.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-1">{item.docType}</td>
                      <td className="border border-black p-1 text-center">{item.docNumber}</td>
                      <td className="border border-black p-1">{item.issuedAt}</td>
                      <td className="border border-black p-1 text-center">{item.issueAndExpiryDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Section 20 */}
          <div className="mb-4">
            <div className="font-bold mb-1">๒๐. การถูกจับ หรือถูกฟ้องศาล และการถูกลงโทษทางวินัย</div>
            <table className="w-full border-collapse border border-black text-[13px]">
              <thead>
                <tr className="bg-slate-100 text-center">
                  <th className="border border-black p-1 w-24">วัน เดือน ปี</th>
                  <th className="border border-black p-1">สถานที่เกิดเหตุ</th>
                  <th className="border border-black p-1">ข้อหา</th>
                  <th className="border border-black p-1">ผลที่สุดแห่งคดี</th>
                </tr>
              </thead>
              <tbody>
                {data.legalCases.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border border-black p-2 text-center text-slate-400">
                      ไม่มีประวัติการถูกจับหรือฟ้องร้องคดี
                    </td>
                  </tr>
                ) : (
                  data.legalCases.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-1 text-center">{item.date}</td>
                      <td className="border border-black p-1">{item.crimeScene}</td>
                      <td className="border border-black p-1">{item.charge}</td>
                      <td className="border border-black p-1">{item.caseResult}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="mt-1 text-[13px]">
              <strong>กรณีเคยถูกลงโทษทางวินัย:</strong> {data.disciplinaryPunishments || 'ไม่มี'}
            </div>
          </div>

          {/* Section 21 */}
          <div>
            <div className="font-bold mb-1">๒๑. ข้อมูลบิดามารดา</div>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              {/* Father */}
              <div className="p-2 border border-black space-y-0.5">
                <div className="font-bold text-center border-b border-black pb-0.5 mb-1">บิดา</div>
                <div><strong>ชื่อ-สกุล:</strong> {data.fatherDetails.titleName || '-'}</div>
                <div><strong>วันเกิด:</strong> {data.fatherDetails.dob || '-'} <strong>สถานที่เกิด:</strong> {data.fatherDetails.birthPlace || '-'}</div>
                <div><strong>เลขประจำตัวประชาชน:</strong> {data.fatherDetails.citizenId || '-'}</div>
                <div><strong>เชื้อชาติ/ศาสนา:</strong> {data.fatherDetails.race} / {data.fatherDetails.religion}</div>
                <div><strong>สัญชาติ (เดิม/ปัจจุบัน):</strong> {data.fatherDetails.nationalityOriginal} / {data.fatherDetails.nationalityCurrent}</div>
                <div><strong>ที่อยู่/โทร:</strong> {data.fatherDetails.addressPhone || '-'}</div>
                <div><strong>อาชีพ:</strong> {data.fatherDetails.occupation || '-'} <strong>ที่ทำงาน:</strong> {data.fatherDetails.workplacePhone || '-'}</div>
              </div>

              {/* Mother */}
              <div className="p-2 border border-black space-y-0.5">
                <div className="font-bold text-center border-b border-black pb-0.5 mb-1">มารดา</div>
                <div><strong>ชื่อ-สกุล:</strong> {data.motherDetails.titleName || '-'}</div>
                <div><strong>วันเกิด:</strong> {data.motherDetails.dob || '-'} <strong>สถานที่เกิด:</strong> {data.motherDetails.birthPlace || '-'}</div>
                <div><strong>เลขประจำตัวประชาชน:</strong> {data.motherDetails.citizenId || '-'}</div>
                <div><strong>เชื้อชาติ/ศาสนา:</strong> {data.motherDetails.race} / {data.motherDetails.religion}</div>
                <div><strong>สัญชาติ (เดิม/ปัจจุบัน):</strong> {data.motherDetails.nationalityOriginal} / {data.motherDetails.nationalityCurrent}</div>
                <div><strong>ที่อยู่/โทร:</strong> {data.motherDetails.addressPhone || '-'}</div>
                <div><strong>อาชีพ:</strong> {data.motherDetails.occupation || '-'} <strong>ที่ทำงาน:</strong> {data.motherDetails.workplacePhone || '-'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center font-bold pt-4">({classification})</div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 6 (หมวด 22 - 23)
      ───────────────────────────────────────────────────────────── */}
      <div className="rpb1-page flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div className="w-16"></div>
            <div className="text-center font-bold">({classification})</div>
            <div className="text-right font-bold text-sm">- ๖ -</div>
          </div>

          {/* Section 22 */}
          <div className="mb-4">
            <div className="font-bold mb-1">
              ๒๒. การสมรส (สถานภาพ: <span className="underline">{data.maritalStatus || 'โสด'}</span>)
            </div>

            {data.maritalStatus !== 'โสด' && (
              <div className="p-2 border border-black text-[13px] space-y-1 mb-2">
                <div className="font-bold">คู่หมั้นหรือคู่สมรสในปัจจุบัน</div>
                <div className="grid grid-cols-2 gap-1">
                  <div><strong>ชื่อตัว-ชื่อสกุล (เดิม):</strong> {data.spouseCurrentDetails.titleNameOriginal || '-'}</div>
                  <div><strong>วันเกิด:</strong> {data.spouseCurrentDetails.dob || '-'} <strong>สถานที่เกิด:</strong> {data.spouseCurrentDetails.birthPlace || '-'}</div>
                  <div><strong>เชื้อชาติ/ศาสนา:</strong> {data.spouseCurrentDetails.race} / {data.spouseCurrentDetails.religion}</div>
                  <div><strong>สัญชาติ:</strong> {data.spouseCurrentDetails.nationalityCurrent}</div>
                  <div><strong>อาชีพ/ตำแหน่ง:</strong> {data.spouseCurrentDetails.occupation || '-'}</div>
                  <div><strong>ที่ทำงาน/โทร:</strong> {data.spouseCurrentDetails.workplacePhone || '-'}</div>
                  <div><strong>วันที่สมรส/หมั้น:</strong> {data.spouseCurrentDetails.marriageDate || '-'}</div>
                  <div><strong>สถานที่จดทะเบียน:</strong> {data.spouseCurrentDetails.marriagePlace || '-'}</div>
                  <div className="col-span-2"><strong>ที่อยู่ปัจจุบันและโทรศัพท์:</strong> {data.spouseCurrentDetails.currentAddressPhone || '-'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Section 23 */}
          <div>
            <div className="font-bold mb-1">๒๓. ข้อมูลบุตร</div>
            <table className="w-full border-collapse border border-black text-[13px]">
              <thead>
                <tr className="bg-slate-100 text-center">
                  <th className="border border-black p-1 w-10">ลำดับ</th>
                  <th className="border border-black p-1">ยศ ชื่อตัว ชื่อสกุล</th>
                  <th className="border border-black p-1 w-24">วันเกิด</th>
                  <th className="border border-black p-1">สัญชาติ/ศาสนา</th>
                  <th className="border border-black p-1">อาชีพ / สถานศึกษา / โทร</th>
                </tr>
              </thead>
              <tbody>
                {data.children.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="border border-black p-2 text-center text-slate-400">
                      ไม่มีบุตร
                    </td>
                  </tr>
                ) : (
                  data.children.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-1 text-center">{idx + 1}</td>
                      <td className="border border-black p-1">{item.titleName}</td>
                      <td className="border border-black p-1 text-center">{item.dob}</td>
                      <td className="border border-black p-1 text-center">{item.nationality}/{item.religion}</td>
                      <td className="border border-black p-1">
                        {item.occupation} {item.schoolWorkplace ? `(${item.schoolWorkplace})` : ''} {item.phone ? `โทร. ${item.phone}` : ''}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center font-bold pt-4">({classification})</div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 7 (หมวด 24 - 26)
      ───────────────────────────────────────────────────────────── */}
      <div className="rpb1-page flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div className="w-16"></div>
            <div className="text-center font-bold">({classification})</div>
            <div className="text-right font-bold text-sm">- ๗ -</div>
          </div>

          {/* Section 24 */}
          <div className="mb-4">
            <div className="font-bold mb-1">๒๔. พี่น้องร่วมบิดาหรือร่วมมารดา รวมทั้งสามีหรือภรรยา</div>
            <table className="w-full border-collapse border border-black text-[12px]">
              <thead>
                <tr className="bg-slate-100 text-center">
                  <th className="border border-black p-1 w-8">ที่</th>
                  <th className="border border-black p-1">ชื่อ-สกุลพี่น้อง / วันเกิด / เลข ปชช.</th>
                  <th className="border border-black p-1">อาชีพ / ที่ทำงาน / โทร</th>
                  <th className="border border-black p-1">สามีหรือภรรยาของพี่น้อง</th>
                </tr>
              </thead>
              <tbody>
                {data.siblings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border border-black p-2 text-center text-slate-400">
                      -
                    </td>
                  </tr>
                ) : (
                  data.siblings.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-1 text-center">{idx + 1}</td>
                      <td className="border border-black p-1">
                        <div><strong>{item.titleName}</strong> ({item.dob})</div>
                        <div className="text-[11px] font-mono">{item.citizenId}</div>
                      </td>
                      <td className="border border-black p-1">
                        <div>{item.occupation}</div>
                        <div className="text-[11px]">{item.schoolWorkplace} {item.phone}</div>
                      </td>
                      <td className="border border-black p-1">
                        {item.spouseNameOriginal ? (
                          <div>
                            <div>{item.spouseNameOriginal}</div>
                            <div className="text-[11px]">{item.spouseOccupation} {item.spousePhone}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Section 25 */}
          <div className="mb-4">
            <div className="font-bold mb-1">๒๕. ญาติที่รับราชการหรือทำงานในองค์การรัฐบาล</div>
            <table className="w-full border-collapse border border-black text-[12px]">
              <thead>
                <tr className="bg-slate-100 text-center">
                  <th className="border border-black p-1">ยศ ชื่อตัว ชื่อสกุล</th>
                  <th className="border border-black p-1 w-24">เกี่ยวข้องเป็น</th>
                  <th className="border border-black p-1">ตำแหน่ง / ที่ทำงาน</th>
                  <th className="border border-black p-1">ที่อยู่และโทรศัพท์</th>
                </tr>
              </thead>
              <tbody>
                {data.relativesInGovernment.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border border-black p-2 text-center text-slate-400">
                      -
                    </td>
                  </tr>
                ) : (
                  data.relativesInGovernment.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-1">{item.titleName}</td>
                      <td className="border border-black p-1 text-center">{item.relation}</td>
                      <td className="border border-black p-1">{item.occupation} {item.workplacePhone}</td>
                      <td className="border border-black p-1">{item.currentAddressPhone}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Section 26 */}
          <div>
            <div className="font-bold mb-1">๒๖. ญาติ เพื่อน หรือผู้ที่คุ้นเคยในต่างประเทศ</div>
            <table className="w-full border-collapse border border-black text-[12px]">
              <thead>
                <tr className="bg-slate-100 text-center">
                  <th className="border border-black p-1">ชื่อ-สกุล</th>
                  <th className="border border-black p-1 w-20">เกี่ยวข้อง</th>
                  <th className="border border-black p-1">ที่อยู่ต่างประเทศ</th>
                  <th className="border border-black p-1">เหตุผลการไปอยู่</th>
                </tr>
              </thead>
              <tbody>
                {data.overseasContacts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border border-black p-2 text-center text-slate-400">
                      -
                    </td>
                  </tr>
                ) : (
                  data.overseasContacts.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-1">{item.titleName}</td>
                      <td className="border border-black p-1 text-center">{item.relation}</td>
                      <td className="border border-black p-1">{item.currentAddress}</td>
                      <td className="border border-black p-1">{item.reasonLivingAbroad}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center font-bold pt-4">({classification})</div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 8 (หมวด 27 - 30)
      ───────────────────────────────────────────────────────────── */}
      <div className="rpb1-page flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div className="w-16"></div>
            <div className="text-center font-bold">({classification})</div>
            <div className="text-right font-bold text-sm">- ๘ -</div>
          </div>

          {/* Section 27 */}
          <div className="mb-3">
            <div className="font-bold mb-1">๒๗. ผู้ร่วมอาศัยในที่อยู่ปัจจุบัน</div>
            <div className="text-[13px] pl-4 space-y-0.5">
              {data.cohabitants.length === 0 ? (
                <div>- ไม่มี -</div>
              ) : (
                data.cohabitants.map((item, idx) => (
                  <div key={idx}>
                    {idx + 1}. {item.titleName} (เกี่ยวข้องเป็น: {item.relation})
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 28 */}
          <div className="mb-3">
            <div className="font-bold mb-1">๒๘. ผู้ใกล้ชิดสนิทสนมและบุคคลที่ติดต่อด้วยเสมอ (บุคคลอ้างอิง)</div>
            <table className="w-full border-collapse border border-black text-[12px]">
              <thead>
                <tr className="bg-slate-100 text-center">
                  <th className="border border-black p-1">ยศ ชื่อตัว ชื่อสกุล</th>
                  <th className="border border-black p-1 w-16">ปีที่รู้จัก</th>
                  <th className="border border-black p-1">ที่อยู่ปัจจุบัน / โทรศัพท์</th>
                  <th className="border border-black p-1">ที่ทำงาน / โทรศัพท์</th>
                </tr>
              </thead>
              <tbody>
                {data.closeFriendsRef.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border border-black p-2 text-center text-slate-400">
                      -
                    </td>
                  </tr>
                ) : (
                  data.closeFriendsRef.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-1">{item.titleName}</td>
                      <td className="border border-black p-1 text-center">{item.yearsKnown}</td>
                      <td className="border border-black p-1">{item.addressPhone}</td>
                      <td className="border border-black p-1">{item.workplacePhone}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Section 29 */}
          <div className="mb-3 text-[13px]">
            <div className="font-bold mb-1">๒๙. ผู้อุปการะช่วยเหลือ สนับสนุน (เว้นบิดามารดา)</div>
            <div className="pl-4">
              {data.supporters.length === 0 ? (
                <div>- ไม่มี -</div>
              ) : (
                data.supporters.map((item, idx) => (
                  <div key={idx}>
                    {item.titleName} ({item.addressPhone}) {item.workplacePhone}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 30 */}
          <div className="space-y-2 text-[13px]">
            <div className="font-bold">๓๐. ประวัติคำชี้แจงอื่น ๆ</div>
            <div className="p-2 border border-black min-h-[40px]">
              {data.additionalExplanations || 'ไม่มี'}
            </div>

            <p className="leading-relaxed indent-8 mt-2">
              ข้าพเจ้าขอรับรองว่า ข้อความดังกล่าวข้างต้นเป็นความจริงทุกประการ และรับทราบว่าหน่วยงานสามารถจัดเก็บ ใช้ ข้อมูลจากแบบประวัติบุคคลนี้ เพื่อพิจารณาดำเนินการตามระเบียบสำนักนายกรัฐมนตรี ว่าด้วยการรักษาความปลอดภัยแห่งชาติ พ.ศ.๒๕๕๒ และที่แก้ไขเพิ่มเติม
            </p>

            {/* Signature Blocks */}
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="text-center space-y-1">
                <div>ลายมือชื่อ ..................................................... เจ้าของประวัติ</div>
                <div>({data.titleRank} {data.firstName} {data.lastName})</div>
                <div>วันที่ {data.ownerSignatureDate || '.....................................'}</div>
              </div>

              <div className="text-center space-y-1">
                <div>ควบคุมการบันทึกประวัติโดย</div>
                <div>ลายมือชื่อ .....................................................</div>
                <div>({data.inspectorRankName || '.....................................................'})</div>
                <div>ตำแหน่ง {data.inspectorPosition || '.....................................................'}</div>
                <div>วันที่ {data.inspectorSignatureDate || '.....................................'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center font-bold pt-4">({classification})</div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 9 (แผนที่สังเขป & ผู้ติดต่อเร่งด่วน)
      ───────────────────────────────────────────────────────────── */}
      <div className="rpb1-page flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div className="w-16"></div>
            <div className="text-center font-bold">({classification})</div>
            <div className="text-right font-bold text-sm">- ๙ -</div>
          </div>

          <div className="text-center font-bold text-lg mb-3">
            แผนที่สังเขปที่อยู่ปัจจุบัน
          </div>

          <div className="text-[14px] mb-2 space-y-1">
            <div>
              บ้านเลขที่ {data.mapHouseNo || data.currentHouseNo || '........'} หมู่บ้าน {data.mapVillage || data.currentVillage || '........'} หมู่ที่ {data.mapMoo || data.currentMoo || '........'} ตรอก/ซอย {data.mapSoi || data.currentSoi || '........'} ถนน {data.mapRoad || data.currentRoad || '........'}
            </div>
            <div>
              ตำบล/แขวง {data.mapSubdistrict || data.currentSubdistrict || '........'} อำเภอ/เขต {data.mapDistrict || data.currentDistrict || '........'} จังหวัด {data.mapProvince || data.currentProvince || '........'} หมายเลขโทรศัพท์ {data.mapPhone || data.currentPhone || '........'}
            </div>
            <div>
              ชื่อเจ้าบ้าน {data.mapHouseOwnerName || '................................................'} หมายเลขโทรศัพท์ {data.mapHouseOwnerPhone || '........................'}
            </div>
            <div>
              <strong>บุคคลที่จะขอให้ตามตัวได้ในกรณีเร่งด่วน:</strong> ยศ ชื่อตัว ชื่อสกุล {data.emergencyContactRankName || '................................'} เกี่ยวข้องเป็น {data.emergencyContactRelation || '....................'} ที่อยู่/โทรศัพท์ {data.emergencyContactAddress || '................................................'}
            </div>
          </div>

          {/* Map Sketch Drawing / Box */}
          <div className="border-2 border-black h-[140mm] w-full flex items-center justify-center p-2 my-4 relative">
            {data.sketchMapImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.sketchMapImage}
                alt="แผนที่สังเขป"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-center text-slate-400 text-sm space-y-2">
                <div>[ กรอบสำหรับวาดหรือติดภาพแผนที่สังเขปที่อยู่ปัจจุบัน ]</div>
                <div className="text-xs text-slate-400">(ระบุสถานที่สำคัญใกล้เคียงและทิศทาง)</div>
              </div>
            )}
          </div>

          <div className="text-right space-y-1 pt-2 pr-8 text-[14px]">
            <div>ลายมือชื่อ ..................................................... เจ้าของประวัติ</div>
            <div>จัดทำเมื่อ {data.ownerSignatureDate || '.....................................'}</div>
          </div>
        </div>

        <div className="text-center font-bold pt-4">({classification})</div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 10 (บันทึกประวัติบุคคลเพิ่มเติม)
      ───────────────────────────────────────────────────────────── */}
      <div className="rpb1-page flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div className="w-16"></div>
            <div className="text-center font-bold">({classification})</div>
            <div className="text-right font-bold text-sm">- ๑๐ -</div>
          </div>

          <div className="text-center font-bold text-lg mb-4">
            บันทึกประวัติบุคคลเพิ่มเติม
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4">
            {/* Left 8 cols: Personal Summary */}
            <div className="col-span-8 space-y-2 text-[14px]">
              <div>
                <strong>๑. คำนำหน้าชื่อ/ชื่อ/นามสกุล:</strong> {data.extraTitleName || `${data.titleRank} ${data.firstName} ${data.lastName}`}
              </div>
              <div>
                <strong>เพศ:</strong> {data.extraGender || data.gender || '-'} <strong>๒. กรุ๊ปเลือด:</strong> {data.extraBloodGroup || data.bloodGroup || '-'}
              </div>
              <div>
                <strong>๓. ที่อยู่ตามทะเบียนบ้าน:</strong> {data.extraRegisteredAddress || `${data.registeredHouseNo} ${data.registeredSubdistrict} ${data.registeredDistrict} ${data.registeredProvince}`}
              </div>
              <div>
                <strong>๔. ที่อยู่จริงปัจจุบัน:</strong> {data.extraIsSameAddress ? 'ที่เดียวกับทะเบียนบ้าน' : data.extraCurrentAddress}
              </div>
              <div className="pt-1">
                <strong>๕. หมายเลขโทรศัพท์ที่ติดต่อได้:</strong>
                <div className="pl-4 space-y-0.5">
                  <div>โทรศัพท์มือถือ: {data.extraMobilePhone || data.phoneMobile || '-'}</div>
                  <div>โทรศัพท์บ้าน: {data.extraHomePhone || data.phoneLandline || '-'}</div>
                  <div>โทรศัพท์สำนักงาน: {data.extraOfficePhone || '-'}</div>
                  <div>e-mail address: {data.extraEmail || data.email || '-'}</div>
                </div>
              </div>
            </div>

            {/* Right 4 cols: Photo 4.5 x 6 cm */}
            <div className="col-span-4 flex flex-col items-center">
              <div className="w-[45mm] h-[60mm] border-2 border-black flex flex-col items-center justify-center p-1 text-center text-xs text-slate-500 overflow-hidden bg-slate-50">
                {data.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.photoUrl}
                    alt="ภาพถ่าย 4.5 x 6 ซม."
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div>ติดภาพถ่ายครึ่งตัว</div>
                    <div>หน้าตรงไม่สวมหมวก</div>
                    <div>ขนาด ๔.๕ x ๖ ซ.ม.</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 space-y-6 text-[14px]">
            <div className="text-right pr-8 space-y-1">
              <div>ลายมือชื่อ ..................................................... เจ้าของประวัติ</div>
              <div>({data.extraTitleName || `${data.titleRank} ${data.firstName} ${data.lastName}`})</div>
            </div>

            <div className="text-right pr-8 space-y-1 pt-4">
              <div>ลายมือชื่อ ..................................................... เจ้าหน้าที่ควบคุมการบันทึกประวัติ</div>
              <div>ตำแหน่ง {data.extraOfficerPosition || data.inspectorPosition || '.....................................................'}</div>
              <div>วัน เดือน ปี {data.extraOfficerSignatureDate || data.inspectorSignatureDate || '.....................................'}</div>
            </div>
          </div>
        </div>

        <div className="text-center font-bold pt-4">({classification})</div>
      </div>
    </div>
  );
}
