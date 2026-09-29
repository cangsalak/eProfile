'use client';

import React from 'react';
import { Modal } from '@/components/ui';
import MediaGallery from './MediaGallery';

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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="คลิกเลือกไฟล์ที่ต้องการ หรืออัปโหลดไฟล์ใหม่ขึ้นระบบ"
      icon="fa-solid fa-folder-open"
      size="full"
      className="p-0 overflow-hidden"
    >
      <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh]">
        <MediaGallery
          isPickerMode={true}
          filterCategory={filterCategory}
          onSelectFile={(file) => {
            onSelect(file);
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}
