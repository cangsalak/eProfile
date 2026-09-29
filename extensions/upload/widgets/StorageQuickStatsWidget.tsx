'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardHeader, Badge, Button } from '@/components/ui';
import {
  Cloud,
  Loader2,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Folder,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import {
  formatBytes,
  getExtensionModuleMeta,
  formatThaiDate,
  EXTENSION_MODULES,
} from '../lib/file-utils';
import { uploadFileToServer } from '../lib/client-upload';

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimetype: string;
  module: string;
  folder: string;
  createdAt: string;
  uploadedBy?: {
    firstName?: string;
    lastName?: string;
  };
}

interface StorageStats {
  totalFiles: number;
  totalBytes: number;
  imageCount: number;
  audioCount: number;
  videoCount: number;
  pdfCount: number;
  docCount: number;
  moduleCounts?: Record<string, number>;
  provider: string;
}

function getFileIcon(mimetype: string, filename: string) {
  const ext = (filename.split('.').pop() || '').toUpperCase();
  if (mimetype === 'application/pdf' || ext === 'PDF') {
    return { icon: 'fa-solid fa-file-pdf', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/50' };
  }
  if (mimetype.includes('word') || ['DOC', 'DOCX'].includes(ext)) {
    return { icon: 'fa-solid fa-file-word', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50' };
  }
  if (mimetype.includes('excel') || mimetype.includes('spreadsheet') || ['XLS', 'XLSX'].includes(ext)) {
    return { icon: 'fa-solid fa-file-excel', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50' };
  }
  if (mimetype.startsWith('image/')) {
    return { icon: 'fa-solid fa-image', color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/50' };
  }
  if (mimetype.startsWith('video/')) {
    return { icon: 'fa-solid fa-film', color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/50' };
  }
  if (mimetype.startsWith('audio/')) {
    return { icon: 'fa-solid fa-music', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/50' };
  }
  return { icon: 'fa-solid fa-file', color: 'text-slate-400 bg-slate-100 dark:bg-slate-800' };
}

type WidgetTab = 'overview' | 'recent' | 'upload';

export default function StorageQuickStatsWidget() {
  const [activeTab, setActiveTab] = useState<WidgetTab>('overview');
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [recentFiles, setRecentFiles] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Quick upload state
  const [uploadTargetModule, setUploadTargetModule] = useState('upload');
  const [uploadTargetFolder, setUploadTargetFolder] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadWidgetData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch('/api/modules/upload/list?limit=4&sortBy=createdAt&sortOrder=desc');
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.items) setRecentFiles(data.items);
      }
    } catch (err) {
      console.error('Failed to load storage widget data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWidgetData();
  }, []);

  // Update target folder when module changes
  const handleModuleChange = (modId: string) => {
    setUploadTargetModule(modId);
    const meta = getExtensionModuleMeta(modId);
    setUploadTargetFolder(meta.defaultFolder || 'general');
  };

  // Quick file upload handler
  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(10);
    setUploadSuccess(null);
    setUploadError(null);

    const result = await uploadFileToServer(file, {
      module: uploadTargetModule,
      folder: uploadTargetFolder,
      onProgress: (p) => setUploadProgress(p),
    });

    setUploading(false);
    if (result.success && result.data) {
      setUploadSuccess(`อัปโหลดสำเร็จ: ${result.data.filename}`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadWidgetData(true);
    } else {
      setUploadError(result.error || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
    }
  };

  const totalFiles = stats?.totalFiles || 0;
  const imagePct = totalFiles > 0 ? Math.round(((stats?.imageCount || 0) / totalFiles) * 100) : 0;
  const docPct = totalFiles > 0 ? Math.round((((stats?.pdfCount || 0) + (stats?.docCount || 0)) / totalFiles) * 100) : 0;
  const mediaPct = totalFiles > 0 ? Math.round((((stats?.videoCount || 0) + (stats?.audioCount || 0)) / totalFiles) * 100) : 0;
  const otherPct = Math.max(0, 100 - (imagePct + docPct + mediaPct));

  // Extract active extension modules with files
  const activeModules = Object.entries(stats?.moduleCounts || {})
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const currentModMeta = getExtensionModuleMeta(uploadTargetModule);

  return (
    <Card variant="convex" className="h-full flex flex-col min-h-[380px] font-prompt">
      <CardHeader
        title="คลังไฟล์และพื้นที่จัดเก็บ"
        subtitle="ภาพรวมการใช้งานพื้นที่และไฟล์สื่อ"
        icon={<Cloud className="w-5 h-5 text-white" />}
        iconGradient="from-sky-400 to-blue-600"
        action={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => loadWidgetData(true)}
              disabled={refreshing || loading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary-500' : ''}`} />
            </button>
            <Link href="/modules/upload">
              <Button type="button" variant="secondary" size="xs" icon="fa-solid fa-arrow-right">
                เปิดคลังสื่อ
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex-1 flex flex-col p-4 pt-2 space-y-3">
        {/* ── Segmented Tab Selector ── */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-chart-pie text-[11px]"></i>
            <span>ภาพรวมพื้นที่</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recent')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
              activeTab === 'recent'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-clock-rotate-left text-[11px]"></i>
            <span>ไฟล์ล่าสุด</span>
            {recentFiles.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary-100 dark:bg-primary-900/60 text-primary-600 dark:text-primary-300 text-[10px] flex items-center justify-center font-mono">
                {recentFiles.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-cloud-arrow-up text-[11px]"></i>
            <span>อัปโหลดด่วน</span>
          </button>
        </div>

        {/* ── Tab Content ── */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            <span className="text-xs">กำลังตรวจสอบพื้นที่จัดเก็บ...</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between space-y-3">
            {/* ════════ TAB 1: OVERVIEW ════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                {/* 1. Storage Capacity & System Status */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50/80 to-blue-50/40 dark:from-sky-950/30 dark:to-blue-950/20 border border-sky-100 dark:border-sky-900/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          พื้นที่จัดเก็บที่ใช้จริง
                        </span>
                      </div>
                      <span className="text-2xl font-black text-sky-600 dark:text-sky-400 leading-tight">
                        {formatBytes(stats?.totalBytes || 0)}
                      </span>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <Badge variant={stats?.provider === 'S3' ? 'candy' : 'neutral'} size="xs">
                        <i className={`${stats?.provider === 'S3' ? 'fa-solid fa-cloud' : 'fa-solid fa-hard-drive'} mr-1 text-[10px]`}></i>
                        {stats?.provider === 'S3' ? 'Cloud S3' : 'Local Storage'}
                      </Badge>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {totalFiles.toLocaleString()} <span className="font-normal text-slate-400">ไฟล์</span>
                      </span>
                    </div>
                  </div>

                  {/* Multi-category Proportion Bar */}
                  {totalFiles > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-sky-100/80 dark:border-sky-900/30 space-y-1.5">
                      <div className="w-full bg-slate-200/70 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden flex">
                        {imagePct > 0 && (
                          <div
                            style={{ width: `${imagePct}%` }}
                            className="bg-emerald-500 h-full transition-all duration-500"
                            title={`รูปภาพ: ${imagePct}%`}
                          />
                        )}
                        {docPct > 0 && (
                          <div
                            style={{ width: `${docPct}%` }}
                            className="bg-blue-500 h-full transition-all duration-500"
                            title={`เอกสาร & PDF: ${docPct}%`}
                          />
                        )}
                        {mediaPct > 0 && (
                          <div
                            style={{ width: `${mediaPct}%` }}
                            className="bg-purple-500 h-full transition-all duration-500"
                            title={`วิดีโอ & เสียง: ${mediaPct}%`}
                          />
                        )}
                        {otherPct > 0 && (
                          <div
                            style={{ width: `${otherPct}%` }}
                            className="bg-amber-400 h-full transition-all duration-500"
                            title={`อื่นๆ: ${otherPct}%`}
                          />
                        )}
                      </div>

                      {/* Legend Labels */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          รูปภาพ ({stats?.imageCount || 0})
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          เอกสาร ({(stats?.pdfCount || 0) + (stats?.docCount || 0)})
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          สื่อ ({(stats?.videoCount || 0) + (stats?.audioCount || 0)})
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Extension Sources Distribution */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                      สัดส่วนตามส่วนขยาย (Source Extensions)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {activeModules.length} ส่วนขยายที่ใช้งาน
                    </span>
                  </div>
                  {activeModules.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {activeModules.map(([modId, count]) => {
                        const meta = getExtensionModuleMeta(modId);
                        return (
                          <div
                            key={modId}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                          >
                            <span className="flex items-center gap-1.5 truncate text-slate-700 dark:text-slate-300 font-medium">
                              <i className={`${meta.icon} text-[11px] text-primary-500 shrink-0`}></i>
                              <span className="truncate">{meta.name}</span>
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white font-mono shrink-0 ml-1">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center py-2 text-xs text-slate-400">ยังไม่มีข้อมูลส่วนขยาย</p>
                  )}
                </div>
              </div>
            )}

            {/* ════════ TAB 2: RECENT FILES ════════ */}
            {activeTab === 'recent' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                    ไฟล์ที่อัปโหลดล่าสุด
                  </span>
                  <Link href="/modules/upload" className="text-[11px] text-primary-600 dark:text-primary-400 hover:underline">
                    ดูทั้งหมด
                  </Link>
                </div>

                {recentFiles.length > 0 ? (
                  <div className="space-y-1.5">
                    {recentFiles.map((file) => {
                      const iconInfo = getFileIcon(file.mimetype, file.filename);
                      const extMeta = getExtensionModuleMeta(file.module);
                      const isImage = file.mimetype.startsWith('image/');
                      return (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800/80 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xs transition-all text-xs group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isImage ? (
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                                <img
                                  src={file.url}
                                  alt={file.filename}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconInfo.color}`}>
                                <i className={`${iconInfo.icon} text-sm`}></i>
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate text-xs group-hover:text-primary-600 transition-colors">
                                {file.filename}
                              </p>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                <span>{extMeta.name}</span>
                                <span>•</span>
                                <span>{formatBytes(file.size || 0)}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formatThaiDate(file.createdAt).split(' ')[0]}
                            </span>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-md text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="เปิดดูไฟล์"
                            >
                              <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400">
                    <i className="fa-solid fa-box-open text-2xl text-slate-300 dark:text-slate-600 mb-2 block"></i>
                    ยังไม่มีประวัติการอัปโหลดไฟล์
                  </div>
                )}
              </div>
            )}

            {/* ════════ TAB 3: QUICK UPLOAD ════════ */}
            {activeTab === 'upload' && (
              <div className="space-y-3">
                {/* Module Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Folder className="w-3 h-3 text-primary-500" />
                    ระบุส่วนขยายและโฟลเดอร์ปลายทาง
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={uploadTargetModule}
                      onChange={(e) => handleModuleChange(e.target.value)}
                      disabled={uploading}
                      className="form-select text-xs py-1.5 px-2 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      {EXTENSION_MODULES.map((mod) => (
                        <option key={mod.id} value={mod.id}>
                          {mod.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={uploadTargetFolder}
                      onChange={(e) => setUploadTargetFolder(e.target.value)}
                      disabled={uploading}
                      className="form-select text-xs py-1.5 px-2 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      {currentModMeta.commonFolders.map((fld) => (
                        <option key={fld} value={fld}>
                          {fld}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dropzone / Upload Box */}
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                    uploading
                      ? 'border-primary-400 bg-primary-50/30 dark:bg-primary-950/20 cursor-not-allowed'
                      : 'border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleQuickUpload}
                    disabled={uploading}
                  />

                  {uploading ? (
                    <div className="space-y-2 py-2">
                      <Loader2 className="w-7 h-7 text-primary-500 animate-spin mx-auto" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        กำลังอัปโหลดไฟล์... {uploadProgress}%
                      </p>
                      <div className="w-full max-w-[180px] mx-auto bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${uploadProgress}%` }}
                          className="bg-primary-500 h-full transition-all duration-300"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-500 flex items-center justify-center mx-auto shadow-xs">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง
                      </p>
                      <p className="text-[10px] text-slate-400">
                        โฟลเดอร์: <span className="font-mono text-primary-600 dark:text-primary-400 font-bold">{uploadTargetModule}/{uploadTargetFolder}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload Status Feedback */}
                {uploadSuccess && (
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span className="truncate">{uploadSuccess}</span>
                  </div>
                )}
                {uploadError && (
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span className="truncate">{uploadError}</span>
                  </div>
                )}
              </div>
            )}

            {/* ── Bottom Quick Action Buttons ── */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <Link href="/modules/upload" className="block w-full">
                <Button
                  type="button"
                  variant="primary"
                  size="xs"
                  className="w-full justify-center"
                  icon="fa-solid fa-photo-film"
                >
                  คลังสื่อฉบับเต็ม
                </Button>
              </Link>
              <Link href="/modules/upload/settings" className="block w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="w-full justify-center"
                  icon="fa-solid fa-server"
                >
                  ตั้งค่า Cloud S3
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
