'use client';

import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export type CanvasElementType = 'text' | 'image' | 'rect' | 'qr';
export type FieldMapping = 'static' | 'fullName' | 'position' | 'department' | 'bloodType' | 'badgeNo' | 'avatar' | 'rank' | 'prefix';

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  field: FieldMapping;
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  content?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  borderRadius?: number;
  zIndex: number;
  dynamicBg?: boolean;
  dynamicText?: boolean;
  dynamicBorder?: boolean;
}

const DEFAULT_ELEMENTS: CanvasElement[] = [
  { id: 'bg-header', type: 'rect', field: 'static', x: 0, y: 0, width: 100, height: 20, backgroundColor: '#4f46e5', zIndex: 1 },
  { id: 'title', type: 'text', field: 'static', content: 'บัตรประจำตัวเจ้าหน้าที่', x: 0, y: 3, width: 100, height: 10, fontSize: 14, color: '#ffffff', fontWeight: 'bold', textAlign: 'center', zIndex: 2 },
  { id: 'org', type: 'text', field: 'department', x: 0, y: 10, width: 100, height: 10, fontSize: 10, color: '#ffffff', textAlign: 'center', zIndex: 2 },
  { id: 'avatar', type: 'image', field: 'avatar', x: 30, y: 25, width: 40, height: 25, backgroundColor: '#e2e8f0', zIndex: 3 },
  { id: 'name', type: 'text', field: 'fullName', x: 0, y: 55, width: 100, height: 10, fontSize: 16, color: '#0f172a', fontWeight: 'bold', textAlign: 'center', zIndex: 2 },
  { id: 'rank', type: 'text', field: 'rank', x: 20, y: 65, width: 60, height: 6, fontSize: 10, color: '#ffffff', backgroundColor: '#475569', fontWeight: 'bold', textAlign: 'center', borderRadius: 10, zIndex: 2 },
  { id: 'badge-no', type: 'text', field: 'badgeNo', x: 10, y: 75, width: 80, height: 8, fontSize: 12, color: '#0f172a', fontWeight: 'bold', textAlign: 'center', zIndex: 2 },
  { id: 'bg-footer', type: 'rect', field: 'static', x: 0, y: 92, width: 100, height: 8, backgroundColor: '#f1f5f9', zIndex: 1 },
  { id: 'footer-text', type: 'text', field: 'static', content: 'หากพบเห็นบัตรนี้ กรุณาส่งคืนหน่วยงานต้นสังกัด', x: 0, y: 94, width: 100, height: 6, fontSize: 8, color: '#64748b', textAlign: 'center', zIndex: 2 },
];

const MODERN_TEMPLATE: CanvasElement[] = [
  { id: 'm-bg', type: 'rect', field: 'static', x: 0, y: 0, width: 100, height: 100, backgroundColor: '#f8fafc', zIndex: 0 },
  { id: 'm-header', type: 'rect', field: 'static', x: 0, y: 0, width: 100, height: 35, backgroundColor: '#4f46e5', dynamicBg: true, zIndex: 1 },
  { id: 'm-sysname', type: 'text', field: 'static', content: 'SYSTEM', x: 0, y: 4, width: 100, height: 5, fontSize: 10, color: '#ffffff', fontWeight: 'bold', textAlign: 'center', zIndex: 2 },
  { id: 'm-avatar', type: 'image', field: 'avatar', x: 25, y: 15, width: 50, height: 32, backgroundColor: '#e2e8f0', borderRadius: 100, dynamicBorder: true, zIndex: 3 },
  { id: 'm-name', type: 'text', field: 'fullName', x: 0, y: 50, width: 100, height: 8, fontSize: 14, color: '#0f172a', fontWeight: 'bold', textAlign: 'center', zIndex: 2 },
  { id: 'm-pos', type: 'text', field: 'position', x: 0, y: 56, width: 100, height: 5, fontSize: 10, color: '#64748b', textAlign: 'center', zIndex: 2 },
  { id: 'm-rank', type: 'text', field: 'rank', x: 25, y: 63, width: 50, height: 6, fontSize: 9, color: '#ffffff', backgroundColor: '#4f46e5', dynamicBg: true, fontWeight: 'bold', textAlign: 'center', borderRadius: 20, zIndex: 2 },
  { id: 'm-box', type: 'rect', field: 'static', x: 10, y: 73, width: 80, height: 15, backgroundColor: '#ffffff', borderRadius: 8, zIndex: 1 },
  { id: 'm-idlbl', type: 'text', field: 'static', content: 'ID NUMBER', x: 15, y: 75, width: 30, height: 5, fontSize: 8, color: '#94a3b8', fontWeight: 'bold', textAlign: 'left', zIndex: 2 },
  { id: 'm-idval', type: 'text', field: 'badgeNo', x: 45, y: 75, width: 40, height: 5, fontSize: 10, color: '#1e293b', fontWeight: 'bold', textAlign: 'right', zIndex: 2 },
  { id: 'm-bldlbl', type: 'text', field: 'static', content: 'BLOOD TYPE', x: 15, y: 81, width: 30, height: 5, fontSize: 8, color: '#94a3b8', fontWeight: 'bold', textAlign: 'left', zIndex: 2 },
  { id: 'm-bldval', type: 'text', field: 'bloodType', x: 45, y: 81, width: 40, height: 5, fontSize: 10, color: '#e11d48', fontWeight: 'bold', textAlign: 'right', zIndex: 2 },
  { id: 'm-bar', type: 'rect', field: 'static', x: 25, y: 92, width: 50, height: 4, backgroundColor: '#94a3b8', borderRadius: 0, zIndex: 1 },
];

