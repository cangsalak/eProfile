'use client';

import React, { useState, useEffect } from 'react';
import RoleSettings from '../components/RoleSettings';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';

export default function RolesView() {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error('Failed to fetch settings:', err));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-16 font-prompt">
      <PageHeaderExtra>
        <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
          <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-600 text-white shadow-sm shadow-primary-500/30 flex items-center gap-2">
            <i className="fa-solid fa-user-shield text-xs"></i>
            <span>สิทธิ์และบทบาท (RBAC)</span>
          </div>
        </div>
      </PageHeaderExtra>

      <RoleSettings settings={settings} />
    </div>
  );
}
