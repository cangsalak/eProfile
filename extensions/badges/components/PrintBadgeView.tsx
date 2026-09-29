'use client';

import React, { useState, useEffect } from 'react';
import { Personnel } from '@/modules/users';
import IDBadge from './IDBadge';

interface PrintBadgeViewProps {
  person: Personnel | null;
}

export default function PrintBadgeView({ person }: PrintBadgeViewProps) {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSettings(data);
        }
      })
      .catch(console.error);
  }, []);

  if (!person) return null;

  return (
    <div className="print-only hidden print:flex flex-col items-center justify-center p-0 bg-white w-full">
      <div 
        className="flex items-center justify-center relative print:m-0"
        style={{ gap: '0.05mm' }}
      >
        {/* Front Side */}
        <div className="relative p-0 print:p-0">
          {/* Outer Crop Marks */}
          <div className="absolute -top-2 -left-2 w-3 h-3 border-t-2 border-l-2 border-black pointer-events-none"></div>
          <div className="absolute -bottom-2 -left-2 w-3 h-3 border-b-2 border-l-2 border-black pointer-events-none"></div>
          <div className="absolute -top-2 left-1/2 w-px h-2 bg-black pointer-events-none"></div>
          <div className="absolute -bottom-2 left-1/2 w-px h-2 bg-black pointer-events-none"></div>
          
          <IDBadge 
            personnel={person} 
            settings={settings}
            qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${person.id}` : ''}
          />
        </div>

        {/* Center Fold / Cut Dividing Guide (0.05mm) */}
        <div 
          className="self-stretch border-r border-dashed border-slate-300 print:border-slate-400 opacity-70 pointer-events-none"
          style={{ width: '0.05mm', minHeight: '85.60mm' }}
        />

        {/* Back Side */}
        <div className="relative p-0 print:p-0">
          {/* Outer Crop Marks */}
          <div className="absolute -top-2 -right-2 w-3 h-3 border-t-2 border-r-2 border-black pointer-events-none"></div>
          <div className="absolute -bottom-2 -right-2 w-3 h-3 border-b-2 border-r-2 border-black pointer-events-none"></div>
          <div className="absolute -top-2 left-1/2 w-px h-2 bg-black pointer-events-none"></div>
          <div className="absolute -bottom-2 left-1/2 w-px h-2 bg-black pointer-events-none"></div>
          
          <IDBadge 
            personnel={person} 
            settings={settings}
            qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${person.id}` : ''}
            isBack={true}
          />
        </div>
      </div>
    </div>
  );
}
