'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Personnel } from '@/types/personnel';
import InspectorModal from './InspectorModal';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface InspectorFloatingButtonProps {
  currentUser: Personnel | null;
}

export default function InspectorFloatingButton({ currentUser }: InspectorFloatingButtonProps) {
  const [isInspectorModalOpen, setIsInspectorModalOpen] = useState(false);
  const [isProjectWide, setIsProjectWide] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // STRICT RULE: Only SUPER_ADMIN can see and access the Super Admin Diagnostic Hub
  if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <>
      <div ref={menuRef} className="fixed bottom-6 right-6 z-40 no-inspect print:hidden">
        {/* Popup Menu */}
        {isMenuOpen && (
          <div className="absolute bottom-14 right-0 w-64 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl space-y-1 animate-fade-in text-xs font-semibold">
            <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] uppercase font-black text-purple-600 dark:text-purple-400 tracking-wider">
              <span>Super Admin Tools</span>
              <span className="bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 rounded text-[9px]">DIAGNOSTIC</span>
            </div>

            {/* 1. Project-wide Inspect Button */}
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setIsProjectWide(true);
                setIsInspectorModalOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <i className="fa-solid fa-layer-group text-xs"></i>
              </div>
              <div>
                <div className="font-bold">ตรวจสอบทั้งโปรเจค</div>
                <div className="text-[10px] text-slate-400 font-normal">สแกนทุกเส้นทางและทุกหน้า (21 หน้า)</div>
              </div>
            </button>

            {/* 2. Live Current Page Inspect Button */}
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setIsProjectWide(false);
                setIsInspectorModalOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-file-lines text-xs text-purple-500"></i>
              </div>
              <div>
                <div className="font-bold">ตรวจหน้านี้หน้าเดียว</div>
                <div className="text-[10px] text-slate-400 font-normal">วิเคราะห์ DOM และ UI หน้าปัจจุบัน</div>
              </div>
            </button>

            {/* 2. Inspector Dashboard Link */}
            <Link
              href="/manage/inspector"
              onClick={() => setIsMenuOpen(false)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl transition-colors ${
                pathname === '/manage/inspector'
                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-chart-line text-xs text-purple-500"></i>
              </div>
              <div>
                <div className="font-bold">Inspector Dashboard</div>
                <div className="text-[10px] text-slate-400 font-normal">ดูประวัติและจัดการ Findings</div>
              </div>
            </Link>

            {/* 3. API Docs Link */}
            <Link
              href="/manage/api-docs"
              onClick={() => setIsMenuOpen(false)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl transition-colors ${
                pathname === '/manage/api-docs'
                  ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-plug text-xs text-indigo-500"></i>
              </div>
              <div>
                <div className="font-bold">เอกสาร API (API Docs)</div>
                <div className="text-[10px] text-slate-400 font-normal">คู่มือและ Reference ทุก Endpoint</div>
              </div>
            </Link>
          </div>
        )}

        {/* Floating Trigger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`group flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl shadow-xl shadow-purple-600/30 border border-purple-400/30 transition-all ${
            isMenuOpen ? 'scale-105 ring-2 ring-purple-400/50' : 'hover:scale-105 active:scale-95'
          }`}
          title="Super Admin Diagnostic & API Tools"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-wand-magic-sparkles'} text-xs`}></i>
          </div>
          <span className="text-xs font-bold tracking-wide pr-0.5">
            ตรวจหน้านี้
          </span>
          <i className={`fa-solid fa-chevron-up text-[10px] transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}></i>
        </button>
      </div>

      <InspectorModal isOpen={isInspectorModalOpen} onClose={() => setIsInspectorModalOpen(false)} defaultProjectWide={isProjectWide} />
    </>
  );
}
