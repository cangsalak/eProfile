'use client';

import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
} from 'date-fns';
import { th } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniCalendarProps {
  currentDate: Date;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  currentDate,
  selectedDate,
  onSelectDate,
}) => {
  const [miniDate, setMiniDate] = useState<Date>(currentDate || new Date());

  const monthStart = startOfMonth(miniDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const daysOfWeek = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isToday = isSameDay(day, new Date());
      const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

      days.push(
        <button
          key={day.toISOString()}
          onClick={() => {
            onSelectDate(cloneDay);
            setMiniDate(cloneDay);
          }}
          type="button"
          className={`w-7 h-7 flex items-center justify-center text-xs font-medium rounded-full transition-all duration-150
            ${
              isSelected
                ? 'bg-primary-600 text-white font-bold shadow-sm shadow-primary-500/30 ring-2 ring-primary-400/40'
                : isToday
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 font-bold'
                : isCurrentMonth
                ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/30'
            }
          `}
        >
          {format(day, 'd')}
        </button>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div key={day.toISOString()} className="grid grid-cols-7 gap-1 place-items-center mb-1">
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {format(miniDate, 'MMMM yyyy', { locale: th })}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMiniDate(subMonths(miniDate, 1))}
            className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setMiniDate(addMonths(miniDate, 1))}
            className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 place-items-center mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
        {daysOfWeek.map((d, i) => (
          <span
            key={i}
            className={`text-[10px] font-semibold ${
              i === 0 ? 'text-rose-500' : i === 6 ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {d}
          </span>
        ))}
      </div>

      <div>{rows}</div>
    </div>
  );
};
