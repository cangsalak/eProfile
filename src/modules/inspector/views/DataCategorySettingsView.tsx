import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DataCategorySettings from '../components/DataCategorySettings';
import InspectorLayout from './InspectorLayout';

export default function DataCategorySettingsView() {
  const [settings, setSettings] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error('Failed to fetch settings:', err));
  }, []);

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
    <InspectorLayout
      activeTab="categories"
      title="ข้อมูลพื้นฐานระบบ (Data Categories)"
      description="จัดการคำนำหน้านาม, สถานะกำลังพล, ประเภทกำลังพล และข้อมูลตัวเลือกในระบบ"
    >
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <DataCategorySettings 
          settings={settings}
          setSettings={setSettings}
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
    </InspectorLayout>
  );
}
