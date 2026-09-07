'use client';

import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import BadgeDesignSettings from '../settings/BadgeDesignSettings';

export default function BadgeSettingsView() {
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((response) => response.json())
      .then((data) => setSettings(data))
      .catch(() => setSettings({}));
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const nextValue = type === 'checkbox'
      ? (event.target as HTMLInputElement).checked.toString()
      : value;
    setSettings((previous) => ({ ...previous, [name]: nextValue }));
  };

  const saveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'ไม่สามารถบันทึกการตั้งค่าได้');
      }

      toast.success('บันทึกการตั้งค่าบัตรประจำตัวเรียบร้อยแล้ว');
      window.dispatchEvent(new CustomEvent('eprofile-settings-change', { detail: settings }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <i className="fa-solid fa-spinner fa-spin text-2xl text-primary-500 mb-3" />
        <p className="text-sm">กำลังโหลดการตั้งค่าบัตร...</p>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); void saveSettings(); }} className="space-y-6">
      <BadgeDesignSettings
        settings={settings}
        setSettings={setSettings}
        handleChange={handleChange}
        previewSide={previewSide}
        setPreviewSide={setPreviewSide}
      />
      <div className="flex justify-end border-t border-slate-200 dark:border-slate-800 pt-6">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold shadow-md shadow-primary-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          {isSaving ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-floppy-disk" />}
          {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าบัตร'}
        </button>
      </div>
      <input ref={fileInputRef} type="file" className="hidden" tabIndex={-1} aria-hidden="true" />
    </form>
  );
}
