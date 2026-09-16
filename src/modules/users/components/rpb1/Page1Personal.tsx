'use client';

import React from 'react';
import { Rpb1FormData } from '../../types';
import { DatePicker } from '@/components/ui';

interface PageProps {
  formData: Rpb1FormData;
  setFormData: React.Dispatch<React.SetStateAction<Rpb1FormData>>;
}

export default function Page1Personal({ formData, setFormData }: PageProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6 font-prompt animate-fade-in">
      {/* Page Header Indicator */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-xs flex items-center justify-center">
            1
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            หน้า 1 — ข้อมูลส่วนบุคคล, การเกิด/สัญชาติ, ที่อยู่ และการติดต่อ (หมวด 1 - 7)
          </h4>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
          (ชั้นความลับ: {formData.classification || 'ลับ'})
        </span>
      </div>

      {/* Section 1: Name & Basic Info */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
        <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
          <i className="fa-solid fa-user"></i>
          <span>1. ข้อมูลชื่อ-สกุล และอายุ</span>
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label htmlFor="rpb1_titleRank" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              คำนำหน้านาม / ยศ <span className="text-rose-500">*</span>
            </label>
            <input
              id="rpb1_titleRank"
              type="text"
              name="titleRank"
              value={formData.titleRank || ''}
              onChange={handleChange}
              placeholder="เช่น น.ท., ร.อ., นาย"
              aria-label="คำนำหน้านาม หรือ ยศ"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_firstName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ชื่อตัว <span className="text-rose-500">*</span>
            </label>
            <input
              id="rpb1_firstName"
              type="text"
              name="firstName"
              value={formData.firstName || ''}
              onChange={handleChange}
              placeholder="ชื่อจริง"
              aria-label="ชื่อจริง"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_middleName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ชื่อรอง (ถ้ามี)
            </label>
            <input
              id="rpb1_middleName"
              type="text"
              name="middleName"
              value={formData.middleName || ''}
              onChange={handleChange}
              placeholder="ชื่อรอง"
              aria-label="ชื่อรอง"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_lastName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ชื่อสกุล <span className="text-rose-500">*</span>
            </label>
            <input
              id="rpb1_lastName"
              type="text"
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleChange}
              placeholder="นามสกุล"
              aria-label="นามสกุล"
              className="form-input text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="rpb1_gender" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">เพศ</label>
            <select
              id="rpb1_gender"
              name="gender"
              value={formData.gender || ''}
              onChange={handleChange}
              aria-label="เลือกเพศ"
              className="form-select text-xs"
            >
              <option value="">-- เลือกเพศ --</option>
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
            </select>
          </div>
          <div>
            <label htmlFor="rpb1_age" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">อายุ (ปี)</label>
            <input
              id="rpb1_age"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="เช่น 35"
              aria-label="อายุเป็นจำนวนปี"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_nickname" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ชื่อเล่นหรือชื่ออื่น ๆ</label>
            <input
              id="rpb1_nickname"
              type="text"
              name="nickname"
              value={formData.nickname || ''}
              onChange={handleChange}
              placeholder="ชื่อเล่น"
              aria-label="ชื่อเล่นหรือชื่ออื่น ๆ"
              className="form-input text-xs"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Former Names */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
        <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
          <i className="fa-solid fa-signature"></i>
          <span>2. ประวัติการเปลี่ยนชื่อ-ชื่อสกุล</span>
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="rpb1_formerFirstName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ชื่อตัวเดิม (ถ้ามี)</label>
            <input
              id="rpb1_formerFirstName"
              type="text"
              name="formerFirstName"
              value={formData.formerFirstName || ''}
              onChange={handleChange}
              placeholder="ชื่อเดิมก่อนเปลี่ยน"
              aria-label="ชื่อตัวเดิม"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_nameChangeDoc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หลักฐานการเปลี่ยนชื่อ</label>
            <input
              id="rpb1_nameChangeDoc"
              type="text"
              name="nameChangeDoc"
              value={formData.nameChangeDoc || ''}
              onChange={handleChange}
              placeholder="เช่น ใบสำคัญเปลี่ยนชื่อ ช.3 เลขที่..."
              aria-label="หลักฐานการเปลี่ยนชื่อ"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_formerLastName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ชื่อสกุลเดิม (ถ้ามี)</label>
            <input
              id="rpb1_formerLastName"
              type="text"
              name="formerLastName"
              value={formData.formerLastName || ''}
              onChange={handleChange}
              placeholder="สกุลเดิมก่อนเปลี่ยน"
              aria-label="ชื่อสกุลเดิม"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_lastNameChangeDoc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หลักฐานการเปลี่ยนชื่อสกุล</label>
            <input
              id="rpb1_lastNameChangeDoc"
              type="text"
              name="lastNameChangeDoc"
              value={formData.lastNameChangeDoc || ''}
              onChange={handleChange}
              placeholder="เช่น ใบสำคัญเปลี่ยนชื่อสกุล ช.2 เลขที่..."
              aria-label="หลักฐานการเปลี่ยนชื่อสกุล"
              className="form-input text-xs"
            />
          </div>
        </div>
      </div>

      {/* Section 3 & 4: Citizen ID, Birth & Nationality */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
        <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
          <i className="fa-solid fa-id-card"></i>
          <span>3. และ 4. เลขประจำตัวประชาชน และการเกิด/สัญชาติ/ศาสนา</span>
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label htmlFor="rpb1_citizenId" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              เลขประจำตัวประชาชน (13 หลัก) <span className="text-rose-500">*</span>
            </label>
            <input
              id="rpb1_citizenId"
              type="text"
              name="citizenId"
              maxLength={13}
              value={formData.citizenId || ''}
              onChange={handleChange}
              placeholder="13 หลักตัวเลขล้วน"
              aria-label="เลขประจำตัวประชาชน 13 หลัก"
              className="form-input text-xs font-mono"
            />
          </div>
          <div>
            <DatePicker
              id="rpb1_dateOfBirth"
              name="dateOfBirth"
              label="วัน เดือน ปี เกิด"
              value={formData.dateOfBirth || ''}
              onChange={(val) => setFormData((prev) => ({ ...prev, dateOfBirth: val }))}
              placeholder="เลือกวันเกิด (พ.ศ.)"
            />
          </div>
          <div>
            <label htmlFor="rpb1_birthPlaceHospital" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">สถานที่จดทะเบียนเกิด / โรงพยาบาล</label>
            <input
              id="rpb1_birthPlaceHospital"
              type="text"
              name="birthPlaceHospital"
              value={formData.birthPlaceHospital || ''}
              onChange={handleChange}
              placeholder="รพ.ภูมิพลอดุลยเดช หรือ เขตดอนเมือง"
              aria-label="สถานที่จดทะเบียนเกิด หรือ โรงพยาบาล"
              className="form-input text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div>
            <label htmlFor="rpb1_race" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">เชื้อชาติ</label>
            <input
              id="rpb1_race"
              type="text"
              name="race"
              value={formData.race || 'ไทย'}
              onChange={handleChange}
              aria-label="เชื้อชาติ"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_nationality" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">สัญชาติ</label>
            <input
              id="rpb1_nationality"
              type="text"
              name="nationality"
              value={formData.nationality || 'ไทย'}
              onChange={handleChange}
              aria-label="สัญชาติ"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_formerNationality" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">สัญชาติเดิม (ถ้ามี)</label>
            <input
              id="rpb1_formerNationality"
              type="text"
              name="formerNationality"
              value={formData.formerNationality || ''}
              onChange={handleChange}
              aria-label="สัญชาติเดิม"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_religion" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ศาสนาปัจจุบัน</label>
            <input
              id="rpb1_religion"
              type="text"
              name="religion"
              value={formData.religion || 'พุทธ'}
              onChange={handleChange}
              aria-label="ศาสนาปัจจุบัน"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_formerReligion" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ศาสนาเดิม</label>
            <input
              id="rpb1_formerReligion"
              type="text"
              name="formerReligion"
              value={formData.formerReligion || ''}
              onChange={handleChange}
              aria-label="ศาสนาเดิม"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_naturalizationDoc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หลักฐานการแปลงสัญชาติ</label>
            <input
              id="rpb1_naturalizationDoc"
              type="text"
              name="naturalizationDoc"
              value={formData.naturalizationDoc || ''}
              onChange={handleChange}
              placeholder="เลขที่หลักฐาน"
              aria-label="หลักฐานการแปลงสัญชาติ"
              className="form-input text-xs"
            />
          </div>
        </div>
      </div>

      {/* Section 5: Registered Address */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
        <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
          <i className="fa-solid fa-house"></i>
          <span>5. ที่อยู่ตามทะเบียนบ้าน</span>
        </h5>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div>
            <label htmlFor="rpb1_reg_houseNo" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">บ้านเลขที่</label>
            <input
              id="rpb1_reg_houseNo"
              type="text"
              name="registeredHouseNo"
              value={formData.registeredHouseNo || ''}
              onChange={handleChange}
              placeholder="123/45"
              aria-label="บ้านเลขที่ตามทะเบียนบ้าน"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_reg_village" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หมู่บ้าน</label>
            <input
              id="rpb1_reg_village"
              type="text"
              name="registeredVillage"
              value={formData.registeredVillage || ''}
              onChange={handleChange}
              placeholder="ชื่อหมู่บ้าน/อาคาร"
              aria-label="หมู่บ้านตามทะเบียนบ้าน"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_reg_moo" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หมู่ที่</label>
            <input
              id="rpb1_reg_moo"
              type="text"
              name="registeredMoo"
              value={formData.registeredMoo || ''}
              onChange={handleChange}
              placeholder="เช่น 1"
              aria-label="หมู่ที่ตามทะเบียนบ้าน"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_reg_soi" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ตรอก/ซอย</label>
            <input
              id="rpb1_reg_soi"
              type="text"
              name="registeredSoi"
              value={formData.registeredSoi || ''}
              onChange={handleChange}
              placeholder="เช่น พหลโยธิน 54"
              aria-label="ตรอก หรือ ซอยตามทะเบียนบ้าน"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_reg_road" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ถนน</label>
            <input
              id="rpb1_reg_road"
              type="text"
              name="registeredRoad"
              value={formData.registeredRoad || ''}
              onChange={handleChange}
              placeholder="เช่น ถนนพหลโยธิน"
              aria-label="ถนนตามทะเบียนบ้าน"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_reg_subdistrict" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ตำบล/แขวง</label>
            <input
              id="rpb1_reg_subdistrict"
              type="text"
              name="registeredSubdistrict"
              value={formData.registeredSubdistrict || ''}
              onChange={handleChange}
              placeholder="คลองถนน"
              aria-label="ตำบล หรือ แขวงตามทะเบียนบ้าน"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_reg_district" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">อำเภอ/เขต</label>
            <input
              id="rpb1_reg_district"
              type="text"
              name="registeredDistrict"
              value={formData.registeredDistrict || ''}
              onChange={handleChange}
              placeholder="สายไหม"
              aria-label="อำเภอ หรือ เขตตามทะเบียนบ้าน"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_reg_province" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">จังหวัด</label>
            <input
              id="rpb1_reg_province"
              type="text"
              name="registeredProvince"
              value={formData.registeredProvince || ''}
              onChange={handleChange}
              placeholder="กรุงเทพมหานคร"
              aria-label="จังหวัดตามทะเบียนบ้าน"
              className="form-input text-xs"
            />
          </div>
        </div>
      </div>

      {/* Section 6: Current Address & Contacts */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <i className="fa-solid fa-location-dot"></i>
            <span>6. ที่อยู่ปัจจุบัน และช่องทางการติดต่อ</span>
          </h5>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                currentHouseNo: prev.registeredHouseNo,
                currentVillage: prev.registeredVillage,
                currentMoo: prev.registeredMoo,
                currentSoi: prev.registeredSoi,
                currentRoad: prev.registeredRoad,
                currentSubdistrict: prev.registeredSubdistrict,
                currentDistrict: prev.registeredDistrict,
                currentProvince: prev.registeredProvince,
                currentPhone: prev.registeredPhone,
              }));
            }}
            className="text-[11px] text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            <i className="fa-solid fa-copy"></i>
            <span>คัดลอกที่อยู่จากทะเบียนบ้าน</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div>
            <label htmlFor="rpb1_cur_houseNo" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">บ้านเลขที่</label>
            <input
              id="rpb1_cur_houseNo"
              type="text"
              name="currentHouseNo"
              value={formData.currentHouseNo || ''}
              onChange={handleChange}
              aria-label="บ้านเลขที่ปัจจุบัน"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_cur_village" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หมู่บ้าน</label>
            <input
              id="rpb1_cur_village"
              type="text"
              name="currentVillage"
              value={formData.currentVillage || ''}
              onChange={handleChange}
              aria-label="หมู่บ้านปัจจุบัน"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_cur_moo" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หมู่ที่</label>
            <input
              id="rpb1_cur_moo"
              type="text"
              name="currentMoo"
              value={formData.currentMoo || ''}
              onChange={handleChange}
              aria-label="หมู่ที่ปัจจุบัน"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_cur_soi" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ตรอก/ซอย</label>
            <input
              id="rpb1_cur_soi"
              type="text"
              name="currentSoi"
              value={formData.currentSoi || ''}
              onChange={handleChange}
              aria-label="ตรอก หรือ ซอยปัจจุบัน"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_cur_road" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ถนน</label>
            <input
              id="rpb1_cur_road"
              type="text"
              name="currentRoad"
              value={formData.currentRoad || ''}
              onChange={handleChange}
              aria-label="ถนนปัจจุบัน"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_cur_subdistrict" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ตำบล/แขวง</label>
            <input
              id="rpb1_cur_subdistrict"
              type="text"
              name="currentSubdistrict"
              value={formData.currentSubdistrict || ''}
              onChange={handleChange}
              aria-label="ตำบล หรือ แขวงปัจจุบัน"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_cur_district" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">อำเภอ/เขต</label>
            <input
              id="rpb1_cur_district"
              type="text"
              name="currentDistrict"
              value={formData.currentDistrict || ''}
              onChange={handleChange}
              aria-label="อำเภอ หรือ เขตปัจจุบัน"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_cur_province" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">จังหวัด</label>
            <input
              id="rpb1_cur_province"
              type="text"
              name="currentProvince"
              value={formData.currentProvince || ''}
              onChange={handleChange}
              aria-label="จังหวัดปัจจุบัน"
              className="form-input text-xs"
            />
          </div>
        </div>

        {/* Contact info */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label htmlFor="rpb1_phoneLandline" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">โทรศัพท์บ้าน / สำนักงาน</label>
            <input
              id="rpb1_phoneLandline"
              type="text"
              name="phoneLandline"
              value={formData.phoneLandline || ''}
              onChange={handleChange}
              placeholder="02-xxx-xxxx"
              aria-label="โทรศัพท์บ้าน หรือ สำนักงาน"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_phoneMobile" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">โทรศัพท์มือถือ</label>
            <input
              id="rpb1_phoneMobile"
              type="text"
              name="phoneMobile"
              value={formData.phoneMobile || ''}
              onChange={handleChange}
              placeholder="08x-xxx-xxxx"
              aria-label="โทรศัพท์มือถือ"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              id="rpb1_email"
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="user@domain.com"
              aria-label="อีเมล"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_lineId" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Line ID</label>
            <input
              id="rpb1_lineId"
              type="text"
              name="lineId"
              value={formData.lineId || ''}
              onChange={handleChange}
              placeholder="ไอดีไลน์"
              aria-label="ไอดีไลน์"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_facebook" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Facebook</label>
            <input
              id="rpb1_facebook"
              type="text"
              name="facebook"
              value={formData.facebook || ''}
              onChange={handleChange}
              placeholder="ลิงก์หรือชื่อโปรไฟล์"
              aria-label="เฟสบุ๊ค"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_instagram" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Instagram</label>
            <input
              id="rpb1_instagram"
              type="text"
              name="instagram"
              value={formData.instagram || ''}
              onChange={handleChange}
              placeholder="@username"
              aria-label="อินสตาแกรม"
              className="form-input text-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="rpb1_otherContact" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ช่องทางติดต่ออื่น ๆ</label>
            <input
              id="rpb1_otherContact"
              type="text"
              name="otherContact"
              value={formData.otherContact || ''}
              onChange={handleChange}
              placeholder="ระบุเพิ่มเติม"
              aria-label="ช่องทางติดต่ออื่น ๆ"
              className="form-input text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
