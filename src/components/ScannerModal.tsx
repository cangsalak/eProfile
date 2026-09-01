'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Personnel } from '@/types/personnel';
import PersonnelCard from './PersonnelCard';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnelList: Personnel[];
  settings?: any;
  isGuest?: boolean;
}

export default function ScannerModal({ isOpen, onClose, personnelList, settings, isGuest }: ScannerModalProps) {
  const [scanValue, setScanValue] = useState('');
  const [scannedPerson, setScannedPerson] = useState<Personnel | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'not_found'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setScanValue('');
      setScannedPerson(null);
      setScanStatus('idle');
      // Auto-focus input when modal opens for hardware scanners
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle hardware scanner input
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // If modal is open and input isn't focused, try to focus it so the scanner types into it
      if (isOpen && document.activeElement !== inputRef.current) {
        // Exclude focusing if user is typing in another input (which shouldn't exist in this modal anyway, but just in case)
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanValue.trim()) return;

    // A hardware scanner usually sends exactly the badgeNo or citizenId followed by Enter
    const found = personnelList.find(
      (p) => p.badgeNo === scanValue || p.citizenId === scanValue
    );

    if (found) {
      setScannedPerson(found);
      setScanStatus('success');
    } else {
      setScannedPerson(null);
      setScanStatus('not_found');
    }
    
    // Clear the input and re-focus for the next scan
    setScanValue('');
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
              <i className="fa-solid fa-barcode"></i>
            </div>
            ระบบสแกนตรวจเช็คบุคคล
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {/* Hidden/Visually Hidden Input for Barcode Scanner */}
          <form onSubmit={handleScanSubmit} className="mb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 text-center">
              เสียบเครื่องอ่านบาร์โค้ด และสแกนบัตรรหัส 10 หลัก หรือกรอกรหัสด้วยตนเอง
            </p>
            <div className="relative max-w-sm mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-magnifying-glass text-slate-500"></i>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={scanValue}
                onChange={(e) => setScanValue(e.target.value)}
                placeholder="กรอกรหัส หรือ สแกนที่นี่..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 shadow-inner"
                autoComplete="off"
              />
              <button 
                type="submit"
                className="absolute inset-y-1 right-1 px-4 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-medium text-white transition-colors"
              >
                ตรวจสอบ
              </button>
            </div>
          </form>

          {/* Result Area */}
          <div className="mt-8">
            {scanStatus === 'idle' && (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/20">
                <i className="fa-solid fa-qrcode text-5xl text-slate-600 mb-4 animate-pulse"></i>
                <p className="text-slate-500 dark:text-slate-400 font-medium">รอรับข้อมูลการสแกน...</p>
              </div>
            )}

            {scanStatus === 'success' && scannedPerson && (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6 flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <i className="fa-solid fa-check text-emerald-400"></i>
                  </div>
                  <h3 className="text-emerald-400 font-bold text-lg">พบข้อมูลบุคลากรในหน่วยงาน</h3>
                </div>
                {/* Re-use PersonnelCard to show info */}
                <div className="pointer-events-none flex justify-center">
                  <PersonnelCard
                    person={scannedPerson}
                    settings={settings}
                    isGuest={isGuest}
                    onViewProfile={() => {}}
                    onPrintCard={() => {}}
                  />
                </div>
              </div>
            )}

            {scanStatus === 'not_found' && (
              <div className="animate-in fade-in zoom-in duration-300 text-center py-10 border border-rose-500/30 rounded-2xl bg-rose-500/5">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-xmark text-3xl text-rose-400"></i>
                </div>
                <h3 className="text-xl font-bold text-rose-400 mb-2">ไม่พบข้อมูลในหน่วยงาน!</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  รหัสที่คุณสแกนไม่ตรงกับฐานข้อมูลบุคลากรในระบบ<br />
                  โปรดตรวจสอบบัตร หรือลองสแกนใหม่อีกครั้ง
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
