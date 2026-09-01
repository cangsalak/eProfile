'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [systemName, setSystemName] = useState('eProfile');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const [res, resSettings] = await Promise.all([
        fetch('/api/notifications'),
        fetch('/api/settings')
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
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PUT' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return 'fa-check-circle text-emerald-500';
      case 'warning': return 'fa-exclamation-triangle text-amber-500';
      case 'error': return 'fa-times-circle text-red-500';
      default: return 'fa-info-circle text-blue-500';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">ประวัติการแจ้งเตือน</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">การแจ้งเตือนทั้งหมดของคุณในระบบ {systemName}</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors text-sm flex items-center"
          >
            <i className="fa-solid fa-check-double mr-2"></i>
            ทำเครื่องหมายว่าอ่านแล้วทั้งหมด ({unreadCount})
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-slate-500">
            <i className="fa-solid fa-circle-notch fa-spin text-4xl text-primary-500 mb-4"></i>
            <p>กำลังโหลดการแจ้งเตือน...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <i className="fa-regular fa-bell-slash text-5xl opacity-20 mb-4"></i>
            <p className="text-lg">ยังไม่มีการแจ้งเตือน</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {notifications.map(noti => (
              <div 
                key={noti.id} 
                className={`p-4 sm:p-5 flex flex-col sm:flex-row gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!noti.isRead ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                onClick={() => { if (!noti.isRead) markAsRead(noti.id); }}
              >
                <div className="shrink-0 mt-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!noti.isRead ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    <i className={`fa-solid ${getTypeIcon(noti.type)} text-lg`}></i>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  {noti.link ? (
                    <Link href={noti.link} className="block group">
                      <h4 className={`text-base font-semibold mb-1 group-hover:text-primary-500 transition-colors ${!noti.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {noti.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {noti.message}
                      </p>
                    </Link>
                  ) : (
                    <>
                      <h4 className={`text-base font-semibold mb-1 ${!noti.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {noti.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {noti.message}
                      </p>
                    </>
                  )}
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 font-medium">
                    <span className="flex items-center">
                      <i className="fa-regular fa-clock mr-1.5"></i>
                      {new Date(noti.createdAt).toLocaleString('th-TH', { 
                        year: 'numeric', month: 'long', day: 'numeric', 
                        hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                    {!noti.isRead && (
                      <span className="text-primary-500 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-1.5"></span>
                        ยังไม่ได้อ่าน
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="shrink-0 flex items-start justify-end">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(noti.id);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    title="ลบการแจ้งเตือนนี้"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
