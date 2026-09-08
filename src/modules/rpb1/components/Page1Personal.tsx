'use client';

import React from 'react';
import { Rpb1FormData } from '../types';

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
            หน้า ๑ — ข้อมูลส่วนบุคคล, การเกิด/สัญชาติ, ที่อยู่ และการติดต่อ (หมวด ๑ - ๗)
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
          <span>๑. ข้อมูลชื่อ-สกุล และอายุ</span>
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              คำนำหน้านาม / ยศ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="titleRank"
              value={formData.titleRank || ''}
              onChange={handleChange}
              placeholder="เช่น น.ท., ร.อ., นาย"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ชื่อตัว <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName || ''}
              onChange={handleChange}
              placeholder="ชื่อจริง"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ชื่อรอง (ถ้ามี)
            </label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName || ''}
              onChange={handleChange}
              placeholder="ชื่อรอง"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ชื่อสกุล <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleChange}
              placeholder="นามสกุล"
              className="form-control text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">เพศ</label>
            <select
              name="gender"
              value={formData.gender || ''}
              onChange={handleChange}
              className="form-control text-xs"
            >
              <option value="">-- เลือกเพศ --</option>
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">อายุ (ปี)</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="เช่น 35"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ชื่อเล่นหรือชื่ออื่น ๆ</label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname || ''}
              onChange={handleChange}
              placeholder="ชื่อเล่น"
              className="form-control text-xs"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Former Names */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
        <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
          <i className="fa-solid fa-signature"></i>
          <span>๒. ประวัติการเปลี่ยนชื่อ-ชื่อสกุล</span>
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ชื่อตัวเดิม (ถ้ามี)</label>
            <input
              type="text"
              name="formerFirstName"
              value={formData.formerFirstName || ''}
              onChange={handleChange}
              placeholder="ชื่อเดิมก่อนเปลี่ยน"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หลักฐานการเปลี่ยนชื่อ</label>
            <input
              type="text"
              name="nameChangeDoc"
              value={formData.nameChangeDoc || ''}
              onChange={handleChange}
              placeholder="เช่น ใบสำคัญเปลี่ยนชื่อ ช.๓ เลขที่..."
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ชื่อสกุลเดิม (ถ้ามี)</label>
            <input
              type="text"
              name="formerLastName"
              value={formData.formerLastName || ''}
              onChange={handleChange}
              placeholder="สกุลเดิมก่อนเปลี่ยน"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หลักฐานการเปลี่ยนชื่อสกุล</label>
            <input
              type="text"
              name="lastNameChangeDoc"
              value={formData.lastNameChangeDoc || ''}
              onChange={handleChange}
              placeholder="เช่น ใบสำคัญเปลี่ยนชื่อสกุล ช.๒ เลขที่..."
              className="form-control text-xs"
            />
          </div>
        </div>
      </div>

      {/* Section 3 & 4: Citizen ID, Birth & Nationality */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
        <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
          <i className="fa-solid fa-id-card"></i>
          <span>๓. และ ๔. เลขประจำตัวประชาชน และการเกิด/สัญชาติ/ศาสนา</span>
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              เลขประจำตัวประชาชน (13 หลัก) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="citizenId"
              maxLength={13}
              value={formData.citizenId || ''}
              onChange={handleChange}
              placeholder="13 หลักตัวเลขล้วน"
              className="form-control text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">วัน เดือน ปี เกิด</label>
            <input
              type="text"
              name="dateOfBirth"
              value={formData.dateOfBirth || ''}
              onChange={handleChange}
              placeholder="เช่น 15 มีนาคม 2535 หรือ 1992-03-15"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">สถานที่จดทะเบียนเกิด / โรงพยาบาล</label>
            <input
              type="text"
              name="birthPlaceHospital"
              value={formData.birthPlaceHospital || ''}
              onChange={handleChange}
              placeholder="รพ.ภูมิพลอดุลยเดช หรือ เขตดอนเมือง"
              className="form-control text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">เชื้อชาติ</label>
            <input
              type="text"
              name="race"
              value={formData.race || 'ไทย'}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">สัญชาติ</label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality || 'ไทย'}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">สัญชาติเดิม (ถ้ามี)</label>
            <input
              type="text"
              name="formerNationality"
              value={formData.formerNationality || ''}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ศาสนาปัจจุบัน</label>
            <input
              type="text"
              name="religion"
              value={formData.religion || 'พุทธ'}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ศาสนาเดิม</label>
            <input
              type="text"
              name="formerReligion"
              value={formData.formerReligion || ''}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หลักฐานการแปลงสัญชาติ</label>
            <input
              type="text"
              name="naturalizationDoc"
              value={formData.naturalizationDoc || ''}
              onChange={handleChange}
              placeholder="เลขที่หลักฐาน"
              className="form-control text-xs"
            />
          </div>
        </div>
      </div>

      {/* Section 5: Registered Address */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
        <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
          <i className="fa-solid fa-house"></i>
          <span>๕. ที่อยู่ตามทะเบียนบ้าน</span>
        </h5>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">บ้านเลขที่</label>
            <input
              type="text"
              name="registeredHouseNo"
              value={formData.registeredHouseNo || ''}
              onChange={handleChange}
              placeholder="123/45"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หมู่บ้าน</label>
            <input
              type="text"
              name="registeredVillage"
              value={formData.registeredVillage || ''}
              onChange={handleChange}
              placeholder="ชื่อหมู่บ้าน/อาคาร"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หมู่ที่</label>
            <input
              type="text"
              name="registeredMoo"
              value={formData.registeredMoo || ''}
              onChange={handleChange}
              placeholder="เช่น 1"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ตรอก/ซอย</label>
            <input
              type="text"
              name="registeredSoi"
              value={formData.registeredSoi || ''}
              onChange={handleChange}
              placeholder="เช่น พหลโยธิน 54"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ถนน</label>
            <input
              type="text"
              name="registeredRoad"
              value={formData.registeredRoad || ''}
              onChange={handleChange}
              placeholder="เช่น ถนนพหลโยธิน"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ตำบล/แขวง</label>
            <input
              type="text"
              name="registeredSubdistrict"
              value={formData.registeredSubdistrict || ''}
              onChange={handleChange}
              placeholder="คลองถนน"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">อำเภอ/เขต</label>
            <input
              type="text"
              name="registeredDistrict"
              value={formData.registeredDistrict || ''}
              onChange={handleChange}
              placeholder="สายไหม"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">จังหวัด</label>
            <input
              type="text"
              name="registeredProvince"
              value={formData.registeredProvince || ''}
              onChange={handleChange}
              placeholder="กรุงเทพมหานคร"
              className="form-control text-xs"
            />
          </div>
        </div>
      </div>

      {/* Section 6: Current Address & Contacts */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <i className="fa-solid fa-location-dot"></i>
            <span>๖. ที่อยู่ปัจจุบัน และช่องทางการติดต่อ</span>
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">บ้านเลขที่</label>
            <input
              type="text"
              name="currentHouseNo"
              value={formData.currentHouseNo || ''}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หมู่บ้าน</label>
            <input
              type="text"
              name="currentVillage"
              value={formData.currentVillage || ''}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หมู่ที่</label>
            <input
              type="text"
              name="currentMoo"
              value={formData.currentMoo || ''}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ตรอก/ซอย</label>
            <input
              type="text"
              name="currentSoi"
              value={formData.currentSoi || ''}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ถนน</label>
            <input
              type="text"
              name="currentRoad"
              value={formData.currentRoad || ''}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ตำบล/แขวง</label>
            <input
              type="text"
              name="currentSubdistrict"
              value={formData.currentSubdistrict || ''}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">อำเภอ/เขต</label>
            <input
              type="text"
              name="currentDistrict"
              value={formData.currentDistrict || ''}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">จังหวัด</label>
            <input
              type="text"
              name="currentProvince"
              value={formData.currentProvince || ''}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
        </div>

        {/* Contact info */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">โทรศัพท์บ้าน / สำนักงาน</label>
            <input
              type="text"
              name="phoneLandline"
              value={formData.phoneLandline || ''}
              onChange={handleChange}
              placeholder="02-xxx-xxxx"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">โทรศัพท์มือถือ</label>
            <input
              type="text"
              name="phoneMobile"
              value={formData.phoneMobile || ''}
              onChange={handleChange}
              placeholder="08x-xxx-xxxx"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="user@domain.com"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Line ID</label>
            <input
              type="text"
              name="lineId"
              value={formData.lineId || ''}
              onChange={handleChange}
              placeholder="ไอดีไลน์"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Facebook</label>
            <input
              type="text"
              name="facebook"
              value={formData.facebook || ''}
              onChange={handleChange}
              placeholder="ลิงก์หรือชื่อโปรไฟล์"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Instagram</label>
            <input
              type="text"
              name="instagram"
              value={formData.instagram || ''}
              onChange={handleChange}
              placeholder="@username"
              className="form-control text-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ช่องทางติดต่ออื่น ๆ</label>
            <input
              type="text"
              name="otherContact"
              value={formData.otherContact || ''}
              onChange={handleChange}
              placeholder="ระบุเพิ่มเติม"
              className="form-control text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
