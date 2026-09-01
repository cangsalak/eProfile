'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/common/ConfirmModal';

interface NotificationHistory {
  id: string;
  personnelId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export default function ManageNotificationsPage() {
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    target: 'ALL',
    title: '',
    message: '',
    type: 'info',
    link: ''
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/notifications/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error('กรุณากรอกหัวข้อและเนื้อหา');
      return;
    }
    
    setShowConfirm(true);
  };

  const executeSubmit = async () => {
    setShowConfirm(false);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success('ส่งประกาศสำเร็จ');
        setFormData({ ...formData, title: '', message: '', link: '' });
        fetchHistory();
      } else {
        const data = await res.json();
        toast.error(data.error || 'เกิดข้อผิดพลาดในการส่งประกาศ');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'warning': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const getTargetLabel = (target: string) => {
    if (target === 'ALL') return 'ทุกคน';
    if (target === 'ADMIN') return 'เฉพาะแอดมิน';
    return target;
  };

  return (
    <div className="pb-12 space-y-8 animate-fade-in">
      <div className="flex items-center space-x-4 mb-8">
        <div className="h-12 w-12 bg-gradient-to-tr from-primary-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg text-white">
          <i className="fa-solid fa-bullhorn text-xl"></i>
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            จัดการการแจ้งเตือน
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            สร้างประกาศและส่งข้อความแจ้งเตือนถึงบุคลากรในระบบ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <i className="fa-solid fa-pen-to-square mr-2 text-primary-500"></i>
              สร้างประกาศใหม่
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">กลุ่มเป้าหมาย</label>
                <select
                  value={formData.target}
                  onChange={(e) => setFormData({...formData, target: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 text-sm"
                >
                  <option value="ALL">ทุกคนในระบบ (Broadcast)</option>
                  <option value="ADMIN">เฉพาะผู้ดูแลระบบ (Admins)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ระดับความสำคัญ</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 text-sm"
                >
                  <option value="info">ทั่วไป (Info)</option>
                  <option value="success">สำเร็จ (Success)</option>
                  <option value="warning">เตือน (Warning)</option>
                  <option value="error">ด่วน/ผิดพลาด (Error)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">หัวข้อประกาศ <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 text-sm"
                  placeholder="เช่น ประกาศวันหยุดพิเศษ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">เนื้อหา <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 text-sm resize-none"
                  placeholder="รายละเอียดประกาศ..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ลิงก์ที่เกี่ยวข้อง (ไม่บังคับ)</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 text-sm"
                  placeholder="เช่น /leave หรือ https://..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i><span className="ml-2">กำลังส่ง...</span></>
                ) : (
                  <><i className="fa-solid fa-paper-plane"></i><span className="ml-2">ส่งประกาศ</span></>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-lg font-bold flex items-center">
                <i className="fa-solid fa-clock-rotate-left mr-2 text-slate-500"></i>
                ประวัติการส่งประกาศล่าสุด
              </h2>
              <button onClick={fetchHistory} className="text-slate-500 hover:text-primary-600 transition-colors" title="รีเฟรช">
                <i className={`fa-solid fa-rotate-right ${isLoading ? 'fa-spin' : ''}`}></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-0 max-h-[600px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-48 text-slate-400">
                  <i className="fa-solid fa-spinner fa-spin text-2xl mr-3"></i> กำลังโหลดประวัติ...
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-48 text-slate-400 space-y-2">
                  <i className="fa-regular fa-folder-open text-4xl mb-2 opacity-50"></i>
                  <p>ยังไม่มีประวัติการประกาศ</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 uppercase sticky top-0">
                    <tr>
                      <th className="px-4 py-3">วัน/เวลา</th>
                      <th className="px-4 py-3">เป้าหมาย</th>
                      <th className="px-4 py-3">ประเภท</th>
                      <th className="px-4 py-3">เนื้อหาประกาศ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {history.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                          {new Date(item.createdAt).toLocaleString('th-TH', { 
                            dateStyle: 'short', timeStyle: 'short' 
                          })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                            {getTargetLabel(item.personnelId)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeStyle(item.type)}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900 dark:text-slate-100">{item.title}</div>
                          <div className="text-xs text-slate-500 mt-1 line-clamp-1">{item.message}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="ยืนยันการส่งประกาศ"
        message={`คุณต้องการส่งประกาศนี้ไปยัง ${formData.target === 'ALL' ? 'ทุกคนในระบบ' : formData.target === 'ADMIN' ? 'ผู้ดูแลระบบทั้งหมด' : formData.target} ใช่หรือไม่?`}
        onConfirm={executeSubmit}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
