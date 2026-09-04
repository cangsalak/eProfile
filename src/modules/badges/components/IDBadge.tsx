'use client';

import React from 'react';
import { Personnel } from '@/types/personnel';
import { QRCodeCanvas } from 'qrcode.react';
import Barcode from 'react-barcode';

interface IDBadgeProps {
  personnel: Personnel;
  settings?: {
    badgeTemplate?: string;
    badgeColorMode?: string;
    badgeCustomColor?: string;
    badgeShowBloodType?: string;
    badgeShowBarcode?: string;
    badgeCanvasConfig?: string;
    badgeBackCanvasConfig?: string;
    systemName?: string;
    systemLogo?: string;
    organizationName?: string;
    organizationAddress?: string;
    organizationPhone?: string;
    cardTermsConditions?: string;
    colorCommissioned?: string;
    colorNonCommissioned?: string;
    colorConscript?: string;
  };
  qrValue?: string;
  isBack?: boolean;
}

export default function IDBadge({ personnel, settings, qrValue, isBack }: IDBadgeProps) {
  const avatar = (personnel.avatarColor?.startsWith('data:image') || personnel.avatarColor?.startsWith('http'))
    ? personnel.avatarColor 
    : null;

  const isModern = settings?.badgeTemplate === 'modern';
  const isCanvas = settings?.badgeTemplate === 'canvas';
  const showBloodType = settings?.badgeShowBloodType !== 'false';
  const showBarcode = settings?.badgeShowBarcode !== 'false';
  const colorMode = settings?.badgeColorMode || 'auto';
  
  const getTypeColor = (type?: string) => {
    if (colorMode === 'custom' && settings?.badgeCustomColor) {
      return settings.badgeCustomColor;
    }
    
    switch (type) {
      case 'นายทหารสัญญาบัตร': return settings?.colorCommissioned || '#dc2626'; // red-600
      case 'นายทหารประทวน': 
      case 'พนักงานราชการ': 
      case 'ลูกจ้าง': return settings?.colorNonCommissioned || '#d97706'; // amber-600
      case 'ทหารกองประจำการ': return settings?.colorConscript || '#16a34a'; // green-600
      default: return '#334155'; // slate-700
    }
  };

  const headerBgColor = getTypeColor(personnel.personnelType);

  // STANDARD BACK SIDE FOR ALL TEMPLATES
  if (isBack) {
    return (
      <div 
        className="cr80-card relative bg-white shadow-md rounded-lg flex flex-col justify-between p-4 overflow-hidden"
        style={{ width: '54mm', height: '86mm', boxSizing: 'border-box', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
      >
        {/* Faint Background Graphics */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div 
            className="absolute top-[-30px] right-[-30px] w-40 h-40 rounded-full"
            style={{ backgroundColor: headerBgColor }}
          />
          <div 
            className="absolute bottom-[-40px] left-[-20px] w-48 h-48 rounded-full"
            style={{ backgroundColor: headerBgColor }}
          />
        </div>

        <div className="text-center mt-2 relative z-10">
          <h4 className="font-bold text-[14px] text-slate-800 border-b pb-2 mb-2">ข้อมูลผู้ถือบัตร</h4>
          <div className="text-[10px] text-slate-600 space-y-2 mt-4 text-left px-2">
            <div className="flex items-center gap-2">
              <span>โทร: {personnel.phone || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>มือถือ: {personnel.mobile || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>อีเมล: {personnel.email || '-'}</span>
            </div>
            {showBloodType && personnel.bloodType && (
              <div className="flex items-center gap-2 mt-3 text-red-600 font-semibold">
                <span>กรุ๊ปเลือด {personnel.bloodType}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex flex-col items-center justify-center text-center relative z-10">
          <p className="text-[9px] font-bold text-slate-700 mb-1">
            {settings?.organizationName || 'หน่วยงานต้นสังกัด'}
          </p>
          <p className="text-[8px] text-slate-500 max-w-[90%] leading-relaxed">
            {settings?.organizationAddress || 'กรุณาตั้งค่าที่อยู่หน่วยงาน'}
          </p>
          {settings?.organizationPhone && (
            <p className="text-[8px] text-slate-500 mt-1">
              โทรศัพท์: {settings.organizationPhone}
            </p>
          )}
          <div className="w-full h-px bg-slate-200 my-3"></div>
          <p className="text-[8px] text-slate-400 max-w-[80%] whitespace-pre-line">
            {settings?.cardTermsConditions || 'หากเก็บได้กรุณาส่งคืนตามที่อยู่ด้านบน'}
          </p>
        </div>
      </div>
    );
  }

  if (isCanvas && settings) {
    const configString = isBack ? (settings.badgeBackCanvasConfig || settings.badgeCanvasConfig) : settings.badgeCanvasConfig;
    if (configString) {
      let canvasElements: any[] = [];
      try {
        canvasElements = JSON.parse(configString);
      } catch (e) {
        console.error('Invalid canvas config', e);
      }

      const isLandscape = canvasElements.some(el => el.id?.startsWith('ls-'));
      const cardWidth = isLandscape ? '86mm' : '54mm';
      const cardHeight = isLandscape ? '54mm' : '86mm';
      
      return (
        <div 
          className="relative overflow-hidden bg-white shadow-md rounded-lg"
          style={{ width: cardWidth, height: cardHeight, boxSizing: 'border-box', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
        >
          {canvasElements.map(el => {
            let content: React.ReactNode = el.content;
            if (el.field === 'fullName') content = `${personnel.prefix || ''}${personnel.firstName || ''} ${personnel.lastName || ''}`.trim();
            else if (el.field === 'firstName') content = personnel.firstName || '';
            else if (el.field === 'lastName') content = personnel.lastName || '';
            else if (el.field === 'prefix') content = personnel.prefix || '';
            else if (el.field === 'rank') content = personnel.personnelType || '';
            else if (el.field === 'position') content = personnel.position || '';
            else if (el.field === 'department') content = personnel.department || settings.systemName || '';
            else if (el.field === 'subDepartment') content = personnel.subDepartment || '';
            else if (el.field === 'badgeNo') content = personnel.badgeNo || '';
            else if (el.field === 'citizenId') content = personnel.citizenId || '';
            else if (el.field === 'bloodType') content = personnel.bloodType ? `หมู่โลหิต ${personnel.bloodType}` : '';
            else if (el.field === 'issueDate') content = '01/01/2567';
            else if (el.field === 'expireDate') content = '31/12/2570';

            const dynamicColor = headerBgColor;
            const elBgColor = el.gradientEnabled 
              ? `linear-gradient(${el.gradientDirection === 'to-r' ? 'to right' : el.gradientDirection === 'to-br' ? 'to bottom right' : el.gradientDirection === 'to-tr' ? 'to top right' : 'to bottom'}, ${el.gradientFrom || '#3b82f6'}, ${el.gradientTo || '#1e3a8a'})`
              : el.dynamicBg ? dynamicColor : (el.backgroundColor || 'transparent');
            
            const elColor = el.dynamicText ? dynamicColor : (el.color || '#0f172a');
            const elBorderColor = el.dynamicBorder ? dynamicColor : (el.borderColor || 'transparent');

            const style: React.CSSProperties = {
              position: 'absolute',
              left: `${el.x}%`,
              top: `${el.y}%`,
              width: `${el.width}%`,
              height: `${el.height}%`,
              transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
              fontSize: el.fontSize ? `${el.fontSize}px` : undefined,
              fontFamily: el.fontFamily ? `var(--font-${el.fontFamily.toLowerCase()})` : undefined,
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
              justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : el.textAlign === 'justify' ? 'space-between' : 'flex-start',
              overflow: 'hidden',
              boxSizing: 'border-box',
              boxShadow: el.boxShadow === 'sm' ? '0 1px 2px rgba(0,0,0,0.1)' : el.boxShadow === 'md' ? '0 4px 6px -1px rgba(0,0,0,0.15)' : el.boxShadow === 'lg' ? '0 10px 15px -3px rgba(0,0,0,0.2)' : el.boxShadow === 'glow' ? '0 0 15px rgba(59,130,246,0.5)' : undefined
            };

            if (el.type === 'image' || el.field === 'avatar') {
              const imgBorder = el.dynamicBorder ? `2px solid ${headerBgColor}` : (el.borderWidth ? `${el.borderWidth}px ${el.borderStyle || 'solid'} ${elBorderColor}` : 'none');
              return (
                <div key={el.id} style={style}>
                  <div className="w-full h-full flex items-center justify-center bg-slate-200" style={{ border: imgBorder, borderRadius: `${el.borderRadius || 0}px`, overflow: 'hidden' }}>
                    {avatar ? (
                      <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
                        style={{ backgroundColor: headerBgColor }}
                      >
                        {personnel.firstName?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            if (el.type === 'emblem') {
              return (
                <div key={el.id} style={style}>
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fa-solid fa-shield-halved text-2xl text-amber-500 drop-shadow"></i>
                  </div>
                </div>
              );
            }

            if (el.type === 'hologram') {
              return (
                <div key={el.id} style={style}>
                  <div className="w-full h-full bg-gradient-to-r from-rose-400 via-amber-300 via-emerald-400 via-cyan-400 to-indigo-400 opacity-80 flex items-center justify-center">
                    <span className="text-[7px] font-black tracking-widest text-slate-900/60 uppercase">SECURE HOLOGRAM</span>
                  </div>
                </div>
              );
            }

            if (el.type === 'qr' || el.field === 'qr') {
              return (
                <div key={el.id} style={style}>
                  {qrValue ? (
                    <QRCodeCanvas value={qrValue} size={100} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <QRCodeCanvas value={`ID-${personnel.badgeNo || '12345678'}`} size={100} style={{ width: '100%', height: '100%' }} />
                  )}
                </div>
              );
            }

            if (el.type === 'barcode') {
              return (
                <div key={el.id} style={style}>
                  <div className="w-full h-full p-1 bg-white flex flex-col items-center justify-center">
                    <Barcode value={personnel.badgeNo || '12345678'} width={1.2} height={24} fontSize={8} margin={0} />
                  </div>
                </div>
              );
            }

            return (
              <div key={el.id} style={style}>
                {content}
              </div>
            );
          })}
        </div>
      );
    }
  }

  // STANDARD BACK SIDE FOR CLASSIC AND MODERN


  if (isModern) {
    return (
      <div 
        className="relative overflow-hidden bg-slate-50 text-slate-900 shadow-md rounded-[10px]"
        style={{ width: '54mm', height: '86mm', boxSizing: 'border-box', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact', border: `2px solid ${headerBgColor}` }}
      >
        {/* Modern Header Pattern */}
        <div 
          className="absolute top-0 left-0 right-0 h-32 opacity-10"
          style={{ 
            backgroundColor: headerBgColor,
            backgroundImage: 'radial-gradient(circle at 50% -20%, currentColor 0%, transparent 70%)'
          }}
        ></div>

        { settings?.systemLogo && (
          <div className="absolute top-3 left-2 z-10 w-9 h-11">
            <img src={settings.systemLogo} alt="Logo" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
        )}
        <div className="absolute top-4 left-12 right-2 text-center z-10 flex flex-col items-center">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-800">{settings?.systemName || 'STAFF'}</div>
          <div className="w-8 h-1 mt-1 rounded-full" style={{ backgroundColor: headerBgColor }}></div>
        </div>

        {/* Profile Image - Circular */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-white p-1 shadow-lg z-20">
          <div className="w-full h-full rounded-full overflow-hidden border-2" style={{ borderColor: headerBgColor }}>
            {avatar ? (
              <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
                style={{ backgroundColor: headerBgColor }}
              >
                {personnel.firstName?.[0] || 'U'}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="absolute top-40 left-0 right-0 px-3 text-center flex flex-col items-center z-10">
          <h3 className="text-[13px] font-bold text-slate-900 leading-tight">
            {personnel.prefix}{personnel.firstName} {personnel.lastName}
          </h3>
          <p className="text-[9px] font-semibold text-slate-600 mt-0.5 leading-tight uppercase tracking-wide">
            {personnel.position || '-'}
          </p>
          
          <div className="mt-2 text-white text-[8px] font-bold px-3 py-1 rounded-full shadow-sm" style={{ backgroundColor: headerBgColor }}>
            {personnel.personnelType || 'STAFF'}
          </div>
          
          <div className="mt-2 w-full bg-white rounded-lg p-2 shadow-sm border border-slate-200 flex items-center justify-between">
            <div className="flex-1 pr-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[7px] text-slate-500 uppercase font-bold">ID Number</span>
                <span className="text-[9px] font-bold text-slate-800">{personnel.officialId || '-'}</span>
              </div>
              {showBloodType && (
                <div className="flex justify-between items-center">
                  <span className="text-[7px] text-slate-500 uppercase font-bold">Blood Type</span>
                  <span className="text-[9px] font-bold text-rose-600">{personnel.bloodType || '-'}</span>
                </div>
              )}
            </div>
            {showBarcode && (
              <div className="w-10 h-10 flex-shrink-0 bg-white border border-slate-100 rounded">
                <QRCodeCanvas 
                  value={typeof window !== 'undefined' ? `${window.location.origin}/verify/${personnel.id}` : `https://system/verify/${personnel.id}`} 
                  size={64} 
                  style={{ width: '100%', height: '100%' }} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Barcode Footer */}
        {showBarcode && (
          <div className="absolute bottom-1 left-0 right-0 flex justify-center z-10 opacity-80">
            <Barcode 
              value={personnel.officialId || '0000000000'} 
              width={1.2} 
              height={22} 
              displayValue={false}
              background="transparent" 
              margin={0} 
            />
          </div>
        )}
      </div>
    );
  }

  // Classic Template (Original)
  return (
    <div 
      className="relative overflow-hidden bg-white text-slate-900 border border-slate-300 shadow-md"
      style={{ width: '54mm', height: '86mm', boxSizing: 'border-box', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
    >
      {/* Header / Top Banner */}
      <div 
        className="absolute top-0 left-0 right-0 h-16 flex flex-col items-center justify-start pt-2 text-white"
        style={{ backgroundColor: headerBgColor }}
      >
        <div className="text-[10px] font-bold uppercase tracking-wider text-white">บัตรประจำตัวเจ้าหน้าที่</div>
        <div className="text-[8px] font-medium opacity-90 text-white truncate w-11/12 text-center">{settings?.systemName || personnel.department || 'STAFF'}</div>
      </div>

      {/* Profile Image */}
      <div className="absolute top-11 left-1/2 -translate-x-1/2 w-20 h-24 bg-white p-1 shadow-sm border border-slate-200">
        {avatar ? (
          <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
            style={{ backgroundColor: personnel.avatarColor || '#3b82f6' }}
          >
            {personnel.firstName?.[0] || 'U'}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="absolute top-36 left-0 right-0 px-2 text-center flex flex-col items-center">
        <h3 className="text-[12px] font-bold leading-tight" style={{ color: headerBgColor }}>
          {personnel.prefix}{personnel.firstName} {personnel.lastName}
        </h3>
        <p className="text-[9px] font-semibold text-slate-700 mt-1 leading-tight">
          {personnel.position || '-'}
        </p>
        <p className="text-[8px] font-medium text-white px-2 py-0.5 rounded-full mt-1" style={{ backgroundColor: '#475569' }}>
          {personnel.personnelType || 'นายทหารสัญญาบัตร'}
        </p>
        
        <div className="mt-1 w-full px-2">
          <div className="flex justify-between items-center border-b border-dashed border-slate-300 py-1">
            <span className="text-[8px] text-slate-500">รหัสประจำตัว</span>
            <span className="text-[9px] font-semibold">{personnel.officialId || '-'}</span>
          </div>
          {showBloodType && (
            <div className="flex justify-between items-center border-b border-dashed border-slate-300 py-1">
              <span className="text-[8px] text-slate-500">กรุ๊ปเลือด</span>
              <span className="text-[9px] font-semibold text-rose-600">{personnel.bloodType || '-'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-slate-100 flex items-center justify-between px-2 border-t border-slate-200">
        <p className="text-[6px] text-slate-500 w-2/3 leading-tight">หากพบเห็นบัตรนี้ กรุณาส่งคืน {personnel.department}</p>
        {showBarcode && (
          <div className="w-6 h-6 bg-white p-0.5 shadow-sm border border-slate-200 flex-shrink-0">
            <QRCodeCanvas 
              value={typeof window !== 'undefined' ? `${window.location.origin}/verify/${personnel.id}` : `https://system/verify/${personnel.id}`} 
              size={64} 
              style={{ width: '100%', height: '100%' }} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
