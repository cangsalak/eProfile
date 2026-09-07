'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';

export type CanvasElementType = 'text' | 'image' | 'rect' | 'circle' | 'line' | 'ribbon' | 'hologram' | 'qr' | 'barcode' | 'emblem';
export type FieldMapping = 
  | 'static' 
  | 'fullName' 
  | 'firstName'
  | 'lastName'
  | 'prefix'
  | 'position' 
  | 'department' 
  | 'subDepartment'
  | 'bloodType' 
  | 'badgeNo' 
  | 'citizenId'
  | 'avatar' 
  | 'rank' 
  | 'issueDate'
  | 'expireDate';

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  field: FieldMapping;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number; // percentage (0-100)
  height: number; // percentage (0-100)
  rotation?: number; // degrees
  content?: string;
  fontFamily?: string;
  fontSize?: number; // px
  color?: string;
  backgroundColor?: string;
  gradientEnabled?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: 'to-b' | 'to-r' | 'to-br' | 'to-tr';
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  letterSpacing?: number; // px
  lineHeight?: number;
  borderWidth?: number; // px
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderColor?: string;
  borderRadius?: number; // px
  boxShadow?: 'none' | 'sm' | 'md' | 'lg' | 'glow';
  opacity?: number; // 0-100
  zIndex: number;
  locked?: boolean;
  hidden?: boolean;
  dynamicBg?: boolean;
  dynamicText?: boolean;
  dynamicBorder?: boolean;
}

// ─── Professional Prebuilt Template Presets ──────────────────────────────────
export const TEMPLATE_MILITARY_OFFICIAL: CanvasElement[] = [
  { id: 'bg-header', type: 'rect', field: 'static', x: 0, y: 0, width: 100, height: 26, backgroundColor: '#1e3a8a', gradientEnabled: true, gradientFrom: '#1e3a8a', gradientTo: '#172554', gradientDirection: 'to-b', zIndex: 1 },
  { id: 'h-garuda', type: 'emblem', field: 'static', content: 'garuda', x: 41, y: 2, width: 18, height: 11, zIndex: 3 },
  { id: 'title', type: 'text', field: 'static', content: 'บัตรประจำตัวข้าราชการ', x: 0, y: 13, width: 100, height: 6, fontSize: 13, color: '#ffffff', fontWeight: 'bold', textAlign: 'center', zIndex: 3 },
  { id: 'org', type: 'text', field: 'department', x: 0, y: 19, width: 100, height: 5, fontSize: 9, color: '#93c5fd', textAlign: 'center', zIndex: 3 },
  { id: 'avatar', type: 'image', field: 'avatar', x: 27, y: 28, width: 46, height: 32, backgroundColor: '#e2e8f0', borderWidth: 3, borderColor: '#1e3a8a', borderRadius: 8, zIndex: 4 },
  { id: 'name', type: 'text', field: 'fullName', x: 0, y: 62, width: 100, height: 7, fontSize: 14, color: '#0f172a', fontWeight: 'bold', textAlign: 'center', zIndex: 3 },
  { id: 'pos', type: 'text', field: 'position', x: 0, y: 68, width: 100, height: 5, fontSize: 10, color: '#475569', textAlign: 'center', zIndex: 3 },
  { id: 'rank-pill', type: 'ribbon', field: 'rank', x: 20, y: 74, width: 60, height: 5.5, fontSize: 9.5, color: '#ffffff', backgroundColor: '#1e3a8a', dynamicBg: true, fontWeight: 'bold', textAlign: 'center', borderRadius: 20, zIndex: 3 },
  { id: 'box-info', type: 'rect', field: 'static', x: 8, y: 81, width: 84, height: 11, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, zIndex: 2 },
  { id: 'lbl-id', type: 'text', field: 'static', content: 'หมายเลขประจำตัว:', x: 12, y: 83, width: 40, height: 4, fontSize: 8, color: '#64748b', fontWeight: 'bold', textAlign: 'left', zIndex: 3 },
  { id: 'val-id', type: 'text', field: 'badgeNo', x: 50, y: 83, width: 38, height: 4, fontSize: 9, color: '#0f172a', fontWeight: 'bold', textAlign: 'right', zIndex: 3 },
  { id: 'lbl-bld', type: 'text', field: 'static', content: 'หมู่โลหิต (Blood):', x: 12, y: 87, width: 40, height: 4, fontSize: 8, color: '#64748b', fontWeight: 'bold', textAlign: 'left', zIndex: 3 },
  { id: 'val-bld', type: 'text', field: 'bloodType', x: 50, y: 87, width: 38, height: 4, fontSize: 9, color: '#dc2626', fontWeight: 'bold', textAlign: 'right', zIndex: 3 },
  { id: 'bg-foot', type: 'rect', field: 'static', x: 0, y: 94, width: 100, height: 6, backgroundColor: '#1e3a8a', zIndex: 1 },
  { id: 'foot-txt', type: 'text', field: 'static', content: 'หากพบเห็นกรุณาส่งคืนหน่วยงานต้นสังกัด', x: 0, y: 95, width: 100, height: 4, fontSize: 7, color: '#bfdbfe', textAlign: 'center', zIndex: 3 }
];

export const TEMPLATE_MODERN_TECH: CanvasElement[] = [
  { id: 'bg-card', type: 'rect', field: 'static', x: 0, y: 0, width: 100, height: 100, backgroundColor: '#ffffff', zIndex: 0 },
  { id: 'hdr-band', type: 'rect', field: 'static', x: 0, y: 0, width: 100, height: 38, backgroundColor: '#4f46e5', gradientEnabled: true, gradientFrom: '#4f46e5', gradientTo: '#7c3aed', gradientDirection: 'to-br', dynamicBg: true, zIndex: 1 },
  { id: 'hdr-title', type: 'text', field: 'static', content: 'DIGITAL IDENTIFICATION', x: 0, y: 3, width: 100, height: 5, fontSize: 9, color: '#ffffff', fontWeight: 'bold', letterSpacing: 2, textAlign: 'center', zIndex: 2 },
  { id: 'avatar', type: 'image', field: 'avatar', x: 26, y: 12, width: 48, height: 30, backgroundColor: '#e2e8f0', borderWidth: 3, borderColor: '#ffffff', borderRadius: 100, dynamicBorder: true, zIndex: 4 },
  { id: 'name', type: 'text', field: 'fullName', x: 0, y: 45, width: 100, height: 7, fontSize: 15, color: '#0f172a', fontWeight: 'bold', textAlign: 'center', zIndex: 2 },
  { id: 'pos', type: 'text', field: 'position', x: 0, y: 52, width: 100, height: 5, fontSize: 10, color: '#64748b', textAlign: 'center', zIndex: 2 },
  { id: 'div-line', type: 'line', field: 'static', x: 15, y: 58, width: 70, height: 0.5, backgroundColor: '#e2e8f0', zIndex: 1 },
  { id: 'dept', type: 'text', field: 'department', x: 0, y: 60, width: 100, height: 5, fontSize: 9, color: '#4f46e5', dynamicText: true, fontWeight: 'bold', textAlign: 'center', zIndex: 2 },
  { id: 'qr-code', type: 'qr', field: 'badgeNo', x: 12, y: 68, width: 28, height: 18, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 6, zIndex: 3 },
  { id: 'lbl-id', type: 'text', field: 'static', content: 'ID NUMBER', x: 44, y: 69, width: 46, height: 4, fontSize: 8, color: '#94a3b8', fontWeight: 'bold', textAlign: 'left', zIndex: 2 },
  { id: 'val-id', type: 'text', field: 'badgeNo', x: 44, y: 73, width: 46, height: 5, fontSize: 11, color: '#0f172a', fontWeight: 'bold', textAlign: 'left', zIndex: 2 },
  { id: 'lbl-rank', type: 'text', field: 'static', content: 'RANK / TYPE', x: 44, y: 78, width: 46, height: 4, fontSize: 8, color: '#94a3b8', fontWeight: 'bold', textAlign: 'left', zIndex: 2 },
  { id: 'val-rank', type: 'text', field: 'rank', x: 44, y: 82, width: 46, height: 4, fontSize: 9, color: '#4f46e5', dynamicText: true, fontWeight: 'bold', textAlign: 'left', zIndex: 2 },
  { id: 'holo-bar', type: 'hologram', field: 'static', x: 0, y: 92, width: 100, height: 4, zIndex: 3 },
  { id: 'btm-txt', type: 'text', field: 'static', content: 'SECURE AUTHENTICATED SMART BADGE', x: 0, y: 96, width: 100, height: 3.5, fontSize: 7, color: '#94a3b8', textAlign: 'center', zIndex: 2 }
];

