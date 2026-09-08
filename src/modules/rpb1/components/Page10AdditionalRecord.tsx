'use client';

import React from 'react';
import { Rpb1FormData } from '../types';

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
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
            หน้า ๑๐ — บันทึกประวัติบุคคลเพิ่มเติม และรูปถ่าย (ขนาด ๔.๕ x ๖ ซม.)
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ๑. คำนำหน้าชื่อ / ชื่อ / นามสกุล
                </label>
                <input
                  type="text"
                  name="extraTitleName"
                  value={
                    formData.extraTitleName ||
                    `${formData.titleRank || ''} ${formData.firstName || ''} ${formData.lastName || ''}`.trim()
                  }
                  onChange={handleChange}
                  className="form-control text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">เพศ</label>
                <input
                  type="text"
                  name="extraGender"
                  value={formData.extraGender || formData.gender || ''}
                  onChange={handleChange}
                  className="form-control text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">๒. กรุ๊ปเลือด</label>
              <input
                type="text"
                name="extraBloodGroup"
                value={formData.extraBloodGroup || formData.bloodGroup || ''}
                onChange={handleChange}
                placeholder="เช่น A, B, AB, O"
                className="form-control text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ๓. ที่อยู่ตามทะเบียนบ้าน
              </label>
              <textarea
                name="extraRegisteredAddress"
                rows={2}
                value={
                  formData.extraRegisteredAddress ||
                  `${formData.registeredHouseNo || ''} ม.${formData.registeredMoo || '-'} ซ.${formData.registeredSoi || '-'} ถ.${formData.registeredRoad || '-'} ต.${formData.registeredSubdistrict || '-'} อ.${formData.registeredDistrict || '-'} จ.${formData.registeredProvince || ''}`.trim()
                }
                onChange={handleChange}
                className="form-control text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ๔. ที่อยู่จริงปัจจุบัน
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
                className="form-control text-xs"
              />
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
              <h6 className="text-xs font-bold text-slate-800 dark:text-slate-200">๕. หมายเลขโทรศัพท์และอีเมลที่ติดต่อได้</h6>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">โทรศัพท์มือถือ</label>
                  <input
                    type="text"
                    name="extraMobilePhone"
                    value={formData.extraMobilePhone || formData.phoneMobile || ''}
                    onChange={handleChange}
                    className="form-control text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">โทรศัพท์บ้าน</label>
                  <input
                    type="text"
                    name="extraHomePhone"
                    value={formData.extraHomePhone || formData.phoneLandline || ''}
                    onChange={handleChange}
                    className="form-control text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">โทรศัพท์สำนักงาน</label>
                  <input
                    type="text"
                    name="extraOfficePhone"
                    value={formData.extraOfficePhone || ''}
                    onChange={handleChange}
                    className="form-control text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">E-mail Address</label>
                  <input
                    type="email"
                    name="extraEmail"
                    value={formData.extraEmail || formData.email || ''}
                    onChange={handleChange}
                    className="form-control text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Photo Upload Box & Officer Sign */}
        <div className="space-y-4">
          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 flex flex-col items-center text-center space-y-3">
            <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400">
              ภาพถ่ายครึ่งตัว หน้าตรงไม่สวมหมวก
            </h5>
            <p className="text-[10px] text-slate-400">(ขนาดมาตรฐาน ๔.๕ x ๖ ซม.)</p>

            {/* Photo Box */}
            <div className="w-36 h-48 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden flex flex-col items-center justify-center relative shadow-xs">
              {formData.photoUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.photoUrl}
                    alt="รูปถ่าย รปภ.1"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, photoUrl: '' }))}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center shadow-md hover:bg-rose-500"
                    title="ลบรูป"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </>
              ) : (
                <div className="p-3 text-center space-y-1">
                  <i className="fa-regular fa-image text-3xl text-slate-300 dark:text-slate-600"></i>
                  <p className="text-[10px] text-slate-400">ขนาด 4.5 x 6 ซม.</p>
                </div>
              )}
            </div>

            <label className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all">
              <i className="fa-solid fa-camera text-xs"></i>
              <span>{formData.photoUrl ? 'เปลี่ยนรูปถ่าย' : 'อัปโหลดรูปถ่าย'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="sr-only"
              />
            </label>
          </div>

          {/* Officer Verification */}
          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-2 text-xs">
            <h6 className="font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-200/60 dark:border-slate-700/60">
              เจ้าหน้าที่ควบคุมการบันทึกประวัติ
            </h6>
            <div>
              <label className="block text-[10px] text-slate-500 mb-0.5">ยศ ชื่อตัว ชื่อสกุล</label>
              <input
                type="text"
                name="extraOfficerName"
                value={formData.extraOfficerName || formData.inspectorRankName || ''}
                onChange={handleChange}
                placeholder="ยศ ชื่อ สกุล"
                className="form-control text-xs p-1.5"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-0.5">ตำแหน่ง</label>
              <input
                type="text"
                name="extraOfficerPosition"
                value={formData.extraOfficerPosition || formData.inspectorPosition || ''}
                onChange={handleChange}
                placeholder="ตำแหน่งเจ้าหน้าที่"
                className="form-control text-xs p-1.5"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-0.5">วัน เดือน ปี ที่บันทึก</label>
              <input
                type="text"
                name="extraOfficerSignatureDate"
                value={formData.extraOfficerSignatureDate || formData.inspectorSignatureDate || ''}
                onChange={handleChange}
                placeholder="เช่น 15 มี.ค. 2567"
                className="form-control text-xs p-1.5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
