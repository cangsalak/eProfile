'use client';

import React from 'react';

interface CanvasToolbarProps {
  activeSide: 'front' | 'back';
  setActiveSide: (side: 'front' | 'back') => void;
  orientation: 'portrait' | 'landscape';
  setOrientation: (orientation: 'portrait' | 'landscape') => void;
  useMockData: boolean;
  setUseMockData: (use: boolean) => void;
  mockRank: 'commissioned' | 'non_commissioned' | 'conscript';
  setMockRank: (rank: 'commissioned' | 'non_commissioned' | 'conscript') => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  isFullscreen: boolean;
  setIsFullscreen: (full: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  onImport: () => void;
}

export default function CanvasToolbar({
  activeSide,
  setActiveSide,
  orientation,
  setOrientation,
  useMockData,
  setUseMockData,
  mockRank,
  setMockRank,
  showGrid,
  setShowGrid,
  zoom,
  setZoom,
  isFullscreen,
  setIsFullscreen,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onExport,
  onImport
}: CanvasToolbarProps) {
  const zoomPresets = [50, 75, 100, 125, 150, 175, 200];

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 z-30 select-none text-slate-700 dark:text-slate-200 shadow-sm overflow-x-auto">
      {/* 1. Left Group: Side & Orientation */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Front / Back Side */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveSide('front')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSide === 'front' 
                ? 'bg-primary-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className="fa-solid fa-id-card text-xs" />
            <span className="hidden sm:inline">หน้าบัตร</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSide('back')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSide === 'back' 
                ? 'bg-primary-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className="fa-solid fa-rotate text-xs" />
            <span className="hidden sm:inline">หลังบัตร</span>
          </button>
        </div>

        {/* Orientation */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setOrientation('portrait')}
            title="แนวตั้ง CR80 (54 × 85.6 mm)"
            className={`p-1 px-2 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
              orientation === 'portrait' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-mobile-screen" />
            <span className="hidden md:inline">แนวตั้ง</span>
          </button>
          <button
            type="button"
            onClick={() => setOrientation('landscape')}
            title="แนวนอน CR80 (85.6 × 54 mm)"
            className={`p-1 px-2 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
              orientation === 'landscape' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-tablet-screen-button rotate-90" />
            <span className="hidden md:inline">แนวนอน</span>
          </button>
        </div>
      </div>

      {/* 2. Center Group: Undo/Redo & Rank Preview & Zoom */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Undo / Redo */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="ย้อนกลับ (Undo)"
            className="p-1 px-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition"
          >
            <i className="fa-solid fa-rotate-left text-xs" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="ทำซ้ำ (Redo)"
            className="p-1 px-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition"
          >
            <i className="fa-solid fa-rotate-right text-xs" />
          </button>
        </div>

        {/* View Options & Rank Tester */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 items-center gap-1">
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            title={showGrid ? 'ซ่อน Grid' : 'แสดง Grid'}
            className={`p-1 px-2 rounded-lg text-xs transition flex items-center gap-1 ${
              showGrid ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <i className="fa-solid fa-border-none text-xs" />
            <span className="hidden lg:inline text-[11px]">Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setUseMockData(!useMockData)}
            title="สลับมุมมองข้อมูลจริง / ตัวแปรฟิลด์"
            className={`p-1 px-2 rounded-lg text-xs transition flex items-center gap-1 ${
              useMockData ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <i className="fa-solid fa-eye text-xs" />
            <span className="hidden lg:inline text-[11px]">{useMockData ? 'ข้อมูลจริง' : 'ตัวแปร'}</span>
          </button>

          {/* Test Rank Colors Switcher */}
          {useMockData && (
            <div className="flex items-center pl-1 border-l border-slate-300 dark:border-slate-700 gap-1">
              <span className="text-[10px] text-slate-400 hidden xl:inline">ทดสอบสีชั้นยศ:</span>
              <select
                value={mockRank}
                onChange={(e) => setMockRank(e.target.value as any)}
                title="ทดสอบการแสดงผลสีตามชั้นยศ"
                className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-[11px] font-bold rounded-lg px-2 py-0.5 cursor-pointer shadow-xs focus:outline-none"
              >
                <option value="commissioned">🔴 สัญญาบัตร</option>
                <option value="non_commissioned">🟠 ประทวน/ลูกจ้าง</option>
                <option value="conscript">🟢 กองประจำการ</option>
              </select>
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(50, z - 15))}
            title="ย่อขนาด (-)"
            className="p-1 px-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <i className="fa-solid fa-minus text-[10px]" />
          </button>

          <select
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value) || 100)}
            className="bg-transparent text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer px-1 text-center"
          >
            {zoomPresets.map((z) => (
              <option key={z} value={z} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                {z}%
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(250, z + 15))}
            title="ขยายขนาด (+)"
            className="p-1 px-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <i className="fa-solid fa-plus text-[10px]" />
          </button>
        </div>
      </div>

      {/* 3. Right Group: Fullscreen & Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? 'ย่อหน้าต่างปกติ (ESC)' : 'ขยายเต็มหน้าจอ (Fullscreen)'}
          className={`py-1 px-3 rounded-xl border text-xs flex items-center gap-1.5 transition font-bold shadow-sm ${
            isFullscreen
              ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-amber-500/20'
              : 'bg-primary-600 hover:bg-primary-500 text-white border-primary-600 shadow-primary-500/30'
          }`}
        >
          <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-xs`} />
          <span className="text-xs">{isFullscreen ? 'ย่อจอ (ESC)' : 'ขยายเต็มจอ'}</span>
        </button>

        {/* Import/Export/Clear */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onImport}
            title="นำเข้า JSON"
            className="p-1 px-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
          >
            <i className="fa-solid fa-file-import text-xs" />
          </button>
          <button
            type="button"
            onClick={onExport}
            title="ส่งออก JSON"
            className="p-1 px-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            <i className="fa-solid fa-file-export text-xs" />
          </button>
          <button
            type="button"
            onClick={onClear}
            title="ล้าง Canvas"
            className="p-1 px-2 text-rose-500 hover:text-rose-600 transition"
          >
            <i className="fa-solid fa-trash-can text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}
