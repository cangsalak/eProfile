'use client';

import React, { useEffect, useState } from 'react';
import { Toaster, ToastPosition } from 'react-hot-toast';

export default function ToastProvider() {
  const [position, setPosition] = useState<ToastPosition>('top-right');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

  useEffect(() => {
    // Fetch user preferences or system settings for toast position
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.toastPosition) {
            setPosition(data.toastPosition as ToastPosition);
          }
          if (data.toastTheme) {
            setTheme(data.toastTheme);
          }
        }
      } catch (error) {
        console.error('Failed to load toast settings', error);
      }
    };

    fetchSettings();
  }, []);

  const isDarkMode = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <Toaster 
      position={position}
      toastOptions={{
        duration: 4000,
        className: '!font-prompt !rounded-2xl !text-xs !shadow-xl !border',
        style: {
          background: isDarkMode ? 'var(--surface-card, #1e293b)' : '#ffffff',
          color: isDarkMode ? '#f8fafc' : '#0f172a',
          borderColor: isDarkMode ? 'var(--border-color, rgba(255, 255, 255, 0.1))' : 'rgba(226, 232, 240, 0.9)',
          backdropFilter: 'blur(12px)',
        },
        success: {
          iconTheme: {
            primary: 'rgb(var(--color-primary-500, 16 185 129))',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
      }} 
    />
  );
}
