'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal, Button, Badge } from '@/components/ui';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatBytes, getCategoryBadgeVariant, getCategoryIcon, getExtensionModuleMeta, formatThaiDate } from '../lib/file-utils';

interface FileDetailsModalProps {
  file: any | null;
  onClose: () => void;
  onDeleteSuccess?: (deletedId: string) => void;
  onSelect?: (file: any) => void;
  isPickerMode?: boolean;
}

export default function FileDetailsModal({
  file,
  onClose,
  onDeleteSuccess,
  onSelect,
  isPickerMode = false,
}: FileDetailsModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!file) return null;

  const badgeVariant = getCategoryBadgeVariant(file.category || 'other');
  const iconClass = getCategoryIcon(file.category || 'other');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast.success('คัดลอกลงคลิปบอร์ดแล้ว');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/modules/upload/${file.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'ลบไฟล์เรียบร้อยแล้ว');
        setIsDeleteConfirmOpen(false);
        onClose();
        if (onDeleteSuccess) onDeleteSuccess(file.id);
      } else {
        toast.error(data.error || 'ไม่สามารถลบไฟล์ได้');
      }
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsDeleting(false);
    }
  };

  const getMarkdownCode = () => {
    if (file.category === 'image') {
      return `![${file.filename}](${file.url})`;
    }
    return `[${file.filename}](${file.url})`;
  };

  const getHtmlCode = () => {
    if (file.category === 'image') {
      return `<img src="${file.url}" alt="${file.filename}" class="rounded-xl shadow-md max-w-full" />`;
    }
    if (file.category === 'audio') {
      return `<audio controls src="${file.url}"></audio>`;
    }
    if (file.category === 'video') {
      return `<video controls src="${file.url}" class="rounded-xl w-full"></video>`;
    }
    return `<a href="${file.url}" target="_blank" rel="noopener noreferrer">${file.filename}</a>`;
  };

  return (
    <>
      <Modal
        isOpen={!!file}
        onClose={onClose}
        title={file.filename}
        subtitle={
          <span className="flex items-center gap-2 mt-1">
            <Badge variant={badgeVariant} size="xs">
              {file.category}
            </Badge>
            <span className="text-xs text-slate-400 font-mono">
              {formatBytes(file.size || 0)}
            </span>
          </span>
        }
        icon={iconClass}
        size="lg"
        className="p-0 overflow-hidden"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="danger"
              size="sm"
              icon="fa-solid fa-trash-can"
              onClick={() => setIsDeleteConfirmOpen(true)}
              disabled={isDeleting}
            >
              ลบไฟล์
            </Button>

            <div className="flex items-center gap-2">
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                download={file.filename}
                className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-xs"
              >
                <i className="fa-solid fa-download text-xs"></i>
                <span>ดาวน์โหลด</span>
              </a>

              {isPickerMode && onSelect && (
                <Button
                  variant="primary"
                  size="sm"
                  icon="fa-solid fa-check"
                  onClick={() => onSelect(file)}
                  className="shadow-sm font-bold"
                >
                  เลือกไฟล์นี้
                </Button>
              )}
            </div>
          </div>
        }
      >
        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 max-h-[70vh] font-prompt">
          {/* Media Preview Box */}
          <div className="rounded-[22px] bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center overflow-hidden min-h-[200px] max-h-[380px] p-2">
            {file.category === 'image' && (
              <img
                src={file.url}
                alt={file.filename}
                className="max-h-[360px] w-auto max-w-full object-contain rounded-xl shadow-sm"
              />
            )}

            {file.category === 'audio' && (
              <div className="w-full max-w-md p-6 text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-md">
                  <i className="fa-solid fa-music text-2xl"></i>
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                  {file.filename}
                </p>
                <audio controls className="w-full mt-2" src={file.url}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {file.category === 'video' && (
              <video controls className="max-h-[360px] w-full rounded-xl shadow-sm" src={file.url}>
                Your browser does not support the video element.
              </video>
            )}

            {file.category === 'pdf' && (
              <div className="p-8 text-center space-y-3">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-md">
                  <i className="fa-solid fa-file-pdf text-3xl"></i>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  เอกสาร PDF
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  คลิกปุ่มด้านล่างเพื่อเปิดอ่านเอกสาร PDF ในหน้าต่างใหม่
                </p>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  <span>เปิดอ่านไฟล์ PDF</span>
                </a>
              </div>
            )}

            {(file.category === 'document' || file.category === 'archive' || file.category === 'other') && (
              <div className="p-8 text-center space-y-3">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-md">
                  <i className="fa-solid fa-file-word text-3xl"></i>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {file.filename}
                </h4>
                <a
                  href={file.url}
                  download={file.filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <i className="fa-solid fa-download"></i>
                  <span>ดาวน์โหลดไฟล์</span>
                </a>
              </div>
            )}
          </div>

          {/* Quick Copy Snippets */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <i className="fa-solid fa-copy text-primary-500"></i>
              <span>คัดลอกลิงก์และโค้ดนำไปใช้งาน</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(file.url, 'url')}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-primary-50/60 dark:hover:bg-primary-950/30 hover:border-primary-300 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all"
              >
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-link text-primary-500"></i>
                  <span>URL ลิงก์ตรง</span>
                </span>
                {copiedType === 'url' ? (
                  <i className="fa-solid fa-check text-emerald-500"></i>
                ) : null}
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(getMarkdownCode(), 'markdown')}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-primary-50/60 dark:hover:bg-primary-950/30 hover:border-primary-300 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all"
              >
                <span className="flex items-center gap-2">
                  <i className="fa-brands fa-markdown text-purple-500"></i>
                  <span>Markdown Code</span>
                </span>
                {copiedType === 'markdown' ? (
                  <i className="fa-solid fa-check text-emerald-500"></i>
                ) : null}
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(getHtmlCode(), 'html')}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-primary-50/60 dark:hover:bg-primary-950/30 hover:border-primary-300 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all"
              >
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-code text-amber-500"></i>
                  <span>HTML Embed</span>
                </span>
                {copiedType === 'html' ? (
                  <i className="fa-solid fa-check text-emerald-500"></i>
                ) : null}
              </button>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">ส่วนขยายที่มา</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {(() => {
                  const meta = getExtensionModuleMeta(file.module);
                  return (
                    <Badge variant={meta.badgeVariant} size="xs">
                      <i className={`${meta.icon} mr-1`}></i>
                      {meta.name}
                    </Badge>
                  );
                })()}
              </div>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">โฟลเดอร์จัดเก็บ</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 truncate block font-semibold" title={file.folder || 'general'}>
                📁 {file.module || 'upload'}/{file.folder || 'general'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">ขนาดไฟล์</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatBytes(file.size || 0)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">ประเภท MIME</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 truncate block" title={file.mimetype}>
                {file.mimetype}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">ผู้อัปโหลด</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {file.uploadedBy ? `${file.uploadedBy.firstName || ''} ${file.uploadedBy.lastName || ''}` : 'System'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">วันที่อัปโหลด</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatThaiDate(file.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="ยืนยันการลบไฟล์สื่อ?"
        message={`คุณต้องการลบไฟล์ "${file.filename}" ใช่หรือไม่? ไฟล์จะถูกลบออกจากที่จัดเก็บข้อมูลและฐานข้อมูลอย่างถาวร`}
        confirmText="ยืนยันการลบ"
        cancelText="ยกเลิก"
        isDestructive={true}
      />
    </>
  );
}
