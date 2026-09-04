'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    citizenId: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [systemName, setSystemName] = useState('eProfile');

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => {
      if (data.systemName) setSystemName(data.systemName);
    }).catch(e => console.error(e));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      // For registration, we hit the personnel API but with status = "รออนุมัติ"
      const res = await fetch('/api/personnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          username: formData.citizenId, // use citizen id as username
          status: 'รออนุมัติ',
          role: 'USER',
          prefix: 'นาย' // Default for now
        })
      });
      
      if (res.ok) {
        setStatus('success');
        toast.success('ลงทะเบียนสำเร็จ');
      } else {
        setStatus('idle');
        toast.error('เกิดข้อผิดพลาดในการลงทะเบียน อาจมีข้อมูลรหัสประจำตัวนี้ในระบบแล้ว');
      }
    } catch (err) {
      setStatus('idle');
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in-up">
      <Link href="/" className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <i className="fa-solid fa-user-plus text-3xl text-white"></i>
          </div>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
          สมัครสมาชิกใหม่
        </h2>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          กรอกข้อมูลเพื่อลงทะเบียนเข้าใช้งานระบบ {systemName}
        </p>

      <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl shadow-slate-200/20 dark:shadow-none sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-slate-700">
          
          {status === 'success' ? (
            <div className="text-center py-8 animate-scale-up">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-clock text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">ลงทะเบียนเรียบร้อย</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">ข้อมูลของคุณถูกส่งเข้าระบบแล้ว สถานะปัจจุบันคือ <b>"รออนุมัติ"</b> กรุณารอผู้ดูแลระบบตรวจสอบและอนุมัติการเข้าใช้งาน</p>
              <Link 
                href="/login"
                className="text-primary-600 hover:text-primary-500 font-medium border border-primary-500 px-6 py-2 rounded-xl"
              >
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  รหัสประจำตัวประชาชน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.citizenId}
                  onChange={(e) => setFormData({...formData, citizenId: e.target.value})}
                  className="form-control"
                  placeholder="ใช้สำหรับเป็น Username ในการล็อกอิน"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="form-control"
                  placeholder="ตั้งรหัสผ่านสำหรับเข้าสู่ระบบ"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    ชื่อ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="form-control"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="form-control"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  อีเมล <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="form-control"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full ui-btn-primary py-3"
              >
                {status === 'loading' ? (
                  <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> กำลังบันทึก...</>
                ) : (
                  <><i className="fa-solid fa-user-check mr-2"></i> สมัครสมาชิก</>
                )}
              </button>
            </form>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
          </Link>
        </div>
    </div>
  );
}
