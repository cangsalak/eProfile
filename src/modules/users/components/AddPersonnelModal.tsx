'use client';

import React, { useState, useEffect } from 'react';
import { Personnel } from '@/modules/users';
import PersonalInfoForm from './forms/PersonalInfoForm';
import MilitaryInfoForm from './forms/MilitaryInfoForm';
import ContactInfoForm from './forms/ContactInfoForm';
import ExtendedHistoryForm from './forms/ExtendedHistoryForm';
import { Modal, Button, ImageUpload } from '@/components/ui';

interface AddPersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newPerson: any) => void;
  initialData?: Personnel | null;
}

export default function AddPersonnelModal({
  isOpen,
  onClose,
  onAdd,
  initialData,
}: AddPersonnelModalProps) {
  const [formData, setFormData] = useState<Partial<Personnel>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          prefix: 'นาย',
          firstName: '',
          lastName: '',
          position: '',
          department: '',
          subDepartment: '',
          personnelType: 'นายทหารสัญญาบัตร',
          phone: '',
          mobile: '',
          email: '',
          status: 'ปฏิบัติงานปกติ',
          citizenId: '',
          dateOfBirth: '',
          bloodType: '',
          religion: '',
          badgeNo: '',
          role: 'OFFICER',
          officialId: '',
          militaryBranch: '',
          commissionDate: '',
          currentAddress: '',
          currentTambon: '',
          currentAmphoe: '',
          currentProvince: '',
          currentZipcode: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          emergencyContactRelation: '',
          notes: '',
        });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.position || !formData.citizenId || !formData.badgeNo) {
      return;
    }

    const submitData: any = { ...formData };

    if (!initialData) {
      submitData.id = `EMP-${Date.now()}`;
      if (!submitData.avatarColor) {
        submitData.avatarColor = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)];
      }
      submitData.skills = '[]';
    }

    onAdd(submitData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มข้อมูลบุคลากรใหม่'}
      subtitle="กรอกรายละเอียดข้อมูลส่วนตัว ประวัติรับราชการ และการติดต่อ"
      icon={initialData ? 'fa-solid fa-user-pen' : 'fa-solid fa-user-plus'}
      size="xl"
      className="p-0 overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6 text-sm max-h-[75vh] overflow-y-auto">
        <div className="flex justify-center border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="w-40 text-center">
            <ImageUpload
              id="personnelAvatarUpload"
              label="รูปโปรไฟล์"
              value={formData.avatarColor && (formData.avatarColor.startsWith('http') || formData.avatarColor.startsWith('data:image')) ? formData.avatarColor : null}
              onChange={(url) => setFormData((prev) => ({ ...prev, avatarColor: url }))}
              onRemove={() =>
                setFormData((prev) => ({
                  ...prev,
                  avatarColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)],
                }))
              }
              variant="avatar"
              placeholder="รูปโปรไฟล์"
            />
          </div>
        </div>

        <PersonalInfoForm formData={formData} setFormData={setFormData} />
        <MilitaryInfoForm formData={formData} setFormData={setFormData} />
        <ContactInfoForm formData={formData} setFormData={setFormData} />
        <ExtendedHistoryForm formData={formData} setFormData={setFormData} />

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold rounded-xl"
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon="fa-solid fa-save"
            className="text-xs font-bold rounded-xl"
          >
            บันทึกข้อมูล
          </Button>
        </div>
      </form>
    </Modal>
  );
}
