'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, Badge, Button } from '@/components/ui';
import {
  Code2,
  Key,
  Download,
  ExternalLink,
  RefreshCw,
  Layers,
  ShieldCheck,
  FileCode,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  Sliders,
  Terminal,
  Zap,
} from 'lucide-react';
import { generateOpenApiSpec } from '../lib/openapi-generator';
import type { ApiInventorySummary } from '../lib/scanner';
import toast from 'react-hot-toast';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPreview: string;
  role: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

type TabType = 'inventory' | 'tokens' | 'openapi';

export default function ApiDocsWidget() {
  const [report, setReport] = useState<ApiInventorySummary | null>(null);
  const [tokens, setTokens] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [copiedCurl, setCopiedCurl] = useState(false);

  const fetchApiData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [docsRes, tokensRes] = await Promise.all([
        fetch('/api/modules/api-docs'),
        fetch('/api/modules/api-docs/tokens'),
      ]);

      if (docsRes.ok) {
        const dJson = await docsRes.json();
        if (dJson.success && dJson.data) {
          setReport(dJson.data);
        }
      }

      if (tokensRes.ok) {
        const tJson = await tokensRes.json();
        if (tJson.success && Array.isArray(tJson.data)) {
          setTokens(tJson.data);
        }
      }
    } catch (err) {
      console.error('Failed to load API Docs widget data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchApiData();
  }, [fetchApiData]);

  const activeTokensCount = useMemo(() => {
    return tokens.filter((t) => t.status === 'ACTIVE').length;
  }, [tokens]);

  const handleDownloadOpenApi = () => {
    if (!report?.apis || report.apis.length === 0) {
      toast.error('ไม่มีข้อมูล Endpoints สำหรับสร้าง OpenAPI Spec');
      return;
    }

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const spec = generateOpenApiSpec(report, origin);
      const jsonStr = JSON.stringify(spec, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eprofile-openapi-spec-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('ดาวน์โหลด OpenAPI 3.0 Spec เรียบร้อยแล้ว');
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการสร้าง OpenAPI Spec');
    }
  };

  const copySampleCurl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const curl = `curl -X GET "${origin}/api/personnel" \\\n  -H "Authorization: Bearer <YOUR_API_TOKEN>" \\\n  -H "Accept: application/json"`;
    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    toast.success('คัดลอก cURL คำสั่งตัวอย่างแล้ว');
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const methodCounts: Record<string, number> = report?.methodCounts || {
    GET: 0,
    POST: 0,
    PUT: 0,
    PATCH: 0,
    DELETE: 0,
  };
  const totalEndpoints = report?.totalApis || report?.apis?.length || 0;

  return (
    <Card variant="convex" className="h-full flex flex-col min-h-[400px] font-prompt">
      {/* Header */}
      <CardHeader
        title="ศูนย์กลาง API &amp; นักพัฒนา"
        subtitle="สรุปภาพรวม Endpoints, OpenAPI และโทเค็นเชื่อมต่อภายนอก"
        icon={<Code2 className="w-5 h-5 text-white" />}
        action={
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fetchApiData(true)}
              disabled={refreshing || loading}
              title="รีเฟรชข้อมูล"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary-500' : ''}`} />
            </button>
            <Link
              href="/modules/api-docs"
              title="เปิดเอกสาร API เต็มจอ"
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        }
      />

      <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-4">
        {/* KPI Stat Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Total Endpoints */}
          <div className="p-2.5 rounded-xl bg-primary-50/70 dark:bg-primary-950/30 border border-primary-200/60 dark:border-primary-900/50 text-center">
            <span className="block text-[10px] font-bold text-primary-700 dark:text-primary-300">
              Endpoints ในระบบ
            </span>
            <span className="text-base sm:text-lg font-black text-primary-700 dark:text-primary-300 font-mono">
              {loading ? '...' : `${totalEndpoints} เส้น`}
            </span>
          </div>

          {/* Active Tokens */}
          <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 text-center">
            <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              โทเค็นที่เปิดใช้งาน
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {loading ? '...' : `${activeTokensCount} คีย์`}
            </span>
          </div>

          {/* OpenAPI Spec */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
            <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">
              มาตรฐานสเปก
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono block mt-0.5">
              OpenAPI 3.0
            </span>
          </div>

          {/* Auth Security */}
          <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 text-center">
            <span className="block text-[10px] font-bold text-blue-600 dark:text-blue-400">
              การยืนยันสิทธิ์
            </span>
            <span className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 block mt-0.5">
              Bearer / RBAC
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>สถิติ Endpoints</span>
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'tokens'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>โทเค็นภายนอก</span>
            {tokens.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary-500 text-white font-bold">
                {tokens.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('openapi')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'openapi'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>OpenAPI &amp; Tools</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col justify-between">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              <span className="text-xs">กำลังสแกน Endpoints ในระบบ...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: INVENTORY & METHODS */}
              {activeTab === 'inventory' && (
                <div className="space-y-3">
                  {/* Method Pills */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-2 rounded-xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/60 text-center">
                      <span className="block text-[10px] font-black text-sky-700 dark:text-sky-300 font-mono">
                        GET
                      </span>
                      <span className="text-sm font-black text-sky-800 dark:text-sky-200 font-mono">
                        {methodCounts['GET'] || 0}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-center">
                      <span className="block text-[10px] font-black text-emerald-700 dark:text-emerald-300 font-mono">
                        POST
                      </span>
                      <span className="text-sm font-black text-emerald-800 dark:text-emerald-200 font-mono">
                        {methodCounts['POST'] || 0}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 text-center">
                      <span className="block text-[10px] font-black text-amber-700 dark:text-amber-300 font-mono">
                        PUT
                      </span>
                      <span className="text-sm font-black text-amber-800 dark:text-amber-200 font-mono">
                        {methodCounts['PUT'] || 0}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/60 text-center">
                      <span className="block text-[10px] font-black text-rose-700 dark:text-rose-300 font-mono">
                        DELETE
                      </span>
                      <span className="text-sm font-black text-rose-800 dark:text-rose-200 font-mono">
                        {methodCounts['DELETE'] || 0}
                      </span>
                    </div>
                  </div>

                  {/* Modules Coverage preview */}
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      โมดูลระบบที่เปิดให้บริการ REST API:
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {Object.entries(report?.categoryCounts || {})
                        .slice(0, 6)
                        .map(([cat, count]) => (
                          <span
                            key={cat}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-medium"
                          >
                            <span className="capitalize">{cat}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({count})</span>
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: API TOKENS */}
              {activeTab === 'tokens' && (
                <div className="space-y-2">
                  {tokens.length === 0 ? (
                    <div className="py-7 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800">
                      <Key className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        ยังไม่มีการออก API Token สำหรับเชื่อมต่อภายนอก
                      </p>
                      <Link href="/modules/api-docs/tokens">
                        <span className="text-[11px] text-primary-600 dark:text-primary-400 font-semibold hover:underline inline-block mt-1">
                          + สร้าง API Token แรกของคุณ
                        </span>
                      </Link>
                    </div>
                  ) : (
                    tokens.slice(0, 3).map((token) => (
                      <div
                        key={token.id}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 group hover:border-primary-300 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Key className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                              {token.name}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                              <span>{token.keyPreview}</span>
                              <span>•</span>
                              <span>สิทธิ์: {token.role}</span>
                            </div>
                          </div>
                        </div>

                        <Badge
                          variant={token.status === 'ACTIVE' ? 'success' : 'neutral'}
                          size="sm"
                          className="text-[10px]"
                        >
                          {token.status === 'ACTIVE' ? 'เปิดใช้งาน' : 'ระงับชั่วคราว'}
                        </Badge>
                      </div>
                    ))
                  )}

                  {tokens.length > 3 && (
                    <p className="text-[10px] text-slate-400 text-center pt-1">
                      แสดง 3 รายการล่าสุด จากทั้งหมด {tokens.length} โทเค็น
                    </p>
                  )}
                </div>
              )}

              {/* TAB 3: OPENAPI & TOOLS */}
              {activeTab === 'openapi' && (
                <div className="space-y-2.5 text-xs">
                  {/* OpenAPI Download Box */}
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        OpenAPI 3.0 Specification (JSON)
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                        นำเข้าสู่ Postman, Insomnia, หรือ Swagger UI เพื่อทดสอบระบบได้ทันที
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs shrink-0"
                      onClick={handleDownloadOpenApi}
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      OpenAPI Spec
                    </Button>
                  </div>

                  {/* cURL Snippet */}
                  <div className="p-3 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 space-y-1.5 font-mono text-[11px] relative">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                      <span className="flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-emerald-400" />
                        cURL Authorization Example
                      </span>
                      <button
                        onClick={copySampleCurl}
                        className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        {copiedCurl ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">คัดลอกแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>คัดลอก</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-slate-300 overflow-x-auto whitespace-pre pt-1 text-[10px]">
                      curl -X GET &quot;{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/personnel&quot; \
                      {'\n'}  -H &quot;Authorization: Bearer &lt;TOKEN&gt;&quot;
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-auto">
            <Link href="/modules/api-docs" className="flex-1">
              <Button variant="primary" size="sm" className="w-full text-xs">
                <Code2 className="w-3.5 h-3.5 mr-1.5" />
                เอกสาร API เต็มรูปแบบ
              </Button>
            </Link>
            <Link href="/modules/api-docs/tokens" className="shrink-0">
              <Button variant="outline" size="sm" className="text-xs">
                <Key className="w-3.5 h-3.5 mr-1.5" />
                จัดการ Tokens
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
