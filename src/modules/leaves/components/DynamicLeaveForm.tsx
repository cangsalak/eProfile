'use client';

import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Button, Badge, DatePicker } from '@/components/ui';
import { parseTemplateToFormFields } from '../lib/dynamicFormParser';
import {
  FileText,
  UserCheck,
  Calendar,
  Layers,
  Sparkles,
  Info,
  CheckCircle,
  Clock,
  HelpCircle,
  X,
  AlertCircle,
  Sliders,
} from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
  code: string;
  description?: string;
  _count?: { templates: number };
}

interface TemplateOption {
  id: string;
  name: string;
  code: string;
  pdfUrl?: string;
  docxUrl?: string;
  mappingJson?: string | null;
  category?: {
    name: string;
    code: string;
  };
}

interface DynamicLeaveFormProps {
  personnelId: string;
  onClose: () => void;
  onSuccess: () => void;
  initialLeaveType?: string;
  editingLeaveId?: string | null;
  initialData?: Record<string, any>;
}

export default function DynamicLeaveForm({
  personnelId,
  onClose,
  onSuccess,
  initialLeaveType = 'ลากิจ',
  editingLeaveId = null,
  initialData,
}: DynamicLeaveFormProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string>('all');
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Personnel details for auto-fill
  const [personnelData, setPersonnelData] = useState<any>(null);

  // Dynamic form field values
  const [formData, setFormData] = useState<Record<string, any>>({
    leaveType: initialData?.leaveType || initialLeaveType,
    writtenAt: initialData?.writtenAt || 'บก.ศฝยว.ทบ.',
    toPerson: initialData?.toPerson || 'ผบ.ศฝยว.ทบ.',
    reason: initialData?.reason || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    totalDays: initialData?.totalDays || 0,
    substitutePerson: initialData?.substitutePerson || '',
    contactAddress: initialData?.contactAddress || '',
    contactTambon: initialData?.contactTambon || '',
    contactAmphoe: initialData?.contactAmphoe || '',
    contactProvince: initialData?.contactProvince || '',
    accumulatedLeaveDays: initialData?.accumulatedLeaveDays ?? 0,
    thisYearLeaveDays: initialData?.thisYearLeaveDays ?? 10,
    totalAvailableDays: (initialData?.accumulatedLeaveDays || 0) + (initialData?.thisYearLeaveDays ?? 10),
    ...initialData,
  });

  // Sync formData when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  // 1. Fetch active categories & templates across all document categories
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoadingTemplates(true);
      try {
        const [catRes, tplRes] = await Promise.all([
          fetch('/api/modules/document-templates/categories'),
          fetch('/api/modules/document-templates/templates'),
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          if (catData.success && Array.isArray(catData.data) && isMounted) {
            setCategories(catData.data);
          }
        }

        if (tplRes.ok) {
          const tplData = await tplRes.json();
          if (tplData.success && Array.isArray(tplData.data) && isMounted) {
            const activeTemplates = tplData.data.filter((t: any) => t.isActive !== false);
            setTemplates(activeTemplates);

            // Auto-select template matching target leaveType or first template
            if (activeTemplates.length > 0) {
              const targetType = initialData?.leaveType || initialLeaveType;
              const matched = activeTemplates.find(
                (t: any) => t.name.includes(targetType) || t.code.includes(targetType)
              );
              const chosen = matched || activeTemplates[0];
              setSelectedTemplateId(chosen.id);
              if (chosen?.category?.code) {
                setSelectedCategoryCode(chosen.category.code);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load templates and categories', err);
      } finally {
        if (isMounted) setLoadingTemplates(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [initialLeaveType, initialData?.leaveType]);

  // 2. Fetch Personnel data for autofill
  useEffect(() => {
    async function fetchPersonnel() {
      try {
        const res = await fetch(`/api/personnel/${personnelId}`);
        if (res.ok) {
          const p = await res.json();
          setPersonnelData(p);
          const fullAddr = p.address || '';
          setFormData((prev) => ({
            ...prev,
            contactAddress: prev.contactAddress || fullAddr,
            writtenAt: prev.writtenAt || p.department || 'บก.ศฝยว.ทบ.',
          }));
        }
      } catch (e) {
        console.error('Failed to fetch personnel info', e);
      }
    }
    if (personnelId) fetchPersonnel();
  }, [personnelId]);

  // Filtered templates based on selected category tab
  const filteredTemplates = useMemo(() => {
    if (selectedCategoryCode === 'all') return templates;
    return templates.filter(
      (t) => t.category?.code?.toUpperCase() === selectedCategoryCode.toUpperCase()
    );
  }, [templates, selectedCategoryCode]);

  // Current selected template object
  const currentTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || null;
  }, [templates, selectedTemplateId]);

  // Parse template tags into form fields (STRICT: only configured tags)
  const parsedForm = useMemo(() => {
    return parseTemplateToFormFields(currentTemplate?.mappingJson);
  }, [currentTemplate?.mappingJson]);

  // Synchronize leaveType with selected template name
  useEffect(() => {
    if (currentTemplate) {
      setFormData((prev) => ({
        ...prev,
        leaveType: currentTemplate.name || prev.leaveType,
      }));
    }
  }, [currentTemplate]);

  // Calculate total days automatically when startDate or endDate change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
        const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setFormData((prev) => ({ ...prev, totalDays: diffDays }));
      }
    }
  }, [formData.startDate, formData.endDate]);

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Submit leave request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check required fields dynamically defined by the template
    for (const field of parsedForm.fields) {
      if (field.required) {
        const val = formData[field.key];
        if (val === undefined || val === null || String(val).trim() === '') {
          toast.error(`กรุณากรอกข้อมูล "${field.label}"`);
          return;
        }
      }
    }

    if (parsedForm.requiresStartDate && parsedForm.requiresEndDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        toast.error('วันที่สิ้นสุดการลาต้องไม่ก่อนวันที่เริ่มลา');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, any> = {
        personnelId,
        leaveType: formData.leaveType || (currentTemplate ? currentTemplate.name : 'ลากิจ'),
        startDate: formData.startDate || new Date().toISOString(),
        endDate: formData.endDate || formData.startDate || new Date().toISOString(),
        reason: formData.reason || '',
        writtenAt: formData.writtenAt || '',
        toPerson: formData.toPerson || '',
        contactAddress: formData.contactAddress || '',
        contactTambon: formData.contactTambon || '',
        contactAmphoe: formData.contactAmphoe || '',
        contactProvince: formData.contactProvince || '',
        substitutePerson: formData.substitutePerson || null,
        accumulatedLeaveDays: formData.accumulatedLeaveDays ? Number(formData.accumulatedLeaveDays) : null,
        thisYearLeaveDays: formData.thisYearLeaveDays ? Number(formData.thisYearLeaveDays) : null,
      };

      const url = editingLeaveId ? `/api/leaves/${editingLeaveId}` : '/api/leaves';
      const method = editingLeaveId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingLeaveId ? 'อัปเดตข้อมูลการลาเรียบร้อยแล้ว' : `ยื่นคำขอ "${payload.leaveType}" เรียบร้อยแล้ว`);
        onSuccess();
        onClose();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || (editingLeaveId ? 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' : 'เกิดข้อผิดพลาดในการส่งคำขอลา'));
      }
    } catch (error) {
      console.error('Submit leave error', error);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasConfiguredFields = parsedForm.fields.length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6 animate-fade-in"
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingLeaveId ? 'แก้ไขข้อมูลแบบฟอร์ม (Dynamic Form)' : 'แบบฟอร์มยื่นเอกสาร (e-Forms Dynamic Form)'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {editingLeaveId 
              ? 'แก้ไขข้อมูลตามช่องกรอกที่กำหนดไว้ในแม่แบบเอกสาร' 
              : 'กรอกข้อมูลตามช่องกรอกที่กำหนดไว้ในแม่แบบเอกสาร รองรับทุกหมวดหมู่งานเอกสาร'}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          <span>ปิดฟอร์ม</span>
        </button>
      </div>

      {/* ── Template Selector with Category Tabs ── */}
      <div className="bg-slate-50 dark:bg-slate-850/60 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3.5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-primary-500" />
            <span>เลือกแม่แบบเอกสาร (Document Template):</span>
          </label>
          {currentTemplate && (
            <div className="flex items-center gap-2">
              {currentTemplate.category?.name && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                  {currentTemplate.category.name}
                </span>
              )}
              <Badge variant="primary">
                รหัส: {currentTemplate.code}
              </Badge>
            </div>
          )}
        </div>

        {/* Category Filter Tabs */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedCategoryCode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategoryCode === 'all'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>ทุกหมวดหมู่</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedCategoryCode === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
              }`}>
                {templates.length}
              </span>
            </button>
            {categories.map((cat) => {
              const count = templates.filter((t) => t.category?.code?.toUpperCase() === cat.code.toUpperCase()).length;
              const isActive = selectedCategoryCode.toUpperCase() === cat.code.toUpperCase();
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryCode(cat.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {loadingTemplates ? (
            <div className="col-span-full py-4 text-center text-xs text-slate-400">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-1.5"></div>
              กำลังโหลดรายการแม่แบบเอกสาร...
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="col-span-full py-4 text-center text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200/50">
              <p className="font-semibold">ยังไม่มีแม่แบบเอกสารในหมวดหมู่นี้</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                สามารถสร้างและอัปโหลดแม่แบบเอกสารใหม่ได้ที่เมนู 
                <a href="/modules/document-templates" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 underline font-bold ml-1">
                  "จัดการแม่แบบเอกสาร" &rarr;
                </a>
              </p>
            </div>
          ) : (
            filteredTemplates.map((tpl) => {
              const isSelected = tpl.id === selectedTemplateId;
              let elCount = 0;
              let formFieldCount = 0;
              try {
                const parsed = JSON.parse(tpl.mappingJson || '{}');
                const elements = Array.isArray(parsed?.elements) ? parsed.elements : [];
                elCount = elements.length;
                formFieldCount = elements.filter((el: any) => el.includeInForm !== false).length;
              } catch {}

              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50/70 dark:bg-primary-950/30 ring-2 ring-primary-500/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {tpl.name}
                    </span>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 shrink-0" />}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      {tpl.category?.name && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {tpl.category.name}
                        </span>
                      )}
                      <span className="truncate">รหัส: {tpl.code}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                      formFieldCount > 0 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {formFieldCount} ช่อง / {elCount} แท็ก
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Selected Template Download Actions Banner */}
        {currentTemplate && (
          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <span>แบบฟอร์มต้นฉบับ:</span>
                  <span className="text-primary-600 dark:text-primary-400">{currentTemplate.name}</span>
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                  ดาวน์โหลดไฟล์แบบฟอร์มเปล่าเพื่อนำไปกรอกข้อมูลด้วยตนเอง หรือแก้ไขใน Word/PDF
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {currentTemplate.docxUrl ? (
                <a
                  href={currentTemplate.docxUrl}
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 transition-all shadow-2xs"
                >
                  <i className="fa-solid fa-file-word text-blue-600 dark:text-blue-400" />
                  <span>ดาวน์โหลดแบบฟอร์ม Word (.docx)</span>
                </a>
              ) : (
                <a
                  href="/templates/docx/starter_leave_template.docx"
                  download="แบบฟอร์มใบลา_ทบ100-006.docx"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 transition-all shadow-2xs"
                >
                  <i className="fa-solid fa-file-word text-blue-600 dark:text-blue-400" />
                  <span>ดาวน์โหลดแบบฟอร์ม Word ตัวอย่าง (ทบ. 100-006)</span>
                </a>
              )}

              {currentTemplate.pdfUrl && (
                <a
                  href={currentTemplate.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 transition-all shadow-2xs"
                >
                  <i className="fa-solid fa-file-pdf text-rose-600 dark:text-rose-400" />
                  <span>ดาวน์โหลดแบบฟอร์ม PDF</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Auto-filled Personnel Profile Summary (Only if personnel tags are configured) ── */}
      {personnelData && parsedForm.personnelFields.length > 0 && (
        <div className="bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200/50 dark:border-primary-800/40 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-500/20 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>ผู้ขอลา: {personnelData.prefix} {personnelData.firstName} {personnelData.lastName}</span>
                <span className="text-[10px] bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-medium">
                  ดึงอัตโนมัติ
                </span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                ตำแหน่ง: {personnelData.position || '-'} | สังกัด: {personnelData.department || '-'} {personnelData.subDepartment ? `(${personnelData.subDepartment})` : ''}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-white/70 dark:bg-slate-800/70 px-2.5 py-1.5 rounded-lg border border-primary-100 dark:border-primary-900/30">
            <Info className="w-3.5 h-3.5 text-primary-500" />
            <span>ข้อมูลนี้จะถูกประทับลงบนแท็กผู้ขอลาใน PDF โดยอัตโนมัติ</span>
          </div>
        </div>
      )}

      {/* ── EMPTY STATE: If template has no configured form fields ── */}
      {!hasConfiguredFields ? (
        <div className="p-8 text-center bg-slate-50/80 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Sliders className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            แม่แบบนี้ยังไม่มีช่องกรอกข้อมูลในแบบฟอร์ม
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            ในหน้า <strong>จัดการแม่แบบเอกสาร</strong> กรุณาคลิกเลือกแท็กที่เคยวางไว้บนกระดาษ แล้วเปิดตัวเลือก <strong>"สร้างเป็นช่องในแบบฟอร์ม"</strong> ในแถบคุณสมบัติด้านขวา เพื่อกำหนดว่าแท็กใดต้องให้ผู้ใช้กรอก
          </p>
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs"
            >
              ปิดแบบฟอร์ม
            </Button>
          </div>
        </div>
      ) : (
        /* ── STRICT FORM FIELDS: Render ONLY configured fields ── */
        <div className="space-y-6">
          {/* Group 1: Dates (วันที่ลา) - ONLY if placed on canvas */}
          {parsedForm.dateFields.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-500" />
                <span>ช่วงเวลาการลา</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {parsedForm.requiresStartDate && (
                  <DatePicker
                    id="dynamic-startDate"
                    label={parsedForm.dateFields.find(f => f.key === 'startDate')?.label || 'วันที่เริ่มลา *'}
                    placeholder="เลือกวันเริ่มต้น"
                    value={formData.startDate || ''}
                    onChange={(val) => handleFieldChange('startDate', val)}
                  />
                )}
                {parsedForm.requiresEndDate && (
                  <DatePicker
                    id="dynamic-endDate"
                    label={parsedForm.dateFields.find(f => f.key === 'endDate')?.label || 'วันที่สิ้นสุดการลา *'}
                    placeholder="เลือกวันสิ้นสุด"
                    value={formData.endDate || ''}
                    onChange={(val) => handleFieldChange('endDate', val)}
                  />
                )}
                {parsedForm.requiresTotalDays && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {parsedForm.dateFields.find(f => f.key === 'totalDays')?.label || 'จำนวนวันลาทั้งหมด (วัน)'}
                    </label>
                    <input
                      type="number"
                      value={formData.totalDays || 0}
                      onChange={(e) => handleFieldChange('totalDays', parseInt(e.target.value) || 0)}
                      className="form-input bg-slate-50 dark:bg-slate-800/50"
                      placeholder="คำนวณอัตโนมัติ"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Group 2: Leave Details - ONLY if placed on canvas */}
          {parsedForm.detailFields.length > 0 && (
            <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-500" />
                <span>รายละเอียดคำขอลา</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {parsedForm.detailFields.map((field) => {
                  const spanClass = field.gridSpan === 3 || field.type === 'textarea' 
                    ? 'col-span-full' 
                    : field.gridSpan === 2 
                    ? 'md:col-span-2' 
                    : 'col-span-1';

                  return (
                    <div key={field.key} className={spanClass}>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          rows={2}
                          value={formData[field.key] ?? field.defaultValue ?? ''}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          className="form-textarea"
                          placeholder={field.placeholder || `กรอก ${field.label}`}
                          required={field.required}
                        />
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={formData[field.key] ?? field.defaultValue ?? ''}
                          onChange={(e) => handleFieldChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                          className="form-input"
                          placeholder={field.placeholder || `กรอก ${field.label}`}
                          required={field.required}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group 3: Stats & Balances - ONLY if placed on canvas */}
          {parsedForm.statFields.length > 0 && (
            <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" />
                <span>สถิติและสิทธิวันลา</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {parsedForm.statFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="number"
                      value={formData[field.key] ?? field.defaultValue ?? 0}
                      onChange={(e) => handleFieldChange(field.key, parseInt(e.target.value) || 0)}
                      className="form-input"
                      required={field.required}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group 4: Custom Elements - ONLY if placed on canvas */}
          {parsedForm.customFields.length > 0 && (
            <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary-500" />
                <span>ข้อมูลเพิ่มเติมตามแบบฟอร์ม (Custom Fields)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parsedForm.customFields.map((cf) => (
                  <div key={cf.key}>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {cf.label} {cf.required && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={formData[cf.key] ?? cf.defaultValue ?? ''}
                      onChange={(e) => handleFieldChange(cf.key, e.target.value)}
                      className="form-input"
                      placeholder={`กรอกข้อมูล ${cf.label}`}
                      required={cf.required}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Submit & Action Buttons ── */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              {currentTemplate?.docxUrl && (
                <a
                  href={currentTemplate.docxUrl}
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                  title="ดาวน์โหลดไฟล์แบบฟอร์ม Word ต้นฉบับ"
                >
                  <i className="fa-solid fa-file-word text-blue-600 dark:text-blue-400" />
                  <span>ดาวน์โหลดไฟล์ Word เปล่า</span>
                </a>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                ยกเลิก
              </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="shadow-sm shadow-primary-500/30 flex items-center gap-2 px-6"
            >
              {isSubmitting ? (
                <span>กำลังบันทึก...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{editingLeaveId ? 'อัปเดตข้อมูลแบบฟอร์ม' : 'บันทึกและยื่นแบบฟอร์ม'}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      )}
    </form>
  );
}