export const TEMPLATE_LANDSCAPE_EXECUTIVE: CanvasElement[] = [
  { id: 'ls-bg', type: 'rect', field: 'static', x: 0, y: 0, width: 100, height: 100, backgroundColor: '#ffffff', zIndex: 0 },
  { id: 'ls-bar-l', type: 'rect', field: 'static', x: 0, y: 0, width: 34, height: 100, backgroundColor: '#0f172a', gradientEnabled: true, gradientFrom: '#0f172a', gradientTo: '#1e293b', gradientDirection: 'to-b', zIndex: 1 },
  { id: 'ls-avatar', type: 'image', field: 'avatar', x: 4, y: 15, width: 26, height: 44, backgroundColor: '#e2e8f0', borderWidth: 2, borderColor: '#ffffff', borderRadius: 8, zIndex: 3 },
  { id: 'ls-badge-no', type: 'text', field: 'badgeNo', x: 2, y: 64, width: 30, height: 6, fontSize: 10, color: '#94a3b8', fontWeight: 'bold', textAlign: 'center', zIndex: 2 },
  { id: 'ls-qr', type: 'qr', field: 'badgeNo', x: 8, y: 72, width: 18, height: 22, backgroundColor: '#ffffff', borderRadius: 4, zIndex: 3 },
  { id: 'ls-garuda', type: 'emblem', field: 'static', content: 'garuda', x: 38, y: 6, width: 10, height: 14, zIndex: 2 },
  { id: 'ls-hdr', type: 'text', field: 'static', content: 'บัตรประจำตัวเจ้าหน้าที่สังกัด', x: 50, y: 6, width: 46, height: 6, fontSize: 11, color: '#64748b', fontWeight: 'bold', textAlign: 'left', zIndex: 2 },
  { id: 'ls-dept', type: 'text', field: 'department', x: 50, y: 12, width: 46, height: 7, fontSize: 13, color: '#0f172a', fontWeight: 'bold', textAlign: 'left', zIndex: 2 },
  { id: 'ls-line', type: 'line', field: 'static', x: 38, y: 23, width: 58, height: 1, backgroundColor: '#e2e8f0', zIndex: 1 },
  { id: 'ls-name', type: 'text', field: 'fullName', x: 38, y: 28, width: 58, height: 10, fontSize: 17, color: '#0f172a', fontWeight: 'bold', textAlign: 'left', zIndex: 2 },
  { id: 'ls-pos', type: 'text', field: 'position', x: 38, y: 39, width: 58, height: 7, fontSize: 12, color: '#3b82f6', dynamicText: true, fontWeight: 'bold', textAlign: 'left', zIndex: 2 },
  { id: 'ls-rank', type: 'ribbon', field: 'rank', x: 38, y: 49, width: 36, height: 8, fontSize: 9.5, color: '#ffffff', backgroundColor: '#3b82f6', dynamicBg: true, fontWeight: 'bold', textAlign: 'center', borderRadius: 12, zIndex: 2 },
  { id: 'ls-bld', type: 'text', field: 'static', content: 'หมู่โลหิต: O', x: 76, y: 50, width: 20, height: 6, fontSize: 10, color: '#dc2626', fontWeight: 'bold', textAlign: 'left', zIndex: 2 },
  { id: 'ls-barcode', type: 'barcode', field: 'badgeNo', x: 38, y: 66, width: 56, height: 18, zIndex: 2 },
  { id: 'ls-foot', type: 'text', field: 'static', content: 'EXECUTIVE IDENTIFICATION CARD', x: 38, y: 88, width: 58, height: 5, fontSize: 8, color: '#94a3b8', letterSpacing: 1, textAlign: 'left', zIndex: 2 }
];

export const TEMPLATE_BACK_STANDARD: CanvasElement[] = [
  { id: 'b-bg', type: 'rect', field: 'static', x: 0, y: 0, width: 100, height: 100, backgroundColor: '#ffffff', zIndex: 0 },
  { id: 'b-title', type: 'text', field: 'static', content: 'ข้อกำหนดและระเบียบการใช้บัตร', x: 0, y: 6, width: 100, height: 7, fontSize: 13, color: '#0f172a', fontWeight: 'bold', textAlign: 'center', zIndex: 2 },
  { id: 'b-line1', type: 'line', field: 'static', x: 10, y: 15, width: 80, height: 0.5, backgroundColor: '#cbd5e1', zIndex: 1 },
  { id: 'b-p1', type: 'text', field: 'static', content: '1. บัตรนี้เป็นทรัพย์สินของทางราชการ ห้ามโอนหรือมอบให้ผู้อื่นนำไปใช้', x: 8, y: 19, width: 84, height: 10, fontSize: 8.5, color: '#475569', textAlign: 'left', zIndex: 2 },
  { id: 'b-p2', type: 'text', field: 'static', content: '2. ต้องแสดงบัตรนี้ทุกครั้งเมื่อเข้า-ออกอาคาร และขณะปฏิบัติหน้าที่', x: 8, y: 30, width: 84, height: 10, fontSize: 8.5, color: '#475569', textAlign: 'left', zIndex: 2 },
  { id: 'b-p3', type: 'text', field: 'static', content: '3. กรณีบัตรสูญหายหรือชำรุด ให้แจ้งหน่วยงานต้นสังกัดทราบทันที', x: 8, y: 41, width: 84, height: 10, fontSize: 8.5, color: '#475569', textAlign: 'left', zIndex: 2 },
  { id: 'b-qr', type: 'qr', field: 'badgeNo', x: 34, y: 55, width: 32, height: 20, backgroundColor: '#ffffff', zIndex: 3 },
  { id: 'b-qr-lbl', type: 'text', field: 'static', content: 'สแกนเพื่อตรวจสอบความถูกต้องดิจิทัล', x: 0, y: 77, width: 100, height: 5, fontSize: 8, color: '#64748b', textAlign: 'center', zIndex: 2 },
  { id: 'b-line2', type: 'line', field: 'static', x: 10, y: 84, width: 80, height: 0.5, backgroundColor: '#cbd5e1', zIndex: 1 },
  { id: 'b-org', type: 'text', field: 'department', x: 0, y: 87, width: 100, height: 5, fontSize: 9, color: '#0f172a', fontWeight: 'bold', textAlign: 'center', zIndex: 2 },
  { id: 'b-addr', type: 'text', field: 'static', content: 'กรุณาส่งคืนตามที่อยู่หน่วยงานต้นสังกัด', x: 0, y: 92, width: 100, height: 4, fontSize: 7.5, color: '#64748b', textAlign: 'center', zIndex: 2 }
];

type CanvaTab = 'templates' | 'text' | 'elements' | 'codes' | 'media' | 'layers';

interface BadgeCanvasEditorProps {
  initialElements?: CanvasElement[];
  initialBackElements?: CanvasElement[];
  onChange: (elements: CanvasElement[]) => void;
  onBackChange?: (elements: CanvasElement[]) => void;
}