interface BadgeCanvasEditorProps {
  initialElements?: CanvasElement[];
  onChange: (elements: CanvasElement[]) => void;
}

export default function BadgeCanvasEditor({ initialElements, onChange }: BadgeCanvasEditorProps) {
  const [elements, setElements] = useState<CanvasElement[]>(
    initialElements && initialElements.length > 0 ? initialElements : DEFAULT_ELEMENTS
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, elemX: 0, elemY: 0 });

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Update parent when elements change
  useEffect(() => {
    // debounce slightly to prevent too many updates
    const timer = setTimeout(() => onChangeRef.current(elements), 300);
    return () => clearTimeout(timer);
  }, [elements]);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    const elem = elements.find(el => el.id === id);
    if (!elem) return;

    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      elemX: elem.x,
      elemY: elem.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !selectedId || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    const dxPercent = (dx / canvasRect.width) * 100;
    const dyPercent = (dy / canvasRect.height) * 100;

    setElements(prev => prev.map(el => {
      if (el.id === selectedId) {
        return {
          ...el,
          x: Math.max(0, Math.min(100 - el.width, dragStart.current.elemX + dxPercent)),
          y: Math.max(0, Math.min(100 - el.height, dragStart.current.elemY + dyPercent)),
        };
      }
      return el;
    }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const updateSelected = (updates: Partial<CanvasElement>) => {
    setElements(prev => prev.map(el => el.id === selectedId ? { ...el, ...updates } : el));
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  const renderElementPreview = (el: CanvasElement) => {
    let content: React.ReactNode = el.content;
    if (el.field === 'fullName') content = 'ยศ ชื่อ นามสกุล';
    if (el.field === 'rank') content = 'ชั้นยศ';
    if (el.field === 'department') content = 'ชื่อหน่วยงาน';
    if (el.field === 'badgeNo') content = 'ID-123456';
    if (el.field === 'bloodType') content = 'O';

    const dynamicPreviewColor = '#4f46e5'; // Default preview color for dynamic themes
    const bgColor = el.dynamicBg ? dynamicPreviewColor : (el.backgroundColor || 'transparent');
    const txtColor = el.dynamicText ? dynamicPreviewColor : (el.color || 'transparent');

    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${el.x}%`,
      top: `${el.y}%`,
      width: `${el.width}%`,
      height: `${el.height}%`,
      fontSize: `${(el.fontSize || 12)}px`,
      color: txtColor,
      backgroundColor: bgColor,
      fontWeight: el.fontWeight || 'normal',
      textAlign: el.textAlign || 'left',
      borderRadius: `${el.borderRadius || 0}px`,
      zIndex: el.zIndex,
      display: 'flex',
      alignItems: 'center',
      justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
      overflow: 'hidden',
      cursor: 'move',
      userSelect: 'none',
      border: selectedId === el.id ? '2px dashed #3b82f6' : (el.dynamicBorder ? `2px solid ${dynamicPreviewColor}` : '1px solid transparent'),
      boxSizing: 'border-box'
    };

    if (el.type === 'image' || el.field === 'avatar') {
      return (
        <div key={el.id} style={style} onMouseDown={(e) => handleMouseDown(e, el.id)}>
          <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400" style={{ borderRadius: `${el.borderRadius || 0}px` }}>
            <i className="fa-solid fa-image text-2xl"></i>
          </div>
        </div>
      );
    }

    if (el.type === 'qr') {
      return (
        <div key={el.id} style={style} onMouseDown={(e) => handleMouseDown(e, el.id)}>
          <div className="w-full h-full flex items-center justify-center bg-white p-1">
            <QRCodeCanvas value="ID-123456" size={128} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      );
    }

    return (
      <div key={el.id} style={style} onMouseDown={(e) => handleMouseDown(e, el.id)}>
        {content}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col items-center">
        <p className="text-sm text-slate-500 mb-2">ลากและวางชิ้นส่วนบนบัตร (คลิกเพื่อแก้ไข)</p>
        <div 
          ref={canvasRef}
          className="relative bg-white shadow-xl overflow-hidden border border-slate-300"
          style={{ width: '270px', height: '430px' }} // Scale up 54x86 (x5)
          onClick={(e) => {
            if (e.target === canvasRef.current) setSelectedId(null);
          }}
        >
          {elements.map(renderElementPreview)}
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-full md:w-72 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
        <h4 className="font-bold text-slate-800 dark:text-white mb-4">Properties</h4>
        {selectedElement ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1">ประเภท / ข้อมูล</label>
              <select 
                value={selectedElement.field}
                onChange={(e) => updateSelected({ field: e.target.value as FieldMapping })}
                className="w-full p-2 text-sm border border-slate-300 rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white"
              >
                <option value="static">ข้อความ/กรอบคงที่</option>
                <option value="fullName">ยศ ชื่อ นามสกุล</option>
                <option value="rank">ชั้นยศ</option>
                <option value="department">ชื่อหน่วยงาน</option>
                <option value="badgeNo">รหัสบัตร</option>
                <option value="bloodType">กรุ๊ปเลือด</option>
                <option value="avatar">รูปโปรไฟล์</option>
                <option value="qr">QR Code</option>
              </select>
            </div>

            {selectedElement.field === 'static' && selectedElement.type === 'text' && (
              <div>
                <label htmlFor="badgeElContent" className="text-xs text-slate-500 block mb-1">ข้อความ</label>
                <input 
                  id="badgeElContent"
                  aria-label="ข้อความ"
                  type="text" 
                  value={selectedElement.content || ''} 
                  onChange={(e) => updateSelected({ content: e.target.value })}
                  className="w-full p-2 text-sm border border-slate-300 rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="badgeElWidth" className="text-xs text-slate-500 block mb-1">กว้าง (%)</label>
                <input id="badgeElWidth" aria-label="กว้าง (%)" type="number" value={selectedElement.width} onChange={(e) => updateSelected({ width: Number(e.target.value) })} className="w-full p-2 text-sm border border-slate-300 rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
              </div>
              <div>
                <label htmlFor="badgeElHeight" className="text-xs text-slate-500 block mb-1">สูง (%)</label>
                <input id="badgeElHeight" aria-label="สูง (%)" type="number" value={selectedElement.height} onChange={(e) => updateSelected({ height: Number(e.target.value) })} className="w-full p-2 text-sm border border-slate-300 rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
              </div>
            </div>

            {selectedElement.type === 'text' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="badgeElFontSize" className="text-xs text-slate-500 block mb-1">ขนาดฟอนต์ (px)</label>
                  <input id="badgeElFontSize" aria-label="ขนาดฟอนต์ (px)" type="number" value={selectedElement.fontSize || 12} onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })} className="w-full p-2 text-sm border border-slate-300 rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="badgeElFontWeight" className="text-xs text-slate-500 block mb-1">ตัวหนา</label>
                  <select id="badgeElFontWeight" aria-label="ตัวหนา" value={selectedElement.fontWeight || 'normal'} onChange={(e) => updateSelected({ fontWeight: e.target.value })} className="w-full p-2 text-sm border border-slate-300 rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white">
                    <option value="normal">ปกติ</option>
                    <option value="bold">ตัวหนา</option>
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="badgeElColor" className="text-xs text-slate-500 block mb-1">สีตัวอักษร</label>
                <input id="badgeElColor" aria-label="สีตัวอักษร" type="color" value={selectedElement.color || '#000000'} onChange={(e) => updateSelected({ color: e.target.value })} className="w-full h-8 p-0 border-0 rounded cursor-pointer" />
              </div>
              <div>
                <label htmlFor="badgeElBgColor" className="text-xs text-slate-500 block mb-1">สีพื้นหลัง</label>
                <input id="badgeElBgColor" aria-label="สีพื้นหลัง" type="color" value={selectedElement.backgroundColor || '#ffffff'} onChange={(e) => updateSelected({ backgroundColor: e.target.value })} className="w-full h-8 p-0 border-0 rounded cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="badgeElBorderRadius" className="text-xs text-slate-500 block mb-1">ขอบมน (px)</label>
                <input id="badgeElBorderRadius" aria-label="ขอบมน (px)" type="number" value={selectedElement.borderRadius || 0} onChange={(e) => updateSelected({ borderRadius: Number(e.target.value) })} className="w-full p-2 text-sm border border-slate-300 rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
              </div>
              <div>
                <label htmlFor="badgeElZIndex" className="text-xs text-slate-500 block mb-1">ลำดับชั้น (Z-Index)</label>
                <input id="badgeElZIndex" aria-label="ลำดับชั้น (Z-Index)" type="number" value={selectedElement.zIndex} onChange={(e) => updateSelected({ zIndex: Number(e.target.value) })} className="w-full p-2 text-sm border border-slate-300 rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">สีอัตโนมัติ (ตามประเภทกำลังพล)</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input type="checkbox" aria-label="ใช้เป็นสีพื้นหลัง" checked={selectedElement.dynamicBg || false} onChange={(e) => updateSelected({ dynamicBg: e.target.checked })} className="rounded text-primary-500" />
                  ใช้เป็นสีพื้นหลัง (Background)
                </label>
                {selectedElement.type === 'text' && (
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input type="checkbox" aria-label="ใช้เป็นสีตัวอักษร" checked={selectedElement.dynamicText || false} onChange={(e) => updateSelected({ dynamicText: e.target.checked })} className="rounded text-primary-500" />
                    ใช้เป็นสีตัวอักษร (Text)
                  </label>
                )}
                {(selectedElement.type === 'image' || selectedElement.field === 'avatar') && (
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input type="checkbox" aria-label="ใช้เป็นสีเส้นขอบ" checked={selectedElement.dynamicBorder || false} onChange={(e) => updateSelected({ dynamicBorder: e.target.checked })} className="rounded text-primary-500" />
                    ใช้เป็นสีเส้นขอบ (Border)
                  </label>
                )}
              </div>
            </div>
            
            
            <button 
              onClick={() => {
                setElements(prev => prev.filter(el => el.id !== selectedId));
                setSelectedId(null);
              }}
              className="w-full mt-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors"
            >
              <i className="fa-solid fa-trash mr-2"></i>ลบชิ้นส่วนนี้
            </button>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">
            <i className="fa-solid fa-hand-pointer text-3xl mb-2"></i>
            <p className="text-sm">คลิกที่ชิ้นส่วนบนบัตร<br/>เพื่อแก้ไขคุณสมบัติ</p>
          </div>
        )}

        <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
          <p className="text-xs font-bold text-slate-500 mb-2">เพิ่มชิ้นส่วนใหม่</p>
          <div className="flex gap-2">
            <button onClick={() => setElements([...elements, { id: Date.now().toString(), type: 'text', field: 'static', content: 'ข้อความใหม่', x: 10, y: 10, width: 80, height: 10, fontSize: 12, color: '#000000', zIndex: 10 }])} className="flex-1 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">
              <i className="fa-solid fa-font"></i> ข้อความ
            </button>
            <button onClick={() => setElements([...elements, { id: Date.now().toString(), type: 'rect', field: 'static', x: 10, y: 10, width: 80, height: 20, backgroundColor: '#e2e8f0', zIndex: 1 }])} className="flex-1 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">
              <i className="fa-solid fa-square"></i> กรอบ
            </button>
            <button onClick={() => setElements([...elements, { id: Date.now().toString(), type: 'qr', field: 'badgeNo', x: 10, y: 10, width: 25, height: 16, backgroundColor: '#ffffff', zIndex: 5 }])} className="flex-1 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">
              <i className="fa-solid fa-qrcode"></i> QR Code
            </button>
          </div>
          <div className="mt-3">
            <button 
              onClick={() => {
                if(confirm('ต้องการโหลดเทมเพลต Modern หรือไม่? ชิ้นส่วนเดิมจะถูกลบทั้งหมด')) {
                  setElements(MODERN_TEMPLATE);
                  setSelectedId(null);
                }
              }} 
              className="w-full py-1.5 border border-primary-500 text-primary-600 dark:text-primary-400 rounded text-xs hover:bg-primary-50 dark:hover:bg-primary-900/30 font-medium"
            >
              <i className="fa-solid fa-wand-magic-sparkles mr-1"></i> โหลดเทมเพลตแบบ Modern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
