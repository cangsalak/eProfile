'use client';

import React, { useState, useEffect } from 'react';
import { Personnel } from '@/modules/users';
import { Modal, Button } from '@/components/ui';
import toast from 'react-hot-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: Personnel) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [systemName, setSystemName] = useState('eProfile');
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }

      onLoginSuccess(data.user);
      onClose();
      setUsername('');
      setPassword('');
      toast.success('เข้าสู่ระบบสำเร็จ');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`เข้าสู่ระบบ ${systemName}`}
      subtitle="สำหรับบุคลากรและผู้ดูแลระบบ"
      icon="fa-solid fa-shield-halved"
      size="sm"
      footer={
        <div className="flex justify-between items-center w-full">
          <a href="/setup" className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
            <i className="fa-solid fa-shield-halved mr-1"></i>
            ตั้งค่าฉุกเฉิน
          </a>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              form="login-modal-form"
              variant="primary"
              size="sm"
              disabled={isLoading}
              icon={isLoading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-right-to-bracket'}
            >
              เข้าสู่ระบบ
            </Button>
          </div>
        </div>
      }
    >
      <form id="login-modal-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label htmlFor="modalUsername" className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
            เลขบัตรประจำตัวประชาชน (13 หลัก)
          </label>
          <div className="relative">
            <i className="fa-solid fa-id-card absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              id="modalUsername"
              type="text"
              aria-label="เลขบัตรประจำตัวประชาชน (13 หลัก)"
              maxLength={13}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="กรอกเลขบัตรประชาชน 13 หลัก..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 font-mono"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="modalPassword" className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
            รหัสผ่าน / เลขประจำตัวทหาร (10 หลัก)
          </label>
          <div className="relative">
            <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              id="modalPassword"
              type={showPassword ? 'text' : 'password'}
              aria-label="รหัสผ่านหรือเลขประจำตัวทหาร (10 หลัก)"
              maxLength={10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกเลขประจำตัวทหาร 10 หลัก..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 font-mono"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
