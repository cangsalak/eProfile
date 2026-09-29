'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, Badge, Button } from '@/components/ui';
import {
  FileSignature,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Plus,
  Send,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface SubmittedFormItem {
  id: string;
  formType?: string;
  leaveType?: string;
  startDate?: string;
  reason?: string;
  status: string;
  createdAt: string;
}

type EFormWidgetTab = 'my-forms' | 'templates' | 'process';

function formatThaiDate(dateInput?: string): string {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusBadge(status: string) {
  if (status.includes('อนุมัติ') && !status.includes('รอ') && !status.includes('ไม่')) {
    return <Badge variant="success" size="xs">อนุมัติแล้ว</Badge>;
  }
  if (status.includes('ไม่อนุมัติ') || status.includes('ปฏิเสธ')) {
    return <Badge variant="danger" size="xs">ปฏิเสธ</Badge>;
  }
  return <Badge variant="warning" size="xs">รอพิจารณา</Badge>;
}

const POPULAR_TEMPLATES = [
  {
    id: 'general-request',
    title: 'แบบคำขอทั่วไป',
    code: 'REQ-01',
    description: 'สำหรับยื่นคำร้อง ติดต่อประสานงาน หรือขออนุมัติทั่วไป',
    icon: 'fa-solid fa-file-lines',
    color: 'text-primary-500 bg-primary-50 dark:bg-primary-950/40',
  },
  {
    id: 'support-request',
    title: 'แบบขอรับการสนับสนุน',
    code: 'REQ-02',
    description: 'ขอรับการสนับสนุนอุปกรณ์ เครื่องมือ ยานพาหนะ หรือบุคลากร',
    icon: 'fa-solid fa-handshake-angle',
    color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/40',
  },
  {
    id: 'report-request',
    title: 'แบบรายงานผลการปฏิบัติงาน',
    code: 'REQ-03',
    description: 'รายงานผลการปฏิบัติภารกิจ ราชการสนาม หรือการฝึกอบรม',
    icon: 'fa-solid fa-clipboard-check',
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    id: 'facility-request',
    title: 'แบบขอใช้สถานที่และบริการ',
    code: 'REQ-04',
    description: 'ขอจองห้องประชุม สถานที่จัดกิจกรรม หรือระบบเครือข่าย',
    icon: 'fa-solid fa-building',
    color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40',
  },
];

export default function EFormQuickStats() {
  const [activeTab, setActiveTab] = useState<EFormWidgetTab>('my-forms');
  const [recentForms, setRecentForms] = useState<SubmittedFormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch('/api/modules/e-form');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setRecentForms(data.slice(0, 4));
        }
      }
    } catch (err) {
      console.error('Failed to load e-form data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalForms = recentForms.length;
  const approvedCount = recentForms.filter(
    (f) => f.status.includes('อนุมัติ') && !f.status.includes('รอ') && !f.status.includes('ไม่')
  ).length;
  const pendingCount = recentForms.filter((f) => f.status.includes('รอ')).length;

  return (
    <Card variant="convex" className="h-full flex flex-col min-h-[380px] font-prompt">
      <CardHeader
        title="ระบบยื่นแบบฟอร์ม (e-Forms)"
        subtitle="แบบฟอร์มคำขออิเล็กทรอนิกส์ออนไลน์"
        icon={<FileSignature className="w-5 h-5 text-white" />}
        iconGradient="from-indigo-500 to-primary-600"
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
            <Link href="/modules/e-form">
              <Button type="button" variant="secondary" size="xs" icon="fa-solid fa-arrow-right">
                เปิดระบบฟอร์ม
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
            onClick={() => setActiveTab('my-forms')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
              activeTab === 'my-forms'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-file-lines text-[11px]"></i>
            <span>คำขอของฉัน</span>
            {totalForms > 0 && (
              <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-600 text-[10px] flex items-center justify-center font-mono">
                {totalForms}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
              activeTab === 'templates'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-layer-group text-[11px]"></i>
            <span>แม่แบบยอดนิยม</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('process')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
              activeTab === 'process'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-circle-info text-[11px]"></i>
            <span>ขั้นตอนการยื่น</span>
          </button>
        </div>

        {/* ── Tab Content ── */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            <span className="text-xs">กำลังโหลดข้อมูลแบบฟอร์ม...</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between space-y-3">
            {/* ════════ TAB 1: MY RECENT FORMS ════════ */}
            {activeTab === 'my-forms' && (
              <div className="space-y-2.5">
                {/* Status Snapshot Badges */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">ทั้งหมด</span>
                    <span className="text-base font-black text-slate-800 dark:text-slate-200 font-mono">
                      {totalForms}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-center">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 block">รอพิจารณา</span>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                      {pendingCount}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">อนุมัติแล้ว</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {approvedCount}
                    </span>
                  </div>
                </div>

                {/* Recent Forms List */}
                <div className="space-y-1.5">
                  {recentForms.length > 0 ? (
                    recentForms.map((item) => (
                      <Link
                        key={item.id}
                        href="/modules/e-form"
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xs transition-all flex items-center justify-between text-xs group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-file-contract text-xs"></i>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600 transition-colors">
                              {item.formType || item.leaveType || 'แบบคำขออิเล็กทรอนิกส์'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              ยื่นเมื่อ: {formatThaiDate(item.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 ml-2">
                          {getStatusBadge(item.status)}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      <FileText className="w-8 h-8 mx-auto mb-1.5 text-slate-300 dark:text-slate-600 block" />
                      ยังไม่มีประวัติการยื่นแบบฟอร์ม
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════════ TAB 2: POPULAR TEMPLATES ════════ */}
            {activeTab === 'templates' && (
              <div className="space-y-1.5">
                {POPULAR_TEMPLATES.map((tmpl) => (
                  <Link
                    key={tmpl.id}
                    href="/modules/e-form"
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xs transition-all flex items-center justify-between text-xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tmpl.color}`}>
                        <i className={`${tmpl.icon} text-xs`}></i>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600 transition-colors">
                            {tmpl.title}
                          </span>
                          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {tmpl.code}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          {tmpl.description}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 group-hover:text-primary-500 transition-all shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            )}

            {/* ════════ TAB 3: PROCESS & FLOW ════════ */}
            {activeTab === 'process' && (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-blue-50/40 dark:from-indigo-950/30 dark:to-blue-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      สถานะระบบแบบฟอร์ม
                    </span>
                    <Badge variant="success" size="xs">พร้อมให้บริการ</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    ระบบรองรับการสร้างและยื่นคำขอแบบฟอร์มอิเล็กทรอนิกส์ พร้อมบันทึกประวัติและดาวน์โหลดสั่งพิมพ์ A4
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  {[
                    { step: '1', title: 'เลือกแม่แบบแบบฟอร์ม', desc: 'เลือกแบบคำขอที่ต้องการยื่นจากรายการ' },
                    { step: '2', title: 'กรอกข้อมูลและแนบเอกสาร', desc: 'ระบุรายละเอียดตามช่องที่กำหนด' },
                    { step: '3', title: 'ส่งคำขอและติดตามผล', desc: 'ระบบแจ้งสถานะและรองรับการสั่งพิมพ์เอกสาร' },
                  ].map((s) => (
                    <div key={s.step} className="flex items-center gap-2 p-1.5 rounded-lg text-slate-600 dark:text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/60 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                        {s.step}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 leading-tight">{s.title}</p>
                        <p className="text-[10px] text-slate-400">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Bottom Action Links ── */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <Link href="/modules/e-form" className="block w-full">
                <Button
                  type="button"
                  variant="primary"
                  size="xs"
                  className="w-full justify-center"
                  icon="fa-solid fa-plus"
                >
                  ยื่นแบบฟอร์มใหม่
                </Button>
              </Link>
              <Link href="/modules/e-form" className="block w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="w-full justify-center"
                  icon="fa-solid fa-clock-rotate-left"
                >
                  ประวัติคำขอทั้งหมด
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
