'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import TablePagination from '@/components/common/TablePagination';
import ConfirmModal from '@/components/common/ConfirmModal';
import { Card, Button, Badge, Input, Select, DatePicker } from '@/components/ui';
import { formatShortThaiDate } from '@/modules/core/lib/date-utils';
import DynamicLeaveForm from './DynamicLeaveForm';
import {
  Calendar,
  CalendarCheck,
  Plus,
  FileText,
  Trash2,
  Edit,
  Printer,
  Check,
  CheckCircle,
  X,
  Ban,
  Clock,
  Send,
  Building,
  UserCheck,
  Compass,
} from 'lucide-react';

interface LeaveRecord {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  writtenAt: string;
  toPerson: string;
  contactAddress: string;
  contactTambon: string;
  contactAmphoe: string;
  contactProvince: string;
  status: string;
  createdAt: string;
  substitutePerson?: string;
  accumulatedLeaveDays?: number;
  thisYearLeaveDays?: number;
  ordainedBefore?: boolean;
  ordainTempleName?: string;
  ordainTempleLocation?: string;
  ordainDate?: string;
  stayTempleName?: string;
  stayTempleLocation?: string;
  maternityLeaveTimes?: number;
  maternityLeaveDays?: number;
}

export default function LeaveList({ personnelId, isAdmin = false }: { personnelId: string; isAdmin?: boolean }) {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLeaveId, setEditingLeaveId] = useState<string | null>(null);
  const [useDynamicForm, setUseDynamicForm] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [formData, setFormData] = useState<Partial<LeaveRecord>>({
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

  const [leaveTypesList, setLeaveTypesList] = useState<string[]>([
    'ลากิจ',
    'ลาป่วย',
    'ลาคลอดบุตร',
    'ลาพักผ่อนประจำปี',
    'ลาอุปสมบท',
    'ไปช่วยราชการ',
  ]);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const typeParam = searchParams ? searchParams.get('type') : null;

  const fetchPersonnelData = useCallback(async () => {
    try {
      const res = await fetch(`/api/personnel/${personnelId}`);
      if (res.ok) {
        const data = await res.json();
        const fullAddr = data.address || '';
        let defaultParsed = { address: '', tambon: '', amphoe: '', province: '' };

        if (fullAddr) {
          const tMatch = fullAddr.match(/ต\.\s*([^\s]+)|ตำบล\s*([^\s]+)/);
          const aMatch = fullAddr.match(/อ\.\s*([^\s]+)|อำเภอ\s*([^\s]+)/);
          const jMatch = fullAddr.match(/จ\.\s*([^\s]+)|จังหวัด\s*([^\s]+)/);

          defaultParsed = {
            address: fullAddr.split(/ต\.|ตำบล/)[0].trim() || fullAddr,
            tambon: tMatch ? tMatch[1] || tMatch[2] : '',
            amphoe: aMatch ? aMatch[1] || aMatch[2] : '',
            province: jMatch ? jMatch[1] || jMatch[2] : '',
          };
        }

        setFormData((prev) => ({
          ...prev,
          contactAddress: defaultParsed.address || prev.contactAddress,
          contactTambon: defaultParsed.tambon || prev.contactTambon,
          contactAmphoe: defaultParsed.amphoe || prev.contactAmphoe,
          contactProvince: defaultParsed.province || prev.contactProvince,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  }, [personnelId]);

  const fetchLeaves = useCallback(async () => {
    try {
      const res = await fetch(`/api/leaves?personnelId=${personnelId}`);
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [personnelId]);

  useEffect(() => {
    fetchPersonnelData();
    fetchLeaves();

    fetch('/api/settings')
      .then((res) => res.json())
      .then((settings) => {
        if (settings.defaultPageSize) {
          setPageSize(Number(settings.defaultPageSize));
        }
        if (settings.leaveTypes) {
          try {
            const parsed = JSON.parse(settings.leaveTypes);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setLeaveTypesList(parsed);
            }
          } catch (_) {}
        }
      })
      .catch(console.error);
  }, [personnelId, fetchPersonnelData, fetchLeaves]);

  useEffect(() => {
    if (typeParam) {
      setTimeout(() => {
        setIsAdding(true);
        setFormData((prev) => ({ ...prev, leaveType: decodeURIComponent(typeParam) }));
      }, 100);
    }
  }, [typeParam]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      toast.error('กรุณาระบุวันที่เริ่มต้นและสิ้นสุด');
      return;
    }

    try {
      const payload = {
        personnelId,
        ...formData,
      };

      const url = editingLeaveId ? `/api/leaves/${editingLeaveId}` : '/api/leaves';
      const method = editingLeaveId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingLeaveId ? 'อัปเดตข้อมูลสำเร็จ' : 'บันทึกข้อมูลสำเร็จ');
        setIsAdding(false);
        setEditingLeaveId(null);
        setFormData({
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
        fetchLeaves();
      } else {
        toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      const res = await fetch(`/api/leaves/${deleteTargetId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLeaves();
        toast.success('ลบประวัติการลาเรียบร้อย');
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
        return 'info' as const;
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
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const indexOfFirstItem = (currentPage - 1) * pageSize;
  const indexOfLastItem = Math.min(indexOfFirstItem + pageSize, totalItems);
  const paginatedLeaves = leaves.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Card className="p-6 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-primary-500" />
            <span>ประวัติการลา (Leave History)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            บันทึกคำขอลา พิมพ์ใบลา และติดตามสถานะการพิจารณา
          </p>
        </div>

        {!isAdding && (
          <Button
            variant="primary"
            onClick={() => {
              setEditingLeaveId(null);
              setIsAdding(true);
            }}
            className="flex items-center gap-2 shadow-sm shadow-primary-500/30"
          >
            <Plus className="w-4 h-4" />
            <span>ยื่นขอลาใหม่</span>
          </Button>
        )}
      </div>

      {/* Leave Application Form */}
      {isAdding && (
        useDynamicForm ? (
          <div className="space-y-2 animate-fade-in">
            <div className="flex justify-end pr-2">
              <button
                type="button"
                onClick={() => setUseDynamicForm(false)}
                className="text-[11px] text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 underline transition-colors"
              >
                สลับไปใช้แบบฟอร์มคลาสสิก (Classic Form)
              </button>
            </div>
            <DynamicLeaveForm
              personnelId={personnelId}
              editingLeaveId={editingLeaveId}
              initialData={editingLeaveId ? formData : undefined}
              initialLeaveType={editingLeaveId ? formData.leaveType : (typeParam || 'ลากิจ')}
              onClose={() => {
                setIsAdding(false);
                setEditingLeaveId(null);
              }}
              onSuccess={() => {
                fetchLeaves();
              }}
            />
          </div>
        ) : (
          <form
            onSubmit={handleSave}
            className="bg-slate-50/70 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-5 animate-fade-in"
          >
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-500" />
                  <span>{editingLeaveId ? 'แก้ไขข้อมูลการลา (Classic Form)' : 'แบบฟอร์มยื่นขอลา (Classic Form)'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setUseDynamicForm(true)}
                  className="text-[11px] text-primary-600 dark:text-primary-400 hover:underline"
                >
                  (สลับเป็นแบบฟอร์มแม่แบบเอกสาร)
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingLeaveId(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                ✕ ปิดฟอร์ม
              </button>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Written At */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                เขียนที่ (สถานที่เขียนใบลา)
              </label>
              <input
                type="text"
                value={formData.writtenAt || ''}
                onChange={(e) => setFormData({ ...formData, writtenAt: e.target.value })}
                className="form-input"
                placeholder="เช่น บก.ศฝยว.ทบ."
              />
            </div>

            {/* To Person */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                เรียน (ตำแหน่งผู้บังคับบัญชา)
              </label>
              <input
                type="text"
                value={formData.toPerson || ''}
                onChange={(e) => setFormData({ ...formData, toPerson: e.target.value })}
                className="form-input"
                placeholder="เช่น ผบ.ศฝยว.ทบ."
              />
            </div>

            {/* Leave Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                ประเภทการลา
              </label>
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="form-select"
              >
                {leaveTypesList.map((type, idx) => (
                  <option key={idx} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {formData.leaveType === 'ลาป่วย' ? 'อาการป่วย (ป่วยเป็น...)' : 'เหตุผลการลา (เนื่องจาก/เพื่อ...)'}
              </label>
              <input
                type="text"
                value={formData.reason || ''}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="form-input"
                placeholder={formData.leaveType === 'ลาป่วย' ? 'เช่น ไข้หวัดใหญ่, ปวดท้องเฉียบพลัน' : 'เช่น ไปติดต่อธุระส่วนตัว, ภารกิจครอบครัว'}
              />
            </div>

            {/* Annual Leave Fields */}
            {(formData.leaveType === 'ลาพักผ่อน' || formData.leaveType === 'ลาพักผ่อนประจำปี') && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    วันลาพักผ่อนสะสม (วัน)
                  </label>
                  <input
                    type="number"
                    value={formData.accumulatedLeaveDays || 0}
                    onChange={(e) => setFormData({ ...formData, accumulatedLeaveDays: parseInt(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    มีสิทธิลาปีนี้ (วัน)
                  </label>
                  <input
                    type="number"
                    value={formData.thisYearLeaveDays || 0}
                    onChange={(e) => setFormData({ ...formData, thisYearLeaveDays: parseInt(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ผู้ปฏิบัติหน้าที่แทน (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    value={formData.substitutePerson || ''}
                    onChange={(e) => setFormData({ ...formData, substitutePerson: e.target.value })}
                    className="form-input"
                    placeholder="ยศ นามสกุล"
                  />
                </div>
              </>
            )}

            {/* Ordination Leave Fields */}
            {formData.leaveType === 'ลาอุปสมบท' && (
              <>
                <div className="md:col-span-3">
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    เคยอุปสมบทมาก่อนหรือไม่
                  </span>
                  <div className="flex gap-6 mt-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="ordainedBefore"
                        checked={!formData.ordainedBefore}
                        onChange={() => setFormData({ ...formData, ordainedBefore: false })}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      ยังไม่เคย
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="ordainedBefore"
                        checked={formData.ordainedBefore}
                        onChange={() => setFormData({ ...formData, ordainedBefore: true })}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      เคย
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ชื่อวัดที่อุปสมบท
                  </label>
                  <input
                    type="text"
                    value={formData.ordainTempleName || ''}
                    onChange={(e) => setFormData({ ...formData, ordainTempleName: e.target.value })}
                    className="form-input"
                    placeholder="เช่น วัดบวรนิเวศวิหาร"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ที่ตั้งวัดที่อุปสมบท
                  </label>
                  <input
                    type="text"
                    value={formData.ordainTempleLocation || ''}
                    onChange={(e) => setFormData({ ...formData, ordainTempleLocation: e.target.value })}
                    className="form-input"
                    placeholder="ที่อยู่ของวัด"
                  />
                </div>
                <DatePicker
                  id="leave-ordainDate"
                  label="กำหนดวันอุปสมบท"
                  placeholder="เลือกวันอุปสมบท (พ.ศ.)"
                  value={formData.ordainDate || ''}
                  onChange={(val) => setFormData({ ...formData, ordainDate: val })}
                />
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ชื่อวัดที่จำพรรษา (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    value={formData.stayTempleName || ''}
                    onChange={(e) => setFormData({ ...formData, stayTempleName: e.target.value })}
                    className="form-input"
                    placeholder="เว้นว่างถ้าเป็นวัดเดียวกับที่อุปสมบท"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ที่ตั้งวัดที่จำพรรษา
                  </label>
                  <input
                    type="text"
                    value={formData.stayTempleLocation || ''}
                    onChange={(e) => setFormData({ ...formData, stayTempleLocation: e.target.value })}
                    className="form-input"
                  />
                </div>
              </>
            )}

            {/* Maternity Leave Fields */}
            {formData.leaveType === 'ลาคลอดบุตร' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ลาคลอดในคราวเดียวกันนี้มาแล้ว (ครั้ง)
                  </label>
                  <input
                    type="number"
                    value={formData.maternityLeaveTimes || 0}
                    onChange={(e) => setFormData({ ...formData, maternityLeaveTimes: parseInt(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    รวมวันลาคลอดก่อนหน้า (วัน)
                  </label>
                  <input
                    type="number"
                    value={formData.maternityLeaveDays || 0}
                    onChange={(e) => setFormData({ ...formData, maternityLeaveDays: parseInt(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>
              </>
            )}

            {/* Contact Address */}
            {formData.leaveType !== 'ลาอุปสมบท' && (
              <>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ที่อยู่ติดต่อได้ / สถานที่พักรักษาตัว (กรณีลาป่วย)
                  </label>
                  <input
                    type="text"
                    value={formData.contactAddress || ''}
                    onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                    className="form-input"
                    placeholder="บ้านเลขที่... หมู่... ถนน..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ตำบล/แขวง
                  </label>
                  <input
                    type="text"
                    value={formData.contactTambon || ''}
                    onChange={(e) => setFormData({ ...formData, contactTambon: e.target.value })}
                    className="form-input"
                    placeholder="เช่น พระบรมมหาราชวัง"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    อำเภอ/เขต
                  </label>
                  <input
                    type="text"
                    value={formData.contactAmphoe || ''}
                    onChange={(e) => setFormData({ ...formData, contactAmphoe: e.target.value })}
                    className="form-input"
                    placeholder="เช่น พระนคร"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    จังหวัด
                  </label>
                  <input
                    type="text"
                    value={formData.contactProvince || ''}
                    onChange={(e) => setFormData({ ...formData, contactProvince: e.target.value })}
                    className="form-input"
                    placeholder="เช่น กรุงเทพมหานคร"
                  />
                </div>
              </>
            )}

            {/* Date Range */}
            <DatePicker
              id="leave-startDate"
              label="วันที่เริ่มต้นลา"
              placeholder="เลือกวันเริ่มต้น (พ.ศ.)"
              value={formData.startDate || ''}
              onChange={(val) => setFormData({ ...formData, startDate: val })}
              required
            />

            <DatePicker
              id="leave-endDate"
              label="วันที่สิ้นสุดลา"
              placeholder="เลือกวันสิ้นสุด (พ.ศ.)"
              value={formData.endDate || ''}
              onChange={(val) => setFormData({ ...formData, endDate: val })}
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                setEditingLeaveId(null);
              }}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex items-center gap-1.5 shadow-sm shadow-primary-500/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>บันทึกการลา</span>
            </Button>
          </div>
        </form>
        )
      )}

      {/* Leave Records List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs">กำลังโหลดประวัติการลา...</p>
        </div>
      ) : leaves.length === 0 ? (
        <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
          <p className="font-semibold text-xs">ยังไม่มีประวัติการลาในระบบ</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">ประเภทการลา</th>
                  <th className="px-4 py-3">ช่วงเวลาที่ลา</th>
                  <th className="px-4 py-3">เหตุผลการลา</th>
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
                              reason: leave.reason,
                              writtenAt: leave.writtenAt,
                              toPerson: leave.toPerson,
                              contactAddress: leave.contactAddress,
                              contactTambon: leave.contactTambon,
                              contactAmphoe: leave.contactAmphoe,
                              contactProvince: leave.contactProvince,
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
                          title="พิมพ์ใบลา (PDF)"
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
            setCurrentPage={setPage}
          />
        </div>
      )}

      {/* Styled Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="ยืนยันการลบประวัติการลา?"
        message="คุณแน่ใจหรือไม่ที่จะลบรายการประวัติการลานี้? ข้อมูลที่ลบจะไม่สามารถกู้คืนได้"
        confirmText="ยืนยันการลบ"
        cancelText="ยกเลิก"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </Card>
  );
}
