'use client';

import React from 'react';
import { Rpb1FormData, LanguageItem, WorkHistoryItem } from '../../types';

interface PageProps {
  formData: Rpb1FormData;
  setFormData: React.Dispatch<React.SetStateAction<Rpb1FormData>>;
}

export default function Page3WorkMilitary({ formData, setFormData }: PageProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Language table helpers
  const addLanguage = () => {
    const item: LanguageItem = {
      language: '',
      readLevel: 'ดี',
      listenLevel: 'ดี',
      writeLevel: 'ดี',
      speakLevel: 'ดี',
    };
    setFormData((prev) => ({ ...prev, languages: [...prev.languages, item] }));
  };

  const removeLanguage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  const updateLanguage = (index: number, field: keyof LanguageItem, value: any) => {
    setFormData((prev) => {
      const list = [...prev.languages];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, languages: list };
    });
  };

  // Work History table helpers
  const addWork = () => {
    const item: WorkHistoryItem = {
      fromYear: '',
      toYear: '',
      employerOrAgency: '',
      position: '',
      reasonForLeaving: '',
      locationPhone: '',
    };
    setFormData((prev) => ({ ...prev, workHistory: [...prev.workHistory, item] }));
  };

  const removeWork = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      workHistory: prev.workHistory.filter((_, i) => i !== index),
    }));
  };

  const updateWork = (index: number, field: keyof WorkHistoryItem, value: string) => {
    setFormData((prev) => {
      const list = [...prev.workHistory];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, workHistory: list };
    });
  };

  return (
    <div className="space-y-6 font-prompt animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-xs flex items-center justify-center">
            3
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            หน้า 3 — ทักษะภาษา, ประวัติการทำงาน และการรับราชการทหาร (หมวด 12 - 15)
          </h4>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
          (ชั้นความลับ: {formData.classification || 'ลับ'})
        </span>
      </div>

      {/* Section 12: Languages */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <i className="fa-solid fa-language"></i>
            <span>12. ความรู้ภาษาไทยถิ่น และภาษาต่างประเทศ (ดีมาก / ดี / พอใช้)</span>
          </h5>
          <button
            type="button"
            onClick={addLanguage}
            className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-semibold rounded-lg shadow-xs flex items-center gap-1"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>เพิ่มภาษา</span>
          </button>
        </div>

        <div className="space-y-2">
          {formData.languages.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 relative"
            >
              <div className="flex-1">
                <label htmlFor={`rpb1_p3_lang_${idx}`} className="sr-only">
                  ภาษา ({idx + 1})
                </label>
                <input
                  id={`rpb1_p3_lang_${idx}`}
                  type="text"
                  placeholder="เช่น ภาษาอังกฤษ, ภาษาจีน, ภาษาอีสาน"
                  value={item.language}
                  onChange={(e) => updateLanguage(idx, 'language', e.target.value)}
                  aria-label={`ภาษา (${idx + 1})`}
                  className="form-input text-xs p-1.5"
                />
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs w-full sm:w-auto">
                <div>
                  <label htmlFor={`rpb1_p3_lang_read_${idx}`} className="sr-only">
                    ระดับการอ่าน ({idx + 1})
                  </label>
                  <select
                    id={`rpb1_p3_lang_read_${idx}`}
                    value={item.readLevel}
                    onChange={(e) => updateLanguage(idx, 'readLevel', e.target.value)}
                    aria-label={`ระดับการอ่าน (${idx + 1})`}
                    className="form-select text-xs p-1.5"
                  >
                    <option value="">อ่าน: -</option>
                    <option value="ดีมาก">อ่าน: ดีมาก</option>
                    <option value="ดี">อ่าน: ดี</option>
                    <option value="พอใช้">อ่าน: พอใช้</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={`rpb1_p3_lang_listen_${idx}`} className="sr-only">
                    ระดับการฟัง ({idx + 1})
                  </label>
                  <select
                    id={`rpb1_p3_lang_listen_${idx}`}
                    value={item.listenLevel}
                    onChange={(e) => updateLanguage(idx, 'listenLevel', e.target.value)}
                    aria-label={`ระดับการฟัง (${idx + 1})`}
                    className="form-select text-xs p-1.5"
                  >
                    <option value="">ฟัง: -</option>
                    <option value="ดีมาก">ฟัง: ดีมาก</option>
                    <option value="ดี">ฟัง: ดี</option>
                    <option value="พอใช้">ฟัง: พอใช้</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={`rpb1_p3_lang_write_${idx}`} className="sr-only">
                    ระดับการเขียน ({idx + 1})
                  </label>
                  <select
                    id={`rpb1_p3_lang_write_${idx}`}
                    value={item.writeLevel}
                    onChange={(e) => updateLanguage(idx, 'writeLevel', e.target.value)}
                    aria-label={`ระดับการเขียน (${idx + 1})`}
                    className="form-select text-xs p-1.5"
                  >
                    <option value="">เขียน: -</option>
                    <option value="ดีมาก">เขียน: ดีมาก</option>
                    <option value="ดี">เขียน: ดี</option>
                    <option value="พอใช้">เขียน: พอใช้</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={`rpb1_p3_lang_speak_${idx}`} className="sr-only">
                    ระดับการพูด ({idx + 1})
                  </label>
                  <select
                    id={`rpb1_p3_lang_speak_${idx}`}
                    value={item.speakLevel}
                    onChange={(e) => updateLanguage(idx, 'speakLevel', e.target.value)}
                    aria-label={`ระดับการพูด (${idx + 1})`}
                    className="form-select text-xs p-1.5"
                  >
                    <option value="">พูด: -</option>
                    <option value="ดีมาก">พูด: ดีมาก</option>
                    <option value="ดี">พูด: ดี</option>
                    <option value="พอใช้">พูด: พอใช้</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeLanguage(idx)}
                className="text-rose-500 hover:text-rose-700 text-xs p-1 shrink-0 self-end sm:self-center"
                title="ลบภาษา"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 13: Work History */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <i className="fa-solid fa-briefcase"></i>
            <span>13. ประวัติการทำงานหรือการรับราชการ (กรอกตามลำดับก่อน-หลัง)</span>
          </h5>
          <button
            type="button"
            onClick={addWork}
            className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-semibold rounded-lg shadow-xs flex items-center gap-1"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>เพิ่มประวัติการทำงาน</span>
          </button>
        </div>

        {formData.workHistory.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            ยังไม่มีรายการประวัติการทำงาน
          </p>
        ) : (
          <div className="space-y-2.5">
            {formData.workHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 relative"
              >
                <button
                  type="button"
                  onClick={() => removeWork(idx)}
                  className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 text-xs p-1"
                  title="ลบแถวนี้"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                  <div>
                    <label htmlFor={`rpb1_p3_work_fromYear_${idx}`} className="block text-[10px] text-slate-500 mb-0.5">ปี พ.ศ. (จาก)</label>
                    <input
                      id={`rpb1_p3_work_fromYear_${idx}`}
                      type="text"
                      placeholder="2556"
                      value={item.fromYear}
                      onChange={(e) => updateWork(idx, 'fromYear', e.target.value)}
                      aria-label={`ปี พ.ศ. (จาก) ลำดับ ${idx + 1}`}
                      className="form-input text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label htmlFor={`rpb1_p3_work_toYear_${idx}`} className="block text-[10px] text-slate-500 mb-0.5">ปี พ.ศ. (ถึง)</label>
                    <input
                      id={`rpb1_p3_work_toYear_${idx}`}
                      type="text"
                      placeholder="2560"
                      value={item.toYear}
                      onChange={(e) => updateWork(idx, 'toYear', e.target.value)}
                      aria-label={`ปี พ.ศ. (ถึง) ลำดับ ${idx + 1}`}
                      className="form-input text-xs p-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor={`rpb1_p3_work_employer_${idx}`} className="block text-[10px] text-slate-500 mb-0.5">นายจ้างหรือส่วนราชการ</label>
                    <input
                      id={`rpb1_p3_work_employer_${idx}`}
                      type="text"
                      placeholder="เช่น กองทัพอากาศ / บริษัท..."
                      value={item.employerOrAgency}
                      onChange={(e) => updateWork(idx, 'employerOrAgency', e.target.value)}
                      aria-label={`นายจ้างหรือส่วนราชการ ลำดับ ${idx + 1}`}
                      className="form-input text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label htmlFor={`rpb1_p3_work_position_${idx}`} className="block text-[10px] text-slate-500 mb-0.5">ตำแหน่งหน้าที่</label>
                    <input
                      id={`rpb1_p3_work_position_${idx}`}
                      type="text"
                      placeholder="เช่น นายทหารยุทธการ"
                      value={item.position}
                      onChange={(e) => updateWork(idx, 'position', e.target.value)}
                      aria-label={`ตำแหน่งหน้าที่ ลำดับ ${idx + 1}`}
                      className="form-input text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label htmlFor={`rpb1_p3_work_reason_${idx}`} className="block text-[10px] text-slate-500 mb-0.5">เหตุผลที่ออก/ย้าย</label>
                    <input
                      id={`rpb1_p3_work_reason_${idx}`}
                      type="text"
                      placeholder="ย้ายตามวาระ / เลื่อนตำแหน่ง"
                      value={item.reasonForLeaving}
                      onChange={(e) => updateWork(idx, 'reasonForLeaving', e.target.value)}
                      aria-label={`เหตุผลที่ออก/ย้าย ลำดับ ${idx + 1}`}
                      className="form-input text-xs p-1.5"
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <label htmlFor={`rpb1_p3_work_location_${idx}`} className="block text-[10px] text-slate-500 mb-0.5">ที่ตั้งหน่วยงานและหมายเลขโทรศัพท์</label>
                    <input
                      id={`rpb1_p3_work_location_${idx}`}
                      type="text"
                      placeholder="ระบุที่ตั้งและโทรศัพท์ของที่ทำงาน"
                      value={item.locationPhone}
                      onChange={(e) => updateWork(idx, 'locationPhone', e.target.value)}
                      aria-label={`ที่ตั้งหน่วยงานและหมายเลขโทรศัพท์ ลำดับ ${idx + 1}`}
                      className="form-input text-xs p-1.5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 14: Special Occupations & Hobbies */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-2">
        <label htmlFor="rpb1_p3_specialOccupationsHobbies" className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2 cursor-pointer">
          <i className="fa-solid fa-gamepad"></i>
          <span>14. อาชีพพิเศษอื่น ๆ และงานอดิเรก</span>
        </label>
        <textarea
          id="rpb1_p3_specialOccupationsHobbies"
          name="specialOccupationsHobbies"
          rows={2}
          value={formData.specialOccupationsHobbies || ''}
          onChange={handleChange}
          placeholder="เช่น นักกีฬายิงปืน, เล่นดนตรี, วิทยากรพิเศษ หรือ ไม่มี"
          aria-label="14. อาชีพพิเศษอื่น ๆ และงานอดิเรก"
          className="form-textarea text-xs"
        />
      </div>

      {/* Section 15: Military Service */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
        <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
          <i className="fa-solid fa-shield-halved"></i>
          <span>15. การรับราชการทหาร</span>
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="rpb1_p3_militaryStatus" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">สถานะทางทหารปัจจุบัน</label>
            <select
              id="rpb1_p3_militaryStatus"
              name="militaryStatus"
              value={formData.militaryStatus || 'ทหารประจำการ'}
              onChange={handleChange}
              aria-label="สถานะทางทหารปัจจุบัน"
              className="form-select text-xs"
            >
              <option value="ทหารประจำการ">ทหารประจำการ</option>
              <option value="ทหารกองหนุน">ทหารกองหนุน</option>
              <option value="กำลังพลสำรอง">กำลังพลสำรอง</option>
              <option value="ได้รับการยกเว้น">ได้รับการยกเว้น</option>
            </select>
          </div>
          <div>
            <label htmlFor="rpb1_p3_militaryRank" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ยศทหาร</label>
            <input
              id="rpb1_p3_militaryRank"
              type="text"
              name="militaryRank"
              value={formData.militaryRank || ''}
              onChange={handleChange}
              placeholder="เช่น น.ท."
              aria-label="ยศทหาร"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_p3_militaryRegNumber" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">เครื่องหมายทะเบียนทหาร</label>
            <input
              id="rpb1_p3_militaryRegNumber"
              type="text"
              name="militaryRegNumber"
              value={formData.militaryRegNumber || ''}
              onChange={handleChange}
              placeholder="เลขทะเบียนทหาร (ถ้ามี)"
              aria-label="เครื่องหมายทะเบียนทหาร"
              className="form-input text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label htmlFor="rpb1_p3_militaryBranchUnit" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">เหล่าและสังกัด</label>
            <input
              id="rpb1_p3_militaryBranchUnit"
              type="text"
              name="militaryBranchUnit"
              value={formData.militaryBranchUnit || ''}
              onChange={handleChange}
              placeholder="เช่น อ. (ทอ.), บน.6"
              aria-label="เหล่าและสังกัด"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_p3_militaryUnitLocation" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ที่ตั้งของหน่วย</label>
            <input
              id="rpb1_p3_militaryUnitLocation"
              type="text"
              name="militaryUnitLocation"
              value={formData.militaryUnitLocation || ''}
              onChange={handleChange}
              placeholder="ดอนเมือง กทม."
              aria-label="ที่ตั้งของหน่วย"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_p3_militaryServiceFrom" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">เข้าประจำการเมื่อ (ปี/วันที่)</label>
            <input
              id="rpb1_p3_militaryServiceFrom"
              type="text"
              name="militaryServiceFrom"
              value={formData.militaryServiceFrom || ''}
              onChange={handleChange}
              placeholder="เช่น 1 พ.ค. 2555"
              aria-label="เข้าประจำการเมื่อ (ปี/วันที่)"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_p3_militaryServiceTo" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ถึง (หรือ ปัจจุบัน)</label>
            <input
              id="rpb1_p3_militaryServiceTo"
              type="text"
              name="militaryServiceTo"
              value={formData.militaryServiceTo || ''}
              onChange={handleChange}
              placeholder="ปัจจุบัน"
              aria-label="ถึง (หรือ ปัจจุบัน)"
              className="form-input text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="rpb1_p3_militaryYearsServed" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">จำนวนปีที่รับราชการมาแล้ว</label>
            <input
              id="rpb1_p3_militaryYearsServed"
              type="text"
              name="militaryYearsServed"
              value={formData.militaryYearsServed || ''}
              onChange={handleChange}
              placeholder="เช่น 12 ปี"
              aria-label="จำนวนปีที่รับราชการมาแล้ว"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_p3_militaryLastCommander" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ผู้บังคับบัญชาโดยตรงคนสุดท้าย</label>
            <input
              id="rpb1_p3_militaryLastCommander"
              type="text"
              name="militaryLastCommander"
              value={formData.militaryLastCommander || ''}
              onChange={handleChange}
              placeholder="ยศ ชื่อ สกุล"
              aria-label="ผู้บังคับบัญชาโดยตรงคนสุดท้าย"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_p3_militaryDischargeReason" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">เหตุที่ออก (ถ้ามี)</label>
            <input
              id="rpb1_p3_militaryDischargeReason"
              type="text"
              name="militaryDischargeReason"
              value={formData.militaryDischargeReason || ''}
              onChange={handleChange}
              placeholder="เกษียณอายุ / ลาออก / ยังรับราชการอยู่"
              aria-label="เหตุที่ออก (ถ้ามี)"
              className="form-input text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="rpb1_p3_militarySpecialOperations" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">เคยไปปฏิบัติราชการพิเศษที่</label>
            <input
              id="rpb1_p3_militarySpecialOperations"
              type="text"
              name="militarySpecialOperations"
              value={formData.militarySpecialOperations || ''}
              onChange={handleChange}
              placeholder="เช่น ฉก.3 / ชายแดน หรือ ไม่มี"
              aria-label="เคยไปปฏิบัติราชการพิเศษที่"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_p3_militarySpecialOpDate" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">เมื่อ (วันเดือนปี)</label>
            <input
              id="rpb1_p3_militarySpecialOpDate"
              type="text"
              name="militarySpecialOpDate"
              value={formData.militarySpecialOpDate || ''}
              onChange={handleChange}
              placeholder="ปี พ.ศ. 2562"
              aria-label="เมื่อ (วันเดือนปี)"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_p3_militarySpecialOpDuration" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ระยะเวลา</label>
            <input
              id="rpb1_p3_militarySpecialOpDuration"
              type="text"
              name="militarySpecialOpDuration"
              value={formData.militarySpecialOpDuration || ''}
              onChange={handleChange}
              placeholder="เช่น 1 ปี"
              aria-label="ระยะเวลา"
              className="form-input text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

