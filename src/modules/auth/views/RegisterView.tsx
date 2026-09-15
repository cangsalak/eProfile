'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function RegisterView() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    citizenId: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [systemName, setSystemName] = useState('eProfile');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.systemName) setSystemName(data.systemName);
      })
      .catch((e) => console.error(e));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/modules/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          username: formData.citizenId,
          status: 'รออนุมัติ',
          role: 'USER',
          prefix: 'นาย',
        }),
      });

      if (res.ok) {
        setStatus('success');
        toast.success('ลงทะเบียนสำเร็จ');
      } else {
        const errorData = await res.json().catch(() => ({}));
        setStatus('idle');
        toast.error(errorData.error || 'เกิดข้อผิดพลาดในการลงทะเบียน อาจมีข้อมูลรหัสประจำตัวนี้ในระบบแล้ว');
      }
    } catch {
      setStatus('idle');
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in-up">
      <Link href="/" className="flex justify-center mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md shadow-primary-500/20">
            <i className="fa-solid fa-id-card text-lg" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {systemName}
          </span>
        </div>
      </Link>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">ลงทะเบียนผู้ใช้งานใหม่</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            กรุณากรอกข้อมูลส่วนตัวเพื่อสร้างบัญชีเข้าใช้งานระบบ eProfile
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-circle-check text-3xl" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">ส่งคำขอลงทะเบียนเรียบร้อยแล้ว</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 mb-6">
              ข้อมูลของท่านถูกบันทึกเข้าสู่ระบบเรียบร้อยแล้ว กรุณารอผู้ดูแลระบบอนุมัติการใช้งานก่อนเข้าสู่ระบบ
            </p>
            <Link
              href="/login"
              className="inline-flex justify-center items-center w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition"
            >
              กลับสู่หน้าเข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                เลขประจำตัวประชาชน (13 หลัก) *
              </label>
              <input
                type="text"
                required
                maxLength={13}
                pattern="\d{13}"
                value={formData.citizenId}
                onChange={(e) => setFormData({ ...formData, citizenId: e.target.value })}
                placeholder="กรอกตัวเลข 13 หลัก"
                className="w-full text-sm py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                รหัสผ่านสำหรับเข้าสู่ระบบ *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="ความยาวอย่างน้อย 6 ตัวอักษร"
                className="w-full text-sm py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อจริง *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="เช่น สมชาย"
                  className="w-full text-sm py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  นามสกุล *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="เช่น กล้าหาญ"
                  className="w-full text-sm py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                สังกัด / กอง / แผนก
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="เช่น กองเทคโนโลยีสารสนเทศ"
                className="w-full text-sm py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="เช่น 081-234-5678"
                  className="w-full text-sm py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  อีเมล
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@rta.mi.th"
                  className="w-full text-sm py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full mt-2 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {status === 'loading' ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin text-sm" />
                  กำลังส่งข้อมูล...
                </>
              ) : (
                'ยืนยันการลงทะเบียน'
              )}
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            มีบัญชีผู้ใช้งานอยู่แล้ว?{' '}
            <Link href="/login" className="font-semibold text-primary-600 hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
