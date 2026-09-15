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
          className={`w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-xl transition-all duration-200
            ${
              isSelected
                ? 'bg-primary-600 text-white font-bold shadow-sm shadow-primary-500/30 scale-105'
                : isToday
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 font-bold border border-primary-200 dark:border-primary-800/60'
                : isCurrentMonth
                ? 'text-slate-700 dark:text-slate-200 hover:bg-primary-50/60 dark:hover:bg-slate-800/80 hover:text-primary-600'
                : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-850'
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
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
          {format(miniDate, 'MMMM yyyy', { locale: th })}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMiniDate(subMonths(miniDate, 1))}
            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 hover:bg-primary-50/60 dark:hover:bg-slate-800 rounded-lg transition-all"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setMiniDate(addMonths(miniDate, 1))}
            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 hover:bg-primary-50/60 dark:hover:bg-slate-800 rounded-lg transition-all"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 place-items-center mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
        {daysOfWeek.map((d, i) => (
          <span
            key={i}
            className={`text-[10px] font-bold ${
              i === 0 ? 'text-rose-500' : i === 6 ? 'text-primary-500' : 'text-slate-400 dark:text-slate-500'
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

export default MiniCalendar;
