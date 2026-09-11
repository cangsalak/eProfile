'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import BadgeDesignSettings from '../settings/BadgeDesignSettings';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';
import { Button, Card } from '@/components/ui';

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
    const nextValue =
      type === 'checkbox' ? (event.target as HTMLInputElement).checked.toString() : value;
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
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500">
        <i className="fa-solid fa-spinner fa-spin text-3xl text-primary-500 mb-3" />
        <p className="text-xs text-slate-500 dark:text-slate-400">กำลังโหลดสตูดิโอออกแบบบัตร...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-prompt">
      {/* Submenu Slots in Universal Header */}
      <PageHeaderExtra>
        <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
          <Link
            href="/modules/badges"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60"
          >
            <i className="fa-solid fa-print text-xs text-slate-400"></i>
            <span>พิมพ์บัตรประจำตัว</span>
          </Link>
          <Link
            href="/modules/badges/settings"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 bg-primary-600 text-white shadow-sm shadow-primary-500/30"
          >
            <i className="fa-solid fa-palette text-xs"></i>
            <span>สตูดิโอออกแบบบัตร</span>
          </Link>
          <Link
            href="/modules/badges/my"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60"
          >
            <i className="fa-solid fa-address-card text-xs text-slate-400"></i>
            <span>บัตรของฉัน</span>
          </Link>
        </div>
      </PageHeaderExtra>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void saveSettings();
        }}
        className="space-y-6"
      >
        <Card className="p-6">
          <BadgeDesignSettings
            settings={settings}
            setSettings={setSettings}
            handleChange={handleChange}
            previewSide={previewSide}
            setPreviewSide={setPreviewSide}
          />
          <div className="flex justify-end border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon="fa-solid fa-floppy-disk"
              isLoading={isSaving}
              loadingText="กำลังบันทึก..."
            >
              บันทึกการตั้งค่าบัตร
            </Button>
          </div>
        </Card>
        <input ref={fileInputRef} type="file" className="hidden" tabIndex={-1} aria-hidden="true" />
      </form>
    </div>
  );
}
