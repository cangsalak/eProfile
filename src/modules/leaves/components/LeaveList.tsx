'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import TablePagination from '@/components/common/TablePagination';
import ConfirmModal from '@/components/common/ConfirmModal';
import { Card, Badge } from '@/components/ui';
import { formatShortThaiDate } from '@/modules/core/lib/date-utils';
import DynamicLeaveForm from './DynamicLeaveForm';
import {
  Plus,
  FileSignature,
  Trash2,
  Edit,
  Printer,
  Check,
  CheckCircle,
  Clock,
  Ban,
} from 'lucide-react';

interface LeaveRecord {
  id: string;
  personnelId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
  writtenAt?: string;
  toPerson?: string;
  contactAddress?: string;
  contactTambon?: string;
  contactAmphoe?: string;
  contactProvince?: string;
  substitutePerson?: string;
  status: string;
  accumulatedLeaveDays?: number;
  thisYearLeaveDays?: number;
  totalLeaveDays?: number;
  ordainedBefore?: boolean;
  ordainTempleName?: string;
  ordainTempleLocation?: string;
  ordainDate?: string;
  stayTempleName?: string;
  stayTempleLocation?: string;
  maternityLeaveTimes?: number;
  maternityLeaveDays?: number;
  createdAt: string;
  personnel?: {
    prefix?: string;
    firstName: string;
    lastName: string;
    department?: string;
    subDepartment?: string;
  };
}

interface LeaveListProps {
  personnelId?: string;
  isAdmin?: boolean;
}

