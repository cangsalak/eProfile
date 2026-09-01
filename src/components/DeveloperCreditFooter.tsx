/**
 * ============================================================
 * ⚠️  DEVELOPER CREDIT FOOTER — DO NOT REMOVE OR MODIFY ⚠️
 * ============================================================
 */
'use client';

import { useState } from 'react';
import { DEVELOPER_CREDIT } from '@/lib/developer-credit';
import { QR_PAYMENT_B64 } from '@/lib/qr-payment-data';

export default function DeveloperCreditFooter() {
  const [showQR, setShowQR] = useState(false);

  return (
    <>
      <style>{`
        @keyframes arrowBounce {
          0%,100% { transform: translateX(0); }
          50%      { transform: translateX(5px); }
        }
        @keyframes arrowBounceLeft {
          0%,100% { transform: translateX(0); }
          50%      { transform: translateX(-5px); }
        }
        .arrow-right { animation: arrowBounce 0.8s ease-in-out infinite; display:inline-block; }
        .arrow-left  { animation: arrowBounceLeft 0.8s ease-in-out infinite; display:inline-block; }

        @keyframes modalIn {
          from { opacity:0; transform:scale(0.92) translateY(12px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        .modal-box { animation: modalIn 0.25s cubic-bezier(0.16,1,0.3,1) both; }

        .coffee-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(245,158,11,0.10);
          border: 1px solid rgba(245,158,11,0.25);
          transition: all 0.2s;
          user-select: none;
        }
        .coffee-btn:hover {
          background: rgba(245,158,11,0.20);
          border-color: rgba(245,158,11,0.45);
        }
        .coffee-btn:hover .coffee-text {
          color: #d97706;
        }
      `}</style>

      {/* QR Modal */}
      {showQR && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowQR(false)}
        >
          <div
            className="modal-box bg-white rounded-3xl shadow-2xl p-5 max-w-xs w-full text-center relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm transition"
            >
              ✕
            </button>

            {/* Title */}
            <div className="mb-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <i className="fa-solid fa-mug-hot text-amber-500 text-lg" />
                <span className="font-bold text-slate-700 text-base">ค่ากาแฟพัฒนาระบบ</span>
              </div>
              <p className="text-xs text-slate-400">สแกน QR เพื่อโอนเงินผ่าน PromptPay</p>
            </div>

            {/* QR Image — base64 embedded, read-only */}
            {/* ⚠️ DO NOT MODIFY src — base64 QR PromptPay กรุงไทย 1130299147 */}
            <img
              src={QR_PAYMENT_B64}
              alt="QR PromptPay กรุงไทย 1130299147 นายเยาวรัตน์ ช่างสลัก"
              className="w-full rounded-2xl border border-slate-100 shadow-sm mb-4"
              draggable={false}
            />

            {/* Info */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50 border border-blue-100">
                <span className="text-xs text-slate-500">ชื่อบัญชี</span>
                <span className="text-xs font-bold text-slate-700">{DEVELOPER_CREDIT.name}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                <span className="text-xs text-slate-500">เลขบัญชี</span>
                <span className="text-xs font-bold text-amber-700">{DEVELOPER_CREDIT.bankRef}</span>
              </div>
            </div>

            <p className="mt-3 text-[10px] text-slate-300">กด ESC หรือคลิกพื้นหลังเพื่อปิด</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        id="dev-credit-footer"
        data-integrity="required"
        className="w-full border-t border-slate-200/60 dark:border-slate-700/40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm print:hidden"
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">

          {/* Left */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500 dark:text-slate-400">eProfile System</span>
            <span>•</span>
            <span>ระบบทำเนียบบุคลากรและโปรไฟล์อิเล็กทรอนิกส์</span>
          </div>

          {/* Right: Developer credit */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-code text-[10px] text-indigo-400" />
              <span>พัฒนาโดย</span>
              <span className="font-semibold text-slate-500 dark:text-slate-400">{DEVELOPER_CREDIT.name}</span>
            </span>

            <span className="hidden sm:inline text-slate-300 dark:text-slate-600">|</span>

            <span className="flex items-center gap-1">
              <i className="fa-solid fa-phone text-[10px] text-green-400" />
              <a href={`tel:${DEVELOPER_CREDIT.phone}`} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                {DEVELOPER_CREDIT.phone}
              </a>
            </span>

            <span className="hidden sm:inline text-slate-300 dark:text-slate-600">|</span>

            <span className="flex items-center gap-1">
              <i className="fa-solid fa-envelope text-[10px] text-sky-400" />
              <a href={`mailto:${DEVELOPER_CREDIT.email}`} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                {DEVELOPER_CREDIT.email}
              </a>
            </span>

            <span className="hidden sm:inline text-slate-300 dark:text-slate-600">|</span>

            {/* ☕ Coffee Button with pulsing arrows */}
            {/* ⚠️ DO NOT REMOVE — integral part of developer credit */}
            <button
              type="button"
              onClick={() => setShowQR(true)}
              className="coffee-btn"
              title="คลิกเพื่อดู QR รับเงิน"
            >
              <span className="arrow-left text-amber-400 text-[10px]">◀</span>
              <i className="fa-solid fa-mug-hot text-[10px] text-amber-400" />
              <span className="coffee-text text-[11px] font-semibold text-slate-500 dark:text-slate-400 transition-colors">
                ค่ากาแฟ: {DEVELOPER_CREDIT.bankRef}
              </span>
              <span className="arrow-right text-amber-400 text-[10px]">▶</span>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
