'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Smartphone,
  ExternalLink,
  Info,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('คัดลอกลิงก์เรียบร้อยแล้ว');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="สมัครรับปฏิทินสด (Live Calendar Subscription)"
      subtitle="ซิงค์ตารางเวรและภารกิจเข้ามือถือ iOS, Android และ Google Calendar อัตโนมัติ"
      icon="fa-solid fa-rss"
      size="md"
      footer={
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            ปิด
          </Button>
        </div>
      }
    >
      <div className="space-y-5 font-prompt">
        {/* Feed URL Box */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            URL สำหรับ Subscription (iCal / Webcal Feed)
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              readOnly
              value={feedUrl}
              className="text-xs font-mono select-all flex-1"
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleCopy(feedUrl)}
              icon={copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'}
            >
              {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
            </Button>
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

        {/* Instructions */}
        <div className="space-y-3 pt-1">
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
    </Modal>
  );
};
