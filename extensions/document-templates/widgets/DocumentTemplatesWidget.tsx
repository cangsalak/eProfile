'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, Badge, Button } from '@/components/ui';
import {
  FileText,
  Layers,
  Sparkles,
  Loader2,
  RefreshCw,
  Plus,
  FileCheck,
  CheckCircle2,
  Sliders,
  ExternalLink,
  FolderOpen,
} from 'lucide-react';
import Link from 'next/link';

interface CategoryItem {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  _count?: {
    templates: number;
  };
}

interface TemplateItem {
  id: string;
  name: string;
  code: string;
  pdfUrl?: string;
  docxUrl?: string;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
    code: string;
  };
}

type DocTemplateTab = 'templates' | 'categories' | 'tools';

export default function DocumentTemplatesWidget() {
  const [activeTab, setActiveTab] = useState<DocTemplateTab>('templates');
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [catRes, tplRes] = await Promise.all([
        fetch('/api/modules/document-templates/categories').then((r) => r.ok ? r.json() : { success: false }),
        fetch('/api/modules/document-templates/templates').then((r) => r.ok ? r.json() : { success: false }),
      ]);

      if (catRes.success && Array.isArray(catRes.data)) {
        setCategories(catRes.data);
      }
      if (tplRes.success && Array.isArray(tplRes.data)) {
        setTemplates(tplRes.data);
      }
    } catch (err) {
      console.error('Failed to load document templates widget data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalTemplates = templates.length;
  const activeCount = templates.filter((t) => t.isActive).length;
  const totalCategories = categories.length;

  return (
    <Card variant="convex" className="h-full flex flex-col min-h-[380px] font-prompt">
      <CardHeader
        title="คลังแม่แบบเอกสารส่วนกลาง"
        subtitle="ศูนย์รวมแม่แบบเอกสารราชการและฟอร์มมาตรฐาน"
        icon={<FileText className="w-5 h-5 text-white" />}
        iconGradient="from-amber-500 to-orange-600"
        action={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing || loading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary-500' : ''}`} />
            </button>
            <Link href="/modules/document-templates">
              <Button type="button" variant="secondary" size="xs" icon="fa-solid fa-arrow-right">
                จัดการแม่แบบ
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex-1 flex flex-col p-4 pt-2 space-y-3">
        {/* ── Segmented Tab Selector ── */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
              activeTab === 'templates'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-file-invoice text-[11px]"></i>
            <span>แม่แบบ ({totalTemplates})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
              activeTab === 'categories'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-layer-group text-[11px]"></i>
            <span>หมวดหมู่ ({totalCategories})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tools')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
              activeTab === 'tools'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-wand-magic-sparkles text-[11px]"></i>
            <span>เครื่องมือสารบรรณ</span>
          </button>
        </div>

        {/* ── Tab Content ── */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            <span className="text-xs">กำลังโหลดข้อมูลแม่แบบเอกสาร...</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between space-y-3">
            {/* ════════ TAB 1: TEMPLATES LIST ════════ */}
            {activeTab === 'templates' && (
              <div className="space-y-2.5">
                {/* Statistics Snapshot */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">แม่แบบทั้งหมด</span>
                    <span className="text-base font-black text-slate-800 dark:text-slate-200 font-mono">
                      {totalTemplates}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">เปิดใช้งาน</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {activeCount}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-center">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 block">หมวดหมู่</span>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                      {totalCategories}
                    </span>
                  </div>
                </div>

                {/* Templates List */}
                <div className="space-y-1.5">
                  {templates.length > 0 ? (
                    templates.slice(0, 4).map((tpl) => (
                      <Link
                        key={tpl.id}
                        href="/modules/document-templates"
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xs transition-all flex items-center justify-between text-xs group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-file-invoice text-xs"></i>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600 transition-colors">
                              {tpl.name}
                            </p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                              <span className="font-mono">{tpl.code}</span>
                              {tpl.category && <span>• {tpl.category.name}</span>}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {tpl.pdfUrl && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                              PDF
                            </span>
                          )}
                          {tpl.docxUrl && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                              DOCX
                            </span>
                          )}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      <FolderOpen className="w-8 h-8 mx-auto mb-1.5 text-slate-300 dark:text-slate-600 block" />
                      ยังไม่มีแม่แบบเอกสารในระบบ
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════════ TAB 2: CATEGORIES ════════ */}
            {activeTab === 'categories' && (
              <div className="space-y-1.5">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href="/modules/document-templates"
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xs transition-all flex items-center justify-between text-xs group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                          <i className="fa-solid fa-folder text-xs"></i>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600 transition-colors">
                            {cat.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            รหัส: {cat.code}
                          </p>
                        </div>
                      </div>

                      <span className="font-bold text-slate-700 dark:text-slate-300 font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {cat._count?.templates ?? 0} แบบ
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    ยังไม่มีหมวดหมู่แม่แบบเอกสาร
                  </div>
                )}
              </div>
            )}

            {/* ════════ TAB 3: TOOLS & STATUS ════════ */}
            {activeTab === 'tools' && (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/40 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-100 dark:border-amber-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      ระบบเรนเดอร์และทาบพิกัด
                    </span>
                    <Badge variant="success" size="xs">Active</Badge>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>ขนาด Canvas A4 Base:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">595 × 842 pt</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ระบบตรวจจับแท็กตัวแปร Word:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">พร้อมใช้งาน</span>
                    </div>
                    <div className="flex justify-between">
                      <span>พาธโฟลเดอร์จัดเก็บแม่แบบ:</span>
                      <span className="font-bold text-primary-600 dark:text-primary-400 font-mono">uploads/e-form/templates/</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>รองรับการแทนที่แท็กตัวแปรอัตโนมัติ เช่น {"{fullName}"}, {"{department}"}, {"{todayFull}"}</span>
                </div>
              </div>
            )}

            {/* ── Bottom Action Links ── */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <Link href="/modules/document-templates" className="block w-full">
                <Button
                  type="button"
                  variant="primary"
                  size="xs"
                  className="w-full justify-center"
                  icon="fa-solid fa-file-invoice"
                >
                  จัดการแม่แบบ
                </Button>
              </Link>
              <Link href="/modules/document-templates" className="block w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="w-full justify-center"
                  icon="fa-solid fa-plus"
                >
                  เพิ่มแม่แบบใหม่
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
