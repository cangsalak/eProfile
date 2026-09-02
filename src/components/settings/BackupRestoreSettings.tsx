'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface BackupRestoreSettingsProps {
  isRestoring: boolean;
  handleRestore: (e: React.ChangeEvent<HTMLInputElement>) => void;
  restoreFileInputRef: React.RefObject<HTMLInputElement>;
}

export default function BackupRestoreSettings({ isRestoring, handleRestore, restoreFileInputRef }: BackupRestoreSettingsProps) {
  const router = useRouter();
  const [subTab, setSubTab] = useState<'backup_restore' | 'maintenance_mode' | 'danger_zone'>('backup_restore');
  
  // Database Wipe Modal State
  const [showModal, setShowModal] = useState(false);
  const [resetMode, setResetMode] = useState<'wipe_data_keep_admin' | 'factory_reset'>('wipe_data_keep_admin');
  const [password, setPassword] = useState('');
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [isWiping, setIsWiping] = useState(false);

  // Maintenance Mode State
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('ระบบกำลังอยู่ระหว่างการปิดปรับปรุงเพื่อเพิ่มประสิทธิภาพการทำงาน ขออภัยในความไม่สะดวก');
  const [maintenanceEndTime, setMaintenanceEndTime] = useState('');
  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false);
  const [loadingMaintenance, setLoadingMaintenance] = useState(true);

  // Fetch initial maintenance settings
  useEffect(() => {
    fetch('/api/settings/maintenance')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setIsMaintenance(data.isMaintenance || false);
          if (data.message) setMaintenanceMsg(data.message);
          if (data.endTime) setMaintenanceEndTime(data.endTime);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMaintenance(false));
  }, []);

  const handleSaveMaintenance = async (newStatus?: boolean) => {
    setIsSavingMaintenance(true);
    const targetStatus = typeof newStatus === 'boolean' ? newStatus : isMaintenance;
    try {
      const res = await fetch('/api/settings/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isMaintenance: targetStatus,
          message: maintenanceMsg,
          endTime: maintenanceEndTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการบันทึกโหมดปรับปรุง');
      }

      setIsMaintenance(data.isMaintenance);
      toast.success(data.notice || 'บันทึกการตั้งค่าโหมดปรับปรุงเว็บไซต์สำเร็จ');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingMaintenance(false);
    }
  };

  const handleToggleMaintenance = () => {
    const nextState = !isMaintenance;
    setIsMaintenance(nextState);
    handleSaveMaintenance(nextState);
  };

  const handleOpenModal = () => {
    setPassword('');
    setConfirmPhrase('');
    setResetMode('wipe_data_keep_admin');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (isWiping) return;
    setShowModal(false);
  };

  const handleConfirmWipe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmPhrase !== 'RESET-DATABASE') {
      toast.error('กรุณาพิมพ์คำว่า RESET-DATABASE ให้ถูกต้อง');
      return;
    }

    if (!password) {
      toast.error('กรุณากรอกรหัสผ่าน Super Admin');
      return;
    }

    setIsWiping(true);
    try {
      const res = await fetch('/api/settings/reset-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          confirmText: confirmPhrase,
          mode: resetMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการล้างฐานข้อมูล');
      }

      toast.success(data.message);
      setShowModal(false);

      if (data.redirectUrl) {
        localStorage.removeItem('currentUser');
        setTimeout(() => {
          router.push(data.redirectUrl);
        }, 1200);
      } else {
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsWiping(false);
    }
  };

  const subTabs = [
    { id: 'backup_restore', name: 'สำรองและกู้คืนฐานข้อมูล', icon: 'fa-database' },
    { id: 'maintenance_mode', name: 'โหมดปิดปรับปรุงเว็บไซต์', icon: 'fa-person-digging' },
    { id: 'danger_zone', name: 'ล้างข้อมูลระบบ (Danger Zone)', icon: 'fa-triangle-exclamation' },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-prompt">
      {/* Sub-tabs Switcher */}
      <div 
        role="tablist" 
        aria-label="หมวดย่อยการบำรุงรักษาระบบ"
        className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-full sm:w-fit overflow-x-auto border border-slate-200 dark:border-slate-700/80"
      >
        {subTabs.map(st => {
          const isSelected = subTab === st.id;
          return (
            <button
              key={st.id}
              role="tab"
              id={`subtab-${st.id}`}
              aria-controls={`subtabpanel-${st.id}`}
              aria-selected={isSelected}
              type="button"
              onClick={() => setSubTab(st.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm border border-slate-200 dark:border-slate-700/70'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <i className={`fa-solid ${st.icon} text-xs ${isSelected ? 'text-primary-500' : 'text-slate-400'}`}></i>
              <span>{st.name}</span>
            </button>
          );
        })}
      </div>

      {/* ─── 1. BACKUP & RESTORE TAB ─────────────────────────────────────────── */}
      {subTab === 'backup_restore' && (
        <div 
          role="tabpanel"
          id="subtabpanel-backup_restore"
          aria-labelledby="subtab-backup_restore"
          className="space-y-5 animate-fade-in"
        >
          {/* Audit Logs Shortcut Banner */}
          <div className="p-4 sm:p-5 border border-primary-100 dark:border-primary-950/60 rounded-2xl bg-primary-50/40 dark:bg-primary-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                <i className="fa-solid fa-clipboard-list text-primary-500"></i>
                <span>บันทึกกิจกรรมระบบ (Audit Logs)</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ตรวจสอบประวัติการเข้าสู่ระบบ การสร้าง แก้ไข หรือลบข้อมูลต่างๆ ย้อนหลัง เพื่อความปลอดภัยและการตรวจสอบ
              </p>
            </div>
            <Link
              href="/manage/audit-logs"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 shadow-md shadow-primary-500/20 shrink-0"
            >
              <i className="fa-solid fa-arrow-up-right-from-square"></i>
              <span>เปิดดู Audit Logs</span>
            </Link>
          </div>

          {/* Backup Database */}
          <div className="p-5 sm:p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-database text-lg"></i>
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    สำรองข้อมูลฐานข้อมูล (Database Backup)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    ครอบคลุมทุกตารางข้อมูล (กำลังพล, ใบลา, ยานพาหนะ, เอกสาร, ข่าวสาร, สิทธิ์, การตั้งค่า)
                  </p>
                </div>
              </div>
            </div>

            {/* 2 Backup Download Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {/* Option 1: Universal JSON */}
              <div className="p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <i className="fa-solid fa-star text-amber-500"></i>
                    <span>สำรองข้อมูลแบบ Universal JSON (แนะนำ)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    สร้างไฟล์ข้อมูล JSON ครบทุกตาราง สามารถนำไปกู้คืนข้ามระบบฐานข้อมูลได้ (SQLite, PostgreSQL, MySQL)
                  </p>
                </div>
                <a
                  href="/api/backup?format=json"
                  target="_blank"
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-file-code"></i>
                  <span>ดาวน์โหลด Universal JSON (.json)</span>
                </a>
              </div>

              {/* Option 2: Native SQLite */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <i className="fa-solid fa-hard-drive text-slate-400"></i>
                    <span>ดาวน์โหลดไฟล์ฐานข้อมูล Native (.db)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    สำหรับผู้ใช้งานฐานข้อมูล SQLite ที่ต้องการสำรองไฟล์ Binary ทั้งหมดของเซิร์ฟเวอร์
                  </p>
                </div>
                <a
                  href="/api/backup?format=db"
                  target="_blank"
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-download"></i>
                  <span>ดาวน์โหลดไฟล์ Binary (.db)</span>
                </a>
              </div>
            </div>
          </div>

          {/* Restore Database */}
          <div className="p-5 sm:p-6 border border-amber-200 dark:border-amber-900/40 rounded-2xl bg-amber-50/40 dark:bg-amber-950/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm sm:text-base text-amber-900 dark:text-amber-400 flex items-center gap-2">
                  <i className="fa-solid fa-file-arrow-up text-amber-500 text-base"></i>
                  <span>กู้คืนฐานข้อมูล (Restore Database)</span>
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  .json / .db
                </span>
              </div>
              <p className="text-xs text-amber-800/80 dark:text-amber-500/90 leading-relaxed max-w-xl">
                อัปโหลดไฟล์สำรองข้อมูลแบบ <strong>.json (Universal)</strong> หรือ <strong>.db (SQLite)</strong> เพื่อนำข้อมูลกลับมา <br />
                <span className="font-bold text-rose-600 dark:text-rose-400">⚠️ คำเตือน:</span> ข้อมูลเดิมในระบบจะถูกแทนที่ด้วยข้อมูลจากไฟล์สำรอง
              </p>
            </div>
            <div>
              <button
                type="button"
                disabled={isRestoring}
                onClick={() => restoreFileInputRef.current?.click()}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-amber-600/20 whitespace-nowrap flex items-center gap-2 shrink-0"
              >
                {isRestoring ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span>กำลังกู้คืนข้อมูล...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-upload"></i>
                    <span>เลือกไฟล์และกู้คืน</span>
                  </>
                )}
              </button>
              <input
                id="restoreDatabaseFileInput"
                type="file"
                ref={restoreFileInputRef}
                onChange={handleRestore}
                accept=".json,.db"
                aria-label="อัปโหลดไฟล์สำรองฐานข้อมูล (.json หรือ .db)"
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. MAINTENANCE MODE TAB ─────────────────────────────────────────── */}
      {subTab === 'maintenance_mode' && (
        <div 
          role="tabpanel"
          id="subtabpanel-maintenance_mode"
          aria-labelledby="subtab-maintenance_mode"
          className="space-y-5 animate-fade-in"
        >
          <div className={`p-5 sm:p-6 border-2 rounded-2xl transition-all ${
            isMaintenance
              ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  isMaintenance
                    ? 'bg-amber-500 text-white shadow-amber-500/30 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  <i className="fa-solid fa-person-digging text-xl"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      โหมดปิดปรับปรุงเว็บไซต์ (Website Maintenance Mode)
                    </h4>
                    {isMaintenance ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        กำลังเปิดใช้งาน
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        ปิดอยู่ (ปกติ)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    เมื่อเปิดใช้งาน ผู้ใช้ทั่วไปและผู้เยี่ยมชมจะถูกนำไปยังหน้า <span className="font-mono text-primary-500 font-semibold">/maintenance</span> โดยแอดมินยังคงเข้าสู่ระบบได้ตามปกติ
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                disabled={loadingMaintenance || isSavingMaintenance}
                onClick={handleToggleMaintenance}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none shrink-0 ${
                  isMaintenance ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label="เปิด/ปิดโหมดปรับปรุงเว็บไซต์"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                    isMaintenance ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Maintenance Message & End Time Inputs */}
            <div className="mt-4 space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ข้อความประกาศแจ้งผู้ใช้งาน (Announcement Message)
                </label>
                <textarea
                  rows={2}
                  value={maintenanceMsg}
                  onChange={(e) => setMaintenanceMsg(e.target.value)}
                  placeholder="ระบุข้อความแจ้งเหตุผลการปิดปรับปรุง..."
                  className="form-control resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    เวลาคาดว่าจะเปิดให้บริการ (Estimated Completion)
                  </label>
                  <input
                    type="text"
                    value={maintenanceEndTime}
                    onChange={(e) => setMaintenanceEndTime(e.target.value)}
                    placeholder="เช่น 02 ก.ย. 2569 เวลา 08:00 น."
                    className="form-control"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={isSavingMaintenance}
                    onClick={() => handleSaveMaintenance()}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-amber-600/20 flex items-center gap-2"
                  >
                    {isSavingMaintenance ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <span>กำลังบันทึก...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-floppy-disk"></i>
                        <span>บันทึกข้อความประกาศ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. DANGER ZONE TAB ──────────────────────────────────────────────── */}
      {subTab === 'danger_zone' && (
        <div 
          role="tabpanel"
          id="subtabpanel-danger_zone"
          aria-labelledby="subtab-danger_zone"
          className="space-y-5 animate-fade-in"
        >
          <div className="p-6 border-2 border-rose-200 dark:border-rose-900/40 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-base">
                <i className="fa-solid fa-triangle-exclamation text-lg"></i>
                <span>พื้นที่ควบคุมพิเศษ (Danger Zone) — ล้างฐานข้อมูล / รีเซ็ตระบบ</span>
              </div>
              <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400/80 mt-1 leading-relaxed max-w-2xl">
                ล้างข้อมูลทั้งหมดในระบบ (กำลังพล, ใบลา, ประวัติการแจ้งเตือน, ข่าวสาร, Audit Logs) เพื่อเริ่มต้นใหม่ หรือรีเซ็ตเป็นสถานะก่อนติดตั้ง
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenModal}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-rose-600/25 whitespace-nowrap flex items-center gap-2 shrink-0"
            >
              <i className="fa-solid fa-trash-can"></i>
              <span>ล้างฐานข้อมูล (Reset DB)</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in font-prompt">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <i className="fa-solid fa-skull-crossbones text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">ยืนยันการล้างฐานข้อมูล</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isWiping}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleConfirmWipe} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  รูปแบบการล้างข้อมูล:
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  <label className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                    resetMode === 'wipe_data_keep_admin'
                      ? 'border-rose-500 bg-rose-500/10 dark:bg-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
                  }`}>
                    <input
                      type="radio"
                      name="resetMode"
                      value="wipe_data_keep_admin"
                      checked={resetMode === 'wipe_data_keep_admin'}
                      onChange={() => setResetMode('wipe_data_keep_admin')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        ล้างข้อมูลธุรกิจทั้งหมด แต่คงบัญชี Super Admin ไว้ (แนะนำ)
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        ลบข้อมูลกำลังพล, ใบลา, ยานพาหนะ, เอกสาร, ข่าวสาร, Audit Logs แต่แอดมินยังเข้าสู่ระบบได้
                      </div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                    resetMode === 'factory_reset'
                      ? 'border-rose-500 bg-rose-500/10 dark:bg-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
                  }`}>
                    <input
                      type="radio"
                      name="resetMode"
                      value="factory_reset"
                      checked={resetMode === 'factory_reset'}
                      onChange={() => setResetMode('factory_reset')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        รีเซ็ตระบบเป็นค่าเริ่มต้นจากโรงงาน (Factory Reset)
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        ลบข้อมูลทั้งหมดรวมถึงบัญชีผู้ใช้ และนำกลับสู่หน้าติดตั้งระบบ (/install)
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  พิมพ์คำยืนยัน: <span className="font-mono text-rose-500 font-bold select-all">RESET-DATABASE</span>
                </label>
                <input
                  type="text"
                  value={confirmPhrase}
                  onChange={(e) => setConfirmPhrase(e.target.value)}
                  placeholder="RESET-DATABASE"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  รหัสผ่าน Super Admin ปัจจุบัน:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านของคุณเพื่อยืนยัน"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isWiping}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isWiping}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isWiping ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>กำลังล้างระบบ...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-skull"></i>
                      <span>ยืนยันล้างข้อมูล</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
