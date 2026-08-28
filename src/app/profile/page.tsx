'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Personnel } from '../../types/personnel';
import VehicleList from '../../components/vehicles/VehicleList';

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<Personnel | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Personnel>>({});
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setFormData(user);
    }
    
    // Fetch departments for dropdown
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDepartments(data);
      })
      .catch(console.error);
  }, []);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <i className="fa-solid fa-user-lock text-4xl text-slate-500 mb-4"></i>
        <p className="text-slate-500 dark:text-slate-400">กรุณาเข้าสู่ระบบเพื่อดูข้อมูลส่วนตัว</p>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Create an image to resize it
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          setFormData(prev => ({ ...prev, avatarColor: base64 }));
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
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          setFormData(prev => ({ ...prev, coverPhoto: base64 }));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setIsEditing(false);
        setPassword('');
        setMessage({ text: 'บันทึกข้อมูลเรียบร้อยแล้ว', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } else {
        setMessage({ text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ', type: 'error' });
    }
  };

  const renderAvatar = (person: Partial<Personnel>) => {
    const isImage = person.avatarColor?.startsWith('data:image') || person.avatarColor?.startsWith('http');
    if (isImage) {
      return <img src={person.avatarColor} alt="Profile" className="w-full h-full object-cover" />;
    }
    return (
      <div 
        className="w-full h-full flex items-center justify-center text-5xl text-slate-900 dark:text-white font-bold"
        style={{ backgroundColor: person.avatarColor || '#3b82f6' }}
      >
        {person.firstName?.[0] || 'U'}
      </div>
    );
  };

  return (
    <div className="pb-12 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">จัดการโปรไฟล์ส่วนตัว</h2>
        
        {/* Link to Print Badges */}
        {!isEditing && currentUser && (
          <button 
            onClick={() => window.location.href = '/profile/badges'}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all font-medium flex items-center"
          >
            <i className="fa-solid fa-id-card mr-2"></i> พิมพ์บัตรประจำตัว
          </button>
        )}
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 flex items-center ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
          <i className={`fa-solid ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-3 text-xl`}></i>
          {message.text}
        </div>
      )}

      <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl relative overflow-hidden shadow-xl" data-theme={isEditing ? (formData.profileTheme || 'indigo') : (currentUser.profileTheme || 'indigo')}>
        
        {/* Cover Photo Area */}
        <div className="relative w-full h-48 md:h-64 bg-white dark:bg-slate-900 group">
          {(isEditing ? formData.coverPhoto : currentUser.coverPhoto) ? (
            <img src={isEditing ? formData.coverPhoto : currentUser.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary-900/50 to-primary-600/30"></div>
          )}
          
          {isEditing && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-slate-900 dark:text-white font-medium flex items-center shadow-lg transition-all"
              >
                <i className="fa-solid fa-camera mr-2"></i> เปลี่ยนรูปหน้าปก
              </button>
              <input 
                type="file" 
                ref={coverInputRef} 
                onChange={handleCoverUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          )}
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-10 relative z-10 -mt-24 md:-mt-32">
            {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group w-36 h-36">
              <div className="w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                {isEditing ? renderAvatar(formData) : renderAvatar(currentUser)}
              </div>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                  title="เปลี่ยนรูปโปรไฟล์"
                >
                  <i className="fa-solid fa-camera"></i>
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {!isEditing ? `${currentUser.prefix}${currentUser.firstName} ${currentUser.lastName}` : 'กำลังแก้ไข...'}
              </h3>
              {!isEditing && <p className="text-primary-400 text-sm font-medium mt-1">{currentUser.position}</p>}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1">
            {!isEditing ? (
              <div className="space-y-8 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50 pb-3">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">ข้อมูลส่วนตัวและการติดต่อ</h4>
                  <button onClick={() => setIsEditing(true)} className="px-5 py-2 bg-primary-500/10 text-primary-400 hover:bg-primary-500 hover:text-white rounded-lg transition-all text-sm font-medium flex items-center border border-primary-500/20 hover:border-transparent">
                    <i className="fa-solid fa-edit mr-2"></i> แก้ไขโปรไฟล์
                  </button>
                </div>
                
                {/* 1. Official Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider">ตำแหน่ง</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/30">{currentUser.position || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider">หน่วยงาน / กอง</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/30">{currentUser.department || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider">เลขประจำตัวข้าราชการ/ทหาร</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/30">{currentUser.officialId || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider">เหล่าทัพ / ชำนาญการ</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/30">{currentUser.militaryBranch || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider">วันเกิด</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/30">{currentUser.dateOfBirth || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider">กรุ๊ปเลือด / ศาสนา</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/30">
                      {currentUser.bloodType || '-'} / {currentUser.religion || '-'}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider">ที่อยู่ปัจจุบัน</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/30">{currentUser.currentAddress || '-'}</p>
                  </div>
                  <div className="sm:col-span-2 border-t border-slate-200 dark:border-slate-700/50 pt-4 mt-2">
                    <h5 className="text-slate-700 dark:text-slate-300 font-medium mb-3"><i className="fa-solid fa-truck-medical text-rose-400 mr-2"></i> ผู้ติดต่อฉุกเฉิน</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">ชื่อ-สกุล</p>
                        <p className="text-slate-800 dark:text-slate-200">{currentUser.emergencyContactName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">ความสัมพันธ์</p>
                        <p className="text-slate-800 dark:text-slate-200">{currentUser.emergencyContactRelation || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">เบอร์โทรศัพท์</p>
                        <p className="text-slate-800 dark:text-slate-200">{currentUser.emergencyContactPhone || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>


                {/* 2. Personal Info */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700/50">
                  <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">ข้อมูลส่วนบุคคล (Personal Info)</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider">เลขประจำตัวประชาชน</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/30">{currentUser.citizenId || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider">วัน/เดือน/ปีเกิด</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/30">{currentUser.dateOfBirth || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider">กรุ๊ปเลือด</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/30">{currentUser.bloodType || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider">ศาสนา</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/30">{currentUser.religion || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* 3. Contact & Address */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700/50">
                  <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">ข้อมูลการติดต่อ (Contact)</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-8 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider">เบอร์โทรที่ทำงาน</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/30">{currentUser.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider">เบอร์มือถือส่วนตัว</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/30">{currentUser.mobile || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider">อีเมล</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/30">{currentUser.email || '-'}</p>
                    </div>
                    <div className="sm:col-span-3">
                      <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider">ที่อยู่ปัจจุบัน</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/30">{currentUser.currentAddress || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* 4. Emergency Contact */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700/50">
                  <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 text-rose-400"><i className="fa-solid fa-heart-pulse mr-2"></i>บุคคลติดต่อฉุกเฉิน (Emergency Contact)</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-8 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider">ชื่อ-นามสกุล</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/30">{currentUser.emergencyContactName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider">เบอร์โทรศัพท์</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/30">{currentUser.emergencyContactPhone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider">ความสัมพันธ์</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/30">{currentUser.emergencyContactRelation || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* 5. Extended History */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700/50">
                  <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">ประวัติและผลงาน (History)</h5>
                  <div className="space-y-4">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-2 text-xs uppercase tracking-wider">ประวัติส่วนตัว / Bio (Notes)</p>
                      <div className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700/30 whitespace-pre-wrap min-h-[60px]">
                        {currentUser.notes || '-'}
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-2 text-xs uppercase tracking-wider">ประวัติการรับเครื่องราชอิสริยาภรณ์</p>
                      <div className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700/30 whitespace-pre-wrap min-h-[60px]">
                        {currentUser.royalDecorations || '-'}
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-2 text-xs uppercase tracking-wider">ประวัติการฝึกอบรม/หลักสูตรพิเศษ</p>
                      <div className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700/30 whitespace-pre-wrap min-h-[60px]">
                        {currentUser.trainingHistory || '-'}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6 animate-fade-in">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-2 mb-4">แก้ไขข้อมูลโปรไฟล์</h4>
                
                <div className="mt-6">
                  <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-200 dark:border-slate-700/50 pb-2">1. ข้อมูลส่วนบุคคล (Personal Info)</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">คำนำหน้า / ยศ</label>
                      <input
                        type="text"
                        value={formData.prefix || ''}
                        onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">ชื่อจริง</label>
                      <input
                        type="text"
                        value={formData.firstName || ''}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">นามสกุล</label>
                      <input
                        type="text"
                        value={formData.lastName || ''}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">เลขประจำตัวประชาชน</label>
                      <input type="text" value={formData.citizenId || ''} onChange={(e) => setFormData({ ...formData, citizenId: e.target.value })} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">วัน/เดือน/ปีเกิด</label>
                      <input type="text" placeholder="เช่น 01/05/2530" value={formData.dateOfBirth || ''} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">กรุ๊ปเลือด</label>
                      <input type="text" value={formData.bloodType || ''} onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">ศาสนา</label>
                      <input type="text" value={formData.religion || ''} onChange={(e) => setFormData({ ...formData, religion: e.target.value })} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-200 dark:border-slate-700/50 pb-2">2. ข้อมูลทางราชการ / ทหาร (Official Info)</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">ตำแหน่ง</label>
                      <input
                        type="text"
                        value={formData.position || ''}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">หน่วยงาน / กอง</label>
                      <select
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none"
                      >
                        <option value="">-- เลือกหน่วยงาน --</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">เลขประจำตัวข้าราชการ/ทหาร</label>
                      <input type="text" value={formData.officialId || ''} onChange={(e) => setFormData({ ...formData, officialId: e.target.value })} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">เหล่า / สายวิทยาการ</label>
                      <input type="text" value={formData.militaryBranch || ''} onChange={(e) => setFormData({ ...formData, militaryBranch: e.target.value })} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">วันที่บรรจุเข้ารับราชการ</label>
                      <input type="text" value={formData.commissionDate || ''} onChange={(e) => setFormData({ ...formData, commissionDate: e.target.value })} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-200 dark:border-slate-700/50 pb-2">3. ข้อมูลการติดต่อฉุกเฉิน และ ที่อยู่ (Contact & Address)</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">เบอร์โทรศัพท์ (ที่ทำงาน)</label>
                      <input type="text" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">เบอร์มือถือส่วนตัว</label>
                      <input type="text" value={formData.mobile || ''} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">อีเมลติดต่อ</label>
                      <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">ที่อยู่ปัจจุบัน</label>
                    <textarea value={formData.currentAddress || ''} onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })} rows={2} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none resize-none"></textarea>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                    <div>
                      <label className="block text-rose-400 text-xs mb-1">ชื่อบุคคลติดต่อฉุกเฉิน</label>
                      <input type="text" value={formData.emergencyContactName || ''} onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-900 dark:text-white focus:border-rose-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-rose-400 text-xs mb-1">เบอร์โทรศัพท์ฉุกเฉิน</label>
                      <input type="text" value={formData.emergencyContactPhone || ''} onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-900 dark:text-white focus:border-rose-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-rose-400 text-xs mb-1">ความสัมพันธ์</label>
                      <input type="text" value={formData.emergencyContactRelation || ''} onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-900 dark:text-white focus:border-rose-500 focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-200 dark:border-slate-700/50 pb-2">4. ประวัติเพิ่มเติม (Extended History)</h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">ประวัติส่วนตัว / Bio</label>
                      <textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} placeholder="รายละเอียดเพิ่มเติม..." className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">ประวัติการรับเครื่องราชอิสริยาภรณ์</label>
                      <textarea value={formData.royalDecorations || ''} onChange={(e) => setFormData({ ...formData, royalDecorations: e.target.value })} rows={3} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">ประวัติการฝึกอบรม/หลักสูตรพิเศษ</label>
                      <textarea value={formData.trainingHistory || ''} onChange={(e) => setFormData({ ...formData, trainingHistory: e.target.value })} rows={3} className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none resize-none"></textarea>
                    </div>
                  </div>
                </div>


                <div className="border-t border-slate-200 dark:border-slate-700/50 pt-4 mt-2 bg-white dark:bg-slate-900/20 p-4 rounded-xl">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">ธีมและรูปแบบโปรไฟล์ (Profile Appearance)</h4>
                  <div className="mb-4">
                    <label className="block text-slate-500 dark:text-slate-400 text-xs mb-2">เลือกธีมสี</label>
                    <div className="flex gap-3">
                      {[
                        { id: 'indigo', name: 'คลาสสิค', color: 'bg-indigo-500' },
                        { id: 'emerald', name: 'ธรรมชาติ', color: 'bg-emerald-500' },
                        { id: 'ocean', name: 'มหาสมุทร', color: 'bg-sky-500' },
                        { id: 'rose', name: 'ดอกกุหลาบ', color: 'bg-rose-500' }
                      ].map(theme => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, profileTheme: theme.id })}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border ${formData.profileTheme === theme.id ? 'border-white bg-slate-50 dark:bg-slate-800/80 shadow-lg scale-105' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:border-slate-500'} transition-all`}
                        >
                          <div className={`w-8 h-8 rounded-full ${theme.color} shadow-inner`}></div>
                          <span className="text-[10px] text-slate-700 dark:text-slate-300">{theme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700/50 pt-4 mt-2 bg-white dark:bg-slate-900/20 p-4 rounded-xl">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">เปลี่ยนรหัสผ่าน (Security)</h4>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">รหัสผ่านใหม่ <span className="text-slate-500">(ปล่อยว่างไว้หากไม่ต้องการเปลี่ยน)</span></label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full sm:w-1/2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 justify-end">
                  <button type="button" onClick={() => {setIsEditing(false); setFormData(currentUser);}} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-900 dark:text-white rounded-xl transition-colors font-medium">
                    ยกเลิก
                  </button>
                  <button type="submit" className="px-8 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all font-medium flex items-center">
                    <i className="fa-solid fa-save mr-2"></i> บันทึกโปรไฟล์
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        </div>
      </div>
      
      {/* Vehicles Section - Rendered below the main profile card */}
      {!isEditing && currentUser && (
        <VehicleList personnelId={currentUser.id} />
      )}
    </div>
  );
}
