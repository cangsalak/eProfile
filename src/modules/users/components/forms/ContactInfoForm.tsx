import React from 'react';
import { Personnel } from '@/modules/users';
import { Input } from '@/components/ui';

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
        <Input
          id="contact-phone-input"
          label="เบอร์โทรศัพท์ (สำนักงาน/บ้าน)"
          type="text"
          placeholder="เช่น 02-123-4567"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />

        <Input
          id="contact-mobile-input"
          label="เบอร์มือถือ"
          type="text"
          placeholder="เช่น 081-234-5678"
          value={formData.mobile || ''}
          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
        />

        <Input
          id="contact-email-input"
          label="อีเมล (Email)"
          type="email"
          placeholder="example@mail.go.th"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="md:col-span-2">
          <Input
            id="contact-address-input"
            label="ที่อยู่ปัจจุบัน (บ้านเลขที่, หมู่, ถนน)"
            type="text"
            placeholder="ระบุที่อยู่ปัจจุบัน"
            value={formData.currentAddress || ''}
            onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
            required
          />
        </div>

        <Input
          id="contact-tambon-input"
          label="ตำบล/แขวง"
          type="text"
          placeholder="ตำบล/แขวง"
          value={formData.currentTambon || ''}
          onChange={(e) => setFormData({ ...formData, currentTambon: e.target.value })}
        />

        <Input
          id="contact-amphoe-input"
          label="อำเภอ/เขต"
          type="text"
          placeholder="อำเภอ/เขต"
          value={formData.currentAmphoe || ''}
          onChange={(e) => setFormData({ ...formData, currentAmphoe: e.target.value })}
        />

        <Input
          id="contact-province-input"
          label="จังหวัด"
          type="text"
          placeholder="จังหวัด"
          value={formData.currentProvince || ''}
          onChange={(e) => setFormData({ ...formData, currentProvince: e.target.value })}
        />

        <Input
          id="contact-zipcode-input"
          label="รหัสไปรษณีย์"
          type="text"
          placeholder="รหัสไปรษณีย์ 5 หลัก"
          value={formData.currentZipcode || ''}
          onChange={(e) => setFormData({ ...formData, currentZipcode: e.target.value })}
          className="font-mono"
        />
      </div>

      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 mt-6 flex items-center gap-2">
        <i className="fa-solid fa-person-circle-exclamation text-primary-500"></i> บุคคลที่ติดต่อได้กรณีฉุกเฉิน
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Input
          id="contact-emergency-name-input"
          label="ชื่อ-นามสกุล"
          type="text"
          placeholder="ชื่อผู้ติดต่อฉุกเฉิน"
          value={formData.emergencyContactName || ''}
          onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
        />

        <Input
          id="contact-emergency-phone-input"
          label="เบอร์โทรศัพท์ฉุกเฉิน"
          type="text"
          placeholder="เบอร์โทรติดต่อฉุกเฉิน"
          value={formData.emergencyContactPhone || ''}
          onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
        />

        <Input
          id="contact-emergency-relation-input"
          label="ความสัมพันธ์"
          type="text"
          placeholder="เช่น บิดา, มารดา, คู่สมรส"
          value={formData.emergencyContactRelation || ''}
          onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
        />
      </div>
    </div>
  );
}
