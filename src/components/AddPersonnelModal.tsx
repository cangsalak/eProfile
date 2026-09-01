'use client';

import React, { useState, useEffect } from 'react';
import { Personnel } from '@/types/personnel';
import ImageUploadBox from './common/ImageUploadBox';
import PersonalInfoForm from './personnel/forms/PersonalInfoForm';
import MilitaryInfoForm from './personnel/forms/MilitaryInfoForm';
import ContactInfoForm from './personnel/forms/ContactInfoForm';
import ExtendedHistoryForm from './personnel/forms/ExtendedHistoryForm';

interface AddPersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newPerson: any) => void;
  initialData?: Personnel | null;
}

export default function AddPersonnelModal({ isOpen, onClose, onAdd, initialData }: AddPersonnelModalProps) {
  const [formData, setFormData] = useState<Partial<Personnel>>({});
  const [departments, setDepartments] = useState<any[]>([]);
  const [personnelTypes, setPersonnelTypes] = useState<string[]>(['นายทหารสัญญาบัตร', 'นายทหารประทวน', 'พนักงานราชการ', 'ลูกจ้าง', 'ทหารกองประจำการ']);
  const [statusList, setStatusList] = useState<string[]>(['ปฏิบัติงานปกติ', 'ลาพักผ่อน', 'ลาป่วย', 'ออกพื้นที่', 'พ้นสภาพ']);
  const [prefixes, setPrefixes] = useState<string[]>([]);
  const [bloodGroups, setBloodGroups] = useState<string[]>([]);
  const [roles, setRoles] = useState<{name: string, displayName: string}[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch departments
      fetch('/api/departments')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setDepartments(data);
          }
        })
        .catch(console.error);

      // Fetch dynamic settings for dropdowns
      fetch('/api/settings')
        .then(res => res.json())
        .then(settings => {
          if (settings.personnelTypes) {
            setPersonnelTypes(JSON.parse(settings.personnelTypes));
          }
          if (settings.statusList) {
            setStatusList(JSON.parse(settings.statusList));
          }
          if (settings.prefixes) {
            setPrefixes(JSON.parse(settings.prefixes));
          }
          if (settings.bloodGroups) {
            setBloodGroups(JSON.parse(settings.bloodGroups));
          }
        })
        .catch(console.error);

      // Fetch roles
      fetch('/api/roles')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setRoles(data);
          }
        })
        .catch(console.error);

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.position || !formData.citizenId || !formData.badgeNo) return;

    let submitData: any = { ...formData };
    
    if (!initialData) {
      submitData.id = `EMP-${Date.now()}`;
      submitData.avatarColor = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)];
      submitData.skills = '[]';
    }

    onAdd(submitData);
    onClose();
  };

  return (
    <div className="no-print fixed inset-0 z-[100] bg-slate-100 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700/50 pb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {initialData ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มข้อมูลบุคลากรใหม่'}
          </h3>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          <div className="flex justify-center mb-4 border-b border-slate-200 dark:border-slate-700 pb-6">
            <div className="w-32">
              <ImageUploadBox 
                label="รูปโปรไฟล์"
                imageUrl={formData.avatarColor && formData.avatarColor.startsWith('data:image') ? formData.avatarColor : null}
                onChange={(base64) => setFormData({ ...formData, avatarColor: base64 })}
                onRemove={() => setFormData({ ...formData, avatarColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)] })}
              />
            </div>
          </div>

          <PersonalInfoForm 
            formData={formData} 
            setFormData={setFormData} 
            prefixes={prefixes}
            bloodGroups={bloodGroups}
          />
          
          <MilitaryInfoForm 
            formData={formData} 
            setFormData={setFormData} 
            departments={departments}
            personnelTypes={personnelTypes}
            statusList={statusList}
            roles={roles}
          />

          <ContactInfoForm formData={formData} setFormData={setFormData} />
          
          <ExtendedHistoryForm formData={formData} setFormData={setFormData} />

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 shadow-[0_0_15px_rgba(99,102,241,0.3)] text-white font-medium transition-all"
            >
              <i className="fa-solid fa-save mr-2"></i>
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
