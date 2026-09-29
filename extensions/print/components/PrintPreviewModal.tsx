'use client';

import React, { useState } from 'react';
import { Modal, Button, Badge } from '@/components/ui';
import { PaperSettings } from '../types';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPrint: () => void;
  title: string;
  paperSettings: PaperSettings;
  children: React.ReactNode;
}

export default function PrintPreviewModal({
  isOpen,
  onClose,
  onConfirmPrint,
  title,
  paperSettings,
  children,
}: PrintPreviewModalProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 150));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 50));
  const handleResetZoom = () => setZoomLevel(100);

  const modalTitle = (
    <div className="flex items-center gap-2">
      <span>ตัวอย่างก่อนพิมพ์ (Print Preview)</span>
      <Badge variant="primary" size="xs">
        {paperSettings.pageSize} • {paperSettings.orientation === 'portrait' ? 'แนวตั้ง' : 'แนวนอน'}
      </Badge>
    </div>
  );

  const modalSubtitle = `${title} (ระยะขอบ ${paperSettings.margin})`;

  const modalFooter = (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <i className="fa-solid fa-circle-info text-primary-500" />
        <span>คำแนะนำ: ตั้งค่า <strong>Scale = 100% (Default)</strong>, <strong>Margins = None</strong> และติ๊ก <strong>Background Graphics</strong> เพื่อให้ขนาดบัตร 5.4 × 8.6 ซม. ตรงตามมาตรฐาน ISO</span>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Zoom Controls */}
        <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 50}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition text-slate-600 dark:text-slate-300"
            title="ย่อขนาด"
          >
            <i className="fa-solid fa-magnifying-glass-minus text-xs" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2.5 h-7 flex items-center justify-center font-mono font-bold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition text-slate-800 dark:text-slate-200"
            title="ขนาดปกติ 100%"
          >
            {zoomLevel}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 150}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition text-slate-600 dark:text-slate-300"
            title="ขยายขนาด"
          >
            <i className="fa-solid fa-magnifying-glass-plus text-xs" />
          </button>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
        >
          ปิดหน้าต่าง
        </Button>

        <Button
          type="button"
          variant="primary"
          size="sm"
          icon="fa-solid fa-print"
          onClick={() => {
            onClose();
            setTimeout(() => onConfirmPrint(), 150);
          }}
          className="font-bold shadow-md shadow-primary-500/30"
        >
          ยืนยันและสั่งพิมพ์
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      icon="fa-solid fa-file-invoice"
      size="full"
      footer={modalFooter}
      className="max-w-6xl"
    >
      {/* Modal Body Preview Canvas */}
      <div className="overflow-auto max-h-[72vh] p-4 sm:p-8 bg-slate-900/40 dark:bg-slate-950/60 rounded-xl flex justify-center items-start">
        <div
          className="transition-transform duration-200 origin-top flex justify-center"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          <div className="shadow-2xl ring-1 ring-slate-300 dark:ring-slate-700 rounded-2xl overflow-hidden bg-white">
            {children}
          </div>
        </div>
      </div>
    </Modal>
  );
}
