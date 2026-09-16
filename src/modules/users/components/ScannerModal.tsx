'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Personnel } from '@/modules/users';
import { Modal, Button } from '@/components/ui';
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
        // Exclude focusing if user is typing in another input
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen]);

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ระบบสแกนตรวจเช็คบุคคล"
      subtitle="สแกนบาร์โค้ดหรือกรอกเลขประจำตัวเพื่อค้นหาข้อมูล"
      icon="fa-solid fa-barcode"
      size="md"
      footer={
        <div className="flex justify-end w-full">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            ปิดหน้าต่าง
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Hidden/Visually Hidden Input for Barcode Scanner */}
        <form onSubmit={handleScanSubmit}>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 text-center">
            เสียบเครื่องอ่านบาร์โค้ด และสแกนบัตรรหัส 10 หลัก หรือกรอกรหัสด้วยตนเอง
          </p>
          <div className="relative max-w-sm mx-auto">
            <label htmlFor="scannerModalInput" className="sr-only">รหัสประจำตัวหรือบาร์โค้ด</label>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <i className="fa-solid fa-magnifying-glass text-xs"></i>
            </div>
            <input
              id="scannerModalInput"
              aria-label="กรอกรหัสประจำตัว หรือสแกนบาร์โค้ด"
              ref={inputRef}
              type="text"
              value={scanValue}
              onChange={(e) => setScanValue(e.target.value)}
              placeholder="กรอกรหัส หรือ สแกนที่นี่..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-24 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 shadow-xs font-mono"
              autoComplete="off"
            />
            <Button 
              type="submit"
              variant="primary"
              size="sm"
              className="absolute inset-y-1 right-1 h-auto py-1 px-3 text-xs"
            >
              ตรวจสอบ
            </Button>
          </div>
        </form>

        {/* Result Area */}
        <div>
          {scanStatus === 'idle' && (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20">
              <i className="fa-solid fa-qrcode text-4xl text-slate-400 dark:text-slate-500 mb-3 animate-pulse"></i>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">รอรับข้อมูลการสแกน...</p>
            </div>
          )}

          {scanStatus === 'success' && scannedPerson && (
            <div className="animate-fade-in space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3 flex items-center justify-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-check text-xs text-emerald-600 dark:text-emerald-400"></i>
                </div>
                <h3 className="text-emerald-700 dark:text-emerald-300 font-bold text-xs">พบข้อมูลบุคลากรในหน่วยงาน</h3>
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
            <div className="animate-fade-in text-center py-8 border border-rose-200 dark:border-rose-900/40 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 p-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center mx-auto mb-3">
                <i className="fa-solid fa-xmark text-xl text-rose-600 dark:text-rose-400"></i>
              </div>
              <h3 className="text-sm font-bold text-rose-700 dark:text-rose-300 mb-1">ไม่พบข้อมูลในหน่วยงาน!</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                รหัสที่คุณสแกนไม่ตรงกับฐานข้อมูลบุคลากรในระบบ<br />
                โปรดตรวจสอบบัตร หรือลองสแกนใหม่อีกครั้ง
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
