'use client';

import React from 'react';
import { Rpb1FormData, SiblingItem, RelativeInGovItem, OverseasContactItem } from '../types';

interface PageProps {
  formData: Rpb1FormData;
  setFormData: React.Dispatch<React.SetStateAction<Rpb1FormData>>;
}

export default function Page7RelativesOverseas({ formData, setFormData }: PageProps) {
  // Sibling helpers
  const addSibling = () => {
    const item: SiblingItem = {
      order: formData.siblings.length + 1,
      titleName: '',
      dob: '',
      race: 'ไทย',
      nationality: 'ไทย',
      religion: 'พุทธ',
      citizenId: '',
      currentAddress: '',
      occupation: '',
      schoolWorkplace: '',
      phone: '',
      spouseNameOriginal: '',
      spouseRaceNationalityReligion: 'ไทย/ไทย/พุทธ',
      spouseOccupation: '',
      spouseSchoolWorkplace: '',
      spousePhone: '',
    };
    setFormData((prev) => ({ ...prev, siblings: [...prev.siblings, item] }));
  };

  const removeSibling = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      siblings: prev.siblings.filter((_, i) => i !== index).map((s, idx) => ({ ...s, order: idx + 1 })),
    }));
  };

  const updateSibling = (index: number, field: keyof SiblingItem, value: any) => {
    setFormData((prev) => {
      const list = [...prev.siblings];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, siblings: list };
    });
  };

  // Relatives in government helpers
  const addGovRelative = () => {
    const item: RelativeInGovItem = {
      order: formData.relativesInGovernment.length + 1,
      titleName: '',
      relation: '',
      raceNationalityReligion: 'ไทย/ไทย/พุทธ',
      occupation: '',
      workplacePhone: '',
      currentAddressPhone: '',
    };
    setFormData((prev) => ({ ...prev, relativesInGovernment: [...prev.relativesInGovernment, item] }));
  };

  const removeGovRelative = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      relativesInGovernment: prev.relativesInGovernment.filter((_, i) => i !== index).map((r, idx) => ({ ...r, order: idx + 1 })),
    }));
  };

  const updateGovRelative = (index: number, field: keyof RelativeInGovItem, value: any) => {
    setFormData((prev) => {
      const list = [...prev.relativesInGovernment];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, relativesInGovernment: list };
    });
  };

  // Overseas contacts helpers
  const addOverseas = () => {
    const item: OverseasContactItem = {
      order: formData.overseasContacts.length + 1,
      titleName: '',
      relation: '',
      raceNationalityReligion: 'ไทย/ไทย/พุทธ',
      occupation: '',
      schoolWorkplace: '',
      currentAddress: '',
      reasonLivingAbroad: '',
    };
    setFormData((prev) => ({ ...prev, overseasContacts: [...prev.overseasContacts, item] }));
  };

  const removeOverseas = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      overseasContacts: prev.overseasContacts.filter((_, i) => i !== index).map((o, idx) => ({ ...o, order: idx + 1 })),
    }));
  };

  const updateOverseas = (index: number, field: keyof OverseasContactItem, value: any) => {
    setFormData((prev) => {
      const list = [...prev.overseasContacts];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, overseasContacts: list };
    });
  };

  return (
    <div className="space-y-6 font-prompt animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-xs flex items-center justify-center">
            7
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            หน้า ๗ — พี่น้องร่วมบิดามารดา, ญาติในหน่วยงานรัฐ และผู้คุ้นเคยในต่างประเทศ (หมวด ๒๔ - ๒๖)
          </h4>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
          (ชั้นความลับ: {formData.classification || 'ลับ'})
        </span>
      </div>

      {/* Section 24: Siblings */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <i className="fa-solid fa-people-group"></i>
            <span>๒๔. พี่น้องร่วมบิดาหรือร่วมมารดา รวมทั้งสามีหรือภรรยาของพี่น้อง</span>
          </h5>
          <button
            type="button"
            onClick={addSibling}
            className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-semibold rounded-lg shadow-xs flex items-center gap-1"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>เพิ่มพี่น้อง</span>
          </button>
        </div>

        {formData.siblings.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-3 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            ยังไม่มีรายการข้อมูลพี่น้อง (หากเป็นบุตรคนเดียว ให้ปล่อยว่าง)
          </p>
        ) : (
          <div className="space-y-3">
            {formData.siblings.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 relative"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    พี่น้องลำดับที่ {item.order || idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSibling(idx)}
                    className="text-rose-500 hover:text-rose-700 text-xs p-1"
                    title="ลบแถวนี้"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>

                {/* Sibling info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ยศ ชื่อตัว ชื่อสกุล</label>
                    <input
                      type="text"
                      placeholder="นาย/นาง/น.ส. ..."
                      value={item.titleName}
                      onChange={(e) => updateSibling(idx, 'titleName', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">วัน เดือน ปี เกิด</label>
                    <input
                      type="text"
                      placeholder="เช่น 1 ม.ค. 2533"
                      value={item.dob}
                      onChange={(e) => updateSibling(idx, 'dob', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">เลขประจำตัวประชาชน</label>
                    <input
                      type="text"
                      maxLength={13}
                      value={item.citizenId}
                      onChange={(e) => updateSibling(idx, 'citizenId', e.target.value)}
                      className="form-control text-xs p-1.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">โทรศัพท์</label>
                    <input
                      type="text"
                      placeholder="เบอร์โทร"
                      value={item.phone}
                      onChange={(e) => updateSibling(idx, 'phone', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-500 mb-0.5">ที่อยู่ปัจจุบัน</label>
                    <input
                      type="text"
                      placeholder="ที่อยู่ปัจจุบัน"
                      value={item.currentAddress}
                      onChange={(e) => updateSibling(idx, 'currentAddress', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">อาชีพ / ตำแหน่ง</label>
                    <input
                      type="text"
                      placeholder="เช่น พนักงานรัฐวิสาหกิจ"
                      value={item.occupation}
                      onChange={(e) => updateSibling(idx, 'occupation', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ที่ทำงาน / สถานศึกษา</label>
                    <input
                      type="text"
                      placeholder="สถานที่ทำงาน"
                      value={item.schoolWorkplace}
                      onChange={(e) => updateSibling(idx, 'schoolWorkplace', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                </div>

                {/* Sibling's Spouse */}
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-1.5 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <i className="fa-solid fa-ring text-[10px]"></i>
                    <span>สามีหรือภรรยาของพี่น้องคนนี้ (ถ้ามี)</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                      <input
                        type="text"
                        placeholder="ชื่อสกุลเดิมคู่สมรส"
                        value={item.spouseNameOriginal}
                        onChange={(e) => updateSibling(idx, 'spouseNameOriginal', e.target.value)}
                        className="form-control text-xs p-1.5"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="อาชีพและตำแหน่ง"
                        value={item.spouseOccupation}
                        onChange={(e) => updateSibling(idx, 'spouseOccupation', e.target.value)}
                        className="form-control text-xs p-1.5"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="สถานที่ทำงาน"
                        value={item.spouseSchoolWorkplace}
                        onChange={(e) => updateSibling(idx, 'spouseSchoolWorkplace', e.target.value)}
                        className="form-control text-xs p-1.5"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="เบอร์โทรคู่สมรส"
                        value={item.spousePhone}
                        onChange={(e) => updateSibling(idx, 'spousePhone', e.target.value)}
                        className="form-control text-xs p-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 25: Relatives in government */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <i className="fa-solid fa-landmark"></i>
            <span>๒๕. ญาติที่รับราชการหรือทำงานในองค์การรัฐบาล</span>
          </h5>
          <button
            type="button"
            onClick={addGovRelative}
            className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-semibold rounded-lg shadow-xs flex items-center gap-1"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>เพิ่มญาติ</span>
          </button>
        </div>

        {formData.relativesInGovernment.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-3 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            ไม่มีญาติที่รับราชการหรือทำงานในองค์การรัฐบาล
          </p>
        ) : (
          <div className="space-y-2.5">
            {formData.relativesInGovernment.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 relative"
              >
                <button
                  type="button"
                  onClick={() => removeGovRelative(idx)}
                  className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 text-xs p-1"
                  title="ลบแถวนี้"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ยศ ชื่อตัว ชื่อสกุล</label>
                    <input
                      type="text"
                      placeholder="ยศ ชื่อ สกุล"
                      value={item.titleName}
                      onChange={(e) => updateGovRelative(idx, 'titleName', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">เกี่ยวข้องเป็น</label>
                    <input
                      type="text"
                      placeholder="เช่น ลุง, น้า, อา, ลูกพี่ลูกน้อง"
                      value={item.relation}
                      onChange={(e) => updateGovRelative(idx, 'relation', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">อาชีพ / ตำแหน่ง</label>
                    <input
                      type="text"
                      placeholder="เช่น ผอ.กอง..."
                      value={item.occupation}
                      onChange={(e) => updateGovRelative(idx, 'occupation', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ที่ทำงานและโทรศัพท์</label>
                    <input
                      type="text"
                      placeholder="สถานที่ทำงานและเบอร์โทร"
                      value={item.workplacePhone}
                      onChange={(e) => updateGovRelative(idx, 'workplacePhone', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ที่อยู่ปัจจุบันและโทรศัพท์</label>
                    <input
                      type="text"
                      placeholder="ที่อยู่และเบอร์โทร"
                      value={item.currentAddressPhone}
                      onChange={(e) => updateGovRelative(idx, 'currentAddressPhone', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 26: Overseas contacts */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <i className="fa-solid fa-earth-americas"></i>
            <span>๒๖. ญาติ เพื่อน หรือผู้ที่คุ้นเคยในต่างประเทศ</span>
          </h5>
          <button
            type="button"
            onClick={addOverseas}
            className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-semibold rounded-lg shadow-xs flex items-center gap-1"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>เพิ่มผู้ติดต่อต่างประเทศ</span>
          </button>
        </div>

        {formData.overseasContacts.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-3 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            ไม่มีญาติ เพื่อน หรือผู้คุ้นเคยในต่างประเทศ
          </p>
        ) : (
          <div className="space-y-2.5">
            {formData.overseasContacts.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 relative"
              >
                <button
                  type="button"
                  onClick={() => removeOverseas(idx)}
                  className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 text-xs p-1"
                  title="ลบแถวนี้"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ยศ ชื่อตัว ชื่อสกุล</label>
                    <input
                      type="text"
                      placeholder="ชื่อ-สกุล"
                      value={item.titleName}
                      onChange={(e) => updateOverseas(idx, 'titleName', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">เกี่ยวข้องเป็น</label>
                    <input
                      type="text"
                      placeholder="เช่น เพื่อนสนิท, ญาติ"
                      value={item.relation}
                      onChange={(e) => updateOverseas(idx, 'relation', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">อาชีพและตำแหน่ง</label>
                    <input
                      type="text"
                      placeholder="อาชีพ"
                      value={item.occupation}
                      onChange={(e) => updateOverseas(idx, 'occupation', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">สถานศึกษา / ที่ทำงาน</label>
                    <input
                      type="text"
                      placeholder="ชื่อมหาวิทยาลัย/บริษัท"
                      value={item.schoolWorkplace}
                      onChange={(e) => updateOverseas(idx, 'schoolWorkplace', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-500 mb-0.5">ที่อยู่ปัจจุบัน (ต่างประเทศ)</label>
                    <input
                      type="text"
                      placeholder="เมือง, รัฐ, ประเทศ"
                      value={item.currentAddress}
                      onChange={(e) => updateOverseas(idx, 'currentAddress', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-500 mb-0.5">เหตุผลการไปอยู่ต่างประเทศ</label>
                    <input
                      type="text"
                      placeholder="เช่น ศึกษาต่อปริญญาเอก / ทำงานประจำ"
                      value={item.reasonLivingAbroad}
                      onChange={(e) => updateOverseas(idx, 'reasonLivingAbroad', e.target.value)}
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
