import React from 'react';
import { Personnel } from '@/types/personnel';

interface ContactInfoFormProps {
  formData: Partial<Personnel>;
  setFormData: (data: Partial<Personnel>) => void;
}

export default function ContactInfoForm({ formData, setFormData }: ContactInfoFormProps) {
  return (
    <div>
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 mt-6 flex items-center gap-2">
        <i className="fa-solid fa-address-book text-primary-500"></i> ข้อมูลการติดต่อ
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            เบอร์โทรศัพท์ (สำนักงาน/บ้าน)
          </label>
          <input
            type="text"
            placeholder="เช่น 02-123-4567"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            เบอร์มือถือ
          </label>
          <input
            type="text"
            placeholder="เช่น 081-234-5678"
            value={formData.mobile || ''}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            อีเมล (Email)
          </label>
          <input
            type="email"
            placeholder="example@mail.go.th"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            ที่อยู่ปัจจุบัน (บ้านเลขที่, หมู่, ถนน) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="ระบุที่อยู่ปัจจุบัน"
            value={formData.currentAddress || ''}
            onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            ตำบล/แขวง
          </label>
          <input
            type="text"
            placeholder="ตำบล/แขวง"
            value={formData.currentTambon || ''}
            onChange={(e) => setFormData({ ...formData, currentTambon: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            อำเภอ/เขต
          </label>
          <input
            type="text"
            placeholder="อำเภอ/เขต"
            value={formData.currentAmphoe || ''}
            onChange={(e) => setFormData({ ...formData, currentAmphoe: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            จังหวัด
          </label>
          <input
            type="text"
            placeholder="จังหวัด"
            value={formData.currentProvince || ''}
            onChange={(e) => setFormData({ ...formData, currentProvince: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            รหัสไปรษณีย์
          </label>
          <input
            type="text"
            placeholder="รหัสไปรษณีย์ 5 หลัก"
            value={formData.currentZipcode || ''}
            onChange={(e) => setFormData({ ...formData, currentZipcode: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
      </div>

      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 mt-6 flex items-center gap-2">
        <i className="fa-solid fa-person-circle-exclamation text-primary-500"></i> บุคคลที่ติดต่อได้กรณีฉุกเฉิน
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            ชื่อ-นามสกุล
          </label>
          <input
            type="text"
            placeholder="ชื่อผู้ติดต่อฉุกเฉิน"
            value={formData.emergencyContactName || ''}
            onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            เบอร์โทรศัพท์ฉุกเฉิน
          </label>
          <input
            type="text"
            placeholder="เบอร์โทรติดต่อฉุกเฉิน"
            value={formData.emergencyContactPhone || ''}
            onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            ความสัมพันธ์
          </label>
          <input
            type="text"
            placeholder="เช่น บิดา, มารดา, คู่สมรส"
            value={formData.emergencyContactRelation || ''}
            onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
