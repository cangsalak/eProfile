'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Vehicle } from '@/types/personnel';
import ImageUploadBox from '../common/ImageUploadBox';

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleData: Partial<Vehicle>) => Promise<void>;
  initialData?: Vehicle | null;
  personnelId: string;
}

export default function VehicleFormModal({ isOpen, onClose, onSave, initialData, personnelId }: VehicleFormModalProps) {
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    type: 'รถยนต์ส่วนบุคคล',
    licensePlate: '',
    brand: '',
    model: '',
    color: '',
    photoFront: null,
    photoBack: null,
    photoSide: null,
  });
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([
    'รถยนต์ส่วนบุคคล',
    'รถจักรยานยนต์',
    'รถยนต์ราชการ',
    'รถจักรยานยนต์ราชการ',
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const formControlClass = "w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all";
  const labelClass = "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5";

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then(res => res.json())
        .then(settings => {
          if (settings.vehicleTypes) {
            try {
              const parsed = JSON.parse(settings.vehicleTypes);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setVehicleTypes(parsed);
              }
            } catch (_) {}
          }
        })
        .catch(console.error);

      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          type: 'รถยนต์ส่วนบุคคล',
          licensePlate: '',
          brand: '',
          model: '',
          color: '',
          photoFront: null,
          photoBack: null,
          photoSide: null,
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.licensePlate || !formData.brand || !formData.color) return;
    
    setIsSaving(true);
    try {
      await onSave({ ...formData, personnelId });
      toast.success(initialData ? 'อัปเดตข้อมูลรถยนต์สำเร็จ' : 'บันทึกข้อมูลรถยนต์สำเร็จ');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูลรถยนต์');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <i className="fa-solid fa-car text-sm"></i>
            </div>
            <span>{initialData ? 'แก้ไขข้อมูลยานพาหนะ' : 'เพิ่มยานพาหนะใหม่'}</span>
          </h3>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <i className="fa-solid fa-info-circle text-primary-500"></i>
              ข้อมูลพื้นฐานยานพาหนะ
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="vehicle-type-select" className={labelClass}>
                  ประเภทรถ <span className="text-rose-500">*</span>
                </label>
                <select
                  id="vehicle-type-select"
                  aria-label="ประเภทรถ"
                  value={formData.type || vehicleTypes[0] || 'รถยนต์ส่วนบุคคล'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`${formControlClass} cursor-pointer`}
                  required
                >
                  {vehicleTypes.map((v, idx) => (
                    <option key={idx} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="vehicle-license-plate" className={labelClass}>
                  เลขทะเบียนรถ (พร้อมจังหวัด) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="vehicle-license-plate"
                  aria-label="เลขทะเบียนรถ"
                  type="text"
                  placeholder="เช่น กท 1234 กรุงเทพมหานคร"
                  value={formData.licensePlate || ''}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  className={formControlClass}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label htmlFor="vehicle-brand" className={labelClass}>
                  ยี่ห้อ (Brand) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="vehicle-brand"
                  aria-label="ยี่ห้อยานพาหนะ"
                  type="text"
                  placeholder="เช่น Toyota, Honda"
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className={formControlClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="vehicle-model" className={labelClass}>
                  รุ่น (Model)
                </label>
                <input
                  id="vehicle-model"
                  aria-label="รุ่นยานพาหนะ"
                  type="text"
                  placeholder="เช่น Altis, Civic"
                  value={formData.model || ''}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className={formControlClass}
                />
              </div>
              <div>
                <label htmlFor="vehicle-color" className={labelClass}>
                  สี (Color) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="vehicle-color"
                  aria-label="สียานพาหนะ"
                  type="text"
                  placeholder="เช่น ขาว, ดำ, บรอนซ์เงิน"
                  value={formData.color || ''}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className={formControlClass}
                  required
                />
              </div>
            </div>
          </div>

          {/* Photo Uploads */}
          <div className="bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <i className="fa-solid fa-camera text-primary-500"></i>
              รูปถ่ายรถยนต์ (3 มุม)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ImageUploadBox 
                label="ด้านหน้า (เห็นป้ายทะเบียน)" 
                imageUrl={formData.photoFront} 
                onChange={(base64) => setFormData({ ...formData, photoFront: base64 })}
                onRemove={() => setFormData({ ...formData, photoFront: null })}
              />
              <ImageUploadBox 
                label="ด้านข้าง" 
                imageUrl={formData.photoSide} 
                onChange={(base64) => setFormData({ ...formData, photoSide: base64 })}
                onRemove={() => setFormData({ ...formData, photoSide: null })}
              />
              <ImageUploadBox 
                label="ด้านหลัง" 
                imageUrl={formData.photoBack} 
                onChange={(base64) => setFormData({ ...formData, photoBack: base64 })}
                onRemove={() => setFormData({ ...formData, photoBack: null })}
              />
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center">
              <i className="fa-solid fa-info-circle mr-1"></i>ระบบจะทำการบีบอัดภาพให้อัตโนมัติ เพื่อความเร็วในการโหลด
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 shadow-md shadow-primary-500/25 text-white text-xs sm:text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save"></i>}
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
