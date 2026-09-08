'use client';

import React from 'react';
import { Rpb1FormData, Address15YearItem, EducationItem, SpecialActivityItem } from '../types';

interface PageProps {
  formData: Rpb1FormData;
  setFormData: React.Dispatch<React.SetStateAction<Rpb1FormData>>;
}

export default function Page2Education({ formData, setFormData }: PageProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  // 15 Years Address table helpers
  const addAddress15 = () => {
    const item: Address15YearItem = {
      fromYear: '',
      toYear: '',
      houseNo: '',
      soi: '',
      road: '',
      subdistrict: '',
      district: '',
      province: '',
      country: 'ไทย',
    };
    setFormData((prev) => ({ ...prev, addressesPast15Years: [...prev.addressesPast15Years, item] }));
  };

  const removeAddress15 = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      addressesPast15Years: prev.addressesPast15Years.filter((_, i) => i !== index),
    }));
  };

  const updateAddress15 = (index: number, field: keyof Address15YearItem, value: string) => {
    setFormData((prev) => {
      const list = [...prev.addressesPast15Years];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, addressesPast15Years: list };
    });
  };

  // Education table helpers
  const addEducation = () => {
    const item: EducationItem = {
      fromYear: '',
      toYear: '',
      schoolName: '',
      degree: '',
      major: '',
      gpa: '',
    };
    setFormData((prev) => ({ ...prev, educations: [...prev.educations, item] }));
  };

  const removeEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index),
    }));
  };

  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    setFormData((prev) => {
      const list = [...prev.educations];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, educations: list };
    });
  };

  // Special activities table helpers
  const addActivity = () => {
    const item: SpecialActivityItem = {
      fromYear: '',
      toYear: '',
      schoolName: '',
      positionRole: '',
    };
    setFormData((prev) => ({ ...prev, specialActivities: [...prev.specialActivities, item] }));
  };

  const removeActivity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specialActivities: prev.specialActivities.filter((_, i) => i !== index),
    }));
  };

  const updateActivity = (index: number, field: keyof SpecialActivityItem, value: string) => {
    setFormData((prev) => {
      const list = [...prev.specialActivities];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, specialActivities: list };
    });
  };

  return (
    <div className="space-y-6 font-prompt animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-xs flex items-center justify-center">
            2
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            หน้า ๒ — รูปพรรณ, ที่อยู่ในรอบ ๑๕ ปี, ประวัติการศึกษา และกิจกรรม (หมวด ๘ - ๑๑)
          </h4>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
          (ชั้นความลับ: {formData.classification || 'ลับ'})
        </span>
      </div>

      {/* Section 8: Physical traits */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
        <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
          <i className="fa-solid fa-child"></i>
          <span>๘. ข้อมูลรูปพรรณสัณฐาน</span>
        </h5>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ส่วนสูง (ซม.)</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="เช่น 175"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">น้ำหนัก (กก.)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="เช่น 68"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">กลุ่มเลือด</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup || ''}
              onChange={handleChange}
              className="form-control text-xs"
            >
              <option value="">-- เลือกกลุ่มเลือด --</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ตำหนิ / แผลเป็น</label>
            <input
              type="text"
              name="scarsDistinguishingMarks"
              value={formData.scarsDistinguishingMarks || ''}
              onChange={handleChange}
              placeholder="เช่น ไฝที่แก้มขวา หรือ ไม่มี"
              className="form-control text-xs"
            />
          </div>
        </div>
      </div>

      {/* Section 9: 15 Years Address */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left"></i>
            <span>๙. ที่อยู่ในระยะ ๑๕ ปี ที่ผ่านมา (กรอกตามลำดับก่อน-หลัง)</span>
          </h5>
          <button
            type="button"
            onClick={addAddress15}
            className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-semibold rounded-lg shadow-xs flex items-center gap-1"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>เพิ่มที่อยู่</span>
          </button>
        </div>

        {formData.addressesPast15Years.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            ยังไม่มีรายการประวัติที่อยู่ (กดปุ่ม &quot;เพิ่มที่อยู่&quot; ด้านบนเพื่อบันทึก)
          </p>
        ) : (
          <div className="space-y-2.5">
            {formData.addressesPast15Years.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 relative"
              >
                <button
                  type="button"
                  onClick={() => removeAddress15(idx)}
                  className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 text-xs p-1"
                  title="ลบแถวนี้"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-9 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ปี พ.ศ. (จาก)</label>
                    <input
                      type="text"
                      placeholder="2554"
                      value={item.fromYear}
                      onChange={(e) => updateAddress15(idx, 'fromYear', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ปี พ.ศ. (ถึง)</label>
                    <input
                      type="text"
                      placeholder="2560"
                      value={item.toYear}
                      onChange={(e) => updateAddress15(idx, 'toYear', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">บ้านเลขที่</label>
                    <input
                      type="text"
                      value={item.houseNo}
                      onChange={(e) => updateAddress15(idx, 'houseNo', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ตรอก/ซอย</label>
                    <input
                      type="text"
                      value={item.soi}
                      onChange={(e) => updateAddress15(idx, 'soi', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ถนน</label>
                    <input
                      type="text"
                      value={item.road}
                      onChange={(e) => updateAddress15(idx, 'road', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ตำบล/แขวง</label>
                    <input
                      type="text"
                      value={item.subdistrict}
                      onChange={(e) => updateAddress15(idx, 'subdistrict', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">อำเภอ/เขต</label>
                    <input
                      type="text"
                      value={item.district}
                      onChange={(e) => updateAddress15(idx, 'district', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">จังหวัด</label>
                    <input
                      type="text"
                      value={item.province}
                      onChange={(e) => updateAddress15(idx, 'province', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ประเทศ</label>
                    <input
                      type="text"
                      value={item.country}
                      onChange={(e) => updateAddress15(idx, 'country', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 10: Education */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <i className="fa-solid fa-graduation-cap"></i>
            <span>๑๐. ประวัติการศึกษา (กรอกตามลำดับก่อน-หลัง)</span>
          </h5>
          <button
            type="button"
            onClick={addEducation}
            className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-semibold rounded-lg shadow-xs flex items-center gap-1"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>เพิ่มประวัติการศึกษา</span>
          </button>
        </div>

        {formData.educations.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            ยังไม่มีรายการประวัติการศึกษา
          </p>
        ) : (
          <div className="space-y-2.5">
            {formData.educations.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 relative"
              >
                <button
                  type="button"
                  onClick={() => removeEducation(idx)}
                  className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 text-xs p-1"
                  title="ลบแถวนี้"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ปี พ.ศ. (จาก)</label>
                    <input
                      type="text"
                      placeholder="2550"
                      value={item.fromYear}
                      onChange={(e) => updateEducation(idx, 'fromYear', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ปี พ.ศ. (ถึง)</label>
                    <input
                      type="text"
                      placeholder="2554"
                      value={item.toYear}
                      onChange={(e) => updateEducation(idx, 'toYear', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-500 mb-0.5">ชื่อสถานศึกษา</label>
                    <input
                      type="text"
                      placeholder="เช่น โรงเรียนนายเรืออากาศฯ / ม.เกษตรศาสตร์"
                      value={item.schoolName}
                      onChange={(e) => updateEducation(idx, 'schoolName', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">วุฒิ / สาขาวิชาเอก</label>
                    <input
                      type="text"
                      placeholder="วศ.บ. (วิศวกรรมอากาศยาน)"
                      value={item.degree}
                      onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">เกรดเฉลี่ย (GPA)</label>
                    <input
                      type="text"
                      placeholder="3.25"
                      value={item.gpa}
                      onChange={(e) => updateEducation(idx, 'gpa', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 11: Special Activities */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <i className="fa-solid fa-medal"></i>
            <span>๑๑. กิจกรรมพิเศษในสถานศึกษา (กรรมการนักเรียน/ประธานกีฬา/หน้าที่อื่น ๆ)</span>
          </h5>
          <button
            type="button"
            onClick={addActivity}
            className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-semibold rounded-lg shadow-xs flex items-center gap-1"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>เพิ่มกิจกรรม</span>
          </button>
        </div>

        {formData.specialActivities.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            ยังไม่มีรายการกิจกรรมพิเศษ
          </p>
        ) : (
          <div className="space-y-2.5">
            {formData.specialActivities.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 relative"
              >
                <button
                  type="button"
                  onClick={() => removeActivity(idx)}
                  className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 text-xs p-1"
                  title="ลบแถวนี้"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ปี พ.ศ. (จาก)</label>
                    <input
                      type="text"
                      placeholder="2552"
                      value={item.fromYear}
                      onChange={(e) => updateActivity(idx, 'fromYear', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ปี พ.ศ. (ถึง)</label>
                    <input
                      type="text"
                      placeholder="2554"
                      value={item.toYear}
                      onChange={(e) => updateActivity(idx, 'toYear', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ชื่อสถานศึกษา</label>
                    <input
                      type="text"
                      placeholder="ชื่อโรงเรียน/มหาวิทยาลัย"
                      value={item.schoolName}
                      onChange={(e) => updateActivity(idx, 'schoolName', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ตำแหน่งหน้าที่ / กิจกรรม</label>
                    <input
                      type="text"
                      placeholder="เช่น ประธานนักเรียน, หัวหน้านักเรียนทหาร"
                      value={item.positionRole}
                      onChange={(e) => updateActivity(idx, 'positionRole', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
