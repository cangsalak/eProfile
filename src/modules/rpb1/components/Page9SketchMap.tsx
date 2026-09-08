'use client';

import React from 'react';
import { Rpb1FormData } from '../types';

interface PageProps {
  formData: Rpb1FormData;
  setFormData: React.Dispatch<React.SetStateAction<Rpb1FormData>>;
}

export default function Page9SketchMap({ formData, setFormData }: PageProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, sketchMapImage: reader.result as string }));
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
            9
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            หน้า ๙ — แผนที่สังเขปที่อยู่ปัจจุบัน และบุคคลติดต่อกรณีเร่งด่วน
          </h4>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
          (ชั้นความลับ: {formData.classification || 'ลับ'})
        </span>
      </div>

      {/* Map Sketch Box */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <i className="fa-solid fa-map-location-dot"></i>
            <span>แผนที่สังเขปที่อยู่ปัจจุบัน</span>
          </h5>
          <label className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all">
            <i className="fa-solid fa-upload text-xs"></i>
            <span>อัปโหลดภาพแผนที่</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="sr-only"
            />
          </label>
        </div>

        {formData.sketchMapImage ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={formData.sketchMapImage}
              alt="แผนที่สังเขป"
              className="max-h-72 object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, sketchMapImage: '' }))}
              className="absolute top-3 right-3 px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold rounded-lg shadow-md flex items-center gap-1"
            >
              <i className="fa-solid fa-trash-can text-[10px]"></i>
              <span>ลบภาพ</span>
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center bg-white/60 dark:bg-slate-900/60 space-y-2">
            <i className="fa-solid fa-map text-3xl text-slate-400 dark:text-slate-600"></i>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              ลากและวางภาพแผนที่สังเขป หรือกดปุ่ม &quot;อัปโหลดภาพแผนที่&quot; ด้านบน
            </p>
            <p className="text-[11px] text-slate-400">
              (สามารถแคปเจอร์ภาพจาก Google Maps หรือวาดภาพแผนที่สังเขปที่มองเห็นจุดสังเกตสำคัญ)
            </p>
          </div>
        )}

        {/* Location Details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">บ้านเลขที่</label>
            <input
              type="text"
              name="mapHouseNo"
              value={formData.mapHouseNo || formData.currentHouseNo || ''}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หมู่บ้าน</label>
            <input
              type="text"
              name="mapVillage"
              value={formData.mapVillage || formData.currentVillage || ''}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หมู่ที่</label>
            <input
              type="text"
              name="mapMoo"
              value={formData.mapMoo || formData.currentMoo || ''}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ตรอก/ซอย</label>
            <input
              type="text"
              name="mapSoi"
              value={formData.mapSoi || formData.currentSoi || ''}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ถนน</label>
            <input
              type="text"
              name="mapRoad"
              value={formData.mapRoad || formData.currentRoad || ''}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ตำบล/แขวง</label>
            <input
              type="text"
              name="mapSubdistrict"
              value={formData.mapSubdistrict || formData.currentSubdistrict || ''}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">อำเภอ/เขต</label>
            <input
              type="text"
              name="mapDistrict"
              value={formData.mapDistrict || formData.currentDistrict || ''}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">จังหวัด</label>
            <input
              type="text"
              name="mapProvince"
              value={formData.mapProvince || formData.currentProvince || ''}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หมายเลขโทรศัพท์</label>
            <input
              type="text"
              name="mapPhone"
              value={formData.mapPhone || formData.currentPhone || ''}
              onChange={handleChange}
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ชื่อเจ้าบ้าน</label>
            <input
              type="text"
              name="mapHouseOwnerName"
              value={formData.mapHouseOwnerName || ''}
              onChange={handleChange}
              placeholder="ยศ ชื่อ สกุล เจ้าบ้าน"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">โทรศัพท์เจ้าบ้าน</label>
            <input
              type="text"
              name="mapHouseOwnerPhone"
              value={formData.mapHouseOwnerPhone || ''}
              onChange={handleChange}
              placeholder="เบอร์โทรเจ้าบ้าน"
              className="form-control text-xs"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
        <h5 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <i className="fa-solid fa-phone-volume"></i>
          <span>บุคคลที่จะขอให้ตามตัวได้ในกรณีเร่งด่วน</span>
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ยศ ชื่อตัว ชื่อสกุล <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="emergencyContactRankName"
              value={formData.emergencyContactRankName || ''}
              onChange={handleChange}
              placeholder="ยศ ชื่อ สกุล"
              className="form-control text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">เกี่ยวข้องเป็น</label>
            <input
              type="text"
              name="emergencyContactRelation"
              value={formData.emergencyContactRelation || ''}
              onChange={handleChange}
              placeholder="เช่น บิดา, ภรรยา, พี่ชาย"
              className="form-control text-xs"
            />
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ที่อยู่และหมายเลขโทรศัพท์ติดต่อเร่งด่วน
            </label>
            <input
              type="text"
              name="emergencyContactAddress"
              value={formData.emergencyContactAddress || ''}
              onChange={handleChange}
              placeholder="ที่อยู่และเบอร์โทรศัพท์"
              className="form-control text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
