'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Personnel } from '@/types/personnel';
import VehicleList from '@/components/vehicles/VehicleList';
import PersonalInfoForm from '@/components/personnel/forms/PersonalInfoForm';
import MilitaryInfoForm from '@/components/personnel/forms/MilitaryInfoForm';
import ContactInfoForm from '@/components/personnel/forms/ContactInfoForm';
import ExtendedHistoryForm from '@/components/personnel/forms/ExtendedHistoryForm';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<Personnel | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'official' | 'history' | 'vehicles' | 'security'>('info');
  
  const [formData, setFormData] = useState<Partial<Personnel>>({});
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [departments, setDepartments] = useState<any[]>([]);
  const [prefixes, setPrefixes] = useState<string[]>([]);
  const [bloodGroups, setBloodGroups] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 1. Fetch current auth user
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
          setFormData(data.user);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        } else {
          const savedUser = localStorage.getItem('currentUser');
          if (savedUser) {
            const parsed = JSON.parse(savedUser);
            setCurrentUser(parsed);
            setFormData(parsed);
          }
        }
      })
      .catch(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setCurrentUser(parsed);
          setFormData(parsed);
        }
      });

    // 2. Fetch departments
    fetch('/api/departments')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setDepartments(data);
      })
      .catch(console.error);

    // 3. Fetch settings
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : {}))
      .then((settings: any) => {
        if (settings?.prefixes) {
          try {
            setPrefixes(JSON.parse(settings.prefixes));
          } catch {}
        }
        if (settings?.bloodGroups) {
          try {
            setBloodGroups(JSON.parse(settings.bloodGroups));
          } catch {}
        }
      })
      .catch(console.error);
  }, []);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-20 font-prompt">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium text-sm">กำลังโหลดข้อมูลโปรไฟล์ส่วนตัว...</p>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.85);
          setFormData((prev) => ({ ...prev, avatarColor: base64 }));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.85);
          setFormData((prev) => ({ ...prev, coverPhoto: base64 }));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      setIsSaving(true);
      const updateData: any = { ...formData };
      if (password) {
        updateData.password = password;
      }

      const res = await fetch(`/api/personnel/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
        setFormData(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setIsEditing(false);
        setPassword('');
        setConfirmPassword('');
        toast.success('บันทึกข้อมูลโปรไฟล์สำเร็จ');
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsSaving(false);
    }
  };

  const renderAvatar = (person: Partial<Personnel>) => {
    const isImage = person.avatarColor?.startsWith('data:image') || person.avatarColor?.startsWith('http');
    if (isImage) {
      return <img src={person.avatarColor} alt="Profile Avatar" className="w-full h-full object-cover" />;
    }
    return (
      <div
        className="w-full h-full flex items-center justify-center text-4xl font-extrabold text-white"
        style={{ backgroundColor: person.avatarColor || '#4f46e5' }}
      >
        {person.firstName?.[0] || 'U'}
      </div>
    );
  };

  return (
    <div className="pb-20 space-y-6 max-w-7xl mx-auto font-prompt animate-fade-in">
      
      {/* ======================================================== */}
      {/* 1. HERO PROFILE HEADER CARD */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Cover Photo */}
        <div className="relative w-full h-48 sm:h-60 bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-700 overflow-hidden">
          {(isEditing ? formData.coverPhoto : currentUser.coverPhoto) ? (
            <img
              src={(isEditing ? formData.coverPhoto : currentUser.coverPhoto) || undefined}
              alt="Cover Photo"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full opacity-30 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

          {/* Change Cover Button (in Edit Mode) */}
          {isEditing && (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-4 right-4 px-3.5 py-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-xl text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-camera"></i>
              <span>เปลี่ยนรูปหน้าปก</span>
            </button>
          )}
          <input
            id="profileCoverUploadInput"
            type="file"
            ref={coverInputRef}
            onChange={handleCoverUpload}
            accept="image/*"
            aria-label="อัปโหลดรูปภาพหน้าปกโปรไฟล์"
            className="hidden"
          />
        </div>

        {/* Profile Info Bar */}
        <div className="p-6 sm:p-8 pt-0 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 -mt-16 sm:-mt-20">
            
            {/* Avatar & Names */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <div className="relative group w-28 h-28 sm:w-36 sm:h-36 shrink-0">
                <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800">
                  {isEditing ? renderAvatar(formData) : renderAvatar(currentUser)}
                </div>

                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 w-9 h-9 bg-primary-600 hover:bg-primary-700 text-white rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                    title="เปลี่ยนรูปโปรไฟล์"
                  >
                    <i className="fa-solid fa-camera text-xs"></i>
                  </button>
                )}
                <input
                  id="profileAvatarUploadInput"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  aria-label="อัปโหลดรูปภาพโปรไฟล์"
                  className="hidden"
                />
              </div>

              <div className="space-y-1.5 pb-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
                    {currentUser.personnelType || 'กำลังพล'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {currentUser.status || 'ปฏิบัติงานปกติ'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    ID: {currentUser.badgeNo}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {currentUser.prefix}{currentUser.firstName} {currentUser.lastName}
                </h1>
                
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {currentUser.position || 'ตำแหน่ง -'} • <span className="text-primary-600 dark:text-primary-400">{currentUser.department || 'สังกัด -'}</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-center md:justify-end">
              {!isEditing ? (
                <>
                  <Link
                    href="/profile/badges"
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
                  >
                    <i className="fa-solid fa-id-card"></i>
                    <span>พิมพ์บัตรประจำตัว</span>
                  </Link>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-primary-500/20 transition-all flex items-center gap-2"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                    <span>แก้ไขโปรไฟล์</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(currentUser);
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs sm:text-sm transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-primary-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <span>กำลังบันทึก...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-check"></i>
                        <span>บันทึกข้อมูล</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Tab Switcher (When in View Mode) */}
        {!isEditing && (
          <div className="px-6 sm:px-8 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 overflow-x-auto">
            {[
              { id: 'info', name: 'ข้อมูลส่วนบุคคล & การติดต่อ', icon: 'fa-solid fa-user' },
              { id: 'official', name: 'ข้อมูลตำแหน่ง & สังกัด', icon: 'fa-solid fa-sitemap' },
              { id: 'history', name: 'ประวัติและผลงาน', icon: 'fa-solid fa-award' },
              { id: 'vehicles', name: 'ยานพาหนะที่ลงทะเบียน', icon: 'fa-solid fa-car' },
              { id: 'security', name: 'ความปลอดภัย & รหัสผ่าน', icon: 'fa-solid fa-shield-halved' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-white/60 dark:bg-slate-800/40'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <i className={`${tab.icon} text-xs`}></i>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. VIEW MODE CONTENT TABS */}
      {/* ======================================================== */}
      {!isEditing && (
        <div className="space-y-6">
          
          {/* TAB 1: Personal & Contact */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              
              {/* Personal Info Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">
                    <i className="fa-solid fa-id-card-clip"></i>
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">ข้อมูลส่วนบุคคล (Personal Info)</h2>
                    <p className="text-xs text-slate-400">ข้อมูลบัตรประชาชนและข้อมูลจำเพาะ</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">เลขประจำตัวประชาชน</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{currentUser.citizenId || '-'}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">วัน/เดือน/ปีเกิด</span>
                    <span className="font-bold text-slate-900 dark:text-white">{currentUser.dateOfBirth || '-'}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">กรุ๊ปเลือด</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{currentUser.bloodType || '-'}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">ศาสนา</span>
                    <span className="font-bold text-slate-900 dark:text-white">{currentUser.religion || '-'}</span>
                  </div>
                </div>

                {/* Current Address */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">ที่อยู่ปัจจุบันตามทะเบียนประวัติ</span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {currentUser.currentAddress || '-'} {currentUser.currentTambon ? `ต.${currentUser.currentTambon}` : ''} {currentUser.currentAmphoe ? `อ.${currentUser.currentAmphoe}` : ''} {currentUser.currentProvince ? `จ.${currentUser.currentProvince}` : ''} {currentUser.currentZipcode || ''}
                  </p>
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
                    <i className="fa-solid fa-phone-volume"></i>
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">ช่องทางการติดต่อ (Contact)</h2>
                    <p className="text-xs text-slate-400">เบอร์โทรศัพท์และอีเมลพร้อมกดเพื่อดำเนินการ</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  {/* Phone */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">เบอร์โทรศัพท์ที่ทำงาน</span>
                      {currentUser.phone ? (
                        <a
                          href={`tel:${currentUser.phone.replace(/[^0-9+]/g, '')}`}
                          className="text-primary-600 dark:text-primary-400 hover:underline font-bold inline-flex items-center gap-1.5"
                          title="คลิกเพื่อโทรออก"
                        >
                          <i className="fa-solid fa-phone text-xs"></i>
                          <span>{currentUser.phone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">คลิกโทรออก</span>
                  </div>

                  {/* Mobile */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">เบอร์โทรศัพท์มือถือ</span>
                      {currentUser.mobile ? (
                        <a
                          href={`tel:${currentUser.mobile.replace(/[^0-9+]/g, '')}`}
                          className="text-primary-600 dark:text-primary-400 hover:underline font-bold inline-flex items-center gap-1.5"
                          title="คลิกเพื่อโทรออก"
                        >
                          <i className="fa-solid fa-mobile-screen text-xs"></i>
                          <span>{currentUser.mobile}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">คลิกโทรออก</span>
                  </div>

                  {/* Email */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">อีเมลติดต่อ</span>
                      {currentUser.email ? (
                        <a
                          href={`mailto:${currentUser.email}`}
                          className="text-primary-600 dark:text-primary-400 hover:underline font-bold inline-flex items-center gap-1.5"
                          title="คลิกเพื่อส่งอีเมล"
                        >
                          <i className="fa-solid fa-envelope text-xs"></i>
                          <span>{currentUser.email}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">คลิกส่งอีเมล</span>
                  </div>

                  {/* Emergency Contact */}
                  <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-2">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                      <i className="fa-solid fa-truck-medical"></i>
                      <span>บุคคลติดต่อฉุกเฉิน (Emergency Contact)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">ชื่อผู้ติดต่อ:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.emergencyContactName || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">ความสัมพันธ์:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.emergencyContactRelation || '-'}</span>
                      </div>
                      <div className="col-span-2 pt-1">
                        <span className="text-[10px] text-slate-400 block">เบอร์โทรศัพท์ฉุกเฉิน:</span>
                        {currentUser.emergencyContactPhone ? (
                          <a
                            href={`tel:${currentUser.emergencyContactPhone.replace(/[^0-9+]/g, '')}`}
                            className="text-rose-600 dark:text-rose-400 hover:underline font-bold inline-flex items-center gap-1.5"
                          >
                            <i className="fa-solid fa-phone text-xs"></i>
                            <span>{currentUser.emergencyContactPhone}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Official & Department */}
          {activeTab === 'official' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
                  <i className="fa-solid fa-sitemap"></i>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">ข้อมูลสังกัดและประวัติราชการ/ทหาร</h2>
                  <p className="text-xs text-slate-400">ตำแหน่ง สังกัด และสายบังคับบัญชา</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">ตำแหน่งงาน</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentUser.position || '-'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">หน่วยงาน / กอง / แผนก</span>
                  <span className="font-bold text-primary-600 dark:text-primary-400">{currentUser.department || '-'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">หน่วยงานย่อย (Sub-department)</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentUser.subDepartment || '-'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">เลขประจำตัวข้าราชการ / ทหาร</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{currentUser.officialId || '-'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">เหล่าทัพ / ความชำนาญการ</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentUser.militaryBranch || '-'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">วุฒิการศึกษาสูงสุด</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentUser.education || '-'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: History & Bio */}
          {activeTab === 'history' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
                  <i className="fa-solid fa-award"></i>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">ประวัติ ผลงาน และเครื่องราชอิสริยาภรณ์</h2>
                  <p className="text-xs text-slate-400">บันทึกประวัติการรับราชการและหลักสูตรอบรม</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    <i className="fa-solid fa-medal text-amber-500 mr-2"></i>ประวัติการรับเครื่องราชอิสริยาภรณ์
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {currentUser.royalDecorations || 'ยังไม่มีการบันทึกประวัติเครื่องราชอิสริยาภรณ์'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    <i className="fa-solid fa-graduation-cap text-indigo-500 mr-2"></i>ประวัติการฝึกอบรมและหลักสูตรพิเศษ
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {currentUser.trainingHistory || 'ยังไม่มีการบันทึกหลักสูตรการฝึกอบรม'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    <i className="fa-solid fa-file-lines text-slate-500 mr-2"></i>หมายเหตุ / ประวัติส่วนตัวเพิ่มเติม
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {currentUser.notes || 'ไม่มีหมายเหตุเพิ่มเติม'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Vehicles */}
          {activeTab === 'vehicles' && (
            <div className="animate-fade-in">
              <VehicleList personnelId={currentUser.id} />
            </div>
          )}

          {/* TAB 5: Security & Account */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center text-lg">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">ความปลอดภัยของบัญชีผู้ใช้</h2>
                  <p className="text-xs text-slate-400">บทบาทสิทธิ์การเข้าถึง และการเปลี่ยนรหัสผ่าน</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">ชื่อผู้ใช้งาน (Username)</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{currentUser.username}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">ระดับสิทธิ์ (Role)</span>
                  <span className="font-bold text-primary-600 dark:text-primary-400">{currentUser.role}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md flex items-center gap-2"
                >
                  <i className="fa-solid fa-key"></i>
                  <span>เปลี่ยนรหัสผ่านของฉัน</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* 3. EDIT MODE FORM CONTAINER */}
      {/* ======================================================== */}
      {isEditing && (
        <form onSubmit={handleSave} className="space-y-6 animate-fade-in">
          
          {/* Personal Info Fieldset */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <i className="fa-solid fa-user text-primary-500 text-sm"></i>
              <span>ข้อมูลส่วนบุคคล (Personal Information)</span>
            </h3>
            <PersonalInfoForm
              formData={formData}
              setFormData={setFormData}
              prefixes={prefixes}
              bloodGroups={bloodGroups}
            />
          </div>

          {/* Military & Official Fieldset */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <i className="fa-solid fa-sitemap text-indigo-500 text-sm"></i>
              <span>ข้อมูลสังกัดและตำแหน่งงาน (Official & Position)</span>
            </h3>
            <MilitaryInfoForm
              formData={formData}
              setFormData={setFormData}
              departments={departments}
              personnelTypes={[]}
              statusList={[]}
              isProfile={true}
            />
          </div>

          {/* Contact Fieldset */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <i className="fa-solid fa-phone text-emerald-500 text-sm"></i>
              <span>ข้อมูลการติดต่อและที่อยู่ (Contact & Address)</span>
            </h3>
            <ContactInfoForm formData={formData} setFormData={setFormData} />
          </div>

          {/* Extended History Fieldset */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <i className="fa-solid fa-award text-amber-500 text-sm"></i>
              <span>ประวัติและผลงาน (History & Notes)</span>
            </h3>
            <ExtendedHistoryForm formData={formData} setFormData={setFormData} />
          </div>

          {/* Security & Password Fieldset */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <i className="fa-solid fa-lock text-rose-500 text-sm"></i>
              <span>เปลี่ยนรหัสผ่าน (Change Password)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  รหัสผ่านใหม่ <span className="text-slate-400 font-normal">(เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="sticky bottom-6 z-30 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex justify-between items-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              อย่าลืมกดบันทึกหลังจากแก้ไขข้อมูล
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData(currentUser);
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs sm:text-sm transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-primary-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    <span>บันทึกการเปลี่ยนแปลง</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      )}

    </div>
  );
}
