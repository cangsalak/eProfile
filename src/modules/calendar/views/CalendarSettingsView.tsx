'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CalendarSettingsView() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('Failed to fetch calendar settings:', err);
      toast.error('ไม่สามารถโหลดการตั้งค่าปฏิทินได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'ไม่สามารถบันทึกการตั้งค่าปฏิทินได้');
      }

      toast.success('บันทึกการตั้งค่าปฏิทินเรียบร้อยแล้ว');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <i className="fa-solid fa-spinner fa-spin text-primary-500 text-2xl"></i>
      </div>
    );
  }

  const urls = settings?.googleCalendarUrls ? JSON.parse(settings.googleCalendarUrls) : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in font-prompt">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-500 flex items-center justify-center text-lg">
            <i className="fa-solid fa-calendar-days"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              ตั้งค่าปฏิทินปฏิบัติงาน (Calendar Settings)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              กำหนดการเชื่อมต่อ Google Calendar iCal และปฏิทินภายนอกสำหรับระบบ
            </p>
          </div>
        </div>

        <Link
          href="/modules/calendar"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>กลับไปหน้าปฏิทิน</span>
        </Link>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-link text-primary-500 text-sm"></i>
                <span>การเชื่อมต่อปฏิทินภายนอก (Google Calendar iCal Integration)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                ดึงข้อมูลกิจกรรมและวันสำคัญจาก Google Calendar มาแสดงผลในหน้าปฏิทินส่วนกลางของระบบ (รองรับหลายปฏิทิน)
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const currentUrls = settings?.googleCalendarUrls ? JSON.parse(settings.googleCalendarUrls) : [];
                setSettings({ ...settings, googleCalendarUrls: JSON.stringify([...currentUrls, { name: '', url: '' }]) });
              }}
              className="text-xs bg-primary-600 hover:bg-primary-500 text-white px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 font-semibold shadow-sm shrink-0"
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
              <span>เพิ่มปฏิทิน</span>
            </button>
          </div>

          <div className="space-y-3">
            {urls.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <i className="fa-regular fa-calendar-xmark text-3xl mb-2 text-slate-400 block"></i>
                <span>ยังไม่ได้เพิ่มปฏิทิน Google Calendar คลิกปุ่ม "เพิ่มปฏิทิน" ด้านบนเพื่อเริ่มต้น</span>
              </div>
            ) : (
              urls.map((cal: any, index: number) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <label htmlFor={`googleCalendarName_${index}`} className="sr-only">ชื่อปฏิทิน</label>
                  <input 
                    id={`googleCalendarName_${index}`}
                    type="text" 
                    aria-label={`ชื่อปฏิทินรายการที่ ${index + 1}`}
                    placeholder="ชื่อปฏิทิน (เช่น วันหยุดราชการ, กิจกรรมประจำปี)" 
                    value={cal.name}
                    onChange={(e) => {
                      const newUrls = [...urls];
                      newUrls[index].name = e.target.value;
                      setSettings({ ...settings, googleCalendarUrls: JSON.stringify(newUrls) });
                    }}
                    className="w-full sm:w-1/3 form-control py-2 text-xs"
                  />
                  <label htmlFor={`googleCalendarUrl_${index}`} className="sr-only">ลิงก์ iCal</label>
                  <input 
                    id={`googleCalendarUrl_${index}`}
                    type="text" 
                    aria-label={`ลิงก์ iCal รายการที่ ${index + 1}`}
                    placeholder="ลิงก์ iCal (https://calendar.google.com/calendar/ical/.../basic.ics)" 
                    value={cal.url}
                    onChange={(e) => {
                      const newUrls = [...urls];
                      newUrls[index].url = e.target.value;
                      setSettings({ ...settings, googleCalendarUrls: JSON.stringify(newUrls) });
                    }}
                    className="w-full flex-1 form-control py-2 text-xs font-mono"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      const newUrls = urls.filter((_: any, i: number) => i !== index);
                      setSettings({ ...settings, googleCalendarUrls: JSON.stringify(newUrls) });
                    }}
                    className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors shrink-0"
                    title="ลบปฏิทินนี้"
                  >
                    <i className="fa-solid fa-trash text-xs"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 dark:border-slate-800 pt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2"
          >
            {isSaving ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-save" />}
            <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าปฏิทิน'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
