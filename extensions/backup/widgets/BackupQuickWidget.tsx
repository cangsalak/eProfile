'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, Badge, Button } from '@/components/ui';
import {
  Database,
  Download,
  Upload,
  ShieldCheck,
  HardDrive,
  RefreshCw,
  ExternalLink,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Server,
  Archive,
  Sliders,
  Loader2,
  FileArchive,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LocalBackupFile {
  filename: string;
  size: number;
  createdAt: string;
}

type TabType = 'snapshots' | 'options' | 'security';

export default function BackupQuickWidget() {
  const [backups, setBackups] = useState<LocalBackupFile[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('snapshots');
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchBackupData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [listRes, setRes, maintRes] = await Promise.all([
        fetch('/api/modules/backup/list'),
        fetch('/api/settings'),
        fetch('/api/settings/maintenance'),
      ]);

      if (listRes.ok) {
        const data = await listRes.json();
        setBackups(Array.isArray(data.backups) ? data.backups : []);
      }
      if (setRes.ok) {
        const sData = await setRes.json();
        setSettings(sData || {});
      }
      if (maintRes.ok) {
        const mData = await maintRes.json();
        setIsMaintenance(Boolean(mData?.isMaintenance));
      }
    } catch (err) {
      console.error('Error loading backup widget data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBackupData();
  }, [fetchBackupData]);

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatThaiDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const totalBackupSize = useMemo(() => {
    return backups.reduce((acc, b) => acc + (b.size || 0), 0);
  }, [backups]);

  const dbProvider = settings?.dbProvider || 'sqlite';
  const providerLabel =
    dbProvider === 'postgresql'
      ? 'PostgreSQL'
      : dbProvider === 'mysql'
      ? 'MySQL'
      : 'SQLite';

  const handleDownloadBackup = async (format: 'json' | 'db') => {
    try {
      setIsDownloading(true);
      toast.loading('กำลังจัดเตรียมไฟล์สำรองข้อมูล...', { id: 'backup-dl' });
      const res = await fetch(`/api/modules/backup?format=${format}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'ไม่สามารถดาวน์โหลดไฟล์สำรองข้อมูลได้');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eprofile_backup_${format}_${Date.now()}.${format === 'db' ? 'db' : 'json'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('ดาวน์โหลดไฟล์สำรองเรียบร้อยแล้ว', { id: 'backup-dl' });
      fetchBackupData(true);
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการดาวน์โหลด', { id: 'backup-dl' });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card variant="convex" className="h-full flex flex-col min-h-[400px] font-prompt">
      {/* Header */}
      <CardHeader
        title="การสำรองข้อมูลและความปลอดภัยระบบ"
        subtitle="สถานะฐานข้อมูลและจุดกู้คืนล่าสุด (Universal Backup)"
        icon={<Database className="w-5 h-5 text-white" />}
        action={
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fetchBackupData(true)}
              disabled={refreshing || loading}
              title="รีเฟรชข้อมูล"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary-500' : ''}`} />
            </button>
            <Link
              href="/modules/backup"
              title="เปิดศูนย์สำรองและกู้คืนเต็ม"
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        }
      />

      <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-4">
        {/* KPI Stat Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* DB Engine */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
            <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">
              ฐานข้อมูล (Engine)
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono block mt-0.5">
              {providerLabel}
            </span>
          </div>

          {/* Backup Files Count */}
          <div className="p-2.5 rounded-xl bg-primary-50/70 dark:bg-primary-950/30 border border-primary-200/60 dark:border-primary-900/50 text-center">
            <span className="block text-[10px] font-bold text-primary-700 dark:text-primary-300">
              ไฟล์สำรองในระบบ
            </span>
            <span className="text-xs sm:text-sm font-black text-primary-700 dark:text-primary-300 font-mono block mt-0.5">
              {loading ? '...' : `${backups.length} ไฟล์ (${formatBytes(totalBackupSize)})`}
            </span>
          </div>

          {/* System Mode */}
          <div
            className={`p-2.5 rounded-xl border text-center ${
              isMaintenance
                ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/50'
                : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-900/50'
            }`}
          >
            <span
              className={`block text-[10px] font-bold ${
                isMaintenance ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              สถานะบริการ
            </span>
            <span
              className={`text-xs sm:text-sm font-black block mt-0.5 ${
                isMaintenance ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isMaintenance ? 'ปิดปรับปรุง' : 'ทำงานปกติ'}
            </span>
          </div>

          {/* Protection Guard */}
          <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 text-center">
            <span className="block text-[10px] font-bold text-blue-600 dark:text-blue-400">
              การป้องกันข้อมูล
            </span>
            <span className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 block mt-0.5">
              Anti-Data Loss
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('snapshots')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'snapshots'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>จุดสำรองข้อมูล</span>
            {backups.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary-500 text-white font-bold">
                {backups.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('options')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'options'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>รูปแบบสำรอง</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ความมั่นคงปลอดภัย</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col justify-between">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              <span className="text-xs">กำลังโหลดข้อมูลสำรอง...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: SNAPSHOTS LIST */}
              {activeTab === 'snapshots' && (
                <div className="space-y-2">
                  {backups.length === 0 ? (
                    <div className="py-7 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800">
                      <Database className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        ยังไม่มีไฟล์สำรองไบนารีในโฟลเดอร์เซิร์ฟเวอร์
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        สามารถกดปุ่มสำรองด่วนด้านล่างเพื่อดาวน์โหลดไฟล์ Universal JSON ได้ทันที
                      </p>
                    </div>
                  ) : (
                    backups.slice(0, 3).map((file, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                            <FileArchive className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                              {file.filename}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="font-mono">{formatBytes(file.size)}</span>
                              <span>•</span>
                              <span>{formatThaiDate(file.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <Badge variant="neutral" size="sm" className="text-[10px]">
                          SQLite Snapshot
                        </Badge>
                      </div>
                    ))
                  )}

                  {backups.length > 3 && (
                    <p className="text-[10px] text-slate-400 text-center pt-1">
                      แสดง 3 รายการล่าสุด จากทั้งหมด {backups.length} ไฟล์
                    </p>
                  )}
                </div>
              )}

              {/* TAB 2: BACKUP OPTIONS */}
              {activeTab === 'options' && (
                <div className="space-y-2.5">
                  {/* JSON Universal */}
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Universal JSON Backup
                        </span>
                        <Badge variant="primary" size="sm" className="text-[9px]">
                          แนะนำ
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        นำไปกู้คืนได้ทุกฐานข้อมูล (SQLite / PostgreSQL / MySQL) พร้อมระบบกรอง Secret
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs shrink-0"
                      disabled={isDownloading}
                      onClick={() => handleDownloadBackup('json')}
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      ดาวน์โหลด
                    </Button>
                  </div>

                  {/* SQLite Binary */}
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Native SQLite Binary (.db)
                        </span>
                        <Badge variant="neutral" size="sm" className="text-[9px]">
                          SUPER_ADMIN
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        ดาวน์โหลดไฟล์ dev.db โดยตรงเพื่อสำรองข้อมูลและนำไปเปิดแบบ Zero-loss
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs shrink-0"
                      disabled={isDownloading}
                      onClick={() => handleDownloadBackup('db')}
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      .db
                    </Button>
                  </div>

                  {/* Auto Retention Note */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>ระบบรองรับการเก็บไฟล์สำรองย้อนหลัง 30 วันอัตโนมัติ (Auto-Retention 30 days)</span>
                  </div>
                </div>
              )}

              {/* TAB 3: SECURITY & AUDIT */}
              {activeTab === 'security' && (
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      นโยบายความปลอดภัยฐานข้อมูล (AGENTS.md Compliance)
                    </span>
                    <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span><strong>Zero Secret Leakage:</strong> กรองรหัสผ่านลับ S3 และ Token ออกจากไฟล์สำรอง</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span><strong>Strict Anti-Data Loss:</strong> ห้ามรันคำสั่งทำลายข้อมูลหรือรีเซ็ต Production</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span><strong>Role Guarded:</strong> ฟังก์ชันกู้คืนระบบ (Restore) สงวนสิทธิ์สำหรับ SUPER_ADMIN เท่านั้น</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-center gap-2 text-[11px] text-blue-700 dark:text-blue-300">
                    <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>ทุกการกระทำสำรองและกู้คืนถูกบันทึกลงใน Audit Log พร้อมบันทึก IP ของผู้ดูแลระบบ</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-auto">
            <Button
              variant="primary"
              size="sm"
              className="flex-1 text-xs"
              disabled={isDownloading}
              onClick={() => handleDownloadBackup('json')}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              สำรองข้อมูลทันที (JSON)
            </Button>
            <Link href="/modules/backup" className="shrink-0">
              <Button variant="outline" size="sm" className="text-xs">
                <Sliders className="w-3.5 h-3.5 mr-1.5" />
                ศูนย์สำรองและกู้คืน
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
