'use client';

import React, { useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import MediaPickerModal from './MediaPickerModal';
import { WebcamCaptureModal } from './WebcamCaptureModal';
import { uploadFileToServer, base64ToFile, UploadedMediaResult } from '../lib/client-upload';
import {
  Camera,
  Upload,
  FolderOpen,
  Trash2,
  RefreshCw,
  Loader2,
  ImageIcon,
  User,
  MapPin,
  Sparkles,
} from 'lucide-react';

export type ImageUploadVariant = 'avatar' | 'square' | 'id-photo' | 'map' | 'landscape' | 'auto';

export interface ImageUploadProps {
  id?: string;
  label?: string;
  value?: string | null;
  onChange: (url: string, fileData?: UploadedMediaResult) => void;
  onRemove?: () => void;
  variant?: ImageUploadVariant;
  allowWebcam?: boolean;
  allowMediaPicker?: boolean;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
  placeholder?: string;
}

export default function ImageUpload({
  id,
  label,
  value,
  onChange,
  onRemove,
  variant = 'square',
  allowWebcam = true,
  allowMediaPicker = true,
  disabled = false,
  required = false,
  helperText,
  error,
  className = '',
  placeholder,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Dimension & Aspect ratio styles
  const getContainerStyles = () => {
    switch (variant) {
      case 'avatar':
        return 'aspect-square rounded-full max-w-[150px] mx-auto';
      case 'id-photo':
        // Official 4.5 x 6 cm (3:4 ratio)
        return 'aspect-[3/4] rounded-2xl w-full max-w-[200px] mx-auto';
      case 'map':
      case 'landscape':
        return 'aspect-video rounded-2xl w-full max-w-full';
      case 'square':
        return 'aspect-square rounded-2xl max-w-[200px] mx-auto';
      case 'auto':
      default:
        return 'min-h-[160px] rounded-2xl w-full';
    }
  };

  const handleUploadFile = useCallback(
    async (file: File) => {
      if (disabled || isUploading) return;

      if (!file.type.startsWith('image/')) {
        toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP, GIF)');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 10MB');
        return;
      }

      setIsUploading(true);
      setUploadProgress(20);

      try {
        const res = await uploadFileToServer(file, {
          onProgress: (p) => setUploadProgress(p),
        });

        if (res.success && res.data) {
          onChange(res.data.url, res.data);
          toast.success('อัปโหลดรูปภาพเรียบร้อย');
        } else {
          toast.error(res.error || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
        }
      } catch (err: any) {
        toast.error(err.message || 'ไม่สามารถอัปโหลดได้');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [disabled, isUploading, onChange]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleWebcamCapture = useCallback(
    async (imageSrc: string) => {
      const filename = `photo-capture-${Date.now()}.jpg`;
      const file = base64ToFile(imageSrc, filename);
      await handleUploadFile(file);
    },
    [handleUploadFile]
  );

  const handleMediaPickerSelect = (selectedFile: { url: string; filename: string }) => {
    onChange(selectedFile.url);
    toast.success('เลือกรูปภาพจากคลังสื่อเรียบร้อย');
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    } else {
      onChange('');
    }
  };

  return (
    <div className={`space-y-2 ${className} font-prompt`}>
      {/* Label and Badge */}
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="block text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {variant === 'id-photo' && (
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              มาตรฐาน 4.5 × 6 ซม.
            </span>
          )}
        </div>
      )}

      {/* Main Container Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group overflow-hidden transition-all duration-300 ${
          isDragging
            ? 'border-2 border-primary-500 bg-primary-500/10 scale-[1.02] shadow-lg'
            : value
            ? 'border border-slate-200 dark:border-slate-700 bg-slate-900 shadow-sm'
            : 'border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md'
        } ${getContainerStyles()}`}
      >
        {/* Uploading Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
            <Loader2 className="w-7 h-7 animate-spin text-primary-400 mb-2" />
            <p className="text-xs font-semibold">กำลังบันทึกภาพ...</p>
            {uploadProgress > 0 && (
              <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2 border border-slate-700">
                <div
                  className="bg-gradient-to-r from-primary-500 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Existing Image View */}
        {value ? (
          <div className="w-full h-full relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label || 'รูปภาพ'}
              className="w-full h-full object-cover"
            />

            {/* Corner Markers for Studio Feel */}
            {variant === 'id-photo' && (
              <>
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white/70 drop-shadow-xs" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-white/70 drop-shadow-xs" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-white/70 drop-shadow-xs" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white/70 drop-shadow-xs" />
              </>
            )}

            {/* Hover Action Floating Bar */}
            {!disabled && !isUploading && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-2 p-3">
                <p className="text-[11px] text-white/90 font-medium drop-shadow-xs">
                  จัดการรูปภาพ
                </p>
                <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80 shadow-xl">
                  {allowWebcam && (
                    <button
                      type="button"
                      onClick={() => setIsWebcamOpen(true)}
                      className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition transform hover:scale-105"
                      title="ถ่ายรูปใหม่ด้วยกล้อง Webcam"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white shadow-xs transition transform hover:scale-105"
                    title="อัปโหลดไฟล์รูปใหม่"
                  >
                    <Upload className="w-4 h-4" />
                  </button>

                  {allowMediaPicker && (
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition transform hover:scale-105"
                      title="เลือกจากคลังสื่อของระบบ"
                    >
                      <FolderOpen className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleRemove}
                    className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition transform hover:scale-105"
                    title="ลบรูปภาพ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty / Upload Placeholder States */
          <div className="w-full h-full flex flex-col items-center justify-between p-3.5 text-center select-none">
            {/* Top Silhouette / Graphic based on variant */}
            <div className="flex-1 flex flex-col items-center justify-center w-full my-auto">
              {variant === 'id-photo' ? (
                /* ID Photo Silhouette Card Placeholder */
                <div className="relative flex flex-col items-center justify-center mb-1">
                  <div className="w-14 h-16 rounded-[50%/60%_60%_40%_40%] border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 group-hover:border-primary-400 group-hover:text-primary-500 transition-colors">
                    <User className="w-8 h-8 opacity-60" />
                  </div>
                  <div className="w-20 h-4 border-t-2 border-dashed border-slate-300 dark:border-slate-700 rounded-t-xl bg-slate-100 dark:bg-slate-800/40 -mt-1 group-hover:border-primary-400 transition-colors" />
                </div>
              ) : variant === 'map' ? (
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 group-hover:text-primary-500 flex items-center justify-center mb-1.5 transition-colors">
                  <MapPin className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 group-hover:text-primary-500 flex items-center justify-center mb-1.5 transition-colors">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}

              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-1">
                {placeholder || (variant === 'id-photo' ? 'รูปถ่าย 4.5 × 6 ซม.' : 'อัปโหลดรูปภาพ')}
              </p>
              <p className="text-[10px] text-slate-400">
                ลากวาง หรือเลือกวิธีด้านล่าง
              </p>
            </div>

            {/* Pro Action Buttons Bar (Sleek, Compact, No Wrapping Overflow) */}
            {!disabled && (
              <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-1.5">
                {allowWebcam && (
                  <button
                    type="button"
                    onClick={() => setIsWebcamOpen(true)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50 text-[11px] font-semibold transition shadow-xs"
                    title="ถ่ายภาพด้วย Webcam"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>ถ่ายรูป</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-semibold transition shadow-xs shadow-primary-500/20"
                  title="เลือกไฟล์จากเครื่อง"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>เลือกไฟล์</span>
                </button>

                {allowMediaPicker && (
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] transition"
                    title="เลือกจากคลังสื่อ"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Hidden Native File Input */}
        <input
          ref={fileInputRef}
          id={id}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileInputChange}
          disabled={disabled || isUploading}
          className="hidden"
          aria-label={label || 'อัปโหลดรูปภาพ'}
        />
      </div>

      {/* Helper / Error Text */}
      {error ? (
        <p className="text-xs text-rose-500">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400 text-center">{helperText}</p>
      ) : null}

      {/* Studio Webcam Modal */}
      <WebcamCaptureModal
        isOpen={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onCapture={handleWebcamCapture}
        variant={variant}
        title={label ? `ถ่ายภาพสำหรับ: ${label}` : undefined}
      />

      {/* Media Picker Modal */}
      {isMediaPickerOpen && (
        <MediaPickerModal
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={handleMediaPickerSelect}
          filterCategory="image"
          title={`เลือกรูปภาพสำหรับ ${label || 'ระบบ'}`}
        />
      )}
    </div>
  );
}
