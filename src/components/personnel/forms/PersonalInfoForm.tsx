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
  const formControlClass = "w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all";
  const labelClass = "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div>
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 flex items-center gap-2">
        <i className="fa-solid fa-user text-primary-500"></i> ข้อมูลส่วนตัว
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="personal-prefix-select" className={labelClass}>
            คำนำหน้า / ยศ <span className="text-rose-500">*</span>
          </label>
          <select
            id="personal-prefix-select"
            aria-label="คำนำหน้า / ยศ"
            value={formData.prefix || ''}
            onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
            className={`${formControlClass} cursor-pointer`}
            required
          >
            <option value="">-- เลือกคำนำหน้า/ยศ --</option>
            {prefixes.map((p, idx) => (
              <option key={idx} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="personal-firstname-input" className={labelClass}>
            ชื่อจริง <span className="text-rose-500">*</span>
          </label>
          <input
            id="personal-firstname-input"
            aria-label="ชื่อจริง"
            type="text"
            placeholder="ชื่อจริง"
            value={formData.firstName || ''}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className={formControlClass}
            required
          />
        </div>

        <div>
          <label htmlFor="personal-lastname-input" className={labelClass}>
            นามสกุล <span className="text-rose-500">*</span>
          </label>
          <input
            id="personal-lastname-input"
            aria-label="นามสกุล"
            type="text"
            placeholder="นามสกุล"
            value={formData.lastName || ''}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className={formControlClass}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="personal-citizenid-input" className={labelClass}>
            เลขบัตรประชาชน (13 หลัก) <span className="text-rose-500">*</span>
          </label>
          <input
            id="personal-citizenid-input"
            aria-label="เลขบัตรประชาชน 13 หลัก"
            type="text"
            maxLength={13}
            placeholder="เลขบัตรประชาชน 13 หลัก"
            value={formData.citizenId || ''}
            onChange={(e) => setFormData({ ...formData, citizenId: e.target.value })}
            className={`${formControlClass} font-mono`}
            required
          />
        </div>

        <div>
          <label htmlFor="personal-birthdate-input" className={labelClass}>
            วัน/เดือน/ปีเกิด
          </label>
          <input
            id="personal-birthdate-input"
            aria-label="วัน/เดือน/ปีเกิด"
            type="text"
            placeholder="เช่น 15/01/2535"
            value={formData.dateOfBirth || ''}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            className={formControlClass}
          />
        </div>

        <div>
          <label htmlFor="personal-bloodtype-select" className={labelClass}>
            กรุ๊ปเลือด
          </label>
          <select
            id="personal-bloodtype-select"
            aria-label="กรุ๊ปเลือด"
            value={formData.bloodType || ''}
            onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
            className={`${formControlClass} cursor-pointer`}
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
          <label htmlFor="personal-religion-input" className={labelClass}>
            ศาสนา
          </label>
          <input
            id="personal-religion-input"
            aria-label="ศาสนา"
            type="text"
            placeholder="เช่น พุทธ, อิสลาม, คริสต์"
            value={formData.religion || ''}
            onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
            className={formControlClass}
          />
        </div>
      </div>
    </div>
  );
}
