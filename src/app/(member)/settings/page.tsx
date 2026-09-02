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

  const tabsList = [
    { id: 'system', name: 'ข้อมูลทั่วไป', icon: 'fa-building-columns' },
    { id: 'theme', name: 'ธีมและการแสดงผล', icon: 'fa-palette' },
    { id: 'badge', name: 'ออกแบบบัตร (Badge)', icon: 'fa-id-badge' },
    { id: 'roles', name: 'สิทธิ์การใช้งาน (Roles)', icon: 'fa-user-shield' },
    { id: 'dropdowns', name: 'จัดการตัวเลือก', icon: 'fa-list' },
    { id: 'departments', name: 'หน่วยงาน', icon: 'fa-sitemap' },
    { id: 'notifications', name: 'การแจ้งเตือน (LINE & Email)', icon: 'fa-bell' },
    { id: 'maintenance', name: 'บำรุงรักษาระบบ', icon: 'fa-tools' },
  ];

  return (
    <div className="pb-16 max-w-7xl mx-auto space-y-6 animate-fade-in font-prompt">
      {/* Header Banner & Horizontal Tab Navigation */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary-200/50 via-primary-100/20 to-transparent dark:from-primary-950/40 dark:via-primary-900/20 dark:to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70 pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-primary-500/20">
              <i className="fa-solid fa-gear"></i>
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-900/60 rounded-full text-xs font-semibold text-primary-700 dark:text-primary-300 mb-2">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                <span>การจัดการระบบ (System Administration)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                ตั้งค่าระบบ (System Settings)
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                กำหนดค่าทั่วไป ธีม รูปแบบบัตร สิทธิ์ผู้ใช้งาน ตัวเลือกข้อมูล หน่วยงาน และการสำรองข้อมูล
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Tab Navigation Bar (Scrollable on smaller screens) */}
        <div 
          role="tablist" 
          aria-label="การตั้งค่าระบบตามหมวดหมู่"
          className="relative z-10 px-4 sm:px-8 flex items-center gap-1 sm:gap-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/50 overflow-x-auto"
        >
          {tabsList.map(tab => {
            const isActive = activeTab === tab.id || ((activeTab === 'line' || activeTab === 'mail') && tab.id === 'notifications');
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-controls={`tabpanel-${tab.id}`}
                aria-selected={isActive}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`py-3.5 px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-all flex items-center gap-2.5 shrink-0 ${
                  isActive
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-white/70 dark:bg-slate-800/50'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <i className={`fa-solid ${tab.icon} text-xs ${isActive ? 'text-primary-500' : 'text-slate-400'}`}></i>
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content Card */}
      {isLoading ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4 text-primary-500"></i>
          <p className="text-sm font-medium">กำลังโหลดการตั้งค่าระบบ...</p>
        </div>
      ) : (
        <div 
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm"
        >
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
                  mode="general"
                />
              )}

              {activeTab === 'theme' && (
                <SystemSettingsForm 
                  settings={settings}
                  setSettings={setSettings}
                  handleChange={handleChange}
                  handleLogoUpload={handleLogoUpload}
                  fileInputRef={fileInputRef}
                  mode="theme"
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

              {(activeTab === 'notifications' || activeTab === 'line' || activeTab === 'mail') && (
                <NotificationSettings 
                  settings={settings}
                  handleChange={handleChange}
                  testLineNotify={testLineNotify}
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

              <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="submit" 
                  disabled={isSaving} 
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center gap-2"
                >
                  {isSaving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-save"></i>}
                  <span>บันทึกการตั้งค่า</span>
                </button>
              </div>

            </form>
          )}
        </div>
      )}
    </div>
  );
}