export default function BadgeCanvasEditor({ 
  initialElements, 
  initialBackElements, 
  onChange,
  onBackChange 
}: BadgeCanvasEditorProps) {
  // Canva Left Sidebar State
  const [activeTab, setActiveTab] = useState<CanvaTab>('templates');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // Front / Back canvas side state
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    const list = initialElements && initialElements.length > 0 ? initialElements : TEMPLATE_MILITARY_OFFICIAL;
    return list.some(el => el.id.startsWith('ls-')) ? 'landscape' : 'portrait';
  });

  const [zoom, setZoom] = useState<number>(100);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [useMockData, setUseMockData] = useState<boolean>(true);

  // Elements & History
  const [frontElements, setFrontElements] = useState<CanvasElement[]>(
    initialElements && initialElements.length > 0 ? initialElements : TEMPLATE_MILITARY_OFFICIAL
  );
  const [backElements, setBackElements] = useState<CanvasElement[]>(
    initialBackElements && initialBackElements.length > 0 ? initialBackElements : TEMPLATE_BACK_STANDARD
  );

  const [history, setHistory] = useState<{ front: CanvasElement[][]; back: CanvasElement[][] }>({
    front: [initialElements && initialElements.length > 0 ? initialElements : TEMPLATE_MILITARY_OFFICIAL],
    back: [initialBackElements && initialBackElements.length > 0 ? initialBackElements : TEMPLATE_BACK_STANDARD]
  });
  const [historyIndex, setHistoryIndex] = useState<{ front: number; back: number }>({ front: 0, back: 0 });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Smart Guides (horizontal & vertical center alignments)
  const [guideLines, setGuideLines] = useState<{ x: boolean; y: boolean }>({ x: false, y: false });

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    icon?: string;
    confirmText?: string;
    confirmColor?: string;
    onConfirm: () => void;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const isInteracting = useRef<'drag' | 'resize' | null>(null);
  const hasMoved = useRef<boolean>(false);
  const resizeHandle = useRef<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0, elemX: 0, elemY: 0, elemW: 0, elemH: 0 });

  const currentElements = activeSide === 'front' ? frontElements : backElements;

  // Push history
  const pushHistory = useCallback((newElements: CanvasElement[], side: 'front' | 'back') => {
    setHistory(prev => {
      const currentList = prev[side].slice(0, (historyIndex[side] || 0) + 1);
      return {
        ...prev,
        [side]: [...currentList, newElements]
      };
    });
    setHistoryIndex(prev => ({
      ...prev,
      [side]: (prev[side] || 0) + 1
    }));
  }, [historyIndex]);

  const updateCurrentElements = useCallback((newElements: CanvasElement[], recordHistory = true) => {
    if (activeSide === 'front') {
      setFrontElements(newElements);
      onChange(newElements);
      if (recordHistory) pushHistory(newElements, 'front');
    } else {
      setBackElements(newElements);
      if (onBackChange) onBackChange(newElements);
      if (recordHistory) pushHistory(newElements, 'back');
    }
  }, [activeSide, onChange, onBackChange, pushHistory]);

  const handleUndo = useCallback(() => {
    const side = activeSide;
    const curIdx = historyIndex[side];
    if (curIdx > 0) {
      const targetIdx = curIdx - 1;
      const targetElements = history[side][targetIdx];
      if (targetElements) {
        if (side === 'front') {
          setFrontElements(targetElements);
          onChange(targetElements);
        } else {
          setBackElements(targetElements);
          if (onBackChange) onBackChange(targetElements);
        }
        setHistoryIndex(prev => ({ ...prev, [side]: targetIdx }));
      }
    }
  }, [activeSide, history, historyIndex, onChange, onBackChange]);

  const handleRedo = useCallback(() => {
    const side = activeSide;
    const curIdx = historyIndex[side];
    if (curIdx < history[side].length - 1) {
      const targetIdx = curIdx + 1;
      const targetElements = history[side][targetIdx];
      if (targetElements) {
        if (side === 'front') {
          setFrontElements(targetElements);
          onChange(targetElements);
        } else {
          setBackElements(targetElements);
          if (onBackChange) onBackChange(targetElements);
        }
        setHistoryIndex(prev => ({ ...prev, [side]: targetIdx }));
      }
    }
  }, [activeSide, history, historyIndex, onChange, onBackChange]);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    const targetElements = activeSide === 'front' ? frontElements : backElements;
    const newElements = targetElements.filter(el => el.id !== selectedId);
    setSelectedId(null);
    updateCurrentElements(newElements, true);
  }, [selectedId, activeSide, frontElements, backElements, updateCurrentElements]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        handleRedo();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea' && activeTag !== 'select') {
          deleteSelected();
        }
      } else if (selectedId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea' && activeTag !== 'select') {
          e.preventDefault();
          const step = e.shiftKey ? 2 : 0.5;
          const targetElements = activeSide === 'front' ? frontElements : backElements;
          const newElements = targetElements.map(el => {
            if (el.id === selectedId && !el.locked) {
              let nx = el.x;
              let ny = el.y;
              if (e.key === 'ArrowUp') ny = Math.max(0, el.y - step);
              if (e.key === 'ArrowDown') ny = Math.min(100 - el.height, el.y + step);
              if (e.key === 'ArrowLeft') nx = Math.max(0, el.x - step);
              if (e.key === 'ArrowRight') nx = Math.min(100 - el.width, el.x + step);
              return { ...el, x: nx, y: ny };
            }
            return el;
          });
          updateCurrentElements(newElements, true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, handleUndo, handleRedo, deleteSelected, activeSide, frontElements, backElements, updateCurrentElements]);

  // ─── Drag & 8-Point Resize Engine with Smart Snapping ──────────────────────
  const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    const elem = currentElements.find(el => el.id === id);
    if (!elem || elem.locked || elem.hidden) return;

    isInteracting.current = 'drag';
    hasMoved.current = false;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      elemX: elem.x,
      elemY: elem.y,
      elemW: elem.width,
      elemH: elem.height,
    };
  };

  const handleResizeHandleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (!selectedId) return;
    const elem = currentElements.find(el => el.id === selectedId);
    if (!elem || elem.locked || elem.hidden) return;

    isInteracting.current = 'resize';
    resizeHandle.current = handle;
    hasMoved.current = false;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      elemX: elem.x,
      elemY: elem.y,
      elemW: elem.width,
      elemH: elem.height,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isInteracting.current || !selectedId || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    if (!hasMoved.current && Math.abs(dx) < 2 && Math.abs(dy) < 2) {
      return;
    }
    hasMoved.current = true;

    let dxPercent = (dx / canvasRect.width) * 100;
    let dyPercent = (dy / canvasRect.height) * 100;

    if (snapToGrid) {
      dxPercent = Math.round(dxPercent * 2) / 2; // snap 0.5%
      dyPercent = Math.round(dyPercent * 2) / 2;
    }

    if (isInteracting.current === 'drag') {
      let snapX = false;
      let snapY = false;

      const newElements = currentElements.map(el => {
        if (el.id === selectedId) {
          let nextX = Math.max(0, Math.min(100 - el.width, dragStart.current.elemX + dxPercent));
          let nextY = Math.max(0, Math.min(100 - el.height, dragStart.current.elemY + dyPercent));

          // Center snap checking
          const centerX = nextX + el.width / 2;
          const centerY = nextY + el.height / 2;
          if (Math.abs(centerX - 50) < 1.5) {
            nextX = 50 - el.width / 2;
            snapX = true;
          }
          if (Math.abs(centerY - 50) < 1.5) {
            nextY = 50 - el.height / 2;
            snapY = true;
          }

          return { ...el, x: nextX, y: nextY };
        }
        return el;
      });

      setGuideLines({ x: snapX, y: snapY });
      updateCurrentElements(newElements, false);
    } else if (isInteracting.current === 'resize' && resizeHandle.current) {
      const handle = resizeHandle.current;
      const { elemX, elemY, elemW, elemH } = dragStart.current;

      let newX = elemX;
      let newY = elemY;
      let newW = elemW;
      let newH = elemH;

      if (handle.includes('r')) newW = Math.max(4, Math.min(100 - elemX, elemW + dxPercent));
      if (handle.includes('b')) newH = Math.max(2, Math.min(100 - elemY, elemH + dyPercent));
      if (handle.includes('l')) {
        const potentialW = elemW - dxPercent;
        if (potentialW >= 4 && elemX + dxPercent >= 0) {
          newX = elemX + dxPercent;
          newW = potentialW;
        }
      }
      if (handle.includes('t')) {
        const potentialH = elemH - dyPercent;
        if (potentialH >= 2 && elemY + dyPercent >= 0) {
          newY = elemY + dyPercent;
          newH = potentialH;
        }
      }

      const newElements = currentElements.map(el => {
        if (el.id === selectedId) {
          return { ...el, x: newX, y: newY, width: newW, height: newH };
        }
        return el;
      });
      updateCurrentElements(newElements, false);
    }
  };

  const handleMouseUp = () => {
    setGuideLines({ x: false, y: false });
    if (isInteracting.current) {
      const moved = hasMoved.current;
      isInteracting.current = null;
      resizeHandle.current = null;
      hasMoved.current = false;
      if (moved) {
        pushHistory(currentElements, activeSide);
      }
    }
  };

  const updateSelected = (updates: Partial<CanvasElement>) => {
    const newElements = currentElements.map(el => el.id === selectedId ? { ...el, ...updates } : el);
    updateCurrentElements(newElements, true);
  };

  const duplicateSelected = () => {
    if (!selectedId) return;
    const elem = currentElements.find(el => el.id === selectedId);
    if (!elem) return;
    const newElem: CanvasElement = {
      ...elem,
      id: `${elem.type}-${Date.now()}`,
      x: Math.min(elem.x + 3, 90),
      y: Math.min(elem.y + 3, 90),
      zIndex: Math.max(...currentElements.map(e => e.zIndex), 0) + 1
    };
    const newElements = [...currentElements, newElem];
    setSelectedId(newElem.id);
    updateCurrentElements(newElements, true);
  };

  const alignSelected = (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!selectedId) return;
    const elem = currentElements.find(el => el.id === selectedId);
    if (!elem) return;

    let updates: Partial<CanvasElement> = {};
    if (direction === 'left') updates.x = 0;
    if (direction === 'center') updates.x = (100 - elem.width) / 2;
    if (direction === 'right') updates.x = 100 - elem.width;
    if (direction === 'top') updates.y = 0;
    if (direction === 'middle') updates.y = (100 - elem.height) / 2;
    if (direction === 'bottom') updates.y = 100 - elem.height;

    updateSelected(updates);
  };

  const reorderLayer = (action: 'front' | 'back' | 'forward' | 'backward') => {
    if (!selectedId) return;
    let newElements = [...currentElements];
    if (action === 'front') {
      const maxZ = Math.max(...newElements.map(e => e.zIndex), 1);
      newElements = newElements.map(el => el.id === selectedId ? { ...el, zIndex: maxZ + 1 } : el);
    } else if (action === 'back') {
      const minZ = Math.min(...newElements.map(e => e.zIndex), 1);
      newElements = newElements.map(el => el.id === selectedId ? { ...el, zIndex: Math.max(minZ - 1, 0) } : el);
    } else if (action === 'forward') {
      newElements = newElements.map(el => el.id === selectedId ? { ...el, zIndex: el.zIndex + 1 } : el);
    } else if (action === 'backward') {
      newElements = newElements.map(el => el.id === selectedId ? { ...el, zIndex: Math.max(el.zIndex - 1, 0) } : el);
    }
    updateCurrentElements(newElements, true);
  };

  const addElement = (type: CanvasElementType, customProps: Partial<CanvasElement> = {}) => {
    const maxZ = Math.max(...currentElements.map(e => e.zIndex), 0) + 1;
    const id = `${type}-${Date.now()}`;

    let defaultEl: CanvasElement = {
      id,
      type,
      field: 'static',
      x: 15,
      y: 25,
      width: 70,
      height: 10,
      zIndex: maxZ,
      ...customProps
    };

    if (type === 'text') {
      defaultEl = {
        ...defaultEl,
        content: 'ข้อความใหม่',
        fontSize: 13,
        color: '#0f172a',
        fontWeight: 'bold',
        textAlign: 'center'
      };
    } else if (type === 'rect') {
      defaultEl = {
        ...defaultEl,
        height: 18,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 6
      };
    } else if (type === 'circle') {
      defaultEl = {
        ...defaultEl,
        width: 28,
        height: 18,
        backgroundColor: '#e2e8f0',
        borderRadius: 100
      };
    } else if (type === 'line') {
      defaultEl = {
        ...defaultEl,
        height: 0.5,
        backgroundColor: '#94a3b8'
      };
    } else if (type === 'ribbon') {
      defaultEl = {
        ...defaultEl,
        height: 6,
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        fontSize: 9.5,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRadius: 20,
        dynamicBg: true
      };
    } else if (type === 'hologram') {
      defaultEl = {
        ...defaultEl,
        height: 4,
        zIndex: 10
      };
    } else if (type === 'qr') {
      defaultEl = {
        ...defaultEl,
        field: 'badgeNo',
        width: 28,
        height: 18,
        backgroundColor: '#ffffff',
        borderRadius: 4,
        zIndex: 5
      };
    } else if (type === 'barcode') {
      defaultEl = {
        ...defaultEl,
        field: 'badgeNo',
        width: 55,
        height: 15,
        zIndex: 5
      };
    } else if (type === 'emblem') {
      defaultEl = {
        ...defaultEl,
        content: 'garuda',
        width: 16,
        height: 12,
        zIndex: 5
      };
    }

    const newElements = [...currentElements, defaultEl];
    setSelectedId(id);
    updateCurrentElements(newElements, true);
  };

  const selectedElement = currentElements.find(el => el.id === selectedId);

  // ─── Render Canvas Element Inside Stage ─────────────────────────────────────
  const renderElement = (el: CanvasElement) => {
    if (el.hidden) return null;
    const isSelected = selectedId === el.id;

    // Content mapping for mock preview
    let content: React.ReactNode = el.content;
    if (useMockData) {
      if (el.field === 'fullName') content = 'พ.อ. สมชาย กล้าหาญ';
      else if (el.field === 'firstName') content = 'สมชาย';
      else if (el.field === 'lastName') content = 'กล้าหาญ';
      else if (el.field === 'prefix') content = 'พ.อ.';
      else if (el.field === 'position') content = 'นายทหารปฏิบัติการพิเศษ';
      else if (el.field === 'department') content = 'กองบัญชาการกองทัพไทย';
      else if (el.field === 'subDepartment') content = 'สำนักยุทธการ';
      else if (el.field === 'rank') content = 'นายทหารสัญญาบัตร';
      else if (el.field === 'badgeNo') content = 'ID-88492015';
      else if (el.field === 'citizenId') content = '1-1002-34567-89-0';
      else if (el.field === 'bloodType') content = 'หมู่โลหิต B';
      else if (el.field === 'issueDate') content = '01 ม.ค. 2567';
      else if (el.field === 'expireDate') content = '31 ธ.ค. 2570';
    } else {
      if (el.field === 'fullName') content = '{ชื่อ-นามสกุล}';
      else if (el.field === 'position') content = '{ตำแหน่ง}';
      else if (el.field === 'department') content = '{หน่วยงาน}';
      else if (el.field === 'badgeNo') content = '{หมายเลขบัตร}';
      else if (el.field !== 'static') content = `{${el.field}}`;
    }

    const dynamicPreviewColor = '#1e3a8a';
    const bgColor = el.gradientEnabled 
      ? `linear-gradient(${el.gradientDirection === 'to-r' ? 'to right' : el.gradientDirection === 'to-br' ? 'to bottom right' : el.gradientDirection === 'to-tr' ? 'to top right' : 'to bottom'}, ${el.gradientFrom || '#3b82f6'}, ${el.gradientTo || '#1e3a8a'})`
      : el.dynamicBg ? dynamicPreviewColor : (el.backgroundColor || 'transparent');
    
    const txtColor = el.dynamicText ? dynamicPreviewColor : (el.color || '#0f172a');
    const borderColor = el.dynamicBorder ? dynamicPreviewColor : (el.borderColor || 'transparent');

    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${el.x}%`,
      top: `${el.y}%`,
      width: `${el.width}%`,
      height: `${el.height}%`,
      transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
      fontSize: el.fontSize ? `${el.fontSize}px` : undefined,
      fontFamily: el.fontFamily ? `var(--font-${el.fontFamily.toLowerCase()})` : undefined,
      color: txtColor,
      background: bgColor,
      fontWeight: el.fontWeight || 'normal',
      fontStyle: el.fontStyle || 'normal',
      textAlign: el.textAlign || 'left',
      letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined,
      borderWidth: el.borderWidth ? `${el.borderWidth}px` : undefined,
      borderStyle: el.borderStyle || 'solid',
      borderColor: borderColor,
      borderRadius: `${el.borderRadius || 0}px`,
      opacity: el.opacity !== undefined ? el.opacity / 100 : 1,
      zIndex: el.zIndex,
      display: 'flex',
      alignItems: 'center',
      justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : el.textAlign === 'justify' ? 'space-between' : 'flex-start',
      overflow: 'hidden',
      cursor: el.locked ? 'not-allowed' : 'move',
      userSelect: 'none',
      boxSizing: 'border-box',
      boxShadow: el.boxShadow === 'sm' ? '0 1px 2px rgba(0,0,0,0.1)' : el.boxShadow === 'md' ? '0 4px 6px -1px rgba(0,0,0,0.15)' : el.boxShadow === 'lg' ? '0 10px 15px -3px rgba(0,0,0,0.2)' : el.boxShadow === 'glow' ? '0 0 15px rgba(59,130,246,0.5)' : undefined
    };

    let innerComponent: React.ReactNode = content;

    if (el.type === 'image' || el.field === 'avatar') {
      innerComponent = (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-400">
          <i className="fa-solid fa-user-tie text-2xl sm:text-3xl text-slate-500"></i>
          <span className="text-[8px] font-semibold mt-1">รูปถ่าย</span>
        </div>
      );
    } else if (el.type === 'emblem') {
      innerComponent = (
        <div className="w-full h-full flex items-center justify-center">
          <i className="fa-solid fa-shield-halved text-2xl text-amber-500 drop-shadow"></i>
        </div>
      );
    } else if (el.type === 'hologram') {
      innerComponent = (
        <div className="w-full h-full bg-gradient-to-r from-rose-400 via-amber-300 via-emerald-400 via-cyan-400 to-indigo-400 opacity-80 flex items-center justify-center">
          <span className="text-[7px] font-black tracking-widest text-slate-900/60 uppercase">SECURE HOLOGRAM</span>
        </div>
      );
    } else if (el.type === 'qr') {
      innerComponent = (
        <div className="w-full h-full p-1 bg-white flex items-center justify-center">
          <QRCodeCanvas value="ID-88492015" size={100} style={{ width: '100%', height: '100%' }} />
        </div>
      );
    } else if (el.type === 'barcode') {
      innerComponent = (
        <div className="w-full h-full p-1 bg-white flex flex-col items-center justify-center">
          <div className="w-full h-3/4 flex items-center justify-center gap-0.5">
            {[2,1,3,1,2,3,1,2,1,3,2,1,2,3,1,2,1,3,2].map((w, i) => (
              <span key={i} className="h-full bg-slate-900" style={{ width: `${w * 1.5}px` }} />
            ))}
          </div>
          <span className="text-[7px] font-mono tracking-widest text-slate-800 font-bold mt-0.5">ID-88492015</span>
        </div>
      );
    }

    return (
      <div 
        key={el.id} 
        style={style} 
        onMouseDown={(e) => handleElementMouseDown(e, el.id)}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedId(el.id);
        }}
        className={`group cursor-pointer select-none ${isSelected ? 'ring-2 ring-primary-500 ring-offset-1 shadow-md' : 'hover:outline hover:outline-1 hover:outline-primary-400/60'}`}
      >
        {innerComponent}

        {/* ─── 8 Direct Visual Resize Handles ─── */}
        {isSelected && !el.locked && (
          <>
            <div onMouseDown={(e) => handleResizeHandleMouseDown(e, 'tl')} className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary-600 rounded-xs cursor-nwse-resize shadow z-50 hover:scale-125 transition-transform" />
            <div onMouseDown={(e) => handleResizeHandleMouseDown(e, 't')} className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-primary-600 rounded-xs cursor-ns-resize shadow z-50 hover:scale-125 transition-transform" />
            <div onMouseDown={(e) => handleResizeHandleMouseDown(e, 'tr')} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary-600 rounded-xs cursor-nesw-resize shadow z-50 hover:scale-125 transition-transform" />
            <div onMouseDown={(e) => handleResizeHandleMouseDown(e, 'r')} className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-primary-600 rounded-xs cursor-ew-resize shadow z-50 hover:scale-125 transition-transform" />
            <div onMouseDown={(e) => handleResizeHandleMouseDown(e, 'br')} className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary-600 rounded-xs cursor-nwse-resize shadow z-50 hover:scale-125 transition-transform" />
            <div onMouseDown={(e) => handleResizeHandleMouseDown(e, 'b')} className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-primary-600 rounded-xs cursor-ns-resize shadow z-50 hover:scale-125 transition-transform" />
            <div onMouseDown={(e) => handleResizeHandleMouseDown(e, 'bl')} className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary-600 rounded-xs cursor-nesw-resize shadow z-50 hover:scale-125 transition-transform" />
            <div onMouseDown={(e) => handleResizeHandleMouseDown(e, 'l')} className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-2 border-primary-600 rounded-xs cursor-ew-resize shadow z-50 hover:scale-125 transition-transform" />
          </>
        )}
      </div>
    );
  };

  const canvasWidth = orientation === 'landscape' ? 440 : 280;
  const canvasHeight = orientation === 'landscape' ? 280 : 440;

  return (
    <div 
      className="flex flex-col w-full bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden font-prompt select-none"
      onMouseMove={handleMouseMove} 
      onMouseUp={handleMouseUp} 
      onMouseLeave={handleMouseUp}
    >
      {/* ============================================================ */}
      {/* 1. CANVA TOP CONTROL & CONTEXTUAL ELEMENT TOOLBAR */}
      {/* ============================================================ */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-30">
        
        {/* Left Side Controls: Front/Back & Orientation */}
        <div className="flex items-center gap-2">
          {/* Side Switcher (Front/Back) */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => { setActiveSide('front'); setSelectedId(null); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeSide === 'front' 
                  ? 'bg-primary-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-id-card" />
              <span>ด้านหน้าบัตร</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveSide('back'); setSelectedId(null); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeSide === 'back' 
                  ? 'bg-primary-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-rotate" />
              <span>ด้านหลังบัตร</span>
            </button>
          </div>

          {/* Orientation Switcher */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setOrientation('portrait')}
              title="แนวตั้ง CR80 (54 × 85.6 mm)"
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                orientation === 'portrait' ? 'bg-slate-800 text-primary-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <i className="fa-solid fa-mobile-screen mr-1" /> แนวตั้ง
            </button>
            <button
              type="button"
              onClick={() => setOrientation('landscape')}
              title="แนวนอน CR80 (85.6 × 54 mm)"
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                orientation === 'landscape' ? 'bg-slate-800 text-primary-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <i className="fa-solid fa-tablet-screen-button rotate-90 mr-1" /> แนวนอน
            </button>
          </div>
        </div>

        {/* Middle Contextual Properties (Appears when element is selected) */}
        {selectedElement ? (
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 animate-fade-in overflow-x-auto scrollbar-none">
            {/* Typography if text/ribbon */}
            {(selectedElement.type === 'text' || selectedElement.type === 'ribbon') && (
              <>
                {/* Font Family Dropdown */}
                <select
                  value={selectedElement.fontFamily || 'Prompt'}
                  onChange={(e) => updateSelected({ fontFamily: e.target.value })}
                  className="bg-slate-800 text-white text-xs px-2 py-1 rounded-lg border border-slate-700 outline-none cursor-pointer"
                >
                  <option value="Prompt">Prompt</option>
                  <option value="Sarabun">Sarabun</option>
                  <option value="Kanit">Kanit</option>
                  <option value="Niramit">Niramit</option>
                </select>

                {/* Font Size Stepper */}
                <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => updateSelected({ fontSize: Math.max(6, (selectedElement.fontSize || 12) - 1) })}
                    className="px-2 py-1 text-slate-400 hover:text-white font-bold"
                  >-</button>
                  <span className="px-1 text-[11px] font-mono min-w-[24px] text-center">{selectedElement.fontSize || 12}</span>
                  <button
                    type="button"
                    onClick={() => updateSelected({ fontSize: Math.min(64, (selectedElement.fontSize || 12) + 1) })}
                    className="px-2 py-1 text-slate-400 hover:text-white font-bold"
                  >+</button>
                </div>

                {/* Text Color */}
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={selectedElement.color || '#0f172a'}
                    onChange={(e) => updateSelected({ color: e.target.value })}
                    className="w-6 h-6 rounded-md border border-slate-700 cursor-pointer p-0"
                    title="สีตัวอักษร"
                  />
                </div>

                {/* Bold / Italic */}
                <button
                  type="button"
                  onClick={() => updateSelected({ fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${selectedElement.fontWeight === 'bold' ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                  title="ตัวหนา"
                >B</button>

                <button
                  type="button"
                  onClick={() => updateSelected({ fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs italic ${selectedElement.fontStyle === 'italic' ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                  title="ตัวเอียง"
                >I</button>

                {/* Alignment Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const next = selectedElement.textAlign === 'left' ? 'center' : selectedElement.textAlign === 'center' ? 'right' : 'left';
                    updateSelected({ textAlign: next });
                  }}
                  className="w-6 h-6 rounded bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                  title="จัดตำแหน่งข้อความ"
                >
                  <i className={`fa-solid fa-align-${selectedElement.textAlign || 'center'}`} />
                </button>

                <div className="h-4 w-px bg-slate-800 mx-0.5" />
              </>
            )}

            {/* Background Fill Color */}
            <div className="flex items-center gap-1" title="สีพื้นหลัง">
              <span className="text-[10px] text-slate-500">Fill:</span>
              <input
                type="color"
                value={selectedElement.backgroundColor || '#ffffff'}
                onChange={(e) => updateSelected({ backgroundColor: e.target.value })}
                className="w-6 h-6 rounded-md border border-slate-700 cursor-pointer p-0"
              />
            </div>

            {/* Quick Actions for Selected Element */}
            <button
              type="button"
              onClick={duplicateSelected}
              title="ทำสำเนา (Duplicate)"
              className="w-6 h-6 rounded bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
            >
              <i className="fa-regular fa-copy" />
            </button>

            <button
              type="button"
              onClick={() => updateSelected({ locked: !selectedElement.locked })}
              title={selectedElement.locked ? 'ปลดล็อค' : 'ล็อคตำแหน่ง'}
              className={`w-6 h-6 rounded flex items-center justify-center text-xs ${selectedElement.locked ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <i className={`fa-solid ${selectedElement.locked ? 'fa-lock' : 'fa-lock-open'}`} />
            </button>

            <button
              type="button"
              onClick={deleteSelected}
              title="ลบ (Delete)"
              className="w-6 h-6 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center text-xs transition"
            >
              <i className="fa-solid fa-trash" />
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-medium">
            <i className="fa-solid fa-hand-pointer mr-1.5 text-slate-600" />
            คลิกที่ชิ้นส่วนบนบัตรเพื่อเปิดแถบเครื่องมือปรับแต่ง
          </div>
        )}

        {/* Right Side Tools: Undo, Redo, Zoom, Grid, Mock Switch */}
        <div className="flex items-center gap-1.5">
          {/* Mock Preview Switcher */}
          <button
            type="button"
            onClick={() => setUseMockData(!useMockData)}
            title="สลับโหมดพรีวิวข้อมูลตัวอย่างจริง"
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              useMockData ? 'bg-primary-950/80 border border-primary-800/80 text-primary-300' : 'bg-slate-900 border border-slate-800 text-slate-500'
            }`}
          >
            <i className="fa-solid fa-eye text-[11px]" />
            <span>พรีวิวข้อมูลจริง</span>
          </button>

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex[activeSide] <= 0}
            title="ย้อนกลับ (Ctrl+Z)"
            className="w-7 h-7 rounded-lg bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 flex items-center justify-center text-xs transition"
          >
            <i className="fa-solid fa-arrow-rotate-left" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex[activeSide] >= history[activeSide].length - 1}
            title="ทำซ้ำ (Ctrl+Y)"
            className="w-7 h-7 rounded-lg bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 flex items-center justify-center text-xs transition"
          >
            <i className="fa-solid fa-arrow-rotate-right" />
          </button>

          {/* Grid & Magnet */}
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            title="เปิด/ปิดเส้นกริด"
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition ${
              showGrid ? 'bg-primary-950/80 text-primary-400 border border-primary-800' : 'bg-slate-900 text-slate-500'
            }`}
          >
            <i className="fa-solid fa-border-all" />
          </button>

          {/* Zoom */}
          <div className="flex items-center text-xs bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5">
            <button type="button" onClick={() => setZoom(prev => Math.max(60, prev - 15))} className="hover:text-primary-400 font-bold px-1">-</button>
            <span className="font-mono text-[10px] min-w-[32px] text-center text-slate-400">{zoom}%</span>
            <button type="button" onClick={() => setZoom(prev => Math.min(160, prev + 15))} className="hover:text-primary-400 font-bold px-1">+</button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. CANVA WORKSPACE: LEFT RAIL + FLYOUT DRAWER + STAGE */}
      {/* ============================================================ */}
      <div className="flex flex-1 min-h-[580px] relative">
        
        {/* ─── 2.1 Canva Left Icon Rail (68px) ─── */}
        <div className="w-[68px] bg-slate-950 border-r border-slate-800 flex flex-col items-center py-3 space-y-2 shrink-0 z-20">
          <button
            type="button"
            onClick={() => { setActiveTab('templates'); setIsDrawerOpen(true); }}
            className={`w-14 py-2.5 rounded-2xl flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
              activeTab === 'templates' && isDrawerOpen ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <i className="fa-solid fa-table-cells-large text-base" />
            <span>แม่แบบ</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('text'); setIsDrawerOpen(true); }}
            className={`w-14 py-2.5 rounded-2xl flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
              activeTab === 'text' && isDrawerOpen ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <i className="fa-solid fa-font text-base" />
            <span>ข้อความ</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('elements'); setIsDrawerOpen(true); }}
            className={`w-14 py-2.5 rounded-2xl flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
              activeTab === 'elements' && isDrawerOpen ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <i className="fa-solid fa-shapes text-base" />
            <span>รูปทรง</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('codes'); setIsDrawerOpen(true); }}
            className={`w-14 py-2.5 rounded-2xl flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
              activeTab === 'codes' && isDrawerOpen ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <i className="fa-solid fa-qrcode text-base" />
            <span>QR / โค้ด</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('media'); setIsDrawerOpen(true); }}
            className={`w-14 py-2.5 rounded-2xl flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
              activeTab === 'media' && isDrawerOpen ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <i className="fa-solid fa-image text-base" />
            <span>รูปภาพ</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('layers'); setIsDrawerOpen(true); }}
            className={`w-14 py-2.5 rounded-2xl flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
              activeTab === 'layers' && isDrawerOpen ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <i className="fa-solid fa-layer-group text-base" />
            <span>เลเยอร์</span>
          </button>
        </div>

        {/* ─── 2.2 Canva Expandable Drawer (280px) ─── */}
        {isDrawerOpen && (
          <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-10 animate-fade-in">
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {activeTab === 'templates' && 'แม่แบบบัตรสำเร็จรูป (Templates)'}
                {activeTab === 'text' && 'ข้อความ & ฟิลด์ข้อมูล (Text & Fields)'}
                {activeTab === 'elements' && 'รูปทรง & สัญลักษณ์ (Elements)'}
                {activeTab === 'codes' && 'รหัสบาร์โค้ด & QR (Codes)'}
                {activeTab === 'media' && 'รูปถ่ายและตราประจำตัว (Media)'}
                {activeTab === 'layers' && `จัดการเลเยอร์ (${currentElements.length})`}
              </h4>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-6 h-6 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white flex items-center justify-center text-xs"
              >
                <i className="fa-solid fa-chevron-left" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {/* TAB 1: TEMPLATES */}
              {activeTab === 'templates' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-400">เลือกเทมเพลตเพื่อเริ่มต้นการออกแบบได้ทันที</p>
                  
                  {/* Template Card 1 */}
                  <div 
                    onClick={() => {
                      setConfirmModal({
                        title: 'โหลดเทมเพลตมาตรฐานข้าราชการ/ทหาร?',
                        message: 'การโหลดเทมเพลตจะจัดวางโครงสร้างและฟิลด์ข้อมูลมาตรฐาน ชิ้นส่วนปัจจุบันจะถูกแทนที่ (สามารถกดย้อนกลับ Undo ได้)',
                        icon: 'fa-solid fa-medal text-primary-400',
                        confirmText: 'โหลดเทมเพลตนี้',
                        confirmColor: 'bg-primary-600 hover:bg-primary-500',
                        onConfirm: () => {
                          setOrientation('portrait');
                          updateCurrentElements(TEMPLATE_MILITARY_OFFICIAL, true);
                          setSelectedId(null);
                          toast.success('โหลดเทมเพลตข้าราชการ/ทหารเรียบร้อย');
                        }
                      });
                    }}
                    className="p-3 rounded-2xl border border-slate-800 bg-slate-950/60 hover:border-primary-500/60 hover:bg-primary-950/20 cursor-pointer transition group"
                  >
                    <div className="h-24 rounded-xl bg-gradient-to-b from-blue-900 to-slate-900 flex items-center justify-center mb-2 border border-slate-700">
                      <div className="text-center">
                        <i className="fa-solid fa-shield-halved text-amber-400 text-xl mb-1" />
                        <div className="text-[10px] font-bold text-white">บัตรข้าราชการ</div>
                      </div>
                    </div>
                    <div className="font-bold text-xs text-white group-hover:text-primary-400">ข้าราชการ/ทหาร (Standard)</div>
                    <div className="text-[10px] text-slate-500">แนวตั้ง CR80 พร้อมตราสัญลักษณ์</div>
                  </div>

                  {/* Template Card 2 */}
                  <div 
                    onClick={() => {
                      setConfirmModal({
                        title: 'โหลดเทมเพลตทันสมัย (Modern Hi-Tech)?',
                        message: 'การโหลดเทมเพลตจะจัดวางดีไซน์บัตรดิจิทัลแนวตั้งโทนโมเดิร์น พร้อมแถบ QR และโฮโลแกรม (สามารถกดย้อนกลับ Undo ได้)',
                        icon: 'fa-solid fa-gem text-indigo-400',
                        confirmText: 'โหลดเทมเพลตนี้',
                        confirmColor: 'bg-primary-600 hover:bg-primary-500',
                        onConfirm: () => {
                          setOrientation('portrait');
                          updateCurrentElements(TEMPLATE_MODERN_TECH, true);
                          setSelectedId(null);
                          toast.success('โหลดเทมเพลตทันสมัยเรียบร้อย');
                        }
                      });
                    }}
                    className="p-3 rounded-2xl border border-slate-800 bg-slate-950/60 hover:border-primary-500/60 hover:bg-primary-950/20 cursor-pointer transition group"
                  >
                    <div className="h-24 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-slate-900 flex items-center justify-center mb-2 border border-slate-700">
                      <div className="text-center">
                        <i className="fa-solid fa-id-card-clip text-cyan-300 text-xl mb-1" />
                        <div className="text-[10px] font-bold text-white">DIGITAL SMART BADGE</div>
                      </div>
                    </div>
                    <div className="font-bold text-xs text-white group-hover:text-primary-400">ทันสมัย (Modern Hi-Tech)</div>
                    <div className="text-[10px] text-slate-500">แนวตั้ง โทนดิจิทัล พร้อมแถบความปลอดภัย</div>
                  </div>

                  {/* Template Card 3 */}
                  <div 
                    onClick={() => {
                      setConfirmModal({
                        title: 'โหลดเทมเพลตแนวนอน (Executive Landscape)?',
                        message: 'ระบบจะเปลี่ยนขนาดกระดานเป็นแนวนอน CR80 86×54mm พร้อมจัดวางรูปแบบบัตรผู้บริหาร (สามารถกดย้อนกลับ Undo ได้)',
                        icon: 'fa-solid fa-id-card text-sky-400',
                        confirmText: 'โหลดเทมเพลตนี้',
                        confirmColor: 'bg-primary-600 hover:bg-primary-500',
                        onConfirm: () => {
                          setOrientation('landscape');
                          updateCurrentElements(TEMPLATE_LANDSCAPE_EXECUTIVE, true);
                          setSelectedId(null);
                          toast.success('โหลดเทมเพลตแนวนอนเรียบร้อย');
                        }
                      });
                    }}
                    className="p-3 rounded-2xl border border-slate-800 bg-slate-950/60 hover:border-primary-500/60 hover:bg-primary-950/20 cursor-pointer transition group"
                  >
                    <div className="h-20 rounded-xl bg-gradient-to-r from-slate-950 via-slate-850 to-slate-900 flex items-center justify-center mb-2 border border-slate-700">
                      <div className="text-center">
                        <div className="text-[10px] font-bold text-sky-400">EXECUTIVE LANDSCAPE</div>
                      </div>
                    </div>
                    <div className="font-bold text-xs text-white group-hover:text-primary-400">บัตรแนวนอน (Executive)</div>
                    <div className="text-[10px] text-slate-500">แนวนอน 86×54mm มาตรฐานสากล</div>
                  </div>
                </div>
              )}

              {/* TAB 2: TEXT & DYNAMIC FIELDS */}
              {activeTab === 'text' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">ข้อความทั่วไป (Standard Text)</span>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => addElement('text', { content: 'หัวข้อหลัก', fontSize: 16, fontWeight: 'bold' })}
                        className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-950 hover:border-primary-500 hover:text-white transition"
                      >
                        <div className="text-base font-bold text-white">เพิ่มหัวเรื่อง (Heading)</div>
                        <div className="text-[10px] text-slate-500">ขนาด 16px ตัวหนา</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => addElement('text', { content: 'หัวข้อย่อย', fontSize: 12, fontWeight: '500', color: '#64748b' })}
                        className="w-full text-left p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-primary-500 hover:text-white transition"
                      >
                        <div className="text-sm font-semibold text-slate-300">เพิ่มหัวเรื่องย่อย (Subheading)</div>
                        <div className="text-[10px] text-slate-500">ขนาด 12px</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => addElement('text', { content: 'ข้อความเนื้อหา...', fontSize: 9, fontWeight: 'normal', color: '#94a3b8' })}
                        className="w-full text-left p-2 rounded-xl border border-slate-800 bg-slate-950 hover:border-primary-500 hover:text-white transition"
                      >
                        <div className="text-xs text-slate-400">เพิ่มเนื้อหาข้อความ (Body text)</div>
                        <div className="text-[10px] text-slate-500">ขนาด 9px</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider block mb-2">⚡ ฟิลด์ดึงข้อมูลบุคลากรอัตโนมัติ</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => addElement('text', { field: 'fullName', fontSize: 14, fontWeight: 'bold' })}
                        className="p-2 rounded-xl border border-slate-800 bg-slate-950 hover:border-primary-500 hover:bg-primary-950/30 text-left text-xs text-slate-300 transition"
                      >
                        <i className="fa-solid fa-user-tag text-primary-400 mr-1.5" />
                        <span>ชื่อ-นามสกุล</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => addElement('text', { field: 'position', fontSize: 10, color: '#64748b' })}
                        className="p-2 rounded-xl border border-slate-800 bg-slate-950 hover:border-primary-500 hover:bg-primary-950/30 text-left text-xs text-slate-300 transition"
                      >
                        <i className="fa-solid fa-briefcase text-sky-400 mr-1.5" />
                        <span>ตำแหน่ง</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => addElement('text', { field: 'department', fontSize: 9, color: '#94a3b8' })}
                        className="p-2 rounded-xl border border-slate-800 bg-slate-950 hover:border-primary-500 hover:bg-primary-950/30 text-left text-xs text-slate-300 transition"
                      >
                        <i className="fa-solid fa-building text-amber-400 mr-1.5" />
                        <span>สังกัด/หน่วยงาน</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => addElement('ribbon', { field: 'rank', dynamicBg: true })}
                        className="p-2 rounded-xl border border-slate-800 bg-slate-950 hover:border-primary-500 hover:bg-primary-950/30 text-left text-xs text-slate-300 transition"
                      >
                        <i className="fa-solid fa-medal text-rose-400 mr-1.5" />
                        <span>ยศ/ประเภท</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => addElement('text', { field: 'badgeNo', fontSize: 10, fontWeight: 'bold' })}
                        className="p-2 rounded-xl border border-slate-800 bg-slate-950 hover:border-primary-500 hover:bg-primary-950/30 text-left text-xs text-slate-300 transition"
                      >
                        <i className="fa-solid fa-hashtag text-indigo-400 mr-1.5" />
                        <span>เลขบัตร</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => addElement('text', { field: 'bloodType', fontSize: 9, color: '#dc2626' })}
                        className="p-2 rounded-xl border border-slate-800 bg-slate-950 hover:border-primary-500 hover:bg-primary-950/30 text-left text-xs text-slate-300 transition"
                      >
                        <i className="fa-solid fa-droplet text-rose-500 mr-1.5" />
                        <span>หมู่โลหิต</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ELEMENTS & SHAPES */}
              {activeTab === 'elements' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">รูปทรงพื้นฐาน (Shapes)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => addElement('rect')}
                        className="p-3 rounded-xl border border-slate-800 bg-slate-950 hover:border-primary-500 flex flex-col items-center gap-1.5 text-xs text-slate-300 transition group"
                      >
                        <div className="w-8 h-6 rounded bg-slate-800 border border-slate-700 group-hover:border-primary-500" />
                        <span>กล่องสี่เหลี่ยม</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => addElement('circle')}
                        className="p-3 rounded-xl border border-slate-800 bg-slate-950 hover:border-primary-500 flex flex-col items-center gap-1.5 text-xs text-slate-300 transition group"
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 group-hover:border-primary-500" />
                        <span>วงกลม/วงรี</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => addElement('line')}
                        className="p-3 rounded-xl border border-slate-800 bg-slate-950 hover:border-primary-500 flex flex-col items-center gap-1.5 text-xs text-slate-300 transition group"
                      >
                        <div className="w-10 h-0.5 bg-slate-600 group-hover:bg-primary-500 my-3" />
                        <span>เส้นคั่น</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => addElement('ribbon')}
                        className="p-3 rounded-xl border border-slate-800 bg-slate-950 hover:border-primary-500 flex flex-col items-center gap-1.5 text-xs text-slate-300 transition group"
                      >
                        <div className="w-10 h-4 rounded-full bg-blue-900 border border-blue-700 group-hover:border-primary-500" />
                        <span>แถบป้ายมน</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">องค์ประกอบความปลอดภัย</span>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => addElement('hologram')}
                        className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-cyan-500 text-left flex items-center gap-2.5 transition"
                      >
                        <i className="fa-solid fa-wand-magic-sparkles text-cyan-400 text-base" />
                        <div>
                          <div className="text-xs font-bold text-white">แถบโฮโลแกรม (Hologram)</div>
                          <div className="text-[10px] text-slate-500">ป้องกันการปลอมแปลง</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => addElement('emblem')}
                        className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-amber-500 text-left flex items-center gap-2.5 transition"
                      >
                        <i className="fa-solid fa-shield-halved text-amber-400 text-base" />
                        <div>
                          <div className="text-xs font-bold text-white">ตราสัญลักษณ์ / ตราครุฑ</div>
                          <div className="text-[10px] text-slate-500">สัญลักษณ์ทางราชการ</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CODES */}
              {activeTab === 'codes' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-400">แทรกโค้ดสำหรับสแกนและตรวจสอบข้อมูลบัตร</p>
                  
                  <button
                    type="button"
                    onClick={() => addElement('qr')}
                    className="w-full p-3 rounded-2xl border border-slate-800 bg-slate-950 hover:border-primary-500 text-left flex items-center gap-3 transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1">
                      <QRCodeCanvas value="DEMO" size={32} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">QR Code ดิจิทัล</div>
                      <div className="text-[10px] text-slate-500">สแกนตรวจสอบความถูกต้องผ่านระบบ</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => addElement('barcode')}
                    className="w-full p-3 rounded-2xl border border-slate-800 bg-slate-950 hover:border-primary-500 text-left flex items-center gap-3 transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1">
                      <i className="fa-solid fa-barcode text-slate-900 text-xl" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Barcode 128</div>
                      <div className="text-[10px] text-slate-500">สแกนรหัสประจำตัวพนักงาน</div>
                    </div>
                  </button>
                </div>
              )}

              {/* TAB 5: MEDIA & PHOTOS */}
              {activeTab === 'media' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-400">กรอบรูปถ่ายบุคลากร</p>
                  
                  <button
                    type="button"
                    onClick={() => addElement('image', { field: 'avatar', width: 44, height: 32, borderRadius: 8 })}
                    className="w-full p-3 rounded-2xl border border-slate-800 bg-slate-950 hover:border-primary-500 text-left flex items-center gap-3 transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                      <i className="fa-solid fa-user-tie text-xl" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">กรอบรูปถ่าย (สี่เหลี่ยมมน)</div>
                      <div className="text-[10px] text-slate-500">ดึงรูปถ่ายประจำตัวอัตโนมัติ</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => addElement('image', { field: 'avatar', width: 34, height: 26, borderRadius: 100 })}
                    className="w-full p-3 rounded-2xl border border-slate-800 bg-slate-950 hover:border-primary-500 text-left flex items-center gap-3 transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                      <i className="fa-solid fa-user-tie text-xl" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">กรอบรูปถ่าย (วงกลม)</div>
                      <div className="text-[10px] text-slate-500">สไตล์โมเดิร์น</div>
                    </div>
                  </button>
                </div>
              )}

              {/* TAB 6: LAYERS */}
              {activeTab === 'layers' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>ลำดับบนกระดาน (บนสุด ➔ ล่างสุด)</span>
                  </div>

                  {currentElements.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">ยังไม่มีชิ้นส่วนบนกระดาน</div>
                  ) : (
                    [...currentElements].sort((a, b) => b.zIndex - a.zIndex).map((el, idx) => (
                      <div
                        key={el.id}
                        onClick={() => setSelectedId(el.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition ${
                          selectedId === el.id 
                            ? 'border-primary-500 bg-primary-950/40 text-white' 
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-[10px] font-mono text-slate-500 w-4">{idx + 1}</span>
                          <i className={`text-xs ${
                            el.type === 'text' ? 'fa-solid fa-font text-primary-400' :
                            el.type === 'rect' ? 'fa-solid fa-vector-square text-sky-400' :
                            el.type === 'circle' ? 'fa-solid fa-circle text-emerald-400' :
                            el.type === 'image' ? 'fa-solid fa-image text-purple-400' :
                            el.type === 'qr' ? 'fa-solid fa-qrcode text-indigo-400' :
                            el.type === 'barcode' ? 'fa-solid fa-barcode text-slate-400' :
                            el.type === 'hologram' ? 'fa-solid fa-wand-magic-sparkles text-cyan-400' : 'fa-solid fa-shapes text-amber-400'
                          }`} />
                          <span className="text-xs truncate font-medium">
                            {el.content || el.field || el.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              const newEls = currentElements.map(item => item.id === el.id ? { ...item, hidden: !item.hidden } : item);
                              updateCurrentElements(newEls, true);
                            }}
                            className="p-1 text-slate-500 hover:text-white text-xs"
                            title={el.hidden ? 'เปิดแสดงผล' : 'ซ่อน'}
                          >
                            <i className={`fa-solid ${el.hidden ? 'fa-eye-slash text-slate-600' : 'fa-eye'}`} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const newEls = currentElements.map(item => item.id === el.id ? { ...item, locked: !item.locked } : item);
                              updateCurrentElements(newEls, true);
                            }}
                            className="p-1 text-slate-500 hover:text-white text-xs"
                            title={el.locked ? 'ปลดล็อค' : 'ล็อค'}
                          >
                            <i className={`fa-solid ${el.locked ? 'fa-lock text-amber-400' : 'fa-lock-open'}`} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── 2.3 Canva Interactive Stage (Center Workspace) ─── */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto bg-slate-950 relative">
          
          {/* Coordinates readout */}
          {selectedElement && (
            <div className="absolute top-4 left-4 text-[11px] font-mono bg-slate-900/90 backdrop-blur px-3 py-1 rounded-xl border border-slate-800 text-slate-300 z-10 flex items-center gap-3">
              <span>X: <b>{Math.round(selectedElement.x)}%</b></span>
              <span>Y: <b>{Math.round(selectedElement.y)}%</b></span>
              <span>W: <b>{Math.round(selectedElement.width)}%</b></span>
              <span>H: <b>{Math.round(selectedElement.height)}%</b></span>
            </div>
          )}

          {/* Canvas Wrapper with Zoom Transform */}
          <div 
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center', transition: 'transform 0.15s ease-out' }}
            className="relative"
          >
            {/* Alignment Smart Guide Lines */}
            {guideLines.x && (
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-primary-400 z-50 pointer-events-none" />
            )}
            {guideLines.y && (
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary-400 z-50 pointer-events-none" />
            )}

            {/* Outer ID Card Canvas Frame */}
            <div 
              ref={canvasRef}
              className="relative bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-700 select-none transition-all"
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                backgroundImage: showGrid 
                  ? 'radial-gradient(circle, #cbd5e1 1.2px, transparent 1.2px)' 
                  : 'none',
                backgroundSize: '16px 16px',
              }}
              onClick={(e) => {
                if (e.target === canvasRef.current) setSelectedId(null);
              }}
            >
              {currentElements.map(renderElement)}
            </div>

            {/* Print Dimensions & Spec Badge */}
            <div className="text-center mt-3 text-[10px] text-slate-500 font-mono flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>CR80 Standard {orientation === 'portrait' ? '54 × 85.6 mm' : '85.6 × 54 mm'} • 300 DPI Vector Ready</span>
            </div>
          </div>
        </div>

        {/* ─── 2.4 Canva Right Properties Inspector ─── */}
        <div className="w-72 bg-slate-900 border-l border-slate-800 p-4 shrink-0 overflow-y-auto max-h-[720px] scrollbar-thin">
          {selectedElement ? (
            <div className="space-y-4 animate-fade-in text-slate-200">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  ปรับแต่งคุณสมบัติ ({selectedElement.type})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">z-index: {selectedElement.zIndex}</span>
              </div>

              {/* Data Binding Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  ⚡ ผูกข้อมูลอัตโนมัติ (Data Field)
                </label>
                <select
                  value={selectedElement.field}
                  onChange={(e) => updateSelected({ field: e.target.value as FieldMapping })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-primary-500 cursor-pointer"
                >
                  <option value="static">กำหนดข้อความเอง (Static)</option>
                  <option value="fullName">ยศ ชื่อ นามสกุล (Full Name)</option>
                  <option value="firstName">ชื่อ (First Name)</option>
                  <option value="lastName">นามสกุล (Last Name)</option>
                  <option value="prefix">ยศ / คำนำหน้า (Prefix)</option>
                  <option value="position">ตำแหน่งหน้าที่ (Position)</option>
                  <option value="department">หน่วยงาน / สังกัด (Department)</option>
                  <option value="subDepartment">แผนก / ฝ่าย (Sub-department)</option>
                  <option value="rank">ประเภทกำลังพล (Personnel Type)</option>
                  <option value="badgeNo">หมายเลขประจำตัว (Badge No)</option>
                  <option value="citizenId">เลขบัตรประชาชน 13 หลัก</option>
                  <option value="bloodType">หมู่โลหิต (Blood Group)</option>
                  <option value="avatar">รูปถ่ายประจำตัว (Profile Avatar)</option>
                  <option value="issueDate">วันออกบัตร (Issue Date)</option>
                  <option value="expireDate">วันหมดอายุ (Expire Date)</option>
                </select>
              </div>

              {/* Static Text Input */}
              {selectedElement.field === 'static' && (selectedElement.type === 'text' || selectedElement.type === 'ribbon') && (
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">ข้อความ</label>
                  <input
                    type="text"
                    value={selectedElement.content || ''}
                    onChange={(e) => updateSelected({ content: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-primary-500"
                    placeholder="พิมพ์ข้อความ..."
                  />
                </div>
              )}

              {/* Alignment Grid */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5">จัดตำแหน่งชิดขอบ (Align to Canvas)</label>
                <div className="grid grid-cols-6 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button type="button" onClick={() => alignSelected('left')} title="ชิดซ้าย" className="py-1 rounded text-xs hover:bg-slate-800 text-slate-400 hover:text-white"><i className="fa-solid fa-align-left" /></button>
                  <button type="button" onClick={() => alignSelected('center')} title="กึ่งกลางแนวนอน" className="py-1 rounded text-xs hover:bg-slate-800 text-slate-400 hover:text-white"><i className="fa-solid fa-align-center" /></button>
                  <button type="button" onClick={() => alignSelected('right')} title="ชิดขวา" className="py-1 rounded text-xs hover:bg-slate-800 text-slate-400 hover:text-white"><i className="fa-solid fa-align-right" /></button>
                  <button type="button" onClick={() => alignSelected('top')} title="ชิดบน" className="py-1 rounded text-xs hover:bg-slate-800 text-slate-400 hover:text-white"><i className="fa-solid fa-arrow-up-to-line" /></button>
                  <button type="button" onClick={() => alignSelected('middle')} title="กึ่งกลางแนวตั้ง" className="py-1 rounded text-xs hover:bg-slate-800 text-slate-400 hover:text-white"><i className="fa-solid fa-arrows-up-down" /></button>
                  <button type="button" onClick={() => alignSelected('bottom')} title="ชิดล่าง" className="py-1 rounded text-xs hover:bg-slate-800 text-slate-400 hover:text-white"><i className="fa-solid fa-arrow-down-to-line" /></button>
                </div>
              </div>

              {/* Layer Ordering */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5">ลำดับเลเยอร์ (Layer Order)</label>
                <div className="grid grid-cols-4 gap-1">
                  <button type="button" onClick={() => reorderLayer('front')} title="หน้าสุด" className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded-lg text-[10px] text-slate-300 flex flex-col items-center gap-0.5 border border-slate-800">
                    <i className="fa-solid fa-layer-group text-xs" /><span>หน้าสุด</span>
                  </button>
                  <button type="button" onClick={() => reorderLayer('forward')} title="ขึ้น 1 ชั้น" className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded-lg text-[10px] text-slate-300 flex flex-col items-center gap-0.5 border border-slate-800">
                    <i className="fa-solid fa-arrow-up text-xs" /><span>ขึ้น 1</span>
                  </button>
                  <button type="button" onClick={() => reorderLayer('backward')} title="ลง 1 ชั้น" className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded-lg text-[10px] text-slate-300 flex flex-col items-center gap-0.5 border border-slate-800">
                    <i className="fa-solid fa-arrow-down text-xs" /><span>ลง 1</span>
                  </button>
                  <button type="button" onClick={() => reorderLayer('back')} title="หลังสุด" className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded-lg text-[10px] text-slate-300 flex flex-col items-center gap-0.5 border border-slate-800">
                    <i className="fa-solid fa-bars-staggered text-xs" /><span>หลังสุด</span>
                  </button>
                </div>
              </div>

              {/* Borders & Radius */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">เส้นขอบ & ความโค้งมน (Borders)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">ความหนาเส้น (px)</label>
                    <input
                      type="number"
                      min="0"
                      max="16"
                      value={selectedElement.borderWidth || 0}
                      onChange={(e) => updateSelected({ borderWidth: Number(e.target.value) })}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">ความโค้งมน (px)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedElement.borderRadius || 0}
                      onChange={(e) => updateSelected({ borderRadius: Number(e.target.value) })}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Effects & Opacity */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">เงาและความโปร่งแสง (Opacity)</span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>ความทึบแสง</span>
                    <span className="font-mono">{selectedElement.opacity ?? 100}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={selectedElement.opacity ?? 100}
                    onChange={(e) => updateSelected({ opacity: Number(e.target.value) })}
                    className="w-full accent-primary-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 text-slate-600 flex items-center justify-center mx-auto text-xl border border-slate-800">
                <i className="fa-solid fa-arrow-pointer" />
              </div>
              <h5 className="font-bold text-slate-400 text-xs">เลือกชิ้นส่วนบนบัตร</h5>
              <p className="text-[11px] text-slate-500 max-w-[180px] mx-auto leading-relaxed">
                คลิกที่ตัวอักษร กรอบรูป หรือรูปทรง เพื่อปรับแต่งค่าในแถบนี้
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Confirmation Modal ─── */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0">
                <i className={confirmModal.icon || 'fa-solid fa-triangle-exclamation text-amber-400'} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white">{confirmModal.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{confirmModal.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition ${confirmModal.confirmColor || 'bg-primary-600 hover:bg-primary-500'}`}
              >
                {confirmModal.confirmText || 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
