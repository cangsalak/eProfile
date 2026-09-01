'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface NotificationDropdownProps {
  currentUser: any;
}

export default function NotificationDropdown({ currentUser }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      // Listen to cross-component notification sync
      const handleSync = () => fetchNotifications();
      window.addEventListener('notifications-updated', handleSync);
      window.addEventListener('focus', handleSync);

      // Polling every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => {
        clearInterval(interval);
        window.removeEventListener('notifications-updated', handleSync);
        window.removeEventListener('focus', handleSync);
      };
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      // Re-fetch immediately when dropdown is opened to guarantee accurate unread state
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PUT' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return 'fa-check-circle text-emerald-500';
      case 'warning': return 'fa-exclamation-triangle text-amber-500';
      case 'error': return 'fa-times-circle text-red-500';
      default: return 'fa-info-circle text-blue-500';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className="relative w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
        title="การแจ้งเตือน"
      >
        <i className="fa-solid fa-bell"></i>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-fade-in">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-slate-900 dark:text-white">การแจ้งเตือน</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              >
                อ่านทั้งหมด
              </button>
            )}
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <i className="fa-regular fa-bell-slash text-3xl mb-2 opacity-20"></i>
                <p className="text-sm">ไม่มีการแจ้งเตือนใหม่</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {notifications.slice(0, 10).map((noti) => (
                  <div 
                    key={noti.id} 
                    className={`p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 ${!noti.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                    onClick={() => { if (!noti.isRead) markAsRead(noti.id); }}
                  >
                    <div className="flex gap-3">
                      <div className="shrink-0 mt-1">
                        <i className={`fa-solid ${getTypeIcon(noti.type)}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        {noti.link ? (
                          <Link href={noti.link} className="block group">
                            <p className={`text-sm font-medium truncate group-hover:text-primary-500 transition-colors ${!noti.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                              {noti.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {noti.message}
                            </p>
                          </Link>
                        ) : (
                          <>
                            <p className={`text-sm font-medium truncate ${!noti.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                              {noti.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {noti.message}
                            </p>
                          </>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(noti.createdAt).toLocaleString('th-TH')}
                        </p>
                      </div>
                      {!noti.isRead && (
                        <div className="shrink-0 flex items-center justify-center w-2">
                          <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center">
            <Link 
              href="/notifications" 
              onClick={() => setIsOpen(false)}
              className="text-sm text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium p-1 block"
            >
              ดูการแจ้งเตือนทั้งหมด
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
