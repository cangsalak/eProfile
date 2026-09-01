'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [systemName, setSystemName] = useState('ระบบฐานข้อมูลบุคลากร');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'LEAVE' | 'SYSTEM'>('ALL');
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const [res, resSettings] = await Promise.all([
        fetch('/api/notifications'),
        fetch('/api/settings'),
      ]);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
      if (resSettings.ok) {
        const settings = await resSettings.json();
        if (settings.systemName) setSystemName(settings.systemName);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
      toast.error('ไม่สามารถโหลดข้อมูลการแจ้งเตือนได้');
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (notifications.filter(n => !n.isRead).length === 0) return;
    setIsMarkingAll(true);
    try {
      const res = await fetch('/api/notifications', { method: 'PUT' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        window.dispatchEvent(new CustomEvent('notifications-updated'));
        toast.success('ทำเครื่องหมายว่าอ่านแล้วทั้งหมด');
      }
    } catch (err) {
      console.error('Failed to mark as read', err);
      toast.error('เกิดข้อผิดพลาดในการอัปเดต');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const deleteNotification = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        window.dispatchEvent(new CustomEvent('notifications-updated'));
        toast.success('ลบการแจ้งเตือนสำเร็จ');
      }
    } catch (err) {
      console.error('Failed to delete', err);
      toast.error('ไม่สามารถลบได้');
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'เมื่อสักครู่';
      if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
      if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
      if (diffDays === 1) return 'เมื่อวานนี้';
      if (diffDays < 7) return `${diffDays} วันที่แล้ว`;

      return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'success':
        return {
          icon: 'fa-circle-check',
          bg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40',
          badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
          badgeText: 'สำเร็จ/อนุมัติ',
        };
      case 'warning':
        return {
          icon: 'fa-triangle-exclamation',
          bg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40',
          badgeBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
          badgeText: 'คำเตือน',
        };
      case 'error':
        return {
          icon: 'fa-circle-exclamation',
          bg: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40',
          badgeBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
          badgeText: 'ด่วน/สำคัญ',
        };
      default:
        return {
          icon: 'fa-bell',
          bg: 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 border border-primary-200/60 dark:border-primary-800/40',
          badgeBg: 'bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300',
          badgeText: 'ข้อมูล/ข่าวสาร',
        };
    }
  };

  // Stats calculation
  const totalCount = notifications.length;
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const successCount = notifications.filter(n => n.type === 'success').length;
  const alertCount = notifications.filter(n => n.type === 'warning' || n.type === 'error').length;

  // Filtering
  const filteredNotifications = useMemo(() => {
    return notifications.filter(noti => {
      // Tab filter
      if (activeTab === 'UNREAD' && noti.isRead) return false;
      if (activeTab === 'LEAVE' && !noti.title.includes('ลา') && !noti.message.includes('ลา')) return false;
      if (activeTab === 'SYSTEM' && (noti.title.includes('ลา') || noti.message.includes('ลา'))) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = noti.title.toLowerCase().includes(q);
        const matchMsg = noti.message.toLowerCase().includes(q);
        return matchTitle || matchMsg;
      }
      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  return (
    <div className="pb-12 space-y-8 animate-fade-in font-prompt">
      
      {/* Header Banner - Dashboard Style Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Soft decorative ambient glow */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-bl from-primary-100/50 to-purple-100/50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70 pointer-events-none"></div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start space-x-5">
            <div className="hidden sm:flex shrink-0 w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl items-center justify-center shadow-lg shadow-primary-500/20 text-white text-2xl font-bold">
              <i className="fa-solid fa-bell"></i>
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3">
                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                <span>ระบบแจ้งเตือนอัตโนมัติ (Notifications)</span>
                {unreadCount > 0 && (
                  <span className="ml-1.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                    {unreadCount} ข้อความใหม่
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                ประวัติการแจ้งเตือน
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl leading-relaxed">
                การแจ้งเตือนทั้งหมด คำร้องขอลา และประกาศจากผู้ดูแลระบบใน {systemName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-end md:self-center">
            <button
              onClick={fetchNotifications}
              disabled={isLoading}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl transition-all font-medium text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
              title="รีเฟรชข้อมูล"
            >
              <i className={`fa-solid fa-rotate-right ${isLoading ? 'animate-spin' : ''}`}></i>
              <span>รีเฟรช</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={isMarkingAll}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-sm hover:shadow transition-all font-medium text-xs flex items-center gap-1.5"
              >
                <i className="fa-solid fa-check-double text-xs"></i>
                <span>อ่านแล้วทั้งหมด ({unreadCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Stat Cards - Dashboard Theme */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">การแจ้งเตือนทั้งหมด</p>
            <div className="flex items-baseline space-x-1.5">
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{totalCount}</h3>
              <span className="text-slate-500 text-xs">รายการ</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-300">
            <i className="fa-solid fa-inbox text-xl"></i>
          </div>
        </div>

        {/* Stat 2: Unread */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">ยังไม่ได้อ่าน</p>
            <div className="flex items-baseline space-x-1.5">
              <h3 className="text-3xl sm:text-4xl font-black text-primary-600 dark:text-primary-400 tracking-tight">{unreadCount}</h3>
              <span className="text-slate-500 text-xs">ข้อความ</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform duration-300">
            <i className="fa-solid fa-envelope text-xl"></i>
          </div>
        </div>

        {/* Stat 3: Success */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">สำเร็จ / อนุมัติ</p>
            <div className="flex items-baseline space-x-1.5">
              <h3 className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{successCount}</h3>
              <span className="text-slate-500 text-xs">รายการ</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-300">
            <i className="fa-solid fa-circle-check text-xl"></i>
          </div>
        </div>

        {/* Stat 4: Warning/Alert */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">สำคัญ / คำเตือน</p>
            <div className="flex items-baseline space-x-1.5">
              <h3 className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 tracking-tight">{alertCount}</h3>
              <span className="text-slate-500 text-xs">รายการ</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-300">
            <i className="fa-solid fa-triangle-exclamation text-xl"></i>
          </div>
        </div>
      </div>

      {/* Main Filter & Notification Feed Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-slate-50/50 dark:bg-slate-900/40">
          
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'ALL'
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>ทั้งหมด</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10">{totalCount}</span>
            </button>

            <button
              onClick={() => setActiveTab('UNREAD')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'UNREAD'
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>ยังไม่ได้อ่าน</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">{unreadCount}</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('LEAVE')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'LEAVE'
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <i className="fa-solid fa-calendar-check text-[11px]"></i>
              <span>ระบบการลา</span>
            </button>

            <button
              onClick={() => setActiveTab('SYSTEM')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'SYSTEM'
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <i className="fa-solid fa-bullhorn text-[11px]"></i>
              <span>ข่าวสาร/ระบบ</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              id="notificationsSearchInput"
              aria-label="ค้นหาการแจ้งเตือน"
              type="text"
              placeholder="ค้นหาข้อความ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-7 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* List of Notifications */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 animate-pulse">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 text-2xl">
                <i className="fa-regular fa-bell-slash"></i>
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {searchQuery ? 'ไม่พบการแจ้งเตือนที่ตรงกับการค้นหา' : 'ไม่มีรายการแจ้งเตือนในขณะนี้'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery ? 'ลองเปลี่ยนคำค้นหา หรือกดล้างการค้นหาเพื่อดูรายการทั้งหมด' : 'เมื่อมีคำร้องขอลา การอนุมัติ หรือประกาศใหม่ ระบบจะแจ้งเตือนให้ทราบที่นี่ทันที'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((noti) => {
              const config = getTypeConfig(noti.type);
              return (
                <div
                  key={noti.id}
                  onClick={() => {
                    if (!noti.isRead) markAsRead(noti.id);
                  }}
                  className={`p-5 sm:p-6 flex flex-col sm:flex-row gap-4 transition-all hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer ${
                    !noti.isRead ? 'bg-primary-50/20 dark:bg-primary-950/10' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className="shrink-0 mt-0.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xs ${config.bg}`}>
                      <i className={`fa-solid ${config.icon}`}></i>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${config.badgeBg}`}>
                        {config.badgeText}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        • {formatRelativeTime(noti.createdAt)}
                      </span>
                      {!noti.isRead && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-500 text-white">
                          ใหม่
                        </span>
                      )}
                    </div>

                    <h4 className={`text-base font-bold mb-1 transition-colors ${
                      !noti.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {noti.title}
                    </h4>

                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {noti.message}
                    </p>

                    <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <i className="fa-regular fa-clock text-[10px]"></i>
                        {new Date(noti.createdAt).toLocaleString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <div className="flex items-center gap-2">
                        {noti.link && (
                          <Link
                            href={noti.link}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!noti.isRead) markAsRead(noti.id);
                            }}
                            className="px-3 py-1.5 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/60 text-primary-600 dark:text-primary-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                          >
                            <span>ดูรายละเอียด</span>
                            <i className="fa-solid fa-arrow-right text-[10px]"></i>
                          </Link>
                        )}

                        <button
                          onClick={(e) => deleteNotification(noti.id, e)}
                          className="w-8 h-8 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors"
                          title="ลบการแจ้งเตือนนี้"
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
