'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Card, Button, Input, Badge } from '@/components/ui';
import UploadDropzone from './UploadDropzone';
import FileDetailsModal from './FileDetailsModal';
import { formatBytes, getCategoryBadgeColor, FileCategory } from '../lib/file-utils';
import {
  Search,
  UploadCloud,
  Grid,
  List,
  Filter,
  Image as ImageIcon,
  Music,
  Film,
  FileText,
  Copy,
  Trash2,
  ExternalLink,
  Check,
  RefreshCw,
  FolderOpen,
  Sparkles,
} from 'lucide-react';

interface MediaGalleryProps {
  onSelectFile?: (file: any) => void;
  isPickerMode?: boolean;
  filterCategory?: string;
}

const CATEGORIES: { id: FileCategory; label: string; icon: any }[] = [
  { id: 'all', label: 'ทั้งหมด', icon: FolderOpen },
  { id: 'image', label: 'รูปภาพ (Images)', icon: ImageIcon },
  { id: 'audio', label: 'เสียง (Audio)', icon: Music },
  { id: 'pdf', label: 'เอกสาร PDF', icon: FileText },
  { id: 'document', label: 'เอกสาร (Office)', icon: FileText },
  { id: 'video', label: 'วิดีโอ (Videos)', icon: Film },
];

export default function MediaGallery({
  onSelectFile,
  isPickerMode = false,
  filterCategory = 'all',
}: MediaGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<FileCategory>((filterCategory as any) || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<any[]>([]);
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
      if (searchQuery.trim()) params.append('q', searchQuery.trim());

      const res = await fetch(`/api/modules/upload/list?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setFiles(data.items || []);
      } else {
        toast.error(data.error || 'ไม่สามารถโหลดไฟล์ได้');
      }
    } catch (err) {
      console.error('Failed to fetch media files', err);
      toast.error('ข้อผิดพลาดในการโหลดคลังไฟล์');
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const copyUrl = (e: React.MouseEvent, file: any) => {
    e.stopPropagation();
    navigator.clipboard.writeText(file.url);
    setCopiedId(file.id);
    toast.success('คัดลอก URL แล้ว');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUploadComplete = () => {
    fetchFiles();
    setShowUploadDropzone(false);
  };

  return (
    <div className="space-y-6 font-prompt animate-fade-in">

      {/* Control Bar */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="ค้นหาชื่อไฟล์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchFiles}
              className="p-2.5 text-slate-600 dark:text-slate-300"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="มุมมองตารางการ์ด (Grid)"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="มุมมองรายการ (List)"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <Button
              variant="primary"
              onClick={() => setShowUploadDropzone(!showUploadDropzone)}
              className="gap-2 shadow-sm text-xs sm:text-sm"
            >
              <UploadCloud className="h-4 w-4" />
              <span>{showUploadDropzone ? 'ซ่อนกล่องอัปโหลด' : 'อัปโหลดไฟล์ใหม่'}</span>
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 dark:border-slate-800 pt-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Upload Dropzone Section */}
      {showUploadDropzone && (
        <div className="animate-fade-in">
          <UploadDropzone onUploadSuccess={handleUploadComplete} />
        </div>
      )}

      {/* File Gallery Content */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : files.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderOpen className="h-14 w-14 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            ไม่พบไฟล์ในหมวดหมู่นี้
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            ยังไม่มีการอัปโหลดไฟล์ในหมวดนี้ คลิก &ldquo;อัปโหลดไฟล์ใหม่&rdquo; เพื่อเพิ่มรูปภาพ เสียง หรือเอกสาร PDF
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowUploadDropzone(true)}
            className="mt-4 gap-1.5"
          >
            <UploadCloud className="h-4 w-4" />
            <span>อัปโหลดไฟล์ทันที</span>
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {files.map((file) => {
            const badge = getCategoryBadgeColor(file.category);
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
                className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-200 cursor-pointer flex flex-col"
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-slate-100 dark:bg-slate-950 flex items-center justify-center relative overflow-hidden">
                  {file.category === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : file.category === 'audio' ? (
                    <div className="h-14 w-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
                      <Music className="h-7 w-7" />
                    </div>
                  ) : file.category === 'video' ? (
                    <div className="h-14 w-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner">
                      <Film className="h-7 w-7" />
                    </div>
                  ) : file.category === 'pdf' ? (
                    <div className="h-14 w-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shadow-inner">
                      <FileText className="h-7 w-7" />
                    </div>
                  ) : (
                    <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                      <FileText className="h-7 w-7" />
                    </div>
                  )}

                  {/* Category Pill */}
                  <span
                    className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${badge.bg} ${badge.text}`}
                  >
                    {badge.label}
                  </span>

                  {/* Hover Quick Action Buttons */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => copyUrl(e, file)}
                      className="h-7 w-7 rounded-lg bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:text-primary-600 shadow-md flex items-center justify-center backdrop-blur-sm transition"
                      title="คัดลอก URL"
                    >
                      {copiedId === file.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Info Footer */}
                <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
                  <p
                    className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate"
                    title={file.filename}
                  >
                    {file.filename}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{formatBytes(file.size)}</span>
                    <span>
                      {new Date(file.createdAt).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-slate-500 text-[11px]">
                <tr>
                  <th className="p-3.5">ตัวอย่าง</th>
                  <th className="p-3.5">ชื่อไฟล์</th>
                  <th className="p-3.5">ประเภท</th>
                  <th className="p-3.5">ขนาด</th>
                  <th className="p-3.5">วันที่อัปโหลด</th>
                  <th className="p-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {files.map((file) => {
                  const badge = getCategoryBadgeColor(file.category);
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
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 cursor-pointer transition"
                    >
                      <td className="p-3.5 w-16">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                          {file.category === 'image' ? (
                            <img
                              src={file.url}
                              alt={file.filename}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <FileText className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                        {file.filename}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono">
                        {formatBytes(file.size)}
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {new Date(file.createdAt).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => copyUrl(e, file)}
                          className="text-xs p-1.5"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Detail Modal */}
      {selectedFileForModal && (
        <FileDetailsModal
          file={selectedFileForModal}
          onClose={() => setSelectedFileForModal(null)}
          onDeleteSuccess={() => {
            fetchFiles();
            setSelectedFileForModal(null);
          }}
          onSelect={onSelectFile}
          isPickerMode={isPickerMode}
        />
      )}
    </div>
  );
}
