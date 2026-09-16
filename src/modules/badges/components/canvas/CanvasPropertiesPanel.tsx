'use client';

import React, { useState } from 'react';
import { CanvasElement, FieldMapping } from './types';

interface CanvasPropertiesPanelProps {
  element: CanvasElement | null;
  canvasWidth: number;
  canvasHeight: number;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function CanvasPropertiesPanel({
  element,
  canvasWidth,
  canvasHeight,
  onUpdate,
  onDelete,
  onClose
}: CanvasPropertiesPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!element) return null;

  const handleCenterH = () => {
    const newX = Math.round((canvasWidth - element.width) / 2);
    onUpdate(element.id, { x: Math.max(0, newX) });
  };

  const handleCenterV = () => {
    const newY = Math.round((canvasHeight - element.height) / 2);
    onUpdate(element.id, { y: Math.max(0, newY) });
  };

  const getElementTitle = () => {
    if (element.type === 'image' || element.field === 'avatar') return 'กรอบรูปถ่าย (Avatar)';
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

      {/* Floating Body */}
      {!isMinimized && (
        <div className="p-4 overflow-y-auto flex flex-col gap-3.5 max-h-[calc(100vh-200px)]">
          {/* Quick Alignment Actions */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">จัดตำแหน่งกึ่งกลาง (Auto-Align)</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCenterH}
                className="py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition shadow-xs font-semibold"
              >
                <i className="fa-solid fa-arrows-left-right text-xs text-primary-500" />
                <span>กึ่งกลางแนวนอน</span>
              </button>
              <button
                type="button"
                onClick={handleCenterV}
                className="py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition shadow-xs font-semibold"
              >
                <i className="fa-solid fa-arrows-up-down text-xs text-primary-500" />
                <span>กึ่งกลางแนวตั้ง</span>
              </button>
            </div>
          </div>

          {/* Coordinates & Dimensions */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">พิกัดและขนาด (Exact Pixels)</span>
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
          </div>

          {/* Field Mapping (Data Binding) */}
          {element.type === 'text' && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">แหล่งข้อมูล (Data Binding)</span>
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

          {/* Typography Controls */}
          {element.type === 'text' && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">ฟอนต์และตัวอักษร</span>
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

              <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 gap-1 justify-around shadow-xs">
                {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => onUpdate(element.id, { textAlign: align })}
                    className={`p-1.5 rounded-lg flex-1 text-center transition ${
                      element.textAlign === align ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <i className={`fa-solid fa-align-${align === 'justify' ? 'justify' : align}`} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors & Background with Dynamic Rank Option */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">สีพื้นหลัง (Background & Fill)</span>
            
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
                <span>กำหนดสีเอง</span>
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
                  <span>เปลี่ยนสีพื้นหลังอัตโนมัติตามชั้นยศ:</span>
                </div>
                <div className="space-y-1 pl-1 text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0"></span>
                    <span>นายทหารสัญญาบัตร (แดง / #dc2626)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                    <span>นายทหารประทวน / ลูกจ้าง (ส้ม / #d97706)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
                    <span>ทหารกองประจำการ (เขียว / #16a34a)</span>
                  </div>
                </div>
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

          {/* Border & Radius */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">เส้นขอบและมุมมน</span>
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

          {/* Opacity */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ความโปร่งแสง (Opacity)</span>
              <span className="font-mono text-primary-600 dark:text-primary-400 font-bold">{element.opacity !== undefined ? element.opacity : 100}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={element.opacity !== undefined ? element.opacity : 100}
              onChange={(e) => onUpdate(element.id, { opacity: parseInt(e.target.value) })}
              className="w-full accent-primary-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
            />
          </div>

          {/* Delete Action */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-auto">
            <button
              type="button"
              onClick={() => onDelete(element.id)}
              className="w-full py-2 px-3 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-600 dark:hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition border border-rose-200 dark:border-rose-500/30 shadow-xs"
            >
              <i className="fa-solid fa-trash text-xs" />
              <span>ลบองค์ประกอบนี้</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
