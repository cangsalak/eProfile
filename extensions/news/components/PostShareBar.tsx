'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Share2,
  Copy,
  Check,
  QrCode,
  Printer,
  ExternalLink,
  Download,
} from 'lucide-react';
import { Modal, Button } from '@/components/ui';

interface PostShareBarProps {
  title: string;
  url?: string;
  className?: string;
  compact?: boolean;
}

export default function PostShareBar({
  title,
  url,
  className = '',
  compact = false,
}: PostShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(url || '');
  const [showQrModal, setShowQrModal] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = url || window.location.href;
      setShareUrl(currentUrl);
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        setCanNativeShare(true);
      }
    }
  }, [url]);

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success('คัดลอกลิงก์บทความเรียบร้อยแล้ว');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
      toast.error('ไม่สามารถคัดลอกลิงก์ได้');
    }
  };

  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer,width=620,height=520');
  };

  const handleShareLine = () => {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(lineUrl, '_blank', 'noopener,noreferrer,width=620,height=520');
  };

  const handleShareTwitter = () => {
    const tweetText = `${title}\n`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=620,height=520');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: title,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Share error:', err);
        }
      }
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=12&data=${encodeURIComponent(shareUrl)}`;

  // Compact Mode (used in small widgets or sidebars)
  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all shadow-2xs"
          title="คัดลอกลิงก์"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
        </button>

        <button
          type="button"
          onClick={handleShareLine}
          className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white transition-transform hover:scale-105 shadow-2xs"
          title="แชร์ไปยัง LINE"
        >
          <i className="fa-brands fa-line text-sm"></i>
        </button>

        <button
          type="button"
          onClick={handleShareFacebook}
          className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white transition-transform hover:scale-105 shadow-2xs"
          title="แชร์ไปยัง Facebook"
        >
          <i className="fa-brands fa-facebook-f text-sm"></i>
        </button>

        <button
          type="button"
          onClick={handleShareTwitter}
          className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-black text-white transition-transform hover:scale-105 shadow-2xs"
          title="แชร์ไปยัง X (Twitter)"
        >
          <i className="fa-brands fa-x-twitter text-sm"></i>
        </button>

        <button
          type="button"
          onClick={() => setShowQrModal(true)}
          className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title="สแกน QR Code"
        >
          <QrCode className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Full Executive Editorial Share Bar
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm font-prompt ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left: Branding & Message */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-primary-500/25 shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
              แบ่งปันบทความและข่าวสารนี้
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ส่งต่อข้อมูลที่เป็นประโยชน์ หรือแชร์ลงช่องทางโซเชียลมีเดียของท่าน
            </p>
          </div>
        </div>

        {/* Right: Action Buttons Group */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>คัดลอกเรียบร้อย!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span>คัดลอกลิงก์</span>
              </>
            )}
          </button>

          {/* LINE Button */}
          <button
            type="button"
            onClick={handleShareLine}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#06C755] hover:bg-[#05b34c] text-white shadow-xs hover:shadow-md hover:shadow-[#06C755]/20 transition-all active:scale-95"
            title="แชร์ไปยัง LINE"
          >
            <i className="fa-brands fa-line text-base"></i>
            <span>LINE</span>
          </button>

          {/* Facebook Button */}
          <button
            type="button"
            onClick={handleShareFacebook}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-xs hover:shadow-md hover:shadow-[#1877F2]/20 transition-all active:scale-95"
            title="แชร์ไปยัง Facebook"
          >
            <i className="fa-brands fa-facebook-f text-sm"></i>
            <span>Facebook</span>
          </button>

          {/* X (Twitter) Button */}
          <button
            type="button"
            onClick={handleShareTwitter}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white shadow-xs transition-all active:scale-95"
            title="แชร์ไปยัง X"
          >
            <i className="fa-brands fa-x-twitter text-sm"></i>
            <span>X</span>
          </button>

          {/* QR Code Button */}
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs transition-all active:scale-95"
            title="สแกน QR Code"
          >
            <QrCode className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span>QR Code</span>
          </button>

          {/* Native OS Share (if mobile/tablet) */}
          {canNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/60 border border-primary-200 dark:border-primary-800 transition-all"
              title="แชร์ผ่านระบบปฏิบัติการ"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="สั่งพิมพ์บทความนี้"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <Modal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          title="สแกน QR Code เพื่อเปิดอ่านบนมือถือ"
          subtitle={title}
          icon="fa-solid fa-qrcode"
          size="sm"
        >
          <div className="flex flex-col items-center justify-center p-4 text-center space-y-4 font-prompt">
            <div className="p-4 bg-white rounded-3xl shadow-xl border border-slate-200 inline-block">
              <img
                src={qrImageUrl}
                alt={`QR Code - ${title}`}
                className="w-56 h-56 object-contain"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              ใช้กล้องสมาร์ตโฟนหรือแอป LINE สแกน QR Code นี้เพื่อเปิดอ่านข่าวสารนี้บนโทรศัพท์ได้ทันที
            </p>
            <div className="w-full flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 justify-center"
                icon="fa-solid fa-copy"
                onClick={handleCopyLink}
              >
                คัดลอกลิงก์
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 justify-center"
                onClick={() => setShowQrModal(false)}
              >
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
