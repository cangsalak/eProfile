'use client';

import React, { useRef } from 'react';
import toast from 'react-hot-toast';
import { CanvaTab, CanvasElement, CanvasElementType, FieldMapping } from './types';
import { 
  TEMPLATE_MILITARY_OFFICIAL, 
  TEMPLATE_MODERN_TECH, 
  TEMPLATE_LANDSCAPE_EXECUTIVE, 
  TEMPLATE_BACK_STANDARD 
} from './presets';

interface CanvasSidebarProps {
  activeTab: CanvaTab;
  setActiveTab: (tab: CanvaTab) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAddElement: (type: CanvasElementType, customProps?: Partial<CanvasElement>) => void;
  onApplyTemplate: (template: CanvasElement[], name: string) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onReorderElement: (id: string, direction: 'up' | 'down') => void;
}

export default function CanvasSidebar({
  activeTab,
  setActiveTab,
  isDrawerOpen,
  setIsDrawerOpen,
  elements,
  selectedId,
  onSelect,
  onAddElement,
  onApplyTemplate,
  onUpdateElement,
  onDeleteElement,
  onReorderElement
}: CanvasSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTabClick = (tab: CanvaTab) => {
    if (activeTab === tab && isDrawerOpen) {
      setIsDrawerOpen(false);
    } else {
      setActiveTab(tab);
      setIsDrawerOpen(true);
    }
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, SVG)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('ขนาดไฟล์ต้องไม่เกิน 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      onAddElement('image', {
        field: 'static',
        content: dataUrl,
        width: 140,
        height: 140,
        borderRadius: 0,
        borderWidth: 0
      });
      toast.success('เพิ่มรูปภาพลงในบัตรเรียบร้อย');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="flex h-full min-h-[660px] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-20">
      {/* Primary Icon Strip */}
      <div className="w-16 flex flex-col items-center py-3 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/80 gap-1.5 select-none">
        <button
          type="button"
          onClick={() => handleTabClick('templates')}
          className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all ${
            activeTab === 'templates' && isDrawerOpen 
              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30 font-bold' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-900'
          }`}
        >
          <i className="fa-solid fa-table-cells-large text-base mb-1" />
          <span className="text-[9px]">แม่แบบ</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('text')}
          className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all ${
            activeTab === 'text' && isDrawerOpen 
              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30 font-bold' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-900'
          }`}
        >
          <i className="fa-solid fa-font text-base mb-1" />
          <span className="text-[9px]">ข้อความ</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('elements')}
          className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all ${
            activeTab === 'elements' && isDrawerOpen 
              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30 font-bold' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-900'
          }`}
        >
          <i className="fa-solid fa-shapes text-base mb-1" />
          <span className="text-[9px]">รูปทรง</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('codes')}
          className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all ${
            activeTab === 'codes' && isDrawerOpen 
              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30 font-bold' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-900'
          }`}
        >
          <i className="fa-solid fa-qrcode text-base mb-1" />
          <span className="text-[9px]">คิวอาร์</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('media')}
          className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all ${
            activeTab === 'media' && isDrawerOpen 
              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30 font-bold' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-900'
          }`}
        >
          <i className="fa-solid fa-cloud-arrow-up text-base mb-1" />
          <span className="text-[9px]">อัปโหลด</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('background')}
          className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all ${
            activeTab === 'background' && isDrawerOpen 
              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30 font-bold' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-900'
          }`}
        >
          <i className="fa-solid fa-palette text-base mb-1" />
          <span className="text-[9px]">พื้นหลัง</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('layers')}
          className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all mt-auto ${
            activeTab === 'layers' && isDrawerOpen 
              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30 font-bold' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-900'
          }`}
        >
          <i className="fa-solid fa-layer-group text-base mb-1" />
          <span className="text-[9px]">เลเยอร์</span>
        </button>
      </div>

      {/* Expandable Secondary Panel Drawer */}
      {isDrawerOpen && (
        <div className="w-64 sm:w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 overflow-y-auto border-r border-slate-200 dark:border-slate-800 animate-fade-in flex flex-col shadow-inner">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              {activeTab === 'templates' && <><i className="fa-solid fa-table-cells-large text-primary-500" /> เทมเพลตมาตรฐาน</>}
              {activeTab === 'text' && <><i className="fa-solid fa-font text-primary-500" /> เพิ่มข้อความและฟิลด์</>}
              {activeTab === 'elements' && <><i className="fa-solid fa-shapes text-primary-500" /> รูปทรงและองค์ประกอบ</>}
              {activeTab === 'codes' && <><i className="fa-solid fa-qrcode text-primary-500" /> บาร์โค้ด & คิวอาร์โค้ด</>}
              {activeTab === 'media' && <><i className="fa-solid fa-cloud-arrow-up text-primary-500" /> จัดการรูปภาพ & มีเดีย</>}
              {activeTab === 'background' && <><i className="fa-solid fa-palette text-primary-500" /> พื้นหลัง & สีตามชั้นยศ</>}
              {activeTab === 'layers' && <><i className="fa-solid fa-layer-group text-primary-500" /> ลำดับเลเยอร์ ({elements.length})</>}
            </h4>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <i className="fa-solid fa-chevron-left text-xs" />
            </button>
          </div>

          {/* TAB 1: TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => onApplyTemplate(TEMPLATE_MILITARY_OFFICIAL, 'บัตรราชการ ทบ.')}
                className="w-full text-left p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition flex items-center gap-3 group shadow-sm"
              >
                <div className="w-10 h-13 rounded-lg bg-blue-900 flex items-center justify-center text-white text-xs border border-blue-600 shadow-inner">
                  <i className="fa-solid fa-shield text-blue-300" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">บัตรราชการ / ทบ. 100</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">ตราครุฑ หัวน้ำเงินเข้ม มาตรฐาน</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onApplyTemplate(TEMPLATE_MODERN_TECH, 'ดิจิทัลโมเดิร์น')}
                className="w-full text-left p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition flex items-center gap-3 group shadow-sm"
              >
                <div className="w-10 h-13 rounded-lg bg-indigo-900 flex items-center justify-center text-white text-xs border border-indigo-600 shadow-inner">
                  <i className="fa-solid fa-id-card-clip text-indigo-300" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">ดิจิทัลโมเดิร์น (Modern Tech)</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">รูปวงกลม, Hologram, โค้ด QR</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onApplyTemplate(TEMPLATE_LANDSCAPE_EXECUTIVE, 'แนวนอนผู้บริหาร')}
                className="w-full text-left p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition flex items-center gap-3 group shadow-sm"
              >
                <div className="w-13 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-white text-xs border border-slate-600 shadow-inner">
                  <i className="fa-solid fa-award text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">แนวนอนผู้บริหาร (Landscape)</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">การ์ดแนวนอน บาร์โค้ด และแถบสีข้าง</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onApplyTemplate(TEMPLATE_BACK_STANDARD, 'ด้านหลังมาตรฐาน')}
                className="w-full text-left p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition flex items-center gap-3 group shadow-sm"
              >
                <div className="w-10 h-13 rounded-lg bg-slate-700 flex items-center justify-center text-white text-xs border border-slate-600 shadow-inner">
                  <i className="fa-solid fa-list-check text-slate-300" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">ด้านหลังมาตรฐาน</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">ข้อบังคับ, ระเบียบการใช้บัตร, QR ตรวจสอบ</div>
                </div>
              </button>
            </div>
          )}

          {/* TAB 2: TEXT */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">ข้อความคงที่ (Static)</span>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => onAddElement('text', { content: 'หัวข้อหลัก', fontSize: 18, fontWeight: 'bold', height: 40 })}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-left text-sm font-bold text-slate-800 dark:text-white transition flex items-center justify-between border border-slate-200 dark:border-slate-700"
                  >
                    <span>เพิ่มหัวข้อขนาดใหญ่</span>
                    <i className="fa-solid fa-plus text-xs text-primary-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddElement('text', { content: 'หัวข้อย่อย', fontSize: 13, fontWeight: 'bold', height: 30 })}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex items-center justify-between border border-slate-200 dark:border-slate-700"
                  >
                    <span>เพิ่มหัวข้อย่อย</span>
                    <i className="fa-solid fa-plus text-xs text-primary-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddElement('text', { content: 'ข้อความรายละเอียดทั่วไป', fontSize: 10, height: 26 })}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-left text-xs text-slate-600 dark:text-slate-400 transition flex items-center justify-between border border-slate-200 dark:border-slate-700"
                  >
                    <span>เพิ่มข้อความเนื้อหา</span>
                    <i className="fa-solid fa-plus text-xs text-primary-500" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">ฟิลด์ข้อมูลบุคคล (Dynamic Fields)</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'ชื่อ-สกุล', field: 'fullName', icon: 'fa-user' },
                    { label: 'ตำแหน่ง', field: 'position', icon: 'fa-briefcase' },
                    { label: 'สังกัด', field: 'department', icon: 'fa-building' },
                    { label: 'ประเภท/ยศ', field: 'rank', icon: 'fa-award' },
                    { label: 'รหัสบัตร', field: 'badgeNo', icon: 'fa-hashtag' },
                    { label: 'เลข ปชช.', field: 'citizenId', icon: 'fa-id-card' },
                    { label: 'กรุ๊ปเลือด', field: 'bloodType', icon: 'fa-droplet' },
                    { label: 'วันหมดอายุ', field: 'expireDate', icon: 'fa-calendar' },
                  ].map((f) => (
                    <button
                      key={f.field}
                      type="button"
                      onClick={() => onAddElement('text', { field: f.field as FieldMapping, fontSize: 11, fontWeight: 'bold' })}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-700 text-left text-xs text-slate-700 dark:text-slate-300 transition flex items-center gap-2 border border-slate-200 dark:border-slate-800 shadow-sm"
                    >
                      <i className={`fa-solid ${f.icon} text-primary-500 text-xs`} />
                      <span className="truncate font-medium">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ELEMENTS & SHAPES */}
          {activeTab === 'elements' && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">รูปทรงเรขาคณิต (Shapes)</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onAddElement('rect', { width: 160, height: 90, backgroundColor: '#3b82f6', borderRadius: 8 })}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex flex-col items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition shadow-sm"
                  >
                    <div className="w-10 h-6 bg-primary-500 rounded" />
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">สี่เหลี่ยม</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddElement('circle', { width: 90, height: 90, backgroundColor: '#10b981', borderRadius: 999 })}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex flex-col items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition shadow-sm"
                  >
                    <div className="w-7 h-7 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">วงกลม</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddElement('line', { width: 280, height: 3, backgroundColor: '#cbd5e1' })}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex flex-col items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition shadow-sm"
                  >
                    <div className="w-10 h-0.5 bg-slate-400" />
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">เส้นคั่น</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddElement('ribbon', { width: 200, height: 30, backgroundColor: '#1e3a8a', borderRadius: 15, color: '#ffffff', fontSize: 10, field: 'rank' })}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex flex-col items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition shadow-sm"
                  >
                    <div className="w-12 h-4 bg-blue-900 rounded-full border border-blue-400" />
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">แถบป้ายยศ</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">ตราสัญลักษณ์ & ลายน้ำ</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onAddElement('emblem', { content: 'garuda', width: 70, height: 70 })}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex flex-col items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 transition shadow-sm"
                  >
                    <i className="fa-solid fa-shield-halved text-amber-500 text-xl" />
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">ตราสัญลักษณ์</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddElement('hologram', { width: 380, height: 24 })}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex flex-col items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 transition shadow-sm"
                  >
                    <div className="w-10 h-3 bg-gradient-to-r from-rose-400 via-amber-300 to-indigo-400 rounded" />
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">โฮโลแกรมกันปลอม</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QR & BARCODES */}
          {activeTab === 'codes' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => onAddElement('qr', { width: 90, height: 90, field: 'badgeNo' })}
                className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center gap-3 transition group shadow-sm"
              >
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-slate-900 border border-slate-200 shadow-sm">
                  <i className="fa-solid fa-qrcode text-2xl text-primary-600" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">QR Code ดิจิทัล</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">สร้าง QR เชื่อมโยงรหัสประจำตัว</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onAddElement('barcode', { width: 300, height: 60, field: 'badgeNo' })}
                className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center gap-3 transition group shadow-sm"
              >
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-slate-900 border border-slate-200 shadow-sm">
                  <i className="fa-solid fa-barcode text-2xl text-emerald-600" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">Barcode แท่งสแกน</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">สำหรับเครื่องสแกนบาร์โค้ดเข้า-ออก</div>
                </div>
              </button>
            </div>
          )}

          {/* TAB 5: MEDIA & CUSTOM UPLOAD */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <i className="fa-solid fa-cloud-arrow-up" />
                <span>อัปโหลดรูปภาพ / โลโก้</span>
              </button>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">องค์ประกอบภาพถ่าย</span>
                <button
                  type="button"
                  onClick={() => onAddElement('image', { field: 'avatar', width: 160, height: 180, borderRadius: 10, borderWidth: 2, borderColor: '#ffffff' })}
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-left text-xs text-slate-700 dark:text-slate-300 transition flex items-center gap-2 border border-slate-200 dark:border-slate-700"
                >
                  <i className="fa-solid fa-user-tie text-primary-500" />
                  <span className="font-medium">กรอบรูปถ่ายกำลังพล (Avatar)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: BACKGROUND & RANK COLORS */}
          {activeTab === 'background' && (
            <div className="space-y-4">
              {/* Dynamic Rank Background Presets */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  พื้นหลังแยกสีตามชั้นยศ (Dynamic Rank)
                </span>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => onAddElement('rect', { 
                      x: 0, 
                      y: 0, 
                      width: 380, 
                      height: 160, 
                      dynamicBg: true, 
                      zIndex: 1 
                    })}
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-red-600/10 via-amber-500/10 to-emerald-600/10 hover:from-red-600/20 hover:via-amber-500/20 hover:to-emerald-600/20 border-2 border-primary-500/40 text-left transition flex items-center gap-3 group shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-amber-500 to-emerald-600 flex items-center justify-center text-white text-base shadow-sm shrink-0">
                      <i className="fa-solid fa-award" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        แถบหัวบัตรสีตามชั้นยศ
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        เปลี่ยนสีหัวบัตรอัตโนมัติตามยศผู้ถือ
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddElement('rect', { 
                      x: 0, 
                      y: 0, 
                      width: 380, 
                      height: 600, 
                      dynamicBg: true, 
                      zIndex: 0 
                    })}
                    className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left transition flex items-center gap-3 group shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-amber-400 text-base shadow-sm shrink-0">
                      <i className="fa-solid fa-id-badge" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        พื้นหลังเต็มใบสีตามชั้นยศ
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        การ์ดสีเต็มแผ่น สัญญาบัตร / ประทวน / พลทหาร
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddElement('ribbon', { 
                      x: 65, 
                      y: 440, 
                      width: 250, 
                      height: 34, 
                      dynamicBg: true, 
                      borderRadius: 17, 
                      field: 'rank',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      fontSize: 11,
                      zIndex: 3
                    })}
                    className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left transition flex items-center gap-3 group shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white text-base shadow-sm shrink-0">
                      <i className="fa-solid fa-ribbon" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        ป้ายยศสีตามชั้นยศ (Rank Pill)
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        แถบแคปซูลแสดงชั้นยศแบบไดนามิก
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Rank Color Rules Info Box */}
              <div className="p-3 rounded-2xl bg-primary-50/70 dark:bg-primary-950/40 border border-primary-200/80 dark:border-primary-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-2">
                <div className="font-bold text-primary-900 dark:text-primary-300 flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-info text-primary-600 dark:text-primary-400" />
                  <span>เกณฑ์การแยกสีตามชั้นยศ</span>
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0"></span>
                      <span>นายทหารสัญญาบัตร</span>
                    </span>
                    <span className="font-mono text-slate-400 font-bold">#dc2626</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                      <span>นายทหารประทวน / ลูกจ้าง</span>
                    </span>
                    <span className="font-mono text-slate-400 font-bold">#d97706</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
                      <span>ทหารกองประจำการ</span>
                    </span>
                    <span className="font-mono text-slate-400 font-bold">#16a34a</span>
                  </div>
                </div>
              </div>

              {/* Standard Solid Backgrounds */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  สีพื้นหลังคงที่ (Solid Presets)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'สีกรมท่าเข้ม', color: '#1e3a8a', label: 'กรมท่า' },
                    { name: 'สีเขียวทหาร', color: '#3f6212', label: 'เขียวทหาร' },
                    { name: 'สีน้ำเงินโมเดิร์น', color: '#4f46e5', label: 'น้ำเงิน' },
                    { name: 'สีเทาดำ', color: '#0f172a', label: 'เทาดำ' },
                    { name: 'สีขาวการ์ด', color: '#ffffff', label: 'ขาว' },
                    { name: 'สีแดงเลือดหมู', color: '#991b1b', label: 'เลือดหมู' }
                  ].map((p) => (
                    <button
                      key={p.color}
                      type="button"
                      onClick={() => onAddElement('rect', { 
                        x: 0, 
                        y: 0, 
                        width: 380, 
                        height: 150, 
                        backgroundColor: p.color, 
                        dynamicBg: false,
                        zIndex: 1 
                      })}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition shadow-xs text-left"
                    >
                      <span className="w-5 h-5 rounded-lg shrink-0 border border-slate-300 dark:border-slate-600" style={{ backgroundColor: p.color }} />
                      <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: LAYERS */}
          {activeTab === 'layers' && (
            <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1">
              {elements.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">ไม่มี Element ในหน้านี้</div>
              ) : (
                [...elements].reverse().map((el) => {
                  const isSel = selectedId === el.id;
                  return (
                    <div
                      key={el.id}
                      onClick={() => onSelect(el.id)}
                      className={`p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition ${
                        isSel 
                          ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-400 dark:border-primary-500 text-primary-900 dark:text-white shadow-sm font-semibold' 
                          : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <i className={`fa-solid ${
                          el.type === 'text' ? 'fa-font' :
                          el.type === 'image' ? 'fa-image' :
                          el.type === 'rect' ? 'fa-square' :
                          el.type === 'circle' ? 'fa-circle' :
                          el.type === 'line' ? 'fa-minus' :
                          el.type === 'qr' ? 'fa-qrcode' :
                          el.type === 'barcode' ? 'fa-barcode' : 'fa-shapes'
                        } text-[11px] ${isSel ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                        <span className="truncate">{el.id}</span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-400" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onReorderElement(el.id, 'up')}
                          title="ย้ายขึ้น"
                          className="p-1 hover:text-slate-700 dark:hover:text-white"
                        >
                          <i className="fa-solid fa-arrow-up text-[10px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onReorderElement(el.id, 'down')}
                          title="ย้ายลง"
                          className="p-1 hover:text-slate-700 dark:hover:text-white"
                        >
                          <i className="fa-solid fa-arrow-down text-[10px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateElement(el.id, { locked: !el.locked })}
                          title={el.locked ? 'ปลดล็อก' : 'ล็อก'}
                          className={`p-1 ${el.locked ? 'text-amber-500' : 'hover:text-slate-700 dark:hover:text-white'}`}
                        >
                          <i className={`fa-solid ${el.locked ? 'fa-lock' : 'fa-lock-open'} text-[10px]`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateElement(el.id, { hidden: !el.hidden })}
                          title={el.hidden ? 'แสดง' : 'ซ่อน'}
                          className={`p-1 ${el.hidden ? 'text-rose-500' : 'hover:text-slate-700 dark:hover:text-white'}`}
                        >
                          <i className={`fa-solid ${el.hidden ? 'fa-eye-slash' : 'fa-eye'} text-[10px]`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteElement(el.id)}
                          title="ลบ"
                          className="p-1 text-rose-500 hover:text-rose-600"
                        >
                          <i className="fa-solid fa-trash text-[10px]" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
