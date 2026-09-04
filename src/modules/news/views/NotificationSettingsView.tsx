'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import NotificationSettings from '../components/NotificationSettings';

export default function NotificationSettingsView() {
  const [settings, setSettings] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error('Failed to fetch settings:', err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked.toString() : e.target.value;
    setSettings({ ...settings, [e.target.name]: value });
  };

  const testLineNotify = async () => {
    if (!settings.lineNotifyToken) {
      toast.error('กรุณากรอก Token ก่อนทดสอบ');
      return;
    }
    toast.success('ทดสอบส่งข้อความ (ฟังก์ชันนี้ยังไม่ได้ต่อ API ทดสอบตรง)');
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
        toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว');
      } else {
        toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
          <i className="fa-regular fa-bell text-lg"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            การแจ้งเตือน (Notifications)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ตั้งค่าช่องทางการรับข่าวสารและการแจ้งเตือนของระบบ
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <NotificationSettings 
          settings={settings}
          handleChange={handleChange}
          testLineNotify={testLineNotify}
        />
        <div className="flex justify-end pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
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
    </div>
  );
}
