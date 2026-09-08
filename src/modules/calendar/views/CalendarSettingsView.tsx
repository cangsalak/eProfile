'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Calendar as CalendarIcon,
  Link as LinkIcon,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Users,
  Tag,
} from 'lucide-react';
import { DEFAULT_DUTY_ROLES } from '../types';

export default function CalendarSettingsView() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newRoleInput, setNewRoleInput] = useState('');

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
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const urls = settings?.googleCalendarUrls ? JSON.parse(settings.googleCalendarUrls) : [];

  let dutyRoles: string[] = DEFAULT_DUTY_ROLES;
  if (settings?.calendarDutyRoles) {
    try {
      dutyRoles = JSON.parse(settings.calendarDutyRoles);
    } catch {
      dutyRoles = DEFAULT_DUTY_ROLES;
    }
  }

  const handleAddRole = () => {
    const trimmed = newRoleInput.trim();
    if (!trimmed) return;
    if (dutyRoles.includes(trimmed)) {
      toast.error('มีตำแหน่งหน้าที่นี้อยู่ในรายการแล้ว');
      return;
    }
    const updated = [...dutyRoles, trimmed];
    setSettings({ ...settings, calendarDutyRoles: JSON.stringify(updated) });
    setNewRoleInput('');
    toast.success(`เพิ่มตำแหน่ง "${trimmed}" เรียบร้อยแล้ว`);
  };

  const handleRemoveRole = (roleToRemove: string) => {
    const updated = dutyRoles.filter((r) => r !== roleToRemove);
    setSettings({ ...settings, calendarDutyRoles: JSON.stringify(updated) });
  };

  const handleResetDefaultRoles = () => {
    setSettings({ ...settings, calendarDutyRoles: JSON.stringify(DEFAULT_DUTY_ROLES) });
    toast.success('คืนค่าตำแหน่งหน้าที่เริ่มต้นเรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      <form onSubmit={handleSave} className="space-y-6">
        {/* ── Section 1: Duty Roles & Positions Management ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-500" />
                <span>การจัดการตำแหน่งหน้าที่เวรปฏิบัติการ (Duty Roles & Positions)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                กำหนดรายการตำแหน่งหน้าที่สำหรับเลือกมอบหมายกำลังพลในการลงตารางเวรและภารกิจ
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetDefaultRoles}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-semibold border border-slate-200 dark:border-slate-700 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>คืนค่าเริ่มต้น</span>
            </button>
          </div>

          {/* Add Role Input Bar */}
          <div className="flex gap-2 max-w-lg">
            <input
              type="text"
              value={newRoleInput}
              onChange={(e) => setNewRoleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRole();
                }
              }}
              placeholder="พิมพ์ชื่อตำแหน่งหน้าที่ใหม่ เช่น สารวัตรเวร, เวรยามตรวจการณ์..."
              className="form-input text-xs flex-1"
            />
            <button
              type="button"
              onClick={handleAddRole}
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มตำแหน่ง</span>
            </button>
          </div>

          {/* Role Badges List */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              ตำแหน่งหน้าที่ที่มีอยู่ในระบบ ({dutyRoles.length} ตำแหน่ง):
            </label>
            <div className="flex flex-wrap gap-2.5">
              {dutyRoles.map((role, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs group hover:border-primary-400 transition-colors"
                >
                  <Tag className="w-3.5 h-3.5 text-primary-500" />
                  <span>{role}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(role)}
                    className="text-slate-400 hover:text-rose-500 p-0.5 rounded-md transition-colors"
                    title={`ลบตำแหน่ง ${role}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section 2: Google Calendar iCal Integration ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-primary-500" />
                <span>การเชื่อมต่อปฏิทินภายนอก (Google Calendar iCal Integration)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ดึงข้อมูลกิจกรรมและวันสำคัญจาก Google Calendar มาแสดงผลในหน้าปฏิทินส่วนกลางของระบบ
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const currentUrls = settings?.googleCalendarUrls ? JSON.parse(settings.googleCalendarUrls) : [];
                setSettings({ ...settings, googleCalendarUrls: JSON.stringify([...currentUrls, { name: '', url: '' }]) });
              }}
              className="text-xs bg-primary-600 hover:bg-primary-500 text-white px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 font-semibold shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มปฏิทิน</span>
            </button>
          </div>

          <div className="space-y-3">
            {urls.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <CalendarIcon className="w-8 h-8 mb-2 text-slate-400 mx-auto block opacity-60" />
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
                    className="w-full sm:w-1/3 form-input py-2 text-xs"
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
                    className="w-full flex-1 form-input py-2 text-xs font-mono"
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
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Save Button Bar ── */}
        <div className="flex justify-end bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'กำลังบันทึกการตั้งค่า...' : 'บันทึกการตั้งค่าปฏิทิน'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
