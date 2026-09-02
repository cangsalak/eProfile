'use client';

import React, { useState } from 'react';

interface NotificationSettingsProps {
  settings: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  testLineNotify: () => void;
}

export default function NotificationSettings({ settings, handleChange, testLineNotify }: NotificationSettingsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'line' | 'mail' | 'all'>('line');

  const subTabs = [
    { id: 'line', name: 'LINE Bot (Messaging API)', icon: 'fa-brands fa-line' },
    { id: 'mail', name: 'อีเมลแจ้งเตือน (Email SMTP)', icon: 'fa-solid fa-envelope' },
    { id: 'all', name: 'แสดงทั้งหมด', icon: 'fa-solid fa-layer-group' },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-prompt">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-bell text-primary-500"></i>
            <span>การแจ้งเตือนอัตโนมัติ (LINE Bot & Email)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ตั้งค่าช่องทางการแจ้งเตือนอัตโนมัติของระบบผ่าน LINE Messaging API และ Email SMTP
          </p>
        </div>
      </div>

      {/* Sub-tab Filter Pills */}
      <div 
        role="tablist" 
        aria-label="ช่องทางการแจ้งเตือน"
        className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-full sm:w-fit overflow-x-auto border border-slate-200 dark:border-slate-700/80"
      >
        {subTabs.map(st => {
          const isSelected = activeSubTab === st.id;
          return (
            <button
              key={st.id}
              role="tab"
              id={`subtab-notif-${st.id}`}
              aria-controls={`subtabpanel-notif-${st.id}`}
              aria-selected={isSelected}
              type="button"
              onClick={() => setActiveSubTab(st.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm border border-slate-200 dark:border-slate-700/70'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <i className={`${st.icon} text-xs ${isSelected ? 'text-primary-500' : 'text-slate-400'}`}></i>
              <span>{st.name}</span>
            </button>
          );
        })}
      </div>

      {/* 1. LINE Bot Section */}
      {(activeSubTab === 'all' || activeSubTab === 'line') && (
        <div 
          role="tabpanel"
          id="subtabpanel-notif-line"
          aria-labelledby="subtab-notif-line"
          className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center text-lg shrink-0">
                <i className="fa-brands fa-line"></i>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">LINE Bot (Messaging API)</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">ส่งการแจ้งเตือนไปยังผู้ใช้หรือกลุ่มไลน์</p>
              </div>
            </div>

            <label htmlFor="enableLineNotify" className="relative inline-flex items-center cursor-pointer">
              <input
                id="enableLineNotify"
                type="checkbox"
                name="enableLineNotify"
                aria-label="เปิดใช้งานการแจ้งเตือนผ่าน LINE Bot"
                checked={settings.enableLineNotify === 'true'}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
              <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline">
                {settings.enableLineNotify === 'true' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
              </span>
            </label>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2">
              <i className="fa-solid fa-circle-info text-primary-500 mt-0.5 shrink-0"></i>
              <span>
                เนื่องจาก LINE Notify ถูกยกเลิกการให้บริการ ระบบจึงเปลี่ยนมาใช้ <strong>LINE Messaging API</strong> แทน
              </span>
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2">
              <i className="fa-solid fa-key text-amber-500 mt-0.5 shrink-0"></i>
              <span>
                ตั้งค่า <code className="bg-slate-200 dark:bg-slate-700/80 px-1.5 py-0.5 rounded text-primary-600 dark:text-primary-400 font-mono text-[11px]">LINE_CHANNEL_ACCESS_TOKEN</code> และ <code className="bg-slate-200 dark:bg-slate-700/80 px-1.5 py-0.5 rounded text-primary-600 dark:text-primary-400 font-mono text-[11px]">LINE_USER_ID</code> ในไฟล์ <code className="bg-slate-200 dark:bg-slate-700/80 px-1.5 py-0.5 rounded font-mono text-[11px]">.env</code> บนเซิร์ฟเวอร์
              </span>
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={testLineNotify}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5"
            >
              <i className="fa-brands fa-line text-emerald-500 text-sm"></i>
              <span>ทดสอบส่งข้อความ LINE</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Email SMTP Section */}
      {(activeSubTab === 'all' || activeSubTab === 'mail') && (
        <div 
          role="tabpanel"
          id="subtabpanel-notif-mail"
          aria-labelledby="subtab-notif-mail"
          className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center text-lg shrink-0">
                <i className="fa-solid fa-envelope"></i>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Email แจ้งเตือน (SMTP)</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">ส่งการแจ้งเตือนและการแจ้งเตือนระบบผ่านอีเมล</p>
              </div>
            </div>

            <label htmlFor="enableEmailNotify" className="relative inline-flex items-center cursor-pointer">
              <input
                id="enableEmailNotify"
                type="checkbox"
                name="enableEmailNotify"
                aria-label="เปิดใช้งานการแจ้งเตือนผ่าน Email"
                checked={settings.enableEmailNotify === 'true'}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-500"></div>
              <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline">
                {settings.enableEmailNotify === 'true' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
              </span>
            </label>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2">
              <i className="fa-solid fa-shield-halved text-blue-500 mt-0.5 shrink-0"></i>
              <span>
                เพื่อความปลอดภัยสูงสุด การตั้งค่าการเชื่อมต่อ SMTP (Host, Port, User, Password) จะต้องกำหนดผ่านไฟล์ <code className="bg-slate-200 dark:bg-slate-700/80 px-1.5 py-0.5 rounded font-mono text-[11px]">.env</code> บนเซิร์ฟเวอร์
              </span>
            </p>
          </div>

          <div>
            <label htmlFor="notifyEmailTo" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              อีเมลผู้รับการแจ้งเตือนเริ่มต้น (To:)
            </label>
            <div className="relative">
              <i className="fa-solid fa-at absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                id="notifyEmailTo"
                type="email"
                name="notifyEmailTo"
                aria-label="อีเมลผู้รับการแจ้งเตือน"
                value={settings.notifyEmailTo || ''}
                onChange={handleChange}
                placeholder="admin@yourdomain.com"
                className="form-control pl-9"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
