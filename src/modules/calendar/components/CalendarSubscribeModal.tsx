'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  X,
  Radio,
  Copy,
  Check,
  Smartphone,
  Calendar as CalendarIcon,
  ExternalLink,
  Info,
} from 'lucide-react';

interface CalendarSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarSubscribeModal: React.FC<CalendarSubscribeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [feedUrl, setFeedUrl] = useState('');
  const [webcalUrl, setWebcalUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const httpsUrl = `${origin}/api/calendar/feed`;
      const calUrl = httpsUrl.replace(/^https?:\/\//, 'webcal://');
      setFeedUrl(httpsUrl);
      setWebcalUrl(calUrl);
    }
  }, []);

  if (!isOpen) return null;

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('คัดลอกลิงก์เรียบร้อยแล้ว');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                สมัครรับปฏิทินสด (Live Calendar Subscription)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ซิงค์ตารางเวรและภารกิจเข้ามือถือ iOS, Android และ Google Calendar อัตโนมัติ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Feed URL Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              URL สำหรับ Subscription (iCal / Webcal Feed)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={feedUrl}
                className="form-input text-xs font-mono select-all flex-1 bg-slate-50 dark:bg-slate-850"
              />
              <button
                type="button"
                onClick={() => handleCopy(feedUrl)}
                className="px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
              </button>
            </div>
          </div>

          {/* Quick Subscribe Apple Calendar / Mac */}
          {webcalUrl && (
            <a
              href={webcalUrl}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700"
            >
              <Smartphone className="w-4 h-4 text-primary-500" />
              <span>เปิดและกดติดตามใน Apple Calendar (iPhone / iPad / Mac)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          )}

          {/* Instructions Accordion / Steps */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-primary-500" />
              <span>วิธีตั้งค่าในแต่ละอุปกรณ์</span>
            </h4>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  📱 iPhone / iPad (Apple Calendar)
                </span>
                <p className="text-[11px] leading-relaxed">
                  ไปที่ <strong>การตั้งค่า (Settings)</strong> → <strong>ปฏิทิน (Calendar)</strong> → <strong>บัญชี (Accounts)</strong> → <strong>เพิ่มบัญชี (Add Account)</strong> → <strong>อื่นๆ (Other)</strong> → <strong>เพิ่มปฏิทินที่สมัครรับ (Add Subscribed Calendar)</strong> แล้ววาง URL ด้านบน
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  🌐 Google Calendar (เว็บและ Android)
                </span>
                <p className="text-[11px] leading-relaxed">
                  เปิด <strong>calendar.google.com</strong> ในคอมพิวเตอร์ → มองหาหัวข้อ <strong>"ปฏิทินอื่น" (Other calendars)</strong> กดเครื่องหมาย <strong>+</strong> → เลือก <strong>"จาก URL" (From URL)</strong> แล้ววาง URL ด้านบน
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
