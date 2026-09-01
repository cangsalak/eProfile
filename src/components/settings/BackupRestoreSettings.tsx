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

  return (
    <div className="space-y-6 animate-fade-in font-prompt">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center">
        <i className="fa-solid fa-tools text-orange-500 mr-2 text-xl"></i> การบำรุงรักษาระบบ (Maintenance)
      </h3>

      {/* 1. Maintenance Mode Card (โหมดปิดปรับปรุงเว็บไซต์) */}
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ข้อความประกาศแจ้งผู้ใช้งาน (Announcement Message)
            </label>
            <textarea
              rows={2}
              value={maintenanceMsg}
              onChange={(e) => setMaintenanceMsg(e.target.value)}
              placeholder="ระบุข้อความแจ้งเหตุผลการปิดปรับปรุง..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                เวลาคาดว่าจะเปิดให้บริการ (Estimated Completion)
              </label>
              <input
                type="text"
                value={maintenanceEndTime}
                onChange={(e) => setMaintenanceEndTime(e.target.value)}
                placeholder="เช่น 02 ก.ย. 2569 เวลา 08:00 น."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-floppy-disk"></i>
                    บันทึกข้อความประกาศ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Audit Logs Card */}
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

      {/* 3. Backup Database */}
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

      {/* 4. Restore Database */}
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

      {/* 5. Danger Zone: Wipe / Reset Database */}
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
