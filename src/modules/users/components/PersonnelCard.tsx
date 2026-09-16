'use client';

import React, { useState } from 'react';
import { Personnel } from '@/modules/users';
import IDBadge from '@/modules/badges/components/IDBadge';

interface PersonnelCardProps {
  person: Personnel;
  settings?: any;
  isGuest?: boolean;
  onViewProfile: (person: Personnel) => void;
  onPrintCard: (person: Personnel) => void;
}

export default function PersonnelCard({ person, settings, isGuest, onViewProfile, onPrintCard }: PersonnelCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="group relative flex flex-col items-center">
      {/* 3D Flip Card Container */}
      <div 
        className="flip-card-container w-full h-[330px] bg-transparent flex justify-center items-center cursor-pointer"
        onClick={() => onViewProfile(person)}
      >
        <div 
          className={`flip-card-inner w-[204px] h-[325px] transition-transform duration-500 ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* Front Face (ID Badge) */}
          <div 
            className="flip-card-front flex items-center justify-center" 
            style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}
          >
            <div className="w-full h-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-shadow rounded-xl">
              <IDBadge 
                personnel={person} 
                settings={settings}
                qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${person.id}` : ''}
              />
            </div>
          </div>

          {/* Back Face (ID Badge Back Side) */}
          <div 
            className="flip-card-back flex items-center justify-center" 
            style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="w-full h-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-shadow rounded-xl">
              {isGuest ? (
                <div className="w-[204px] h-[325px] flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                    <i className="fa-solid fa-lock text-xl text-slate-400"></i>
                  </div>
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">ข้อมูลถูกปกปิด</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">เข้าสู่ระบบเพื่อดูข้อมูลเพิ่มเติม</p>
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

      {/* Floating Action Bar on Hover/Tap */}
      <div className="mt-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFlipped((f) => !f);
          }}
          title={isFlipped ? 'พลิกกลับด้านหน้า' : 'พลิกดูข้อมูลด้านหลัง'}
          className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/40 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
        >
          <i className="fa-solid fa-rotate text-[11px]" />
          <span>{isFlipped ? 'ดูหน้าบัตร' : 'ดูหลังบัตร'}</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile(person);
          }}
          title="ดูประวัติและข้อมูลเต็ม"
          className="p-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
        >
          <i className="fa-solid fa-user text-[11px] text-primary-500" />
          <span>โปรไฟล์</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrintCard(person);
          }}
          title="สั่งพิมพ์บัตรประจำตัว"
          className="p-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 text-xs transition shadow-xs"
        >
          <i className="fa-solid fa-print text-[11px]" />
        </button>
      </div>
    </div>
  );
}
