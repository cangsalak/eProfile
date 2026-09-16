'use client';

import React from 'react';
import { Rnd } from 'react-rnd';
import { QRCodeCanvas } from 'qrcode.react';
import { CanvasElement } from './types';
import { MOCK_PROFILES } from './mockData';

interface CanvasElementItemProps {
  el: CanvasElement;
  isSelected: boolean;
  useMockData: boolean;
  mockRank?: 'commissioned' | 'non_commissioned' | 'conscript';
  zoom: number;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
}

export default function CanvasElementItem({
  el,
  isSelected,
  useMockData,
  mockRank = 'commissioned',
  zoom,
  onSelect,
  onUpdate
}: CanvasElementItemProps) {
  if (el.hidden) return null;

  const currentProfile = MOCK_PROFILES[mockRank] || MOCK_PROFILES.commissioned;

  let content: React.ReactNode = el.content;
  if (useMockData) {
    if (el.field === 'fullName') content = currentProfile.fullName;
    else if (el.field === 'firstName') content = currentProfile.firstName;
    else if (el.field === 'lastName') content = currentProfile.lastName;
    else if (el.field === 'prefix') content = currentProfile.prefix;
    else if (el.field === 'position') content = currentProfile.position;
    else if (el.field === 'department') content = currentProfile.department;
    else if (el.field === 'subDepartment') content = currentProfile.subDepartment;
    else if (el.field === 'rank') content = currentProfile.rank;
    else if (el.field === 'badgeNo') content = currentProfile.badgeNo;
    else if (el.field === 'citizenId') content = currentProfile.citizenId;
    else if (el.field === 'bloodType') content = `หมู่โลหิต ${currentProfile.bloodType}`;
    else if (el.field === 'issueDate') content = currentProfile.issueDate;
    else if (el.field === 'expireDate') content = currentProfile.expireDate;
  } else {
    if (el.field === 'fullName') content = '{ชื่อ-นามสกุล}';
    else if (el.field === 'position') content = '{ตำแหน่ง}';
    else if (el.field === 'department') content = '{หน่วยงาน}';
    else if (el.field === 'badgeNo') content = '{หมายเลขบัตร}';
    else if (el.field !== 'static') content = `{${el.field}}`;
  }

  const dynamicPreviewColor = currentProfile.rankColor || '#dc2626';
  const bgColor = el.gradientEnabled 
    ? `linear-gradient(${el.gradientDirection === 'to-r' ? 'to right' : el.gradientDirection === 'to-br' ? 'to bottom right' : el.gradientDirection === 'to-tr' ? 'to top right' : 'to bottom'}, ${el.gradientFrom || '#3b82f6'}, ${el.gradientTo || '#1e3a8a'})`
    : el.dynamicBg ? dynamicPreviewColor : (el.backgroundColor || 'transparent');
  
  const txtColor = el.dynamicText ? dynamicPreviewColor : (el.color || '#0f172a');
  const borderColor = el.dynamicBorder ? dynamicPreviewColor : (el.borderColor || 'transparent');

  const innerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : el.textAlign === 'justify' ? 'space-between' : 'flex-start',
    overflow: 'hidden',
    boxSizing: 'border-box',
    boxShadow: el.boxShadow === 'sm' ? '0 1px 2px rgba(0,0,0,0.1)' : el.boxShadow === 'md' ? '0 4px 6px -1px rgba(0,0,0,0.15)' : el.boxShadow === 'lg' ? '0 10px 15px -3px rgba(0,0,0,0.2)' : el.boxShadow === 'glow' ? '0 0 15px rgba(59,130,246,0.5)' : undefined
  };

  let innerComponent: React.ReactNode = content;

  if (el.type === 'image' || el.field === 'avatar') {
    if (el.field === 'static' && typeof el.content === 'string' && (el.content.startsWith('data:image/') || el.content.startsWith('http') || el.content.startsWith('/'))) {
      innerComponent = (
        <img src={el.content} className="w-full h-full object-cover pointer-events-none" alt="Custom" />
      );
    } else {
      innerComponent = (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-400">
          <i className="fa-solid fa-user-tie text-3xl sm:text-4xl text-slate-500"></i>
          <span className="text-[9px] font-semibold mt-1">รูปถ่าย</span>
        </div>
      );
    }
  } else if (el.type === 'emblem') {
    innerComponent = (
      <div className="w-full h-full flex items-center justify-center">
        <i className="fa-solid fa-shield-halved text-3xl text-amber-500 drop-shadow"></i>
      </div>
    );
  } else if (el.type === 'hologram') {
    innerComponent = (
      <div className="w-full h-full bg-gradient-to-r from-rose-400 via-amber-300 via-emerald-400 via-cyan-400 to-indigo-400 opacity-80 flex items-center justify-center">
        <span className="text-[8px] font-black tracking-widest text-slate-900/70 uppercase">SECURE HOLOGRAM</span>
      </div>
    );
  } else if (el.type === 'qr') {
    innerComponent = (
      <div className="w-full h-full p-1 bg-white flex items-center justify-center">
        <QRCodeCanvas value={currentProfile.badgeNo || 'RTARF-2567-0099'} size={120} style={{ width: '100%', height: '100%' }} />
      </div>
    );
  } else if (el.type === 'barcode') {
    innerComponent = (
      <div className="w-full h-full p-1 bg-white flex flex-col items-center justify-center">
        <div className="w-full h-3/4 flex items-center justify-center gap-0.5">
          {[2,1,3,1,2,3,1,2,1,3,2,1,2,3,1,2,1,3,2].map((w, i) => (
            <span key={i} className="h-full bg-slate-900" style={{ width: `${w * 2}px` }} />
          ))}
        </div>
        <span className="text-[8px] font-mono tracking-widest text-slate-800 font-bold mt-0.5">{currentProfile.badgeNo || 'RTARF-2567-0099'}</span>
      </div>
    );
  }

  const scale = zoom / 100;

  return (
    <Rnd
      bounds="parent"
      position={{ x: el.x, y: el.y }}
      size={{ width: el.width, height: el.height }}
      scale={scale}
      onDragStart={(_e) => {
        onSelect(el.id);
      }}
      onResizeStart={(_e) => {
        onSelect(el.id);
      }}
      onDragStop={(_e, d) => {
        onUpdate(el.id, { x: Math.round(d.x), y: Math.round(d.y) });
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        onUpdate(el.id, {
          width: Math.round(ref.offsetWidth),
          height: Math.round(ref.offsetHeight),
          x: Math.round(position.x),
          y: Math.round(position.y)
        });
      }}
      disableDragging={el.locked}
      enableResizing={
        !el.locked && isSelected
          ? {
              top: true,
              right: true,
              bottom: true,
              left: true,
              topRight: true,
              bottomRight: true,
              bottomLeft: true,
              topLeft: true
            }
          : false
      }
      onMouseDown={(e: any) => {
        if (e && e.stopPropagation) e.stopPropagation();
        onSelect(el.id);
      }}
      className={`group absolute select-none ${
        isSelected
          ? 'ring-2 ring-primary-500 shadow-xl z-50'
          : 'hover:outline hover:outline-1 hover:outline-primary-400/80 cursor-pointer'
      }`}
      style={{ zIndex: el.zIndex, transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined }}
    >
      <div style={innerStyle}>{innerComponent}</div>

      {/* Canva-style Corner Anchor Nodes & Size Badge when selected */}
      {isSelected && !el.locked && (
        <>
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary-600 rounded-full shadow-sm pointer-events-none" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary-600 rounded-full shadow-sm pointer-events-none" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary-600 rounded-full shadow-sm pointer-events-none" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary-600 rounded-full shadow-sm pointer-events-none" />
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-primary-950/90 text-primary-300 font-mono text-[9px] rounded border border-primary-700/60 shadow whitespace-nowrap pointer-events-none">
            {el.width} × {el.height} px
          </div>
        </>
      )}
    </Rnd>
  );
}
