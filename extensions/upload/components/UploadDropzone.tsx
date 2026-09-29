'use client';

import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Card, Button, Badge } from '@/components/ui';
import { formatBytes, getFileCategory, getCategoryIcon, EXTENSION_MODULES, getExtensionModuleMeta } from '../lib/file-utils';

interface UploadDropzoneProps {
  onUploadSuccess?: (uploadedFiles: any[]) => void;
  acceptedTypes?: string;
  maxFiles?: number;
  compact?: boolean;
  defaultModule?: string;
  defaultFolder?: string;
}

interface QueuedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  category: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: any;
}

export default function UploadDropzone({
  onUploadSuccess,
  acceptedTypes = '*',
  maxFiles = 20,
  compact = false,
  defaultModule = 'upload',
  defaultFolder = 'general',
}: UploadDropzoneProps) {
  const [selectedModule, setSelectedModule] = useState(defaultModule);
  const [selectedFolder, setSelectedFolder] = useState(defaultFolder);
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newFiles: QueuedFile[] = Array.from(fileList).slice(0, maxFiles).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      category: getFileCategory(file.type || '', file.name),
      progress: 0,
      status: 'pending',
    }));

    setQueue((prev) => [...prev, ...newFiles]);
  };

  const removeQueueItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const uploadAll = async () => {
    if (queue.length === 0 || isUploading) return;

    setIsUploading(true);
    const completedResults: any[] = [];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'success') {
        if (item.result) completedResults.push(item.result);
        continue;
      }

      setQueue((prev) =>
        prev.map((q, idx) => (idx === i ? { ...q, status: 'uploading', progress: 30 } : q))
      );

      const formData = new FormData();
      formData.append('file', item.file);
      formData.append('module', selectedModule);
      formData.append('folder', selectedFolder || 'general');

      try {
        setQueue((prev) =>
          prev.map((q, idx) => (idx === i ? { ...q, progress: 60 } : q))
        );

        const res = await fetch('/api/modules/upload/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (res.ok && data.success) {
          const uploadedRecord = data.file || data.files?.[0];
          setQueue((prev) =>
            prev.map((q, idx) =>
              idx === i
                ? { ...q, status: 'success', progress: 100, result: uploadedRecord }
                : q
            )
          );
          if (uploadedRecord) completedResults.push(uploadedRecord);
        } else {
          setQueue((prev) =>
            prev.map((q, idx) =>
              idx === i
                ? {
                    ...q,
                    status: 'error',
                    progress: 0,
                    error: data.error || 'การอัปโหลดล้มเหลว',
                  }
                : q
            )
          );
        }
      } catch (err: any) {
        setQueue((prev) =>
          prev.map((q, idx) =>
            idx === i
              ? {
                  ...q,
                  status: 'error',
                  progress: 0,
                  error: err.message || 'ข้อผิดพลาดในการเชื่อมต่อ',
                }
              : q
          )
        );
      }
    }

    setIsUploading(false);

    if (completedResults.length > 0) {
      toast.success(`อัปโหลดสำเร็จ ${completedResults.length} ไฟล์`);
      if (onUploadSuccess) {
        onUploadSuccess(completedResults);
      }
    }
  };

  return (
    <div className="space-y-4 font-prompt">
      {/* ── Destination Extension / Module & Folder Selector ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-folder-tree text-sm"></i>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              บันทึกไปยัง Extension และโฟลเดอร์
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              จัดเก็บเป็น: <code className="text-primary-600 dark:text-primary-400">uploads/{selectedModule}/{selectedFolder}/ปี/เดือน/</code>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedModule}
            onChange={(e) => {
              const mod = e.target.value;
              setSelectedModule(mod);
              const meta = getExtensionModuleMeta(mod);
              setSelectedFolder(meta.defaultFolder);
            }}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {EXTENSION_MODULES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.id})
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="โฟลเดอร์ย่อย"
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 w-28 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* ── Drag & Drop Box ── */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => {
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          fileInputRef.current?.click();
        }}
        className={`relative border-2 border-dashed rounded-[24px] cursor-pointer transition-all duration-300 text-center flex flex-col items-center justify-center ${
          compact ? 'p-6' : 'p-8 sm:p-12'
        } ${
          isDragging
            ? 'border-primary-500 bg-primary-50/70 dark:bg-primary-950/40 scale-[1.01] shadow-lg'
            : 'border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50 hover:border-primary-400 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 shadow-clay-card'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onClick={(e) => {
            (e.target as HTMLInputElement).value = '';
          }}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="h-16 w-16 rounded-[22px] bg-primary-100/80 dark:bg-primary-950/70 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4 shadow-clay-button">
          <i className="fa-solid fa-cloud-arrow-up text-2xl"></i>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
          ลากไฟล์มาวางที่นี่ หรือ <span className="text-primary-600 dark:text-primary-400 underline underline-offset-4">คลิกเลือกจากอุปกรณ์</span>
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md">
          รองรับรูปภาพ (JPG, PNG, WebP), ไฟล์เสียง (MP3), เอกสาร PDF, Word, Excel, และวิดีโอ (สูงสุด 50MB ต่อไฟล์)
        </p>

        <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
          <Badge variant="success" size="xs">
            <i className="fa-solid fa-image mr-1"></i>
            รูปภาพ
          </Badge>
          <Badge variant="danger" size="xs">
            <i className="fa-solid fa-file-pdf mr-1"></i>
            PDF
          </Badge>
          <Badge variant="info" size="xs">
            <i className="fa-solid fa-file-word mr-1"></i>
            เอกสาร Office
          </Badge>
          <Badge variant="candy" size="xs">
            <i className="fa-solid fa-music mr-1"></i>
            ไฟล์เสียง
          </Badge>
          <Badge variant="neutral" size="xs">
            <i className="fa-solid fa-cloud mr-1"></i>
            Cloud Storage
          </Badge>
        </div>
      </div>

      {/* ── Upload Queue List ── */}
      {queue.length > 0 && (
        <Card variant="convex" padding="md" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-list-check text-primary-500 text-sm"></i>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                รายการเตรียมอัปโหลด ({queue.length} ไฟล์)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                onClick={clearQueue}
                disabled={isUploading}
                icon="fa-solid fa-trash-can"
              >
                ล้างรายการ
              </Button>
              <Button
                variant="primary"
                size="xs"
                onClick={uploadAll}
                disabled={isUploading || queue.every((q) => q.status === 'success')}
                icon={isUploading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-upload'}
                className="font-bold shadow-sm"
              >
                {isUploading ? 'กำลังอัปโหลด...' : 'เริ่มอัปโหลดทั้งหมด'}
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-9 w-9 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center shadow-xs shrink-0 text-slate-600 dark:text-slate-300">
                    <i className={`${getCategoryIcon(item.category as any)} text-sm`}></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{formatBytes(item.size)}</span>
                      <span>•</span>
                      <span className="uppercase">{item.category}</span>
                      {item.error && (
                        <span className="text-rose-500 font-semibold">• {item.error}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress / Status */}
                <div className="flex items-center gap-2">
                  {item.status === 'uploading' && (
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary-600 h-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <i className="fa-solid fa-spinner fa-spin text-xs text-primary-600"></i>
                    </div>
                  )}

                  {item.status === 'success' && (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      <i className="fa-solid fa-circle-check"></i>
                      <span>สำเร็จ</span>
                    </span>
                  )}

                  {item.status === 'error' && (
                    <span className="inline-flex items-center gap-1 text-rose-500 text-xs font-bold">
                      <i className="fa-solid fa-circle-exclamation"></i>
                      <span>ล้มเหลว</span>
                    </span>
                  )}

                  {item.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => removeQueueItem(item.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
                    >
                      <i className="fa-solid fa-xmark text-xs"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
