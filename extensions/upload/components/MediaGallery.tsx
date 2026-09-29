'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Card, Button, Input, Badge } from '@/components/ui';
import UploadDropzone from './UploadDropzone';
import FileDetailsModal from './FileDetailsModal';
import {
  formatBytes,
  getCategoryBadgeVariant,
  getCategoryIcon,
  FileCategory,
  EXTENSION_MODULES,
  getExtensionModuleMeta,
  formatThaiDate,
} from '../lib/file-utils';

interface MediaGalleryProps {
  onSelectFile?: (file: any) => void;
  isPickerMode?: boolean;
  filterCategory?: string;
  defaultModule?: string;
}

const CATEGORIES: { id: FileCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'ทุกประเภทไฟล์', icon: 'fa-solid fa-folder-open' },
  { id: 'image', label: 'รูปภาพ (Images)', icon: 'fa-solid fa-image' },
  { id: 'pdf', label: 'เอกสาร PDF', icon: 'fa-solid fa-file-pdf' },
  { id: 'document', label: 'เอกสาร (Office)', icon: 'fa-solid fa-file-word' },
  { id: 'audio', label: 'ไฟล์เสียง (Audio)', icon: 'fa-solid fa-music' },
  { id: 'video', label: 'วิดีโอ (Videos)', icon: 'fa-solid fa-film' },
];

function getFileTypeMeta(mimetype: string, filename: string) {
  const ext = (filename.split('.').pop() || '').toUpperCase();
  if (mimetype === 'application/pdf' || ext === 'PDF') {
    return {
      ext: 'PDF',
      badgeClass: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
      icon: 'fa-solid fa-file-pdf',
      iconColor: 'text-rose-500',
    };
  }
  if (mimetype.includes('word') || ['DOC', 'DOCX'].includes(ext)) {
    return {
      ext: ext || 'DOC',
      badgeClass: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
      icon: 'fa-solid fa-file-word',
      iconColor: 'text-blue-500',
    };
  }
  if (mimetype.includes('excel') || mimetype.includes('spreadsheet') || ['XLS', 'XLSX', 'CSV'].includes(ext)) {
    return {
      ext: ext || 'XLS',
      badgeClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
      icon: 'fa-solid fa-file-excel',
      iconColor: 'text-emerald-500',
    };
  }
  if (mimetype.includes('presentation') || ['PPT', 'PPTX'].includes(ext)) {
    return {
      ext: ext || 'PPT',
      badgeClass: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
      icon: 'fa-solid fa-file-powerpoint',
      iconColor: 'text-amber-500',
    };
  }
  if (mimetype.startsWith('image/') || ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF', 'SVG'].includes(ext)) {
    return {
      ext: ext || 'IMG',
      badgeClass: 'text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800',
      icon: 'fa-solid fa-image',
      iconColor: 'text-violet-500',
    };
  }
  if (mimetype.startsWith('video/') || ['MP4', 'WEBM', 'MOV'].includes(ext)) {
    return {
      ext: ext || 'VIDEO',
      badgeClass: 'text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800',
      icon: 'fa-solid fa-file-video',
      iconColor: 'text-pink-500',
    };
  }
  if (mimetype.startsWith('audio/') || ['MP3', 'WAV', 'OGG'].includes(ext)) {
    return {
      ext: ext || 'AUDIO',
      badgeClass: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
      icon: 'fa-solid fa-file-audio',
      iconColor: 'text-purple-500',
    };
  }
  return {
    ext: ext || 'FILE',
    badgeClass: 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    icon: 'fa-solid fa-file',
    iconColor: 'text-slate-400',
  };
}

