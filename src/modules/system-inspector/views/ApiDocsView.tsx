'use client';

import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { ApiEndpointDoc, ApiInventorySummary } from '@/lib/api-docs/scanner';
import { generateCodeExample, SupportedLanguage } from '@/lib/api-docs/code-generator';
import TablePagination from '@/components/common/TablePagination';

export default function ApiDocumentationPage() {
  const [report, setReport] = useState<ApiInventorySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedApi, setSelectedApi] = useState<ApiEndpointDoc | null>(null);

  // Code Example states
  const [activeLang, setActiveLang] = useState<SupportedLanguage>('curl');
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('http://localhost:3000');

  // Pagination states synced with system settings (default: 20)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL || window.location.origin);
    }
  }, []);

  const fetchApiDocsAndSettings = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch system settings for defaultPageSize
      try {
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          if (settings.defaultPageSize) {
            setPageSize(Number(settings.defaultPageSize));
          }
        }
      } catch (err) {
        console.warn('Could not fetch defaultPageSize from settings:', err);
      }

      // 2. Fetch API documentation catalog
      const res = await fetch('/api/admin/api-docs');
      if (res.ok) {
        const json = await res.json();
        setReport(json.data);
      } else if (res.status === 403) {
        toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะ SUPER_ADMIN เท่านั้น)');
      } else {
        toast.error('ไม่สามารถโหลดเอกสาร API ได้');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRescan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/admin/api-docs');
      if (res.ok) {
        const json = await res.json();
        setReport(json.data);
        setPage(1);
        toast.success(`สแกน API สำเร็จ (${json.data.totalApis} endpoints ใน ${json.data.durationMs}ms)`);
      }
    } catch {
      toast.error('สแกนล้มเหลว');
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    fetchApiDocsAndSettings();
  }, []);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, selectedMethod, selectedStatus, pageSize]);

  const handleExportJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eprofile-api-docs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('ดาวน์โหลด JSON สำเร็จ');
  };

  const handleExportMarkdown = () => {
    if (!report) return;
    let md = `# 🔌 eProfile API Documentation / API Reference (v1.2.0)\n\n`;
    md += `> **วันที่สแกน**: ${new Date(report.scannedAt).toLocaleString('th-TH')} | **จำนวน API ทั้งหมด**: ${report.totalApis} endpoints\n\n`;
    md += `## สรุปจำนวน API ตาม Method\n\n`;
    md += `| Method | จำนวน |\n|---|---|\n`;
    Object.entries(report.methodCounts).forEach(([m, count]) => {
      md += `| ${m} | ${count} |\n`;
    });
    md += `\n## รายการ Endpoint ทั้งหมด\n\n`;
    report.apis.forEach((api) => {
      md += `### [${api.method}] ${api.endpoint}\n`;
      md += `- **หมวดหมู่**: ${api.category}\n`;
      md += `- **คำอธิบาย**: ${api.description}\n`;
      md += `- **วัตถุประสงค์**: ${api.purpose}\n`;
      md += `- **สิทธิ์**: ${api.permission || 'ไม่ต้องระบุ permission พิเศษ'} (Auth: ${api.authRequired ? 'Required' : 'Public'})\n`;
      md += `- **ไฟล์ต้นฉบับ**: \`${api.sourceFile}:${api.handlerLineNumber || 1}\`\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eprofile-api-docs-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    toast.success('ดาวน์โหลด Markdown สำเร็จ');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('คัดลอกโค้ดตัวอย่างแล้ว');
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered APIs
  const filteredApis = useMemo(() => {
    if (!report?.apis) return [];
    return report.apis.filter((api) => {
      const matchSearch =
        api.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (api.permission && api.permission.toLowerCase().includes(searchQuery.toLowerCase())) ||
        api.sourceFile.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === 'ALL' || api.category === selectedCategory;
      const matchMethod = selectedMethod === 'ALL' || api.method === selectedMethod;
      const matchStatus = selectedStatus === 'ALL' || api.status === selectedStatus;

      return matchSearch && matchCategory && matchMethod && matchStatus;
    });
  }, [report, searchQuery, selectedCategory, selectedMethod, selectedStatus]);

  // Categories list
  const categories = useMemo(() => {
    if (!report?.apis) return [];
    const cats = new Set<string>();
    report.apis.forEach((a) => cats.add(a.category));
    return Array.from(cats).sort();
  }, [report]);

  // Client-side pagination calculation on the filtered APIs
  const totalItems = filteredApis.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const indexOfFirstItem = (currentPage - 1) * pageSize;
  const indexOfLastItem = Math.min(indexOfFirstItem + pageSize, totalItems);
  const currentApis = filteredApis.slice(indexOfFirstItem, indexOfLastItem);

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
      case 'POST':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'PUT':
      case 'PATCH':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      case 'DELETE':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> COMPLETE
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> PARTIAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> UNDOCUMENTED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in font-prompt">
      
      {/* Header Banner - Unified Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary-100/60 via-primary-50/40 to-transparent dark:from-primary-950/40 dark:via-primary-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-80 pointer-events-none"></div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start space-x-5">
            <div className="hidden sm:flex shrink-0 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl items-center justify-center shadow-lg shadow-primary-500/25 text-white text-2xl font-bold">
              <i className="fa-solid fa-code-fork"></i>
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-900/60 rounded-full text-xs font-semibold text-primary-700 dark:text-primary-300 mb-3">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                <span>eProfile API Reference (DocuSeal-style Interactive Docs)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                API Documentation & Integration
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
                เอกสารอ้างอิง API สมบูรณ์แบบ ค้นหา Endpoint ตรวจสอบ Role Access Matrix และตัวอย่าง Code สำหรับนำไปเชื่อมต่อใช้งานจริง (cURL, JavaScript, TypeScript, Python, PHP)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={handleRescan}
              disabled={isScanning || isLoading}
              className="flex-1 md:flex-none px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <i className={`fa-solid fa-rotate ${isScanning ? 'animate-spin' : ''}`}></i>
              <span>{isScanning ? 'กำลังสแกน...' : 'สแกน API ใหม่'}</span>
            </button>
            <button
              onClick={handleExportJson}
              disabled={!report}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="ดาวน์โหลดเป็น JSON"
            >
              <i className="fa-solid fa-file-code text-primary-600 dark:text-primary-400"></i>
              <span>JSON</span>
            </button>
            <button
              onClick={handleExportMarkdown}
              disabled={!report}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="ดาวน์โหลดเป็น Markdown"
            >
              <i className="fa-solid fa-file-lines text-slate-600 dark:text-slate-400"></i>
              <span>Markdown</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {report && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">API ทั้งหมด</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{report.totalApis}</div>
            <div className="text-[11px] text-slate-400 mt-1">ในระบบ eProfile</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">GET</div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">{report.methodCounts.GET}</div>
            <div className="text-[11px] text-slate-400 mt-1">Query / Fetch</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">POST</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{report.methodCounts.POST}</div>
            <div className="text-[11px] text-slate-400 mt-1">Create / Actions</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">PUT / PATCH</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {report.methodCounts.PUT + (report.methodCounts.PATCH || 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Update / Modify</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">DELETE</div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{report.methodCounts.DELETE}</div>
            <div className="text-[11px] text-slate-400 mt-1">Remove / Purge</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1">สถานะ Complete</div>
            <div className="text-2xl font-black text-primary-600 dark:text-primary-400 font-mono">{report.statusCounts.COMPLETE}</div>
            <div className="text-[11px] text-slate-400 mt-1">พร้อมตัวอย่างโค้ด</div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <label htmlFor="api-search-input" className="sr-only">ค้นหา API</label>
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              id="api-search-input"
              aria-label="ค้นหาตาม Endpoint, Method, คำอธิบาย, หมวดหมู่, สิทธิ์ หรือไฟล์ต้นทาง"
              type="text"
              placeholder="ค้นหาตาม Endpoint, Method, คำอธิบาย, หมวดหมู่, สิทธิ์ หรือไฟล์ต้นทาง..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-52">
            <select
              aria-label="เลือกหมวดหมู่ API"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="ALL">📁 ทุกหมวดหมู่ ({report?.totalApis || 0})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c} ({report?.categoryCounts[c] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Method Filter */}
          <div className="w-full md:w-36">
            <select
              aria-label="เลือก HTTP Method"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="ALL">⚡ ทุก Method</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-40">
            <select
              aria-label="เลือกสถานะเอกสาร"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="ALL">📋 ทุกสถานะ</option>
              <option value="COMPLETE">🟢 COMPLETE</option>
              <option value="PARTIAL">🟡 PARTIAL</option>
              <option value="UNDOCUMENTED">🔴 UNDOCUMENTED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/40">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            รายการ API ทั้งหมด ({filteredApis.length} รายการที่ตรงกับเงื่อนไข)
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/80 uppercase font-bold tracking-wider sticky top-0 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Method</th>
                <th className="py-3 px-4">Endpoint</th>
                <th className="py-3 px-4 whitespace-nowrap">หมวดหมู่</th>
                <th className="py-3 px-4">คำอธิบาย</th>
                <th className="py-3 px-4 whitespace-nowrap text-center">Authentication</th>
                <th className="py-3 px-4 whitespace-nowrap">Permission</th>
                <th className="py-3 px-4 whitespace-nowrap text-center">สถานะ</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 space-y-2">
                    <i className="fa-solid fa-circle-notch fa-spin text-2xl text-indigo-500"></i>
                    <p className="text-xs">กำลังวิเคราะห์และสแกน API ทั้งหมดในโปรเจค...</p>
                  </td>
                </tr>
              ) : currentApis.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 space-y-2">
                    <i className="fa-regular fa-folder-open text-3xl opacity-40"></i>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">ไม่พบ API ที่ตรงกับเงื่อนไขการค้นหา</p>
                  </td>
                </tr>
              ) : (
                currentApis.map((api) => (
                  <tr
                    key={api.id}
                    onClick={() => setSelectedApi(api)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border font-mono ${getMethodBadge(api.method)}`}>
                        {api.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {api.endpoint}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {api.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 min-w-[200px] max-w-[320px] truncate text-slate-600 dark:text-slate-400">
                      {api.description}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {api.authRequired ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <i className="fa-solid fa-lock text-[10px]"></i> Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                          <i className="fa-solid fa-lock-open text-[10px]"></i> Public
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                      {api.permission ? (
                        <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-100 dark:border-indigo-900/60">
                          {api.permission}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(api.status)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApi(api);
                        }}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs font-bold transition-colors"
                      >
                        ดูตัวอย่างโค้ด & รายละเอียด
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Standardized eProfile Table Pagination */}
        <TablePagination
          isLoading={isLoading}
          totalItems={totalItems}
          indexOfFirstItem={indexOfFirstItem}
          indexOfLastItem={indexOfLastItem}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          unitName="รายการ"
          setPageSize={setPageSize}
          setCurrentPage={setPage}
        />
      </div>

      {/* DocuSeal-Style API Detail & Code Integration Drawer / Modal */}
      {selectedApi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-lg text-xs font-black border font-mono ${getMethodBadge(selectedApi.method)}`}>
                  {selectedApi.method}
                </span>
                <div>
                  <h3 className="text-base font-bold font-mono text-slate-900 dark:text-white">
                    {selectedApi.endpoint}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    หมวดหมู่: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedApi.category}</span> • ไฟล์: <span className="font-mono text-[11px]">{selectedApi.sourceFile}:{selectedApi.handlerLineNumber || 1}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApi(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
                aria-label="ปิดหน้าต่าง"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-600 dark:text-slate-300">
              
              {/* Description & Purpose */}
              <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedApi.description}
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">วัตถุประสงค์: </span>
                  {selectedApi.purpose}
                </p>
              </div>

              {/* Interactive Multi-Language Code Example Box */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <i className="fa-solid fa-laptop-code text-indigo-600"></i> ตัวอย่างโค้ดสำหรับนำไปเชื่อมต่อใช้งานจริง (Code Integration)
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <label htmlFor="base-url-input" className="font-medium text-slate-600 dark:text-slate-400">Base URL:</label>
                    <input
                      id="base-url-input"
                      aria-label="กำหนด Base URL สำหรับตัวอย่างโค้ด"
                      type="text"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[10px] w-48 text-slate-800 dark:text-slate-200"
                      placeholder="http://localhost:3000"
                    />
                  </div>
                </div>

                {/* Code Window */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
                  {/* Language Selector Tabs */}
                  <div className="flex justify-between items-center px-4 py-2.5 bg-slate-900 border-b border-slate-800">
                    <div className="flex items-center gap-1">
                      {(['curl', 'javascript', 'typescript', 'python', 'php'] as SupportedLanguage[]).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setActiveLang(lang)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            activeLang === lang
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {lang === 'curl' ? 'cURL' : lang === 'javascript' ? 'JavaScript' : lang === 'typescript' ? 'TypeScript' : lang === 'python' ? 'Python' : 'PHP'}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handleCopyCode(generateCodeExample(selectedApi, activeLang, baseUrl))}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                      aria-label={`Copy ${activeLang} example`}
                    >
                      {copied ? (
                        <>
                          <i className="fa-solid fa-check text-emerald-400"></i>
                          <span className="text-emerald-400 font-bold">✓ Copied</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-regular fa-copy"></i>
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Code Snippet Box */}
                  <pre className="p-4 text-emerald-400 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre">
                    {generateCodeExample(selectedApi, activeLang, baseUrl)}
                  </pre>
                </div>
              </div>

              {/* Authentication & Role Access Matrix */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-indigo-600"></i> สิทธิ์และการเข้าถึง (Authorization Matrix)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Authentication Guard</div>
                    <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {selectedApi.authGuard}
                    </div>
                    {selectedApi.permission && (
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold pt-1">
                        Permission Required: <code className="bg-indigo-50 dark:bg-indigo-950 px-1 py-0.5 rounded">{selectedApi.permission}</code>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Audit Logging & Rate Limit</div>
                    <div className="text-xs">
                      Audit Log: <span className="font-bold text-slate-900 dark:text-white">{selectedApi.auditLogEnabled ? '✅ บันทึกประวัติ' : '❌ ไม่มี'}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Rate Limit: {selectedApi.rateLimit || 'Not configured'}
                    </div>
                  </div>
                </div>

                {/* Role Matrix Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-center text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 font-bold text-[11px]">
                      <tr>
                        <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">ANONYMOUS</th>
                        <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">USER</th>
                        <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">OFFICER</th>
                        <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">EDITOR</th>
                        <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">ADMIN</th>
                        <th className="py-2 px-3">SUPER_ADMIN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-x divide-slate-200 dark:divide-slate-800">
                      <tr>
                        <td className="py-2.5 px-3 font-bold">{selectedApi.roleMatrix.anonymous ? '✅ 200' : '❌ 401'}</td>
                        <td className="py-2.5 px-3 font-bold">{selectedApi.roleMatrix.user ? '✅ 200' : '❌ 403'}</td>
                        <td className="py-2.5 px-3 font-bold">{selectedApi.roleMatrix.officer ? '✅ 200' : '❌ 403'}</td>
                        <td className="py-2.5 px-3 font-bold">{selectedApi.roleMatrix.editor ? '✅ 200' : '❌ 403'}</td>
                        <td className="py-2.5 px-3 font-bold">{selectedApi.roleMatrix.admin ? '✅ 200' : '❌ 403'}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600">✅ 200</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Parameters */}
              {(selectedApi.pathParams.length > 0 || selectedApi.queryParams.length > 0) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <i className="fa-solid fa-sliders text-indigo-600"></i> Parameters
                  </h4>

                  {selectedApi.pathParams.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="font-bold text-slate-500 text-[11px]">Path Parameters</div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {selectedApi.pathParams.map((p) => (
                          <div key={p.name} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <div>
                              <code className="font-mono font-bold text-purple-600 dark:text-purple-400">[{p.name}]</code>
                              <span className="text-slate-400 text-[11px] ml-2">({p.type})</span>
                              <p className="text-[11px] text-slate-500 mt-0.5">{p.description}</p>
                            </div>
                            <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-600 text-[10px] font-bold rounded">
                              Required
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedApi.queryParams.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="font-bold text-slate-500 text-[11px]">Query Parameters</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {selectedApi.queryParams.map((p) => (
                          <div key={p.name} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center">
                              <code className="font-mono font-bold text-blue-600 dark:text-blue-400">?{p.name}=</code>
                              <span className="text-slate-400 text-[10px]">Optional ({p.type})</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">{p.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Request Body */}
              {selectedApi.requestBody && selectedApi.requestBody.hasBody && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <i className="fa-solid fa-code text-indigo-600"></i> Request Body (Payload Schema)
                  </h4>
                  <p className="text-slate-500">{selectedApi.requestBody.description}</p>
                  {selectedApi.requestBody.sample && (
                    <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
                      {JSON.stringify(selectedApi.requestBody.sample, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              {/* Responses & Errors */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-reply text-indigo-600"></i> Responses & Status Codes
                </h4>
                <div className="space-y-1.5">
                  {selectedApi.responses.map((r, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          r.status < 300 ? 'bg-emerald-500 text-white' : r.status < 500 ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                        }`}>
                          {r.status}
                        </span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{r.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sensitive Fields Protection */}
              {selectedApi.sensitiveFieldsDetected.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <i className="fa-solid fa-triangle-exclamation"></i> การป้องกันข้อมูลความลับ (Sensitive Fields Protection)
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    ฟังก์ชันนี้มีการประมวลผลฟิลด์ความปลอดภัย ({selectedApi.sensitiveFieldsDetected.join(', ')}) โดยระบบจะ Redact รหัสผ่านและ JWT Token ออกจาก Response สาธารณะตามนโยบายความปลอดภัย
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-xs">
              <span className="text-slate-400">
                Source: {selectedApi.sourceFile}:{selectedApi.handlerLineNumber || 1}
              </span>
              <button
                onClick={() => setSelectedApi(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-semibold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
