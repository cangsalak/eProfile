'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Building2, 
  Award, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw 
} from 'lucide-react';

interface StatsSummary {
  total: number;
  active: number;
  inactive: number;
}

interface GroupCount {
  department?: string;
  type?: string;
  status?: string;
  count: number;
}

interface StatsData {
  summary: StatsSummary;
  byDepartment: GroupCount[];
  byPersonnelType: GroupCount[];
  byStatus: GroupCount[];
}

export default function PersonnelDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/personnel/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load personnel stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading && !stats) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-pulse mb-6">
        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
          <div className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
          <div className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const activePercent = stats.summary.total > 0 
    ? Math.round((stats.summary.active / stats.summary.total) * 100) 
    : 0;

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden mb-6 transition-all duration-300">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              ภาพรวมกำลังพล (Personnel Intelligence)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              สถิติสรุปภาพรวมและการกระจายตัวของกำลังพลในหน่วย
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            title="รีเฟรชสถิติ"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-5">
          {/* Top 3 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Total */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-slate-800/80 dark:to-slate-800/40 border border-blue-100 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">กำลังพลทั้งหมด</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                  {stats.summary.total.toLocaleString()} <span className="text-xs font-normal text-slate-500">นาย</span>
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Active */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-slate-800/80 dark:to-slate-800/40 border border-emerald-100 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">ปฏิบัติงานปกติ</p>
                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {stats.summary.active.toLocaleString()} <span className="text-xs font-normal text-slate-500">นาย ({activePercent}%)</span>
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Inactive / Others */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-slate-800/80 dark:to-slate-800/40 border border-amber-100 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">ไปช่วยราชการ / ลา / อื่นๆ</p>
                <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {stats.summary.inactive.toLocaleString()} <span className="text-xs font-normal text-slate-500">นาย</span>
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <UserX className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Breakdown Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* By Department */}
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-blue-500" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  จำแนกตามกอง / ฝ่าย / ส่วนราชการ
                </h4>
              </div>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 text-xs">
                {stats.byDepartment.length === 0 ? (
                  <p className="text-slate-400 py-2 text-center">ไม่มีข้อมูล</p>
                ) : (
                  stats.byDepartment.map((item, idx) => {
                    const percent = stats.summary.total > 0 ? Math.round((item.count / stats.summary.total) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                            {item.department}
                          </span>
                          <span className="text-slate-500 font-bold">{item.count} นาย ({percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* By Personnel Type */}
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-purple-500" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  จำแนกตามประเภทบุคลากร
                </h4>
              </div>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 text-xs">
                {stats.byPersonnelType.length === 0 ? (
                  <p className="text-slate-400 py-2 text-center">ไม่มีข้อมูล</p>
                ) : (
                  stats.byPersonnelType.map((item, idx) => {
                    const percent = stats.summary.total > 0 ? Math.round((item.count / stats.summary.total) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                            {item.type}
                          </span>
                          <span className="text-slate-500 font-bold">{item.count} นาย ({percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
