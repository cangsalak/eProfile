'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Input, ImageUpload } from '@/components/ui';
import toast from 'react-hot-toast';
import { uploadFileToServer } from '@/modules/upload/lib/client-upload';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'เขียนเนื้อหาข่าวสารหรือบทความของคุณที่นี่...',
  minHeight = '280px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'source' | 'preview'>('editor');
  const [sourceCode, setSourceCode] = useState(value);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const savedRangeRef = useRef<Range | null>(null);

  // Sync value to contentEditable when not focused or on initial load
  useEffect(() => {
    if (editorRef.current && viewMode === 'editor') {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setSourceCode(value);
  }, [value, viewMode]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      setSourceCode(html);
    }
  };

  const saveCurrentSelection = () => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0);
    }
  };

  const restoreCurrentSelection = () => {
    if (typeof window === 'undefined') return;
    if (editorRef.current) {
      editorRef.current.focus();
      if (savedRangeRef.current) {
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(savedRangeRef.current);
        }
      }
    }
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (viewMode !== 'editor') return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleOpenLinkModal = () => {
    saveCurrentSelection();
    setLinkUrl('');
    setShowLinkModal(true);
  };

  const handleOpenImageModal = () => {
    saveCurrentSelection();
    setImageUrl('');
    setShowImageModal(true);
  };

  const handleInsertLink = () => {
    if (linkUrl.trim()) {
      restoreCurrentSelection();
      executeCommand('createLink', linkUrl.trim());
      setLinkUrl('');
      setShowLinkModal(false);
    }
  };

  const handleInsertImage = () => {
    if (imageUrl.trim()) {
      restoreCurrentSelection();
      executeCommand('insertImage', imageUrl.trim());
      setImageUrl('');
      setShowImageModal(false);
      toast.success('แทรกรูปภาพในบทความเรียบร้อย');
    } else {
      toast.error('กรุณาเลือกหรืออัปโหลดรูปภาพก่อน');
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          const toastId = toast.loading('กำลังอัปโหลดรูปภาพที่วาง...');
          try {
            const res = await uploadFileToServer(file, { module: 'news', folder: 'posts' });
            if (res.success && res.data?.url) {
              executeCommand('insertImage', res.data.url);
              toast.success('แทรกรูปภาพเรียบร้อย', { id: toastId });
            } else {
              toast.error('อัปโหลดภาพไม่สำเร็จ', { id: toastId });
            }
          } catch {
            toast.error('เกิดข้อผิดพลาดในการอัปโหลดภาพ', { id: toastId });
          }
          return;
        }
      }
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadFileToServer(file, { module: 'news', folder: 'posts' });
      if (res.success && res.data?.url) {
        executeCommand('insertImage', res.data.url);
        toast.success('อัปโหลดและแทรกรูปภาพเรียบร้อย');
        setShowImageModal(false);
        return;
      }
    } catch {
      // Fallback to FileReader base64
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      executeCommand('insertImage', base64);
      setShowImageModal(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSourceCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setSourceCode(newHtml);
    onChange(newHtml);
  };

  // Word and Char Count
  const textContent = value.replace(/<[^>]*>/g, '').trim();
  const charCount = textContent.length;
  const wordCount = textContent ? textContent.split(/\s+/).length : 0;

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all font-prompt">
      
      {/* Editor Toolbar */}
      <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex flex-wrap items-center gap-1">
        
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-700 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => executeCommand('undo')}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs transition-colors"
            title="เลิกทำ (Undo)"
          >
            <i className="fa-solid fa-rotate-left"></i>
          </button>
          <button
            type="button"
            onClick={() => executeCommand('redo')}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs transition-colors"
            title="ทำซ้ำ (Redo)"
          >
            <i className="fa-solid fa-rotate-right"></i>
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-700 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h1>')}
            className="px-2.5 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
            title="หัวข้อหลัก H1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h2>')}
            className="px-2.5 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
            title="หัวข้อย่อย H2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<p>')}
            className="px-2.5 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
            title="ข้อความปกติ (Paragraph)"
          >
            P
          </button>
        </div>

        {/* Text Style: Bold, Italic, Underline, Strike */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-700 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
            title="ตัวหนา (Bold)"
          >
            <i className="fa-solid fa-bold"></i>
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 italic text-xs transition-colors"
            title="ตัวเอียง (Italic)"
          >
            <i className="fa-solid fa-italic"></i>
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
            title="ขีดเส้นใต้ (Underline)"
          >
            <i className="fa-solid fa-underline"></i>
          </button>
          <button
            type="button"
            onClick={() => executeCommand('strikeThrough')}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
            title="ขีดฆ่า (Strikethrough)"
          >
            <i className="fa-solid fa-strikethrough"></i>
          </button>
        </div>

        {/* Lists & Quote */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-700 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
            title="รายการแบบจุด (Bullet List)"
          >
            <i className="fa-solid fa-list-ul"></i>
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
            title="รายการแบบตัวเลข (Numbered List)"
          >
            <i className="fa-solid fa-list-ol"></i>
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<blockquote>')}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
            title="บล็อกคำพูด (Blockquote)"
          >
            <i className="fa-solid fa-quote-left"></i>
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertHorizontalRule')}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
            title="เส้นคั่นบรรทัด (Horizontal Line)"
          >
            <i className="fa-solid fa-minus"></i>
          </button>
        </div>

        {/* Alignments */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-700 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => executeCommand('justifyLeft')}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
            title="ชิดซ้าย"
          >
            <i className="fa-solid fa-align-left"></i>
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyCenter')}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
            title="กึ่งกลาง"
          >
            <i className="fa-solid fa-align-center"></i>
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyRight')}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
            title="ชิดขวา"
          >
            <i className="fa-solid fa-align-right"></i>
          </button>
        </div>

        {/* Media: Link & Image */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-700 pr-1.5 mr-1">
          <button
            type="button"
            onClick={handleOpenLinkModal}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
            title="แทรกลิงก์ (Link)"
          >
            <i className="fa-solid fa-link"></i>
          </button>
          <button
            type="button"
            onClick={handleOpenImageModal}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
            title="แทรกรูปภาพ (Image)"
          >
            <i className="fa-regular fa-image"></i>
          </button>
          <button
            type="button"
            onClick={() => executeCommand('removeFormat')}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
            title="ล้างรูปแบบข้อความ (Clear Formatting)"
          >
            <i className="fa-solid fa-eraser"></i>
          </button>
        </div>

        {/* View Mode Toggle: Visual / Source / Preview */}
        <div className="ml-auto flex items-center gap-1 bg-slate-200/70 dark:bg-slate-900/60 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              viewMode === 'editor'
                ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-pen mr-1 text-[10px]"></i> Editor
          </button>
          <button
            type="button"
            onClick={() => setViewMode('source')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              viewMode === 'source'
                ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-code mr-1 text-[10px]"></i> HTML
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              viewMode === 'preview'
                ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <i className="fa-regular fa-eye mr-1 text-[10px]"></i> ตัวอย่าง
          </button>
        </div>

      </div>

      {/* Editor Body */}
      <div className="relative">
        
        {/* Visual Mode */}
        {viewMode === 'editor' && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onPaste={handlePaste}
            style={{ minHeight }}
            data-placeholder={placeholder}
            className="p-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none overflow-y-auto leading-relaxed prose prose-sm dark:prose-invert max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none"
          />
        )}

        {/* HTML Source Code Mode */}
        {viewMode === 'source' && (
          <textarea
            value={sourceCode}
            onChange={handleSourceCodeChange}
            style={{ minHeight }}
            className="w-full p-4 font-mono text-xs text-slate-900 dark:text-emerald-400 bg-slate-950/5 dark:bg-slate-950 outline-none resize-y leading-relaxed"
            placeholder="<html>...</html>"
          />
        )}

        {/* Live Preview Mode */}
        {viewMode === 'preview' && (
          <div
            style={{ minHeight }}
            className="p-5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-900/30 overflow-y-auto leading-relaxed prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: value || '<p class="text-slate-400">ไม่มีเนื้อหาตัวอย่าง</p>' }}
          />
        )}

      </div>

      {/* Footer Info / Word count */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-[11px] text-slate-400">
        <span>Rich Text Editor v1.2</span>
        <div className="flex items-center gap-3">
          <span>คำ: {wordCount}</span>
          <span>•</span>
          <span>ตัวอักษร: {charCount}</span>
        </div>
      </div>

      {/* Link Modal Dialog */}
      <Modal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        title="แทรกลิงก์เว็บไซต์"
        icon="fa-solid fa-link"
        size="sm"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowLinkModal(false)}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleInsertLink}
            >
              แทรกลิงก์
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      </Modal>

      {/* Image Modal Dialog */}
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title="แทรกรูปภาพในบทความ"
        icon="fa-regular fa-image"
        size="lg"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowImageModal(false)}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!imageUrl.trim()}
              onClick={handleInsertImage}
              icon="fa-solid fa-plus"
            >
              แทรกรูปภาพ
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <ImageUpload
            label="อัปโหลดหรือเลือกรูปภาพ"
            value={imageUrl || ''}
            onChange={(url) => setImageUrl(url)}
            onRemove={() => setImageUrl('')}
            variant="landscape"
            module="news"
            folder="posts"
            allowMediaPicker={true}
            allowWebcam={false}
            helperText="คลิกเพื่อเลือกไฟล์ หรือลากและวางภาพ (JPG, PNG, WebP) หรือกดเลือกจากคลังสื่อ"
          />

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400 whitespace-nowrap">
              <i className="fa-solid fa-link mr-1"></i> หรือระบุ URL รูปภาพ:
            </span>
            <input
              type="text"
              value={imageUrl || ''}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... หรือ /uploads/..."
              className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-2xs"
            />
          </div>
        </div>
      </Modal>

    </div>
  );
}
