'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BellIcon, SettingIcon } from './icons';
import { cn } from '@/utils/cn';

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
      const handleSync = () => fetchNotifications();
      window.addEventListener('notifications-updated', handleSync);
      window.addEventListener('focus', handleSync);

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

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button"
        onClick={handleToggle}
        className="relative size-10 rounded-lg border border-card-border bg-card-background text-icon-primary shadow-xs flex items-center justify-center hover:bg-background-gray-primary transition-colors focus:outline-none"
        title="Notifications"
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2.5 z-1 size-2 rounded-full bg-red-500">
            <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-red-400 opacity-75" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 overflow-hidden rounded-2xl border border-card-border bg-card-surface-area shadow-3xl z-50 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-card-border px-5 pt-5 pb-4 bg-card-surface-area">
            <h4 className="leading-6 font-semibold text-text-primary text-base">
              Notifications
            </h4>

            <Link
              className="p-1 text-icon-secondary transition-colors hover:text-icon-primary"
              href="/settings"
              onClick={() => setIsOpen(false)}
            >
              <SettingIcon />
            </Link>
          </div>
          
          {/* List */}
          <div className="max-h-96 overflow-y-auto scrollbar-thin px-3 py-2">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-text-tertiary">
                <i className="fa-regular fa-bell-slash text-2xl mb-2 opacity-40"></i>
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {notifications.slice(0, 10).map((noti) => (
                  <li key={noti.id}>
                    <button
                      type="button"
                      className="group flex w-full cursor-pointer gap-3.5 rounded-lg px-3 py-3 transition-colors duration-200 hover:bg-background-gray-primary text-left"
                      onClick={() => { if (!noti.isRead) markAsRead(noti.id); }}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-card-border bg-background-gray-primary text-icon-secondary transition-all duration-200 group-hover:bg-brand-500 group-hover:text-white">
                        <i className={cn(
                          'fa-solid text-sm',
                          noti.type === 'success' ? 'fa-check-circle text-emerald-500 group-hover:text-white' :
                          noti.type === 'warning' ? 'fa-triangle-exclamation text-amber-500 group-hover:text-white' :
                          noti.type === 'error' ? 'fa-circle-xmark text-rose-500 group-hover:text-white' :
                          'fa-info-circle text-brand-500 group-hover:text-white'
                        )} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm leading-5 font-semibold text-text-primary truncate">
                            {noti.title}
                          </p>
                          {!noti.isRead && (
                            <div className="size-1.5 shrink-0 rounded-full bg-brand-500" />
                          )}
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs leading-4 text-text-secondary">
                          {noti.message}
                        </p>
                        <p className="mt-1.5 text-xs text-text-tertiary">
                          {new Date(noti.createdAt).toLocaleString('th-TH')}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between border-t border-card-border px-5 py-3.5 bg-card-surface-area">
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-medium text-text-secondary underline transition-colors hover:text-text-primary"
              >
                Mark all as read
              </button>
            ) : <div />}
            <Link 
              href="/notifications" 
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors"
            >
              View All
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
