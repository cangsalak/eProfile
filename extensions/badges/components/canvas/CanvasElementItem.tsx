'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { QRCodeCanvas } from 'qrcode.react';
import { CanvasElement, RankColorsConfig, resolveBadgeFontFamily } from './types';
import { MOCK_PROFILES } from './mockData';
import { isImageSrc } from '@/modules/users';

interface CanvasElementItemProps {
  el: CanvasElement;
  isSelected: boolean;
  useMockData: boolean;
  mockRank?: 'commissioned' | 'non_commissioned' | 'conscript';
  rankColors?: RankColorsConfig;
  zoom: number;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
}

export default function CanvasElementItem({
  el,
  isSelected,
  useMockData,
  mockRank = 'commissioned',
  rankColors,
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

  const dynamicPreviewColor = (() => {
    if (rankColors?.colorMode === 'custom' && rankColors?.customColor) {
      return rankColors.customColor;
    }
    if (mockRank === 'commissioned') {
      return rankColors?.commissioned || currentProfile.rankColor || '#dc2626';
    }
    if (mockRank === 'non_commissioned') {
      return rankColors?.nonCommissioned || currentProfile.rankColor || '#d97706';
    }
    if (mockRank === 'conscript') {
      return rankColors?.conscript || currentProfile.rankColor || '#16a34a';
    }
    return rankColors?.commissioned || currentProfile.rankColor || '#dc2626';
  })();
  const bgColor = el.gradientEnabled 
    ? `linear-gradient(${el.gradientDirection === 'to-r' ? 'to right' : el.gradientDirection === 'to-br' ? 'to bottom right' : el.gradientDirection === 'to-tr' ? 'to top right' : 'to bottom'}, ${el.gradientFrom || '#3b82f6'}, ${el.gradientTo || '#1e3a8a'})`
    : el.dynamicBg ? dynamicPreviewColor : (el.backgroundColor || 'transparent');
  
  const txtColor = el.dynamicText ? dynamicPreviewColor : (el.color || '#0f172a');
  const borderColor = el.dynamicBorder ? dynamicPreviewColor : (el.borderColor || 'transparent');

  const innerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    fontSize: el.fontSize ? `${el.fontSize}px` : undefined,
    fontFamily: resolveBadgeFontFamily(el.fontFamily),
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
    boxShadow: undefined
  };

  let innerComponent: React.ReactNode = content;

  if (el.type === 'text') {
    innerComponent = (
      <span style={{ width: '100%', textAlign: el.textAlign || 'left', display: 'inline-block', padding: '0 2px' }}>
        {content}
      </span>
    );
  } else if (el.field === 'avatar') {
    if (useMockData && currentProfile.avatar) {
      innerComponent = (
        <img src={currentProfile.avatar} className="w-full h-full object-cover pointer-events-none" alt="Mock Avatar" />
      );
    } else {
      innerComponent = (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-400">
          <i className="fa-solid fa-user-tie text-3xl sm:text-4xl text-slate-500"></i>
          <span className="text-[9px] font-semibold mt-1">รูปถ่าย</span>
        </div>
      );
    }
  } else if (el.type === 'image') {
    if (isImageSrc(el.content)) {
      innerComponent = (
        <img src={el.content} className="w-full h-full object-cover pointer-events-none" alt="Custom" />
      );
    } else {
      innerComponent = (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 p-2">
          <i className="fa-regular fa-image text-2xl mb-1 text-slate-400"></i>
          <span className="text-[9px] font-semibold">อัปโหลดรูปภาพ</span>
        </div>
      );
    }
  } else if (el.type === 'emblem') {
    const isGaruda = el.content === 'garuda' || el.content === 'krut';
    const isMilitary = el.content === 'military';
    const isCustomImg = isImageSrc(el.content);
    const imgSrc = isGaruda ? '/garuda.png' : isMilitary ? '/images/military-logo.jpg' : isCustomImg ? el.content : null;

    innerComponent = imgSrc ? (
      <img src={imgSrc} className="w-full h-full object-contain pointer-events-none" alt="Emblem" />
    ) : (
      <div className="w-full h-full flex items-center justify-center p-1">
        <svg viewBox="0 0 24 24" className="w-4/5 h-4/5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 4v6c0 5.25-3.5 10-7 12-3.5-2-7-6.75-7-12V6l7-4z" fill="currentColor" fillOpacity="0.2" />
        </svg>
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
  const rotatableRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(false);

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (el.locked) return;

    const rect = rotatableRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setIsRotating(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const dx = moveEvent.clientX - centerX;
      const dy = moveEvent.clientY - centerY;

      // Handle is located at top (-y), so unrotated vector is at -90 deg. Offset is +90 deg.
      let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      deg = (deg % 360 + 360) % 360;

      if (moveEvent.shiftKey) {
        deg = Math.round(deg / 15) * 15;
        if (deg >= 360) deg = 0;
      } else {
        deg = Math.round(deg);
      }

      onUpdate(el.id, { rotation: deg });
    };

    const handleMouseUp = () => {
      setIsRotating(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <Rnd
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
      disableDragging={el.locked || isRotating}
      enableResizing={
        !el.locked && isSelected && !isRotating
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
      className="group absolute select-none"
      style={{ zIndex: el.zIndex }}
    >
      {/* Rotatable Element Box */}
      <div
        ref={rotatableRef}
        className={`w-full h-full relative ${
          isSelected
            ? 'ring-2 ring-primary-500 shadow-xl'
            : 'hover:outline hover:outline-1 hover:outline-primary-400/80 cursor-pointer'
        }`}
        style={{
          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
          transformOrigin: 'center center',
          transition: isRotating ? 'none' : 'transform 0.05s ease-out'
        }}
      >
        <div style={innerStyle}>{innerComponent}</div>

        {/* Canva-style Corner Anchor Nodes & Rotation Handle when selected */}
        {isSelected && !el.locked && (
          <>
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary-600 rounded-full shadow-sm pointer-events-none" />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary-600 rounded-full shadow-sm pointer-events-none" />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary-600 rounded-full shadow-sm pointer-events-none" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary-600 rounded-full shadow-sm pointer-events-none" />

            {/* Interactive Rotation Handle */}
            <div
              className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing z-50 select-none group/rotator"
              onMouseDown={handleRotateStart}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onUpdate(el.id, { rotation: 0 });
              }}
              title="คลิกและลากเพื่อหมุน (กด Shift ค้างเพื่อล็อกทีละ 15°, ดับเบิลคลิกเพื่อรีเซ็ต 0°)"
            >
              {/* Circular Rotation Knob */}
              <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 border-2 border-primary-500 shadow-md flex items-center justify-center text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all">
                <i className="fa-solid fa-arrows-rotate text-[11px]" />
              </div>
              {/* Stem line connecting knob to element */}
              <div className="w-0.5 h-2 bg-primary-500" />

              {/* Real-time Angle Tooltip badge */}
              {(isRotating || (el.rotation !== undefined && el.rotation !== 0)) && (
                <div className="absolute -top-6 px-1.5 py-0.5 bg-slate-900/95 text-white font-mono text-[9px] rounded-md border border-slate-700 shadow-md pointer-events-none whitespace-nowrap">
                  {Math.round(el.rotation || 0)}°
                </div>
              )}
            </div>

            {/* Size & Angle badge at bottom */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-primary-950/90 text-primary-300 font-mono text-[9px] rounded border border-primary-700/60 shadow whitespace-nowrap pointer-events-none flex items-center gap-1.5">
              <span>{el.width} × {el.height} px</span>
              {Boolean(el.rotation) && (
                <span className="text-amber-400 font-bold border-l border-primary-700 pl-1">
                  {Math.round(el.rotation || 0)}°
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </Rnd>
  );
}
