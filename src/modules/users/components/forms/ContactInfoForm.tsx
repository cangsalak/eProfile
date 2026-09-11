import React from 'react';
import { Personnel } from '@/types/personnel';

interface ContactInfoFormProps {
  formData: Partial<Personnel>;
  setFormData: (data: Partial<Personnel>) => void;
}

export default function ContactInfoForm({ formData, setFormData }: ContactInfoFormProps) {
  const formControlClass = "form-control";
  const labelClass = "form-label";


  return (
    <div>
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 mt-6 flex items-center gap-2">
        <i className="fa-solid fa-address-book text-primary-500"></i> ข้อมูลการติดต่อ
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="contact-phone-input" className={labelClass}>
            เบอร์โทรศัพท์ (สำนักงาน/บ้าน)
          </label>
          <input
            id="contact-phone-input"
            aria-label="เบอร์โทรศัพท์"
            type="text"
            placeholder="เช่น 02-123-4567"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={formControlClass}
          />
        </div>

        <div>
          <label htmlFor="contact-mobile-input" className={labelClass}>
            เบอร์มือถือ
          </label>
          <input
            id="contact-mobile-input"
            aria-label="เบอร์มือถือ"
            type="text"
            placeholder="เช่น 081-234-5678"
            value={formData.mobile || ''}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            className={formControlClass}
          />
        </div>

        <div>
          <label htmlFor="contact-email-input" className={labelClass}>
            อีเมล (Email)
          </label>
          <input
            id="contact-email-input"
            aria-label="อีเมล"
            type="email"
            placeholder="example@mail.go.th"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={formControlClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="md:col-span-2">
          <label htmlFor="contact-address-input" className={labelClass}>
            ที่อยู่ปัจจุบัน (บ้านเลขที่, หมู่, ถนน) <span className="text-rose-500">*</span>
          </label>
          <input
            id="contact-address-input"
            aria-label="ที่อยู่ปัจจุบัน"
            type="text"
            placeholder="ระบุที่อยู่ปัจจุบัน"
            value={formData.currentAddress || ''}
            onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
            className={formControlClass}
            required
          />
        </div>

        <div>
          <label htmlFor="contact-tambon-input" className={labelClass}>
            ตำบล/แขวง
          </label>
          <input
            id="contact-tambon-input"
            aria-label="ตำบล/แขวง"
            type="text"
            placeholder="ตำบล/แขวง"
            value={formData.currentTambon || ''}
            onChange={(e) => setFormData({ ...formData, currentTambon: e.target.value })}
            className={formControlClass}
          />
        </div>

        <div>
          <label htmlFor="contact-amphoe-input" className={labelClass}>
            อำเภอ/เขต
          </label>
          <input
            id="contact-amphoe-input"
            aria-label="อำเภอ/เขต"
            type="text"
            placeholder="อำเภอ/เขต"
            value={formData.currentAmphoe || ''}
            onChange={(e) => setFormData({ ...formData, currentAmphoe: e.target.value })}
            className={formControlClass}
          />
        </div>

        <div>
          <label htmlFor="contact-province-input" className={labelClass}>
            จังหวัด
          </label>
          <input
            id="contact-province-input"
            aria-label="จังหวัด"
            type="text"
            placeholder="จังหวัด"
            value={formData.currentProvince || ''}
            onChange={(e) => setFormData({ ...formData, currentProvince: e.target.value })}
            className={formControlClass}
          />
        </div>

        <div>
          <label htmlFor="contact-zipcode-input" className={labelClass}>
            รหัสไปรษณีย์
          </label>
          <input
            id="contact-zipcode-input"
            aria-label="รหัสไปรษณีย์"
            type="text"
            placeholder="รหัสไปรษณีย์ 5 หลัก"
            value={formData.currentZipcode || ''}
            onChange={(e) => setFormData({ ...formData, currentZipcode: e.target.value })}
            className={`${formControlClass} font-mono`}
          />
        </div>
      </div>

      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 mt-6 flex items-center gap-2">
        <i className="fa-solid fa-person-circle-exclamation text-primary-500"></i> บุคคลที่ติดต่อได้กรณีฉุกเฉิน
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="contact-emergency-name-input" className={labelClass}>
            ชื่อ-นามสกุล
          </label>
          <input
            id="contact-emergency-name-input"
            aria-label="ชื่อผู้ติดต่อฉุกเฉิน"
            type="text"
            placeholder="ชื่อผู้ติดต่อฉุกเฉิน"
            value={formData.emergencyContactName || ''}
            onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
            className={formControlClass}
          />
        </div>

        <div>
          <label htmlFor="contact-emergency-phone-input" className={labelClass}>
            เบอร์โทรศัพท์ฉุกเฉิน
          </label>
          <input
            id="contact-emergency-phone-input"
            aria-label="เบอร์โทรศัพท์ฉุกเฉิน"
            type="text"
            placeholder="เบอร์โทรติดต่อฉุกเฉิน"
            value={formData.emergencyContactPhone || ''}
            onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
            className={formControlClass}
          />
        </div>

        <div>
          <label htmlFor="contact-emergency-relation-input" className={labelClass}>
            ความสัมพันธ์
          </label>
          <input
            id="contact-emergency-relation-input"
            aria-label="ความสัมพันธ์กับผู้ติดต่อฉุกเฉิน"
            type="text"
            placeholder="เช่น บิดา, มารดา, คู่สมรส"
            value={formData.emergencyContactRelation || ''}
            onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
            className={formControlClass}
          />
        </div>
      </div>
    </div>
  );
}
