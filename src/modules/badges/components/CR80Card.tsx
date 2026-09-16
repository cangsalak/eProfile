'use client';

import React from 'react';
import { CR80_DIMENSIONS } from '../constants';

export interface CR80CardProps {
  children: React.ReactNode;
  isLandscape?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Standard CR80 ID Card Container (ISO/IEC 7810 ID-1)
 * Enforces exact physical dimensions (53.98mm x 85.60mm, corner radius 3.18mm)
 * and correct print color preservation across all templates.
 */
export default function CR80Card({
  children,
  isLandscape = false,
  className = '',
  style = {},
}: CR80CardProps) {
  const cardWidth = isLandscape ? CR80_DIMENSIONS.landscapeWidth : CR80_DIMENSIONS.width;
  const cardHeight = isLandscape ? CR80_DIMENSIONS.landscapeHeight : CR80_DIMENSIONS.height;

  return (
    <div
      className={`cr80-card relative overflow-hidden bg-white shadow-md print:shadow-none rounded-[12px] ${
        isLandscape ? 'cr80-landscape' : ''
      } ${className}`}
      style={{
        width: cardWidth,
        height: cardHeight,
        boxSizing: 'border-box',
        borderRadius: CR80_DIMENSIONS.cornerRadius,
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
