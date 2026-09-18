'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Button, Badge, Input, Select } from '@/components/ui';
import toast from 'react-hot-toast';
import FileUpload from '@/modules/upload/components/FileUpload';

interface Category {
  id: string;
  name: string;
  code: string;
}

interface Template {
  id: string;
  categoryId: string;
  name: string;
  code: string;
  pdfUrl?: string;
  docxUrl?: string;
  isActive: boolean;
  mappingJson?: string | null;
  category?: Category;
}

import TemplateCanvasEditor from '../components/TemplateCanvasEditor';

export default function DocumentTemplateDashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Partial<Template>>({});

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');

  // Canvas Tag Editor State
  const [canvasTemplate, setCanvasTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const catRes = await fetch('/api/modules/document-templates/categories');
      const catData = await catRes.json();
      if (catData.success) setCategories(catData.data);

      const tplRes = await fetch('/api/modules/document-templates/templates');
      const tplData = await tplRes.json();
      if (tplData.success) setTemplates(tplData.data);
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลแม่แบบได้');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editTemplate.name || !editTemplate.code || !editTemplate.categoryId) {
      return toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
    }

    try {
      const isEdit = !!editTemplate.id;
      const url = isEdit 
        ? `/api/modules/document-templates/templates/${editTemplate.id}`
        : '/api/modules/document-templates/templates';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTemplate),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('บันทึกแม่แบบสำเร็จ');
        setIsModalOpen(false);
        fetchData();
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบแม่แบบนี้?')) return;
    try {
      const res = await fetch(`/api/modules/document-templates/templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('ลบแม่แบบสำเร็จ');
        fetchData();
      }
    } catch (error) {
      toast.error('ลบไม่สำเร็จ');
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName || !newCatCode) return toast.error('กรุณากรอกข้อมูลหมวดหมู่ให้ครบ');
    try {
      const res = await fetch('/api/modules/document-templates/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName, code: newCatCode }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('เพิ่มหมวดหมู่สำเร็จ');
        setNewCatName('');
        setNewCatCode('');
        fetchData();
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      toast.error('เพิ่มหมวดหมู่ไม่สำเร็จ');
    }
  };

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.categoryId === selectedCategory);

  if (loading) return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">จัดการแม่แบบเอกสารส่วนกลาง</h2>
          <p className="text-slate-500">จัดการไฟล์ PDF และ Word สำหรับเชื่อมโยงกับฟอร์มคำร้องต่างๆ ในระบบ</p>
        </div>
        <div className="flex flex-wrap gap-2.5 items-center">
          <a
            href="/templates/docx/starter_leave_template.docx"
            download="แบบฟอร์มใบลา_ทบ100-006_มีแท็กครบ.docx"
            className="inline-flex items-center px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 rounded-xl text-xs font-medium transition-all shadow-xs"
          >
            <i className="fa-solid fa-file-arrow-down mr-1.5 text-emerald-600 dark:text-emerald-400" />
            ดาวน์โหลดไฟล์ Word ตัวอย่าง (มีแท็กครบ)
          </a>
          <Button variant="outline" onClick={() => setIsCatModalOpen(true)}>
            <i className="fa-solid fa-folder-plus mr-2" /> เพิ่มหมวดหมู่
          </Button>
          <Button variant="primary" onClick={() => { setEditTemplate({ isActive: true }); setIsModalOpen(true); }}>
            <i className="fa-solid fa-file-circle-plus mr-2" /> เพิ่มแม่แบบใหม่
          </Button>
        </div>
      </div>

      <div className="flex space-x-4 mb-4">
        <Select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-64"
        >
          <option value="all">ดูทุกหมวดหมู่</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} variant="recessed" className="overflow-visible border border-slate-200">
            <CardHeader title={template.name} className="bg-slate-50 border-b border-slate-200">
              <Badge variant={template.isActive ? 'success' : 'neutral'}>
                {template.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
              </Badge>
            </CardHeader>
            <div className="p-4 space-y-4">
              <div className="text-sm text-slate-500">
                <div><strong>รหัส:</strong> {template.code}</div>
                <div><strong>หมวดหมู่:</strong> {template.category?.name || '-'}</div>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <i className={`fa-solid fa-file-pdf w-5 text-center ${template.pdfUrl ? 'text-rose-500' : 'text-slate-300'}`} />
                <span className={template.pdfUrl ? 'text-slate-700' : 'text-slate-400'}>
                  {template.pdfUrl ? 'มีแม่แบบ PDF' : 'ไม่มี PDF'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <i className={`fa-solid fa-file-word w-5 text-center ${template.docxUrl ? 'text-blue-500' : 'text-slate-300'}`} />
                <span className={template.docxUrl ? 'text-slate-700' : 'text-slate-400'}>
                  {template.docxUrl ? 'มีแม่แบบ Word' : 'ไม่มี Word'}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-end gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setCanvasTemplate(template)}
                  title="เปิดหน้าจอ Visual Canvas สำหรับลากวางตำแหน่งแท็กข้อความ"
                  className="text-xs flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-tags text-indigo-500" /> วางแท็กพิกัด
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setEditTemplate(template); setIsModalOpen(true); }}>
                  <i className="fa-solid fa-pen" /> แก้ไข
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(template.id)}>
                  <i className="fa-solid fa-trash" /> ลบ
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {filteredTemplates.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 border-dashed">
            ไม่มีแม่แบบเอกสารในหมวดหมู่นี้
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <h3 className="text-xl font-bold mb-4">{editTemplate.id ? 'แก้ไขแม่แบบ' : 'เพิ่มแม่แบบใหม่'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">หมวดหมู่</label>
                <Select
                  value={editTemplate.categoryId || ''}
                  onChange={(e) => setEditTemplate({ ...editTemplate, categoryId: e.target.value })}
                  className="w-full"
                >
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ชื่อแม่แบบ</label>
                  <Input 
                    value={editTemplate.name || ''} 
                    onChange={(e) => setEditTemplate({ ...editTemplate, name: e.target.value })}
                    placeholder="เช่น ลาป่วย (แบบ ๔)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">รหัสอ้างอิง (Code)</label>
                  <Input 
                    value={editTemplate.code || ''} 
                    onChange={(e) => setEditTemplate({ ...editTemplate, code: e.target.value })}
                    placeholder="เช่น LEAVE_SICK"
                  />
                  <p className="text-xs text-slate-400 mt-1">ใช้สำหรับอ้างอิงในโค้ด (ห้ามซ้ำ)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <label className="block text-sm font-bold mb-2 text-rose-600"><i className="fa-solid fa-file-pdf mr-2" /> ไฟล์ PDF (ทาบข้อความ)</label>
                  <FileUpload
                    onChange={(files) => {
                      if (files && files.length > 0) {
                        setEditTemplate({ ...editTemplate, pdfUrl: files[files.length - 1].url });
                      }
                    }}
                    acceptedTypes=".pdf,application/pdf"
                    maxSizeBytes={10 * 1024 * 1024}
                    maxFiles={1}
                  />
                  {editTemplate.pdfUrl && (
                    <div className="mt-2 text-xs text-emerald-600 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 break-all">
                      <div className="flex items-center min-w-0 pr-2">
                        <i className="fa-solid fa-check-circle mr-2 shrink-0 text-emerald-500" />
                        <span className="truncate">อัปโหลดแล้ว: {editTemplate.pdfUrl.split('/').pop()}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditTemplate({ ...editTemplate, pdfUrl: '' })}
                        className="text-rose-500 hover:text-rose-700 dark:text-rose-400 p-1 text-xs shrink-0 flex items-center gap-1 font-medium hover:underline"
                        title="ลบเพื่อเปลี่ยนไฟล์ใหม่"
                      >
                        <i className="fa-solid fa-xmark" />
                        <span>เปลี่ยนไฟล์</span>
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-blue-600"><i className="fa-solid fa-file-word mr-2" /> ไฟล์ Word (แก้ Manual)</label>
                  <FileUpload
                    onChange={(files) => {
                      if (files && files.length > 0) {
                        setEditTemplate({ ...editTemplate, docxUrl: files[files.length - 1].url });
                      }
                    }}
                    acceptedTypes=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    maxSizeBytes={10 * 1024 * 1024}
                    maxFiles={1}
                  />
                  {editTemplate.docxUrl && (
                    <div className="mt-2 text-xs text-emerald-600 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 break-all">
                      <div className="flex items-center min-w-0 pr-2">
                        <i className="fa-solid fa-check-circle mr-2 shrink-0 text-emerald-500" />
                        <span className="truncate">อัปโหลดแล้ว: {editTemplate.docxUrl.split('/').pop()}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditTemplate({ ...editTemplate, docxUrl: '' })}
                        className="text-rose-500 hover:text-rose-700 dark:text-rose-400 p-1 text-xs shrink-0 flex items-center gap-1 font-medium hover:underline"
                        title="ลบเพื่อเปลี่ยนไฟล์ใหม่"
                      >
                        <i className="fa-solid fa-xmark" />
                        <span>เปลี่ยนไฟล์</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>ยกเลิก</Button>
              <Button variant="primary" onClick={handleSave}>บันทึกข้อมูล</Button>
            </div>
          </div>
        </div>
      )}

      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold mb-4">เพิ่มหมวดหมู่ใหม่</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ชื่อหมวดหมู่ (Name)</label>
                <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="เช่น หมวดใบลา" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">รหัสหมวดหมู่ (Code)</label>
                <Input value={newCatCode} onChange={e => setNewCatCode(e.target.value)} placeholder="เช่น LEAVES" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <Button variant="outline" onClick={() => setIsCatModalOpen(false)}>ปิด</Button>
              <Button variant="primary" onClick={handleAddCategory}>เพิ่ม</Button>
            </div>
          </div>
        </div>
      )}
      {/* Visual Canvas Tag Editor Modal */}
      {canvasTemplate && (
        <TemplateCanvasEditor
          templateId={canvasTemplate.id}
          templateName={canvasTemplate.name}
          templateCode={canvasTemplate.code}
          pdfUrl={canvasTemplate.pdfUrl}
          docxUrl={canvasTemplate.docxUrl}
          initialMappingJson={canvasTemplate.mappingJson}
          onClose={() => setCanvasTemplate(null)}
          onSaveSuccess={() => {
            fetchData();
            setCanvasTemplate(null);
          }}
        />
      )}
    </div>
  );
}
