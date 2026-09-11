'use client';

import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Card, Button, Badge } from '@/components/ui';
import { formatBytes, getFileCategory } from '../lib/file-utils';
import {
  UploadCloud,
  FileText,
  Music,
  Image as ImageIcon,
  Film,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  FileCode,
} from 'lucide-react';

interface UploadDropzoneProps {
  onUploadSuccess?: (uploadedFiles: any[]) => void;
  acceptedTypes?: string;
  maxFiles?: number;
  compact?: boolean;
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
}: UploadDropzoneProps) {
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

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'image':
        return <ImageIcon className="h-5 w-5 text-emerald-500" />;
      case 'audio':
        return <Music className="h-5 w-5 text-purple-500" />;
      case 'video':
        return <Film className="h-5 w-5 text-rose-500" />;
      case 'pdf':
      case 'document':
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <FileCode className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4 font-prompt">
      {/* Drop Zone Box */}
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
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 text-center flex flex-col items-center justify-center ${
          compact ? 'p-6' : 'p-8 sm:p-12'
        } ${
          isDragging
            ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/30 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="h-14 w-14 rounded-2xl bg-primary-100/80 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-3.5 shadow-inner">
          <UploadCloud className="h-7 w-7" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
          ลากไฟล์มาวางที่นี่ หรือ <span className="text-primary-600 dark:text-primary-400 underline">คลิกเพื่อเลือกไฟล์</span>
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
          รองรับรูปภาพ (JPG, PNG, WebP), ไฟล์เสียง (MP3, WAV), เอกสาร PDF, Word, Excel, และวิดีโอ (สูงสุด 50MB/ไฟล์)
        </p>

        <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
          <Badge variant="success" className="text-[11px] py-0.5 px-2">
            🖼️ Images
          </Badge>
          <Badge variant="primary" className="text-[11px] py-0.5 px-2">
            🎵 Audio
          </Badge>
          <Badge variant="danger" className="text-[11px] py-0.5 px-2">
            📄 PDF
          </Badge>
          <Badge variant="warning" className="text-[11px] py-0.5 px-2">
            📊 Documents
          </Badge>
          <Badge variant="neutral" className="text-[11px] py-0.5 px-2">
            ☁️ Direct to S3
          </Badge>
        </div>
      </div>

      {/* Upload Queue List */}
      {queue.length > 0 && (
        <Card className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                รายการไฟล์ที่เตรียมอัปโหลด ({queue.length} ไฟล์)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearQueue}
                disabled={isUploading}
                className="text-xs text-slate-500"
              >
                ล้างรายการ
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={uploadAll}
                disabled={isUploading || queue.every((q) => q.status === 'success')}
                className="gap-1.5 text-xs shadow-sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>กำลังอัปโหลด...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>เริ่มอัปโหลดทั้งหมด</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-9 w-9 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm shrink-0">
                    {getIcon(item.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
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
                      <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                    </div>
                  )}

                  {item.status === 'success' && (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>สำเร็จ</span>
                    </span>
                  )}

                  {item.status === 'error' && (
                    <span className="inline-flex items-center gap-1 text-rose-500 text-xs font-semibold">
                      <AlertCircle className="h-4 w-4" />
                      <span>ล้มเหลว</span>
                    </span>
                  )}

                  {item.status === 'pending' && (
                    <button
                      onClick={() => removeQueueItem(item.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
                    >
                      <X className="h-4 w-4" />
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
