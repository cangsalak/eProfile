'use client';

import React from 'react';
import { Rpb1FormData, CohabitantItem, CloseFriendItem, SupporterItem } from '../types';

interface PageProps {
  formData: Rpb1FormData;
  setFormData: React.Dispatch<React.SetStateAction<Rpb1FormData>>;
}

export default function Page8CohabitantsSignatures({ formData, setFormData }: PageProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Cohabitant helpers
  const addCohabitant = () => {
    const item: CohabitantItem = {
      order: formData.cohabitants.length + 1,
      titleName: '',
      relation: '',
    };
    setFormData((prev) => ({ ...prev, cohabitants: [...prev.cohabitants, item] }));
  };

  const removeCohabitant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      cohabitants: prev.cohabitants.filter((_, i) => i !== index).map((c, idx) => ({ ...c, order: idx + 1 })),
    }));
  };

  const updateCohabitant = (index: number, field: keyof CohabitantItem, value: any) => {
    setFormData((prev) => {
      const list = [...prev.cohabitants];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, cohabitants: list };
    });
  };

  // Close friends helpers
  const addFriend = () => {
    const item: CloseFriendItem = {
      titleName: '',
      yearsKnown: '',
      raceNationalityReligion: 'ไทย/ไทย/พุทธ',
      addressPhone: '',
      workplacePhone: '',
    };
    setFormData((prev) => ({ ...prev, closeFriendsRef: [...prev.closeFriendsRef, item] }));
  };

  const removeFriend = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      closeFriendsRef: prev.closeFriendsRef.filter((_, i) => i !== index),
    }));
  };

  const updateFriend = (index: number, field: keyof CloseFriendItem, value: string) => {
    setFormData((prev) => {
      const list = [...prev.closeFriendsRef];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, closeFriendsRef: list };
    });
  };

  // Supporter helpers
  const addSupporter = () => {
    const item: SupporterItem = {
      titleName: '',
      raceNationalityReligion: 'ไทย/ไทย/พุทธ',
      addressPhone: '',
      workplacePhone: '',
    };
    setFormData((prev) => ({ ...prev, supporters: [...prev.supporters, item] }));
  };

  const removeSupporter = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      supporters: prev.supporters.filter((_, i) => i !== index),
    }));
  };

  const updateSupporter = (index: number, field: keyof SupporterItem, value: string) => {
    setFormData((prev) => {
      const list = [...prev.supporters];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, supporters: list };
    });
  };

  return (
    <div className="space-y-6 font-prompt animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-xs flex items-center justify-center">
            8
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            หน้า ๘ — ผู้ร่วมอาศัย, บุคคลอ้างอิง, ผู้อุปการะ และคำรับรองลงนาม (หมวด ๒๗ - ๓๐)
          </h4>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
          (ชั้นความลับ: {formData.classification || 'ลับ'})
        </span>
      </div>

      {/* Section 27: Cohabitants */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <i className="fa-solid fa-person-shelter"></i>
            <span>๒๗. ผู้ร่วมอาศัยในที่อยู่ปัจจุบัน</span>
          </h5>
          <button
            type="button"
            onClick={addCohabitant}
            className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-semibold rounded-lg shadow-xs flex items-center gap-1"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>เพิ่มผู้ร่วมอาศัย</span>
          </button>
        </div>

        {formData.cohabitants.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-3 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            ไม่มีผู้ร่วมอาศัยอื่นในที่อยู่ปัจจุบัน (อาศัยเฉพาะครอบครัวหลัก)
          </p>
        ) : (
          <div className="space-y-2">
            {formData.cohabitants.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 relative"
              >
                <span className="text-xs font-bold text-slate-400 w-6 shrink-0">{idx + 1}.</span>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="ยศ ชื่อตัว ชื่อสกุล"
                    value={item.titleName}
                    onChange={(e) => updateCohabitant(idx, 'titleName', e.target.value)}
                    className="form-control text-xs p-1.5"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="เกี่ยวข้องเป็น เช่น เพื่อนร่วมห้อง / ญาติ"
                    value={item.relation}
                    onChange={(e) => updateCohabitant(idx, 'relation', e.target.value)}
                    className="form-control text-xs p-1.5"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeCohabitant(idx)}
                  className="text-rose-500 hover:text-rose-700 text-xs p-1"
                  title="ลบแถวนี้"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 28: Close friends */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
              <i className="fa-solid fa-user-check"></i>
              <span>๒๘. ผู้ใกล้ชิดสนิทสนมและบุคคลที่ติดต่อด้วยเสมอ (บุคคลอ้างอิง)</span>
            </h5>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">(เว้นเครือญาติ นายจ้างเดิม หรือบุคคลนอกประเทศ)</p>
          </div>
          <button
            type="button"
            onClick={addFriend}
            className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-semibold rounded-lg shadow-xs flex items-center gap-1"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>เพิ่มบุคคลอ้างอิง</span>
          </button>
        </div>

        {formData.closeFriendsRef.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-3 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            ยังไม่มีรายการบุคคลอ้างอิง (ควรกำหนดอย่างน้อย ๒ ท่าน)
          </p>
        ) : (
          <div className="space-y-2.5">
            {formData.closeFriendsRef.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 relative"
              >
                <button
                  type="button"
                  onClick={() => removeFriend(idx)}
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
                      onChange={(e) => updateFriend(idx, 'titleName', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">จำนวนปีที่รู้จัก</label>
                    <input
                      type="text"
                      placeholder="เช่น 10 ปี"
                      value={item.yearsKnown}
                      onChange={(e) => updateFriend(idx, 'yearsKnown', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">เชื้อชาติ/สัญชาติ/ศาสนา</label>
                    <input
                      type="text"
                      placeholder="ไทย/ไทย/พุทธ"
                      value={item.raceNationalityReligion}
                      onChange={(e) => updateFriend(idx, 'raceNationalityReligion', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ที่อยู่ปัจจุบันและโทรศัพท์</label>
                    <input
                      type="text"
                      placeholder="ที่อยู่และโทร"
                      value={item.addressPhone}
                      onChange={(e) => updateFriend(idx, 'addressPhone', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ที่ทำงานและโทรศัพท์</label>
                    <input
                      type="text"
                      placeholder="ที่ทำงานและโทร"
                      value={item.workplacePhone}
                      onChange={(e) => updateFriend(idx, 'workplacePhone', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 29: Supporters */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <i className="fa-solid fa-hand-holding-heart"></i>
            <span>๒๙. ผู้อุปการะช่วยเหลือ สนับสนุนทั้งในอดีตและปัจจุบัน (เว้นบิดามารดา)</span>
          </h5>
          <button
            type="button"
            onClick={addSupporter}
            className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-semibold rounded-lg shadow-xs flex items-center gap-1"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>เพิ่มผู้อุปการะ</span>
          </button>
        </div>

        {formData.supporters.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-3 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            ไม่มีผู้อุปการะอื่น (ได้รับการอุปการะจากบิดามารดาโดยตรง)
          </p>
        ) : (
          <div className="space-y-2.5">
            {formData.supporters.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 relative"
              >
                <button
                  type="button"
                  onClick={() => removeSupporter(idx)}
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
                      placeholder="ยศ ชื่อ สกุล"
                      value={item.titleName}
                      onChange={(e) => updateSupporter(idx, 'titleName', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">เชื้อชาติ/สัญชาติ/ศาสนา</label>
                    <input
                      type="text"
                      placeholder="ไทย/ไทย/พุทธ"
                      value={item.raceNationalityReligion}
                      onChange={(e) => updateSupporter(idx, 'raceNationalityReligion', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ที่อยู่ปัจจุบันและโทรศัพท์</label>
                    <input
                      type="text"
                      placeholder="ที่อยู่และโทร"
                      value={item.addressPhone}
                      onChange={(e) => updateSupporter(idx, 'addressPhone', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ที่ทำงานและโทรศัพท์</label>
                    <input
                      type="text"
                      placeholder="สถานที่ทำงาน"
                      value={item.workplacePhone}
                      onChange={(e) => updateSupporter(idx, 'workplacePhone', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 30: Additional explanations & Certification */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
        <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
          <i className="fa-solid fa-file-signature"></i>
          <span>๓๐. คำชี้แจงอื่น ๆ และคำรับรองการบันทึกประวัติ</span>
        </h5>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            ประวัติคำชี้แจงอื่น ๆ ในทางส่วนตัวที่ไม่ได้แจ้งไว้ข้างต้น
          </label>
          <textarea
            name="additionalExplanations"
            rows={2}
            value={formData.additionalExplanations || ''}
            onChange={handleChange}
            placeholder="คำชี้แจงเพิ่มเติม (ถ้ามี)"
            className="form-control text-xs"
          />
        </div>

        {/* Legal Certification Statement */}
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
          <p className="font-semibold leading-relaxed">
            &quot;ข้าพเจ้าขอรับรองว่า ข้อความดังกล่าวข้างต้นเป็นความจริงทุกประการ และรับทราบว่าหน่วยงานสามารถจัดเก็บ ใช้ ข้อมูลจากแบบประวัติบุคคลนี้ เพื่อพิจารณาดำเนินการตามระเบียบสำนักนายกรัฐมนตรี ว่าด้วยการรักษาความปลอดภัยแห่งชาติ พ.ศ.๒๕๕๒ และที่แก้ไขเพิ่มเติม&quot;
          </p>
        </div>

        {/* Signature Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h6 className="text-xs font-bold text-slate-800 dark:text-slate-200">เจ้าของประวัติ</h6>
            <div>
              <label className="block text-[10px] text-slate-500 mb-0.5">วันที่ลงนาม</label>
              <input
                type="text"
                name="ownerSignatureDate"
                value={formData.ownerSignatureDate || ''}
                onChange={handleChange}
                placeholder="เช่น 15 มีนาคม 2567"
                className="form-control text-xs p-1.5"
              />
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h6 className="text-xs font-bold text-slate-800 dark:text-slate-200">เจ้าหน้าที่ควบคุมการบันทึกประวัติ</h6>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">ยศ ชื่อ (ตัวบรรจง)</label>
                <input
                  type="text"
                  name="inspectorRankName"
                  value={formData.inspectorRankName || ''}
                  onChange={handleChange}
                  placeholder="ยศ ชื่อ สกุล"
                  className="form-control text-xs p-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">ตำแหน่ง</label>
                <input
                  type="text"
                  name="inspectorPosition"
                  value={formData.inspectorPosition || ''}
                  onChange={handleChange}
                  placeholder="ตำแหน่งเจ้าหน้าที่"
                  className="form-control text-xs p-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-slate-500 mb-0.5">วันที่ควบคุมการบันทึก</label>
                <input
                  type="text"
                  name="inspectorSignatureDate"
                  value={formData.inspectorSignatureDate || ''}
                  onChange={handleChange}
                  placeholder="เช่น 15 มีนาคม 2567"
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
