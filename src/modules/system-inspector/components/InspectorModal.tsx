'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  runClientPageInspection,
  runFullProjectInspection,
  InspectionReport,
  ProjectRouteItem
} from '@/lib/inspector/engine';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface InspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectWide?: boolean;
}

export default function InspectorModal({ isOpen, onClose, defaultProjectWide = true }: InspectorModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState<'PROJECT' | 'CURRENT'>(defaultProjectWide ? 'PROJECT' : 'CURRENT');
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number; routeName: string; routePath: string } | null>(null);
  const [report, setReport] = useState<InspectionReport | null>(null);
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  const performScan = useCallback(async (type: 'PROJECT' | 'CURRENT' = scanType) => {
    setIsScanning(true);
    setSavedId(null);
    setScanType(type);
    setSelectedRouteFilter('ALL');
    setSelectedCategory('ALL');
    setSelectedSeverity('ALL');

    try {
      if (type === 'PROJECT') {
        setScanProgress({ current: 0, total: 20, routeName: 'กำลังสแกนค้นหาเส้นทางในโปรเจค...', routePath: '/' });
        const res = await runFullProjectInspection((current, total, route) => {
          setScanProgress({
            current,
            total,
            routeName: route.name,
            routePath: route.path,
          });
        });
        setReport(res);
        toast.success(`ตรวจสอบทั้งโปรเจคสำเร็จ (${res.totalPagesScanned} เส้นทาง)`);
      } else {
        setScanProgress(null);
        await new Promise(r => setTimeout(r, 120));
        const res = await runClientPageInspection('FULL');
        setReport(res);
        toast.success('ตรวจสอบหน้าปัจจุบันสำเร็จ');
      }
    } catch (err: any) {
      toast.error('เกิดข้อผิดพลาดในการตรวจสอบ: ' + (err.message || 'Unknown error'));
    } finally {
      setIsScanning(false);
      setScanProgress(null);
    }
  }, [scanType]);

  useEffect(() => {
    if (isOpen) {
      performScan(defaultProjectWide ? 'PROJECT' : 'CURRENT');
    }
  }, [isOpen, defaultProjectWide, performScan]);

  if (!isOpen) return null;

  const generateAIPrompt = () => {
    if (!report) return '';

    const targetFindings = report.findings.filter(f => {
      const matchRoute = selectedRouteFilter === 'ALL' || f.url === selectedRouteFilter || f.page === selectedRouteFilter;
      const matchCat = selectedCategory === 'ALL' || f.category === selectedCategory;
      const matchSev = selectedSeverity === 'ALL' || f.severity === selectedSeverity;
      return matchRoute && matchCat && matchSev;
    });

    let prompt = `# 🚀 คำสั่งสำหรับแก้ไขข้อบกพร่องของระบบ (eProfile System Fix Prompt)\n\n`;
    prompt += `## ข้อมูลการตรวจสอบ:\n`;
    prompt += `- **โครงการ**: eProfile System (Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma, SQLite)\n`;
    prompt += `- **ขอบเขตการตรวจ**: ${report.isProjectWide ? `ทั้งโปรเจค (${report.totalPagesScanned} เส้นทาง)` : `หน้าเดียว (${report.page})`}\n`;
    prompt += `- **URL/เส้นทาง**: ${report.url}\n`;
    prompt += `- **เวลาตรวจสอบ**: ${new Date().toLocaleString('th-TH')}\n`;
    prompt += `- **สรุปผลการตรวจ**: ${report.overallResult} (CRITICAL: ${report.criticalCount}, HIGH: ${report.highCount}, MEDIUM: ${report.mediumCount}, LOW: ${report.lowCount})\n\n`;

    if (report.routeSummaries && report.routeSummaries.length > 0) {
      prompt += `## สรุปสถานะรายหน้าในโปรเจค:\n`;
      report.routeSummaries.forEach(r => {
        prompt += `- \`${r.path}\` (${r.name}): **${r.status}** (พบ ${r.findingsCount} รายการ)\n`;
      });
      prompt += `\n`;
    }

    prompt += `## รายการข้อบกพร่องที่ต้องแก้ไข (${targetFindings.length} รายการ):\n\n`;

    targetFindings.forEach((f, idx) => {
      prompt += `### ${idx + 1}. [${f.findingCode}] ${f.title} (${f.severity} - ${f.category})\n`;
      if (f.page || f.url) prompt += `- **หน้าที่พบ**: ${f.page || ''} (\`${f.url || ''}\`)\n`;
      prompt += `- **คำอธิบายปัญหา**: ${f.description}\n`;
      if (f.element) prompt += `- **Element ที่เกี่ยวข้อง**: \`<${f.element}>\`\n`;
      if (f.actual) prompt += `- **สิ่งที่พบปัจจุบัน (Actual)**: \`${f.actual}\`\n`;
      if (f.expected) prompt += `- **ผลลัพธ์ที่ถูกต้อง (Expected)**: \`${f.expected}\`\n`;
      prompt += `- **แนวทางแก้ไขที่แนะนำ**: ${f.recommendation}\n\n`;
    });

    prompt += `## 🎯 คำขอสำหรับการดำเนินการใน ChatGPT / AI Assistant:\n`;
    prompt += `กรุณาช่วยวิเคราะห์ปัญหาข้างต้นทีละข้อ และเขียนขั้นตอนการแก้ไขพร้อมโค้ดตัวอย่างที่ถูกต้องตามมาตรฐาน Next.js App Router, Tailwind CSS และ TypeScript โดยคำนึงถึง Security, Clean Code และ Accessibility ครับ\n`;

    return prompt;
  };

  const handleCopyPrompt = () => {
    const prompt = generateAIPrompt();
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    toast.success('คัดลอก Prompt สำหรับ ChatGPT เรียบร้อยแล้ว!');
  };

  const handleSaveReport = async () => {
    if (!report) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/inspector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });

      if (res.ok) {
        const data = await res.json();
        setSavedId(data.data.id);
        toast.success('บันทึกผลการตรวจสอบลงฐานข้อมูลเรียบร้อยแล้ว');
      } else {
        const err = await res.json();
        toast.error(err.error || 'ไม่สามารถบันทึกรายงานได้');
      }
    } catch (err: any) {
      toast.error(err.message || 'บันทึกล้มเหลว');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredFindings = report?.findings.filter((f) => {
    const matchRoute = selectedRouteFilter === 'ALL' || f.url === selectedRouteFilter || f.page === selectedRouteFilter;
    const matchCat = selectedCategory === 'ALL' || f.category === selectedCategory;
    const matchSev = selectedSeverity === 'ALL' || f.severity === selectedSeverity;
    return matchRoute && matchCat && matchSev;
  }) || [];

  const categories = Array.from(new Set(report?.findings.map(f => f.category) || []));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md no-inspect animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-6xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 shrink-0">
              <i className="fa-solid fa-microscope text-lg"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Super Admin System Inspector
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  SUPER_ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {scanType === 'PROJECT'
                  ? 'ตรวจสอบและวินิจฉัยทุกเส้นทางและโครงสร้างทั้งโปรเจค (All Routes Scanner)'
                  : 'ตรวจสอบและวินิจฉัยโครงสร้างหน้าปัจจุบัน (Current Page Scanner)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* Toggle Scan Type */}
            <div className="flex bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => performScan('PROJECT')}
                disabled={isScanning}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  scanType === 'PROJECT'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <i className="fa-solid fa-layer-group text-xs"></i>
                <span>ทั้งโปรเจค (All Pages)</span>
              </button>
              <button
                onClick={() => performScan('CURRENT')}
                disabled={isScanning}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  scanType === 'CURRENT'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <i className="fa-solid fa-file-lines text-xs"></i>
                <span>หน้านี้หน้าเดียว</span>
              </button>
            </div>

            <button
              onClick={() => performScan(scanType)}
              disabled={isScanning}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <i className={`fa-solid fa-rotate-right ${isScanning ? 'animate-spin' : ''}`}></i>
              <span>{isScanning ? 'กำลังตรวจ...' : 'ตรวจอีกครั้ง'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isScanning ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-purple-500/20 border-t-purple-600 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-purple-600 text-xl">
                  <i className="fa-solid fa-magnifying-glass-chart animate-pulse"></i>
                </div>
              </div>

              <div className="w-full max-w-md space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {scanType === 'PROJECT' ? 'กำลังตรวจสอบทั้งโปรเจค...' : 'กำลังวิเคราะห์หน้าปัจจุบัน...'}
                </h4>
                
                {scanProgress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <span>หน้า {scanProgress.current} จาก {scanProgress.total}</span>
                      <span>{Math.round((scanProgress.current / scanProgress.total) * 100)}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-200"
                        style={{ width: `${(scanProgress.current / scanProgress.total) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 py-1 px-3 rounded-lg border border-purple-200 dark:border-purple-800/50">
                      {scanProgress.routePath} ({scanProgress.routeName})
                    </p>
                  </div>
                )}
                <p className="text-[11px] text-slate-400">
                  ตรวจสอบ DOM Tree, Typography, Links, Form Labels, Accessibility, Security Headers และ HTTP Status
                </p>
              </div>
            </div>
          ) : report ? (
            <>
              {/* Summary Banner */}
              <div className={`p-5 rounded-2xl border transition-all ${
                report.overallResult === 'PASS'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                  : report.overallResult === 'NEEDS_REVIEW'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
              }`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide ${
                        report.overallResult === 'PASS'
                          ? 'bg-emerald-500 text-white'
                          : report.overallResult === 'NEEDS_REVIEW'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-600 text-white'
                      }`}>
                        {report.overallResult === 'PASS' ? '🟢 PASS (ผ่านการตรวจ)' : report.overallResult === 'NEEDS_REVIEW' ? '🟡 NEEDS REVIEW (พบข้อสังเกต)' : '🔴 CRITICAL ISSUES (ต้องแก้ไข)'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        • ใช้เวลาตรวจ {report.durationMs} ms
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <i className={`fa-solid ${report.isProjectWide ? 'fa-layer-group text-purple-500' : 'fa-file-lines text-indigo-500'}`}></i>
                      <span>{report.page}</span>
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {savedId ? (
                      <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <i className="fa-solid fa-check"></i> บันทึกแล้ว ({savedId.slice(-6)})
                      </span>
                    ) : (
                      <button
                        onClick={handleSaveReport}
                        disabled={isSaving}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
                      >
                        <i className={`fa-solid fa-floppy-disk ${isSaving ? 'animate-spin' : ''}`}></i>
                        <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกรายงานลงระบบ'}</span>
                      </button>
                    )}
                    
                    <Link
                      href="/manage/inspector"
                      onClick={onClose}
                      className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <i className="fa-solid fa-chart-line text-xs"></i>
                      <span>Dashboard รวม</span>
                    </Link>
                  </div>
                </div>

                {/* Counter Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/60">
                  <button
                    onClick={() => setSelectedSeverity(selectedSeverity === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedSeverity === 'CRITICAL'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white/60 dark:bg-slate-800/60 border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    <div className="text-lg font-black">{report.criticalCount}</div>
                    <div className="text-[10px] uppercase font-bold tracking-wider">CRITICAL</div>
                  </button>

                  <button
                    onClick={() => setSelectedSeverity(selectedSeverity === 'HIGH' ? 'ALL' : 'HIGH')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedSeverity === 'HIGH'
                        ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                        : 'bg-white/60 dark:bg-slate-800/60 border-orange-200 dark:border-orange-900/40 text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    <div className="text-lg font-black">{report.highCount}</div>
                    <div className="text-[10px] uppercase font-bold tracking-wider">HIGH</div>
                  </button>

                  <button
                    onClick={() => setSelectedSeverity(selectedSeverity === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedSeverity === 'MEDIUM'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white/60 dark:bg-slate-800/60 border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    <div className="text-lg font-black">{report.mediumCount}</div>
                    <div className="text-[10px] uppercase font-bold tracking-wider">MEDIUM</div>
                  </button>

                  <button
                    onClick={() => setSelectedSeverity(selectedSeverity === 'LOW' ? 'ALL' : 'LOW')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedSeverity === 'LOW'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white/60 dark:bg-slate-800/60 border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    <div className="text-lg font-black">{report.lowCount}</div>
                    <div className="text-[10px] uppercase font-bold tracking-wider">LOW</div>
                  </button>

                  <button
                    onClick={() => setSelectedSeverity(selectedSeverity === 'INFO' ? 'ALL' : 'INFO')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedSeverity === 'INFO'
                        ? 'bg-slate-600 text-white border-slate-600 shadow-sm'
                        : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-lg font-black">{report.infoCount}</div>
                    <div className="text-[10px] uppercase font-bold tracking-wider">INFO</div>
                  </button>
                </div>
              </div>

              {/* Route Summary Chips (If Project-Wide) */}
              {report.routeSummaries && report.routeSummaries.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <i className="fa-solid fa-sitemap text-purple-500"></i> เส้นทางทั้งหมดในโปรเจค ({report.routeSummaries.length} หน้า):
                    </h5>
                    <span className="text-[11px] text-slate-400">คลิกที่หน้าเพื่อกรองข้อบกพร่อง</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                    <button
                      onClick={() => setSelectedRouteFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        selectedRouteFilter === 'ALL'
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ทุกหน้า ({report.totalFindings})
                    </button>
                    {report.routeSummaries.map((r) => (
                      <button
                        key={r.path}
                        onClick={() => setSelectedRouteFilter(r.path)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                          selectedRouteFilter === r.path
                            ? 'bg-purple-600 text-white font-bold shadow-xs'
                            : r.status === 'PASS'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                            : r.status === 'NEEDS_REVIEW'
                            ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                            : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                        }`}
                      >
                        <span>{r.path}</span>
                        {r.findingsCount > 0 ? (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-black/10 dark:bg-white/10">
                            {r.findingsCount}
                          </span>
                        ) : (
                          <i className="fa-solid fa-check text-[10px] text-emerald-500"></i>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Filter Chips & AI Prompt Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-purple-50/60 dark:bg-purple-950/30 p-2.5 rounded-2xl border border-purple-200/80 dark:border-purple-800/50">
                {/* Filter Categories */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <button
                    onClick={() => setSelectedCategory('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === 'ALL'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/70 dark:border-slate-700'
                    }`}
                  >
                    ทุกหมวด ({report.totalFindings})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/70 dark:border-slate-700'
                      }`}
                    >
                      {cat} ({report.findings.filter(f => f.category === cat).length})
                    </button>
                  ))}
                </div>

                {/* ChatGPT AI Prompt Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyPrompt}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95"
                    title="คัดลอก Prompt สำหรับนำไปถาม ChatGPT ทันที"
                  >
                    <i className="fa-solid fa-copy"></i>
                    <span>คัดลอก Prompt ChatGPT</span>
                  </button>
                  
                  <button
                    onClick={() => setIsPromptModalOpen(true)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                    title="ดูเนื้อหา Prompt ก่อนคัดลอก"
                  >
                    <i className="fa-solid fa-robot text-purple-500"></i>
                    <span>ดู Prompt</span>
                  </button>
                </div>
              </div>

              {/* Findings List */}
              <div className="space-y-3">
                {filteredFindings.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <i className="fa-solid fa-circle-check text-4xl text-emerald-500 mb-2"></i>
                    <p className="font-semibold text-sm">ไม่พบข้อบกพร่องตามตัวกรองที่เลือก</p>
                  </div>
                ) : (
                  filteredFindings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-800 transition-all space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {finding.findingCode}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            finding.severity === 'CRITICAL' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900' :
                            finding.severity === 'HIGH' ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300 border border-orange-200 dark:border-orange-900' :
                            finding.severity === 'MEDIUM' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-900' :
                            finding.severity === 'LOW' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {finding.severity}
                          </span>
                          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                            [{finding.category}]
                          </span>
                          {finding.url && (
                            <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                              {finding.url}
                            </span>
                          )}
                        </div>
                        {finding.element && (
                          <span className="text-[11px] font-mono text-slate-400">
                            Element: &lt;{finding.element}&gt;
                          </span>
                        )}
                      </div>

                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                        {finding.title}
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {finding.description}
                      </p>

                      {(finding.expected || finding.actual) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                          {finding.actual && (
                            <div className="p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-300">
                              <span className="font-bold block text-[10px] uppercase text-rose-500">Actual (สิ่งที่พบ):</span>
                              <span className="font-mono">{finding.actual}</span>
                            </div>
                          )}
                          {finding.expected && (
                            <div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                              <span className="font-bold block text-[10px] uppercase text-emerald-500">Expected (ที่ถูกต้อง):</span>
                              <span className="font-mono">{finding.expected}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                        <i className="fa-solid fa-lightbulb text-amber-500 mt-0.5 shrink-0"></i>
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-200">ข้อเสนอแนะ: </span>
                          <span>{finding.recommendation}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-xs text-slate-500">
          <div>
            * ระบบ Inspector เป็นเครื่องมือตรวจวิเคราะห์เท่านั้น จะไม่มีการแก้ไข Source Code หรือฐานข้อมูลโดยอัตโนมัติ
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-semibold transition-all"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>

      {/* ChatGPT Prompt Preview Modal */}
      {isPromptModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-sm shadow-sm">
                  <i className="fa-solid fa-robot"></i>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    ChatGPT Prompt สำหรับแก้ไขปัญหา
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    คัดลอกข้อความด้านล่างไปวางใน ChatGPT หรือ AI เพื่อขอคำแนะนำและโค้ดตัวอย่างในการแก้ไข
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPromptModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <textarea
                readOnly
                value={generateAIPrompt()}
                rows={16}
                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none select-all"
              />
            </div>

            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
              <span className="text-xs text-slate-500">
                ความยาว: {generateAIPrompt().length} ตัวอักษร
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPromptModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-semibold"
                >
                  ปิด
                </button>
                <button
                  onClick={handleCopyPrompt}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                >
                  <i className="fa-solid fa-copy"></i>
                  <span>คัดลอก Prompt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
