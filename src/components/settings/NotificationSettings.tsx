import React from 'react';

interface NotificationSettingsProps {
  settings: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  testLineNotify: () => void;
  tab: 'line' | 'mail';
}

export default function NotificationSettings({ settings, handleChange, testLineNotify, tab }: NotificationSettingsProps) {
  if (tab === 'line') {
    return (
      <div className="space-y-5 animate-fade-in">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center">
          <i className="fa-brands fa-line text-green-500 mr-2 text-xl"></i> LINE Bot (Messaging API)
        </h3>
        <div className="flex items-center space-x-3 pb-2">
          <input type="checkbox" name="enableLineNotify" checked={settings.enableLineNotify === 'true'} onChange={handleChange} id="enableLineNotify" className="w-4 h-4 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-800" />
          <label htmlFor="enableLineNotify" className="text-slate-700 dark:text-slate-300 font-medium">เปิดใช้งานการแจ้งเตือนผ่าน LINE Bot</label>
        </div>
        <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
            <i className="fa-solid fa-lock text-slate-500 mr-2"></i>
            เนื่องจาก LINE Notify ถูกยกเลิกการให้บริการ ระบบจึงเปลี่ยนมาใช้ <strong>LINE Messaging API</strong> แทน
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            กรุณาตั้งค่า <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-primary-500">LINE_CHANNEL_ACCESS_TOKEN</code> และ <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-primary-500">LINE_USER_ID</code> ในไฟล์ <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">.env</code> บนเซิร์ฟเวอร์โดยตรง
          </p>
        </div>
        <div className="pt-2">
          <button type="button" onClick={testLineNotify} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-900 dark:text-white text-sm rounded-lg transition-colors">
            ทดสอบการส่งข้อความ
          </button>
        </div>
      </div>
    );
  }

  if (tab === 'mail') {
    return (
      <div className="space-y-5 animate-fade-in">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center">
          <i className="fa-solid fa-envelope text-blue-400 mr-2 text-xl"></i> Email (SMTP) แจ้งเตือน
        </h3>
        <div className="flex items-center space-x-3 pb-2">
          <input type="checkbox" name="enableEmailNotify" checked={settings.enableEmailNotify === 'true'} onChange={handleChange} id="enableEmailNotify" className="w-4 h-4 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-800" />
          <label htmlFor="enableEmailNotify" className="text-slate-700 dark:text-slate-300 font-medium">เปิดใช้งานการแจ้งเตือนผ่าน Email</label>
        </div>
        <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <i className="fa-solid fa-lock text-slate-500 mr-2"></i>
            เพื่อความปลอดภัยขั้นสูงสุด การตั้งค่า SMTP (Host, Port, User, Password) จะต้องตั้งค่าผ่านไฟล์ <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">.env</code> บนเซิร์ฟเวอร์เท่านั้น
          </p>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700/50 pt-4 mt-2">
          <label className="block text-slate-500 dark:text-slate-400 text-sm mb-1">อีเมลผู้รับการแจ้งเตือน (To:)</label>
          <input type="email" name="notifyEmailTo" value={settings.notifyEmailTo || ''} onChange={handleChange} placeholder="admin@yourdomain.com" className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white" />
        </div>
      </div>
    );
  }

  return null;
}
