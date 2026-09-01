'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/common/ConfirmModal';
import TablePagination from '@/components/common/TablePagination';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export default function ManageContactsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'unread' | 'read' | 'replied'>('ALL');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Detail Modal & Confirm Delete
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<ContactMessage | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Load Auth & System Settings
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch((err) => console.error('Auth error:', err));

    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((settings) => {
        if (settings?.defaultPageSize) {
          const size = parseInt(settings.defaultPageSize, 10);
          if (!isNaN(size) && size > 0) {
            setPageSize(size);
          }
        }
      })
      .catch((err) => console.error('Settings error:', err));
  }, []);

  const canManage = useMemo(() => {
    if (!currentUser) return false;
    const role = currentUser.role;
    if (['SUPER_ADMIN', 'ADMIN'].includes(role)) return true;
    if (Array.isArray(currentUser.permissions) && currentUser.permissions.includes('MANAGE_SYSTEM')) {
      return true;
    }
    return false;
  }, [currentUser]);

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/contacts');
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } else {
        toast.error('ไม่สามารถโหลดข้อความติดต่อได้');
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const updateStatus = async (id: string, status: string) => {
    try {
      setIsUpdatingStatus(true);
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast.success('อัปเดตสถานะข้อความเรียบร้อย');
        setMessages((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, status: status as any } : msg))
        );
        if (selectedMessage?.id === id) {
          setSelectedMessage((prev) => (prev ? { ...prev, status: status as any } : null));
        }
      } else {
        toast.error('ไม่สามารถอัปเดตสถานะได้');
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการอัปเดต');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingMessage) return;
    try {
      const res = await fetch(`/api/contacts/${deletingMessage.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`ลบข้อความจาก "${deletingMessage.name}" เรียบร้อย`);
        setMessages((prev) => prev.filter((m) => m.id !== deletingMessage.id));
        if (selectedMessage?.id === deletingMessage.id) {
          setSelectedMessage(null);
        }
      } else {
        toast.error('ไม่สามารถลบข้อความได้');
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการลบ');
    } finally {
      setDeletingMessage(null);
    }
  };

  // Open Message Detail & mark as read if unread
  const handleOpenDetail = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (msg.status === 'unread' && canManage) {
      updateStatus(msg.id, 'read');
    }
  };

  // KPI Stats
  const stats = useMemo(() => {
    const total = messages.length;
    const unread = messages.filter((m) => m.status === 'unread').length;
    const read = messages.filter((m) => m.status === 'read').length;
    const replied = messages.filter((m) => m.status === 'replied').length;
    return { total, unread, read, replied };
  }, [messages]);

  // Filter & Search
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const matchSearch =
        msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (msg.phone && msg.phone.includes(searchQuery)) ||
        msg.message.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || msg.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [messages, searchQuery, statusFilter]);

  // Pagination calculation
  const totalItems = filteredMessages.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const indexOfFirstItem = (activePage - 1) * pageSize;
  const indexOfLastItem = Math.min(indexOfFirstItem + pageSize, totalItems);
  const currentMessages = filteredMessages.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span> ยังไม่อ่าน
          </span>
        );
      case 'read':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> อ่านแล้ว
          </span>
        );
      case 'replied':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ตอบกลับแล้ว
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="pb-16 space-y-6 animate-fade-in font-prompt">
      
      {/* Header Banner - Dashboard Style Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary-100/60 via-indigo-100/40 to-purple-100/30 dark:from-primary-950/40 dark:via-indigo-950/20 dark:to-purple-950/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70 pointer-events-none"></div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start space-x-5">
            <div className="hidden sm:flex shrink-0 w-16 h-16 bg-gradient-to-br from-primary-500 via-indigo-600 to-purple-600 rounded-2xl items-center justify-center shadow-lg shadow-primary-500/20 text-white text-2xl font-bold">
              <i className="fa-solid fa-envelope-open-text"></i>
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3">
                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                <span>ศูนย์จัดการข้อความติดต่อ (Contact Inquiries Management)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                ข้อความติดต่อ (Contact Messages)
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
                จัดการข้อความและข้อซักถามที่ส่งมาจากหน้าแบบฟอร์มติดต่อเรา พร้อมระบบตอบกลับและบันทึกสถานะ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={fetchMessages}
              disabled={isLoading}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center gap-2"
            >
              <i className={`fa-solid fa-rotate-right text-xs ${isLoading ? 'animate-spin' : ''}`}></i>
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Messages */}
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md ${
            statusFilter === 'ALL'
              ? 'border-primary-500 ring-2 ring-primary-500/20'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ข้อความทั้งหมด</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">
              <i className="fa-solid fa-inbox"></i>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {stats.total}
          </div>
        </div>

        {/* Unread Messages */}
        <div
          onClick={() => setStatusFilter('unread')}
          className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md ${
            statusFilter === 'unread'
              ? 'border-rose-500 ring-2 ring-rose-500/20'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ยังไม่ได้อ่าน</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm">
              <i className="fa-solid fa-envelope"></i>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {stats.unread}
          </div>
        </div>

        {/* Read Messages */}
        <div
          onClick={() => setStatusFilter('read')}
          className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md ${
            statusFilter === 'read'
              ? 'border-amber-500 ring-2 ring-amber-500/20'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">อ่านแล้ว</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">
              <i className="fa-solid fa-envelope-open"></i>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {stats.read}
          </div>
        </div>

        {/* Replied Messages */}
        <div
          onClick={() => setStatusFilter('replied')}
          className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md ${
            statusFilter === 'replied'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ตอบกลับแล้ว</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
              <i className="fa-solid fa-reply-all"></i>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {stats.replied}
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row justify-between gap-3 items-center">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <label htmlFor="contacts-search-input" className="sr-only">ค้นหาข้อความติดต่อ</label>
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              id="contacts-search-input"
              aria-label="ค้นหาตามชื่อผู้ติดต่อ, อีเมล, เบอร์โทรศัพท์ หรือข้อความ"
              type="text"
              placeholder="ค้นหาตามชื่อผู้ติดต่อ, อีเมล, เบอร์โทรศัพท์ หรือข้อความ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>

          {/* Status Select */}
          <div className="w-full sm:w-56">
            <select
              aria-label="เลือกสถานะข้อความ"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
            >
              <option value="ALL">📁 ทุกสถานะ ({messages.length})</option>
              <option value="unread">🔴 ยังไม่อ่าน ({stats.unread})</option>
              <option value="read">🟡 อ่านแล้ว ({stats.read})</option>
              <option value="replied">🟢 ตอบกลับแล้ว ({stats.replied})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contacts Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/40">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            รายการข้อความติดต่อ ({filteredMessages.length} รายการ)
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/80 uppercase font-bold tracking-wider sticky top-0 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">ผู้ติดต่อ</th>
                <th className="py-3 px-4">ข้อความติดต่อ</th>
                <th className="py-3 px-4 whitespace-nowrap">วันที่ส่ง</th>
                <th className="py-3 px-4 whitespace-nowrap text-center">สถานะ</th>
                <th className="py-3 px-4 whitespace-nowrap text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 space-y-2">
                    <i className="fa-solid fa-circle-notch fa-spin text-2xl text-primary-500"></i>
                    <p className="text-xs">กำลังโหลดข้อความติดต่อ...</p>
                  </td>
                </tr>
              ) : currentMessages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 space-y-2">
                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl mx-auto mb-2">
                      <i className="fa-regular fa-envelope-open opacity-40"></i>
                    </div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">ไม่พบข้อความติดต่อ</p>
                  </td>
                </tr>
              ) : (
                currentMessages.map((msg) => (
                  <tr
                    key={msg.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      msg.status === 'unread' ? 'bg-rose-50/20 dark:bg-rose-950/10 font-semibold' : ''
                    }`}
                  >
                    {/* Sender Info */}
                    <td className="py-3.5 px-4 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {msg.name ? msg.name[0] : 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {msg.name}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <a href={`mailto:${msg.email}`} className="hover:text-primary-500 hover:underline">
                              {msg.email}
                            </a>
                            {msg.phone && (
                              <>
                                <span>•</span>
                                <a href={`tel:${msg.phone}`} className="hover:text-primary-500 hover:underline">
                                  {msg.phone}
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Message Preview */}
                    <td
                      onClick={() => handleOpenDetail(msg)}
                      className="py-3.5 px-4 min-w-[220px] max-w-md cursor-pointer group"
                    >
                      <div className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-relaxed">
                        {msg.message}
                      </div>
                      <span className="text-[10px] text-primary-500 font-semibold mt-1 inline-flex items-center gap-1 group-hover:underline">
                        <span>คลิกเพื่ออ่านฉบับเต็ม</span> <i className="fa-solid fa-arrow-right text-[8px]"></i>
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-xs font-mono">
                      {new Date(msg.createdAt).toLocaleString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Status with inline switcher */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      {canManage ? (
                        <select
                          value={msg.status}
                          onChange={(e) => updateStatus(msg.id, e.target.value)}
                          className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
                        >
                          <option value="unread">🔴 ยังไม่อ่าน</option>
                          <option value="read">🟡 อ่านแล้ว</option>
                          <option value="replied">🟢 ตอบกลับแล้ว</option>
                        </select>
                      ) : (
                        getStatusBadge(msg.status)
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(msg)}
                          className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors"
                          title="ดูรายละเอียดข้อความ"
                        >
                          <i className="fa-solid fa-eye text-xs"></i>
                        </button>

                        <a
                          href={`mailto:${msg.email}?subject=ตอบกลับข้อความติดต่อ - eProfile System`}
                          className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors"
                          title="ตอบกลับทางอีเมล"
                        >
                          <i className="fa-solid fa-reply text-xs"></i>
                        </a>

                        {canManage && (
                          <button
                            onClick={() => setDeletingMessage(msg)}
                            className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-colors"
                            title="ลบข้อความนี้"
                          >
                            <i className="fa-solid fa-trash text-xs"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <TablePagination
          isLoading={isLoading}
          totalItems={totalItems}
          indexOfFirstItem={indexOfFirstItem}
          indexOfLastItem={indexOfLastItem}
          currentPage={activePage}
          totalPages={totalPages}
          pageSize={pageSize}
          unitName="ข้อความ"
          setPageSize={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up">
            
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">
                  <i className="fa-solid fa-envelope-open"></i>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  รายละเอียดข้อความติดต่อ
                </h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              {/* Sender Details Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-[11px] text-slate-400">ชื่อผู้ติดต่อ:</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedMessage.name}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">วันที่ส่งข้อความ:</div>
                  <div className="font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                    {new Date(selectedMessage.createdAt).toLocaleString('th-TH')}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">อีเมล:</div>
                  <a href={`mailto:${selectedMessage.email}`} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                    {selectedMessage.email}
                  </a>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">เบอร์โทรศัพท์:</div>
                  <div className="text-slate-700 dark:text-slate-300 font-mono">
                    {selectedMessage.phone || '-'}
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">เนื้อหาข้อความ:</div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap min-h-[120px]">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Status Switcher in Modal */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">สถานะข้อความ:</span>
                  <select
                    disabled={!canManage || isUpdatingStatus}
                    value={selectedMessage.status}
                    onChange={(e) => updateStatus(selectedMessage.id, e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="unread">🔴 ยังไม่อ่าน</option>
                    <option value="read">🟡 อ่านแล้ว</option>
                    <option value="replied">🟢 ตอบกลับแล้ว</option>
                  </select>
                </div>

                <a
                  href={`mailto:${selectedMessage.email}?subject=ตอบกลับข้อความติดต่อ - eProfile System`}
                  className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md flex items-center gap-2"
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                  <span>ตอบกลับอีเมล</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingMessage)}
        title="ยืนยันการลบข้อความติดต่อ"
        message={`คุณต้องการลบข้อความจากคุณ "${deletingMessage?.name}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingMessage(null)}
      />
    </div>
  );
}
