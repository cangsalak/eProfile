'use client';

import React from 'react';
import { Rpb1FormData } from '../../types';
import { ImageUpload } from '@/components/ui';

interface PageProps {
  formData: Rpb1FormData;
  setFormData: React.Dispatch<React.SetStateAction<Rpb1FormData>>;
}

export default function Page10AdditionalRecord({ formData, setFormData }: PageProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  return (
    <div className="space-y-6 font-prompt animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-xs flex items-center justify-center">
            10
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            หน้า 10 — บันทึกประวัติบุคคลเพิ่มเติม และรูปถ่าย (ขนาด 4.5 x 6 ซม.)
          </h4>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
          (ชั้นความลับ: {formData.classification || 'ลับ'})
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Additional Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
              <i className="fa-solid fa-list-check"></i>
              <span>สรุปข้อมูลประวัติบุคคลเพิ่มเติม</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label htmlFor="rpb1_p10_extraTitleName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  1. คำนำหน้าชื่อ / ชื่อ / นามสกุล
                </label>
                <input
                  id="rpb1_p10_extraTitleName"
                  type="text"
                  name="extraTitleName"
                  value={
                    formData.extraTitleName ||
                    `${formData.titleRank || ''} ${formData.firstName || ''} ${formData.lastName || ''}`.trim()
                  }
                  onChange={handleChange}
                  aria-label="คำนำหน้าชื่อ ชื่อ นามสกุล เพิ่มเติม"
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label htmlFor="rpb1_p10_extraGender" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">เพศ</label>
                <input
                  id="rpb1_p10_extraGender"
                  type="text"
                  name="extraGender"
                  value={formData.extraGender || formData.gender || ''}
                  onChange={handleChange}
                  aria-label="เพศ เพิ่มเติม"
                  className="form-input text-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="rpb1_p10_extraBloodGroup" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">2. หมู่โลหิต</label>
              <input
                id="rpb1_p10_extraBloodGroup"
                type="text"
                name="extraBloodGroup"
                value={formData.extraBloodGroup || formData.bloodGroup || ''}
                onChange={handleChange}
                placeholder="เช่น A, B, AB, O"
                aria-label="กรุ๊ปเลือด เพิ่มเติม"
                className="form-input text-xs"
              />
            </div>

            <div>
              <label htmlFor="rpb1_p10_extraRegisteredAddress" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                3. ที่อยู่ตามทะเบียนบ้าน
              </label>
              <textarea
                id="rpb1_p10_extraRegisteredAddress"
                name="extraRegisteredAddress"
                rows={2}
                value={
                  formData.extraRegisteredAddress ||
                  `${formData.registeredHouseNo || ''} ม.${formData.registeredMoo || '-'} ซ.${formData.registeredSoi || '-'} ถ.${formData.registeredRoad || '-'} ต.${formData.registeredSubdistrict || '-'} อ.${formData.registeredDistrict || '-'} จ.${formData.registeredProvince || ''}`.trim()
                }
                onChange={handleChange}
                aria-label="ที่อยู่ตามทะเบียนบ้าน เพิ่มเติม"
                className="form-textarea text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="rpb1_p10_extraCurrentAddress" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  4. ที่อยู่จริงปัจจุบัน
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-primary-600 dark:text-primary-400">
                  <input
                    type="checkbox"
                    name="extraIsSameAddress"
                    checked={formData.extraIsSameAddress}
                    onChange={handleChange}
                    className="rounded border-slate-300"
                  />
                  <span>ที่เดียวกับทะเบียนบ้าน</span>
                </label>
              </div>
              <textarea
                id="rpb1_p10_extraCurrentAddress"
                name="extraCurrentAddress"
                rows={2}
                value={
                  formData.extraIsSameAddress
                    ? formData.extraRegisteredAddress ||
                      `${formData.registeredHouseNo || ''} ม.${formData.registeredMoo || '-'} ซ.${formData.registeredSoi || '-'} ถ.${formData.registeredRoad || '-'} ต.${formData.registeredSubdistrict || '-'} อ.${formData.registeredDistrict || '-'} จ.${formData.registeredProvince || ''}`.trim()
                    : formData.extraCurrentAddress || ''
                }
                onChange={handleChange}
                disabled={formData.extraIsSameAddress}
                aria-label="ที่อยู่จริงปัจจุบัน เพิ่มเติม"
                className="form-textarea text-xs"
              />
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
              <h6 className="text-xs font-bold text-slate-800 dark:text-slate-200">5. หมายเลขโทรศัพท์และอีเมลที่ติดต่อได้</h6>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="rpb1_p10_extraMobilePhone" className="block text-[10px] text-slate-500 mb-0.5">โทรศัพท์มือถือ</label>
                  <input
                    id="rpb1_p10_extraMobilePhone"
                    type="text"
                    name="extraMobilePhone"
                    value={formData.extraMobilePhone || formData.phoneMobile || ''}
                    onChange={handleChange}
                    aria-label="โทรศัพท์มือถือ เพิ่มเติม"
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="rpb1_p10_extraHomePhone" className="block text-[10px] text-slate-500 mb-0.5">โทรศัพท์บ้าน</label>
                  <input
                    id="rpb1_p10_extraHomePhone"
                    type="text"
                    name="extraHomePhone"
                    value={formData.extraHomePhone || formData.phoneLandline || ''}
                    onChange={handleChange}
                    aria-label="โทรศัพท์บ้าน เพิ่มเติม"
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="rpb1_p10_extraOfficePhone" className="block text-[10px] text-slate-500 mb-0.5">โทรศัพท์สำนักงาน</label>
                  <input
                    id="rpb1_p10_extraOfficePhone"
                    type="text"
                    name="extraOfficePhone"
                    value={formData.extraOfficePhone || ''}
                    onChange={handleChange}
                    aria-label="โทรศัพท์สำนักงาน เพิ่มเติม"
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="rpb1_p10_extraEmail" className="block text-[10px] text-slate-500 mb-0.5">E-mail Address</label>
                  <input
                    id="rpb1_p10_extraEmail"
                    type="email"
                    name="extraEmail"
                    value={formData.extraEmail || formData.email || ''}
                    onChange={handleChange}
                    aria-label="อีเมล ติดต่อ เพิ่มเติม"
                    className="form-input text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Photo Upload Box & Officer Sign */}
        <div className="space-y-4">
          {/* Photo 4.5 x 6 cm Box */}
          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
            <ImageUpload
              id="rpb1_p10_photoUpload"
              label="ภาพถ่ายครึ่งตัว หน้าตรงไม่สวมหมวก"
              value={formData.photoUrl}
              onChange={(url) => setFormData((prev) => ({ ...prev, photoUrl: url }))}
              onRemove={() => setFormData((prev) => ({ ...prev, photoUrl: '' }))}
              variant="id-photo"
              placeholder="คลิกหรือลากรูปถ่าย 4.5 x 6 ซม. มาวาง"
              helperText="ขนาดมาตรฐาน 4.5 x 6 ซม. (ถ่ายไว้ไม่เกิน 6 เดือน)"
            />
          </div>

          {/* Officer Verification */}
          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-2 text-xs">
            <h6 className="font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-200/60 dark:border-slate-700/60">
              เจ้าหน้าที่ควบคุมการบันทึกประวัติ
            </h6>
            <div>
              <label htmlFor="rpb1_p10_extraOfficerName" className="block text-[10px] text-slate-500 mb-0.5">ยศ ชื่อตัว ชื่อสกุล</label>
              <input
                id="rpb1_p10_extraOfficerName"
                type="text"
                name="extraOfficerName"
                value={formData.extraOfficerName || formData.inspectorRankName || ''}
                onChange={handleChange}
                placeholder="ยศ ชื่อ สกุล"
                aria-label="ยศ ชื่อตัว ชื่อสกุล เจ้าหน้าที่"
                className="form-input text-xs p-1.5"
              />
            </div>
            <div>
              <label htmlFor="rpb1_p10_extraOfficerPosition" className="block text-[10px] text-slate-500 mb-0.5">ตำแหน่ง</label>
              <input
                id="rpb1_p10_extraOfficerPosition"
                type="text"
                name="extraOfficerPosition"
                value={formData.extraOfficerPosition || formData.inspectorPosition || ''}
                onChange={handleChange}
                placeholder="ตำแหน่งเจ้าหน้าที่"
                aria-label="ตำแหน่ง เจ้าหน้าที่"
                className="form-input text-xs p-1.5"
              />
            </div>
            <div>
              <label htmlFor="rpb1_p10_extraOfficerSignatureDate" className="block text-[10px] text-slate-500 mb-0.5">วัน เดือน ปี ที่บันทึก</label>
              <input
                id="rpb1_p10_extraOfficerSignatureDate"
                type="text"
                name="extraOfficerSignatureDate"
                value={formData.extraOfficerSignatureDate || formData.inspectorSignatureDate || ''}
                onChange={handleChange}
                placeholder="เช่น 15 มี.ค. 2567"
                aria-label="วัน เดือน ปี ที่บันทึก เจ้าหน้าที่"
                className="form-input text-xs p-1.5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

