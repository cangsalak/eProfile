'use client';
import React, { useState, useEffect } from 'react';

export default function ManageContactsPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/contacts');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบข้อความนี้?')) return;
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      if (res.ok) fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pb-12 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">ข้อความติดต่อ (Contact Messages)</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">จัดการข้อความที่ส่งมาจากหน้าแบบฟอร์มติดต่อเรา</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-slate-500">ไม่มีข้อความติดต่อ</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                <th className="px-4 py-3 font-medium">ชื่อผู้ติดต่อ</th>
                <th className="px-4 py-3 font-medium">ข้อความ</th>
                <th className="px-4 py-3 font-medium">วันที่</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {messages.map(msg => (
                <tr key={msg.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${msg.status === 'unread' ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-white">{msg.name}</div>
                    <div className="text-xs text-slate-500">{msg.email} {msg.phone ? `| ${msg.phone}` : ''}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-sm max-w-md truncate">
                    {msg.message}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-sm">
                    {new Date(msg.createdAt).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-4 py-3">
                    <select 
                      value={msg.status}
                      onChange={(e) => updateStatus(msg.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-3 py-1 outline-none border-none cursor-pointer ${
                        msg.status === 'unread' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        msg.status === 'read' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}
                    >
                      <option value="unread">ยังไม่อ่าน</option>
                      <option value="read">อ่านแล้ว</option>
                      <option value="replied">ตอบกลับแล้ว</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleDelete(msg.id)}
                      className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
