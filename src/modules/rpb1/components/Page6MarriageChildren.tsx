'use client';

import React from 'react';
import { Rpb1FormData, SpouseDetails, ChildItem } from '../types';

interface PageProps {
  formData: Rpb1FormData;
  setFormData: React.Dispatch<React.SetStateAction<Rpb1FormData>>;
}

export default function Page6MarriageChildren({ formData, setFormData }: PageProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateSpouse = (type: 'former' | 'current', field: keyof SpouseDetails, value: string) => {
    setFormData((prev) => {
      const spouseKey = type === 'former' ? 'spouseFormerDetails' : 'spouseCurrentDetails';
      return {
        ...prev,
        [spouseKey]: {
          ...prev[spouseKey],
          [field]: value,
        },
      };
    });
  };

  // Children table helpers
  const addChild = () => {
    const item: ChildItem = {
      order: formData.children.length + 1,
      titleName: '',
      dob: '',
      race: 'ไทย',
      nationality: 'ไทย',
      religion: 'พุทธ',
      currentAddress: '',
      occupation: '',
      schoolWorkplace: '',
      phone: '',
    };
    setFormData((prev) => ({ ...prev, children: [...prev.children, item] }));
  };

  const removeChild = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index).map((c, idx) => ({ ...c, order: idx + 1 })),
    }));
  };

  const updateChild = (index: number, field: keyof ChildItem, value: any) => {
    setFormData((prev) => {
      const list = [...prev.children];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, children: list };
    });
  };

  const maritalStatuses: Array<'โสด' | 'หมั้น' | 'สมรส' | 'หม้าย' | 'แยกกันอยู่' | 'หย่า'> = [
    'โสด',
    'หมั้น',
    'สมรส',
    'หม้าย',
    'แยกกันอยู่',
    'หย่า',
  ];

  return (
    <div className="space-y-6 font-prompt animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-xs flex items-center justify-center">
            6
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            หน้า ๖ — การสมรส คู่สมรสเดิม/ปัจจุบัน และข้อมูลบุตร (หมวด ๒๒ - ๒๓)
          </h4>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
          (ชั้นความลับ: {formData.classification || 'ลับ'})
        </span>
      </div>

      {/* Section 22: Marital Status */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
        <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
          <i className="fa-solid fa-heart"></i>
          <span>๒๒. การสมรส (ทั้งที่จดทะเบียนและไม่ได้จดทะเบียน)</span>
        </h5>

        {/* Radio pill options */}
        <div className="flex flex-wrap items-center gap-3 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          {maritalStatuses.map((st) => (
            <label
              key={st}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                formData.maritalStatus === st
                  ? 'bg-primary-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <input
                type="radio"
                name="maritalStatus"
                value={st}
                checked={formData.maritalStatus === st}
                onChange={handleChange}
                className="sr-only"
              />
              <i className={`fa-solid ${formData.maritalStatus === st ? 'fa-circle-check' : 'fa-circle text-slate-300'} text-[10px]`}></i>
              <span>{st}</span>
            </label>
          ))}
        </div>

        {formData.maritalStatus !== 'โสด' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
            {/* Current Spouse */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <h6 className="text-xs font-bold text-primary-600 dark:text-primary-400 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                คู่หมั้นหรือคู่สมรสในปัจจุบัน
              </h6>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-slate-500 mb-0.5">ยศ ชื่อตัว ชื่อสกุล (เดิม)</label>
                  <input
                    type="text"
                    value={formData.spouseCurrentDetails.titleNameOriginal}
                    onChange={(e) => updateSpouse('current', 'titleNameOriginal', e.target.value)}
                    placeholder="เช่น น.ส.สมศรี ใจดี"
                    className="form-control text-xs p-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">วัน เดือน ปี เกิด</label>
                  <input
                    type="text"
                    value={formData.spouseCurrentDetails.dob}
                    onChange={(e) => updateSpouse('current', 'dob', e.target.value)}
                    placeholder="เช่น 15 ก.ค. 2538"
                    className="form-control text-xs p-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">สถานที่จดทะเบียนเกิด</label>
                  <input
                    type="text"
                    value={formData.spouseCurrentDetails.birthPlace}
                    onChange={(e) => updateSpouse('current', 'birthPlace', e.target.value)}
                    placeholder="จ.เชียงใหม่"
                    className="form-control text-xs p-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">เชื้อชาติ / ศาสนา</label>
                  <input
                    type="text"
                    value={`${formData.spouseCurrentDetails.race} / ${formData.spouseCurrentDetails.religion}`}
                    onChange={(e) => {
                      const parts = e.target.value.split('/');
                      updateSpouse('current', 'race', parts[0]?.trim() || 'ไทย');
                      updateSpouse('current', 'religion', parts[1]?.trim() || 'พุทธ');
                    }}
                    className="form-control text-xs p-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">สัญชาติ (เดิม/ปัจจุบัน)</label>
                  <input
                    type="text"
                    value={`${formData.spouseCurrentDetails.nationalityOriginal} / ${formData.spouseCurrentDetails.nationalityCurrent}`}
                    onChange={(e) => {
                      const parts = e.target.value.split('/');
                      updateSpouse('current', 'nationalityOriginal', parts[0]?.trim() || 'ไทย');
                      updateSpouse('current', 'nationalityCurrent', parts[1]?.trim() || 'ไทย');
                    }}
                    className="form-control text-xs p-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">อาชีพ / ตำแหน่งหน้าที่</label>
                  <input
                    type="text"
                    value={formData.spouseCurrentDetails.occupation}
                    onChange={(e) => updateSpouse('current', 'occupation', e.target.value)}
                    placeholder="พนักงานบริษัท"
                    className="form-control text-xs p-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">ที่ทำงานและโทรศัพท์</label>
                  <input
                    type="text"
                    value={formData.spouseCurrentDetails.workplacePhone}
                    onChange={(e) => updateSpouse('current', 'workplacePhone', e.target.value)}
                    placeholder="สถานที่ทำงาน"
                    className="form-control text-xs p-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">วันที่สมรส / หมั้น</label>
                  <input
                    type="text"
                    value={formData.spouseCurrentDetails.marriageDate}
                    onChange={(e) => updateSpouse('current', 'marriageDate', e.target.value)}
                    placeholder="เช่น 10 ธ.ค. 2563"
                    className="form-control text-xs p-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">สถานที่จดทะเบียนสมรส</label>
                  <input
                    type="text"
                    value={formData.spouseCurrentDetails.marriagePlace}
                    onChange={(e) => updateSpouse('current', 'marriagePlace', e.target.value)}
                    placeholder="สำนักงานเขตบางเขน"
                    className="form-control text-xs p-1.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-slate-500 mb-0.5">ที่อยู่ปัจจุบันและโทรศัพท์</label>
                  <input
                    type="text"
                    value={formData.spouseCurrentDetails.currentAddressPhone}
                    onChange={(e) => updateSpouse('current', 'currentAddressPhone', e.target.value)}
                    placeholder="ที่อยู่เดียวกับผู้ขอประวัติ หรือระบุ"
                    className="form-control text-xs p-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Former Spouse (if any) */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <h6 className="text-xs font-bold text-slate-700 dark:text-slate-300 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                คู่หมั้นหรือคู่สมรสครั้งก่อน (ถ้ามี)
              </h6>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-slate-500 mb-0.5">ยศ ชื่อตัว ชื่อสกุล (เดิม)</label>
                  <input
                    type="text"
                    value={formData.spouseFormerDetails.titleNameOriginal}
                    onChange={(e) => updateSpouse('former', 'titleNameOriginal', e.target.value)}
                    placeholder="ชื่อคู่สมรสครั้งก่อน"
                    className="form-control text-xs p-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">วันที่จดทะเบียนหย่า</label>
                  <input
                    type="text"
                    value={formData.spouseFormerDetails.divorceDate || ''}
                    onChange={(e) => updateSpouse('former', 'divorceDate', e.target.value)}
                    placeholder="วันที่หย่า"
                    className="form-control text-xs p-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">สถานที่จดทะเบียนหย่า</label>
                  <input
                    type="text"
                    value={formData.spouseFormerDetails.divorcePlace || ''}
                    onChange={(e) => updateSpouse('former', 'divorcePlace', e.target.value)}
                    placeholder="สำนักงานเขต/อำเภอ"
                    className="form-control text-xs p-1.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-slate-500 mb-0.5">เหตุที่แยกกันอยู่หรือหย่า</label>
                  <input
                    type="text"
                    value={formData.spouseFormerDetails.divorceReason || ''}
                    onChange={(e) => updateSpouse('former', 'divorceReason', e.target.value)}
                    placeholder="เหตุผลการหย่า หรือระบุ 'ถึงแก่กรรม'"
                    className="form-control text-xs p-1.5"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 23: Children */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <i className="fa-solid fa-children"></i>
            <span>๒๓. ข้อมูลบุตร</span>
          </h5>
          <button
            type="button"
            onClick={addChild}
            className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-semibold rounded-lg shadow-xs flex items-center gap-1"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>เพิ่มข้อมูลบุตร</span>
          </button>
        </div>

        {formData.children.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-3 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            ยังไม่มีรายการข้อมูลบุตร (หากไม่มีบุตร ให้ปล่อยว่าง)
          </p>
        ) : (
          <div className="space-y-2.5">
            {formData.children.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 relative"
              >
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    บุตรคนที่ {item.order || idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeChild(idx)}
                    className="text-rose-500 hover:text-rose-700 text-xs p-1"
                    title="ลบแถวนี้"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">ยศ ชื่อตัว ชื่อสกุล</label>
                    <input
                      type="text"
                      placeholder="ด.ช. / นาย..."
                      value={item.titleName}
                      onChange={(e) => updateChild(idx, 'titleName', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">วัน เดือน ปี เกิด</label>
                    <input
                      type="text"
                      placeholder="เช่น 1 ม.ค. 2560"
                      value={item.dob}
                      onChange={(e) => updateChild(idx, 'dob', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">เชื้อชาติ/สัญชาติ/ศาสนา</label>
                    <input
                      type="text"
                      placeholder="ไทย/ไทย/พุทธ"
                      value={`${item.race}/${item.nationality}/${item.religion}`}
                      onChange={(e) => {
                        const p = e.target.value.split('/');
                        updateChild(idx, 'race', p[0]?.trim() || 'ไทย');
                        updateChild(idx, 'nationality', p[1]?.trim() || 'ไทย');
                        updateChild(idx, 'religion', p[2]?.trim() || 'พุทธ');
                      }}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">โทรศัพท์</label>
                    <input
                      type="text"
                      placeholder="เบอร์โทรบุตร"
                      value={item.phone}
                      onChange={(e) => updateChild(idx, 'phone', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-500 mb-0.5">ที่อยู่ปัจจุบัน</label>
                    <input
                      type="text"
                      placeholder="ที่อยู่ปัจจุบัน"
                      value={item.currentAddress}
                      onChange={(e) => updateChild(idx, 'currentAddress', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">อาชีพ / ตำแหน่ง</label>
                    <input
                      type="text"
                      placeholder="เช่น นักเรียน / นักศึกษา"
                      value={item.occupation}
                      onChange={(e) => updateChild(idx, 'occupation', e.target.value)}
                      className="form-control text-xs p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">สถานศึกษาหรือที่ทำงาน</label>
                    <input
                      type="text"
                      placeholder="ชื่อโรงเรียน/ที่ทำงาน"
                      value={item.schoolWorkplace}
                      onChange={(e) => updateChild(idx, 'schoolWorkplace', e.target.value)}
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
