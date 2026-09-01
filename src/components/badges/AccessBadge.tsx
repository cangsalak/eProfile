'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Personnel } from '@/types/personnel';

interface AccessBadgeProps {
  personnel: Personnel;
}

export default function AccessBadge({ personnel }: AccessBadgeProps) {
  const avatar = (personnel.avatarColor?.startsWith('data:image') || personnel.avatarColor?.startsWith('http'))
    ? personnel.avatarColor 
    : null;

  return (
    <div 
      className="relative overflow-hidden bg-white text-slate-900 border border-slate-300 shadow-md"
      style={{ width: '54mm', height: '86mm', boxSizing: 'border-box', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
    >
      {/* Background Graphic */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500 rounded-full opacity-20"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-500 rounded-full opacity-10"></div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-emerald-600 flex items-center justify-center text-white shadow-sm">
        <h1 className="text-[11px] font-bold tracking-widest uppercase">WORK ACCESS</h1>
      </div>

      <div className="absolute top-12 left-0 right-0 px-3 flex flex-col items-center">
        {/* Profile Image - Small */}
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500 bg-slate-100 shadow-sm mb-2">
          {avatar ? (
            <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-xl text-slate-900 dark:text-white font-bold"
              style={{ backgroundColor: personnel.avatarColor || '#10b981' }}
            >
              {personnel.firstName?.[0] || 'U'}
            </div>
          )}
        </div>
        
        <h3 className="text-[11px] font-bold text-slate-800 leading-tight">
          {personnel.firstName} {personnel.lastName}
        </h3>
        <p className="text-[9px] font-medium text-slate-500 uppercase">
          {personnel.department || '-'}
        </p>
      </div>

      {/* QR Code Section */}
      <div className="absolute top-36 left-0 right-0 flex flex-col items-center justify-center">
        <div className="bg-white p-1.5 border border-slate-200 rounded-lg shadow-sm">
          <QRCodeSVG 
            value={typeof window !== 'undefined' ? `${window.location.origin}/verify/${personnel.id}` : ''} 
            size={70}
            level="M"
          />
        </div>
        <p className="text-[10px] font-mono font-bold tracking-widest mt-2 text-slate-700">
          ID: {personnel.badgeNo}
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 h-5 bg-white dark:bg-slate-900 flex items-center justify-center">
        <p className="text-[7px] text-slate-900 dark:text-white font-medium tracking-widest opacity-80">SCAN TO ACCESS</p>
      </div>
    </div>
  );
}
