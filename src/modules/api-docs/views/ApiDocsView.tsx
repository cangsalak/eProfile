'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ApiEndpointDoc, ApiInventorySummary } from '../lib/scanner';
import { generateCodeExample, SupportedLanguage } from '../lib/code-generator';
import { generateOpenApiSpec } from '../lib/openapi-generator';
import TablePagination from '@/components/common/TablePagination';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';
import {
  Button,
  Badge,
  Card,
  Modal,
  Input,
  Select,
  Textarea,
  Tabs,
} from '@/components/ui';

export default function ApiDocumentationPage() {
  const [report, setReport] = useState<ApiInventorySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedApi, setSelectedApi] = useState<ApiEndpointDoc | null>(null);

  // Modal active tab
  const [modalTab, setModalTab] = useState<'docs' | 'code' | 'playground'>('docs');

  // Code Example states
  const [activeLang, setActiveLang] = useState<SupportedLanguage>('curl');
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('http://localhost:3000');

  // Playground state
  const [playAuthType, setPlayAuthType] = useState<'session' | 'apikey'>('session');
  const [playApiKey, setPlayApiKey] = useState('');
  const [playPathParams, setPlayPathParams] = useState<Record<string, string>>({});
  const [playQueryParams, setPlayQueryParams] = useState<Record<string, string>>({});
  const [playBody, setPlayBody] = useState('');
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [playResponse, setPlayResponse] = useState<{
    status: number;
    statusText: string;
    durationMs: number;
    headers: Record<string, string>;
    data: any;
    error?: string;
  } | null>(null);

  // Pagination states synced with system settings (default: 20)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL || window.location.origin);
    }
  }, []);

  // When selectedApi changes, initialize Playground states
  useEffect(() => {
    if (selectedApi) {
      setModalTab('docs');
      setPlayResponse(null);

      // Initialize path params
      const initPathParams: Record<string, string> = {};
      selectedApi.pathParams.forEach((p) => {
        initPathParams[p.name] = '';
      });
      setPlayPathParams(initPathParams);

      // Initialize query params
      const initQueryParams: Record<string, string> = {};
      selectedApi.queryParams.forEach((q) => {
        initQueryParams[q.name] = '';
      });
      setPlayQueryParams(initQueryParams);

      // Initialize body
      if (selectedApi.requestBody?.sample) {
        setPlayBody(JSON.stringify(selectedApi.requestBody.sample, null, 2));
      } else {
        setPlayBody('');
      }
    }
  }, [selectedApi]);

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
      const res = await fetch('/api/modules/api-docs');
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
      const res = await fetch('/api/modules/api-docs');
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

  const handleExportOpenApi = () => {
    if (!report) return;
    const openApiData = generateOpenApiSpec(report, baseUrl);
    const blob = new Blob([JSON.stringify(openApiData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eprofile-openapi-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('ดาวน์โหลด OpenAPI 3.0 (Swagger) สำเร็จ');
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

  // Execute Live Test in Playground
  const handleExecuteTest = async () => {
    if (!selectedApi) return;
    setIsTestingApi(true);
    setPlayResponse(null);

    // Build URL with path parameters
    let targetUrl = selectedApi.endpoint;
    for (const [key, val] of Object.entries(playPathParams)) {
      if (val) {
        targetUrl = targetUrl.replace(`:${key}`, encodeURIComponent(val)).replace(`[${key}]`, encodeURIComponent(val));
      }
    }

    // Append query parameters
    const queryEntries = Object.entries(playQueryParams).filter(([_, v]) => v.trim() !== '');
    if (queryEntries.length > 0) {
      const searchParams = new URLSearchParams();
      queryEntries.forEach(([k, v]) => searchParams.append(k, v));
      targetUrl += `?${searchParams.toString()}`;
    }

    // Build Headers
    const headers: Record<string, string> = {};
    if (['POST', 'PUT', 'PATCH'].includes(selectedApi.method)) {
      headers['Content-Type'] = 'application/json';
    }

    if (playAuthType === 'apikey' && playApiKey.trim()) {
      headers['x-api-key'] = playApiKey.trim();
    }

    const startTime = performance.now();

    try {
      const reqOptions: RequestInit = {
        method: selectedApi.method,
        headers,
      };

      if (['POST', 'PUT', 'PATCH'].includes(selectedApi.method) && playBody.trim()) {
        try {
          JSON.parse(playBody); // validate JSON
          reqOptions.body = playBody;
        } catch {
          throw new Error('รูปแบบ JSON Request Body ไม่ถูกต้อง (Invalid JSON Syntax)');
        }
      }

      const res = await fetch(targetUrl, reqOptions);
      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        resHeaders[k] = v;
      });

      let resData: any = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        resData = await res.json().catch(() => null);
      } else {
        resData = await res.text().catch(() => '');
      }

      setPlayResponse({
        status: res.status,
        statusText: res.statusText || (res.status === 200 ? 'OK' : 'Error'),
        durationMs,
        headers: resHeaders,
        data: resData,
      });

      if (res.ok) {
        toast.success(`ส่งคำขอสำเร็จ (${res.status} ใน ${durationMs}ms)`);
      } else {
        toast.error(`เซิร์ฟเวอร์ตอบกลับรหัส ${res.status}`);
      }
    } catch (err: any) {
      const endTime = performance.now();
      setPlayResponse({
        status: 0,
        statusText: 'Client Error',
        durationMs: Math.round(endTime - startTime),
        headers: {},
        data: null,
        error: err.message || 'เกิดข้อผิดพลาดในการส่งคำขอ',
      });
      toast.error(err.message || 'ส่งคำขอล้มเหลว');
    } finally {
      setIsTestingApi(false);
    }
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

  const renderMethodBadge = (method: string) => {
    switch (method) {
      case 'GET':
        return <Badge variant="info">{method}</Badge>;
      case 'POST':
        return <Badge variant="success">{method}</Badge>;
      case 'PUT':
      case 'PATCH':
        return <Badge variant="warning">{method}</Badge>;
      case 'DELETE':
        return <Badge variant="danger">{method}</Badge>;
      default:
        return <Badge variant="neutral">{method}</Badge>;
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETE':
        return <Badge variant="success" dot>COMPLETE</Badge>;
      case 'PARTIAL':
        return <Badge variant="warning" dot>PARTIAL</Badge>;
      default:
        return <Badge variant="neutral" dot>UNDOCUMENTED</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in font-prompt">
      {/* Sub-menu Navigation & Actions in Theme Header */}
      <PageHeaderExtra>
        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-menu Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <Link
              href="/modules/api-docs"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs flex items-center gap-1.5 border border-slate-200/80 dark:border-slate-700"
            >
              <i className="fa-solid fa-book text-[11px]" />
              <span>เอกสาร API (API Docs)</span>
            </Link>
            <Link
              href="/modules/api-docs/tokens"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50 border border-transparent transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-key text-[11px]" />
              <span>จัดการ API Tokens</span>
            </Link>
          </div>

          {/* Quick Actions */}
          <Button
            variant="primary"
            size="sm"
            icon="fa-solid fa-rotate"
            isLoading={isScanning}
            loadingText="กำลังสแกน..."
            onClick={handleRescan}
            disabled={isLoading}
          >
            สแกน API ใหม่
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon="fa-solid fa-cloud-arrow-down"
            onClick={handleExportOpenApi}
            disabled={!report}
            title="ดาวน์โหลด OpenAPI 3.0 / Swagger JSON"
          >
            OpenAPI (Swagger)
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon="fa-solid fa-file-code"
            onClick={handleExportJson}
            disabled={!report}
            title="ดาวน์โหลดเป็น JSON"
          >
            JSON
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon="fa-solid fa-file-lines"
            onClick={handleExportMarkdown}
            disabled={!report}
            title="ดาวน์โหลดเป็น Markdown"
          >
            Markdown
          </Button>
        </div>
      </PageHeaderExtra>

      {/* KPI Stats Cards */}
      {report && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <Card padding="sm">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">API ทั้งหมด</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{report.totalApis}</div>
            <div className="text-[11px] text-slate-400 mt-1">ในระบบ eProfile</div>
          </Card>
          <Card padding="sm">
            <div className="text-xs font-semibold text-sky-600 dark:text-sky-400 mb-1">GET</div>
            <div className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">{report.methodCounts.GET}</div>
            <div className="text-[11px] text-slate-400 mt-1">Query / Fetch</div>
          </Card>
          <Card padding="sm">
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">POST</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{report.methodCounts.POST}</div>
            <div className="text-[11px] text-slate-400 mt-1">Create / Actions</div>
          </Card>
          <Card padding="sm">
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">PUT / PATCH</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {report.methodCounts.PUT + (report.methodCounts.PATCH || 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Update / Modify</div>
          </Card>
          <Card padding="sm">
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">DELETE</div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{report.methodCounts.DELETE}</div>
            <div className="text-[11px] text-slate-400 mt-1">Remove / Purge</div>
          </Card>
          <Card padding="sm">
            <div className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1">สถานะ Complete</div>
            <div className="text-2xl font-black text-primary-600 dark:text-primary-400 font-mono">{report.statusCounts.COMPLETE}</div>
            <div className="text-[11px] text-slate-400 mt-1">พร้อมตัวอย่างโค้ด</div>
          </Card>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card padding="sm">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1">
            <Input
              icon="fa-solid fa-magnifying-glass"
              placeholder="ค้นหาตาม Endpoint, Method, คำอธิบาย, หมวดหมู่, สิทธิ์ หรือไฟล์ต้นทาง..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-52">
            <Select
              icon="fa-solid fa-folder"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: 'ALL', label: `📁 ทุกหมวดหมู่ (${report?.totalApis || 0})` },
                ...categories.map((c) => ({
                  value: c,
                  label: `${c} (${report?.categoryCounts[c] || 0})`,
                })),
              ]}
            />
          </div>

          {/* Method Filter */}
          <div className="w-full md:w-36">
            <Select
              icon="fa-solid fa-bolt"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              options={[
                { value: 'ALL', label: '⚡ ทุก Method' },
                { value: 'GET', label: 'GET' },
                { value: 'POST', label: 'POST' },
                { value: 'PUT', label: 'PUT' },
                { value: 'PATCH', label: 'PATCH' },
                { value: 'DELETE', label: 'DELETE' },
              ]}
            />
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-40">
            <Select
              icon="fa-solid fa-list-check"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: 'ALL', label: '📋 ทุกสถานะ' },
                { value: 'COMPLETE', label: '🟢 COMPLETE' },
                { value: 'PARTIAL', label: '🟡 PARTIAL' },
                { value: 'UNDOCUMENTED', label: '🔴 UNDOCUMENTED' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <Card padding="none" className="overflow-hidden flex flex-col">
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
                    <i className="fa-solid fa-circle-notch fa-spin text-2xl text-primary-500" />
                    <p className="text-xs">กำลังวิเคราะห์และสแกน API ทั้งหมดในโปรเจค...</p>
                  </td>
                </tr>
              ) : currentApis.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 space-y-2">
                    <i className="fa-regular fa-folder-open text-3xl opacity-40" />
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
                      {renderMethodBadge(api.method)}
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
                          <i className="fa-solid fa-lock text-[10px]" /> Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                          <i className="fa-solid fa-lock-open text-[10px]" /> Public
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                      {api.permission ? (
                        <span className="px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-semibold border border-primary-100 dark:border-primary-900/60">
                          {api.permission}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {renderStatusBadge(api.status)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="secondary"
                        size="xs"
                        icon="fa-solid fa-bolt"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApi(api);
                        }}
                      >
                        ดูข้อมูล & ทดสอบ
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Standardized Table Pagination */}
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
      </Card>

      {/* API Detail, Code Generator & Live Playground Modal */}
      {selectedApi && (
        <Modal
          isOpen={!!selectedApi}
          onClose={() => setSelectedApi(null)}
          size="xl"
          title={
            <div className="flex items-center gap-2">
              {renderMethodBadge(selectedApi.method)}
              <span className="font-mono text-slate-900 dark:text-white text-base">{selectedApi.endpoint}</span>
            </div>
          }
          subtitle={`หมวดหมู่: ${selectedApi.category} • ไฟล์: ${selectedApi.sourceFile}:${selectedApi.handlerLineNumber || 1}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-slate-400">
                {selectedApi.authGuard}
              </div>
              <Button variant="secondary" onClick={() => setSelectedApi(null)}>
                ปิดหน้าต่าง
              </Button>
            </div>
          }
        >
          <div className="space-y-5 text-xs text-slate-600 dark:text-slate-300">
            {/* Modal Navigation Tabs */}
            <Tabs
              tabs={[
                { id: 'docs', label: 'รายละเอียด & สิทธิ์ (Docs & Auth)', icon: 'fa-solid fa-book-open' },
                { id: 'code', label: 'ตัวอย่างโค้ด 5 ภาษา (Code Snippets)', icon: 'fa-solid fa-laptop-code' },
                { id: 'playground', label: '⚡ ทดสอบเรียกใช้งาน (API Playground)', icon: 'fa-solid fa-bolt' },
              ]}
              activeTab={modalTab}
              onChange={(id) => setModalTab(id as any)}
            />

            {/* ============================================================ */}
            {/* TAB 1: DOCS & AUTH MATRIX */}
            {/* ============================================================ */}
            {modalTab === 'docs' && (
              <div className="space-y-5">
                {/* Description & Purpose */}
                <div className="p-4 rounded-2xl bg-primary-50/40 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedApi.description}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">วัตถุประสงค์: </span>
                    {selectedApi.purpose}
                  </p>
                </div>

                {/* Authentication & Role Access Matrix */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <i className="fa-solid fa-shield-halved text-primary-600 dark:text-primary-400" /> สิทธิ์และการเข้าถึง (Authorization Matrix)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase">Authentication Guard</div>
                      <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {selectedApi.authGuard}
                      </div>
                      {selectedApi.permission && (
                        <div className="text-xs text-primary-600 dark:text-primary-400 font-semibold pt-1">
                          Permission Required: <code className="bg-primary-50 dark:bg-primary-950 px-1 py-0.5 rounded">{selectedApi.permission}</code>
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
                      <i className="fa-solid fa-sliders text-primary-600 dark:text-primary-400" /> Parameters
                    </h4>

                    {selectedApi.pathParams.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="font-bold text-slate-500 text-[11px]">Path Parameters</div>
                        <div className="grid grid-cols-1 gap-1.5">
                          {selectedApi.pathParams.map((p) => (
                            <div key={p.name} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                              <div>
                                <code className="font-mono font-bold text-primary-600 dark:text-primary-400">[{p.name}]</code>
                                <span className="text-slate-400 text-[11px] ml-2">({p.type})</span>
                                <p className="text-[11px] text-slate-500 mt-0.5">{p.description}</p>
                              </div>
                              <Badge variant="danger">Required</Badge>
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
                                <code className="font-mono font-bold text-sky-600 dark:text-sky-400">?{p.name}=</code>
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
                      <i className="fa-solid fa-code text-primary-600 dark:text-primary-400" /> Request Body (Payload Schema)
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
                    <i className="fa-solid fa-reply text-primary-600 dark:text-primary-400" /> Responses & Status Codes
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
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 2: CODE GENERATOR (5 LANGUAGES) */}
            {/* ============================================================ */}
            {modalTab === 'code' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    เลือกภาษาสำหรับคัดลอกโค้ดตัวอย่าง
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Base URL:</span>
                    <input
                      type="text"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[10px] w-48 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500"
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
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            activeLang === lang
                              ? 'bg-primary-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {lang === 'curl' ? 'cURL' : lang === 'javascript' ? 'JavaScript' : lang === 'typescript' ? 'TypeScript' : lang === 'python' ? 'Python' : 'PHP'}
                        </button>
                      ))}
                    </div>

                    <Button
                      variant="secondary"
                      size="xs"
                      icon={copied ? 'fa-solid fa-check text-emerald-400' : 'fa-regular fa-copy'}
                      onClick={() => handleCopyCode(generateCodeExample(selectedApi, activeLang, baseUrl))}
                    >
                      {copied ? 'Copied' : 'Copy Code'}
                    </Button>
                  </div>

                  {/* Code Snippet Box */}
                  <pre className="p-4 text-emerald-400 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre">
                    {generateCodeExample(selectedApi, activeLang, baseUrl)}
                  </pre>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 3: LIVE API PLAYGROUND (TRY IT OUT) */}
            {/* ============================================================ */}
            {modalTab === 'playground' && (
              <div className="space-y-4">
                {/* Configuration Bar */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">โหมดการยืนยันตัวตน:</span>
                      <div className="inline-flex rounded-xl bg-slate-200/80 dark:bg-slate-700/80 p-0.5">
                        <button
                          type="button"
                          onClick={() => setPlayAuthType('session')}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                            playAuthType === 'session'
                              ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          Session Cookie (สิทธิ์ปัจจุบัน)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlayAuthType('apikey')}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                            playAuthType === 'apikey'
                              ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          API Key Token
                        </button>
                      </div>
                    </div>
                  </div>

                  {playAuthType === 'apikey' && (
                    <Input
                      label="API Key Token (ep_live_...)"
                      placeholder="ep_live_xxxxxxxxxxxxxxxxxxxxxxxx"
                      value={playApiKey}
                      onChange={(e) => setPlayApiKey(e.target.value)}
                      icon="fa-solid fa-key"
                    />
                  )}
                </div>

                {/* Parameters Inputs */}
                {selectedApi.pathParams.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300">Path Parameters:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedApi.pathParams.map((p) => (
                        <Input
                          key={p.name}
                          label={`:${p.name} (${p.type})`}
                          placeholder={p.description || `ระบุ ${p.name}`}
                          value={playPathParams[p.name] || ''}
                          onChange={(e) => setPlayPathParams({ ...playPathParams, [p.name]: e.target.value })}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedApi.queryParams.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300">Query Parameters:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedApi.queryParams.map((q) => (
                        <Input
                          key={q.name}
                          label={`?${q.name} (${q.type})`}
                          placeholder={q.description || `ค่าของ ${q.name}`}
                          value={playQueryParams[q.name] || ''}
                          onChange={(e) => setPlayQueryParams({ ...playQueryParams, [q.name]: e.target.value })}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Request Body Input for POST/PUT/PATCH */}
                {['POST', 'PUT', 'PATCH'].includes(selectedApi.method) && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-slate-700 dark:text-slate-300">JSON Request Body:</span>
                      {selectedApi.requestBody?.sample && (
                        <button
                          type="button"
                          onClick={() => setPlayBody(JSON.stringify(selectedApi.requestBody?.sample || {}, null, 2))}
                          className="text-[11px] text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                        >
                          คืนค่าตัวอย่างเริ่มต้น
                        </button>
                      )}
                    </div>
                    <Textarea
                      rows={5}
                      value={playBody}
                      onChange={(e) => setPlayBody(e.target.value)}
                      placeholder={'{\n  "key": "value"\n}'}
                      className="font-mono text-xs"
                    />
                  </div>
                )}

                {/* Execute Button */}
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    icon="fa-solid fa-paper-plane"
                    isLoading={isTestingApi}
                    loadingText="กำลังส่งคำขอทดสอบ..."
                    onClick={handleExecuteTest}
                  >
                    ส่งคำขอทดสอบ (Send Live Request)
                  </Button>
                </div>

                {/* Response Display Box */}
                {playResponse && (
                  <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-md animate-fade-in">
                    {/* Response Header Info */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-600 dark:text-slate-300">Status:</span>
                        <Badge variant={playResponse.status >= 200 && playResponse.status < 300 ? 'success' : 'danger'} dot>
                          {playResponse.status} {playResponse.statusText}
                        </Badge>
                        <span className="text-[11px] text-slate-400 ml-2">
                          <i className="fa-solid fa-stopwatch mr-1" />
                          {playResponse.durationMs} ms
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="xs"
                        icon="fa-regular fa-copy"
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(playResponse.data, null, 2));
                          toast.success('คัดลอก Response JSON แล้ว');
                        }}
                      >
                        Copy Response
                      </Button>
                    </div>

                    {/* Response Body */}
                    <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs leading-relaxed max-h-72 overflow-y-auto overflow-x-auto whitespace-pre">
                      {playResponse.error
                        ? `Error: ${playResponse.error}`
                        : typeof playResponse.data === 'object'
                        ? JSON.stringify(playResponse.data, null, 2)
                        : playResponse.data || '(Empty Body)'}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
