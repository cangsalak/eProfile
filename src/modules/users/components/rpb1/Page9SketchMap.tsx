'use client';

import React from 'react';
import { Rpb1FormData } from '../../types';
import { ImageUpload } from '@/components/ui';

interface PageProps {
  formData: Rpb1FormData;
  setFormData: React.Dispatch<React.SetStateAction<Rpb1FormData>>;
}

export default function Page9SketchMap({ formData, setFormData }: PageProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
            หน้า 9 — แผนที่สังเขปที่อยู่ปัจจุบัน และบุคคลติดต่อกรณีเร่งด่วน
          </h4>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
          (ชั้นความลับ: {formData.classification || 'ลับ'})
        </span>
      </div>

      {/* Map Sketch Box */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
        <ImageUpload
          id="rpb1_p9_mapUpload"
          label="แผนที่สังเขปที่อยู่ปัจจุบัน"
          value={formData.sketchMapImage}
          onChange={(url) => setFormData((prev) => ({ ...prev, sketchMapImage: url }))}
          onRemove={() => setFormData((prev) => ({ ...prev, sketchMapImage: '' }))}
          variant="map"
          placeholder="ลากและวางภาพแผนที่สังเขป หรือคลิกเพื่ออัปโหลด"
          helperText="(สามารถแคปเจอร์ภาพจาก Google Maps หรือวาดภาพแผนที่สังเขปที่มองเห็นจุดสังเกตสำคัญ)"
        />

        {/* Location Details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          <div>
            <label htmlFor="rpb1_p9_mapHouseNo" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">บ้านเลขที่</label>
            <input
              id="rpb1_p9_mapHouseNo"
              type="text"
              name="mapHouseNo"
              value={formData.mapHouseNo || formData.currentHouseNo || ''}
              onChange={handleChange}
              aria-label="บ้านเลขที่ แผนที่สังเขป"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_p9_mapVillage" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หมู่บ้าน</label>
            <input
              id="rpb1_p9_mapVillage"
              type="text"
              name="mapVillage"
              value={formData.mapVillage || formData.currentVillage || ''}
              onChange={handleChange}
              aria-label="หมู่บ้าน แผนที่สังเขป"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_p9_mapMoo" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หมู่ที่</label>
            <input
              id="rpb1_p9_mapMoo"
              type="text"
              name="mapMoo"
              value={formData.mapMoo || formData.currentMoo || ''}
              onChange={handleChange}
              aria-label="หมู่ที่ แผนที่สังเขป"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_p9_mapSoi" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ตรอก/ซอย</label>
            <input
              id="rpb1_p9_mapSoi"
              type="text"
              name="mapSoi"
              value={formData.mapSoi || formData.currentSoi || ''}
              onChange={handleChange}
              aria-label="ตรอก/ซอย แผนที่สังเขป"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_p9_mapRoad" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ถนน</label>
            <input
              id="rpb1_p9_mapRoad"
              type="text"
              name="mapRoad"
              value={formData.mapRoad || formData.currentRoad || ''}
              onChange={handleChange}
              aria-label="ถนน แผนที่สังเขป"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_p9_mapSubdistrict" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ตำบล/แขวง</label>
            <input
              id="rpb1_p9_mapSubdistrict"
              type="text"
              name="mapSubdistrict"
              value={formData.mapSubdistrict || formData.currentSubdistrict || ''}
              onChange={handleChange}
              aria-label="ตำบล/แขวง แผนที่สังเขป"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_p9_mapDistrict" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">อำเภอ/เขต</label>
            <input
              id="rpb1_p9_mapDistrict"
              type="text"
              name="mapDistrict"
              value={formData.mapDistrict || formData.currentDistrict || ''}
              onChange={handleChange}
              aria-label="อำเภอ/เขต แผนที่สังเขป"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_p9_mapProvince" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">จังหวัด</label>
            <input
              id="rpb1_p9_mapProvince"
              type="text"
              name="mapProvince"
              value={formData.mapProvince || formData.currentProvince || ''}
              onChange={handleChange}
              aria-label="จังหวัด แผนที่สังเขป"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_p9_mapPhone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">หมายเลขโทรศัพท์</label>
            <input
              id="rpb1_p9_mapPhone"
              type="text"
              name="mapPhone"
              value={formData.mapPhone || formData.currentPhone || ''}
              onChange={handleChange}
              aria-label="หมายเลขโทรศัพท์ แผนที่สังเขป"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_p9_mapHouseOwnerName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ชื่อเจ้าบ้าน</label>
            <input
              id="rpb1_p9_mapHouseOwnerName"
              type="text"
              name="mapHouseOwnerName"
              value={formData.mapHouseOwnerName || ''}
              onChange={handleChange}
              placeholder="ยศ ชื่อ สกุล เจ้าบ้าน"
              aria-label="ชื่อเจ้าบ้าน แผนที่สังเขป"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_p9_mapHouseOwnerPhone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">โทรศัพท์เจ้าบ้าน</label>
            <input
              id="rpb1_p9_mapHouseOwnerPhone"
              type="text"
              name="mapHouseOwnerPhone"
              value={formData.mapHouseOwnerPhone || ''}
              onChange={handleChange}
              placeholder="เบอร์โทรเจ้าบ้าน"
              aria-label="โทรศัพท์เจ้าบ้าน แผนที่สังเขป"
              className="form-input text-xs"
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
            <label htmlFor="rpb1_p9_emergencyContactRankName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ยศ ชื่อตัว ชื่อสกุล <span className="text-rose-500">*</span>
            </label>
            <input
              id="rpb1_p9_emergencyContactRankName"
              type="text"
              name="emergencyContactRankName"
              value={formData.emergencyContactRankName || ''}
              onChange={handleChange}
              placeholder="ยศ ชื่อ สกุล"
              aria-label="ยศ ชื่อตัว ชื่อสกุล ติดต่อเร่งด่วน"
              className="form-input text-xs"
            />
          </div>
          <div>
            <label htmlFor="rpb1_p9_emergencyContactRelation" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">เกี่ยวข้องเป็น</label>
            <input
              id="rpb1_p9_emergencyContactRelation"
              type="text"
              name="emergencyContactRelation"
              value={formData.emergencyContactRelation || ''}
              onChange={handleChange}
              placeholder="เช่น บิดา, ภรรยา, พี่ชาย"
              aria-label="เกี่ยวข้องเป็น ติดต่อเร่งด่วน"
              className="form-input text-xs"
            />
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <label htmlFor="rpb1_p9_emergencyContactAddress" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ที่อยู่และหมายเลขโทรศัพท์ติดต่อเร่งด่วน
            </label>
            <input
              id="rpb1_p9_emergencyContactAddress"
              type="text"
              name="emergencyContactAddress"
              value={formData.emergencyContactAddress || ''}
              onChange={handleChange}
              placeholder="ที่อยู่และเบอร์โทรศัพท์"
              aria-label="ที่อยู่และหมายเลขโทรศัพท์ติดต่อเร่งด่วน"
              className="form-input text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

