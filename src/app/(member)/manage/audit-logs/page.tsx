'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import TablePagination from '@/components/common/TablePagination';

interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  details: string;
  ipAddress?: string | null;
  createdAt: string;
  personnel?: {
    prefix?: string;
    firstName: string;
    lastName: string;
    username: string;
  } | null;
}

interface AuditStats {
  total: number;
  loginCount: number;
  createCount: number;
  changeCount: number;
}

export default function ManageAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<AuditStats>({
    total: 0,
    loginCount: 0,
    createCount: 0,
    changeCount: 0,
  });

  // Prompt Modal state
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  // Load system defaultPageSize setting on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const settings = await res.json();
          if (settings.defaultPageSize) {
            const size = parseInt(settings.defaultPageSize, 10);
            if (!isNaN(size) && size > 0) {
              setPageSize(size);
            }
          }
        }
      } catch (err) {
        console.warn('Could not load defaultPageSize from settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
      });

      if (debouncedSearch) params.set('search', debouncedSearch);
      if (actionFilter && actionFilter !== 'ALL') params.set('action', actionFilter);

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setLogs(json.data);
          setTotalItems(json.pagination?.total || 0);
          setTotalPages(json.pagination?.totalPages || 1);
          if (json.stats) {
            setStats(json.stats);
          }
        } else if (Array.isArray(json)) {
          setLogs(json);
          setTotalItems(json.length);
          setTotalPages(1);
        }
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Export functions
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      toast.loading('กำลังจัดเตรียมไฟล์ CSV...', { id: 'export-toast' });

      // Fetch all logs or large batch for export
      const params = new URLSearchParams({
        page: '1',
        limit: '500',
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (actionFilter && actionFilter !== 'ALL') params.set('action', actionFilter);

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลเพื่อส่งออกได้');
      const json = await res.json();
      const exportData: AuditLogItem[] = json.data || logs;

      // Build CSV with UTF-8 BOM
      const headers = ['วันที่-เวลา (CreatedAt)', 'IP Address', 'ผู้ดำเนินการ (User)', 'ชื่อผู้ใช้ (Username)', 'ประเภทกิจกรรม (Action)', 'โมดูล (Entity)', 'รายละเอียด (Details)'];
      const rows = exportData.map((item) => {
        const dateStr = new Date(item.createdAt).toLocaleString('th-TH');
        const ip = `"${(item.ipAddress || '-').replace(/"/g, '""')}"`;
        const user = item.personnel ? `${item.personnel.prefix || ''} ${item.personnel.firstName} ${item.personnel.lastName}`.trim() : 'System';
        const username = item.personnel?.username || 'system';
        const action = `"${(item.action || '').replace(/"/g, '""')}"`;
        const entity = `"${(item.entity || '').replace(/"/g, '""')}"`;
        const details = `"${(item.details || '').replace(/"/g, '""')}"`;
        return [dateStr, ip, `"${user}"`, `"${username}"`, action, entity, details].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`ส่งออก CSV สำเร็จ (${exportData.length} รายการ)`, { id: 'export-toast' });
    } catch (err: any) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการส่งออก CSV', { id: 'export-toast' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      toast.loading('กำลังจัดเตรียมไฟล์ JSON...', { id: 'export-toast' });

      const params = new URLSearchParams({ page: '1', limit: '500' });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (actionFilter && actionFilter !== 'ALL') params.set('action', actionFilter);

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลเพื่อส่งออกได้');
      const json = await res.json();
      const exportData = json.data || logs;

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`ส่งออก JSON สำเร็จ (${exportData.length} รายการ)`, { id: 'export-toast' });
    } catch (err: any) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการส่งออก JSON', { id: 'export-toast' });
    } finally {
      setIsExporting(false);
    }
  };

  // Generate ChatGPT Analysis Prompt
  const generateChatGPTPrompt = () => {
    let prompt = `# 🛡️ บันทึกกิจกรรมระบบ (Audit Logs) สำหรับวิเคราะห์ความปลอดภัยและข้อผิดพลาด (eProfile System)\n\n`;
    prompt += `## ข้อมูลระบบ:\n`;
    prompt += `- **โครงการ**: eProfile System (Next.js 14 App Router, TypeScript, Prisma ORM, SQLite)\n`;
    prompt += `- **เวลาที่สร้างรายงาน**: ${new Date().toLocaleString('th-TH')}\n`;
    prompt += `- **จำนวนบันทึกทั้งหมดในระบบ**: ${stats.total.toLocaleString()} รายการ\n`;
    prompt += `- **สถิติภาพรวม**: การเข้าสู่ระบบ (LOGIN): ${stats.loginCount}, สร้างข้อมูล (CREATE): ${stats.createCount}, แก้ไข/ลบ (CHANGE): ${stats.changeCount}\n\n`;

    prompt += `## ตัวอย่างรายการบันทึกล่าสุด (${logs.length} รายการ):\n\n`;
    prompt += `| ลำดับ | วันที่-เวลา | IP Address | ผู้ดำเนินการ | ประเภท (Action) | โมดูล (Entity) | รายละเอียด (Details) |\n`;
    prompt += `|---|---|---|---|---|---|---|\n`;

    logs.slice(0, 30).forEach((item, idx) => {
      const dateStr = new Date(item.createdAt).toLocaleString('th-TH');
      const ip = item.ipAddress || '-';
      const user = item.personnel ? `${item.personnel.prefix || ''} ${item.personnel.firstName} ${item.personnel.lastName}`.trim() : 'System';
      const action = item.action || '-';
      const entity = item.entity || '-';
      const details = (item.details || '-').replace(/\|/g, '\\|').replace(/\n/g, ' ');
      prompt += `| ${idx + 1} | ${dateStr} | \`${ip}\` | ${user} | \`${action}\` | \`${entity}\` | ${details} |\n`;
    });

    prompt += `\n## 🎯 คำขอสำหรับการวิเคราะห์ใน ChatGPT / AI Assistant:\n`;
    prompt += `1. **ตรวจจับความผิดปกติ (Anomaly & Threat Detection)**: ตรวจสอบว่ามีพฤติกรรมผิดปกติ เช่น การเข้าสู่ระบบล้มเหลวต่อเนื่อง, การลบข้อมูลสำคัญ, หรือความพยายามเข้าถึงส่วนที่ไม่ได้รับอนุญาตหรือไม่\n`;
    prompt += `2. **วิเคราะห์ข้อผิดพลาดและสาเหตุ (Root Cause Analysis)**: วิเคราะห์ว่ามีโมดูล (Entity) ใดที่มีความถี่ในการเกิดความผิดพลาดหรือข้อผิดพลาดซ้ำๆ และส่งผลกระทบต่อความสมบูรณ์ของข้อมูลอย่างไร\n`;
    prompt += `3. **ข้อเสนอแนะด้านความมั่นคงปลอดภัย (Security & Audit Recommendations)**: แนะนำขั้นตอนการปรับปรุงความปลอดภัย, การตรวจสอบสิทธิ์ (RBAC), การตั้งค่า Rate Limiting และแนวทางการบันทึก Log ที่ดีขึ้น\n`;

    return prompt;
  };

  const handleCopyPrompt = () => {
    const prompt = generateChatGPTPrompt();
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    toast.success('คัดลอก Prompt สำหรับ ChatGPT เรียบร้อยแล้ว!');
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            CREATE
          </span>
        );
      case 'UPDATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            UPDATE
          </span>
        );
      case 'DELETE':
      case 'DELETE_INSPECTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 rounded-lg text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            DELETE
          </span>
        );
      case 'LOGIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 rounded-lg text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            LOGIN
          </span>
        );
      case 'INSPECT_PAGE':
      case 'CHANGE_FINDING_STATUS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 rounded-lg text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            {action}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium">
            {action}
          </span>
        );
    }
  };

  const indexOfFirstItem = (currentPage - 1) * pageSize;
  const indexOfLastItem = indexOfFirstItem + logs.length;

  return (
    <div className="pb-12 max-w-7xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            <i className="fa-solid fa-shield-halved"></i>
            <span>Security & Compliance</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            บันทึกกิจกรรมระบบ (Audit Logs)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            ติดตามและตรวจสอบประวัติการใช้งาน การเข้าสู่ระบบ และการแก้ไขข้อมูลในระบบ
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* ChatGPT AI Prompt Buttons */}
          <div className="flex items-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-0.5 shadow-md shadow-emerald-500/20">
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="px-3.5 py-2 text-white text-xs font-bold hover:bg-white/10 rounded-l-[10px] transition-all flex items-center gap-2"
              title="คัดลอก Prompt สำหรับนำไปวิเคราะห์ใน ChatGPT ทันที"
            >
              <i className="fa-solid fa-robot"></i>
              <span>Prompt ChatGPT</span>
            </button>
            <div className="h-4 w-px bg-white/30"></div>
            <button
              type="button"
              onClick={() => setIsPromptModalOpen(true)}
              className="px-2.5 py-2 text-white text-xs hover:bg-white/10 rounded-r-[10px] transition-all"
              title="ดูตัวอย่างเนื้อหา Prompt ก่อนคัดลอก"
            >
              <i className="fa-solid fa-eye"></i>
            </button>
          </div>

          {/* Export CSV & JSON */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={isExporting}
              className="px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all flex items-center gap-1.5"
              title="ส่งออกบันทึกเป็นไฟล์ Excel / CSV (รองรับภาษาไทย)"
            >
              <i className="fa-solid fa-file-csv text-emerald-500"></i>
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              disabled={isExporting}
              className="px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-bold rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all flex items-center gap-1.5"
              title="ส่งออกบันทึกเป็นไฟล์ JSON"
            >
              <i className="fa-solid fa-file-code text-blue-500"></i>
              <span>JSON</span>
            </button>
          </div>

          {/* Refresh & Settings */}
          <button
            type="button"
            onClick={fetchLogs}
            disabled={isLoading}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            title="รีเฟรชข้อมูล"
          >
            <i className={`fa-solid fa-rotate ${isLoading ? 'fa-spin' : ''}`}></i>
          </button>
          <Link
            href="/settings"
            className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            title="ตั้งค่าระบบ"
          >
            <i className="fa-solid fa-sliders"></i>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold mb-1">กิจกรรมทั้งหมดในระบบ</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.total.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-blue-500 font-semibold mb-1">การเข้าสู่ระบบ (LOGIN)</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {stats.loginCount.toLocaleString()}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-emerald-500 font-semibold mb-1">สร้างข้อมูล (CREATE)</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.createCount.toLocaleString()}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-amber-500 font-semibold mb-1">แก้ไข / ลบ (CHANGE)</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats.changeCount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <label htmlFor="auditSearchInput" className="sr-only">ค้นหาบันทึกกิจกรรม</label>
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            id="auditSearchInput"
            aria-label="ค้นหาตามชื่อผู้ใช้, ระบบ หรือรายละเอียด"
            type="text"
            placeholder="ค้นหาตามชื่อผู้ใช้, ตาราง/ระบบ หรือรายละเอียด..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>

        <div className="w-full sm:w-60">
          <label htmlFor="auditActionFilterSelect" className="sr-only">กรองตามประเภทกิจกรรม</label>
          <select
            id="auditActionFilterSelect"
            aria-label="เลือกประเภทกิจกรรมเพื่อกรอง"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
          >
            <option value="ALL">📁 ทุกกิจกรรม</option>
            <option value="LOGIN">🔵 เข้าสู่ระบบ (LOGIN)</option>
            <option value="CREATE">🟢 สร้างข้อมูล (CREATE)</option>
            <option value="UPDATE">🟡 แก้ไขข้อมูล (UPDATE)</option>
            <option value="DELETE">🔴 ลบข้อมูล (DELETE)</option>
            <option value="INSPECT_PAGE">🟣 ตรวจสอบระบบ (INSPECT)</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-16 text-center text-slate-500 dark:text-slate-400">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-3 text-indigo-500"></i>
            <p className="text-xs font-semibold">กำลังโหลดบันทึกกิจกรรม...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <i className="fa-solid fa-inbox text-xl"></i>
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">ไม่พบบันทึกกิจกรรม</p>
            <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองกิจกรรม</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                  <th className="px-5 py-3.5">วันที่-เวลา</th>
                  <th className="px-5 py-3.5">IP Address</th>
                  <th className="px-5 py-3.5">ผู้ดำเนินการ</th>
                  <th className="px-5 py-3.5">ประเภท (Action)</th>
                  <th className="px-5 py-3.5">โมดูล (Entity)</th>
                  <th className="px-5 py-3.5">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono">
                      {new Date(log.createdAt).toLocaleString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {log.ipAddress ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 font-mono text-[11px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <i className="fa-solid fa-network-wired text-[10px] text-slate-400"></i>
                          <span>{log.ipAddress}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {log.personnel ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black text-[10px]">
                            {log.personnel.firstName?.[0] || 'U'}
                          </div>
                          <span>
                            {log.personnel.prefix || ''} {log.personnel.firstName} {log.personnel.lastName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">System / อัตโนมัติ</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">{getActionBadge(log.action)}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {log.entity}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-[11px] max-w-sm truncate" title={log.details}>
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-Side Pagination Component */}
        <TablePagination
          isLoading={isLoading}
          totalItems={totalItems}
          indexOfFirstItem={indexOfFirstItem}
          indexOfLastItem={indexOfLastItem}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          unitName="รายการบันทึก"
          setPageSize={setPageSize}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {/* ChatGPT AI Prompt Preview Modal */}
      {isPromptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
                  <i className="fa-solid fa-robot"></i>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    ChatGPT Prompt สำหรับวิเคราะห์ Audit Logs & ข้อผิดพลาด
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    นำข้อความด้านล่างไปวางใน ChatGPT เพื่อวิเคราะห์ความผิดปกติ ความปลอดภัย หรือสาเหตุของ Error
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPromptModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 font-mono text-xs">
              <textarea
                readOnly
                rows={14}
                value={generateChatGPTPrompt()}
                className="w-full p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 text-xs font-mono leading-relaxed focus:outline-none resize-none selection:bg-emerald-500 selection:text-white"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                ความยาว: {generateChatGPTPrompt().length.toLocaleString()} ตัวอักษร
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPromptModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-all"
                >
                  ปิด
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCopyPrompt();
                    setIsPromptModalOpen(false);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-md shadow-emerald-500/20"
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