export default function LeaveList({ personnelId: propPersonnelId, isAdmin = false }: LeaveListProps) {
  const searchParams = useSearchParams();
  const typeParam = searchParams ? searchParams.get('type') : null;

  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [personnelId, setPersonnelId] = useState<string>(propPersonnelId || '');

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [editingLeaveId, setEditingLeaveId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    leaveType: 'ลากิจ',
    startDate: '',
    endDate: '',
    reason: '',
    writtenAt: 'บก.ศฝยว.ทบ.',
    toPerson: 'ผบ.ศฝยว.ทบ.',
    contactAddress: '',
    contactTambon: '',
    contactAmphoe: '',
    contactProvince: '',
    substitutePerson: '',
    accumulatedLeaveDays: 0,
    thisYearLeaveDays: 10,
    ordainedBefore: false,
    ordainTempleName: '',
    ordainTempleLocation: '',
    ordainDate: '',
    stayTempleName: '',
    stayTempleLocation: '',
    maternityLeaveTimes: 0,
    maternityLeaveDays: 0,
  });

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Pagination & Filtering State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  const fetchLeaves = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = '/api/leaves';
      const params = new URLSearchParams();
      if (personnelId) params.append('personnelId', personnelId);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      } else {
        toast.error('ไม่สามารถดึงข้อมูลประวัติแบบฟอร์มได้');
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsLoading(false);
    }
  }, [personnelId]);

  useEffect(() => {
    if (!personnelId) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setPersonnelId(user.id);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [personnelId]);

  useEffect(() => {
    if (personnelId) {
      fetchLeaves();
    }

    fetch('/api/settings')
      .then((res) => res.json())
      .then((settings) => {
        if (settings.defaultPageSize) {
          setPageSize(Number(settings.defaultPageSize));
        }
      })
      .catch(console.error);
  }, [personnelId, fetchLeaves]);

  useEffect(() => {
    if (typeParam) {
      setTimeout(() => {
        setIsAdding(true);
        setFormData((prev) => ({ ...prev, leaveType: decodeURIComponent(typeParam) }));
      }, 100);
    }
  }, [typeParam]);

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      const res = await fetch(`/api/leaves/${deleteTargetId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLeaves();
        toast.success('ลบรายการแบบฟอร์มเรียบร้อย');
      } else {
        toast.error('ไม่สามารถลบรายการได้');
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const getLeaveTypeVariant = (type: string) => {
    switch (type) {
      case 'ลากิจ':
        return 'primary' as const;
      case 'ลาป่วย':
        return 'danger' as const;
      case 'ลาพักผ่อน':
      case 'ลาพักผ่อนประจำปี':
        return 'success' as const;
      case 'ลาอุปสมบท':
        return 'warning' as const;
      default:
        return 'neutral' as const;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'รออนุมัติ':
      case 'ยื่นคำขอแล้ว':
      case 'บันทึกแล้ว':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
            <CheckCircle className="w-3 h-3 text-primary-500" />
            <span>ยื่นคำขอแล้ว</span>
          </span>
        );
      case 'อนุมัติแล้ว':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Check className="w-3 h-3" />
            <span>สมบูรณ์</span>
          </span>
        );
      case 'ยกเลิก':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20">
            <Ban className="w-3 h-3" />
            <span>ยกเลิก</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {status || 'ยื่นคำขอแล้ว'}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return formatShortThaiDate(dateString);
  };

  // Pagination calculation
  const totalItems = leaves.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const page = Math.min(currentPage, totalPages);
  const indexOfFirstItem = (page - 1) * pageSize;
  const indexOfLastItem = Math.min(indexOfFirstItem + pageSize, totalItems);
  const paginatedLeaves = leaves.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Card className="p-6 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileSignature className="w-5 h-5 text-primary-500" />
            <span>ประวัติการยื่นแบบฟอร์ม (e-Forms History)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            บันทึกประวัติการยื่นแบบฟอร์ม พิมพ์เอกสารราชการ และติดตามสถานะคำขอ
          </p>
        </div>

        {!isAdding && (
          <button
            type="button"
            onClick={() => {
              setEditingLeaveId(null);
              setIsAdding(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-primary-600 hover:bg-primary-700 shadow-sm shadow-primary-500/20 active:scale-[0.98] transition-all shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>ยื่นแบบฟอร์มใหม่</span>
          </button>
        )}
      </div>

      {/* Dynamic Document Template Form */}
      {isAdding && (
        <div className="animate-fade-in">
          <DynamicLeaveForm
            personnelId={personnelId}
            editingLeaveId={editingLeaveId}
            initialData={editingLeaveId ? formData : undefined}
            initialLeaveType={editingLeaveId ? formData.leaveType : (typeParam || "ลากิจ")}
            onClose={() => {
              setIsAdding(false);
              setEditingLeaveId(null);
            }}
            onSuccess={() => {
              setIsAdding(false);
              setEditingLeaveId(null);
              fetchLeaves();
            }}
          />
        </div>
      )}

      {/* Leave Records List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs">กำลังโหลดประวัติการยื่นแบบฟอร์ม...</p>
        </div>
      ) : leaves.length === 0 ? (
        <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <FileSignature className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
          <p className="font-semibold text-xs">ยังไม่มีประวัติการยื่นแบบฟอร์มในระบบ</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">ประเภทแบบฟอร์ม / เอกสาร</th>
                  <th className="px-4 py-3">ช่วงเวลา / วันที่</th>
                  <th className="px-4 py-3">เหตุผล / วัตถุประสงค์</th>
                  <th className="px-4 py-3 text-center">สถานะ</th>
                  <th className="px-4 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={getLeaveTypeVariant(leave.leaveType)}>
                        {leave.leaveType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" title={leave.reason}>
                      {leave.reason || '-'}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {getStatusBadge(leave.status)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingLeaveId(leave.id);
                            setFormData({
                              leaveType: leave.leaveType,
                              startDate: leave.startDate ? new Date(leave.startDate).toISOString().split('T')[0] : '',
                              endDate: leave.endDate ? new Date(leave.endDate).toISOString().split('T')[0] : '',
                              reason: leave.reason || '',
                              writtenAt: leave.writtenAt || '',
                              toPerson: leave.toPerson || '',
                              contactAddress: leave.contactAddress || '',
                              contactTambon: leave.contactTambon || '',
                              contactAmphoe: leave.contactAmphoe || '',
                              contactProvince: leave.contactProvince || '',
                              substitutePerson: leave.substitutePerson || '',
                              accumulatedLeaveDays: leave.accumulatedLeaveDays || 0,
                              thisYearLeaveDays: leave.thisYearLeaveDays || 10,
                              ordainedBefore: leave.ordainedBefore || false,
                              ordainTempleName: leave.ordainTempleName || '',
                              ordainTempleLocation: leave.ordainTempleLocation || '',
                              ordainDate: leave.ordainDate ? new Date(leave.ordainDate).toISOString().split('T')[0] : '',
                              stayTempleName: leave.stayTempleName || '',
                              stayTempleLocation: leave.stayTempleLocation || '',
                              maternityLeaveTimes: leave.maternityLeaveTimes || 0,
                              maternityLeaveDays: leave.maternityLeaveDays || 0,
                            });
                            setIsAdding(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg transition-colors"
                          title="แก้ไขรายการ"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <a
                          href={`/api/modules/leaves/${leave.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-500 hover:text-primary-600 bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/40 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                          title="พิมพ์เอกสาร (PDF)"
                        >
                          <Printer className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setDeleteTargetId(leave.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                          title="ลบรายการ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}

      {/* Styled Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="ยืนยันการลบแบบฟอร์มคำขอ?"
        message="คุณแน่ใจหรือไม่ที่จะลบรายการคำขอนี้? ข้อมูลที่ลบจะไม่สามารถกู้คืนได้"
        confirmText="ยืนยันการลบ"
        cancelText="ยกเลิก"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </Card>
  );
}
