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

  const getThemeStyle = () => {
    if (theme === 'dark') {
      return {
        background: '#1e293b',
        color: '#fff',
        border: '1px solid #334155'
      };
    }
    // Default light theme
    return {
      background: '#fff',
      color: '#0f172a',
      border: '1px solid #e2e8f0'
    };
  };

  return (
    <Toaster 
      position={position}
      toastOptions={{
        duration: 4000,
        style: getThemeStyle(),
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }} 
    />
  );
}
