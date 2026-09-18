'use client';

import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import MediaPickerModal from './MediaPickerModal';
import { uploadFileToServer, UploadedMediaResult } from '../lib/client-upload';
import { formatBytes, getFileCategory } from '../lib/file-utils';
import {
  UploadCloud,
  FileText,
  Music,
  ImageIcon,
  Film,
  FileCode,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  FolderOpen,
  Download,
  Trash2,
} from 'lucide-react';

export interface FileUploadProps {
  id?: string;
  label?: string;
  helperText?: string;
  error?: string;
  value?: UploadedMediaResult[];
  onChange?: (files: UploadedMediaResult[]) => void;
  acceptedTypes?: string;
  categoryFilter?: 'all' | 'image' | 'audio' | 'pdf' | 'document' | 'video';
  maxFiles?: number;
  maxSizeBytes?: number; // default 50MB
  compact?: boolean;
  disabled?: boolean;
  required?: boolean;
  allowMediaPicker?: boolean;
  className?: string;
}

export default function FileUpload({
  id,
  label,
  helperText,
  error,
  value = [],
  onChange,
  acceptedTypes = '*',
  categoryFilter = 'all',
  maxFiles = 10,
  maxSizeBytes = 50 * 1024 * 1024,
  compact = false,
  disabled = false,
  required = false,
  allowMediaPicker = true,
  className = '',
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{ [name: string]: number }>({});
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const getFileIcon = (mimetype: string, name: string) => {
    const cat = getFileCategory(mimetype, name);
    switch (cat) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-emerald-500" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'audio':
        return <Music className="w-5 h-5 text-purple-500" />;
      case 'video':
        return <Film className="w-5 h-5 text-amber-500" />;
      default:
        return <FileCode className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || disabled || isUploading) return;

    const files = Array.from(fileList);

    // If maxFiles is 1, replace previous file automatically
    let newUploadedList: UploadedMediaResult[] = [...value];
    if (maxFiles === 1) {
      newUploadedList = [];
    } else if (value.length + files.length > maxFiles) {
      toast.error(`สามารถอัปโหลดไฟล์ได้สูงสุด ${maxFiles} ไฟล์`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);

    for (const file of files) {
      if (file.size > maxSizeBytes) {
        toast.error(`ไฟล์ ${file.name} มีขนาดเกินกำหนด (${formatBytes(maxSizeBytes)})`);
        continue;
      }

      setUploadingFiles((prev) => ({ ...prev, [file.name]: 30 }));

      try {
        const res = await uploadFileToServer(file, {
          onProgress: (p) => setUploadingFiles((prev) => ({ ...prev, [file.name]: p })),
        });

        if (res.success && res.data) {
          newUploadedList.push(res.data);
          toast.success(`อัปโหลด ${file.name} สำเร็จ`);
        } else {
          toast.error(res.error || `อัปโหลด ${file.name} ไม่สำเร็จ`);
        }
      } catch (err: any) {
        toast.error(`เกิดข้อผิดพลาดในการอัปโหลด ${file.name}`);
      } finally {
        setUploadingFiles((prev) => {
          const next = { ...prev };
          delete next[file.name];
          return next;
        });
      }
    }

    setIsUploading(false);
    if (onChange) {
      onChange(newUploadedList);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (idToRemove: string) => {
    const updated = value.filter((f) => f.id !== idToRemove);
    if (onChange) {
      onChange(updated);
    }
  };

  const handleMediaPickerSelect = (selected: { id?: string; url: string; filename: string; mimetype: string; size?: number }) => {
    const newMedia: UploadedMediaResult = {
      id: selected.id || `media-${Date.now()}`,
      filename: selected.filename,
      url: selected.url,
      size: selected.size || 0,
      mimetype: selected.mimetype,
    };
    const updated = [...value, newMedia];
    if (onChange) {
      onChange(updated);
    }
    toast.success('เพิ่มไฟล์จากคลังสื่อเรียบร้อย');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          <span className="text-[11px] text-slate-400">
            {value.length}/{maxFiles} ไฟล์ (สูงสุด {formatBytes(maxSizeBytes)})
          </span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-2xl transition-all duration-200 text-center ${
          isDragging
            ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/20 hover:border-primary-400 hover:bg-slate-100/50'
        } ${compact ? 'p-4' : 'p-6'}`}
      >
        <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-2 shadow-xs">
          <UploadCloud className="w-5 h-5" />
        </div>

        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">
          ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
        </p>
        <p className="text-[11px] text-slate-400 mb-3">
          รองรับไฟล์ PDF, Word, Excel, รูปภาพ, สื่อต่างๆ (ขนาดไม่เกิน {formatBytes(maxSizeBytes)})
        </p>

        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="primary"
            disabled={disabled || isUploading}
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
              fileInputRef.current?.click();
            }}
            className="text-xs px-3 py-1.5"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                กำลังอัปโหลด...
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                เลือกไฟล์จากเครื่อง
              </>
            )}
          </Button>

          {allowMediaPicker && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled || isUploading}
              onClick={() => setIsMediaPickerOpen(true)}
              className="text-xs px-3 py-1.5"
            >
              <FolderOpen className="w-3.5 h-3.5 mr-1.5 text-sky-500" />
              เลือกจากคลังสื่อ
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          id={id}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedTypes}
          disabled={disabled || isUploading}
          onClick={(e) => {
            (e.target as HTMLInputElement).value = '';
          }}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          aria-label={label || 'อัปโหลดไฟล์'}
        />
      </div>

      {/* Helper / Error */}
      {error ? (
        <p className="text-xs text-rose-500">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      ) : null}

      {/* Uploading In-Progress List */}
      {Object.keys(uploadingFiles).length > 0 && (
        <div className="space-y-1.5 pt-1">
          {Object.entries(uploadingFiles).map(([filename, progress]) => (
            <div
              key={filename}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3 text-xs"
            >
              <Loader2 className="w-4 h-4 animate-spin text-primary-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="truncate font-medium">{filename}</span>
                  <span className="font-mono text-slate-400">{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-primary-500 h-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files List */}
      {value.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {value.map((file) => (
            <div
              key={file.id || file.url}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 shrink-0">
                  {getFileIcon(file.mimetype || '', file.filename)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {file.filename}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {formatBytes(file.size || 0)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="ดาวน์โหลด / เปิดดู"
                >
                  <Download className="w-4 h-4" />
                </a>

                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="ลบไฟล์"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Picker Modal */}
      {isMediaPickerOpen && (
        <MediaPickerModal
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={handleMediaPickerSelect}
          filterCategory={categoryFilter}
          title={`เลือกไฟล์สำหรับ ${label || 'ระบบ'}`}
        />
      )}
    </div>
  );
}
