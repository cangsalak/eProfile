'use client';

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import BackupRestoreSettings from '../components/BackupRestoreSettings';
import ConfirmModal from '@/components/common/ConfirmModal';

export default function BackupSettingsView() {
  const [settings, setSettings] = useState<any>({});
  const restoreFileInputRef = useRef<HTMLInputElement>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [pendingRestoreFile, setPendingRestoreFile] = useState<File | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error('Failed to fetch settings:', err));
  }, []);

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingRestoreFile(file);
  };

  const executeRestore = async (file: File) => {
    setIsRestoring(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/restore', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'กู้คืนฐานข้อมูลสำเร็จ ระบบกำลังเริ่มใหม่...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาดในการกู้คืนฐานข้อมูล');
        setIsRestoring(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      setIsRestoring(false);
    } finally {
      setPendingRestoreFile(null);
      if (restoreFileInputRef.current) restoreFileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
          <i className="fa-solid fa-database text-lg"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            สำรองและกู้คืนข้อมูล (Backup & Restore)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            จัดการการสำรองข้อมูลฐานข้อมูลและกู้คืนระบบ
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <BackupRestoreSettings 
          settings={settings}
          isRestoring={isRestoring}
          handleRestore={handleRestore}
          restoreFileInputRef={restoreFileInputRef}
        />
      </div>

      <ConfirmModal
        isOpen={!!pendingRestoreFile}
        title="ยืนยันการกู้คืนฐานข้อมูล (Restore Database)?"
        message={`คำเตือน: การนำเข้าไฟล์ "${pendingRestoreFile?.name}" จะเขียนทับและแทนที่ข้อมูลทั้งหมดในระบบปัจจุบัน คุณแน่ใจหรือไม่ที่จะดำเนินการต่อ?`}
        confirmText="ยืนยันการกู้คืน"
        cancelText="ยกเลิก"
        isDestructive={true}
        onConfirm={() => {
          if (pendingRestoreFile) {
            executeRestore(pendingRestoreFile);
          }
        }}
        onCancel={() => {
          setPendingRestoreFile(null);
          if (restoreFileInputRef.current) restoreFileInputRef.current.value = '';
        }}
      />
    </div>
  );
}
