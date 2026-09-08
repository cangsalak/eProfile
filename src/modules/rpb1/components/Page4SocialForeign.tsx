'use client';

import React from 'react';
import { Rpb1FormData, OrganizationMembershipItem, ForeignTravelItem } from '../types';

interface PageProps {
  formData: Rpb1FormData;
  setFormData: React.Dispatch<React.SetStateAction<Rpb1FormData>>;
}

export default function Page4SocialForeign({ formData, setFormData }: PageProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Membership table helpers
  const addMembership = () => {
    const item: OrganizationMembershipItem = {
      fromYear: '',
      toYear: '',
      organizationName: '',
      location: '',
      memberNo: '',
    };
    setFormData((prev) => ({
      ...prev,
      politicalSocialMemberships: [...prev.politicalSocialMemberships, item],
    }));
  };

  const removeMembership = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      politicalSocialMemberships: prev.politicalSocialMemberships.filter((_, i) => i !== index),
    }));
  };

  const updateMembership = (index: number, field: keyof OrganizationMembershipItem, value: string) => {
    setFormData((prev) => {
      const list = [...prev.politicalSocialMemberships];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, politicalSocialMemberships: list };
    });
  };

  // Foreign travel table helpers
  const addTravel = () => {
    const item: ForeignTravelItem = {
      fromYear: '',
      toYear: '',
      cityCountry: '',
      purposeAndSponsorship: '',
    };
    setFormData((prev) => ({
      ...prev,
      foreignTravels: [...prev.foreignTravels, item],
    }));
  };

  const removeTravel = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      foreignTravels: prev.foreignTravels.filter((_, i) => i !== index),
    }));
  };

  const updateTravel = (index: number, field: keyof ForeignTravelItem, value: string) => {
    setFormData((prev) => {
      const list = [...prev.foreignTravels];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, foreignTravels: list };
    });
  };

  return (
    <div className="space-y-6 font-prompt animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-xs flex items-center justify-center">
            4
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            หน้า ๔ — สื่อสิ่งพิมพ์/ออนไลน์, สมาชิกภาพองค์กร และการเดินทางต่างประเทศ (หมวด ๑๖ - ๑๘)
          </h4>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
          (ชั้นความลับ: {formData.classification || 'ลับ'})
        </span>
      </div>

      {/* Section 16: Writer & Online Media */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-2">
        <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
          <i className="fa-solid fa-pen-nib"></i>
          <span>๑๖. การเป็นนักเขียน บทความ นามปากกา และการสื่อสารผ่านสื่อสังคมออนไลน์</span>
        </h5>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          ถ้าเคย ให้แจ้งชื่อเรื่อง/บทความ นามปากกา ชื่อหนังสือ บรรณาธิการ ผู้พิมพ์ ผู้โฆษณา และวันเดือนปีที่พิมพ์ หรือกลุ่มสังคมออนไลน์ที่ดูแล
        </p>
        <textarea
          name="writerDetails"
          rows={3}
          value={formData.writerDetails || ''}
          onChange={handleChange}
          placeholder="เช่น เคยเขียนบทความวิชาการ นามปากกา '...' หรือ หากไม่มีให้ระบุ 'ไม่มี'"
          className="form-control text-xs"
        />
      </div>

      {/* Section 17: Memberships in political/social/clubs */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
              <i className="fa-solid fa-users-line"></i>
              <span>๑๗. สมาชิกภาพในพรรคการเมือง สมาคม สโมสร องค์กร หรือกลุ่มสื่อออนไลน์</span>
            </h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">ในทางอาชีพ สังคม การเมือง (อดีตและปัจจุบัน)</p>
          </div>
          <button
            type="button"
            onClick={addMembership}
            className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-semibold rounded-lg shadow-xs flex items-center gap-1"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>เพิ่มสมาชิกภาพ</span>
          </button>
        </div>

        {formData.politicalSocialMemberships.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            ยังไม่มีรายการสมาชิกภาพองค์กร
          </p>
        ) : (
          <div className="space-y-2.5">
            {formData.politicalSocialMemberships.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 relative"
              >
                <button
                  type="button"
                  onClick={() => removeMembership(idx)}
                  className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 text-xs p-1"
                  title="ลบแถวนี้"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ปี พ.ศ. (จาก)</label>
                    <input
                      type="text"
                      placeholder="2560"
                      value={item.fromYear}
                      onChange={(e) => updateMembership(idx, 'fromYear', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ปี พ.ศ. (ถึง)</label>
                    <input
                      type="text"
                      placeholder="ปัจจุบัน"
                      value={item.toYear}
                      onChange={(e) => updateMembership(idx, 'toYear', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ชื่อองค์กร/สมาคม</label>
                    <input
                      type="text"
                      placeholder="สมาคมวิทยุสมัครเล่นฯ"
                      value={item.organizationName}
                      onChange={(e) => updateMembership(idx, 'organizationName', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ที่ตั้ง</label>
                    <input
                      type="text"
                      placeholder="กรุงเทพมหานคร"
                      value={item.location}
                      onChange={(e) => updateMembership(idx, 'location', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">หมายเลขสมาชิก</label>
                    <input
                      type="text"
                      placeholder="เช่น M-12345"
                      value={item.memberNo}
                      onChange={(e) => updateMembership(idx, 'memberNo', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 18: Foreign Travels */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <i className="fa-solid fa-plane"></i>
            <span>๑๘. การเดินทางไปต่างประเทศ (กรอกตามลำดับก่อน-หลัง)</span>
          </h5>
          <button
            type="button"
            onClick={addTravel}
            className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-semibold rounded-lg shadow-xs flex items-center gap-1"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>เพิ่มการเดินทาง</span>
          </button>
        </div>

        {formData.foreignTravels.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            ยังไม่มีรายการเดินทางไปต่างประเทศ
          </p>
        ) : (
          <div className="space-y-2.5">
            {formData.foreignTravels.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 relative"
              >
                <button
                  type="button"
                  onClick={() => removeTravel(idx)}
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
                      placeholder="2561"
                      value={item.fromYear}
                      onChange={(e) => updateTravel(idx, 'fromYear', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ปี พ.ศ. (ถึง)</label>
                    <input
                      type="text"
                      placeholder="2561"
                      value={item.toYear}
                      onChange={(e) => updateTravel(idx, 'toYear', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">เมืองและประเทศ</label>
                    <input
                      type="text"
                      placeholder="เช่น โตเกียว, ญี่ปุ่น"
                      value={item.cityCountry}
                      onChange={(e) => updateTravel(idx, 'cityCountry', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ความมุ่งหมายและทุนที่ได้รับ</label>
                    <input
                      type="text"
                      placeholder="ฝึกอบรมดูงาน ทุน ทอ."
                      value={item.purposeAndSponsorship}
                      onChange={(e) => updateTravel(idx, 'purposeAndSponsorship', e.target.value)}
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
