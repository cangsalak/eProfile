import React from 'react';
import { Personnel } from '@/modules/users';
import { Input, Select } from '@/components/ui';

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
        <Select
          id="personal-prefix-select"
          label="คำนำหน้า / ยศ"
          value={formData.prefix || ''}
          onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
          required
        >
          <option value="">-- เลือกคำนำหน้า/ยศ --</option>
          {prefixes.map((p, idx) => (
            <option key={idx} value={p}>{p}</option>
          ))}
        </Select>

        <Input
          id="personal-firstname-input"
          label="ชื่อจริง"
          type="text"
          placeholder="ชื่อจริง"
          value={formData.firstName || ''}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          required
        />

        <Input
          id="personal-lastname-input"
          label="นามสกุล"
          type="text"
          placeholder="นามสกุล"
          value={formData.lastName || ''}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Input
          id="personal-citizenid-input"
          label="เลขบัตรประชาชน (13 หลัก)"
          type="text"
          maxLength={13}
          placeholder="เลขบัตรประชาชน 13 หลัก"
          value={formData.citizenId || ''}
          onChange={(e) => setFormData({ ...formData, citizenId: e.target.value })}
          className="font-mono"
          required
        />

        <Input
          id="personal-birthdate-input"
          label="วัน/เดือน/ปีเกิด"
          type="text"
          placeholder="เช่น 15/01/2535"
          value={formData.dateOfBirth || ''}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
        />

        <Select
          id="personal-bloodtype-select"
          label="กรุ๊ปเลือด"
          value={formData.bloodType || ''}
          onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
        >
          <option value="">-- ไม่ระบุ / เลือกกรุ๊ปเลือด --</option>
          {bloodGroups.map((bg, idx) => (
            <option key={idx} value={bg}>{bg}</option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Input
          id="personal-religion-input"
          label="ศาสนา"
          type="text"
          placeholder="เช่น พุทธ, อิสลาม, คริสต์"
          value={formData.religion || ''}
          onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
        />
      </div>
    </div>
  );
}
