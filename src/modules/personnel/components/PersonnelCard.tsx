'use client';

import React from 'react';
import { Personnel } from '@/types/personnel';
import IDBadge from '@/modules/badges/components/IDBadge';

interface PersonnelCardProps {
  person: Personnel;
  settings?: any;
  isGuest?: boolean;
  onViewProfile: (person: Personnel) => void;
  onPrintCard: (person: Personnel) => void;
}

export default function PersonnelCard({ person, settings, isGuest, onViewProfile, onPrintCard }: PersonnelCardProps) {
  return (
    <div className="flip-card-container w-full h-[340px] bg-transparent flex justify-center items-center">
      <div className="flip-card-inner w-[204px] h-[325px]">
        
        {/* Front Face (ID Badge) */}
        <div className="flip-card-front flex items-center justify-center" style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}>
          <div className="w-full h-full flex items-center justify-center">
            <IDBadge 
              personnel={person} 
               
              settings={settings}
              qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${person.id}` : ''}
            />
          </div>
        </div>

        {/* Back Face (ID Badge Back Side) */}
        <div className="flip-card-back flex items-center justify-center" style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <div className="w-full h-full flex items-center justify-center">
            {isGuest ? (
              <div className="w-[204px] h-[325px] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fa-solid fa-lock text-2xl text-slate-400"></i>
                </div>
                <h3 className="text-sm font-bold text-slate-700 mb-1">ข้อมูลถูกปกปิด</h3>
                <p className="text-[10px] text-slate-500">เข้าสู่ระบบเพื่อดูข้อมูลเพิ่มเติม</p>
              </div>
            ) : (
              <IDBadge 
                personnel={person} 
                 
                settings={settings}
                qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${person.id}` : ''}
                isBack={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
