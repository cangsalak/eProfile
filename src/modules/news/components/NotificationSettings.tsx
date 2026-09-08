'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface NotificationSettingsProps {
  settings: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  testLineNotify?: () => void;
}

export default function NotificationSettings({ settings, handleChange }: NotificationSettingsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'events' | 'line' | 'mail' | 'all'>('events');
  const [isTestingLine, setIsTestingLine] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [customTestMsg, setCustomTestMsg] = useState('');

  const subTabs = [
    { id: 'events', name: 'เหตุการณ์ที่แจ้งเตือน (Triggers)', icon: 'fa-solid fa-bolt' },
    { id: 'line', name: 'LINE Bot (Messaging API)', icon: 'fa-brands fa-line' },
    { id: 'mail', name: 'อีเมลแจ้งเตือน (Email SMTP)', icon: 'fa-solid fa-envelope' },
    { id: 'all', name: 'แสดงทั้งหมด', icon: 'fa-solid fa-layer-group' },
  ];

  const handleTestLine = async () => {
    setIsTestingLine(true);
    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'line',
          target: settings.lineTargetId || '',
          message: customTestMsg || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'ส่งข้อความทดสอบไปยัง LINE สำเร็จ');
      } else {
        toast.error(data.message || 'ส่งข้อความไม่สำเร็จ กรุณาตรวจสอบการตั้งค่า LINE');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อทดสอบ LINE');
    } finally {
      setIsTestingLine(false);
    }
  };

  const handleTestEmail = async () => {
    if (!settings.notifyEmailTo) {
      toast.error('กรุณาระบุอีเมลผู้รับการแจ้งเตือนเริ่มต้นก่อนทดสอบ');
      return;
    }
    setIsTestingEmail(true);
    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email',
          target: settings.notifyEmailTo,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'ส่งอีเมลทดสอบสำเร็จ');
      } else {
        toast.error(data.message || 'ส่งอีเมลทดสอบไม่สำเร็จ');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อทดสอบ Email');
    } finally {
      setIsTestingEmail(false);
    }
  };

  return (
    <div className="space-y-6 font-prompt">
      {/* Sub-tab Navigation Pills */}
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

      {/* 1. Event Triggers Matrix Section */}
      {(activeSubTab === 'all' || activeSubTab === 'events') && (
        <div
          role="tabpanel"
          id="subtabpanel-notif-events"
          aria-labelledby="subtab-notif-events"
          className="space-y-4 animate-fade-in"
        >
          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-sliders text-sm"></i>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">กำหนดเงื่อนไขและเหตุการณ์ที่ต้องการให้แจ้งเตือน</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">เลือกเปิด-ปิดเหตุการณ์ที่ระบบจะส่งการแจ้งเตือนไปยัง LINE และ Email ตามความต้องการ</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Duty & Calendar Events */}
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-3.5">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-calendar-days"></i>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">ปฏิทินปฏิบัติงาน & เวรยาม</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">การแจ้งเตือนตารางการเข้าเวรประจำวัน</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-start justify-between gap-3 cursor-pointer group">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      สรุปรายชื่อกำลังพลเข้าเวรประจำวัน
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">ส่งข้อความสรุปผู้เข้าเวรทุกตำแหน่งในแต่ละวัน (เวลา 07:00 น.)</p>
                  </div>
                  <input
                    type="checkbox"
                    name="notifyDutyDaily"
                    checked={settings.notifyDutyDaily !== 'false'}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 text-primary-600 rounded border-slate-300 dark:border-slate-700 focus:ring-primary-500 dark:bg-slate-800"
                  />
                </label>

                <label className="flex items-start justify-between gap-3 cursor-pointer group">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      เตือนล่วงหน้า 1 วัน ก่อนถึงวันเข้าเวร
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">แจ้งเตือนรายบุคคลไปยังกำลังพลที่มีรายชื่อเข้าเวรในวันถัดไป</p>
                  </div>
                  <input
                    type="checkbox"
                    name="notifyDutyUpcoming"
                    checked={settings.notifyDutyUpcoming !== 'false'}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 text-primary-600 rounded border-slate-300 dark:border-slate-700 focus:ring-primary-500 dark:bg-slate-800"
                  />
                </label>

                <label className="flex items-start justify-between gap-3 cursor-pointer group">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      เมื่อมีการสลับเวร / เปลี่ยนเวรยาม
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">แจ้งเตือนผู้เกี่ยวข้องเมื่อผู้ดูแลทำการปรับเปลี่ยนตารางเวร</p>
                  </div>
                  <input
                    type="checkbox"
                    name="notifyDutyChange"
                    checked={settings.notifyDutyChange !== 'false'}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 text-primary-600 rounded border-slate-300 dark:border-slate-700 focus:ring-primary-500 dark:bg-slate-800"
                  />
                </label>
              </div>
            </div>

            {/* Leave Management Events */}
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-3.5">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-file-lines"></i>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">ระบบการลา (Leaves)</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">การแจ้งเตือนสถานะการยื่นและอนุมัติใบลา</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-start justify-between gap-3 cursor-pointer group">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      เมื่อมีกำลังพลยื่นใบลาใหม่
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">ส่งแจ้งเตือนไปยังผู้บังคับบัญชาหรือผู้มีอำนาจอนุมัติทันที</p>
                  </div>
                  <input
                    type="checkbox"
                    name="notifyLeaveSubmit"
                    checked={settings.notifyLeaveSubmit !== 'false'}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 text-primary-600 rounded border-slate-300 dark:border-slate-700 focus:ring-primary-500 dark:bg-slate-800"
                  />
                </label>

                <label className="flex items-start justify-between gap-3 cursor-pointer group">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      เมื่อใบลาได้รับการอนุมัติ / ไม่อนุมัติ
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">ส่งผลการพิจารณาใบลาแจ้งเตือนกลับไปยังผู้ยื่นใบลา</p>
                  </div>
                  <input
                    type="checkbox"
                    name="notifyLeaveStatus"
                    checked={settings.notifyLeaveStatus !== 'false'}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 text-primary-600 rounded border-slate-300 dark:border-slate-700 focus:ring-primary-500 dark:bg-slate-800"
                  />
                </label>
              </div>
            </div>

            {/* News & Announcements Events */}
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-3.5">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-bullhorn"></i>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">ข่าวสารและคำสั่งด่วน</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">การกระจายข่าวและคำสั่งราชการสำคัญ</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-start justify-between gap-3 cursor-pointer group">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      ประกาศข่าวสารหรือคำสั่งด่วนสำคัญ
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">ส่งบรอดแคสต์ข้อความแจ้งเตือนเมื่อมีการเผยแพร่ข่าวระดับความสำคัญสูง</p>
                  </div>
                  <input
                    type="checkbox"
                    name="notifyNewsUrgent"
                    checked={settings.notifyNewsUrgent !== 'false'}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 text-primary-600 rounded border-slate-300 dark:border-slate-700 focus:ring-primary-500 dark:bg-slate-800"
                  />
                </label>
              </div>
            </div>

            {/* Security & System Events */}
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-3.5">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">ความปลอดภัยระบบ (Security)</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">การแจ้งเตือนความปลอดภัยของบัญชีผู้ใช้</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-start justify-between gap-3 cursor-pointer group">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      การรีเซ็ตรหัสผ่าน / บัญชีถูกระงับ
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">แจ้งเตือนผู้ใช้และผู้ดูแลระบบเมื่อมีคำขอเปลี่ยนรหัสผ่านหรือเหตุการณ์ผิดปกติ</p>
                  </div>
                  <input
                    type="checkbox"
                    name="notifySecurityAlert"
                    checked={settings.notifySecurityAlert !== 'false'}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 text-primary-600 rounded border-slate-300 dark:border-slate-700 focus:ring-primary-500 dark:bg-slate-800"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. LINE Bot Section */}
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
                <p className="text-[11px] text-slate-500 dark:text-slate-400">ส่งการแจ้งเตือนไปยังผู้ใช้หรือกลุ่มไลน์ของหน่วยงาน</p>
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
                เนื่องจาก LINE Notify ยุติการให้บริการ ระบบจึงใช้ <strong>LINE Messaging API</strong> แทนเพื่อความเสถียรและสามารถส่งเข้ากลุ่มได้
              </span>
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2">
              <i className="fa-solid fa-key text-amber-500 mt-0.5 shrink-0"></i>
              <span>
                ตั้งค่า <code className="bg-slate-200 dark:bg-slate-700/80 px-1.5 py-0.5 rounded text-primary-600 dark:text-primary-400 font-mono text-[11px]">LINE_CHANNEL_ACCESS_TOKEN</code> ในไฟล์ <code className="bg-slate-200 dark:bg-slate-700/80 px-1.5 py-0.5 rounded font-mono text-[11px]">.env</code> บนเซิร์ฟเวอร์
              </span>
            </p>
          </div>

          {/* LINE Target ID Field */}
          <div>
            <label htmlFor="lineTargetId" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              LINE Target User ID / Group ID (สำหรับส่งเข้ากลุ่มเวรยามหรือผู้ดูแลหลัก)
            </label>
            <div className="relative">
              <i className="fa-brands fa-line absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500 text-sm"></i>
              <input
                id="lineTargetId"
                type="text"
                name="lineTargetId"
                aria-label="LINE Target ID หรือ Group ID"
                value={settings.lineTargetId || ''}
                onChange={handleChange}
                placeholder="เช่น C0123456789abcdef0123456789abcdef (Group ID) หรือ U012345678..."
                className="form-control pl-9"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              * หากเว้นว่างไว้ ระบบจะใช้ค่าเริ่มต้นจากตัวแปร <code className="font-mono text-[10px]">LINE_USER_ID</code> ในไฟล์ .env
            </p>
          </div>

          {/* Test LINE Message Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <input
              type="text"
              value={customTestMsg}
              onChange={(e) => setCustomTestMsg(e.target.value)}
              placeholder="ข้อความทดสอบ (เว้นว่างเพื่อใช้ข้อความมาตรฐาน)..."
              className="form-control text-xs flex-1"
            />
            <button
              type="button"
              onClick={handleTestLine}
              disabled={isTestingLine}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              {isTestingLine ? (
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              ) : (
                <i className="fa-brands fa-line text-sm"></i>
              )}
              <span>ทดสอบส่งข้อความ LINE</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Email SMTP Section */}
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
                <p className="text-[11px] text-slate-500 dark:text-slate-400">ส่งการแจ้งเตือนเหตุการณ์และคำสั่งราชการผ่านอีเมล</p>
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
                เพื่อความปลอดภัยสูงสุด การตั้งค่าการเชื่อมต่อ SMTP Server (<code className="font-mono text-[11px]">SMTP_HOST</code>, <code className="font-mono text-[11px]">SMTP_PORT</code>, <code className="font-mono text-[11px]">SMTP_USER</code>, <code className="font-mono text-[11px]">SMTP_PASS</code>) จะถูกอ่านจากไฟล์ <code className="bg-slate-200 dark:bg-slate-700/80 px-1.5 py-0.5 rounded font-mono text-[11px]">.env</code> บนเซิร์ฟเวอร์
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="notifyEmailFromName" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                ชื่อผู้ส่งอีเมล (Sender Name)
              </label>
              <input
                id="notifyEmailFromName"
                type="text"
                name="notifyEmailFromName"
                aria-label="ชื่อผู้ส่งอีเมล"
                value={settings.notifyEmailFromName || ''}
                onChange={handleChange}
                placeholder="เช่น eProfile Notification หรือ กรม..."
                className="form-control"
              />
            </div>

            <div>
              <label htmlFor="notifyEmailFromAddress" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                อีเมลผู้ส่ง (Sender Address)
              </label>
              <input
                id="notifyEmailFromAddress"
                type="email"
                name="notifyEmailFromAddress"
                aria-label="อีเมลผู้ส่ง"
                value={settings.notifyEmailFromAddress || ''}
                onChange={handleChange}
                placeholder="noreply@yourdomain.com"
                className="form-control"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notifyEmailTo" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              อีเมลผู้รับการแจ้งเตือนเริ่มต้น (To / Fallback Email)
            </label>
            <div className="relative">
              <i className="fa-solid fa-at absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                id="notifyEmailTo"
                type="email"
                name="notifyEmailTo"
                aria-label="อีเมลผู้รับการแจ้งเตือนเริ่มต้น"
                value={settings.notifyEmailTo || ''}
                onChange={handleChange}
                placeholder="admin@yourdomain.com"
                className="form-control pl-9"
              />
            </div>
          </div>

          {/* Test Email Section */}
          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={isTestingEmail}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isTestingEmail ? (
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              ) : (
                <i className="fa-solid fa-paper-plane text-xs"></i>
              )}
              <span>ทดสอบส่งอีเมล (Test Email)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
