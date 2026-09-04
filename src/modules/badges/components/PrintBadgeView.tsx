'use client';

import React, { useState, useEffect } from 'react';
import { Personnel } from '@/types/personnel';
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
    <div className="print-only hidden print:flex items-center justify-center p-8 bg-white w-full">
      <div className="flex gap-4">
        {/* Front Side */}
        <div className="relative p-4 print:p-0">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-black -translate-x-1 -translate-y-1"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black translate-x-1 -translate-y-1"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-black -translate-x-1 translate-y-1"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-black translate-x-1 translate-y-1"></div>
          
          <IDBadge 
            personnel={person} 
            settings={settings}
             
            qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${person.id}` : ''}
          />
        </div>

        {/* Back Side */}
        <div className="relative p-4 print:p-0">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-black -translate-x-1 -translate-y-1"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black translate-x-1 -translate-y-1"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-black -translate-x-1 translate-y-1"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-black translate-x-1 translate-y-1"></div>
          
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
