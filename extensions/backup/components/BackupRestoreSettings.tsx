'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  Modal,
  Input,
  Textarea,
  Switch,
  Tabs,
} from '@/components/ui';

interface BackupRestoreSettingsProps {
  settings?: any;
  isRestoring: boolean;
  handleRestore: (e: React.ChangeEvent<HTMLInputElement>) => void;
  restoreFileInputRef: React.RefObject<HTMLInputElement>;
}

interface LocalBackupFile {
  filename: string;
  size: number;
  createdAt: string;
}

export default function BackupRestoreSettings({
  settings,
  isRestoring,
  handleRestore,
  restoreFileInputRef,
}: BackupRestoreSettingsProps) {
  const router = useRouter();
  const [subTab, setSubTab] = useState<'backup_restore' | 'maintenance_mode' | 'danger_zone'>('backup_restore');
  const dbProvider = settings?.dbProvider || 'sqlite';

  // Database Wipe Modal State
  const [showWipeModal, setShowWipeModal] = useState(false);
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

  // Local Backups List State
  const [localBackups, setLocalBackups] = useState<LocalBackupFile[]>([]);
  const [loadingLocalBackups, setLoadingLocalBackups] = useState(false);
  const [isCleaningBackups, setIsCleaningBackups] = useState(false);

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

  // Fetch local backups list
  const fetchLocalBackups = useCallback(async () => {
    setLoadingLocalBackups(true);
    try {
      const res = await fetch('/api/modules/backup/list');
      if (res.ok) {
        const data = await res.json();
        setLocalBackups(data.backups || []);
      }
    } catch {
      // silently fail if not accessible
    } finally {
      setLoadingLocalBackups(false);
    }
  }, []);

  useEffect(() => {
    if (subTab === 'backup_restore') {
      fetchLocalBackups();
    }
  }, [subTab, fetchLocalBackups]);

  const handleCleanupOldBackups = async () => {
    if (!confirm('คุณต้องการลบไฟล์สำรองข้อมูลเก่าที่เกิน 30 วันหรือไม่?')) return;
    setIsCleaningBackups(true);
    try {
      const res = await fetch('/api/modules/backup/list', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'ล้างไฟล์สำรองข้อมูลเก่าสำเร็จ');
        fetchLocalBackups();
      } else {
        toast.error(data.error || 'ไม่สามารถล้างไฟล์สำรองข้อมูลได้');
      }
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsCleaningBackups(false);
    }
  };

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

  const handleToggleMaintenance = (checked: boolean) => {
    setIsMaintenance(checked);
    handleSaveMaintenance(checked);
  };

  const handleOpenWipeModal = () => {
    setPassword('');
    setConfirmPhrase('');
    setResetMode('wipe_data_keep_admin');
    setShowWipeModal(true);
  };

  const handleCloseWipeModal = () => {
    if (isWiping) return;
    setShowWipeModal(false);
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
      setShowWipeModal(false);

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

  const subTabsList = [
    { id: 'backup_restore', label: 'สำรองและกู้คืนฐานข้อมูล', icon: 'fa-solid fa-database' },
    { id: 'maintenance_mode', label: 'โหมดปิดปรับปรุงเว็บไซต์', icon: 'fa-solid fa-person-digging' },
    { id: 'danger_zone', label: 'ล้างข้อมูลระบบ (Danger Zone)', icon: 'fa-solid fa-triangle-exclamation' },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-prompt">
      {/* Universal Page Header Submenu */}
      <PageHeaderExtra>
        <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
          {subTabsList.map((tab) => {
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  active
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <i className={`${tab.icon} text-xs ${active ? 'text-white' : 'text-slate-400'}`}></i>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </PageHeaderExtra>

      {/* Tabs View on Mobile/Page Level */}
      <div className="sm:hidden">
        <Tabs
          tabs={subTabsList as any}
          activeTab={subTab}
          onChange={(key) => setSubTab(key as any)}
          variant="pill"
        />
      </div>

      {/* ─── 1. BACKUP & RESTORE TAB ─────────────────────────────────────────── */}
      {subTab === 'backup_restore' && (
        <div className="space-y-6">
          {/* Active Database Engine Status */}
          <Card>
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 border border-primary-500/20">
                  <i className="fa-solid fa-server text-lg"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      ฐานข้อมูลระบบที่ใช้งานอยู่ (Active Database)
                    </span>
                    <Badge variant="primary" dot size="sm">
                      {dbProvider.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {dbProvider === 'sqlite' && 'SQLite Database (จัดเก็บข้อมูลในไฟล์เซิร์ฟเวอร์แบบ Local Standalone)'}
                    {dbProvider === 'postgresql' && 'PostgreSQL Database (ฐานข้อมูลเชิงสัมพันธ์ประสิทธิภาพสูงระดับองค์กร)'}
                    {dbProvider === 'mysql' && 'MySQL / MariaDB (ฐานข้อมูลเชิงสัมพันธ์ MySQL Database Server)'}
                  </p>
                </div>
              </div>

              <Link href="/manage/audit-logs">
                <Button
                  variant="outline"
                  size="sm"
                  icon="fa-solid fa-clipboard-list"
                >
                  บันทึกกิจกรรม (Audit Logs)
                </Button>
              </Link>
            </div>
          </Card>

          {/* Backup Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Universal JSON Backup Card */}
            <Card className="flex flex-col justify-between border-primary-500/20 shadow-sm">
              <CardHeader
                title="สำรองข้อมูล Universal JSON"
                subtitle="ครอบคลุมทุกตารางข้อมูล นำไปกู้คืนข้ามฐานข้อมูลได้"
                icon="fa-solid fa-file-code"
                action={<Badge variant="success">แนะนำ</Badge>}
              />
              <div className="p-5 space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  ส่งออกข้อมูลในรูปแบบ JSON มาตรฐาน ครอบคลุมกำลังพล, ใบลา, ยานพาหนะ, เอกสาร, ข่าวสาร, และการตั้งค่าระบบ พร้อมตัดรหัสผ่านและข้อมูลลับเพื่อความปลอดภัย
                </p>
                <a
                  href="/api/modules/backup?format=json"
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    icon="fa-solid fa-download"
                  >
                    ดาวน์โหลด Universal JSON (.json)
                  </Button>
                </a>
              </div>
            </Card>

            {/* Native Binary DB Backup Card (Only for SQLite) */}
            {dbProvider === 'sqlite' ? (
              <Card className="flex flex-col justify-between">
                <CardHeader
                  title="ดาวน์โหลดไฟล์ฐานข้อมูล SQLite"
                  subtitle="ไฟล์ฐานข้อมูลดิบแบบ Binary (.db)"
                  icon="fa-solid fa-hard-drive"
                  action={<Badge variant="neutral">SQLite Native</Badge>}
                />
                <div className="p-5 space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    ดาวน์โหลดไฟล์ <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs">dev.db</code> ของเครื่องเซิร์ฟเวอร์โดยตรง สงวนสิทธิ์เฉพาะผู้ดูแลระบบระดับสูง (SUPER_ADMIN)
                  </p>
                  <a
                    href="/api/modules/backup?format=db"
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full"
                      icon="fa-solid fa-database"
                    >
                      ดาวน์โหลด Binary DB (.db)
                    </Button>
                  </a>
                </div>
              </Card>
            ) : (
              <Card className="flex flex-col justify-between">
                <CardHeader
                  title="ระบบสำรองฐานข้อมูลภายนอก"
                  subtitle="บริหารจัดการผ่าน Database Server"
                  icon="fa-solid fa-cloud-arrow-up"
                  action={<Badge variant="info">Enterprise</Badge>}
                />
                <div className="p-5 space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    ระบบใช้งานฐานข้อมูลแบบ Server ({dbProvider.toUpperCase()}) ขอแนะนำให้ตั้งค่า Automated Snapshot และ WAL Backup บนคลาวด์หรือ Database Server ควบคู่กับ Universal JSON
                  </p>
                  <Link href="/inspector">
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full"
                      icon="fa-solid fa-gauge-high"
                    >
                      ตรวจสอบสุขภาพระบบ
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>

          {/* Restore Database Card */}
          <Card className="border-amber-500/30 bg-amber-500/[0.02]">
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-file-arrow-up text-base"></i>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    กู้คืนฐานข้อมูล (Restore Database)
                  </h4>
                  <Badge variant="warning" size="sm">
                    {dbProvider === 'sqlite' ? '.json / .db' : '.json Universal'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl pl-11">
                  อัปโหลดไฟล์สำรองข้อมูลแบบ <strong>.json (Universal)</strong> {dbProvider === 'sqlite' ? 'หรือ .db (SQLite)' : ''} เพื่อนำข้อมูลกลับมา <br />
                  <span className="font-bold text-rose-600 dark:text-rose-400">⚠️ คำเตือน:</span> ข้อมูลเดิมในระบบจะถูกแทนที่ด้วยข้อมูลจากไฟล์สำรอง
                </p>
              </div>

              <div>
                <Button
                  variant="primary"
                  size="md"
                  icon="fa-solid fa-upload"
                  isLoading={isRestoring}
                  loadingText="กำลังกู้คืนข้อมูล..."
                  onClick={() => restoreFileInputRef.current?.click()}
                  className="bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20"
                >
                  เลือกไฟล์และกู้คืน
                </Button>
                <input
                  id="restoreDatabaseFileInput"
                  type="file"
                  ref={restoreFileInputRef}
                  onChange={handleRestore}
                  accept={dbProvider === 'sqlite' ? '.json,.db' : '.json'}
                  aria-label="อัปโหลดไฟล์สำรองฐานข้อมูล"
                  className="hidden"
                />
              </div>
            </div>
          </Card>

          {/* Local Automated Backups Table (if any) */}
          {localBackups.length > 0 && (
            <Card>
              <CardHeader
                title="ประวัติไฟล์สำรองข้อมูลอัตโนมัติบนเซิร์ฟเวอร์"
                subtitle={`พบ ${localBackups.length} ไฟล์ในไดเรกทอรี prisma/backups`}
                icon="fa-solid fa-clock-rotate-left"
                action={
                  <Button
                    variant="danger"
                    size="xs"
                    icon="fa-solid fa-trash-can"
                    isLoading={isCleaningBackups}
                    onClick={handleCleanupOldBackups}
                  >
                    ล้างไฟล์เก่าเกิน 30 วัน
                  </Button>
                }
              />
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="px-5 py-3">ชื่อไฟล์สำรอง</th>
                      <th className="px-4 py-3">ขนาดไฟล์</th>
                      <th className="px-4 py-3">วันที่สร้าง</th>
                      <th className="px-5 py-3 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {localBackups.slice(0, 10).map((backup) => (
                      <tr key={backup.filename} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="px-5 py-3.5 font-mono text-slate-900 dark:text-white font-medium">
                          <i className="fa-solid fa-database text-primary-500 mr-2"></i>
                          {backup.filename}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                          {(backup.size / (1024 * 1024)).toFixed(2)} MB
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                          {new Date(backup.createdAt).toLocaleString('th-TH')}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Badge variant="neutral" size="sm">
                            จัดเก็บบนเครื่อง
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ─── 2. MAINTENANCE MODE TAB ─────────────────────────────────────────── */}
      {subTab === 'maintenance_mode' && (
        <div className="space-y-6">
          <Card className={isMaintenance ? 'border-amber-500/50 shadow-amber-500/5' : ''}>
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    isMaintenance
                      ? 'bg-amber-500 text-white shadow-amber-500/30 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    <i className="fa-solid fa-person-digging text-xl"></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        โหมดปิดปรับปรุงเว็บไซต์ (Website Maintenance Mode)
                      </h4>
                      {isMaintenance ? (
                        <Badge variant="warning" dot size="sm">
                          กำลังเปิดใช้งาน
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          ปิดอยู่ (ปกติ)
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      เมื่อเปิดใช้งาน ผู้ใช้ทั่วไปและผู้เยี่ยมชมจะถูกนำไปยังหน้า <span className="font-mono text-primary-600 dark:text-primary-400 font-semibold">/maintenance</span> โดยแอดมินยังคงเข้าสู่ระบบได้ตามปกติ
                    </p>
                  </div>
                </div>

                <Switch
                  checked={isMaintenance}
                  onChange={handleToggleMaintenance}
                  disabled={loadingMaintenance || isSavingMaintenance}
                />
              </div>

              {/* Maintenance Settings Form */}
              <div className="space-y-4 pt-1 max-w-2xl">
                <Textarea
                  label="ข้อความประกาศแจ้งผู้ใช้งาน (Announcement Message)"
                  rows={3}
                  value={maintenanceMsg}
                  onChange={(e) => setMaintenanceMsg(e.target.value)}
                  placeholder="ระบุข้อความแจ้งเหตุผลการปิดปรับปรุง..."
                />

                <Input
                  label="เวลาคาดว่าจะเปิดให้บริการ (Estimated Completion)"
                  type="text"
                  value={maintenanceEndTime}
                  onChange={(e) => setMaintenanceEndTime(e.target.value)}
                  placeholder="เช่น 02 ก.ย. 2569 เวลา 08:00 น."
                  icon="fa-regular fa-clock"
                />

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    icon="fa-solid fa-floppy-disk"
                    isLoading={isSavingMaintenance}
                    loadingText="กำลังบันทึก..."
                    onClick={() => handleSaveMaintenance()}
                  >
                    บันทึกข้อความประกาศ
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ─── 3. DANGER ZONE TAB ──────────────────────────────────────────────── */}
      {subTab === 'danger_zone' && (
        <div className="space-y-6">
          <Card className="border-rose-500/40 bg-rose-500/[0.02]">
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-bold text-base">
                  <i className="fa-solid fa-triangle-exclamation text-lg"></i>
                  <span>พื้นที่ควบคุมพิเศษ (Danger Zone) — ล้างฐานข้อมูล / รีเซ็ตระบบ</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                  ล้างข้อมูลทั้งหมดในระบบ (กำลังพล, ใบลา, ประวัติการแจ้งเตือน, ข่าวสาร, Audit Logs) เพื่อเริ่มต้นใหม่ หรือรีเซ็ตเป็นสถานะก่อนติดตั้ง
                </p>
              </div>
              <Button
                variant="danger"
                size="md"
                icon="fa-solid fa-skull"
                onClick={handleOpenWipeModal}
                className="shrink-0"
              >
                ล้างฐานข้อมูล (Reset DB)
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Wipe Confirmation Modal */}
      <Modal
        isOpen={showWipeModal}
        onClose={handleCloseWipeModal}
        title="ยืนยันการล้างฐานข้อมูลระบบ"
        icon="fa-solid fa-triangle-exclamation"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={isWiping}
              onClick={handleCloseWipeModal}
            >
              ยกเลิก
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon="fa-solid fa-skull"
              isLoading={isWiping}
              loadingText="กำลังล้างระบบ..."
              onClick={handleConfirmWipe}
            >
              ยืนยันล้างข้อมูล
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmWipe} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              เลือกรูปแบบการล้างข้อมูล:
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              <label className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                resetMode === 'wipe_data_keep_admin'
                  ? 'border-rose-500 bg-rose-500/10 dark:bg-rose-500/20 ring-1 ring-rose-500'
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
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    ลบข้อมูลกำลังพล, ใบลา, ยานพาหนะ, เอกสาร, ข่าวสาร, Audit Logs แต่แอดมินยังเข้าสู่ระบบได้
                  </div>
                </div>
              </label>

              <label className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                resetMode === 'factory_reset'
                  ? 'border-rose-500 bg-rose-500/10 dark:bg-rose-500/20 ring-1 ring-rose-500'
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
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    ลบข้อมูลทั้งหมดรวมถึงบัญชีผู้ใช้ และนำกลับสู่หน้าติดตั้งระบบ (/install)
                  </div>
                </div>
              </label>
            </div>
          </div>

          <Input
            label="พิมพ์คำยืนยัน: RESET-DATABASE"
            type="text"
            value={confirmPhrase}
            onChange={(e) => setConfirmPhrase(e.target.value)}
            placeholder="RESET-DATABASE"
            className="font-mono text-xs"
            required
          />

          <Input
            label="รหัสผ่าน Super Admin ปัจจุบัน"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="กรอกรหัสผ่านของคุณเพื่อยืนยัน"
            required
          />
        </form>
      </Modal>
    </div>
  );
}
