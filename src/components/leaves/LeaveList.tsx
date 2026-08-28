'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

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
}

export default function LeaveList({ personnelId, isAdmin = false }: { personnelId: string; isAdmin?: boolean }) {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
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
  });

  const searchParams = useSearchParams();
  const typeParam = searchParams ? searchParams.get('type') : null;

  useEffect(() => {
    fetchLeaves();
  }, [personnelId]);

  useEffect(() => {
    if (typeParam) {
      // Delay slightly to ensure UI is ready
      setTimeout(() => {
        setIsAdding(true);
        setFormData(prev => ({ ...prev, leaveType: decodeURIComponent(typeParam) }));
      }, 100);
    }
  }, [typeParam]);

  const fetchLeaves = async () => {
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
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      alert('กรุณาระบุวันที่เริ่มต้นและสิ้นสุด');
      return;
    }

    try {
      const payload = {
        personnelId,
        ...formData
      };

      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsAdding(false);
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
          contactProvince: ''
        });
        fetchLeaves();
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบประวัติการลานี้?')) return;

    try {
      const res = await fetch(`/api/leaves/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLeaves();
      }
    } catch (err) {
      console.error(err);
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
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getLeaveTypeStyle = (type: string) => {
    switch (type) {
      case 'ลากิจ': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'ลาป่วย': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'ลาพักผ่อนประจำปี': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'ลาไปบวช': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'รออนุมัติ': return 'text-amber-500 bg-amber-500/10';
      case 'อนุมัติแล้ว': return 'text-emerald-500 bg-emerald-500/10';
      case 'ไม่อนุมัติ': return 'text-red-500 bg-red-500/10';
      case 'ยกเลิก': return 'text-slate-500 bg-slate-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="mt-8 bg-white dark:bg-slate-800/50 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
          <i className="fa-solid fa-calendar-alt text-primary-500 mr-2"></i> ประวัติการลา (Leave History)
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-400 dark:hover:bg-primary-500/20 rounded-lg text-sm font-medium transition-colors"
          >
            <i className="fa-solid fa-plus mr-1"></i> ยื่นขอลา
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">เขียนที่ (เช่น กองพัน..., ที่ว่าการอำเภอ...)</label>
              <input
                type="text"
                value={formData.writtenAt}
                onChange={e => setFormData({ ...formData, writtenAt: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                placeholder="สถานที่เขียนใบลา"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">เรียน (ตำแหน่งผู้บังคับบัญชา)</label>
              <input
                type="text"
                value={formData.toPerson}
                onChange={e => setFormData({ ...formData, toPerson: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                placeholder="เช่น ผู้บังคับกองพัน..."
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">ประเภทการลา</label>
              <select
                value={formData.leaveType}
                onChange={e => setFormData({ ...formData, leaveType: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="ลากิจ">ลากิจ</option>
                <option value="ลาป่วย">ลาป่วย</option>
                <option value="ลาพักผ่อนประจำปี">ลาพักผ่อนประจำปี</option>
                <option value="ลาไปบวช">ลาไปบวช</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">
                {formData.leaveType === 'ลาป่วย' ? 'อาการป่วย (ป่วยเป็น...)' : 'เหตุผลการลา (เพื่อ...)'}
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                placeholder={formData.leaveType === 'ลาป่วย' ? 'เช่น ไข้หวัดใหญ่, ปวดท้อง' : 'เช่น ไปติดต่อธุระส่วนตัว, ติดต่อราชการ'}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">ที่อยู่ติดต่อได้ / สถานที่พักรักษาตัว (กรณีลาป่วย)</label>
              <input
                type="text"
                value={formData.contactAddress}
                onChange={e => setFormData({ ...formData, contactAddress: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                placeholder="บ้านเลขที่... หมู่... ถนน..."
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">ตำบล/แขวง</label>
              <input
                type="text"
                value={formData.contactTambon || ''}
                onChange={e => setFormData({ ...formData, contactTambon: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                placeholder="เช่น พระบรมมหาราชวัง"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">อำเภอ/เขต</label>
              <input
                type="text"
                value={formData.contactAmphoe || ''}
                onChange={e => setFormData({ ...formData, contactAmphoe: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                placeholder="เช่น พระนคร"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">จังหวัด</label>
              <input
                type="text"
                value={formData.contactProvince || ''}
                onChange={e => setFormData({ ...formData, contactProvince: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                placeholder="เช่น กรุงเทพมหานคร"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">วันที่เริ่มต้น</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">วันที่สิ้นสุด</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">
              ยกเลิก
            </button>
            <button type="submit" className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium">
              บันทึกการลา
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-slate-500">กำลังโหลด...</div>
      ) : leaves.length === 0 ? (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <i className="fa-solid fa-folder-open text-2xl mb-2 opacity-50"></i>
          <p>ยังไม่มีประวัติการลา</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/50">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">ประเภทการลา</th>
                <th className="px-4 py-3 font-medium">วันที่เริ่มต้น - สิ้นสุด</th>
                <th className="px-4 py-3 font-medium">เหตุผล</th>
                <th className="px-4 py-3 font-medium text-center">สถานะ</th>
                <th className="px-4 py-3 font-medium text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50 bg-white dark:bg-slate-800/30">
              {leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getLeaveTypeStyle(leave.leaveType)}`}>
                      {leave.leaveType}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {leave.reason || '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(leave.status)}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {isAdmin && leave.status === 'รออนุมัติ' && (
                        <>
                          <button onClick={() => handleStatusUpdate(leave.id, 'อนุมัติแล้ว')} className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors" title="อนุมัติ">
                            <i className="fa-solid fa-check-circle"></i>
                          </button>
                          <button onClick={() => handleStatusUpdate(leave.id, 'ไม่อนุมัติ')} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="ไม่อนุมัติ">
                            <i className="fa-solid fa-times-circle"></i>
                          </button>
                        </>
                      )}
                      {(!isAdmin && leave.status === 'รออนุมัติ') && (
                        <button onClick={() => handleStatusUpdate(leave.id, 'ยกเลิก')} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="ยกเลิกการลา">
                          <i className="fa-solid fa-ban"></i>
                        </button>
                      )}
                      <button onClick={() => handleDelete(leave.id)} className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="ลบรายการ">
                        <i className="fa-solid fa-trash-alt"></i>
                      </button>
                      <a
                        href={`/leave/print/${leave.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-500 hover:text-primary-600 bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700"
                        title="พิมพ์ใบลา (PDF)"
                      >
                        <i className="fa-solid fa-print"></i>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
