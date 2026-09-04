'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import TablePagination from '@/components/common/TablePagination';
import ConfirmModal from '@/components/common/ConfirmModal';

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

// Unified Form Control Classes matching eProfile Design System
const inputControlClass =
  'w-full h-11 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all';
const labelControlClass = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5';

export default function LeaveList({ personnelId, isAdmin = false }: { personnelId: string; isAdmin?: boolean }) {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLeaveId, setEditingLeaveId] = useState<string | null>(null);

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

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/leaves/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchLeaves();
        toast.success(`อัปเดตสถานะเป็น "${status}" สำเร็จ`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getLeaveTypeStyle = (type: string) => {
    switch (type) {
      case 'ลากิจ':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'ลาป่วย':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'ลาพักผ่อนประจำปี':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'ลาอุปสมบท':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'รออนุมัติ':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800';
      case 'อนุมัติแล้ว':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800';
      case 'ไม่อนุมัติ':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800';
      case 'ยกเลิก':
        return 'text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
      default:
        return 'text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Pagination calculation
  const totalItems = leaves.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const indexOfFirstItem = (currentPage - 1) * pageSize;
  const indexOfLastItem = Math.min(indexOfFirstItem + pageSize, totalItems);
  const paginatedLeaves = leaves.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-calendar-check text-primary-600"></i> ประวัติการลา (Leave History)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            บันทึกคำขอลา พิมพ์ใบลา และติดตามสถานะการพิจารณา
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => {
              setEditingLeaveId(null);
              setIsAdding(true);
            }}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <i className="fa-solid fa-plus"></i> ยื่นขอลาใหม่
          </button>
        )}
      </div>

      {/* Leave Application Form */}
      {isAdding && (
        <form
          onSubmit={handleSave}
          className="bg-slate-50/50 dark:bg-slate-850/40 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-5 animate-fade-in"
        >
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-file-pen text-primary-600"></i>
              {editingLeaveId ? 'แก้ไขข้อมูลการลา' : 'แบบฟอร์มยื่นขอลา'}
            </h3>
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
              <label htmlFor="leaveWrittenAt" className={labelControlClass}>
                เขียนที่ (สถานที่เขียนใบลา)
              </label>
              <input
                id="leaveWrittenAt"
                type="text"
                aria-label="สถานที่เขียนใบลา"
                value={formData.writtenAt || ''}
                onChange={(e) => setFormData({ ...formData, writtenAt: e.target.value })}
                className={inputControlClass}
                placeholder="เช่น บก.ศฝยว.ทบ."
              />
            </div>

            {/* To Person */}
            <div>
              <label htmlFor="leaveToPerson" className={labelControlClass}>
                เรียน (ตำแหน่งผู้บังคับบัญชา)
              </label>
              <input
                id="leaveToPerson"
                type="text"
                aria-label="เรียน ตำแหน่งผู้บังคับบัญชา"
                value={formData.toPerson || ''}
                onChange={(e) => setFormData({ ...formData, toPerson: e.target.value })}
                className={inputControlClass}
                placeholder="เช่น ผบ.ศฝยว.ทบ."
              />
            </div>

            {/* Leave Type */}
            <div>
              <label htmlFor="leaveTypeSelect" className={labelControlClass}>
                ประเภทการลา
              </label>
              <select
                id="leaveTypeSelect"
                aria-label="เลือกประเภทการลา"
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className={inputControlClass}
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
              <label htmlFor="leaveReasonInput" className={labelControlClass}>
                {formData.leaveType === 'ลาป่วย' ? 'อาการป่วย (ป่วยเป็น...)' : 'เหตุผลการลา (เนื่องจาก/เพื่อ...)'}
              </label>
              <input
                id="leaveReasonInput"
                type="text"
                aria-label="เหตุผลการลาหรืออาการป่วย"
                value={formData.reason || ''}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className={inputControlClass}
                placeholder={formData.leaveType === 'ลาป่วย' ? 'เช่น ไข้หวัดใหญ่, ปวดท้องเฉียบพลัน' : 'เช่น ไปติดต่อธุระส่วนตัว, ภารกิจครอบครัว'}
              />
            </div>

            {/* Annual Leave Fields */}
            {formData.leaveType === 'ลาพักผ่อนประจำปี' && (
              <>
                <div>
                  <label htmlFor="accumulatedLeaveDays" className={labelControlClass}>
                    วันลาพักผ่อนสะสม (ยกมา) (วัน)
                  </label>
                  <input
                    id="accumulatedLeaveDays"
                    type="number"
                    aria-label="วันลาพักผ่อนสะสมยกมา"
                    value={formData.accumulatedLeaveDays || ''}
                    onChange={(e) => setFormData({ ...formData, accumulatedLeaveDays: parseFloat(e.target.value) || 0 })}
                    className={inputControlClass}
                    placeholder="เช่น 5"
                  />
                </div>
                <div>
                  <label htmlFor="thisYearLeaveDays" className={labelControlClass}>
                    วันลาประจำปี (วัน)
                  </label>
                  <input
                    id="thisYearLeaveDays"
                    type="number"
                    aria-label="วันลาประจำปี"
                    value={formData.thisYearLeaveDays || 10}
                    onChange={(e) => setFormData({ ...formData, thisYearLeaveDays: parseFloat(e.target.value) || 0 })}
                    className={inputControlClass}
                    placeholder="เช่น 10"
                  />
                </div>
                <div>
                  <label htmlFor="substitutePerson" className={labelControlClass}>
                    ชื่อผู้รับมอบหน้าที่
                  </label>
                  <input
                    id="substitutePerson"
                    type="text"
                    aria-label="ชื่อผู้รับมอบหน้าที่ระหว่างลา"
                    value={formData.substitutePerson || ''}
                    onChange={(e) => setFormData({ ...formData, substitutePerson: e.target.value })}
                    className={inputControlClass}
                    placeholder="เช่น ร.อ. สมชาย ใจดี"
                  />
                </div>
              </>
            )}

            {/* Ordination Leave Fields */}
            {formData.leaveType === 'ลาอุปสมบท' && (
              <>
                <div className="md:col-span-3">
                  <span className={labelControlClass}>เคยอุปสมบทมาก่อนหรือไม่</span>
                  <div className="flex gap-6 mt-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="ordainedBefore"
                        aria-label="ยังไม่เคยอุปสมบท"
                        checked={!formData.ordainedBefore}
                        onChange={() => setFormData({ ...formData, ordainedBefore: false })}
                      />
                      ยังไม่เคย
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="ordainedBefore"
                        aria-label="เคยอุปสมบทมาแล้ว"
                        checked={formData.ordainedBefore}
                        onChange={() => setFormData({ ...formData, ordainedBefore: true })}
                      />
                      เคย
                    </label>
                  </div>
                </div>
                <div>
                  <label htmlFor="ordainTempleName" className={labelControlClass}>
                    ชื่อวัดที่อุปสมบท
                  </label>
                  <input
                    id="ordainTempleName"
                    type="text"
                    aria-label="ชื่อวัดที่อุปสมบท"
                    value={formData.ordainTempleName || ''}
                    onChange={(e) => setFormData({ ...formData, ordainTempleName: e.target.value })}
                    className={inputControlClass}
                    placeholder="เช่น วัดบวรนิเวศวิหาร"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="ordainTempleLocation" className={labelControlClass}>
                    ที่ตั้งวัดที่อุปสมบท
                  </label>
                  <input
                    id="ordainTempleLocation"
                    type="text"
                    aria-label="ที่ตั้งวัดที่อุปสมบท"
                    value={formData.ordainTempleLocation || ''}
                    onChange={(e) => setFormData({ ...formData, ordainTempleLocation: e.target.value })}
                    className={inputControlClass}
                    placeholder="ที่อยู่ของวัด"
                  />
                </div>
                <div>
                  <label htmlFor="ordainDate" className={labelControlClass}>
                    กำหนดวันอุปสมบท
                  </label>
                  <input
                    id="ordainDate"
                    type="date"
                    aria-label="กำหนดวันอุปสมบท"
                    value={formData.ordainDate || ''}
                    onChange={(e) => setFormData({ ...formData, ordainDate: e.target.value })}
                    className={inputControlClass}
                  />
                </div>
                <div>
                  <label htmlFor="stayTempleName" className={labelControlClass}>
                    ชื่อวัดที่จำพรรษา (ถ้ามี)
                  </label>
                  <input
                    id="stayTempleName"
                    type="text"
                    aria-label="ชื่อวัดที่จำพรรษา"
                    value={formData.stayTempleName || ''}
                    onChange={(e) => setFormData({ ...formData, stayTempleName: e.target.value })}
                    className={inputControlClass}
                    placeholder="เว้นว่างถ้าเป็นวัดเดียวกับที่อุปสมบท"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="stayTempleLocation" className={labelControlClass}>
                    ที่ตั้งวัดที่จำพรรษา
                  </label>
                  <input
                    id="stayTempleLocation"
                    type="text"
                    aria-label="ที่ตั้งวัดที่จำพรรษา"
                    value={formData.stayTempleLocation || ''}
                    onChange={(e) => setFormData({ ...formData, stayTempleLocation: e.target.value })}
                    className={inputControlClass}
                  />
                </div>
              </>
            )}

            {/* Maternity Leave Fields */}
            {formData.leaveType === 'ลาคลอดบุตร' && (
              <>
                <div>
                  <label htmlFor="maternityLeaveTimes" className={labelControlClass}>
                    ลาคลอดในคราวเดียวกันนี้มาแล้ว (ครั้ง)
                  </label>
                  <input
                    id="maternityLeaveTimes"
                    type="number"
                    aria-label="จำนวนครั้งที่ลาคลอดก่อนหน้า"
                    value={formData.maternityLeaveTimes || 0}
                    onChange={(e) => setFormData({ ...formData, maternityLeaveTimes: parseInt(e.target.value) || 0 })}
                    className={inputControlClass}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="maternityLeaveDays" className={labelControlClass}>
                    รวมวันลาคลอดก่อนหน้า (วัน)
                  </label>
                  <input
                    id="maternityLeaveDays"
                    type="number"
                    aria-label="รวมวันลาคลอดก่อนหน้า"
                    value={formData.maternityLeaveDays || 0}
                    onChange={(e) => setFormData({ ...formData, maternityLeaveDays: parseInt(e.target.value) || 0 })}
                    className={inputControlClass}
                    placeholder="0"
                  />
                </div>
              </>
            )}

            {/* Contact Address */}
            {formData.leaveType !== 'ลาอุปสมบท' && (
              <>
                <div className="md:col-span-3">
                  <label htmlFor="contactAddressInput" className={labelControlClass}>
                    ที่อยู่ติดต่อได้ / สถานที่พักรักษาตัว (กรณีลาป่วย)
                  </label>
                  <input
                    id="contactAddressInput"
                    type="text"
                    aria-label="ที่อยู่ติดต่อได้ระหว่างลา"
                    value={formData.contactAddress || ''}
                    onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                    className={inputControlClass}
                    placeholder="บ้านเลขที่... หมู่... ถนน..."
                  />
                </div>
                <div>
                  <label htmlFor="contactTambonInput" className={labelControlClass}>
                    ตำบล/แขวง
                  </label>
                  <input
                    id="contactTambonInput"
                    type="text"
                    aria-label="ตำบลหรือแขวง"
                    value={formData.contactTambon || ''}
                    onChange={(e) => setFormData({ ...formData, contactTambon: e.target.value })}
                    className={inputControlClass}
                    placeholder="เช่น พระบรมมหาราชวัง"
                  />
                </div>
                <div>
                  <label htmlFor="contactAmphoeInput" className={labelControlClass}>
                    อำเภอ/เขต
                  </label>
                  <input
                    id="contactAmphoeInput"
                    type="text"
                    aria-label="อำเภอหรือเขต"
                    value={formData.contactAmphoe || ''}
                    onChange={(e) => setFormData({ ...formData, contactAmphoe: e.target.value })}
                    className={inputControlClass}
                    placeholder="เช่น พระนคร"
                  />
                </div>
                <div>
                  <label htmlFor="contactProvinceInput" className={labelControlClass}>
                    จังหวัด
                  </label>
                  <input
                    id="contactProvinceInput"
                    type="text"
                    aria-label="จังหวัด"
                    value={formData.contactProvince || ''}
                    onChange={(e) => setFormData({ ...formData, contactProvince: e.target.value })}
                    className={inputControlClass}
                    placeholder="เช่น กรุงเทพมหานคร"
                  />
                </div>
              </>
            )}

            {/* Date Range */}
            <div>
              <label htmlFor="leaveStartDate" className={labelControlClass}>
                วันที่เริ่มต้นลา <span className="text-rose-500">*</span>
              </label>
              <input
                id="leaveStartDate"
                type="date"
                aria-label="วันที่เริ่มต้นลา"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={inputControlClass}
                required
              />
            </div>

            <div>
              <label htmlFor="leaveEndDate" className={labelControlClass}>
                วันที่สิ้นสุดลา <span className="text-rose-500">*</span>
              </label>
              <input
                id="leaveEndDate"
                type="date"
                aria-label="วันที่สิ้นสุดลา"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={inputControlClass}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingLeaveId(null);
              }}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <i className="fa-solid fa-floppy-disk mr-1.5"></i> บันทึกการลา
            </button>
          </div>
        </form>
      )}

      {/* Leave Records List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">
          <i className="fa-solid fa-spinner animate-spin text-xl mb-2"></i>
          <p>กำลังโหลดประวัติการลา...</p>
        </div>
      ) : leaves.length === 0 ? (
        <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <i className="fa-solid fa-calendar-xmark text-3xl mb-2 opacity-50"></i>
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
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getLeaveTypeStyle(leave.leaveType)}`}>
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" title={leave.reason}>
                      {leave.reason || '-'}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {isAdmin && leave.status === 'รออนุมัติ' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(leave.id, 'อนุมัติแล้ว')}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                              title="อนุมัติการลา"
                            >
                              <i className="fa-solid fa-check"></i>
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(leave.id, 'ไม่อนุมัติ')}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="ไม่อนุมัติ"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </>
                        )}
                        {!isAdmin && leave.status === 'รออนุมัติ' && (
                          <button
                            onClick={() => handleStatusUpdate(leave.id, 'ยกเลิก')}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                            title="ยกเลิกคำขอลา"
                          >
                            <i className="fa-solid fa-ban"></i>
                          </button>
                        )}
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
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <a
                          href={`/leave/print/${leave.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-500 hover:text-primary-600 bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/40 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                          title="พิมพ์ใบลา (PDF)"
                        >
                          <i className="fa-solid fa-print"></i>
                        </a>
                        <button
                          onClick={() => setDeleteTargetId(leave.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                          title="ลบรายการ"
                        >
                          <i className="fa-solid fa-trash-can"></i>
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
    </div>
  );
}
