'use client';

/**
 * CanvasBadgeRenderer.tsx
 *
 * Client component that renders a Canvas Studio badge template faithfully.
 *
 * Strategy:
 *   1. Render a CR80Card (physical mm-sized container).
 *   2. Inside, place a full-resolution canvas (baseW × baseH px) matching the
 *      pixel dimensions used by the BadgeCanvasEditor.
 *   3. Measure the CR80Card's *actual* pixel size via ResizeObserver.
 *   4. Apply CSS transform:scale so the inner canvas exactly fills the card.
 *
 * This guarantees that all element positions/sizes (stored in pixels by the
 * canvas editor) map 1:1 at the preview and print stages without any
 * lossy pixel→% conversion.
 */

import React, { useRef, useState, useLayoutEffect, useMemo } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Barcode from 'react-barcode';
import { getPersonnelAvatarUrl, isImageSrc } from '@/modules/users';
import { resolveBadgeFontFamily } from './canvas/types';
import CR80Card from './CR80Card';

interface CanvasBadgeRendererProps {
  /** Raw parsed canvas element array (from badgeCanvasConfig JSON) */
  canvasElements: any[];
  /** Resolved personnel data bound to the template fields */
  personnel: {
    prefix?: string;
    firstName?: string;
    lastName?: string;
    personnelType?: string;
    position?: string;
    department?: string;
    subDepartment?: string;
    badgeNo?: string;
    officialId?: string;
    citizenId?: string;
    bloodType?: string;
    phone?: string;
    mobile?: string;
    email?: string;
    emergencyContactPhone?: string;
    commissionDate?: string;
    avatarColor?: string;
    id?: string;
  };
  /** Badge system settings for field fallbacks */
  settings?: {
    organizationName?: string;
    organizationAddress?: string;
    cardTermsConditions?: string;
    systemName?: string;
    badgeColorMode?: string;
    badgeCustomColor?: string;
    colorCommissioned?: string;
    colorNonCommissioned?: string;
    colorConscript?: string;
  };
  /** Dynamic accent color (from personnel type / rank) */
  accentColor?: string;
  /** Optional QR code value */
  qrValue?: string;
}

