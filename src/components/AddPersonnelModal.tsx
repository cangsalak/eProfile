'use client';

import React, { useState, useEffect } from 'react';
import { Personnel } from '../types/personnel';
import ImageUploadBox from './common/ImageUploadBox';

interface AddPersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newPerson: any) => void;
  initialData?: Personnel | null;
}

export default function AddPersonnelModal({ isOpen, onClose, onAdd, initialData }: AddPersonnelModalProps) {
  const [formData, setFormData] = useState<Partial<Personnel>>({
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
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    royalDecorations: '',
    trainingHistory: '',
    notes: '',
  });
  const [password, setPassword] = useState('');
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);
  const [personnelTypes, setPersonnelTypes] = useState<string[]>(['นายทหารสัญญาบัตร', 'นายทหารประทวน', 'พนักงานราชการ', 'ลูกจ้าง', 'ทหารกองประจำการ']);
  const [statusList, setStatusList] = useState<string[]>(['ปฏิบัติงานปกติ', 'ลาพักผ่อน', 'ลาป่วย', 'ออกพื้นที่', 'พ้นสภาพ']);

  useEffect(() => {
    if (isOpen) {
      // Fetch departments
      fetch('/api/departments')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setDepartments(data);
            if (data.length > 0 && !initialData?.department) {
              setFormData(prev => ({ ...prev, department: data[0].name }));
            }
          } else {
            console.error('API did not return an array:', data);
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
        })
        .catch(console.error);

      if (initialData) {
          setFormData(initialData);
          setPassword('');
        } else {
          setFormData({
            prefix: 'นาย',
            firstName: '',
            lastName: '',
            position: '',
            department: departments.length > 0 ? departments[0].name : '',
            subDepartment: '',
            personnelType: 'นายทหารสัญญาบัตร',
            phone: '',
            mobile: '',
            email: '',
            status: 'ปฏิบัติงานปกติ',
            citizenId: '',
            badgeNo: '',
            role: 'OFFICER',
          });
        setPassword('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.position || !formData.citizenId || !formData.badgeNo) return;

    let submitData: any = { ...formData };
    
    if (!initialData) {
      // Create new
      submitData.id = `EMP-${Date.now()}`;
      // username and password will be handled by the API using citizenId and badgeNo
      submitData.avatarColor = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)];
      submitData.skills = '[]';
    } else {
      // Update
      if (password) {
        submitData.password = password;
      }
    }

    onAdd(submitData);
    onClose();
  };

  return (
    <div className="no-print fixed inset-0 z-[100] bg-slate-100 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700/50 pb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {initialData ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มข้อมูลบุคลากรใหม่'}
          </h3>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          <div className="flex justify-center mb-2">
            <div className="w-32">
              <ImageUploadBox 
                label="รูปโปรไฟล์"
                imageUrl={formData.avatarColor && formData.avatarColor.startsWith('data:image') ? formData.avatarColor : null}
                onChange={(base64) => setFormData({ ...formData, avatarColor: base64 })}
                onRemove={() => setFormData({ ...formData, avatarColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)] })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">คำนำหน้า / ยศ</label>
              <input
                type="text"
                value={formData.prefix || ''}
                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">ชื่อจริง</label>
              <input
                type="text"
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">นามสกุล</label>
              <input
                type="text"
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">ตำแหน่งหน้าที่</label>
              <input
                type="text"
                value={formData.position || ''}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">ประเภทกำลังพล</label>
              <select
                value={formData.personnelType || personnelTypes[0] || ''}
                onChange={(e) => setFormData({ ...formData, personnelType: e.target.value })}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
              >
                {personnelTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">หน่วยงาน / กอง</label>
              <select
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                required
              >
                <option value="">-- เลือกหน่วยงาน --</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">เลขบัตรประชาชน (13 หลัก) *ใช้เข้าสู่ระบบ</label>
              <input
                type="text"
                maxLength={13}
                value={formData.citizenId || ''}
                onChange={(e) => setFormData({ ...formData, citizenId: e.target.value })}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">เลขประจำตัวทหาร (10 หลัก) *ใช้เป็นรหัสผ่าน</label>
              <input
                type="text"
                maxLength={10}
                value={formData.badgeNo || ''}
                onChange={(e) => setFormData({ ...formData, badgeNo: e.target.value })}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">เหล่า / สายวิทยาการ</label>
              <input
                type="text"
                value={formData.militaryBranch || ''}
                onChange={(e) => setFormData({ ...formData, militaryBranch: e.target.value })}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">วัน/เดือน/ปีเกิด</label>
              <input
                type="text"
                value={formData.dateOfBirth || ''}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">กรุ๊ปเลือด</label>
              <input
                type="text"
                value={formData.bloodType || ''}
                onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">ศาสนา</label>
              <input
                type="text"
                value={formData.religion || ''}
                onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">ที่อยู่ปัจจุบัน</label>
              <textarea
                value={formData.currentAddress || ''}
                onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 resize-none"
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">เบอร์มือถือ</label>
              <input
                type="text"
                value={formData.mobile || ''}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">สถานะ</label>
              <select
                value={formData.status || statusList[0] || ''}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
              >
                {statusList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">สิทธิ์การใช้งาน (Role)</label>
              <select
                value={formData.role || 'OFFICER'}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
              >
                <option value="OFFICER">เจ้าหน้าที่ทั่วไป (OFFICER)</option>
                <option value="ADMIN">ผู้ดูแลระบบ (ADMIN)</option>
              </select>
            </div>
          </div>

          {/* Remove manual password field since it uses badgeNo now */}

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
