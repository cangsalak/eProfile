import React from 'react';
import { Personnel } from '@/types/personnel';

interface PersonalInfoFormProps {
  formData: Partial<Personnel>;
  setFormData: (data: Partial<Personnel>) => void;
  prefixes?: string[];
  bloodGroups?: string[];
}

export default function PersonalInfoForm({
  formData,
  setFormData,
  prefixes = ['นาย', 'นาง', 'นางสาว', 'ร.ต.', 'ร.ท.', 'ร.อ.', 'พ.ต.', 'พ.ท.', 'พ.อ.', 'พล.ต.', 'พล.ท.', 'พล.อ.', 'ส.ต.', 'ส.ท.', 'ส.อ.', 'จ.ส.ต.', 'จ.ส.ท.', 'จ.ส.อ.'],
  bloodGroups = ['A', 'B', 'AB', 'O'],
}: PersonalInfoFormProps) {
  return (
    <div>
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 flex items-center gap-2">
        <i className="fa-solid fa-user text-primary-500"></i> ข้อมูลส่วนตัว
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            คำนำหน้า / ยศ <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.prefix || ''}
            onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
            required
          >
            <option value="">-- เลือกคำนำหน้า/ยศ --</option>
            {prefixes.map((p, idx) => (
              <option key={idx} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            ชื่อจริง <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="ชื่อจริง"
            value={formData.firstName || ''}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            นามสกุล <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="นามสกุล"
            value={formData.lastName || ''}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            เลขบัตรประชาชน (13 หลัก) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            maxLength={13}
            placeholder="เลขบัตรประชาชน 13 หลัก"
            value={formData.citizenId || ''}
            onChange={(e) => setFormData({ ...formData, citizenId: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            วัน/เดือน/ปีเกิด
          </label>
          <input
            type="text"
            placeholder="เช่น 15/01/2535"
            value={formData.dateOfBirth || ''}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            กรุ๊ปเลือด
          </label>
          <select
            value={formData.bloodType || ''}
            onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
          >
            <option value="">-- ไม่ระบุ / เลือกกรุ๊ปเลือด --</option>
            {bloodGroups.map((bg, idx) => (
              <option key={idx} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            ศาสนา
          </label>
          <input
            type="text"
            placeholder="เช่น พุทธ, อิสลาม, คริสต์"
            value={formData.religion || ''}
            onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
            className="w-full h-11 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
