'use client';

import React from 'react';
import { Plus, Check, Calendar, Download, RefreshCw, Layers, Radio } from 'lucide-react';
import { MiniCalendar } from './MiniCalendar';
import { CalendarFilterState, CALENDAR_CATEGORY_CONFIG } from '../types';

interface CalendarSidebarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  onCreateEvent: () => void;
  filterState: CalendarFilterState;
  onToggleFilter: (category: keyof CalendarFilterState) => void;
  onExportIcal?: () => void;
  onSubscribeFeed?: () => void;
  onSyncGoogle?: () => void;
  isSyncing?: boolean;
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  currentDate,
  onDateSelect,
  onCreateEvent,
  filterState,
  onToggleFilter,
  onExportIcal,
  onSubscribeFeed,
  onSyncGoogle,
  isSyncing = false,
}) => {
  const filterKeys: Array<keyof CalendarFilterState> = [
    'operation',
    'leave',
    'meeting',
    'notification',
    'google',
    'general',
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-5">
      {/* ── Prominent Google Calendar Create Button ── */}
      <button
        type="button"
        onClick={onCreateEvent}
        className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-md hover:shadow-lg hover:border-primary-400 dark:hover:border-primary-600 transition-all group font-semibold text-sm w-full sm:w-auto lg:w-full justify-center sm:justify-start"
      >
        <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
          <Plus className="w-5 h-5" />
        </div>
        <span>สร้างกิจกรรม / ลงเวร</span>
      </button>

      {/* ── Mini Interactive Datepicker Calendar ── */}
      <div className="hidden sm:block">
        <MiniCalendar
          currentDate={currentDate}
          selectedDate={currentDate}
          onSelectDate={onDateSelect}
        />
      </div>

      {/* ── My Calendars / Category Filters ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary-500" />
            <span>ปฏิทินของฉัน</span>
          </h3>
          {onSyncGoogle && (
            <button
              type="button"
              onClick={onSyncGoogle}
              disabled={isSyncing}
              title="ซิงค์ Google Calendar"
              className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 p-1 rounded-md transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-primary-500' : ''}`} />
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {filterKeys.map((key) => {
            const config = CALENDAR_CATEGORY_CONFIG[key];
            if (!config) return null;
            const isChecked = filterState[key];

            return (
              <label
                key={key}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors select-none text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <div
                  onClick={() => onToggleFilter(key)}
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    isChecked
                      ? `${config.dotColor} border-transparent text-white shadow-2xs`
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="truncate flex-1">{config.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ── Export / Sync Options ── */}
      <div className="space-y-2">
        {onSubscribeFeed && (
          <button
            type="button"
            onClick={onSubscribeFeed}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/60 rounded-xl border border-primary-200 dark:border-primary-800 transition-colors shadow-2xs"
          >
            <Radio className="w-3.5 h-3.5 text-primary-500 animate-pulse" />
            <span>สมัครรับปฏิทินสด (Live Sync)</span>
          </button>
        )}

        {onExportIcal && (
          <button
            type="button"
            onClick={onExportIcal}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออกไฟล์ iCal (.ics)</span>
          </button>
        )}
      </div>
    </aside>
  );
};
