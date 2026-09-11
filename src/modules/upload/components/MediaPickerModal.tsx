'use client';

import React from 'react';
import { Card, Button } from '@/components/ui';
import MediaGallery from './MediaGallery';
import { X, FolderOpen } from 'lucide-react';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: { url: string; filename: string; mimetype: string; size?: number }) => void;
  title?: string;
  filterCategory?: 'all' | 'image' | 'audio' | 'pdf' | 'document' | 'video';
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'เลือกไฟล์จากคลังสื่อ (Media Picker)',
  filterCategory = 'all',
}: MediaPickerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-prompt">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-400">
                คลิกเลือกไฟล์ที่ต้องการ หรืออัปโหลดไฟล์ใหม่ขึ้นระบบ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <MediaGallery
            isPickerMode={true}
            filterCategory={filterCategory}
            onSelectFile={(file) => {
              onSelect(file);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
