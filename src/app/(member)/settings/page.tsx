'use client';

import React, { useState, useEffect, useRef } from 'react';
import DepartmentsManager from '@/components/DepartmentsManager';
import SystemSettingsForm from '@/components/settings/SystemSettingsForm';
import BadgeDesignSettings from '@/components/settings/BadgeDesignSettings';
import DataCategorySettings from '@/components/settings/DataCategorySettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import BackupRestoreSettings from '@/components/settings/BackupRestoreSettings';
import RoleSettings from '@/components/settings/RoleSettings';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('system');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Badge Preview State
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');

  // Backup & Restore
  const restoreFileInputRef = useRef<HTMLInputElement>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    const savedTab = localStorage.getItem('activeSettingsTab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
    fetchSettings();
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    localStorage.setItem('activeSettingsTab', tabId);
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      toast.error('ไม่สามารถโหลดการตั้งค่าได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('ขนาดไฟล์ต้องไม่เกิน 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, systemLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('คำเตือน: การกู้คืนจะเขียนทับข้อมูลปัจจุบันทั้งหมด คุณแน่ใจหรือไม่?')) {
      if (restoreFileInputRef.current) restoreFileInputRef.current.value = '';
      return;
    }

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
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked.toString() : e.target.value;
    setSettings({ ...settings, [e.target.name]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว ระบบกำลังอัปเดต...');
        // Immediately apply theme
        if (settings.theme) {
          document.documentElement.className = settings.theme;
          localStorage.setItem('theme', settings.theme);
        }
        
        // Reload to apply global settings like Toast position
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
    setIsSaving(false);
  };

  const testLineNotify = async () => {
    if (!settings.lineNotifyToken) {
      toast.error('กรุณากรอก Token ก่อนทดสอบ');
      return;
    }

    toast.success('ทดสอบส่งข้อความ (ฟังก์ชันนี้ยังไม่ได้ต่อ API ทดสอบตรง)');
  };

  return (
    <div className="pb-12 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">ตั้งค่าระบบ (System Settings)</h2>

      {isLoading ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4 text-primary-500"></i>
          <p>กำลังโหลดการตั้งค่า...</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 space-y-2">
            {[
              { id: 'system', name: 'ระบบทั่วไป และ ธีม', icon: 'fa-desktop' },
              { id: 'badge', name: 'ออกแบบบัตร (Badge)', icon: 'fa-id-badge' },
              { id: 'roles', name: 'สิทธิ์การใช้งาน (Roles)', icon: 'fa-user-shield' },
              { id: 'dropdowns', name: 'จัดการตัวเลือก', icon: 'fa-list' },
              { id: 'departments', name: 'หน่วยงาน', icon: 'fa-sitemap' },
              { id: 'line', name: 'LINE Bot (Messaging API)', icon: 'fa-comment-dots' },
              { id: 'mail', name: 'Email แจ้งเตือน', icon: 'fa-envelope' },
              { id: 'maintenance', name: 'บำรุงรักษาระบบ', icon: 'fa-tools' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center ${activeTab === tab.id ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
              >
                <i className={`fa-solid ${tab.icon} w-6`}></i>
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-xl">
            {activeTab === 'departments' ? (
              <DepartmentsManager />
            ) : activeTab === 'roles' ? (
              <RoleSettings />
            ) : (
              <form onSubmit={handleSave} className="space-y-6">

                {activeTab === 'system' && (
                  <SystemSettingsForm 
                    settings={settings}
                    setSettings={setSettings}
                    handleChange={handleChange}
                    handleLogoUpload={handleLogoUpload}
                    fileInputRef={fileInputRef}
                  />
                )}

                {activeTab === 'badge' && (
                  <BadgeDesignSettings 
                    settings={settings}
                    setSettings={setSettings}
                    handleChange={handleChange}
                    previewSide={previewSide}
                    setPreviewSide={setPreviewSide}
                  />
                )}

                {activeTab === 'line' && (
                  <NotificationSettings 
                    settings={settings}
                    handleChange={handleChange}
                    testLineNotify={testLineNotify}
                    tab="line"
                  />
                )}

                {activeTab === 'mail' && (
                  <NotificationSettings 
                    settings={settings}
                    handleChange={handleChange}
                    testLineNotify={testLineNotify}
                    tab="mail"
                  />
                )}

                {activeTab === 'dropdowns' && (
                  <DataCategorySettings 
                    settings={settings}
                    setSettings={setSettings}
                  />
                )}

                {activeTab === 'maintenance' && (
                  <BackupRestoreSettings 
                    isRestoring={isRestoring}
                    handleRestore={handleRestore}
                    restoreFileInputRef={restoreFileInputRef}
                  />
                )}

                <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700/50">
                  <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all flex items-center">
                    {isSaving ? <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> : <i className="fa-solid fa-save mr-2"></i>}
                    บันทึกการตั้งค่า
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