export default function CanvasBadgeRenderer({
  canvasElements,
  personnel,
  settings,
  accentColor,
  qrValue,
}: CanvasBadgeRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);

  const resolvedAccentColor = useMemo(() => {
    if (accentColor) return accentColor;
    const colorMode = settings?.badgeColorMode || 'auto';
    if (colorMode === 'custom' && settings?.badgeCustomColor) {
      return settings.badgeCustomColor;
    }
    const combined = `${personnel.personnelType || ''} ${personnel.position || ''}`.trim();
    if (combined.includes('พนักงานราชการ') || combined.includes('ประทวน') || combined.includes('ลูกจ้าง')) {
      return settings?.colorNonCommissioned || '#d97706';
    }
    if (combined.includes('กองประจำการ') || combined.includes('พลทหาร')) {
      return settings?.colorConscript || '#16a34a';
    }
    if (combined.includes('สัญญาบัตร')) {
      return settings?.colorCommissioned || '#dc2626';
    }
    return settings?.colorCommissioned || '#dc2626';
  }, [accentColor, settings, personnel.personnelType, personnel.position]);

  const isLandscape = canvasElements.some((el) => el.id?.startsWith('ls-'));
  const baseW = isLandscape ? 600 : 380;
  const baseH = isLandscape ? 380 : 600;

  const avatar = getPersonnelAvatarUrl(personnel);

  // Measure the actual rendered size of the CR80Card and compute scale factor.
  // Uses ResizeObserver for accuracy across all screen DPIs.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      // Scale so inner canvas (baseW×baseH) fills the card width exactly
      const newScale = rect.width / baseW;
      setScale(newScale);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [baseW]);

  const resolveContent = (el: any): React.ReactNode => {
    if (el.field === 'fullName') return `${personnel.prefix || ''}${personnel.firstName || ''} ${personnel.lastName || ''}`.trim();
    if (el.field === 'firstName') return personnel.firstName || '';
    if (el.field === 'lastName') return personnel.lastName || '';
    if (el.field === 'prefix') return personnel.prefix || '';
    if (el.field === 'rank') return personnel.personnelType || '';
    if (el.field === 'position') return personnel.position || '';
    if (el.field === 'department') {
      return settings?.organizationName || (personnel.department?.includes('ศูนย์ฝึกทางยุทธวิธีกองทัพบก') ? 'ศูนย์ฝึกทางยุทธวิธีกองทัพบก' : personnel.department) || settings?.systemName || '';
    }
    if (el.field === 'subDepartment') return personnel.subDepartment || '';
    if (el.field === 'badgeNo') return personnel.badgeNo || '';
    if (el.field === 'citizenId') return personnel.citizenId || '';
    if (el.field === 'bloodType') return personnel.bloodType
      ? (personnel.bloodType.includes('Rh') ? personnel.bloodType : `หมู่โลหิต ${personnel.bloodType}`)
      : '';
    if (el.field === 'phone') return personnel.phone || personnel.mobile || '-';
    if (el.field === 'mobile') return personnel.mobile || '-';
    if (el.field === 'email') return personnel.email || '-';
    if (el.field === 'emergencyContactPhone') return personnel.emergencyContactPhone || '-';
    if (el.field === 'organizationName') {
      return settings?.organizationName || (personnel.department?.includes('ศูนย์ฝึกทางยุทธวิธีกองทัพบก') ? 'ศูนย์ฝึกทางยุทธวิธีกองทัพบก' : personnel.department) || '';
    }
    if (el.field === 'organizationAddress') return settings?.organizationAddress || '';
    if (el.field === 'cardTermsConditions') return settings?.cardTermsConditions || '';
    if (el.field === 'issueDate') {
      if ((personnel as any).issueDate) return (personnel as any).issueDate;
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear() + 543}`;
    }
    if (el.field === 'expireDate') {
      if ((personnel as any).expireDate) return (personnel as any).expireDate;
      const exp = new Date();
      exp.setFullYear(exp.getFullYear() + 1);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${pad(exp.getDate())}/${pad(exp.getMonth() + 1)}/${exp.getFullYear() + 543}`;
    }
    return el.content;
  };

  const renderElement = (el: any) => {
    if (el.hidden) return null;

    const elBgColor = el.gradientEnabled
      ? `linear-gradient(${
          el.gradientDirection === 'to-r' ? 'to right'
          : el.gradientDirection === 'to-br' ? 'to bottom right'
          : el.gradientDirection === 'to-tr' ? 'to top right'
          : 'to bottom'
        }, ${el.gradientFrom || '#3b82f6'}, ${el.gradientTo || '#1e3a8a'})`
      : el.dynamicBg
        ? resolvedAccentColor
        : el.backgroundColor || 'transparent';

    const elColor = el.dynamicText ? resolvedAccentColor : (el.color || '#0f172a');
    const elBorderColor = el.dynamicBorder ? resolvedAccentColor : (el.borderColor || 'transparent');

    const elStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${el.x}px`,
      top: `${el.y}px`,
      width: `${el.width}px`,
      height: `${el.height}px`,
      transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
      transformOrigin: 'center center',
      fontSize: el.fontSize ? `${el.fontSize}px` : undefined,
      fontFamily: resolveBadgeFontFamily(el.fontFamily),
      color: elColor,
      background: elBgColor,
      fontWeight: el.fontWeight || 'normal',
      fontStyle: el.fontStyle || 'normal',
      textAlign: el.textAlign || 'left',
      letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined,
      borderWidth: el.borderWidth ? `${el.borderWidth}px` : undefined,
      borderStyle: el.borderStyle || 'solid',
      borderColor: elBorderColor,
      borderRadius: `${el.borderRadius || 0}px`,
      opacity: el.opacity !== undefined ? el.opacity / 100 : 1,
      zIndex: el.zIndex,
      display: 'flex',
      alignItems: 'center',
      justifyContent:
        el.textAlign === 'center' ? 'center'
        : el.textAlign === 'right' ? 'flex-end'
        : el.textAlign === 'justify' ? 'space-between'
        : 'flex-start',
      overflow: 'hidden',
      boxSizing: 'border-box',
      lineHeight: 1.2,
      // Note: SVG foreignObject (used by html-to-image/toPng) has a known browser bug
      // where CSS box-shadow combined with transform:scale produces miscalculated, unrounded
      // rectangular ghost shadow blocks. Badge card elements must remain flat.
      boxShadow: undefined,
    };

    // Personnel Avatar Photo element
    if (el.field === 'avatar') {
      const imgBorder = el.dynamicBorder
        ? `2px solid ${resolvedAccentColor}`
        : el.borderWidth
          ? `${el.borderWidth}px ${el.borderStyle || 'solid'} ${elBorderColor}`
          : 'none';
      return (
        <div key={el.id} style={elStyle}>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', border: imgBorder, borderRadius: `${el.borderRadius || 0}px`, overflow: 'hidden' }}>
            {avatar ? (
              <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: (el.objectFit as any) || 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700, color: 'white', backgroundColor: resolvedAccentColor }}>
                {personnel.firstName?.[0] || 'U'}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Static Image / Logo / Graphic element
    if (el.type === 'image') {
      const hasImage = isImageSrc(el.content);
      return (
        <div key={el.id} style={elStyle}>
          {hasImage ? (
            <img src={el.content} alt="Custom" style={{ width: '100%', height: '100%', objectFit: (el.objectFit as any) || 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', color: '#94a3b8', fontSize: '10px' }}>
              <i className="fa-regular fa-image" style={{ fontSize: '1.5rem', marginBottom: '4px' }}></i>
              <span>รูปภาพ</span>
            </div>
          )}
        </div>
      );
    }

    // Emblem / Logo
    if (el.type === 'emblem') {
      const isGaruda = el.content === 'garuda' || el.content === 'krut';
      const isMilitary = el.content === 'military';
      const isCustomImg = isImageSrc(el.content);
      const imgSrc = isGaruda ? '/garuda.png' : isMilitary ? '/images/military-logo.jpg' : isCustomImg ? el.content : null;

      return (
        <div key={el.id} style={elStyle}>
          {imgSrc ? (
            <img
              src={imgSrc}
              alt="Emblem"
              style={{ width: '100%', height: '100%', objectFit: (el.objectFit as any) || 'contain', display: 'block' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: resolvedAccentColor || '#f59e0b', maxWidth: '80%', maxHeight: '80%' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 4v6c0 5.25-3.5 10-7 12-3.5-2-7-6.75-7-12V6l7-4z" fill="currentColor" fillOpacity="0.15" />
              </svg>
            </div>
          )}
        </div>
      );
    }

    // Hologram
    if (el.type === 'hologram') {
      return (
        <div
          key={el.id}
          style={{
            ...elStyle,
            background: 'linear-gradient(to right, #fb7185, #fcd34d, #34d399, #22d3ee, #818cf8)',
            opacity: (el.opacity !== undefined ? el.opacity / 100 : 1) * 0.8,
          }}
        >
          <span style={{ fontSize: '7px', fontWeight: 900, letterSpacing: '0.1em', color: 'rgba(15,23,42,0.6)', textTransform: 'uppercase' }}>
            SECURE HOLOGRAM
          </span>
        </div>
      );
    }

    // QR Code
    if (el.type === 'qr' || el.field === 'qr') {
      const qrVal = qrValue || (typeof window !== 'undefined' ? `${window.location.origin}/verify/${personnel.id}` : `ID-${personnel.badgeNo || '12345678'}`);
      return (
        <div key={el.id} style={elStyle}>
          <QRCodeCanvas value={qrVal} size={Math.min(el.width, el.height)} style={{ width: '100%', height: '100%' }} />
        </div>
      );
    }

    // Barcode
    if (el.type === 'barcode') {
      return (
        <div key={el.id} style={elStyle}>
          <div style={{ width: '100%', height: '100%', padding: '4px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
            <Barcode value={personnel.badgeNo || personnel.officialId || '12345678'} width={1.2} height={Math.max(16, el.height * 0.6)} fontSize={8} margin={0} />
          </div>
        </div>
      );
    }

    // Text / generic
    return (
      <div key={el.id} style={elStyle}>
        <span style={{ width: '100%', textAlign: el.textAlign || 'left', display: 'inline-block', padding: '0 2px' }}>
          {resolveContent(el)}
        </span>
      </div>
    );
  };

  return (
    <CR80Card isLandscape={isLandscape}>
      {/*
        Transparent measurement target — same size as CR80Card.
        ResizeObserver watches this div to compute scale factor.
      */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      />

      {/*
        Inner canvas at full editor resolution (baseW × baseH px).
        Scaled so it exactly fills the CR80Card using the measured scale factor.
        transformOrigin: top left anchors to the card's top-left corner.
      */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${baseW}px`,
          height: `${baseH}px`,
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          fontFamily: "'TH Sarabun New', 'THSarabunNew', 'Sarabun', sans-serif",
        }}
      >
        {canvasElements.map(renderElement)}
      </div>
    </CR80Card>
  );
}
