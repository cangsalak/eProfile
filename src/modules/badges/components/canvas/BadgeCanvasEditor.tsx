'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { Modal, Button } from '@/components/ui';
import { 
  BadgeCanvasEditorProps, 
  CanvasElement, 
  CanvasElementType, 
  CanvaTab 
} from './types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  HORIZONTAL_CANVAS_WIDTH, 
  HORIZONTAL_CANVAS_HEIGHT, 
  TEMPLATE_MILITARY_OFFICIAL, 
  TEMPLATE_BACK_STANDARD 
} from './presets';
import CanvasToolbar from './CanvasToolbar';
import CanvasSidebar from './CanvasSidebar';
import CanvasWorkspace from './CanvasWorkspace';
import CanvasPropertiesPanel from './CanvasPropertiesPanel';

export default function BadgeCanvasEditor({
  initialElements,
  initialBackElements,
  onChange,
  onBackChange
}: BadgeCanvasEditorProps) {
  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sidebar State
  const [activeTab, setActiveTab] = useState<CanvaTab>('templates');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // Front / Back canvas side state
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    const list = initialElements && initialElements.length > 0 ? initialElements : TEMPLATE_MILITARY_OFFICIAL;
    return list.some((el) => el.id.startsWith('ls-')) ? 'landscape' : 'portrait';
  });

  const [zoom, setZoom] = useState<number>(100);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [useMockData, setUseMockData] = useState<boolean>(true);
  const [mockRank, setMockRank] = useState<'commissioned' | 'non_commissioned' | 'conscript'>('commissioned');

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

  // Modals
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [importExportModal, setImportExportModal] = useState<'import' | 'export' | null>(null);
  const [jsonString, setJsonString] = useState<string>('');

  // Keyboard shortcut listener (ESC to exit fullscreen, Delete to remove element)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const currentElements = activeSide === 'front' ? frontElements : backElements;

  // History Management
  const pushHistory = useCallback((newElements: CanvasElement[], side: 'front' | 'back') => {
    setHistory((prev) => {
      const currentList = prev[side].slice(0, (historyIndex[side] || 0) + 1);
      return {
        ...prev,
        [side]: [...currentList, newElements]
      };
    });
    setHistoryIndex((prev) => ({
      ...prev,
      [side]: (prev[side] || 0) + 1
    }));
  }, [historyIndex]);

  const updateCurrentElements = useCallback((newElements: CanvasElement[], recordHistory = false) => {
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
        setHistoryIndex((prev) => ({ ...prev, [side]: targetIdx }));
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
        setHistoryIndex((prev) => ({ ...prev, [side]: targetIdx }));
      }
    }
  }, [activeSide, history, historyIndex, onChange, onBackChange]);

  // Element Actions
  const handleUpdateElement = (id: string, updates: Partial<CanvasElement>) => {
    const updated = currentElements.map((el) => (el.id === id ? { ...el, ...updates } : el));
    updateCurrentElements(updated, false);
  };

  const handleDeleteElement = (id: string) => {
    const updated = currentElements.filter((el) => el.id !== id);
    if (selectedId === id) setSelectedId(null);
    updateCurrentElements(updated, true);
    toast.success('ลบองค์ประกอบเรียบร้อย');
  };

  const handleAddElement = (type: CanvasElementType, customProps: Partial<CanvasElement> = {}) => {
    const id = `${type}-${Date.now().toString(36)}`;
    const maxZ = currentElements.reduce((max, el) => Math.max(max, el.zIndex || 0), 0);

    const defaultEl: CanvasElement = {
      id,
      type,
      field: 'static',
      x: 40,
      y: 120,
      width: type === 'text' ? 260 : type === 'image' ? 140 : type === 'qr' ? 90 : 120,
      height: type === 'text' ? 32 : type === 'image' ? 160 : type === 'qr' ? 90 : 70,
      zIndex: maxZ + 1,
      ...customProps
    };

    const newElements = [...currentElements, defaultEl];
    setSelectedId(id);
    updateCurrentElements(newElements, true);
    toast.success('เพิ่มองค์ประกอบแล้ว');
  };

  const handleApplyTemplate = (template: CanvasElement[], name: string) => {
    setConfirmModal({
      title: 'ยืนยันการใช้เทมเพลต',
      message: `ต้องการเปลี่ยนเป็น "${name}" หรือไม่? องค์ประกอบเดิมในหน้านี้จะถูกแทนที่`,
      onConfirm: () => {
        updateCurrentElements([...template], true);
        setSelectedId(null);
        toast.success(`นำเข้าเทมเพลต ${name} สำเร็จ`);
        setConfirmModal(null);
      }
    });
  };

  const handleClear = () => {
    setConfirmModal({
      title: 'ยืนยันการล้างข้อมูล',
      message: 'คุณต้องการลบองค์ประกอบทั้งหมดในหน้านี้ใช่หรือไม่?',
      onConfirm: () => {
        updateCurrentElements([], true);
        setSelectedId(null);
        toast.success('ล้างข้อมูลเรียบร้อย');
        setConfirmModal(null);
      }
    });
  };

  const handleReorderElement = (id: string, direction: 'up' | 'down') => {
    const idx = currentElements.findIndex((el) => el.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
    if (targetIdx < 0 || targetIdx >= currentElements.length) return;

    const list = [...currentElements];
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    // Normalize zIndexes
    const normalized = list.map((el, i) => ({ ...el, zIndex: i + 1 }));
    updateCurrentElements(normalized, true);
  };

  const handleExport = () => {
    const json = JSON.stringify(currentElements, null, 2);
    setJsonString(json);
    setImportExportModal('export');
  };

  const handleImport = () => {
    setJsonString('');
    setImportExportModal('import');
  };

  const handleApplyImportJson = () => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        updateCurrentElements(parsed, true);
        setSelectedId(null);
        setImportExportModal(null);
        toast.success('นำเข้าข้อมูล JSON สำเร็จ');
      } else {
        toast.error('โครงสร้าง JSON ไม่ถูกต้อง (ต้องเป็น Array)');
      }
    } catch {
      toast.error('รูปแบบ JSON ไม่ถูกต้อง');
    }
  };

  const selectedElement = currentElements.find((el) => el.id === selectedId) || null;
  const canvasWidth = orientation === 'landscape' ? HORIZONTAL_CANVAS_WIDTH : CANVAS_WIDTH;
  const canvasHeight = orientation === 'landscape' ? HORIZONTAL_CANVAS_HEIGHT : CANVAS_HEIGHT;

  const studioContent = (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-[99999] w-screen h-screen bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden font-prompt select-none animate-fade-in'
          : 'flex flex-col w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden font-prompt select-none transition-all'
      }
    >
      {/* 1. TOP TOOLBAR */}
      <CanvasToolbar
        activeSide={activeSide}
        setActiveSide={(side) => {
          setActiveSide(side);
          setSelectedId(null);
        }}
        orientation={orientation}
        setOrientation={setOrientation}
        useMockData={useMockData}
        setUseMockData={setUseMockData}
        mockRank={mockRank}
        setMockRank={setMockRank}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        zoom={zoom}
        setZoom={setZoom}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
        canUndo={(historyIndex[activeSide] || 0) > 0}
        canRedo={(historyIndex[activeSide] || 0) < history[activeSide].length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* 2. MAIN STUDIO WORKSPACE */}
      <div className={`flex w-full relative overflow-hidden ${isFullscreen ? 'flex-1 h-[calc(100vh-56px)]' : 'h-[720px]'}`}>
        {/* Left Canva Sidebar */}
        <CanvasSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          elements={currentElements}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAddElement={handleAddElement}
          onApplyTemplate={handleApplyTemplate}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onReorderElement={handleReorderElement}
        />

        {/* Central Workspace Canvas */}
        <CanvasWorkspace
          orientation={orientation}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          elements={currentElements}
          selectedId={selectedId}
          useMockData={useMockData}
          mockRank={mockRank}
          showGrid={showGrid}
          zoom={zoom}
          onSelect={setSelectedId}
          onUpdateElement={handleUpdateElement}
        />

        {/* Right Properties Panel */}
        {selectedElement && (
          <CanvasPropertiesPanel
            element={selectedElement}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            onUpdate={handleUpdateElement}
            onDelete={handleDeleteElement}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      {/* CONFIRM MODAL */}
      {confirmModal && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmModal(null)}
          title={confirmModal.title}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">{confirmModal.message}</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setConfirmModal(null)}>
                ยกเลิก
              </Button>
              <Button variant="primary" onClick={confirmModal.onConfirm}>
                ยืนยัน
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* IMPORT / EXPORT MODAL */}
      {importExportModal && (
        <Modal
          isOpen={true}
          onClose={() => setImportExportModal(null)}
          title={importExportModal === 'export' ? 'ส่งออกโครงสร้าง JSON' : 'นำเข้าโครงสร้าง JSON'}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {importExportModal === 'export'
                ? 'คัดลอกโค้ด JSON ด้านล่างเพื่อนำไปสำรองหรือนำไปใช้ในองค์กรอื่น'
                : 'วางโค้ด JSON โครงสร้างบัตรที่ต้องการนำเข้า'}
            </p>
            <textarea
              value={jsonString}
              onChange={(e) => setJsonString(e.target.value)}
              readOnly={importExportModal === 'export'}
              rows={10}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 font-mono text-xs text-slate-900 dark:text-emerald-400 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setImportExportModal(null)}>
                ปิด
              </Button>
              {importExportModal === 'export' ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(jsonString);
                    toast.success('คัดลอก JSON แล้ว');
                  }}
                >
                  <i className="fa-solid fa-copy mr-1.5" /> คัดลอก
                </Button>
              ) : (
                <Button variant="primary" onClick={handleApplyImportJson}>
                  <i className="fa-solid fa-check mr-1.5" /> บันทึกและนำเข้า
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );

  if (isFullscreen && mounted) {
    return (
      <>
        {/* Placeholder in normal tree */}
        <div className="w-full h-24 rounded-3xl bg-slate-100 dark:bg-slate-800/40 border border-dashed border-primary-500/40 flex items-center justify-center text-xs text-primary-600 font-semibold gap-2">
          <i className="fa-solid fa-expand animate-pulse" />
          <span>กำลังเปิดใช้งานโหมดสตูดิโอเต็มหน้าจอ (กด ESC เพื่อย่อกลับ)</span>
        </div>
        {createPortal(studioContent, document.body)}
      </>
    );
  }

  return studioContent;
}
