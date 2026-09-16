import React from 'react';
import { Personnel } from '@/modules/users';
import { QRCodeCanvas } from 'qrcode.react';
import Barcode from 'react-barcode';
import CR80Card from './CR80Card';

interface IDBadgeProps {
  personnel: Personnel;
  settings?: {
    badgeTemplate?: string;
    badgeHeaderTitle?: string;
    badgeSubHeaderTitle?: string;
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
  
  const getTypeColor = (type?: string, position?: string) => {
    if (colorMode === 'custom' && settings?.badgeCustomColor) {
      return settings.badgeCustomColor;
    }
    
    const combined = `${type || ''} ${position || ''}`.trim();
    if (!combined) return settings?.colorCommissioned || '#dc2626';

    if (combined.includes('พนักงานราชการ') || combined.includes('ประทวน') || combined.includes('ลูกจ้าง')) {
      return settings?.colorNonCommissioned || '#d97706'; // amber-600
    }
    if (combined.includes('กองประจำการ') || combined.includes('พลทหาร')) {
      return settings?.colorConscript || '#16a34a'; // green-600
    }
    if (combined.includes('สัญญาบัตร')) {
      return settings?.colorCommissioned || '#dc2626'; // red-600
    }
    return settings?.colorCommissioned || '#dc2626';
  };

  const headerBgColor = getTypeColor(personnel.personnelType, personnel.position);

  // 1. CANVAS STUDIO TEMPLATE (FRONT OR BACK)
  if (isCanvas && settings) {
    const configString = isBack ? settings.badgeBackCanvasConfig : settings.badgeCanvasConfig;
    if (configString) {
      let canvasElements: any[] = [];
      try {
        canvasElements = JSON.parse(configString);
      } catch (e) {
        console.error('Invalid canvas config', e);
      }

      if (canvasElements && canvasElements.length > 0) {
        const isLandscape = canvasElements.some(el => el.id?.startsWith('ls-'));
        const baseW = isLandscape ? 600 : 380;
        const baseH = isLandscape ? 380 : 600;
        
        return (
          <CR80Card isLandscape={isLandscape}>
            {canvasElements.map(el => {
              let content: React.ReactNode = el.content;
              if (el.field === 'fullName') content = `${personnel.prefix || ''}${personnel.firstName || ''} ${personnel.lastName || ''}`.trim();
              else if (el.field === 'firstName') content = personnel.firstName || '';
              else if (el.field === 'lastName') content = personnel.lastName || '';
              else if (el.field === 'prefix') content = personnel.prefix || '';
              else if (el.field === 'rank') content = personnel.personnelType || '';
              else if (el.field === 'position') content = personnel.position || '';
              else if (el.field === 'department') content = personnel.department || settings.organizationName || settings.systemName || '';
              else if (el.field === 'subDepartment') content = personnel.subDepartment || '';
              else if (el.field === 'badgeNo') content = personnel.badgeNo || '';
              else if (el.field === 'citizenId') content = personnel.citizenId || '';
              else if (el.field === 'bloodType') content = personnel.bloodType ? (personnel.bloodType.includes('Rh') ? personnel.bloodType : `หมู่โลหิต ${personnel.bloodType}`) : '';
              else if (el.field === 'phone') content = personnel.phone || personnel.mobile || '-';
              else if (el.field === 'mobile') content = personnel.mobile || '-';
              else if (el.field === 'email') content = personnel.email || '-';
              else if (el.field === 'emergencyContactPhone') content = personnel.emergencyContactPhone || '-';
              else if (el.field === 'organizationName') content = settings.organizationName || personnel.department || '';
              else if (el.field === 'organizationAddress') content = settings.organizationAddress || '';
              else if (el.field === 'cardTermsConditions') content = settings.cardTermsConditions || '';
              else if (el.field === 'issueDate') content = personnel.commissionDate || '01/01/2567';
              else if (el.field === 'expireDate') content = '31/12/2571';

              const dynamicColor = headerBgColor;
              const elBgColor = el.gradientEnabled 
                ? `linear-gradient(${el.gradientDirection === 'to-r' ? 'to right' : el.gradientDirection === 'to-br' ? 'to bottom right' : el.gradientDirection === 'to-tr' ? 'to top right' : 'to bottom'}, ${el.gradientFrom || '#3b82f6'}, ${el.gradientTo || '#1e3a8a'})`
                : el.dynamicBg ? dynamicColor : (el.backgroundColor || 'transparent');
              
              const elColor = el.dynamicText ? dynamicColor : (el.color || '#0f172a');
              const elBorderColor = el.dynamicBorder ? dynamicColor : (el.borderColor || 'transparent');

              const isPixelSpace = el.x > 100 || el.y > 100 || el.width > 100 || el.height > 100;
              const leftVal = isPixelSpace ? `${(el.x / baseW) * 100}%` : `${el.x}%`;
              const topVal = isPixelSpace ? `${(el.y / baseH) * 100}%` : `${el.y}%`;
              const widthVal = isPixelSpace ? `${(el.width / baseW) * 100}%` : `${el.width}%`;
              const heightVal = isPixelSpace ? `${(el.height / baseH) * 100}%` : `${el.height}%`;

              const style: React.CSSProperties = {
                position: 'absolute',
                left: leftVal,
                top: topVal,
                width: widthVal,
                height: heightVal,
                transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                fontSize: el.fontSize ? `${Math.round(el.fontSize * 0.75)}px` : undefined,
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

              if (el.type === 'image' && el.field === 'static' && typeof el.content === 'string' && (el.content.startsWith('data:image/') || el.content.startsWith('http') || el.content.startsWith('/'))) {
                return (
                  <div key={el.id} style={style}>
                    <img src={el.content} alt="Custom" className="w-full h-full object-cover" />
                  </div>
                );
              }

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
                      <QRCodeCanvas value={typeof window !== 'undefined' ? `${window.location.origin}/verify/${personnel.id}` : `ID-${personnel.badgeNo || '12345678'}`} size={100} style={{ width: '100%', height: '100%' }} />
                    )}
                  </div>
                );
              }

              if (el.type === 'barcode') {
                return (
                  <div key={el.id} style={style}>
                    <div className="w-full h-full p-1 bg-white flex flex-col items-center justify-center">
                      <Barcode value={personnel.badgeNo || personnel.officialId || '12345678'} width={1.2} height={24} fontSize={8} margin={0} />
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
          </CR80Card>
        );
      }
    }
  }

  // 2. STANDARD DYNAMIC BACK SIDE (FOR CLASSIC & MODERN TEMPLATES)
  if (isBack) {
    const orgName = settings?.organizationName || personnel.department || 'กองทัพบก / กระทรวงกลาโหม';
    const orgAddr = settings?.organizationAddress || 'กรุณาตั้งค่าที่อยู่หน่วยงาน';
    const orgPhone = settings?.organizationPhone || personnel.phone || '';
    const terms = settings?.cardTermsConditions || '1. บัตรนี้เป็นทรัพย์สินของทางราชการ ห้ามโอนให้ผู้อื่นนำไปใช้\n2. กรณีบัตรสูญหายหรือชำรุด ให้รีบแจ้งหน่วยงานต้นสังกัดทันที\n3. หากเก็บได้กรุณาส่งคืนตามที่อยู่ด้านบน';

    return (
      <CR80Card className="flex flex-col justify-between font-prompt">
        {/* Dynamic Watermark Background Graphics */}
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

        {/* Full-width Top Header matching Front Card */}
        <div 
          className="w-full text-white py-2 px-3 text-center relative z-10 shadow-xs flex items-center justify-between"
          style={{ backgroundColor: headerBgColor }}
        >
          <span className="text-[9.5px] font-black tracking-wider uppercase">
            ด้านหลังบัตร (CARD BACK)
          </span>
          <span className="text-[8px] opacity-90 font-mono font-bold bg-black/20 px-1.5 py-0.5 rounded">
            {personnel.badgeNo || 'ID'}
          </span>
        </div>

        {/* Card Body Content with padding */}
        <div className="flex-1 flex flex-col justify-between p-2.5 pt-1.5 relative z-10">
          <div>
            <div className="text-left mb-1">
              <p className="text-[10px] font-bold text-slate-900 truncate">
                {personnel.prefix || ''} {personnel.firstName} {personnel.lastName}
              </p>
              <p className="text-[8.5px] text-slate-500 truncate">
                {personnel.position || 'เจ้าหน้าที่'} • {personnel.department || orgName}
              </p>
            </div>

            <div className="text-[9px] text-slate-700 space-y-1 text-left px-1.5 py-1 bg-slate-50 rounded-md border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">โทรศัพท์:</span>
                <span className="font-semibold text-slate-800">{personnel.phone || personnel.mobile || '-'}</span>
              </div>
              {personnel.mobile && personnel.phone && personnel.mobile !== personnel.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">มือถือ:</span>
                  <span className="font-semibold text-slate-800">{personnel.mobile}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">อีเมล:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[120px]">{personnel.email || '-'}</span>
              </div>
              {showBloodType && personnel.bloodType && (
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-slate-500">หมู่โลหิต:</span>
                  <span className="font-bold text-rose-600">{personnel.bloodType}</span>
                </div>
              )}
              {personnel.emergencyContactPhone && (
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-slate-500">ติดต่อฉุกเฉิน:</span>
                  <span className="font-semibold text-slate-800">{personnel.emergencyContactPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* QR & Verification */}
          <div className="flex items-center justify-center my-0.5">
            <div className="p-1 bg-white border border-slate-200 rounded-md shadow-xs flex items-center gap-2">
              <QRCodeCanvas 
                value={qrValue || (typeof window !== 'undefined' ? `${window.location.origin}/verify/${personnel.id}` : `ID-${personnel.badgeNo || '12345678'}`)} 
                size={44} 
              />
              <div className="text-left text-[7px] text-slate-500 leading-tight">
                <p className="font-bold text-slate-700">สแกนตรวจสอบ</p>
                <p>บัตรประจำตัวดิจิทัล</p>
                <p className="font-mono text-[6.5px] text-primary-600">{personnel.badgeNo || personnel.id}</p>
              </div>
            </div>
          </div>
          
          {/* Organization Details & Rules */}
          <div className="flex flex-col items-center justify-center text-center pt-1 border-t border-slate-100">
            <p className="text-[8.5px] font-bold text-slate-800 truncate max-w-full">
              {orgName}
            </p>
            <p className="text-[7px] text-slate-500 max-w-[95%] leading-tight truncate">
              {orgAddr}
            </p>
            {orgPhone && (
              <p className="text-[7px] text-slate-500">
                โทร: {orgPhone}
              </p>
            )}
            <p className="text-[6.5px] text-slate-400 max-w-[95%] whitespace-pre-line leading-tight mt-0.5">
              {terms}
            </p>
          </div>
        </div>
      </CR80Card>
    );
  }

  // STANDARD BACK SIDE FOR CLASSIC AND MODERN


  if (isModern) {
    return (
      <CR80Card 
        className="bg-slate-50 text-slate-900"
        style={{ border: `2px solid ${headerBgColor}` }}
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
          <div className="absolute top-2.5 left-2.5 z-10 w-7 h-7">
            <img src={settings.systemLogo} alt="Logo" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
        )}
        <div className={`absolute top-3.5 ${settings?.systemLogo ? 'left-10 right-2' : 'left-2 right-2'} text-center z-10 flex flex-col items-center`}>
          <div className="text-[10.5px] font-extrabold tracking-wide text-slate-800 truncate max-w-full">
            {settings?.badgeHeaderTitle || 'บัตรประจำตัวข้าราชการ'}
          </div>
          <div className="w-8 h-1 mt-1 rounded-full" style={{ backgroundColor: headerBgColor }}></div>
        </div>

        {/* Avatar with Ring */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-white p-1 shadow-lg z-20">
          <div className="w-full h-full rounded-full overflow-hidden border-2" style={{ borderColor: headerBgColor }}>
            {avatar ? (
              <img src={avatar} alt="Personnel" className="w-full h-full object-cover" />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center font-bold text-white text-xl"
                style={{ backgroundColor: headerBgColor }}
              >
                {personnel.firstName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="absolute top-36 left-0 right-0 bottom-0 p-3 pt-4 flex flex-col items-center justify-between text-center z-10">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight line-clamp-1">
              {personnel.prefix || ''}{personnel.firstName} {personnel.lastName}
            </h3>
            <p className="text-[9px] font-semibold text-slate-600 line-clamp-1 mt-0.5">
              {personnel.position || 'ตำแหน่งงาน'}
            </p>
            <p className="text-[8px] text-slate-400 line-clamp-1">
              {personnel.department || settings?.organizationName || settings?.systemName || 'หน่วยงานต้นสังกัด'}
            </p>
          </div>

          <div className="mt-2 text-white text-[8px] font-bold px-3 py-1 rounded-full shadow-sm" style={{ backgroundColor: headerBgColor }}>
            {personnel.personnelType || 'นายทหารสัญญาบัตร'}
          </div>

          {/* Quick Details Pill */}
          <div className="mt-2 w-full bg-white rounded-lg p-2 shadow-sm border border-slate-200 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[6.5px] text-slate-400 block uppercase font-bold">ID Number</span>
              <span className="text-[9px] font-black text-slate-800">{personnel.badgeNo || personnel.officialId || 'EP-0000'}</span>
            </div>
            {showBloodType && (
              <div className="text-right">
                <span className="text-[6.5px] text-slate-400 block uppercase font-bold">Blood Group</span>
                <span className="text-[9px] font-black text-rose-600">{personnel.bloodType || 'O'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Barcode Footer */}
        {showBarcode && (
          <div className="absolute bottom-1 left-0 right-0 flex justify-center z-10 opacity-80">
            <Barcode 
              value={personnel.badgeNo || personnel.officialId || '0000000000'} 
              width={1.2} 
              height={22} 
              displayValue={false}
              background="transparent" 
              margin={0} 
            />
          </div>
        )}
      </CR80Card>
    );
  }

  // Classic Template (Original)
  return (
    <CR80Card className="text-slate-800">
      {/* Header / Top Banner */}
      <div 
        className="absolute top-0 left-0 right-0 h-16 flex flex-col items-center justify-start pt-2 text-white"
        style={{ backgroundColor: headerBgColor }}
      >
        <div className="text-[10px] font-bold tracking-wider text-white">
          {settings?.badgeHeaderTitle || 'บัตรประจำตัวข้าราชการ'}
        </div>
        <div className="text-[8px] font-medium opacity-90 text-white truncate w-11/12 text-center">
          {settings?.badgeSubHeaderTitle || settings?.organizationName || settings?.systemName || personnel.department || 'หน่วยงานต้นสังกัด'}
        </div>
      </div>

      {/* Profile Image */}
      <div className="absolute top-11 left-1/2 -translate-x-1/2 w-20 h-24 bg-white p-1 shadow-sm border border-slate-200">
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

      {/* Details */}
      <div className="absolute top-36 left-0 right-0 px-2 text-center flex flex-col items-center">
        <h3 className="text-[12px] font-bold leading-tight" style={{ color: headerBgColor }}>
          {personnel.prefix}{personnel.firstName} {personnel.lastName}
        </h3>
        <p className="text-[9px] font-semibold text-slate-700 mt-1 leading-tight">
          {personnel.position || '-'}
        </p>
        <p className="text-[8px] font-medium text-white px-2 py-0.5 rounded-full mt-1" style={{ backgroundColor: headerBgColor }}>
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
    </CR80Card>
  );
}
