'use client';

import React, { useEffect, useRef, useState } from 'react';
import BadgeDesignSettings from '../settings/BadgeDesignSettings';

export default function BadgeSettingsView() {
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');
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
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
  };

  if (!settings) {
    return <div className="p-8 text-center text-slate-500">กำลังโหลดการตั้งค่าบัตร...</div>;
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
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold">
          <i className="fa-solid fa-save mr-2" />บันทึกการตั้งค่าบัตร
        </button>
      </div>
      <input ref={fileInputRef} type="file" className="hidden" tabIndex={-1} aria-hidden="true" />
    </form>
  );
}
