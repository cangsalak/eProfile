'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import InspectorModal from '../components/InspectorModal';
import ConfirmModal from '@/components/common/ConfirmModal';

interface InspectionItem {
  id: string;
  page: string;
  url: string;
  scanMode: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  overallResult: string;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  totalFindings: number;
  user?: {
    username: string;
    firstName: string;
    lastName: string;
  };
  _count?: {
    findings: number;
  };
}

interface FindingDetail {
  id: string;
  findingCode: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  expected?: string;
  actual?: string;
  element?: string;
  selector?: string;
  recommendation: string;
  status: 'OPEN' | 'REVIEWED' | 'IGNORED' | 'FIXED' | 'FALSE_POSITIVE';
  notes?: string;
}

export default function SystemInspectorView() {
  const [inspections, setInspections] = useState<InspectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [resultFilter, setResultFilter] = useState<string>('ALL');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  
  // Selected inspection for detail drawer
  const [selectedInspection, setSelectedInspection] = useState<any | null>(null);
  const [findingsList, setFindingsList] = useState<FindingDetail[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const fetchInspections = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = resultFilter === 'ALL'
        ? '/api/admin/inspector'
        : `/api/admin/inspector?result=${resultFilter}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        setInspections(result.data || []);
      } else if (res.status === 403) {
        toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะ SUPER_ADMIN เท่านั้น)');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('ไม่สามารถโหลดประวัติการตรวจสอบได้');
    } finally {
      setIsLoading(false);
    }
  }, [resultFilter]);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  const viewInspectionDetail = async (id: string) => {
    setIsDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/inspector/${id}`);
      if (res.ok) {
        const result = await res.json();
        setSelectedInspection(result.data);
        setFindingsList(result.data.findings || []);
      } else {
        toast.error('ไม่สามารถโหลดรายละเอียดได้');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('ไม่สามารถดึงรายละเอียดได้');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const updateFindingStatus = async (
    inspectionId: string,
    findingId: string,
    newStatus: FindingDetail['status']
  ) => {
    try {
      const res = await fetch(`/api/admin/inspector/${inspectionId}/findings/${findingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setFindingsList(prev =>
          prev.map(f => (f.id === findingId ? { ...f, status: newStatus } : f))
        );
        toast.success(`อัปเดตสถานะเป็น ${newStatus} สำเร็จ`);
      } else {
        toast.error('ไม่สามารถอัปเดตสถานะได้');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const executeDeleteInspection = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/inspector/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('ลบประวัติสำเร็จ');
        if (selectedInspection?.id === id) {
          setSelectedInspection(null);
        }
        fetchInspections();
      }
    } catch {
      toast.error('ลบล้มเหลว');
    }
  };

  // Metrics summary
  const totalInspections = inspections.length;
  const criticalCount = inspections.reduce((acc, cur) => acc + (cur.criticalCount || 0), 0);
  const highCount = inspections.reduce((acc, cur) => acc + (cur.highCount || 0), 0);
  const mediumCount = inspections.reduce((acc, cur) => acc + (cur.mediumCount || 0), 0);
  const passCount = inspections.filter(i => i.overallResult === 'PASS').length;

  return (
    <div className="pb-16 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <i className="fa-solid fa-microscope text-purple-600"></i> ระบบตรวจสอบและวิเคราะห์คุณภาพระบบ (System Inspector)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              SUPER_ADMIN ONLY
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            เครื่องมือวินิจฉัย DOM, Typography (คำผิดภาษาไทย), Broken Links, Accessibility และ Security Headers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/modules/system-inspector/api-docs"
            className="px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs shadow-xs flex items-center gap-2 transition-all"
          >
            <i className="fa-solid fa-book text-purple-500"></i>
            <span>API Docs</span>
          </Link>
          <Link
            href="/modules/system-inspector/audit-logs"
            className="px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs shadow-xs flex items-center gap-2 transition-all"
          >
            <i className="fa-solid fa-list-check text-purple-500"></i>
            <span>Audit Logs</span>
          </Link>
          <button
            onClick={() => setIsLiveModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <i className="fa-solid fa-magnifying-glass-chart"></i>
            <span>ตรวจสอบระบบเรียลไทม์ (Live Scan)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 mb-1">การตรวจทั้งหมด</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalInspections} ครั้ง</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            ผ่านเกณฑ์ {passCount} ครั้ง ({totalInspections ? Math.round((passCount/totalInspections)*100) : 0}%)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-rose-500 mb-1">CRITICAL Findings</div>
          <div className="text-2xl font-black text-rose-600">{criticalCount}</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">ข้อบกพร่องระดับวิกฤต</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-orange-500 mb-1">HIGH Findings</div>
          <div className="text-2xl font-black text-orange-600">{highCount}</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">ข้อบกพร่องระดับสูง</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-amber-500 mb-1">MEDIUM Findings</div>
          <div className="text-2xl font-black text-amber-600">{mediumCount}</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">ข้อบกพร่องระดับกลาง (เช่น คำผิด)</div>
        </div>
      </div>

      {/* Main Inspection Records Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">กรองผลการตรวจ:</span>
            {(['ALL', 'PASS', 'NEEDS_REVIEW', 'CRITICAL_ISSUES'] as const).map(res => (
              <button
                key={res}
                onClick={() => setResultFilter(res)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  resultFilter === res
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {res === 'ALL' ? 'ทั้งหมด' : res}
              </button>
            ))}
          </div>

          <button
            onClick={fetchInspections}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <i className="fa-solid fa-rotate"></i>
            <span>รีเฟรช</span>
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">วันที่ / เวลา</th>
                <th className="py-3.5 px-4">หน้า / Route</th>
                <th className="py-3.5 px-4">โหมด</th>
                <th className="py-3.5 px-4">ผลการตรวจ</th>
                <th className="py-3.5 px-4">Findings แยกตามระดับ</th>
                <th className="py-3.5 px-4">เวลาตรวจ</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <i className="fa-solid fa-spinner animate-spin text-xl mb-2"></i>
                    <p>กำลังโหลดข้อมูลการตรวจสอบ...</p>
                  </td>
                </tr>
              ) : inspections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <i className="fa-solid fa-circle-info text-2xl mb-2"></i>
                    <p>ยังไม่มีประวัติการตรวจสอบในระบบ</p>
                  </td>
                </tr>
              ) : (
                inspections.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                      {new Date(item.startedAt).toLocaleString('th-TH')}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                      <div>{item.page}</div>
                      <div className="font-mono text-[11px] text-purple-600 dark:text-purple-400">{item.url}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.scanMode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        item.overallResult === 'PASS' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200' :
                        item.overallResult === 'NEEDS_REVIEW' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border border-amber-200' :
                        'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200'
                      }`}>
                        {item.overallResult}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-[11px]">
                        {item.criticalCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white" title="Critical">
                            {item.criticalCount}C
                          </span>
                        )}
                        {item.highCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-orange-500 text-white" title="High">
                            {item.highCount}H
                          </span>
                        )}
                        {item.mediumCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white" title="Medium">
                            {item.mediumCount}M
                          </span>
                        )}
                        {item.lowCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-500 text-white" title="Low">
                            {item.lowCount}L
                          </span>
                        )}
                        {item.totalFindings === 0 && (
                          <span className="text-emerald-500 font-normal">0 ข้อบกพร่อง</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {item.durationMs} ms
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => viewInspectionDetail(item.id)}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-300 rounded-lg text-xs font-semibold mr-1.5 transition-colors"
                      >
                        ดูผลตรวจ ({item.totalFindings})
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(item.id)}
                        className="px-2 py-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs transition-colors"
                        title="ลบ"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Findings Detail Modal / Drawer */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/80">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-clipboard-check text-purple-600"></i> ผลการตรวจ: {selectedInspection.page}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  URL: {selectedInspection.url} • ตรวจเมื่อ: {new Date(selectedInspection.startedAt).toLocaleString('th-TH')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    let prompt = `# 🚀 คำสั่งสำหรับแก้ไขข้อบกพร่องของระบบ (eProfile System Fix Prompt)\n\n`;
                    prompt += `## ข้อมูลหน้าเว็บที่ตรวจสอบ:\n`;
                    prompt += `- **โครงการ**: eProfile System (Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma, SQLite)\n`;
                    prompt += `- **หน้าเว็บ**: ${selectedInspection.page}\n`;
                    prompt += `- **URL**: ${selectedInspection.url}\n`;
                    prompt += `- **เวลาตรวจสอบ**: ${new Date(selectedInspection.startedAt).toLocaleString('th-TH')}\n`;
                    prompt += `- **สรุปผลการตรวจ**: ${selectedInspection.overallResult} (CRITICAL: ${selectedInspection.criticalCount}, HIGH: ${selectedInspection.highCount}, MEDIUM: ${selectedInspection.mediumCount}, LOW: ${selectedInspection.lowCount})\n\n`;
                    prompt += `## รายการข้อบกพร่องที่ต้องแก้ไข (${findingsList.length} รายการ):\n\n`;

                    findingsList.forEach((f, idx) => {
                      prompt += `### ${idx + 1}. [${f.findingCode}] ${f.title} (${f.severity} - ${f.category})\n`;
                      prompt += `- **คำอธิบายปัญหา**: ${f.description}\n`;
                      if (f.element) prompt += `- **Element ที่เกี่ยวข้อง**: \`<${f.element}>\`\n`;
                      if (f.actual) prompt += `- **สิ่งที่พบปัจจุบัน (Actual)**: \`${f.actual}\`\n`;
                      if (f.expected) prompt += `- **ผลลัพธ์ที่ถูกต้อง (Expected)**: \`${f.expected}\`\n`;
                      prompt += `- **แนวทางแก้ไขที่แนะนำ**: ${f.recommendation}\n\n`;
                    });

                    prompt += `## 🎯 คำขอสำหรับการดำเนินการใน ChatGPT / AI Assistant:\n`;
                    prompt += `กรุณาช่วยวิเคราะห์ปัญหาข้างต้นทีละข้อ และเขียนขั้นตอนการแก้ไขพร้อมโค้ดตัวอย่างที่ถูกต้องตามมาตรฐาน Next.js App Router, Tailwind CSS และ TypeScript โดยคำนึงถึง Security, Clean Code และ Accessibility ครับ\n`;

                    navigator.clipboard.writeText(prompt);
                    toast.success('คัดลอก Prompt สำหรับ ChatGPT เรียบร้อยแล้ว!');
                  }}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <i className="fa-solid fa-copy"></i>
                  <span>คัดลอก Prompt ChatGPT</span>
                </button>

                <button
                  onClick={() => setSelectedInspection(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Findings List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isDetailLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <i className="fa-solid fa-spinner animate-spin text-xl mb-2"></i>
                  <p>กำลังโหลดข้อบกพร่อง...</p>
                </div>
              ) : findingsList.length === 0 ? (
                <div className="py-12 text-center text-emerald-500">
                  <i className="fa-solid fa-shield-check text-4xl mb-2"></i>
                  <p className="font-bold text-sm">ไม่พบข้อบกพร่องในการตรวจครั้งนี้</p>
                </div>
              ) : (
                findingsList.map((f) => (
                  <div key={f.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {f.findingCode}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          f.severity === 'CRITICAL' ? 'bg-rose-500 text-white' :
                          f.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                          f.severity === 'MEDIUM' ? 'bg-amber-500 text-white' :
                          f.severity === 'LOW' ? 'bg-blue-500 text-white' :
                          'bg-slate-500 text-white'
                        }`}>
                          {f.severity}
                        </span>
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                          [{f.category}]
                        </span>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-[11px] text-slate-400 font-semibold">สถานะ:</span>
                        <select
                          value={f.status}
                          onChange={(e) => updateFindingStatus(selectedInspection.id, f.id, e.target.value as any)}
                          className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          <option value="OPEN">🔴 OPEN</option>
                          <option value="REVIEWED">🟡 REVIEWED</option>
                          <option value="FIXED">🟢 FIXED</option>
                          <option value="IGNORED">⚪ IGNORED</option>
                          <option value="FALSE_POSITIVE">🟣 FALSE_POSITIVE</option>
                        </select>
                      </div>
                    </div>

                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                      {f.title}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {f.description}
                    </p>

                    {(f.expected || f.actual) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        {f.actual && (
                          <div className="p-2 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-300">
                            <span className="font-bold block text-[10px] uppercase text-rose-500">Actual (พบ):</span>
                            <span className="font-mono">{f.actual}</span>
                          </div>
                        )}
                        {f.expected && (
                          <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                            <span className="font-bold block text-[10px] uppercase text-emerald-500">Expected (ถูกต้อง):</span>
                            <span className="font-mono">{f.expected}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                      <i className="fa-solid fa-lightbulb text-amber-500 mt-0.5 shrink-0"></i>
                      <div>
                        <span className="font-bold">ข้อเสนอแนะ: </span>
                        <span>{f.recommendation}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
              <button
                onClick={() => setSelectedInspection(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-semibold"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Inspector Modal */}
      <InspectorModal
        isOpen={isLiveModalOpen}
        defaultProjectWide={true}
        onClose={() => {
          setIsLiveModalOpen(false);
          fetchInspections();
        }}
      />

      {/* Styled Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="ยืนยันการลบประวัติการตรวจ?"
        message="คุณแน่ใจหรือไม่ที่จะลบประวัติการตรวจสอบนี้? รายการข้อบกพร่องและผลการตรวจทั้งหมดของรอบนี้จะถูกลบออกจากระบบ"
        confirmText="ยืนยันการลบ"
        cancelText="ยกเลิก"
        isDestructive={true}
        onConfirm={() => {
          if (deleteTargetId) {
            executeDeleteInspection(deleteTargetId);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
