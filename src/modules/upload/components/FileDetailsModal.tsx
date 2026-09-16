'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal, Card, Button, Badge } from '@/components/ui';
import ConfirmModal from '@/components/common/ConfirmModal';
import { formatBytes, getCategoryBadgeColor } from '../lib/file-utils';
import {
  X,
  Copy,
  Download,
  Trash2,
  ExternalLink,
  Calendar,
  User,
  HardDrive,
  FileText,
  Music,
  Film,
  Image as ImageIcon,
  Check,
  Code,
} from 'lucide-react';

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

  const categoryBadge = getCategoryBadgeColor(file.category || 'other');

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
          <span className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${categoryBadge.bg} ${categoryBadge.text}`}>
              {categoryBadge.label}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {formatBytes(file.size)}
            </span>
          </span>
        }
        icon={
          file.category === 'image'
            ? 'fa-solid fa-image'
            : file.category === 'audio'
            ? 'fa-solid fa-music'
            : file.category === 'video'
            ? 'fa-solid fa-film'
            : 'fa-solid fa-file-lines'
        }
        size="lg"
        className="p-0 overflow-hidden"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="danger"
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="gap-2"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              <span>ลบไฟล์</span>
            </Button>

            <div className="flex items-center gap-2">
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                download={file.filename}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <Download className="h-4 w-4" />
                <span>ดาวน์โหลด</span>
              </a>

              {isPickerMode && onSelect && (
                <Button
                  variant="primary"
                  onClick={() => onSelect(file)}
                  className="gap-2 shadow-sm"
                >
                  <Check className="h-4 w-4" />
                  <span>เลือกไฟล์นี้</span>
                </Button>
              )}
            </div>
          </div>
        }
      >
        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 max-h-[70vh]">
            {/* Media Preview Box */}
            <div className="rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center overflow-hidden min-h-[220px] max-h-[380px] p-2">
              {file.category === 'image' && (
                <img
                  src={file.url}
                  alt={file.filename}
                  className="max-h-[360px] w-auto max-w-full object-contain rounded-xl shadow-sm"
                />
              )}

              {file.category === 'audio' && (
                <div className="w-full max-w-md p-6 text-center space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-md animate-pulse">
                    <Music className="h-8 w-8" />
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
                <video controls className="max-h-[360px] w-full rounded-xl" src={file.url}>
                  Your browser does not support the video element.
                </video>
              )}

              {file.category === 'pdf' && (
                <div className="p-8 text-center space-y-3">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shadow-md">
                    <FileText className="h-8 w-8" />
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>เปิดอ่านไฟล์ PDF</span>
                  </a>
                </div>
              )}

              {(file.category === 'document' || file.category === 'archive' || file.category === 'other') && (
                <div className="p-8 text-center space-y-3">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-md">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {file.filename}
                  </h4>
                  <a
                    href={file.url}
                    download={file.filename}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition"
                  >
                    <Download className="h-4 w-4" />
                    <span>ดาวน์โหลดไฟล์</span>
                  </a>
                </div>
              )}
            </div>

            {/* Quick Copy Snippets */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                คัดลอกลิงก์และโค้ดนำไปใช้
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => copyToClipboard(file.url, 'url')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:border-primary-300 text-xs font-medium text-slate-700 dark:text-slate-200 transition"
                >
                  <span className="flex items-center gap-2">
                    <Copy className="h-4 w-4 text-primary-500" />
                    <span>URL ลิงก์ตรง</span>
                  </span>
                  {copiedType === 'url' ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : null}
                </button>

                <button
                  onClick={() => copyToClipboard(getMarkdownCode(), 'markdown')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:border-primary-300 text-xs font-medium text-slate-700 dark:text-slate-200 transition"
                >
                  <span className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-purple-500" />
                    <span>Markdown Code</span>
                  </span>
                  {copiedType === 'markdown' ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : null}
                </button>

                <button
                  onClick={() => copyToClipboard(getHtmlCode(), 'html')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:border-primary-300 text-xs font-medium text-slate-700 dark:text-slate-200 transition"
                >
                  <span className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-amber-500" />
                    <span>HTML Embed</span>
                  </span>
                  {copiedType === 'html' ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : null}
                </button>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">ขนาดไฟล์</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatBytes(file.size)}
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
                  {file.uploadedBy ? `${file.uploadedBy.firstName} ${file.uploadedBy.lastName}` : 'System'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">วันที่อัปโหลด</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(file.createdAt).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
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
        message={`คุณต้องการลบไฟล์ "${file.filename}" ใช่หรือไม่? ไฟล์จะถูกลบออกจาก Cloud Storage และฐานข้อมูลอย่างถาวร`}
        confirmText="ยืนยันการลบ"
        cancelText="ยกเลิก"
        isDestructive={true}
      />
    </>
  );
}
