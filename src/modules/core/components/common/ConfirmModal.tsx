'use client';

import React from 'react';
import { Modal, Button } from '@/components/ui';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
  icon?: string;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'ตกลง',
  cancelText = 'ยกเลิก',
  onConfirm,
  onCancel,
  isDestructive = false,
  icon,
}: ConfirmModalProps) {
  const defaultIcon = isDestructive
    ? 'fa-solid fa-triangle-exclamation text-rose-500'
    : 'fa-solid fa-circle-question text-primary-500';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      icon={icon || defaultIcon}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl text-xs sm:text-sm"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            className="rounded-xl text-xs sm:text-sm font-bold shadow-xs"
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="py-2">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-prompt">
          {message}
        </p>
      </div>
    </Modal>
  );
}
