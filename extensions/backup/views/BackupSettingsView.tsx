'use client';

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import BackupRestoreSettings from '../components/BackupRestoreSettings';
import { Modal, Button } from '@/components/ui';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';

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

      const res = await fetch('/api/modules/backup/restore', {
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
    <div className="space-y-6 animate-fade-in pb-16 font-prompt">
      <PageHeaderExtra>
        <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
          <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-600 text-white shadow-sm shadow-primary-500/30 flex items-center gap-2">
            <i className="fa-solid fa-database text-xs"></i>
            <span>สำรองและกู้คืนข้อมูล</span>
          </div>
        </div>
      </PageHeaderExtra>

      <BackupRestoreSettings 
        settings={settings}
        isRestoring={isRestoring}
        handleRestore={handleRestore}
        restoreFileInputRef={restoreFileInputRef}
      />

      {/* Restore Confirmation Modal */}
      <Modal
        isOpen={!!pendingRestoreFile}
        onClose={() => {
          setPendingRestoreFile(null);
          if (restoreFileInputRef.current) restoreFileInputRef.current.value = '';
        }}
        title="ยืนยันการกู้คืนฐานข้อมูล (Restore Database)?"
        icon="fa-solid fa-triangle-exclamation"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPendingRestoreFile(null);
                if (restoreFileInputRef.current) restoreFileInputRef.current.value = '';
              }}
            >
              ยกเลิก
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon="fa-solid fa-upload"
              isLoading={isRestoring}
              loadingText="กำลังกู้คืน..."
              onClick={() => {
                if (pendingRestoreFile) {
                  executeRestore(pendingRestoreFile);
                }
              }}
            >
              ยืนยันการกู้คืน
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            คำเตือน: การนำเข้าไฟล์ <code className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-mono font-bold text-xs">{pendingRestoreFile?.name}</code> จะเขียนทับและแทนที่ข้อมูลทั้งหมดในระบบปัจจุบัน คุณแน่ใจหรือไม่ที่จะดำเนินการต่อ?
          </p>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-400">
            <i className="fa-solid fa-circle-info mr-1.5"></i>
            ระบบจะเริ่มทำงานใหม่โดยอัตโนมัติทันทีหลังจากการกู้คืนข้อมูลเสร็จสิ้น
          </div>
        </div>
      </Modal>
    </div>
  );
}
