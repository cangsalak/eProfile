'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Personnel } from '@/modules/users';
import { Card, Button, Badge } from '@/components/ui';
import ImageUploadBox from '@/components/common/ImageUploadBox';
import PersonalInfoForm from '../components/forms/PersonalInfoForm';
import MilitaryInfoForm from '../components/forms/MilitaryInfoForm';
import ContactInfoForm from '../components/forms/ContactInfoForm';
import ExtendedHistoryForm from '../components/forms/ExtendedHistoryForm';
import Rpb1ProgressSection from '../components/rpb1/Rpb1ProgressSection';
import toast from 'react-hot-toast';

export default function PersonnelFormView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('id');

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
    currentTambon: '',
    currentAmphoe: '',
    currentProvince: '',
    currentZipcode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // If in Edit mode (id passed)
    if (editId) {
      setIsLoading(true);
      setIsEditMode(true);
      fetch(`/api/personnel/${editId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load personnel');
          return res.json();
        })
        .then((data) => {
          if (data) {
            setFormData(data);
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error('ไม่พบข้อมูลกำลังพลที่ต้องการแก้ไข');
          router.push('/modules/users/manage');
        })
        .finally(() => setIsLoading(false));
    }
  }, [editId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName?.trim()) {
      toast.error('กรุณาระบุชื่อจริง');
      return;
    }
    if (!formData.lastName?.trim()) {
      toast.error('กรุณาระบุนามสกุล');
      return;
    }
    if (!formData.position?.trim()) {
      toast.error('กรุณาระบุตำแหน่งหน้าที่');
      return;
    }
    if (!formData.citizenId?.trim() || formData.citizenId.length !== 13) {
      toast.error('กรุณาระบุเลขประจำตัวประชาชน 13 หลักให้ถูกต้อง');
      return;
    }
    if (!formData.badgeNo?.trim()) {
      toast.error('กรุณาระบุหมายเลขประจำตัวกำลังพล');
      return;
    }

    try {
      setIsSaving(true);
      const submitData: any = { ...formData };

      if (!isEditMode) {
        submitData.id = `EMP-${Date.now()}`;
        if (!submitData.avatarColor) {
          submitData.avatarColor = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)];
        }
        submitData.skills = '[]';

        const res = await fetch('/api/personnel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });

        if (res.ok) {
          toast.success('เพิ่มข้อมูลกำลังพลใหม่สำเร็จ');
          router.push('/modules/users/manage');
        } else {
          const errData = await res.json().catch(() => ({}));
          toast.error(errData.error || 'เกิดข้อผิดพลาดในการเพิ่มกำลังพล');
        }
      } else {
        const res = await fetch(`/api/personnel/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });

        if (res.ok) {
          toast.success('บันทึกการแก้ไขข้อมูลสำเร็จ');
          router.push('/modules/users/manage');
        } else {
          const errData = await res.json().catch(() => ({}));
          toast.error(errData.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-20 font-prompt">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium text-sm">กำลังโหลดข้อมูลกำลังพล...</p>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-6 font-prompt animate-fade-in">
      
      {/* 1. Breadcrumbs Navigation */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <Link href="/modules/users" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            ทำเนียบบุคลากร
          </Link>
          <span>/</span>
          <Link href="/modules/users/manage" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            จัดการบุคลากร
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {isEditMode ? `แก้ไขข้อมูล: ${formData.prefix || ''}${formData.firstName || ''} ${formData.lastName || ''}` : 'เพิ่มข้อมูลกำลังพลใหม่'}
          </span>
        </nav>

        <Link href="/modules/users/manage">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon="fa-solid fa-arrow-left"
            className="text-xs font-semibold rounded-xl"
          >
            กลับสู่ตารางกำลังพล
          </Button>
        </Link>
      </div>

      {/* 2. Hero Page Header */}
      <Card variant="convex" className="p-6 sm:p-7 rounded-[24px] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white flex items-center justify-center text-2xl shadow-lg shadow-primary-500/25 shrink-0">
              <i className={isEditMode ? "fa-solid fa-user-pen" : "fa-solid fa-user-plus"}></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {isEditMode ? 'แก้ไขข้อมูลกำลังพล' : 'เพิ่มข้อมูลบุคลากรใหม่'}
                </h1>
                <Badge variant={isEditMode ? 'warning' : 'primary'} size="sm">
                  {isEditMode ? 'โหมดแก้ไข' : 'กำลังพลใหม่'}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                กรอกข้อมูลประวัติส่วนบุคคล สังกัดหน่วย การติดต่อ และประวัติการรับราชการให้ครบถ้วนถูกต้อง
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => router.push('/modules/users/manage')}
              className="text-xs font-semibold rounded-xl"
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={isSaving}
              icon={isSaving ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-check"}
              className="text-xs font-bold rounded-xl shadow-md shadow-primary-500/20"
            >
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 0: Avatar Upload Card */}
        <Card variant="convex" className="p-6 sm:p-7 rounded-[24px]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-5 flex items-center gap-2">
            <i className="fa-solid fa-image text-primary-500"></i>
            <span>รูปถ่ายโปรไฟล์ประจำตัวกำลังพล</span>
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center sm:justify-start">
            <div className="w-36 shrink-0">
              <ImageUploadBox
                label="รูปถ่ายหน้าตรง"
                imageUrl={formData.avatarColor && formData.avatarColor.startsWith('data:image') ? formData.avatarColor : null}
                onChange={(base64: string | null) => setFormData({ ...formData, avatarColor: base64 || '' })}
                onRemove={() => setFormData({ ...formData, avatarColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)] })}
              />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 text-center sm:text-left">
              <p className="font-semibold text-slate-700 dark:text-slate-300">คำแนะนำรูปถ่ายประจำตัว:</p>
              <p>• รูปถ่ายหน้าตรง เครื่องแบบปกติ หรือชุดปฏิบัติงาน</p>
              <p>• ไฟล์ที่รองรับ: PNG, JPG, JPEG (ระบบจะทำการปรับขนาดและบีบอัดอัตโนมัติ)</p>
              <p>• หากไม่ได้อัปโหลด ระบบจะใช้ตัวอักษรย่อและสีประจำตัวเป็นภาพตัวแทน</p>
            </div>
          </div>
        </Card>

        {/* Section 1: Personal Info Form */}
        <Card variant="convex" className="p-6 sm:p-8 rounded-[24px] space-y-6">
          <PersonalInfoForm
            formData={formData}
            setFormData={setFormData}
          />
        </Card>

        {/* Section 2: Military & Official Info Form */}
        <Card variant="convex" className="p-6 sm:p-8 rounded-[24px] space-y-6">
          <MilitaryInfoForm
            formData={formData}
            setFormData={setFormData}
          />
        </Card>

        {/* Section 3: Contact Info Form */}
        <Card variant="convex" className="p-6 sm:p-8 rounded-[24px] space-y-6">
          <ContactInfoForm formData={formData} setFormData={setFormData} />
        </Card>

        {/* Section 4: Extended History Form */}
        <Card variant="convex" className="p-6 sm:p-8 rounded-[24px] space-y-6">
          <ExtendedHistoryForm formData={formData} setFormData={setFormData} />
        </Card>

        {/* Section 5: RPB-1 Progress & Management (Only in Edit Mode) */}
        {isEditMode && editId && (
          <Rpb1ProgressSection personnelId={editId} />
        )}

        {/* 4. Sticky Bottom Action Bar */}
        <div className="sticky bottom-6 z-30 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex justify-between items-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            ตรวจสอบความถูกต้องของข้อมูลก่อนกดบันทึก
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => router.push('/modules/users/manage')}
              className="text-xs font-semibold rounded-xl"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving}
              icon={isSaving ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-check"}
              className="text-xs font-bold rounded-xl shadow-md shadow-primary-500/25"
            >
              {isSaving ? 'กำลังบันทึก...' : (isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกกำลังพลใหม่')}
            </Button>
          </div>
        </div>

      </form>
    </div>
  );
}
