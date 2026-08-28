'use client';

import React, { useState, useEffect } from 'react';
import { Vehicle } from '../../types/personnel';
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
    type: 'รถยนต์',
    licensePlate: '',
    brand: '',
    model: '',
    color: '',
    photoFront: null,
    photoBack: null,
    photoSide: null,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          type: 'รถยนต์',
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
      onClose();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลรถยนต์');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700/50 pb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            <i className="fa-solid fa-car mr-3 text-primary-400"></i>
            {initialData ? 'แก้ไขข้อมูลยานพาหนะ' : 'เพิ่มยานพาหนะใหม่'}
          </h3>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-slate-900/30 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">ข้อมูลพื้นฐานรถยนต์</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">ประเภทรถ</label>
                <select
                  value={formData.type || 'รถยนต์'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                  required
                >
                  <option value="รถยนต์">รถยนต์</option>
                  <option value="รถจักรยานยนต์">รถจักรยานยนต์</option>
                  <option value="รถตู้">รถตู้</option>
                  <option value="รถกระบะ">รถกระบะ</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">เลขทะเบียนรถ (พร้อมจังหวัด)</label>
                <input
                  type="text"
                  placeholder="เช่น กท 1234 กรุงเทพมหานคร"
                  value={formData.licensePlate || ''}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">ยี่ห้อ (Brand)</label>
                <input
                  type="text"
                  placeholder="เช่น Toyota, Honda"
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">รุ่น (Model)</label>
                <input
                  type="text"
                  placeholder="เช่น Altis, Civic"
                  value={formData.model || ''}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">สี (Color)</label>
                <input
                  type="text"
                  placeholder="เช่น ขาว, ดำ, บรอนซ์เงิน"
                  value={formData.color || ''}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Photo Uploads */}
          <div className="bg-white dark:bg-slate-900/30 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">รูปถ่ายรถยนต์ (3 มุม)</h4>
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
            <p className="text-xs text-slate-500 mt-4 text-center"><i className="fa-solid fa-info-circle mr-1"></i>ระบบจะทำการลดขนาดภาพให้อัตโนมัติ เพื่อประหยัดพื้นที่จัดเก็บ</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors font-medium disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 shadow-[0_0_15px_rgba(99,102,241,0.3)] text-white font-medium transition-all disabled:opacity-50 flex items-center"
            >
              {isSaving ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-save mr-2"></i>}
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
