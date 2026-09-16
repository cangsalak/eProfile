'use client';

import React from 'react';
import { CanvasElement } from './types';
import CanvasElementItem from './CanvasElementItem';

interface CanvasWorkspaceProps {
  orientation: 'portrait' | 'landscape';
  canvasWidth: number;
  canvasHeight: number;
  elements: CanvasElement[];
  selectedId: string | null;
  useMockData: boolean;
  mockRank?: 'commissioned' | 'non_commissioned' | 'conscript';
  showGrid: boolean;
  zoom: number;
  onSelect: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
}

export default function CanvasWorkspace({
  canvasWidth,
  canvasHeight,
  elements,
  selectedId,
  useMockData,
  mockRank = 'commissioned',
  showGrid,
  zoom,
  onSelect,
  onUpdateElement
}: CanvasWorkspaceProps) {
  const scale = zoom / 100;

  return (
    <div
      className="flex-1 h-full min-h-[660px] bg-slate-100/95 dark:bg-slate-950/90 overflow-auto flex items-center justify-center p-8 relative select-none transition-colors"
      style={{
        backgroundImage: `
          radial-gradient(circle at center, rgba(99, 102, 241, 0.05) 0, transparent 70%),
          linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 24px 24px, 24px 24px'
      }}
    >
      {/* Scaled Canvas Container Frame */}
      <div
        style={{
          width: `${canvasWidth * scale}px`,
          height: `${canvasHeight * scale}px`,
          transition: 'width 0.15s ease-out, height 0.15s ease-out'
        }}
        className="relative flex items-center justify-center shadow-2xl shrink-0 my-auto mx-auto"
      >
        <div
          className="relative bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-300/80 dark:border-slate-700/80"
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          {/* Optional Grid Overlay */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none z-10 opacity-15"
              style={{
                backgroundImage: 'linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />
          )}

          {/* Render Elements */}
          {elements.map((el) => (
            <CanvasElementItem
              key={el.id}
              el={el}
              isSelected={selectedId === el.id}
              useMockData={useMockData}
              mockRank={mockRank}
              zoom={zoom}
              onSelect={onSelect}
              onUpdate={onUpdateElement}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
