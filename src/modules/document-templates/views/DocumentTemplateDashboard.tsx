'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Button, Badge, Input, Select } from '@/components/ui';
import toast from 'react-hot-toast';
import FileUpload from '@/modules/upload/components/FileUpload';

interface Category {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  _count?: {
    templates: number;
  };
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

  // Category Management Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catSubmitting, setCatSubmitting] = useState(false);

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

  const resetCatForm = () => {
    setEditingCatId(null);
    setCatName('');
    setCatCode('');
    setCatDescription('');
  };

  const handleOpenCatModal = () => {
    resetCatForm();
    setIsCatModalOpen(true);
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatCode(cat.code);
    setCatDescription(cat.description || '');
  };

  const handleSaveCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = catName.trim();
    const trimmedCode = catCode.trim().toUpperCase();
    if (!trimmedName || !trimmedCode) {
      return toast.error('กรุณากรอกชื่อและรหัสหมวดหมู่ให้ครบถ้วน');
    }

    setCatSubmitting(true);
    try {
      const isEdit = !!editingCatId;
      const url = isEdit
        ? `/api/modules/document-templates/categories/${editingCatId}`
        : '/api/modules/document-templates/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          code: trimmedCode,
          description: catDescription.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEdit ? 'แก้ไขหมวดหมู่สำเร็จ' : 'เพิ่มหมวดหมู่สำเร็จ');
        resetCatForm();
        fetchData();
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาดในการบันทึกหมวดหมู่');
      }
    } catch (error) {
      toast.error('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
    } finally {
      setCatSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    const count = cat._count?.templates ?? 0;
    if (count > 0) {
      return toast.error(`ไม่สามารถลบหมวดหมู่นี้ได้ เนื่องจากมีแม่แบบเอกสาร ${count} รายการใช้งานอยู่`);
    }

    if (!confirm(`ยืนยันการลบหมวดหมู่ "${cat.name}" (${cat.code})?`)) return;

    try {
      const res = await fetch(`/api/modules/document-templates/categories/${cat.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('ลบหมวดหมู่สำเร็จ');
        if (selectedCategory === cat.id) {
          setSelectedCategory('all');
        }
        if (editingCatId === cat.id) {
          resetCatForm();
        }
        fetchData();
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาดในการลบหมวดหมู่');
      }
    } catch (error) {
      toast.error('ลบหมวดหมู่ไม่สำเร็จ');
    }
  };

  const handleSeedDefaultCategories = async () => {
    if (!confirm('ต้องการนำเข้าหรือกู้คืนหมวดหมู่มาตรฐาน 24 สายงาน ทบ. (รหัส 100 - 581) เข้าสู่ระบบใช่หรือไม่? (หมวดหมู่ที่มีอยู่แล้วจะไม่สูญหาย)')) return;
    setCatSubmitting(true);
    try {
      const res = await fetch('/api/modules/document-templates/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed_defaults' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'นำเข้าหมวดหมู่มาตรฐาน 24 สายงานสำเร็จ');
        fetchData();
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาดในการนำเข้า');
      }
    } catch (error) {
      toast.error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setCatSubmitting(false);
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
          <Button variant="outline" onClick={handleOpenCatModal}>
            <i className="fa-solid fa-folder-tree mr-2 text-primary-500" /> จัดการหมวดหมู่
          </Button>
          <Button variant="primary" onClick={() => { setEditTemplate({ isActive: true }); setIsModalOpen(true); }}>
            <i className="fa-solid fa-file-circle-plus mr-2" /> เพิ่มแม่แบบใหม่
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">หมวดหมู่:</label>
          <Select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-64"
          >
            <option value="all">ดูทุกหมวดหมู่ ({templates.length})</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c._count?.templates ?? 0})
              </option>
            ))}
          </Select>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleOpenCatModal}
          className="text-xs flex items-center gap-1.5"
          title="จัดการ เพิ่ม แก้ไข ลบหมวดหมู่"
        >
          <i className="fa-solid fa-pen-to-square text-primary-500" /> จัดการหมวดหมู่
        </Button>
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
                  <label className="block text-sm font-bold mb-1 text-rose-600"><i className="fa-solid fa-file-pdf mr-2" /> ไฟล์ PDF (ทาบข้อความพิกัด)</label>
                  <p className="text-[11px] text-slate-500 mb-2">จำเป็นสำหรับการเรนเดอร์หน้าเอกสารและลากวางแท็กพิกัด X, Y</p>
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
                  <label className="block text-sm font-bold mb-1 text-blue-600"><i className="fa-solid fa-file-word mr-2" /> ไฟล์ Word (.docx แทนที่แท็กอัตโนมัติ)</label>
                  <p className="text-[11px] text-slate-500 mb-2">ระบบจะแทนที่แท็กตัวแปร เช่น {"{fullName}"}, {"{reason}"} ในไฟล์ Word ให้อัตโนมัติ</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
                  <i className="fa-solid fa-folder-tree text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">จัดการหมวดหมู่แม่แบบเอกสาร</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">สร้าง แก้ไข หรือลบหมวดหมู่สำหรับจัดระเบียบแม่แบบในระบบ</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => { setIsCatModalOpen(false); resetCatForm(); }}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                title="ปิดหน้าต่าง"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Form Section */}
              <div className={`p-5 rounded-2xl border transition-all ${
                editingCatId 
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60' 
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <i className={`fa-solid ${editingCatId ? 'fa-pen-to-square text-amber-500' : 'fa-plus text-primary-500'}`} />
                    {editingCatId ? 'แก้ไขข้อมูลหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
                  </h4>
                  {editingCatId && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={resetCatForm}
                      className="text-xs py-1 px-2.5 h-auto text-slate-500"
                    >
                      <i className="fa-solid fa-arrow-rotate-left mr-1" /> ยกเลิกการแก้ไข
                    </Button>
                  )}
                </div>

                <form onSubmit={handleSaveCategory} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        ชื่อหมวดหมู่ <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        placeholder="เช่น หมวดใบลา, หมวดคำร้องทั่วไป"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        รหัสหมวดหมู่ (Code) <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        value={catCode}
                        onChange={(e) => setCatCode(e.target.value.toUpperCase())}
                        placeholder="เช่น LEAVES, GENERAL"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      คำอธิบาย (ไม่บังคับ)
                    </label>
                    <Input
                      value={catDescription}
                      onChange={(e) => setCatDescription(e.target.value)}
                      placeholder="เช่น รวมแบบฟอร์มการลาทุกประเภทของข้าราชการและลูกจ้าง"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button 
                      type="submit" 
                      variant={editingCatId ? 'candy' : 'primary'}
                      size="sm"
                      disabled={catSubmitting}
                      className="flex items-center gap-2"
                    >
                      <i className={`fa-solid ${catSubmitting ? 'fa-spinner fa-spin' : editingCatId ? 'fa-check' : 'fa-plus'}`} />
                      {editingCatId ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Categories Table/List */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <i className="fa-solid fa-list text-slate-400" />
                    รายการหมวดหมู่ทั้งหมด ({categories.length})
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSeedDefaultCategories}
                    disabled={catSubmitting}
                    className="text-xs h-8 px-3 flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/50 hover:bg-emerald-100 dark:bg-emerald-950/30"
                    title="นำเข้าหรือกู้คืนหมวดหมู่สายงาน ทบ. ทั้ง 24 สายงาน (100 - 581)"
                  >
                    <i className="fa-solid fa-cloud-arrow-down text-emerald-600 dark:text-emerald-400" />
                    <span>นำเข้า/กู้คืน 24 สายงาน ทบ.</span>
                  </Button>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">รหัส</th>
                        <th className="px-4 py-3">ชื่อหมวดหมู่</th>
                        <th className="px-4 py-3 text-center">จำนวนแม่แบบ</th>
                        <th className="px-4 py-3 text-right">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {categories.map((cat) => {
                        const isCurrentlyEditing = editingCatId === cat.id;
                        const templateCount = cat._count?.templates ?? 0;
                        return (
                          <tr 
                            key={cat.id} 
                            className={`transition-colors ${
                              isCurrentlyEditing 
                                ? 'bg-amber-50/60 dark:bg-amber-950/30 font-medium' 
                                : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
                            }`}
                          >
                            <td className="px-4 py-3">
                              <Badge variant="primary" className="font-mono text-xs">
                                {cat.code}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-800 dark:text-white">
                                {cat.name}
                              </div>
                              {cat.description && (
                                <div className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-xs">
                                  {cat.description}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                templateCount > 0 
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {templateCount} รายการ
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditCategory(cat)}
                                  className="h-8 px-2.5 text-xs flex items-center gap-1"
                                  title="แก้ไขหมวดหมู่"
                                >
                                  <i className="fa-solid fa-pen text-amber-500" />
                                  <span>แก้ไข</span>
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeleteCategory(cat)}
                                  disabled={templateCount > 0}
                                  className="h-8 px-2.5 text-xs flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                                  title={templateCount > 0 ? `ไม่สามารถลบได้เนื่องจากมีแม่แบบ ${templateCount} รายการ` : 'ลบหมวดหมู่'}
                                >
                                  <i className="fa-solid fa-trash" />
                                  <span>ลบ</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {categories.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                            ยังไม่มีหมวดหมู่ในระบบ
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end">
              <Button variant="outline" onClick={() => { setIsCatModalOpen(false); resetCatForm(); }}>
                ปิดหน้าต่าง
              </Button>
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