export default function MediaGallery({
  onSelectFile,
  isPickerMode = false,
  filterCategory = 'all',
  defaultModule = 'all',
}: MediaGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<FileCategory>((filterCategory as any) || 'all');
  const [activeModule, setActiveModule] = useState<string>(defaultModule);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [stats, setStats] = useState<{
    totalFiles: number;
    totalBytes: number;
    imageCount: number;
    audioCount: number;
    videoCount: number;
    pdfCount: number;
    docCount: number;
    moduleCounts?: Record<string, number>;
    provider: 'LOCAL' | 'S3';
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [showUploadDropzone, setShowUploadDropzone] = useState(false);
  const [selectedFileForModal, setSelectedFileForModal] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.append('category', activeCategory);
      if (activeModule !== 'all') params.append('module', activeModule);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await fetch(`/api/modules/upload/list?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setFiles(data.items || []);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        toast.error(data.error || 'ไม่สามารถโหลดไฟล์ได้');
      }
    } catch (err) {
      console.error('Failed to fetch media files', err);
      toast.error('ข้อผิดพลาดในการโหลดคลังไฟล์');
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, activeModule, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const copyUrl = (e: React.MouseEvent, file: any) => {
    e.stopPropagation();
    navigator.clipboard.writeText(file.url);
    setCopiedId(file.id);
    toast.success('คัดลอก URL สำเร็จ');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUploadComplete = () => {
    fetchFiles();
    setShowUploadDropzone(false);
  };

  return (
    <div className="space-y-4 font-prompt animate-fade-in">
      {/* ── 1. Compact Unified Control Toolbar ── */}
      <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="flex-1 max-w-sm">
            <Input
              type="text"
              placeholder="ค้นหาชื่อไฟล์ หรือ นามสกุล..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon="fa-solid fa-magnifying-glass"
              className="w-full text-xs"
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Filter by Extension */}
            <select
              value={activeModule}
              onChange={(e) => setActiveModule(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500"
              title="กรองตามส่วนขยายที่มา"
            >
              <option value="all">📁 ทุก Extension ({stats?.totalFiles || 0})</option>
              {EXTENSION_MODULES.map((m) => {
                const count = stats?.moduleCounts?.[m.id] || 0;
                return (
                  <option key={m.id} value={m.id}>
                    {m.name} ({count})
                  </option>
                );
              })}
            </select>

            {/* Filter by File Type */}
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value as FileCategory)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500"
              title="กรองตามประเภทไฟล์"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500"
              title="เรียงลำดับ"
            >
              <option value="createdAt-desc">วันที่ล่าสุด (ใหม่สุด)</option>
              <option value="createdAt-asc">วันที่ (เก่าสุด)</option>
              <option value="filename-asc">ชื่อไฟล์ (A - Z)</option>
              <option value="size-desc">ขนาดไฟล์ (ใหญ่สุด)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-800/60">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 px-2.5 rounded-lg text-xs transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
                title="ตารางการ์ด"
              >
                <i className="fa-solid fa-table-cells text-xs"></i>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 px-2.5 rounded-lg text-xs transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
                title="รายการ"
              >
                <i className="fa-solid fa-list text-xs"></i>
              </button>
            </div>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchFiles}
              icon={isLoading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-rotate'}
              title="รีเฟรช"
            />

            {/* Upload Button */}
            <Button
              variant={showUploadDropzone ? 'secondary' : 'primary'}
              size="sm"
              icon={showUploadDropzone ? 'fa-solid fa-chevron-up' : 'fa-solid fa-cloud-arrow-up'}
              onClick={() => setShowUploadDropzone(!showUploadDropzone)}
              className="font-bold"
            >
              {showUploadDropzone ? 'ซ่อนกล่องอัปโหลด' : 'อัปโหลดไฟล์'}
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Upload Dropzone Section ── */}
      {showUploadDropzone && (
        <div className="animate-fade-in">
          <UploadDropzone onUploadSuccess={handleUploadComplete} />
        </div>
      )}

      {/* ── 3. File Gallery Content ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[220px] gap-2">
          <i className="fa-solid fa-circle-notch fa-spin text-2xl text-primary-500" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">กำลังโหลดคลังไฟล์...</span>
        </div>
      ) : files.length === 0 ? (
        <Card variant="convex" padding="lg" className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <i className="fa-solid fa-folder-open text-xl"></i>
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            ไม่พบไฟล์ในเงื่อนไขที่เลือก
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            ลองเปลี่ยนตัวกรอง หรือคลิกปุ่มอัปโหลดไฟล์ใหม่เข้าสู่ระบบ
          </p>
        </Card>
      ) : viewMode === 'grid' ? (
        /* ── Modern Compact Grid View ── */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {files.map((file) => {
            const typeMeta = getFileTypeMeta(file.mimetype, file.filename);
            const extMeta = getExtensionModuleMeta(file.module);

            return (
              <div
                key={file.id}
                onClick={() => {
                  if (isPickerMode && onSelectFile) {
                    onSelectFile(file);
                  } else {
                    setSelectedFileForModal(file);
                  }
                }}
                className="group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/90 shadow-xs hover:shadow-clay-card hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col overflow-hidden"
              >
                {/* Thumbnail Preview Box */}
                <div className="h-28 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center relative overflow-hidden border-b border-slate-100 dark:border-slate-800/80">
                  {file.category === 'image' ? (
                    <>
                      <img
                        src={file.url}
                        alt={file.filename}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="fallback-icon hidden flex-col items-center justify-center">
                        <i className={`${typeMeta.icon} ${typeMeta.iconColor} text-3xl`}></i>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <i className={`${typeMeta.icon} ${typeMeta.iconColor} text-3xl`}></i>
                    </div>
                  )}

                  {/* Extension Tag (top-left) */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${typeMeta.badgeClass}`}>
                      {typeMeta.ext}
                    </span>
                  </div>

                  {/* Source Module (bottom-left) */}
                  <div className="absolute bottom-1.5 left-2 z-10">
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-white/95 dark:bg-slate-850/95 backdrop-blur-xs px-1.5 py-0.5 rounded shadow-2xs">
                      <i className={`${extMeta.icon} text-[9px] mr-1 text-primary-500`}></i>
                      {extMeta.name}
                    </span>
                  </div>

                  {/* Quick Copy Link (top-right, hover) */}
                  <button
                    type="button"
                    onClick={(e) => copyUrl(e, file)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[11px] z-10"
                    title="คัดลอกลิงก์"
                  >
                    <i className={copiedId === file.id ? 'fa-solid fa-check text-emerald-400' : 'fa-solid fa-copy'}></i>
                  </button>
                </div>

                {/* Compact Info Footer */}
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={file.filename}>
                    {file.filename}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>{formatBytes(file.size || 0)}</span>
                    <span>{formatThaiDate(file.createdAt).split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Compact List View ── */
        <Card variant="convex" padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">ประเภท</th>
                  <th className="py-2.5 px-3">ชื่อไฟล์</th>
                  <th className="py-2.5 px-3">ส่วนขยายที่มา</th>
                  <th className="py-2.5 px-3">โฟลเดอร์</th>
                  <th className="py-2.5 px-3">ขนาด</th>
                  <th className="py-2.5 px-3">วันที่อัปโหลด</th>
                  <th className="py-2.5 px-3 text-right">เครื่องมือ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {files.map((file) => {
                  const typeMeta = getFileTypeMeta(file.mimetype, file.filename);
                  const meta = getExtensionModuleMeta(file.module);

                  return (
                    <tr
                      key={file.id}
                      onClick={() => {
                        if (isPickerMode && onSelectFile) {
                          onSelectFile(file);
                        } else {
                          setSelectedFileForModal(file);
                        }
                      }}
                      className="hover:bg-primary-50/40 dark:hover:bg-primary-950/20 transition-colors cursor-pointer"
                    >
                      <td className="py-2 px-3 text-center">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${typeMeta.badgeClass}`}>
                          {typeMeta.ext}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate" title={file.filename}>
                        {file.filename}
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <i className={`${meta.icon} text-primary-500 text-[10px]`}></i>
                          {meta.name}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-400">
                        {file.folder || 'general'}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {formatBytes(file.size || 0)}
                      </td>
                      <td className="py-2 px-3 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                        {formatThaiDate(file.createdAt)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="xs"
                            icon={copiedId === file.id ? 'fa-solid fa-check text-emerald-500' : 'fa-solid fa-copy'}
                            onClick={(e) => copyUrl(e, file)}
                            title="คัดลอก URL"
                          />
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all inline-flex items-center justify-center text-xs"
                            title="เปิดไฟล์ในหน้าใหม่"
                          >
                            <i className="fa-solid fa-arrow-up-right-from-square"></i>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── 4. File Details Modal ── */}
      {selectedFileForModal && (
        <FileDetailsModal
          file={selectedFileForModal}
          onClose={() => setSelectedFileForModal(null)}
          onDeleteSuccess={(deletedId) => {
            setFiles((prev) => prev.filter((f) => f.id !== deletedId));
            fetchFiles();
          }}
          onSelect={onSelectFile}
          isPickerMode={isPickerMode}
        />
      )}
    </div>
  );
}
