'use client';

import React from 'react';
import { Rpb1FormData, IdentificationDocItem, LegalCaseItem, ParentDetails } from '../types';

interface PageProps {
  formData: Rpb1FormData;
  setFormData: React.Dispatch<React.SetStateAction<Rpb1FormData>>;
}

export default function Page5LegalParents({ formData, setFormData }: PageProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ID Doc helpers
  const addDoc = () => {
    const item: IdentificationDocItem = {
      docType: '',
      docNumber: '',
      issuedAt: '',
      issueAndExpiryDate: '',
    };
    setFormData((prev) => ({
      ...prev,
      identificationDocuments: [...prev.identificationDocuments, item],
    }));
  };

  const removeDoc = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      identificationDocuments: prev.identificationDocuments.filter((_, i) => i !== index),
    }));
  };

  const updateDoc = (index: number, field: keyof IdentificationDocItem, value: string) => {
    setFormData((prev) => {
      const list = [...prev.identificationDocuments];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, identificationDocuments: list };
    });
  };

  // Legal case helpers
  const addCase = () => {
    const item: LegalCaseItem = {
      date: '',
      crimeScene: '',
      charge: '',
      caseResult: '',
    };
    setFormData((prev) => ({
      ...prev,
      legalCases: [...prev.legalCases, item],
    }));
  };

  const removeCase = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      legalCases: prev.legalCases.filter((_, i) => i !== index),
    }));
  };

  const updateCase = (index: number, field: keyof LegalCaseItem, value: string) => {
    setFormData((prev) => {
      const list = [...prev.legalCases];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, legalCases: list };
    });
  };

  // Parent updater
  const updateParent = (type: 'father' | 'mother', field: keyof ParentDetails, value: string) => {
    setFormData((prev) => {
      const parentKey = type === 'father' ? 'fatherDetails' : 'motherDetails';
      return {
        ...prev,
        [parentKey]: {
          ...prev[parentKey],
          [field]: value,
        },
      };
    });
  };

  return (
    <div className="space-y-6 font-prompt animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-xs flex items-center justify-center">
            5
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            หน้า ๕ — หนังสือสำคัญแสดงตน, คดีความ/วินัย และข้อมูลบิดามารดา (หมวด ๑๙ - ๒๑)
          </h4>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
          (ชั้นความลับ: {formData.classification || 'ลับ'})
        </span>
      </div>

      {/* Section 19: Identification Documents */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <i className="fa-solid fa-address-card"></i>
            <span>๑๙. หนังสือสำคัญแสดงตน (บัตรข้าราชการ, ใบขับขี่, Passport, ฯลฯ)</span>
          </h5>
          <button
            type="button"
            onClick={addDoc}
            className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-semibold rounded-lg shadow-xs flex items-center gap-1"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>เพิ่มเอกสาร</span>
          </button>
        </div>

        {formData.identificationDocuments.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            ยังไม่มีรายการหนังสือสำคัญแสดงตน
          </p>
        ) : (
          <div className="space-y-2.5">
            {formData.identificationDocuments.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 relative"
              >
                <button
                  type="button"
                  onClick={() => removeDoc(idx)}
                  className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 text-xs p-1"
                  title="ลบแถวนี้"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ชนิดหนังสือสำคัญ</label>
                    <input
                      type="text"
                      placeholder="เช่น บัตรประจำตัวข้าราชการ"
                      value={item.docType}
                      onChange={(e) => updateDoc(idx, 'docType', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">หมายเลข</label>
                    <input
                      type="text"
                      placeholder="เลขที่เอกสาร"
                      value={item.docNumber}
                      onChange={(e) => updateDoc(idx, 'docNumber', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ออกให้ ณ / โดย</label>
                    <input
                      type="text"
                      placeholder="เช่น กรมกำลังพลทหารอากาศ"
                      value={item.issuedAt}
                      onChange={(e) => updateDoc(idx, 'issuedAt', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">วันออกและวันสิ้นอายุ</label>
                    <input
                      type="text"
                      placeholder="1 ม.ค. 65 - 1 ม.ค. 71"
                      value={item.issueAndExpiryDate}
                      onChange={(e) => updateDoc(idx, 'issueAndExpiryDate', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 20: Legal cases & Discipline */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
              <i className="fa-solid fa-gavel"></i>
              <span>๒๐. ประวัติการถูกจับ ฟ้องศาล (คดีแพ่ง/อาญา) และการถูกลงโทษทางวินัย</span>
            </h5>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">(ยกเว้นคดีกฎจราจร/ลหุโทษ)</p>
          </div>
          <button
            type="button"
            onClick={addCase}
            className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-semibold rounded-lg shadow-xs flex items-center gap-1"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>เพิ่มคดีความ</span>
          </button>
        </div>

        {formData.legalCases.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-3 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            ไม่มีประวัติการถูกจับหรือฟ้องร้องดำเนินคดี
          </p>
        ) : (
          <div className="space-y-2.5">
            {formData.legalCases.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 relative"
              >
                <button
                  type="button"
                  onClick={() => removeCase(idx)}
                  className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 text-xs p-1"
                  title="ลบแถวนี้"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">วัน เดือน ปี</label>
                    <input
                      type="text"
                      placeholder="วันเกิดเหตุ"
                      value={item.date}
                      onChange={(e) => updateCase(idx, 'date', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">สถานที่เกิดเหตุ</label>
                    <input
                      type="text"
                      placeholder="สน. / สภ."
                      value={item.crimeScene}
                      onChange={(e) => updateCase(idx, 'crimeScene', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ข้อหา</label>
                    <input
                      type="text"
                      placeholder="ระบุข้อกล่าวหา"
                      value={item.charge}
                      onChange={(e) => updateCase(idx, 'charge', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ผลที่สุดแห่งคดี</label>
                    <input
                      type="text"
                      placeholder="ยกฟ้อง / สิ้นสุดคดี"
                      value={item.caseResult}
                      onChange={(e) => updateCase(idx, 'caseResult', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            กรณีเคยถูกลงโทษทางวินัย (ถ้ามี ให้ระบุโดยละเอียด)
          </label>
          <textarea
            name="disciplinaryPunishments"
            rows={2}
            value={formData.disciplinaryPunishments || ''}
            onChange={handleChange}
            placeholder="หากไม่เคยถูกลงโทษทางวินัย ให้ระบุ 'ไม่มี'"
            className="form-control text-xs"
          />
        </div>
      </div>

      {/* Section 21: Parents Details */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
        <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
          <i className="fa-solid fa-people-roof"></i>
          <span>๒๑. ข้อมูลบิดา และ มารดา</span>
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Father Column */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <h6 className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <i className="fa-solid fa-mars"></i>
              <span>ข้อมูลบิดา</span>
            </h6>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-slate-500 mb-0.5">ยศ ชื่อตัว ชื่อสกุล</label>
                <input
                  type="text"
                  placeholder="นาย... / ร.ต. ..."
                  value={formData.fatherDetails.titleName}
                  onChange={(e) => updateParent('father', 'titleName', e.target.value)}
                  className="form-control text-xs p-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">วัน เดือน ปี เกิด</label>
                <input
                  type="text"
                  placeholder="เช่น 1 ม.ค. 2505"
                  value={formData.fatherDetails.dob}
                  onChange={(e) => updateParent('father', 'dob', e.target.value)}
                  className="form-control text-xs p-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">สถานที่จดทะเบียนเกิด</label>
                <input
                  type="text"
                  placeholder="เช่น จ.นครราชสีมา"
                  value={formData.fatherDetails.birthPlace}
                  onChange={(e) => updateParent('father', 'birthPlace', e.target.value)}
                  className="form-control text-xs p-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-slate-500 mb-0.5">เลขประจำตัวประชาชน (13 หลัก)</label>
                <input
                  type="text"
                  maxLength={13}
                  value={formData.fatherDetails.citizenId}
                  onChange={(e) => updateParent('father', 'citizenId', e.target.value)}
                  className="form-control text-xs p-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">เชื้อชาติ และ ศาสนา</label>
                <input
                  type="text"
                  placeholder="ไทย / พุทธ"
                  value={`${formData.fatherDetails.race} / ${formData.fatherDetails.religion}`}
                  onChange={(e) => {
                    const parts = e.target.value.split('/');
                    updateParent('father', 'race', parts[0]?.trim() || 'ไทย');
                    updateParent('father', 'religion', parts[1]?.trim() || 'พุทธ');
                  }}
                  className="form-control text-xs p-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">สัญชาติ (เดิม/ปัจจุบัน)</label>
                <input
                  type="text"
                  placeholder="ไทย / ไทย"
                  value={`${formData.fatherDetails.nationalityOriginal} / ${formData.fatherDetails.nationalityCurrent}`}
                  onChange={(e) => {
                    const parts = e.target.value.split('/');
                    updateParent('father', 'nationalityOriginal', parts[0]?.trim() || 'ไทย');
                    updateParent('father', 'nationalityCurrent', parts[1]?.trim() || 'ไทย');
                  }}
                  className="form-control text-xs p-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-slate-500 mb-0.5">ที่อยู่ปัจจุบันและหมายเลขโทรศัพท์</label>
                <input
                  type="text"
                  placeholder="ที่อยู่พร้อมเบอร์โทร หรือ ระบุ 'ถึงแก่กรรม'"
                  value={formData.fatherDetails.addressPhone}
                  onChange={(e) => updateParent('father', 'addressPhone', e.target.value)}
                  className="form-control text-xs p-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">อาชีพหรือตำแหน่งหน้าที่</label>
                <input
                  type="text"
                  placeholder="เช่น ข้าราชการบำนาญ"
                  value={formData.fatherDetails.occupation}
                  onChange={(e) => updateParent('father', 'occupation', e.target.value)}
                  className="form-control text-xs p-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">ที่ทำงานและหมายเลขโทรศัพท์</label>
                <input
                  type="text"
                  placeholder="สถานที่ทำงาน"
                  value={formData.fatherDetails.workplacePhone}
                  onChange={(e) => updateParent('father', 'workplacePhone', e.target.value)}
                  className="form-control text-xs p-1.5"
                />
              </div>
            </div>
          </div>

          {/* Mother Column */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <h6 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <i className="fa-solid fa-venus"></i>
              <span>ข้อมูลมารดา</span>
            </h6>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-slate-500 mb-0.5">ยศ ชื่อตัว ชื่อสกุล</label>
                <input
                  type="text"
                  placeholder="นาง... / น.ส. ..."
                  value={formData.motherDetails.titleName}
                  onChange={(e) => updateParent('mother', 'titleName', e.target.value)}
                  className="form-control text-xs p-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">วัน เดือน ปี เกิด</label>
                <input
                  type="text"
                  placeholder="เช่น 1 ม.ค. 2508"
                  value={formData.motherDetails.dob}
                  onChange={(e) => updateParent('mother', 'dob', e.target.value)}
                  className="form-control text-xs p-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">สถานที่จดทะเบียนเกิด</label>
                <input
                  type="text"
                  placeholder="เช่น จ.พระนครศรีอยุธยา"
                  value={formData.motherDetails.birthPlace}
                  onChange={(e) => updateParent('mother', 'birthPlace', e.target.value)}
                  className="form-control text-xs p-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-slate-500 mb-0.5">เลขประจำตัวประชาชน (13 หลัก)</label>
                <input
                  type="text"
                  maxLength={13}
                  value={formData.motherDetails.citizenId}
                  onChange={(e) => updateParent('mother', 'citizenId', e.target.value)}
                  className="form-control text-xs p-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">เชื้อชาติ และ ศาสนา</label>
                <input
                  type="text"
                  placeholder="ไทย / พุทธ"
                  value={`${formData.motherDetails.race} / ${formData.motherDetails.religion}`}
                  onChange={(e) => {
                    const parts = e.target.value.split('/');
                    updateParent('mother', 'race', parts[0]?.trim() || 'ไทย');
                    updateParent('mother', 'religion', parts[1]?.trim() || 'พุทธ');
                  }}
                  className="form-control text-xs p-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">สัญชาติ (เดิม/ปัจจุบัน)</label>
                <input
                  type="text"
                  placeholder="ไทย / ไทย"
                  value={`${formData.motherDetails.nationalityOriginal} / ${formData.motherDetails.nationalityCurrent}`}
                  onChange={(e) => {
                    const parts = e.target.value.split('/');
                    updateParent('mother', 'nationalityOriginal', parts[0]?.trim() || 'ไทย');
                    updateParent('mother', 'nationalityCurrent', parts[1]?.trim() || 'ไทย');
                  }}
                  className="form-control text-xs p-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-slate-500 mb-0.5">ที่อยู่ปัจจุบันและหมายเลขโทรศัพท์</label>
                <input
                  type="text"
                  placeholder="ที่อยู่พร้อมเบอร์โทร หรือ ระบุ 'ถึงแก่กรรม'"
                  value={formData.motherDetails.addressPhone}
                  onChange={(e) => updateParent('mother', 'addressPhone', e.target.value)}
                  className="form-control text-xs p-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">อาชีพหรือตำแหน่งหน้าที่</label>
                <input
                  type="text"
                  placeholder="เช่น ค้าขาย / แม่บ้าน"
                  value={formData.motherDetails.occupation}
                  onChange={(e) => updateParent('mother', 'occupation', e.target.value)}
                  className="form-control text-xs p-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">ที่ทำงานและหมายเลขโทรศัพท์</label>
                <input
                  type="text"
                  placeholder="สถานที่ทำงาน"
                  value={formData.motherDetails.workplacePhone}
                  onChange={(e) => updateParent('mother', 'workplacePhone', e.target.value)}
                  className="form-control text-xs p-1.5"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
