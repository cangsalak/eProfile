'use client';

import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { CanvasElement, FieldMapping, RankColorsConfig, AVAILABLE_FONTS } from './types';
import { isImageSrc } from '@/modules/users';

interface CanvasPropertiesPanelProps {
  element: CanvasElement | null;
  canvasWidth: number;
  canvasHeight: number;
  rankColors?: RankColorsConfig;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function CanvasPropertiesPanel({
  element,
  canvasWidth,
  canvasHeight,
  rankColors,
  onUpdate,
  onDelete,
  onClose
}: CanvasPropertiesPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Accordion collapsible sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    align: false,
    transform: false,
    content: true,
    typography: true,
    image: true,
    background: false,
    border: false,
    opacity: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setAllSections = (isOpen: boolean) => {
    setOpenSections({
      align: isOpen,
      transform: isOpen,
      content: isOpen,
      typography: isOpen,
      image: isOpen,
      background: isOpen,
      border: isOpen,
      opacity: isOpen,
    });
  };

  if (!element) return null;

  // Helper to compute visual bounding box dimensions accounting for rotation
  const getVisualRotatedBounds = () => {
    const rad = ((element.rotation || 0) * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    const rotW = element.width * cos + element.height * sin;
    const rotH = element.width * sin + element.height * cos;
    return { rotW, rotH };
  };

  // 1. Align Left (Flush to card's left margin / 0px)
  const handleAlignLeft = () => {
    const { rotW } = getVisualRotatedBounds();
    const newX = Math.round((rotW - element.width) / 2);
    onUpdate(element.id, { x: newX });
  };

  // 2. Align Center Horizontal
  const handleCenterH = () => {
    const newX = Math.round((canvasWidth - element.width) / 2);
    onUpdate(element.id, { x: newX });
  };

  // 3. Align Right (Flush to card's right margin / canvasWidth)
  const handleAlignRight = () => {
    const { rotW } = getVisualRotatedBounds();
    const newX = Math.round(canvasWidth - (element.width + rotW) / 2);
    onUpdate(element.id, { x: newX });
  };

  // 4. Align Top (Flush to card's top margin / 0px)
  const handleAlignTop = () => {
    const { rotH } = getVisualRotatedBounds();
    const newY = Math.round((rotH - element.height) / 2);
    onUpdate(element.id, { y: newY });
  };

  // 5. Align Center Vertical
  const handleCenterV = () => {
    const newY = Math.round((canvasHeight - element.height) / 2);
    onUpdate(element.id, { y: newY });
  };

  // 6. Align Bottom (Flush to card's bottom margin / canvasHeight)
  const handleAlignBottom = () => {
    const { rotH } = getVisualRotatedBounds();
    const newY = Math.round(canvasHeight - (element.height + rotH) / 2);
    onUpdate(element.id, { y: newY });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, WebP, SVG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUpdate(element.id, {
        field: 'static',
        content: dataUrl,
      });
      toast.success('อัปเดตรูปภาพเรียบร้อย');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getElementTitle = () => {
    if (element.field === 'avatar') return 'กรอบรูปถ่ายกำลังพล (Avatar)';
    if (element.type === 'image') return 'รูปภาพคงที่ / โลโก้ (Image)';
    if (element.type === 'qr') return 'คิวอาร์โค้ด (QR Code)';
    if (element.type === 'barcode') return 'บาร์โค้ด (Barcode)';
    if (element.type === 'emblem') return 'ตราสัญลักษณ์ (Emblem)';
    if (element.type === 'hologram') return 'โฮโลแกรมกันปลอม (Hologram)';
    if (element.type === 'ribbon') return 'แถบป้ายยศ/สังกัด (Ribbon)';
    if (element.field === 'fullName') return 'ชื่อ - สกุล (fullName)';
    if (element.field === 'position') return 'ตำแหน่ง (position)';
    if (element.field === 'department') return 'สังกัด (department)';
    if (element.field === 'rank') return 'ชั้นยศ / ประเภท (rank)';
    if (element.field === 'badgeNo') return 'รหัสประจำตัว (badgeNo)';
    if (element.type === 'text') return 'กล่องข้อความ (Text)';
    return `องค์ประกอบ (${element.type})`;
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`absolute top-4 right-4 z-40 w-80 sm:w-84 max-h-[calc(100%-32px)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-xs font-prompt select-none text-slate-800 dark:text-slate-100 transition-all animate-in fade-in zoom-in-95 duration-150 ${
        isMinimized ? 'h-auto' : ''
      }`}
    >
      {/* Floating Header */}
      <div className="flex items-center justify-between p-3.5 bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <div className="w-7 h-7 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <i className={`fa-solid ${
              element.type === 'text' ? 'fa-font' :
              element.type === 'image' ? 'fa-image' :
              element.type === 'qr' ? 'fa-qrcode' :
              element.type === 'barcode' ? 'fa-barcode' :
              element.type === 'emblem' ? 'fa-shield-halved' : 'fa-shapes'
            } text-xs`} />
          </div>
          <div className="truncate">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
              {getElementTitle()}
            </h4>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              ID: {element.id}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Delete in Header */}
          <button
            type="button"
            onClick={() => onDelete(element.id)}
            title="ลบองค์ประกอบนี้ทันที"
            className="w-7 h-7 rounded-xl flex items-center justify-center text-rose-500 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-600 transition"
          >
            <i className="fa-solid fa-trash-can text-xs" />
          </button>
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'ขยายหน้าต่าง' : 'ย่อหน้าต่าง'}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
          >
            <i className={`fa-solid ${isMinimized ? 'fa-chevron-down' : 'fa-minus'} text-xs`} />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="ปิดหน้าต่างปรับแต่ง"
            className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>
      </div>

      {/* Accordion Controls Bar */}
      {!isMinimized && (
        <div className="px-3.5 py-1.5 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] shrink-0">
          <span className="text-slate-500 dark:text-slate-400 font-medium text-[10px]">
            หมวดหมู่คุณสมบัติ
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setAllSections(false)}
              className="px-2 py-0.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition flex items-center gap-1 text-[10px] font-medium"
              title="ย่อทุกส่วนเพื่อให้เลื่อนดูง่ายขึ้น"
            >
              <i className="fa-solid fa-compress text-[10px]" />
              <span>ย่อทั้งหมด</span>
            </button>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <button
              type="button"
              onClick={() => setAllSections(true)}
              className="px-2 py-0.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition flex items-center gap-1 text-[10px] font-medium"
              title="ขยายทุกส่วน"
            >
              <i className="fa-solid fa-expand text-[10px]" />
              <span>ขยายทั้งหมด</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Body */}
      {!isMinimized && (
        <div className="p-3 overflow-y-auto flex-1 min-h-0 flex flex-col gap-2.5">
          {/* Section 1: Quick Alignment Actions */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden transition-all shadow-xs">
            <button
              type="button"
              onClick={() => toggleSection('align')}
              className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-100/60 dark:hover:bg-slate-700/40 transition"
            >
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-arrows-to-dot text-primary-500 text-xs w-4 text-center" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                  จัดตำแหน่งบนบัตร
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">ชิดขอบ/กึ่งกลาง</span>
                <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${openSections.align ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {openSections.align && (
              <div className="p-2.5 pt-1 space-y-2.5 border-t border-slate-200/60 dark:border-slate-700/60 animate-in fade-in duration-150">
                {/* Horizontal Alignment */}
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-medium">แนวนอน (Horizontal):</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={handleAlignLeft}
                      className="py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition shadow-xs text-xs font-semibold"
                      title="จัดชิดขอบซ้ายของบัตร"
                    >
                      <i className="fa-solid fa-align-left text-xs text-primary-500" />
                      <span>ชิดซ้าย</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCenterH}
                      className="py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition shadow-xs text-xs font-semibold"
                      title="จัดกึ่งกลางแนวนอนของบัตร"
                    >
                      <i className="fa-solid fa-arrows-left-right text-xs text-primary-500" />
                      <span>กึ่งกลาง</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAlignRight}
                      className="py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition shadow-xs text-xs font-semibold"
                      title="จัดชิดขอบขวาของบัตร"
                    >
                      <i className="fa-solid fa-align-right text-xs text-primary-500" />
                      <span>ชิดขวา</span>
                    </button>
                  </div>
                </div>

                {/* Vertical Alignment */}
                <div className="space-y-1 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-medium">แนวตั้ง (Vertical):</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={handleAlignTop}
                      className="py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition shadow-xs text-xs font-semibold"
                      title="จัดชิดขอบบนของบัตร"
                    >
                      <i className="fa-solid fa-arrow-up text-xs text-primary-500" />
                      <span>ชิดบน</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCenterV}
                      className="py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition shadow-xs text-xs font-semibold"
                      title="จัดกึ่งกลางแนวตั้งของบัตร"
                    >
                      <i className="fa-solid fa-arrows-up-down text-xs text-primary-500" />
                      <span>กึ่งกลาง</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAlignBottom}
                      className="py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition shadow-xs text-xs font-semibold"
                      title="จัดชิดขอบล่างของบัตร"
                    >
                      <i className="fa-solid fa-arrow-down text-xs text-primary-500" />
                      <span>ชิดล่าง</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Coordinates, Dimensions & Rotation */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden transition-all shadow-xs">
            <button
              type="button"
              onClick={() => toggleSection('transform')}
              className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-100/60 dark:hover:bg-slate-700/40 transition"
            >
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-arrows-up-down-left-right text-primary-500 text-xs w-4 text-center" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                  พิกัด ขนาด และการหมุน
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-400">
                  {element.width}×{element.height}px{element.rotation ? ` • ${element.rotation}°` : ''}
                </span>
                <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${openSections.transform ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {openSections.transform && (
              <div className="p-2.5 pt-1 space-y-2.5 border-t border-slate-200/60 dark:border-slate-700/60 animate-in fade-in duration-150">
                {/* Coordinates & Dimensions */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between shadow-xs">
                    <span className="text-slate-400 font-mono text-xs font-bold">X:</span>
                    <input
                      type="number"
                      value={element.x}
                      onChange={(e) => onUpdate(element.id, { x: parseInt(e.target.value) || 0 })}
                      className="w-16 bg-transparent text-right font-mono text-slate-900 dark:text-white focus:outline-none focus:text-primary-500 font-bold"
                    />
                    <span className="text-slate-400 text-[10px] ml-1">px</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between shadow-xs">
                    <span className="text-slate-400 font-mono text-xs font-bold">Y:</span>
                    <input
                      type="number"
                      value={element.y}
                      onChange={(e) => onUpdate(element.id, { y: parseInt(e.target.value) || 0 })}
                      className="w-16 bg-transparent text-right font-mono text-slate-900 dark:text-white focus:outline-none focus:text-primary-500 font-bold"
                    />
                    <span className="text-slate-400 text-[10px] ml-1">px</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between shadow-xs">
                    <span className="text-slate-400 font-mono text-xs font-bold">กว้าง:</span>
                    <input
                      type="number"
                      value={element.width}
                      onChange={(e) => onUpdate(element.id, { width: Math.max(5, parseInt(e.target.value) || 10) })}
                      className="w-16 bg-transparent text-right font-mono text-slate-900 dark:text-white focus:outline-none focus:text-primary-500 font-bold"
                    />
                    <span className="text-slate-400 text-[10px] ml-1">px</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between shadow-xs">
                    <span className="text-slate-400 font-mono text-xs font-bold">สูง:</span>
                    <input
                      type="number"
                      value={element.height}
                      onChange={(e) => onUpdate(element.id, { height: Math.max(2, parseInt(e.target.value) || 10) })}
                      className="w-16 bg-transparent text-right font-mono text-slate-900 dark:text-white focus:outline-none focus:text-primary-500 font-bold"
                    />
                    <span className="text-slate-400 text-[10px] ml-1">px</span>
                  </div>
                </div>

                {/* Rotation Controls */}
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <i className="fa-solid fa-arrows-rotate text-primary-500 text-xs" />
                      <span>การหมุน (Rotation Angle)</span>
                    </span>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 flex items-center shadow-xs">
                      <input
                        type="number"
                        value={element.rotation || 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          onUpdate(element.id, { rotation: ((val % 360) + 360) % 360 });
                        }}
                        className="w-12 bg-transparent text-right font-mono text-slate-900 dark:text-white focus:outline-none focus:text-primary-500 font-bold text-xs"
                      />
                      <span className="text-slate-400 font-mono text-xs ml-0.5">°</span>
                    </div>
                  </div>

                  {/* Slider for smooth rotation */}
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={element.rotation || 0}
                      onChange={(e) => onUpdate(element.id, { rotation: parseInt(e.target.value) || 0 })}
                      className="w-full accent-primary-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Quick Rotation Buttons */}
                  <div className="grid grid-cols-4 gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => onUpdate(element.id, { rotation: 0 })}
                      className={`py-1 rounded-lg border font-medium transition ${
                        !element.rotation || element.rotation === 0
                          ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="รีเซ็ตเป็นแนวระนาบ (0°)"
                    >
                      0° ระนาบ
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdate(element.id, { rotation: 90 })}
                      className={`py-1 rounded-lg border font-medium transition ${
                        element.rotation === 90
                          ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="หมุนแนวตั้ง 90°"
                    >
                      90°
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdate(element.id, { rotation: 180 })}
                      className={`py-1 rounded-lg border font-medium transition ${
                        element.rotation === 180
                          ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="หมุนกลับหัว 180°"
                    >
                      180°
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdate(element.id, { rotation: 270 })}
                      className={`py-1 rounded-lg border font-medium transition ${
                        element.rotation === 270
                          ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="หมุนแนวตั้งซ้าย 270° (-90°)"
                    >
                      270°
                    </button>
                  </div>

                  {/* Step Rotate Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        const current = element.rotation || 0;
                        const next = (((current - 90) % 360) + 360) % 360;
                        onUpdate(element.id, { rotation: next });
                      }}
                      className="py-1 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center justify-center gap-1 shadow-xs"
                    >
                      <i className="fa-solid fa-rotate-left text-[10px] text-primary-500" />
                      <span>ทวนเข็ม 90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const current = element.rotation || 0;
                        const next = (current + 90) % 360;
                        onUpdate(element.id, { rotation: next });
                      }}
                      className="py-1 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center justify-center gap-1 shadow-xs"
                    >
                      <i className="fa-solid fa-rotate-right text-[10px] text-primary-500" />
                      <span>ตามเข็ม 90°</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Data Binding (Text Elements) */}
          {element.type === 'text' && (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden transition-all shadow-xs">
              <button
                type="button"
                onClick={() => toggleSection('content')}
                className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-100/60 dark:hover:bg-slate-700/40 transition"
              >
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-database text-primary-500 text-xs w-4 text-center" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                    แหล่งข้อมูล (Data Binding)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">
                    {element.field === 'static' ? 'ข้อความคงที่' : element.field}
                  </span>
                  <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${openSections.content ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {openSections.content && (
                <div className="p-2.5 pt-1 space-y-2 border-t border-slate-200/60 dark:border-slate-700/60 animate-in fade-in duration-150">
                  <select
                    value={element.field}
                    onChange={(e) => onUpdate(element.id, { field: e.target.value as FieldMapping })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-primary-500 text-xs cursor-pointer shadow-xs"
                  >
                    <option value="static">ข้อความคงที่ (Static Custom Text)</option>
                    <option value="fullName">ชื่อ - นามสกุลเต็ม</option>
                    <option value="firstName">ชื่อจริง</option>
                    <option value="lastName">นามสกุล</option>
                    <option value="prefix">คำนำหน้าชื่อ / ยศ</option>
                    <option value="position">ตำแหน่งหน้าที่</option>
                    <option value="department">หน่วยงาน / สังกัด</option>
                    <option value="subDepartment">แผนก / ฝ่าย</option>
                    <option value="rank">ชั้นยศ / ประเภทกำลังพล</option>
                    <option value="badgeNo">หมายเลขบัตรประจำตัว</option>
                    <option value="citizenId">เลขประจำตัวประชาชน</option>
                    <option value="bloodType">หมู่โลหิต (Blood Type)</option>
                    <option value="issueDate">วันออกบัตร</option>
                    <option value="expireDate">วันหมดอายุบัตร</option>
                  </select>

                  {element.field === 'static' && (
                    <textarea
                      value={element.content || ''}
                      onChange={(e) => onUpdate(element.id, { content: e.target.value })}
                      rows={2}
                      placeholder="พิมพ์ข้อความที่ต้องการแสดง..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-primary-500 text-xs resize-none shadow-xs"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Image & Avatar Controls */}
          {/* Section 4: Image & Avatar / Emblem Controls */}
          {(element.type === 'image' || element.type === 'emblem') && (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden transition-all shadow-xs">
              <button
                type="button"
                onClick={() => toggleSection('image')}
                className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-100/60 dark:hover:bg-slate-700/40 transition"
              >
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-image text-primary-500 text-xs w-4 text-center" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                    {element.type === 'emblem' ? 'ตราสัญลักษณ์ / โลโก้ (Emblem & Logo)' : 'การตั้งค่ารูปภาพ (Image Binding)'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">
                    {element.type === 'emblem' ? 'ตราสัญลักษณ์' : element.field === 'avatar' ? 'รูปถ่ายกำลังพล' : 'ภาพคงที่/โลโก้'}
                  </span>
                  <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${openSections.image ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {openSections.image && (
                <div className="p-2.5 pt-1 space-y-2.5 border-t border-slate-200/60 dark:border-slate-700/60 animate-in fade-in duration-150">
                  {element.type === 'emblem' ? (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">เลือกตราสัญลักษณ์มาตรฐาน</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => onUpdate(element.id, { content: 'garuda' })}
                          className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                            element.content === 'garuda' || element.content === 'krut'
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-600'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <img src="/garuda.png" alt="ครุฑ" className="w-5 h-5 object-contain" />
                          <span>ตราครุฑราชการ</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdate(element.id, { content: 'military' })}
                          className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                            element.content === 'military'
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-600'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <img src="/images/military-logo.jpg" alt="ทหาร" className="w-5 h-5 object-contain rounded" />
                          <span>ตรากองทัพ</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Type Switcher */
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <button
                        type="button"
                        onClick={() => onUpdate(element.id, { field: 'avatar' })}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1.5 ${
                          element.field === 'avatar'
                            ? 'bg-primary-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <i className="fa-solid fa-user text-xs" />
                        <span>รูปถ่ายกำลังพล</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdate(element.id, { field: 'static' })}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1.5 ${
                          element.field !== 'avatar'
                            ? 'bg-primary-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <i className="fa-solid fa-image text-xs" />
                        <span>ภาพคงที่ / โลโก้</span>
                      </button>
                    </div>
                  )}

                  {element.type !== 'emblem' && element.field === 'avatar' ? (
                    <div className="p-2.5 bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 rounded-xl text-primary-800 dark:text-primary-300 text-[11px] leading-relaxed">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <i className="fa-solid fa-circle-info text-xs" />
                        <span>รูปถ่ายกำลังพลจากฐานข้อมูล</span>
                      </div>
                      ระบบจะดึงภาพถ่ายหน้าตรงของกำลังพลแต่ละนายมาแสดงผลในกรอบนี้โดยอัตโนมัติเมื่อพิมพ์หรือดูบัตร
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Current Image Preview */}
                      {isImageSrc(element.content) ? (
                        <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 aspect-video flex items-center justify-center">
                          <img src={element.content} alt="Preview" className="w-full h-full object-contain" />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2.5 py-1 bg-white text-slate-800 rounded-lg text-[11px] font-bold shadow-md hover:bg-slate-100 transition flex items-center gap-1"
                            >
                              <i className="fa-solid fa-upload text-[10px]" />
                              <span>เปลี่ยนรูป</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdate(element.id, { content: '' })}
                              className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-bold shadow-md hover:bg-rose-500 transition flex items-center gap-1"
                            >
                              <i className="fa-solid fa-trash text-[10px]" />
                              <span>ลบ</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-primary-600 transition bg-white dark:bg-slate-900"
                        >
                          <i className="fa-solid fa-cloud-arrow-up text-xl text-primary-500" />
                          <span className="font-semibold text-xs">คลิกเพื่อเลือกไฟล์รูปภาพ</span>
                          <span className="text-[10px] text-slate-400">PNG, JPG, WebP, SVG (ไม่เกิน 5MB)</span>
                        </button>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />

                      {/* URL Input */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">หรือระบุ URL รูปภาพ</label>
                        <input
                          type="text"
                          value={element.content || ''}
                          onChange={(e) => onUpdate(element.id, { content: e.target.value, field: 'static' })}
                          placeholder="https://... หรือ /uploads/..."
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl p-2 focus:outline-none focus:border-primary-500 text-xs shadow-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Object Fit Control */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 dark:border-slate-700/70">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">การปรับขนาดภาพ:</span>
                    <select
                      value={element.objectFit || 'cover'}
                      onChange={(e) => onUpdate(element.id, { objectFit: e.target.value as any })}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-primary-500 text-xs shadow-xs"
                    >
                      <option value="cover">ครอบคลุมกรอบ (Cover)</option>
                      <option value="contain">พอดีกรอบ (Contain)</option>
                      <option value="fill">ยืดเต็มกรอบ (Fill)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Typography Controls */}
          {/* Section 5: Typography Controls */}
          {element.type === 'text' && (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden transition-all shadow-xs">
              <button
                type="button"
                onClick={() => toggleSection('typography')}
                className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-100/60 dark:hover:bg-slate-700/40 transition"
              >
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-font text-primary-500 text-xs w-4 text-center" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                    ฟอนต์และตัวอักษร
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">
                    {element.fontSize || 12}px • {element.fontWeight === 'bold' ? 'หนา' : 'ปกติ'}
                  </span>
                  <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${openSections.typography ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {openSections.typography && (
                <div className="p-2.5 pt-1 space-y-2.5 border-t border-slate-200/60 dark:border-slate-700/60 animate-in fade-in duration-150">
                  {/* Font Family Selector */}
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">รูปแบบฟอนต์ (Font Family):</span>
                    <select
                      value={element.fontFamily || 'TH Sarabun New'}
                      onChange={(e) => onUpdate(element.id, { fontFamily: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl p-2 focus:outline-none focus:border-primary-500 text-xs cursor-pointer shadow-xs font-medium"
                    >
                      {AVAILABLE_FONTS.map((font) => (
                        <option key={font.id} value={font.id}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 flex items-center justify-between shadow-xs">
                      <span className="text-slate-400 font-medium">ขนาด:</span>
                      <input
                        type="number"
                        value={element.fontSize || 12}
                        onChange={(e) => onUpdate(element.id, { fontSize: parseInt(e.target.value) || 12 })}
                        className="w-12 bg-transparent text-right font-mono text-slate-900 dark:text-white focus:outline-none focus:text-primary-500 font-bold"
                      />
                      <span className="text-slate-400 text-[10px] ml-1">px</span>
                    </div>
                    <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 gap-1 shadow-xs">
                      <button
                        type="button"
                        onClick={() => onUpdate(element.id, { fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' })}
                        className={`p-1.5 px-2.5 rounded-lg ${element.fontWeight === 'bold' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                      >
                        <i className="fa-solid fa-bold" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdate(element.id, { fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' })}
                        className={`p-1.5 px-2.5 rounded-lg ${element.fontStyle === 'italic' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                      >
                        <i className="fa-solid fa-italic" />
                      </button>
                    </div>
                  </div>

                  {/* Text Color vs Dynamic Rank Color */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">สีตัวอักษร:</span>
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => onUpdate(element.id, { dynamicText: false })}
                          className={`px-2 py-0.5 rounded text-[10px] ${!element.dynamicText ? 'bg-primary-600 text-white font-bold' : 'text-slate-500'}`}
                        >
                          สีคงที่
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdate(element.id, { dynamicText: true })}
                          className={`px-2 py-0.5 rounded text-[10px] ${element.dynamicText ? 'bg-primary-600 text-white font-bold' : 'text-slate-500'}`}
                        >
                          ตามชั้นยศ
                        </button>
                      </div>
                    </div>
                    {!element.dynamicText && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-500">เลือกสี:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={element.color || '#000000'}
                            onChange={(e) => onUpdate(element.id, { color: e.target.value })}
                            className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent cursor-pointer p-0.5 shadow-xs"
                          />
                          <span className="font-mono text-slate-700 dark:text-slate-300 text-xs font-semibold">{element.color || '#000000'}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">การจัดแนวย่อหน้าข้อความ:</span>
                    <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 gap-1 justify-around shadow-xs">
                      {([
                        { id: 'left', icon: 'align-left', label: 'ชิดซ้าย' },
                        { id: 'center', icon: 'align-center', label: 'กึ่งกลาง' },
                        { id: 'right', icon: 'align-right', label: 'ชิดขวา' },
                        { id: 'justify', icon: 'align-justify', label: 'เต็มบรรทัด' },
                      ] as const).map((align) => (
                        <button
                          key={align.id}
                          type="button"
                          onClick={() => onUpdate(element.id, { textAlign: align.id })}
                          title={align.label}
                          className={`p-1.5 rounded-lg flex-1 text-center transition flex items-center justify-center gap-1 text-[11px] font-medium ${
                            (element.textAlign || 'left') === align.id
                              ? 'bg-primary-600 text-white shadow-xs'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <i className={`fa-solid fa-${align.icon}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Colors & Background with Dynamic Rank Option */}
          {/* Section 6: Colors & Background with Dynamic Rank Option */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden transition-all shadow-xs">
            <button
              type="button"
              onClick={() => toggleSection('background')}
              className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-100/60 dark:hover:bg-slate-700/40 transition"
            >
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-fill-drip text-primary-500 text-xs w-4 text-center" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                  สีพื้นหลัง (Background & Fill)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">
                  {element.dynamicBg ? 'ตามชั้นยศ' : (!element.backgroundColor || element.backgroundColor === 'transparent' ? 'โปร่งใส' : element.backgroundColor)}
                </span>
                <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${openSections.background ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {openSections.background && (
              <div className="p-2.5 pt-1 space-y-2.5 border-t border-slate-200/60 dark:border-slate-700/60 animate-in fade-in duration-150">
                {/* Background Mode Selector */}
                <div className="grid grid-cols-3 gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => onUpdate(element.id, { dynamicBg: false, backgroundColor: 'transparent' })}
                    className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition text-[11px] ${
                      !element.dynamicBg && (!element.backgroundColor || element.backgroundColor === 'transparent')
                        ? 'bg-primary-600 text-white font-bold shadow-xs' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <i className="fa-solid fa-ban text-[10px]" />
                    <span>โปร่งใส</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdate(element.id, { dynamicBg: false, backgroundColor: element.backgroundColor && element.backgroundColor !== 'transparent' ? element.backgroundColor : '#3b82f6' })}
                    className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition text-[11px] ${
                      !element.dynamicBg && element.backgroundColor && element.backgroundColor !== 'transparent'
                        ? 'bg-primary-600 text-white font-bold shadow-xs' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <i className="fa-solid fa-palette text-[10px]" />
                    <span>กำหนดเอง</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdate(element.id, { dynamicBg: true })}
                    className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition text-[11px] ${
                      element.dynamicBg 
                        ? 'bg-primary-600 text-white font-bold shadow-xs' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <i className="fa-solid fa-award text-[10px]" />
                    <span>ตามชั้นยศ</span>
                  </button>
                </div>

                {/* Dynamic Rank Color Details */}
                {element.dynamicBg ? (
                  <div className="p-2.5 rounded-xl bg-primary-50/80 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 text-[11px] text-primary-900 dark:text-primary-200 space-y-1.5 animate-fade-in">
                    <div className="flex items-center gap-1.5 font-bold">
                      <i className="fa-solid fa-circle-check text-emerald-600 dark:text-emerald-400" />
                      <span>
                        {rankColors?.colorMode === 'custom'
                          ? 'ใช้สีหลักองค์กร:'
                          : 'เปลี่ยนสีพื้นหลังอัตโนมัติตามชั้นยศ:'}
                      </span>
                    </div>
                    {rankColors?.colorMode === 'custom' ? (
                      <div className="flex items-center gap-2 pl-1 text-[10px]">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                          style={{ backgroundColor: rankColors.customColor || '#4f46e5' }}
                        />
                        <span>สีหลักกำหนดเอง ({rankColors.customColor || '#4f46e5'})</span>
                      </div>
                    ) : (
                      <div className="space-y-1 pl-1 text-[10px]">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                            style={{ backgroundColor: rankColors?.commissioned || '#dc2626' }}
                          />
                          <span>นายทหารสัญญาบัตร ({rankColors?.commissioned || '#dc2626'})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                            style={{ backgroundColor: rankColors?.nonCommissioned || '#d97706' }}
                          />
                          <span>นายทหารประทวน / ลูกจ้าง ({rankColors?.nonCommissioned || '#d97706'})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                            style={{ backgroundColor: rankColors?.conscript || '#16a34a' }}
                          />
                          <span>ทหารกองประจำการ ({rankColors?.conscript || '#16a34a'})</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : element.backgroundColor && element.backgroundColor !== 'transparent' ? (
                  /* Static Color Picker */
                  <div className="flex items-center justify-between pt-1 animate-fade-in">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">เลือกสีพื้นหลัง:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={element.backgroundColor || '#3b82f6'}
                        onChange={(e) => onUpdate(element.id, { backgroundColor: e.target.value })}
                        className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent cursor-pointer p-0.5 shadow-xs"
                      />
                      <span className="font-mono text-slate-700 dark:text-slate-300 text-xs font-semibold">{element.backgroundColor || '#3b82f6'}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Section 7: Border & Radius */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden transition-all shadow-xs">
            <button
              type="button"
              onClick={() => toggleSection('border')}
              className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-100/60 dark:hover:bg-slate-700/40 transition"
            >
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-border-all text-primary-500 text-xs w-4 text-center" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                  เส้นขอบและมุมมน
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">
                  {element.borderWidth || 0}px • r:{element.borderRadius || 0}px
                </span>
                <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${openSections.border ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {openSections.border && (
              <div className="p-2.5 pt-1 space-y-2.5 border-t border-slate-200/60 dark:border-slate-700/60 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between shadow-xs">
                    <span className="text-slate-400 font-medium">หนา:</span>
                    <input
                      type="number"
                      value={element.borderWidth || 0}
                      onChange={(e) => onUpdate(element.id, { borderWidth: parseInt(e.target.value) || 0 })}
                      className="w-12 bg-transparent text-right font-mono text-slate-900 dark:text-white focus:outline-none font-bold"
                    />
                    <span className="text-slate-400 text-[10px]">px</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between shadow-xs">
                    <span className="text-slate-400 font-medium">มุมมน:</span>
                    <input
                      type="number"
                      value={element.borderRadius || 0}
                      onChange={(e) => onUpdate(element.id, { borderRadius: parseInt(e.target.value) || 0 })}
                      className="w-12 bg-transparent text-right font-mono text-slate-900 dark:text-white focus:outline-none font-bold"
                    />
                    <span className="text-slate-400 text-[10px]">px</span>
                  </div>
                </div>
                {element.borderWidth && element.borderWidth > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">สีขอบ:</span>
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => onUpdate(element.id, { dynamicBorder: false })}
                          className={`px-2 py-0.5 rounded text-[10px] ${!element.dynamicBorder ? 'bg-primary-600 text-white font-bold' : 'text-slate-500'}`}
                        >
                          สีคงที่
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdate(element.id, { dynamicBorder: true })}
                          className={`px-2 py-0.5 rounded text-[10px] ${element.dynamicBorder ? 'bg-primary-600 text-white font-bold' : 'text-slate-500'}`}
                        >
                          ตามชั้นยศ
                        </button>
                      </div>
                    </div>

                    {!element.dynamicBorder && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-500">เลือกสีขอบ:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={element.borderColor || '#000000'}
                            onChange={(e) => onUpdate(element.id, { borderColor: e.target.value })}
                            className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent cursor-pointer p-0.5 shadow-xs"
                          />
                          <span className="font-mono text-slate-700 dark:text-slate-300 text-xs font-semibold">{element.borderColor || '#000000'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Section 8: Opacity */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden transition-all shadow-xs">
            <button
              type="button"
              onClick={() => toggleSection('opacity')}
              className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-100/60 dark:hover:bg-slate-700/40 transition"
            >
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-circle-half-stroke text-primary-500 text-xs w-4 text-center" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                  ความโปร่งแสง (Opacity)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-primary-600 dark:text-primary-400 font-bold text-[10px]">
                  {element.opacity !== undefined ? element.opacity : 100}%
                </span>
                <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${openSections.opacity ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {openSections.opacity && (
              <div className="p-2.5 pt-1 space-y-1.5 border-t border-slate-200/60 dark:border-slate-700/60 animate-in fade-in duration-150">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={element.opacity !== undefined ? element.opacity : 100}
                  onChange={(e) => onUpdate(element.id, { opacity: parseInt(e.target.value) })}
                  className="w-full accent-primary-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky Bottom Actions Bar (Pinned outside scrollable body) */}
      {!isMinimized && (
        <div className="p-3 bg-slate-50/95 dark:bg-slate-800/95 border-t border-slate-200 dark:border-slate-700/80 shrink-0 flex items-center gap-2">
          {/* Lock Element Button */}
          <button
            type="button"
            onClick={() => onUpdate(element.id, { locked: !element.locked })}
            className={`py-2 px-3 rounded-xl font-medium flex items-center justify-center gap-1.5 transition text-xs border shadow-xs ${
              element.locked
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-600/40 hover:bg-amber-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={element.locked ? 'ปลดล็อคองค์ประกอบนี้' : 'ล็อคตำแหน่งองค์ประกอบนี้'}
          >
            <i className={`fa-solid ${element.locked ? 'fa-lock text-amber-500' : 'fa-lock-open text-slate-400'} text-xs`} />
            <span>{element.locked ? 'ล็อคอยู่' : 'ล็อค'}</span>
          </button>

          {/* Delete Element Button */}
          <button
            type="button"
            onClick={() => onDelete(element.id)}
            className="flex-1 py-2 px-3 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-600 dark:hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition border border-rose-200 dark:border-rose-500/30 shadow-xs text-xs"
            title="ลบองค์ประกอบนี้ออกจากบัตร"
          >
            <i className="fa-solid fa-trash-can text-xs" />
            <span>ลบองค์ประกอบนี้</span>
          </button>
        </div>
      )}
    </div>
  );
}
