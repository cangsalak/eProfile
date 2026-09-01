import React from 'react';
import Link from 'next/link';

interface BackupRestoreSettingsProps {
  isRestoring: boolean;
  handleRestore: (e: React.ChangeEvent<HTMLInputElement>) => void;
  restoreFileInputRef: React.RefObject<HTMLInputElement>;
}

export default function BackupRestoreSettings({ isRestoring, handleRestore, restoreFileInputRef }: BackupRestoreSettingsProps) {
  return (
    <div className="space-y-5 animate-fade-in">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center">
        <i className="fa-solid fa-tools text-orange-500 mr-2 text-xl"></i> การบำรุงรักษาระบบ (Maintenance)
      </h3>

      {/* Audit Logs Card */}
      <div className="p-5 border border-indigo-100 dark:border-indigo-950/60 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-clipboard-list text-indigo-500"></i>
            บันทึกกิจกรรมระบบ (Audit Logs)
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            ตรวจสอบประวัติการเข้าสู่ระบบ การสร้าง แก้ไข หรือลบข้อมูลต่างๆ ย้อนหลัง เพื่อความปลอดภัยและการตรวจสอบ
          </p>
        </div>
        <Link
          href="/manage/audit-logs"
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 shadow-md shadow-indigo-500/20 shrink-0"
        >
          <i className="fa-solid fa-arrow-up-right-from-square"></i>
          <span>เปิดดู Audit Logs</span>
        </Link>
      </div>

      <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-white">สำรองข้อมูลฐานข้อมูล (Backup Database)</h4>
          <p className="text-sm text-slate-500 mt-1">ดาวน์โหลดไฟล์ฐานข้อมูล SQLite (dev.db) เพื่อเก็บรักษาเป็นตัวสำรอง</p>
        </div>
        <a
          href="/api/backup"
          target="_blank"
          className="px-5 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium rounded-lg transition-colors whitespace-nowrap flex items-center"
        >
          <i className="fa-solid fa-download mr-2"></i> ดาวน์โหลด Backup
        </a>
      </div>

      <div className="p-5 border border-red-200 dark:border-red-900/30 rounded-xl bg-red-50/50 dark:bg-red-900/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        <div>
          <h4 className="font-semibold text-red-800 dark:text-red-400">กู้คืนฐานข้อมูล (Restore Database)</h4>
          <p className="text-sm text-red-600 dark:text-red-500/80 mt-1">อัปโหลดไฟล์ฐานข้อมูล (.db) เพื่อนำข้อมูลเดิมกลับมา <br/><span className="font-medium underline">คำเตือน</span>: ข้อมูลปัจจุบันจะถูกเขียนทับทั้งหมด</p>
        </div>
        <div>
          <button
            type="button"
            disabled={isRestoring}
            onClick={() => restoreFileInputRef.current?.click()}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors whitespace-nowrap flex items-center"
          >
            {isRestoring ? <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> : <i className="fa-solid fa-upload mr-2"></i>}
            {isRestoring ? 'กำลังกู้คืน...' : 'อัปโหลดและกู้คืน'}
          </button>
          <input 
            id="restoreDatabaseFileInput"
            type="file" 
            ref={restoreFileInputRef} 
            onChange={handleRestore} 
            accept=".db" 
            aria-label="อัปโหลดไฟล์สำรองฐานข้อมูล (.db)"
            className="hidden" 
          />
        </div>
      </div>
    </div>
  );
}
