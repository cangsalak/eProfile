'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, Badge, Button } from '@/components/ui';
import {
  Activity,
  Database,
  Clock,
  Cpu,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Server,
  Layers,
  History,
  CheckCircle2,
  AlertTriangle,
  Lock,
  FileCheck2,
  Loader2,
} from 'lucide-react';

interface SystemHealthData {
  status: 'healthy' | 'degraded';
  app?: string;
  version?: string;
  versionLabel?: string;
  nodeVersion?: string;
  pid?: number;
  timestamp?: string;
  db?: {
    status: string;
    latencyMs: number;
  };
  system?: {
    uptimeSeconds: number;
    memoryMB: number;
    heapUsedMB: number;
    heapTotalMB: number;
    externalMB: number;
  };
  backup?: {
    count: number;
    lastBackup: string | null;
  };
}

interface AuditLogItem {
  id: string;
  action: string;
  entity?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
  personnel?: {
    firstName: string;
    lastName: string;
    username: string;
    prefix?: string;
  } | null;
}

type TabType = 'runtime' | 'audit' | 'security';

export default function InspectorStatusWidget() {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [totalModules, setTotalModules] = useState<number>(0);
  const [enabledModules, setEnabledModules] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('runtime');

  const fetchInspectorData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [healthRes, auditRes, modulesRes] = await Promise.all([
        fetch('/api/modules/inspector/health'),
        fetch('/api/modules/inspector/audit-logs?limit=4'),
        fetch('/api/modules/inspector/modules'),
      ]);

      if (healthRes.ok) {
        const hJson = await healthRes.json();
        setHealth(hJson);
      }

      if (auditRes.ok) {
        const aJson = await auditRes.json();
        if (Array.isArray(aJson.logs)) {
          setAuditLogs(aJson.logs);
        } else if (Array.isArray(aJson.data)) {
          setAuditLogs(aJson.data);
        }
      }

      if (modulesRes.ok) {
        const mJson = await modulesRes.json();
        if (mJson.stats) {
          setTotalModules(mJson.stats.totalModules || 0);
          setEnabledModules(mJson.stats.enabledCount || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load Inspector widget data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInspectorData();
  }, [fetchInspectorData]);

  const isHealthy = health?.status === 'healthy';
  const uptimeSeconds = health?.system?.uptimeSeconds || 0;

  const formattedUptime = useMemo(() => {
    if (!uptimeSeconds) return '0 นาที';
    const d = Math.floor(uptimeSeconds / (3600 * 24));
    const h = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((uptimeSeconds % 3600) / 60);

    const parts = [];
    if (d > 0) parts.push(`${d} วัน`);
    if (h > 0) parts.push(`${h} ชม.`);
    if (m > 0 || parts.length === 0) parts.push(`${m} นาที`);
    return parts.join(' ');
  }, [uptimeSeconds]);

  const memoryPercent = useMemo(() => {
    if (!health?.system?.heapUsedMB || !health?.system?.heapTotalMB) return 0;
    return Math.min(100, Math.round((health.system.heapUsedMB / health.system.heapTotalMB) * 100));
  }, [health]);

  const getActionBadgeVariant = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('LOGIN') || act.includes('AUTH')) return 'primary';
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('INSTALL')) return 'success';
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('CHANGE')) return 'warning';
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('CLEAR')) return 'danger';
    return 'neutral';
  };

  return (
    <Card variant="convex" className="h-full flex flex-col min-h-[420px] font-prompt">
      {/* Header */}
      <CardHeader
        title="สถานะระบบ &amp; วินิจฉัย Runtime"
        subtitle="มอนิเตอร์ฐานข้อมูล Uptime ทรัพยากร และ Audit Logs แบบ Real-time"
        icon={<Activity className="w-5 h-5 text-white" />}
        action={
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fetchInspectorData(true)}
              disabled={refreshing || loading}
              title="รีเฟรชข้อมูลสถานะ"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary-500' : ''}`} />
            </button>
            <Link
              href="/modules/inspector"
              title="เปิด System Inspector เต็มรูปแบบ"
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
          {/* Health Status */}
          <div
            className={`p-2.5 rounded-xl border text-center transition-all ${
              isHealthy
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-900/50'
                : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-900/50'
            }`}
          >
            <span className="block text-[10px] font-bold text-slate-600 dark:text-slate-400">
              สถานะภาพรวม
            </span>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isHealthy ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-rose-500 shadow-sm shadow-rose-500/50'
                } animate-pulse`}
              />
              <span
                className={`text-xs sm:text-sm font-black ${
                  isHealthy ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                }`}
              >
                {loading ? '...' : isHealthy ? 'พร้อมใช้งาน' : 'มีข้อขัดข้อง'}
              </span>
            </div>
          </div>

          {/* Database Latency */}
          <div className="p-2.5 rounded-xl bg-primary-50/70 dark:bg-primary-950/30 border border-primary-200/60 dark:border-primary-900/50 text-center">
            <span className="block text-[10px] font-bold text-primary-700 dark:text-primary-300">
              ฐานข้อมูล (Ping)
            </span>
            <span className="text-sm sm:text-base font-black text-primary-700 dark:text-primary-300 font-mono block mt-0.5">
              {loading ? '...' : `${health?.db?.latencyMs ?? 0} ms`}
            </span>
          </div>

          {/* Uptime */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
            <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">
              เวลาทำงาน (Uptime)
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 block mt-0.5 truncate">
              {loading ? '...' : formattedUptime}
            </span>
          </div>

          {/* Memory Heap */}
          <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 text-center">
            <span className="block text-[10px] font-bold text-blue-600 dark:text-blue-400">
              Node.js Memory
            </span>
            <span className="text-sm sm:text-base font-black text-blue-600 dark:text-blue-400 font-mono block mt-0.5">
              {loading ? '...' : `${health?.system?.heapUsedMB ?? 0} MB`}
            </span>
          </div>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('runtime')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'runtime'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>ทรัพยากร Runtime</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>บันทึกการใช้งานล่าสุด</span>
            {auditLogs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                {auditLogs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ความปลอดภัย &amp; โมดูล</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col justify-between">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              <span className="text-xs">กำลังตรวจสอบสถานะระบบ Runtime...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: RUNTIME & RESOURCES */}
              {activeTab === 'runtime' && (
                <div className="space-y-3">
                  {/* Memory Progress Bar */}
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-primary-500" />
                        หน่วยความจำ Heap (Node.js)
                      </span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">
                        {health?.system?.heapUsedMB ?? 0} / {health?.system?.heapTotalMB ?? 0} MB ({memoryPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          memoryPercent > 80
                            ? 'bg-rose-500'
                            : memoryPercent > 60
                            ? 'bg-amber-500'
                            : 'bg-primary-500'
                        }`}
                        style={{ width: `${memoryPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* System details grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold block">Node.js Runtime</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block truncate">
                        {health?.nodeVersion || process.version} (PID: {health?.pid ?? '-'})
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold block">สถานะฐานข้อมูล</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {health?.db?.status === 'connected' ? 'Connected (ปกติ)' : health?.db?.status || 'Active'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold block">จุดสำรองข้อมูล</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                        {health?.backup?.count ?? 0} ชุดสำรอง
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold block">RSS Memory รวม</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                        {health?.system?.memoryMB ?? 0} MB
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AUDIT LOGS */}
              {activeTab === 'audit' && (
                <div className="space-y-2">
                  {auditLogs.length === 0 ? (
                    <div className="py-7 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800">
                      <History className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        ยังไม่มีบันทึก Audit Logs ในระบบ
                      </p>
                    </div>
                  ) : (
                    auditLogs.slice(0, 4).map((log) => {
                      const userName = log.personnel
                        ? `${log.personnel.prefix || ''}${log.personnel.firstName} ${log.personnel.lastName}`.trim()
                        : log.ipAddress || 'ระบบอัตโนมัติ';

                      return (
                        <div
                          key={log.id}
                          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Badge
                              variant={getActionBadgeVariant(log.action)}
                              size="sm"
                              className="text-[9px] px-1.5 py-0.5 shrink-0"
                            >
                              {log.action}
                            </Badge>
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                                {userName}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {log.details || log.entity || 'กิจกรรมในระบบ'}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {new Date(log.createdAt).toLocaleTimeString('th-TH', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono block">
                              {log.ipAddress ? `IP: ${log.ipAddress}` : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}

                  <div className="pt-1 text-center">
                    <Link href="/modules/inspector/audit-logs">
                      <span className="text-[11px] text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                        ดูประวัติการใช้งานทั้งหมดใน Audit Logs &rarr;
                      </span>
                    </Link>
                  </div>
                </div>
              )}

              {/* TAB 3: SECURITY & MODULES */}
              {activeTab === 'security' && (
                <div className="space-y-2.5 text-xs">
                  {/* Modules status card */}
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          สถานะโมดูลของระบบ
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          เปิดใช้งาน {enabledModules} จาก {totalModules} โมดูล
                        </span>
                      </div>
                    </div>

                    <Badge variant="primary" size="sm" className="font-mono">
                      {Math.round((enabledModules / (totalModules || 1)) * 100)}% Active
                    </Badge>
                  </div>

                  {/* Security Posture Checklist */}
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                      การคุ้มครองตามเกณฑ์ความปลอดภัย AGENTS.md:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Zero Secret Leakage</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Anti-Data Loss Guard</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">RBAC 8 Roles Matrix</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Audit Logging Enabled</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-auto">
            <Link href="/modules/inspector" className="flex-1">
              <Button variant="primary" size="sm" className="w-full text-xs">
                <Activity className="w-3.5 h-3.5 mr-1.5" />
                หน้าหลัก Inspector
              </Button>
            </Link>
            <Link href="/modules/inspector/audit-logs" className="shrink-0">
              <Button variant="outline" size="sm" className="text-xs">
                <History className="w-3.5 h-3.5 mr-1.5" />
                Audit Logs
              </Button>
            </Link>
            <Link href="/modules/inspector/checklist" className="shrink-0">
              <Button variant="secondary" size="sm" className="text-xs">
                <FileCheck2 className="w-3.5 h-3.5 mr-1.5" />
                Checklist
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
