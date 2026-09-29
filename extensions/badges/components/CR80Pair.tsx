'use client';

import React from 'react';
import { CR80_DIMENSIONS } from '../constants';

export interface CR80PairProps {
  front: React.ReactNode;
  back: React.ReactNode;
  showCropMarks?: boolean;
  className?: string;
  isLandscape?: boolean;
}

/**
 * Standard CR80 ID Card Front/Back Pair Container
 * Renders Front & Back cards side-by-side with an exact 0.05mm center fold guide
 * and standard crop marks for single-pass 2-sided printing.
 * Supports both Portrait (53.98 x 85.60 mm) and Landscape (85.60 x 53.98 mm) orientations.
 */
export default function CR80Pair({
  front,
  back,
  showCropMarks = true,
  className = '',
  isLandscape = false,
}: CR80PairProps) {
  const cardWidth = isLandscape ? CR80_DIMENSIONS.landscapeWidth : CR80_DIMENSIONS.width;
  const cardHeight = isLandscape ? CR80_DIMENSIONS.landscapeHeight : CR80_DIMENSIONS.height;

  return (
    <div
      className={`flex items-center justify-center relative p-0 print:p-0 ${className}`}
      style={{ gap: CR80_DIMENSIONS.pairGap }}
    >
      {/* Front Card Container */}
      <div
        className="relative p-0 print:p-0 shadow-sm print:shadow-none overflow-visible shrink-0"
        style={{ width: cardWidth, height: cardHeight }}
      >
        {showCropMarks && (
          <>
            <div className="absolute -top-2 -left-2 w-3 h-3 border-t-2 border-l-2 border-black pointer-events-none no-print print:block" />
            <div className="absolute -bottom-2 -left-2 w-3 h-3 border-b-2 border-l-2 border-black pointer-events-none no-print print:block" />
            <div className="absolute -top-2 left-1/2 w-px h-2 bg-black pointer-events-none no-print print:block" />
            <div className="absolute -bottom-2 left-1/2 w-px h-2 bg-black pointer-events-none no-print print:block" />
          </>
        )}
        {front}
      </div>

      {/* Center Fold / Cut Dividing Guide (0.05mm) */}
      <div
        className="self-stretch border-r border-dashed border-slate-300 print:border-slate-400 opacity-70 pointer-events-none shrink-0"
        style={{
          width: CR80_DIMENSIONS.pairGap,
          height: cardHeight,
        }}
      />

      {/* Back Card Container */}
      <div
        className="relative p-0 print:p-0 shadow-sm print:shadow-none overflow-visible shrink-0"
        style={{ width: cardWidth, height: cardHeight }}
      >
        {showCropMarks && (
          <>
            <div className="absolute -top-2 -right-2 w-3 h-3 border-t-2 border-r-2 border-black pointer-events-none no-print print:block" />
            <div className="absolute -bottom-2 -right-2 w-3 h-3 border-b-2 border-r-2 border-black pointer-events-none no-print print:block" />
            <div className="absolute -top-2 left-1/2 w-px h-2 bg-black pointer-events-none no-print print:block" />
            <div className="absolute -bottom-2 left-1/2 w-px h-2 bg-black pointer-events-none no-print print:block" />
          </>
        )}
        {back}
      </div>
    </div>
  );
}
