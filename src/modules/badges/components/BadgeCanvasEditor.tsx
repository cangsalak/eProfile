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
  dynamicBg?: boolean;
  dynamicText?: boolean;
  dynamicBorder?: boolean;
}

export interface CanvasConfig {
  orientation: 'portrait' | 'landscape';
  backgroundColor: string;
  backgroundGradient?: boolean;
  backgroundGradientFrom?: string;
  backgroundGradientTo?: string;
  backgroundGradientDirection?: 'to-b' | 'to-r' | 'to-br' | 'to-tr';
  elements: CanvasElement[];
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
  // Front / Back canvas side state
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    const list = initialElements && initialElements.length > 0 ? initialElements : TEMPLATE_MILITARY_OFFICIAL;
    return list.some(el => el.id.startsWith('ls-')) ? 'landscape' : 'portrait';
  });
  const [zoom, setZoom] = useState<number>(100);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);

  // Front elements & history
  const [frontElements, setFrontElements] = useState<CanvasElement[]>(
    initialElements && initialElements.length > 0 ? initialElements : TEMPLATE_MILITARY_OFFICIAL
  );
  // Back elements & history
  const [backElements, setBackElements] = useState<CanvasElement[]>(
    initialBackElements && initialBackElements.length > 0 ? initialBackElements : TEMPLATE_BACK_STANDARD
  );

  // History stack for Undo / Redo
  const [history, setHistory] = useState<{ front: CanvasElement[][]; back: CanvasElement[][] }>({
    front: [initialElements && initialElements.length > 0 ? initialElements : TEMPLATE_MILITARY_OFFICIAL],
    back: [initialBackElements && initialBackElements.length > 0 ? initialBackElements : TEMPLATE_BACK_STANDARD]
  });
  const [historyIndex, setHistoryIndex] = useState<{ front: number; back: number }>({ front: 0, back: 0 });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Modern Confirmation Modal state
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

  // Push to history
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

  // Keyboard shortcut listener for Undo/Redo & Delete
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, handleUndo, handleRedo, deleteSelected]);

  // ─── Interaction Handlers (Drag & 8-Point Resize) ───────────────────────────
  const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    const elem = currentElements.find(el => el.id === id);
    if (!elem || elem.locked) return;

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
    if (!elem || elem.locked) return;

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
      dxPercent = Math.round(dxPercent * 2) / 2; // snap to 0.5%
      dyPercent = Math.round(dyPercent * 2) / 2;
    }

    if (isInteracting.current === 'drag') {
      const newElements = currentElements.map(el => {
        if (el.id === selectedId) {
          const nextX = Math.max(0, Math.min(100 - el.width, dragStart.current.elemX + dxPercent));
          const nextY = Math.max(0, Math.min(100 - el.height, dragStart.current.elemY + dyPercent));
          return { ...el, x: nextX, y: nextY };
        }
        return el;
      });
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
    const elem = currentElements.find(el => el.id === selectedId);
    if (!elem) return;

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
      x: 10,
      y: 20,
      width: 80,
      height: 10,
      zIndex: maxZ,
      ...customProps
    };

    if (type === 'text') {
      defaultEl = {
        ...defaultEl,
        content: 'ข้อความใหม่',
        fontSize: 12,
        color: '#0f172a',
        fontWeight: 'bold',
        textAlign: 'center'
      };
    } else if (type === 'rect') {
      defaultEl = {
        ...defaultEl,
        height: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 4
      };
    } else if (type === 'circle') {
      defaultEl = {
        ...defaultEl,
        width: 30,
        height: 20,
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
        fontSize: 9,
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
        width: 30,
        height: 20,
        backgroundColor: '#ffffff',
        borderRadius: 4,
        zIndex: 5
      };
    } else if (type === 'barcode') {
      defaultEl = {
        ...defaultEl,
        field: 'badgeNo',
        width: 60,
        height: 16,
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

  // ─── Render Canvas Element Inside Visual Stage ─────────────────────────────
  const renderElement = (el: CanvasElement) => {
    const isSelected = selectedId === el.id;

    // Field content mapping preview
    let content: React.ReactNode = el.content;
    if (el.field === 'fullName') content = 'ยศ ชื่อ นามสกุล';
    else if (el.field === 'firstName') content = 'ชื่อจริง';
    else if (el.field === 'lastName') content = 'นามสกุล';
    else if (el.field === 'prefix') content = 'ยศ/คำนำหน้า';
    else if (el.field === 'position') content = 'ตำแหน่งหน้าที่';
    else if (el.field === 'department') content = 'สำนัก/กอง/หน่วยงาน';
    else if (el.field === 'subDepartment') content = 'แผนก/ฝ่าย';
    else if (el.field === 'rank') content = 'นายทหารสัญญาบัตร';
    else if (el.field === 'badgeNo') content = 'ID-12345678';
    else if (el.field === 'citizenId') content = '1-2345-67890-12-3';
    else if (el.field === 'bloodType') content = 'หมู่โลหิต O';
    else if (el.field === 'issueDate') content = 'วันออกบัตร: 01 ม.ค. 67';
    else if (el.field === 'expireDate') content = 'วันหมดอายุ: 31 ธ.ค. 70';

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
          <QRCodeCanvas value="ID-12345678" size={100} style={{ width: '100%', height: '100%' }} />
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
          <span className="text-[7px] font-mono tracking-widest text-slate-800 font-bold mt-0.5">ID-12345678</span>
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

        {/* ─── 8 Direct Visual Resize Handles on Selection ─── */}
        {isSelected && !el.locked && (
          <>
            {/* Top-Left */}
            <div 
              onMouseDown={(e) => handleResizeHandleMouseDown(e, 'tl')}
              className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-xs cursor-nwse-resize shadow z-50 hover:scale-125 transition-transform" 
            />
            {/* Top-Center */}
            <div 
              onMouseDown={(e) => handleResizeHandleMouseDown(e, 't')}
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-600 rounded-xs cursor-ns-resize shadow z-50 hover:scale-125 transition-transform" 
            />
            {/* Top-Right */}
            <div 
              onMouseDown={(e) => handleResizeHandleMouseDown(e, 'tr')}
              className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-xs cursor-nesw-resize shadow z-50 hover:scale-125 transition-transform" 
            />
            {/* Right-Center */}
            <div 
              onMouseDown={(e) => handleResizeHandleMouseDown(e, 'r')}
              className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-xs cursor-ew-resize shadow z-50 hover:scale-125 transition-transform" 
            />
            {/* Bottom-Right */}
            <div 
              onMouseDown={(e) => handleResizeHandleMouseDown(e, 'br')}
              className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-xs cursor-nwse-resize shadow z-50 hover:scale-125 transition-transform" 
            />
            {/* Bottom-Center */}
            <div 
              onMouseDown={(e) => handleResizeHandleMouseDown(e, 'b')}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-600 rounded-xs cursor-ns-resize shadow z-50 hover:scale-125 transition-transform" 
            />
            {/* Bottom-Left */}
            <div 
              onMouseDown={(e) => handleResizeHandleMouseDown(e, 'bl')}
              className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-xs cursor-nesw-resize shadow z-50 hover:scale-125 transition-transform" 
            />
            {/* Left-Center */}
            <div 
              onMouseDown={(e) => handleResizeHandleMouseDown(e, 'l')}
              className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-xs cursor-ew-resize shadow z-50 hover:scale-125 transition-transform" 
            />
          </>
        )}
      </div>
    );
  };

  const canvasWidth = orientation === 'landscape' ? 430 : 270;
  const canvasHeight = orientation === 'landscape' ? 270 : 430;

  return (
    <div 
      className="flex flex-col w-full bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden font-prompt"
      onMouseMove={handleMouseMove} 
      onMouseUp={handleMouseUp} 
      onMouseLeave={handleMouseUp}
    >
      {/* ─── Top Studio Toolbar ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-700 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-2">
          {/* Side Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { setActiveSide('front'); setSelectedId(null); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSide === 'front' 
                  ? 'bg-primary-600 text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-id-card"></i>
              <span>ด้านหน้าบัตร</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveSide('back'); setSelectedId(null); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSide === 'back' 
                  ? 'bg-primary-600 text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-rotate"></i>
              <span>ด้านหลังบัตร</span>
            </button>
          </div>

          {/* Orientation Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setOrientation('portrait')}
              title="แนวตั้ง (Standard Portrait 54x86mm)"
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                orientation === 'portrait' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <i className="fa-solid fa-mobile-screen mr-1"></i> แนวตั้ง
            </button>
            <button
              type="button"
              onClick={() => setOrientation('landscape')}
              title="แนวนอน (Standard Landscape 86x54mm)"
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                orientation === 'landscape' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <i className="fa-solid fa-tablet-screen-button rotate-90 mr-1"></i> แนวนอน
            </button>
          </div>
        </div>

        {/* Center / Utility controls */}
        <div className="flex items-center gap-1.5">
          {/* Undo / Redo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex[activeSide] <= 0}
            title="ย้อนกลับ (Ctrl+Z)"
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 flex items-center justify-center text-xs transition-colors"
          >
            <i className="fa-solid fa-arrow-rotate-left"></i>
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex[activeSide] >= history[activeSide].length - 1}
            title="ทำซ้ำ (Ctrl+Y)"
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 flex items-center justify-center text-xs transition-colors"
          >
            <i className="fa-solid fa-arrow-rotate-right"></i>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Grid & Snap */}
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            title="แสดง/ซ่อนเส้นตาราง Grid"
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors ${
              showGrid ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400 border border-primary-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
            }`}
          >
            <i className="fa-solid fa-border-all"></i>
          </button>
          <button
            type="button"
            onClick={() => setSnapToGrid(!snapToGrid)}
            title="ดูดติดเส้นตาราง (Snap to Grid)"
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors ${
              snapToGrid ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400 border border-primary-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
            }`}
          >
            <i className="fa-solid fa-magnet"></i>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Zoom */}
          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
            <button 
              type="button" 
              onClick={() => setZoom(prev => Math.max(70, prev - 15))}
              className="hover:text-primary-600 font-bold px-1"
            >-</button>
            <span className="font-mono text-[11px] min-w-[36px] text-center">{zoom}%</span>
            <button 
              type="button" 
              onClick={() => setZoom(prev => Math.min(160, prev + 15))}
              className="hover:text-primary-600 font-bold px-1"
            >+</button>
          </div>
        </div>

        {/* Quick Presets Menu */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setConfirmModal({
                title: 'ยืนยันการล้างกระดานออกแบบ?',
                message: 'ชิ้นส่วนและรูปวาดทั้งหมดบนกระดานด้านนี้จะถูกล้างออก คุณสามารถกดย้อนกลับ (Undo) ได้หากต้องการกู้คืน',
                icon: 'fa-solid fa-eraser text-rose-500',
                confirmText: 'ยืนยันล้างกระดาน',
                confirmColor: 'bg-rose-600 hover:bg-rose-500',
                onConfirm: () => {
                  updateCurrentElements([], true);
                  setSelectedId(null);
                  toast.success('ล้างกระดานเรียบร้อยแล้ว');
                }
              });
            }}
            className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors"
          >
            <i className="fa-solid fa-eraser mr-1"></i> ล้างกระดาน
          </button>
        </div>
      </div>

      {/* ─── Main Studio Area ──────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-[560px]">
        
        {/* Left Side: Element Toolbox */}
        <div className="w-full lg:w-64 bg-white dark:bg-slate-800/90 border-r border-slate-200 dark:border-slate-700 p-4 space-y-4 shrink-0">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">เพิ่มชิ้นส่วนวาดภาพ</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => addElement('text', { content: 'หัวข้อใหม่', fontSize: 14, fontWeight: 'bold' })}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-primary-500 hover:text-primary-600 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all group"
              >
                <i className="fa-solid fa-font text-primary-500 group-hover:scale-110 transition-transform"></i>
                <span>ข้อความ</span>
              </button>

              <button
                type="button"
                onClick={() => addElement('rect')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-primary-500 hover:text-primary-600 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all group"
              >
                <i className="fa-solid fa-vector-square text-sky-500 group-hover:scale-110 transition-transform"></i>
                <span>กล่อง/กรอบ</span>
              </button>

              <button
                type="button"
                onClick={() => addElement('circle')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-primary-500 hover:text-primary-600 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all group"
              >
                <i className="fa-solid fa-circle text-emerald-500 group-hover:scale-110 transition-transform"></i>
                <span>วงกลม/วงรี</span>
              </button>

              <button
                type="button"
                onClick={() => addElement('line')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-primary-500 hover:text-primary-600 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all group"
              >
                <i className="fa-solid fa-minus text-amber-500 group-hover:scale-110 transition-transform"></i>
                <span>เส้นคั่น</span>
              </button>

              <button
                type="button"
                onClick={() => addElement('ribbon')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-primary-500 hover:text-primary-600 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all group"
              >
                <i className="fa-solid fa-ribbon text-rose-500 group-hover:scale-110 transition-transform"></i>
                <span>แถบป้ายมน</span>
              </button>

              <button
                type="button"
                onClick={() => addElement('image', { field: 'avatar', width: 40, height: 28, borderRadius: 8 })}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-primary-500 hover:text-primary-600 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all group"
              >
                <i className="fa-solid fa-image-portrait text-purple-500 group-hover:scale-110 transition-transform"></i>
                <span>รูปถ่าย</span>
              </button>

              <button
                type="button"
                onClick={() => addElement('emblem')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-primary-500 hover:text-primary-600 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all group"
              >
                <i className="fa-solid fa-shield-halved text-amber-500 group-hover:scale-110 transition-transform"></i>
                <span>ตราสัญลักษณ์</span>
              </button>

              <button
                type="button"
                onClick={() => addElement('hologram')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-primary-500 hover:text-primary-600 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all group"
              >
                <i className="fa-solid fa-wand-magic-sparkles text-cyan-500 group-hover:scale-110 transition-transform"></i>
                <span>โฮโลแกรม</span>
              </button>

              <button
                type="button"
                onClick={() => addElement('qr')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-primary-500 hover:text-primary-600 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all group"
              >
                <i className="fa-solid fa-qrcode text-indigo-500 group-hover:scale-110 transition-transform"></i>
                <span>QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => addElement('barcode')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-primary-500 hover:text-primary-600 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all group"
              >
                <i className="fa-solid fa-barcode text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform"></i>
                <span>Barcode</span>
              </button>
            </div>
          </div>

          {/* Quick Prebuilt Templates */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">ชุดเทมเพลตสำเร็จรูป</span>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setConfirmModal({
                    title: 'โหลดเทมเพลตข้าราชการ/ทหาร (Official Military)?',
                    message: 'ระบบจะนำเข้าโครงสร้างบัตรมาตรฐานข้าราชการ/ทหาร พร้อมตราสัญลักษณ์และช่องข้อมูลครบถ้วน ชิ้นส่วนปัจจุบันจะถูกแทนที่ (สามารถกดย้อนกลับได้)',
                    icon: 'fa-solid fa-medal text-primary-500',
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
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">🎖️ ข้าราชการ/ทหาร (Standard)</span>
                <i className="fa-solid fa-arrow-right text-[10px] text-slate-400"></i>
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfirmModal({
                    title: 'โหลดเทมเพลตทันสมัย (Modern Hi-Tech)?',
                    message: 'ระบบจะนำเข้าดีไซน์บัตรดิจิทัลแนวตั้งโทนโมเดิร์น พร้อมแถบ QR Code และโฮโลแกรม ชิ้นส่วนปัจจุบันจะถูกแทนที่ (สามารถกดย้อนกลับได้)',
                    icon: 'fa-solid fa-gem text-indigo-500',
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
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">💎 ทันสมัย (Modern Hi-Tech)</span>
                <i className="fa-solid fa-arrow-right text-[10px] text-slate-400"></i>
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfirmModal({
                    title: 'โหลดเทมเพลตแนวนอน (Executive Landscape)?',
                    message: 'ระบบจะเปลี่ยนขนาดกระดานเป็นแนวนอน 86×54mm พร้อมจัดวางรูปแบบบัตรผู้บริหาร ชิ้นส่วนปัจจุบันจะถูกแทนที่ (สามารถกดย้อนกลับได้)',
                    icon: 'fa-solid fa-id-card text-sky-500',
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
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">📇 บัตรแนวนอน (Landscape)</span>
                <i className="fa-solid fa-arrow-right text-[10px] text-slate-400"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Center: Visual Interactive Studio Board */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto bg-slate-200/60 dark:bg-slate-950/60 relative">
          
          {/* Real-time coordinates readout */}
          {selectedElement && (
            <div className="absolute top-3 left-4 text-[11px] font-mono bg-white/90 dark:bg-slate-800/90 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-2 text-slate-600 dark:text-slate-300 z-10">
              <span>X: <b>{Math.round(selectedElement.x)}%</b></span>
              <span>Y: <b>{Math.round(selectedElement.y)}%</b></span>
              <span>W: <b>{Math.round(selectedElement.width)}%</b></span>
              <span>H: <b>{Math.round(selectedElement.height)}%</b></span>
            </div>
          )}

          {/* Canvas Wrapper */}
          <div 
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center', transition: 'transform 0.15s ease-out' }}
            className="relative"
          >
            {/* Outer ID Card Canvas Frame */}
            <div 
              ref={canvasRef}
              className="relative bg-white shadow-2xl rounded-xl overflow-hidden border-2 border-slate-300 dark:border-slate-600 transition-all select-none"
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                backgroundImage: showGrid 
                  ? 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)' 
                  : 'none',
                backgroundSize: '16px 16px',
              }}
              onClick={(e) => {
                if (e.target === canvasRef.current) setSelectedId(null);
              }}
            >
              {currentElements.map(renderElement)}
            </div>

            {/* Print Dimensions Reference */}
            <div className="text-center mt-2 text-[10px] text-slate-400 font-mono">
              CR80 Standard {orientation === 'portrait' ? '54 × 86 mm' : '86 × 54 mm'} • 300 DPI Ready
            </div>
          </div>
        </div>

        {/* Right Side: Properties & Styling Inspector */}
        <div className="w-full lg:w-80 bg-white dark:bg-slate-800/95 border-l border-slate-200 dark:border-slate-700 p-4 shrink-0 overflow-y-auto max-h-[720px]">
          {selectedElement ? (
            <div className="space-y-4 animate-fade-in">
              {/* Header & Delete/Duplicate */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">
                    <i className="fa-solid fa-sliders"></i>
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">
                    ปรับแต่ง ({selectedElement.type})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={duplicateSelected}
                    title="ทำซ้ำ (Duplicate)"
                    className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs flex items-center justify-center"
                  >
                    <i className="fa-regular fa-copy"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelected({ locked: !selectedElement.locked })}
                    title={selectedElement.locked ? 'ปลดล็อค' : 'ล็อคชิ้นส่วน'}
                    className={`w-7 h-7 rounded text-xs flex items-center justify-center ${selectedElement.locked ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}
                  >
                    <i className={`fa-solid ${selectedElement.locked ? 'fa-lock' : 'fa-lock-open'}`}></i>
                  </button>
                  <button
                    type="button"
                    onClick={deleteSelected}
                    title="ลบชิ้นส่วน (Delete)"
                    className="w-7 h-7 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 text-xs flex items-center justify-center"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>

              {/* Data Binding / Content Field */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  ผูกข้อมูลอัตโนมัติ (Data Field)
                </label>
                <select
                  value={selectedElement.field}
                  onChange={(e) => updateSelected({ field: e.target.value as FieldMapping })}
                  className="form-select text-xs py-1.5"
                >
                  <option value="static">กำหนดข้อความ/รูปทรงเอง (Static)</option>
                  <option value="fullName">ยศ ชื่อ นามสกุล (Full Name)</option>
                  <option value="firstName">ชื่อ (First Name)</option>
                  <option value="lastName">นามสกุล (Last Name)</option>
                  <option value="prefix">ยศ / คำนำหน้า (Prefix / Rank)</option>
                  <option value="position">ตำแหน่งหน้าที่ (Position)</option>
                  <option value="department">หน่วยงาน / สังกัด (Department)</option>
                  <option value="subDepartment">แผนก / ฝ่าย (Sub-department)</option>
                  <option value="rank">ประเภทกำลังพล (Personnel Type)</option>
                  <option value="badgeNo">หมายเลขประจำตัว/เลขบัตร (Badge No)</option>
                  <option value="citizenId">เลขบัตรประชาชน 13 หลัก (Citizen ID)</option>
                  <option value="bloodType">หมู่โลหิต (Blood Group)</option>
                  <option value="avatar">รูปถ่ายประจำตัว (Profile Avatar)</option>
                  <option value="issueDate">วันออกบัตร (Issue Date)</option>
                  <option value="expireDate">วันหมดอายุ (Expire Date)</option>
                </select>
              </div>

              {/* Static Text Content */}
              {selectedElement.field === 'static' && (selectedElement.type === 'text' || selectedElement.type === 'ribbon') && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">ข้อความ</label>
                  <input
                    type="text"
                    value={selectedElement.content || ''}
                    onChange={(e) => updateSelected({ content: e.target.value })}
                    className="form-input text-xs py-1.5"
                    placeholder="พิมพ์ข้อความที่ต้องการแสดง"
                  />
                </div>
              )}

              {/* Quick Alignment Grid */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1.5">จัดตำแหน่งด่วน (Align)</label>
                <div className="grid grid-cols-6 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button type="button" onClick={() => alignSelected('left')} title="ชิดซ้าย" className="py-1 rounded text-xs hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"><i className="fa-solid fa-align-left"></i></button>
                  <button type="button" onClick={() => alignSelected('center')} title="กึ่งกลางแนวนอน" className="py-1 rounded text-xs hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"><i className="fa-solid fa-align-center"></i></button>
                  <button type="button" onClick={() => alignSelected('right')} title="ชิดขวา" className="py-1 rounded text-xs hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"><i className="fa-solid fa-align-right"></i></button>
                  <button type="button" onClick={() => alignSelected('top')} title="ชิดบน" className="py-1 rounded text-xs hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"><i className="fa-solid fa-arrow-up-to-line"></i></button>
                  <button type="button" onClick={() => alignSelected('middle')} title="กึ่งกลางแนวตั้ง" className="py-1 rounded text-xs hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"><i className="fa-solid fa-arrows-up-down"></i></button>
                  <button type="button" onClick={() => alignSelected('bottom')} title="ชิดล่าง" className="py-1 rounded text-xs hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"><i className="fa-solid fa-arrow-down-to-line"></i></button>
                </div>
              </div>

              {/* Layer Ordering */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1.5">ลำดับชั้นเลเยอร์ (Layer Depth)</label>
                <div className="grid grid-cols-4 gap-1">
                  <button type="button" onClick={() => reorderLayer('front')} title="ย้ายไปหน้าสุด" className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700 dark:text-slate-200 flex flex-col items-center gap-0.5">
                    <i className="fa-solid fa-layer-group text-xs"></i><span>หน้าสุด</span>
                  </button>
                  <button type="button" onClick={() => reorderLayer('forward')} title="ย้ายขึ้น 1 ชั้น" className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700 dark:text-slate-200 flex flex-col items-center gap-0.5">
                    <i className="fa-solid fa-arrow-up text-xs"></i><span>ขึ้น 1</span>
                  </button>
                  <button type="button" onClick={() => reorderLayer('backward')} title="ย้ายลง 1 ชั้น" className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700 dark:text-slate-200 flex flex-col items-center gap-0.5">
                    <i className="fa-solid fa-arrow-down text-xs"></i><span>ลง 1</span>
                  </button>
                  <button type="button" onClick={() => reorderLayer('back')} title="ย้ายไปหลังสุด" className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700 dark:text-slate-200 flex flex-col items-center gap-0.5">
                    <i className="fa-solid fa-bars-staggered text-xs"></i><span>หลังสุด</span>
                  </button>
                </div>
              </div>

              {/* Typography Settings (if text/ribbon) */}
              {(selectedElement.type === 'text' || selectedElement.type === 'ribbon') && (
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">ตัวอักษร (Typography)</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">ขนาด (px)</label>
                      <input
                        type="number"
                        min="6"
                        max="64"
                        value={selectedElement.fontSize || 12}
                        onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })}
                        className="form-input text-xs py-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">ความหนา</label>
                      <select
                        value={selectedElement.fontWeight || 'normal'}
                        onChange={(e) => updateSelected({ fontWeight: e.target.value })}
                        className="form-select text-xs py-1"
                      >
                        <option value="normal">ปกติ (Regular)</option>
                        <option value="500">ปานกลาง (Medium)</option>
                        <option value="bold">หนา (Bold)</option>
                        <option value="900">หนาพิเศษ (Black)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">การจัดข้อความ</label>
                      <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <button type="button" onClick={() => updateSelected({ textAlign: 'left' })} className={`flex-1 py-1 rounded text-xs ${selectedElement.textAlign === 'left' ? 'bg-white dark:bg-slate-700 text-primary-600' : 'text-slate-500'}`}><i className="fa-solid fa-align-left"></i></button>
                        <button type="button" onClick={() => updateSelected({ textAlign: 'center' })} className={`flex-1 py-1 rounded text-xs ${selectedElement.textAlign === 'center' ? 'bg-white dark:bg-slate-700 text-primary-600' : 'text-slate-500'}`}><i className="fa-solid fa-align-center"></i></button>
                        <button type="button" onClick={() => updateSelected({ textAlign: 'right' })} className={`flex-1 py-1 rounded text-xs ${selectedElement.textAlign === 'right' ? 'bg-white dark:bg-slate-700 text-primary-600' : 'text-slate-500'}`}><i className="fa-solid fa-align-right"></i></button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">สีตัวอักษร</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={selectedElement.color || '#0f172a'}
                          onChange={(e) => updateSelected({ color: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-slate-300 p-0 cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={selectedElement.color || '#0f172a'}
                          onChange={(e) => updateSelected({ color: e.target.value })}
                          className="form-input font-mono text-[10px] py-1 px-1.5 uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Color, Gradient & Background Fills */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">สีและพื้นหลัง (Fill & Gradient)</span>
                
                <div>
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      checked={selectedElement.gradientEnabled || false}
                      onChange={(e) => updateSelected({ gradientEnabled: e.target.checked })}
                      className="rounded text-primary-600"
                    />
                    <span>เปิดใช้การไล่เฉดสี (Linear Gradient)</span>
                  </label>

                  {selectedElement.gradientEnabled ? (
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">สีเริ่มต้น</label>
                        <input
                          type="color"
                          value={selectedElement.gradientFrom || '#3b82f6'}
                          onChange={(e) => updateSelected({ gradientFrom: e.target.value })}
                          className="w-full h-7 rounded border border-slate-300 p-0 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">สีปลายทาง</label>
                        <input
                          type="color"
                          value={selectedElement.gradientTo || '#1e3a8a'}
                          onChange={(e) => updateSelected({ gradientTo: e.target.value })}
                          className="w-full h-7 rounded border border-slate-300 p-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedElement.backgroundColor || '#f1f5f9'}
                        onChange={(e) => updateSelected({ backgroundColor: e.target.value })}
                        className="w-8 h-8 rounded-lg border border-slate-300 p-0 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={selectedElement.backgroundColor || '#f1f5f9'}
                        onChange={(e) => updateSelected({ backgroundColor: e.target.value })}
                        className="form-input font-mono text-[10px] py-1 px-2 uppercase"
                        placeholder="Transparent"
                      />
                    </div>
                  )}
                </div>

                {/* Dynamic Rank Color Binding */}
                <div className="bg-primary-50/60 dark:bg-primary-950/30 p-2.5 rounded-xl border border-primary-100 dark:border-primary-900/50 space-y-1.5">
                  <span className="text-[10px] font-bold text-primary-700 dark:text-primary-300 block">สีอัตโนมัติตามกลุ่มกำลังพล (Dynamic Rank Colors)</span>
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedElement.dynamicBg || false}
                      onChange={(e) => updateSelected({ dynamicBg: e.target.checked })}
                      className="rounded text-primary-600"
                    />
                    <span>ใช้สีตามยศเป็นพื้นหลัง (Background)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedElement.dynamicText || false}
                      onChange={(e) => updateSelected({ dynamicText: e.target.checked })}
                      className="rounded text-primary-600"
                    />
                    <span>ใช้สีตามยศเป็นตัวอักษร (Text)</span>
                  </label>
                </div>
              </div>

              {/* Borders & Corners */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">เส้นขอบและความมน (Borders & Radius)</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">ความหนาเส้น (px)</label>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={selectedElement.borderWidth || 0}
                      onChange={(e) => updateSelected({ borderWidth: Number(e.target.value) })}
                      className="form-input text-xs py-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">ขอบมน (px)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedElement.borderRadius || 0}
                      onChange={(e) => updateSelected({ borderRadius: Number(e.target.value) })}
                      className="form-input text-xs py-1"
                    />
                  </div>
                </div>

                {selectedElement.borderWidth && selectedElement.borderWidth > 0 ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedElement.borderColor || '#cbd5e1'}
                      onChange={(e) => updateSelected({ borderColor: e.target.value })}
                      className="w-8 h-8 rounded-lg border border-slate-300 p-0 cursor-pointer shrink-0"
                    />
                    <select
                      value={selectedElement.borderStyle || 'solid'}
                      onChange={(e) => updateSelected({ borderStyle: e.target.value as any })}
                      className="form-select text-xs py-1"
                    >
                      <option value="solid">เส้นทึบ (Solid)</option>
                      <option value="dashed">เส้นประ (Dashed)</option>
                      <option value="dotted">จุดไข่ปลา (Dotted)</option>
                    </select>
                  </div>
                ) : null}
              </div>

              {/* Effects & Opacity */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">เงาและความโปร่งแสง (Effects)</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">เงา (Shadow)</label>
                    <select
                      value={selectedElement.boxShadow || 'none'}
                      onChange={(e) => updateSelected({ boxShadow: e.target.value as any })}
                      className="form-select text-xs py-1"
                    >
                      <option value="none">ไม่มีเงา</option>
                      <option value="sm">เงานุ่มนวล (Soft)</option>
                      <option value="md">เงาปกติ (Medium)</option>
                      <option value="lg">เงาลึก (Deep)</option>
                      <option value="glow">เรืองแสง (Glow)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">ความทึบแสง ({selectedElement.opacity ?? 100}%)</label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={selectedElement.opacity ?? 100}
                      onChange={(e) => updateSelected({ opacity: Number(e.target.value) })}
                      className="w-full accent-primary-600 mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-2xl">
                <i className="fa-solid fa-arrow-pointer"></i>
              </div>
              <h5 className="font-bold text-slate-700 dark:text-slate-300 text-sm">เลือกชิ้นส่วนบนบัตร</h5>
              <p className="text-xs text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                คลิกที่ตัวอักษร รูปถ่าย หรือรูปทรงบนบัตร เพื่อปรับขนาด สี ฟอนต์ และจัดวางได้อย่างอิสระ
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Premium Glassmorphism Confirmation Modal ─── */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0">
                <i className={confirmModal.icon || 'fa-solid fa-triangle-exclamation text-amber-500'}></i>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{confirmModal.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{confirmModal.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-colors ${confirmModal.confirmColor || 'bg-primary-600 hover:bg-primary-500'}`}
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
