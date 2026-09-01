import React, { useState } from 'react';
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
  const [showModal, setShowModal] = useState(false);
  const [resetMode, setResetMode] = useState<'wipe_data_keep_admin' | 'factory_reset'>('wipe_data_keep_admin');
  const [password, setPassword] = useState('');
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [isWiping, setIsWiping] = useState(false);

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
        // Factory reset: redirect to /install
        localStorage.removeItem('currentUser');
        setTimeout(() => {
          router.push(data.redirectUrl);
        }, 1200);
      } else {
        // Keep admin: reload current page
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

  return (
    <div className="space-y-6 animate-fade-in">
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

      {/* Backup Database */}
      <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-file-arrow-down text-blue-500"></i>
            สำรองข้อมูลฐานข้อมูล (Backup Database)
          </h4>
          <p className="text-sm text-slate-500 mt-1">ดาวน์โหลดไฟล์ฐานข้อมูล (.db) เพื่อเก็บรักษาเป็นตัวสำรอง</p>
        </div>
        <a
          href="/api/backup"
          target="_blank"
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap flex items-center shadow-sm"
        >
          <i className="fa-solid fa-download mr-2"></i> ดาวน์โหลด Backup
        </a>
      </div>

      {/* Restore Database */}
      <div className="p-5 border border-amber-200 dark:border-amber-900/30 rounded-xl bg-amber-50/40 dark:bg-amber-950/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-amber-900 dark:text-amber-400 flex items-center gap-2">
            <i className="fa-solid fa-file-arrow-up text-amber-500"></i>
            กู้คืนฐานข้อมูล (Restore Database)
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-500/80 mt-1">
            อัปโหลดไฟล์ฐานข้อมูล (.db) เพื่อนำข้อมูลเดิมกลับมา <br />
            <span className="font-medium underline">คำเตือน</span>: ข้อมูลปัจจุบันจะถูกเขียนทับทั้งหมด
          </p>
        </div>
        <div>
          <button
            type="button"
            disabled={isRestoring}
            onClick={() => restoreFileInputRef.current?.click()}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap flex items-center shadow-sm"
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

      {/* Danger Zone: Wipe / Reset Database */}
      <div className="p-5 border-2 border-rose-200 dark:border-rose-900/40 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-base">
            <i className="fa-solid fa-triangle-exclamation text-lg"></i>
            พื้นที่ควบคุมพิเศษ (Danger Zone) — ล้างฐานข้อมูล / รีเซ็ตระบบ
          </div>
          <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400/80 mt-1">
            ล้างข้อมูลทั้งหมดในระบบ (กำลังพล, ใบลา, ประวัติการแจ้งเตือน, ข่าวสาร, Audit Logs) เพื่อเริ่มต้นใหม่ หรือรีเซ็ตเป็นสถานะก่อนติดตั้ง
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenModal}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-rose-600/25 whitespace-nowrap flex items-center gap-2 shrink-0"
        >
          <i className="fa-solid fa-trash-can"></i>
          <span>ล้างฐานข้อมูล (Reset DB)</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in font-prompt">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            {/* Modal Header */}
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
              {/* Reset Mode Selection */}
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
                      className="mt-1 text-rose-600"
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        ล้างเฉพาะข้อมูลการใช้งาน (เก็บสิทธิ์ Super Admin ไว้)
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        ลบข้อมูลกำลังพล, ใบลา, ยานพาหนะ, ข่าวสาร ทั้งหมด แต่ยังสามารถเข้าใช้งานระบบด้วยบัญชีปัจจุบันได้
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
                      className="mt-1 text-rose-600"
                    />
                    <div>
                      <div className="font-bold text-xs text-rose-600 dark:text-rose-400">
                        รีเซ็ตระบบทั้งหมดจากโรงงาน (Factory Reset)
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        ลบข้อมูลและบัญชีทั้งหมด 100% และรีเซ็ตกลับสู่สถานะก่อนติดตั้งเพื่อเริ่มติดตั้งใหม่ที่หน้า /install
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Super Admin Password Verification */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  รหัสผ่าน Super Admin ปัจจุบัน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="กรอกรหัสผ่านของคุณเพื่อยืนยันสิทธิ์"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Confirmation Phrase */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  พิมพ์คำว่า <span className="font-mono text-rose-600 dark:text-rose-400 font-bold select-all">RESET-DATABASE</span> ในช่องด้านล่าง <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={confirmPhrase}
                  onChange={(e) => setConfirmPhrase(e.target.value)}
                  required
                  placeholder="RESET-DATABASE"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isWiping}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isWiping || confirmPhrase !== 'RESET-DATABASE' || !password}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition shadow-md shadow-rose-600/20 flex items-center gap-2"
                >
                  {isWiping ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      กำลังล้างฐานข้อมูล...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-trash-can"></i>
                      ยืนยันการล้างข้อมูล
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
