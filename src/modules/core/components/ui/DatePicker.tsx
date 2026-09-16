'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  THAI_MONTHS,
  THAI_DAYS_SHORT,
  toBuddhistYear,
  toChristianYear,
  parseDate,
  formatThaiDate,
  formatToISODate,
} from '@/modules/core/lib/date-utils';

export interface DatePickerProps {
  id?: string;
  name?: string;
  label?: string;
  value?: string | Date | null;
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: string | Date;
  maxDate?: string | Date;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  format?: 'iso' | 'thai-be'; // 'iso' = 'YYYY-MM-DD', 'thai-be' = 'DD/MM/YYYY (BE)'
}

export function DatePicker({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = 'เลือกวันที่ (พ.ศ.)',
  minDate,
  maxDate,
  disabled = false,
  required = false,
  error,
  helperText,
  className = '',
  format = 'iso',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsedValue = parseDate(value);
  const today = new Date();

  // Current viewed month and year (stored in CE)
  const [viewYear, setViewYear] = useState<number>(parsedValue ? parsedValue.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(parsedValue ? parsedValue.getMonth() : today.getMonth());

  // Keep view in sync when value changes externally
  useEffect(() => {
    const parsed = parseDate(value);
    if (parsed) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDate = (day: number) => {
    const selected = new Date(viewYear, viewMonth, day);
    if (format === 'thai-be') {
      const dd = String(day).padStart(2, '0');
      const mm = String(viewMonth + 1).padStart(2, '0');
      const beYear = toBuddhistYear(viewYear);
      onChange(`${dd}/${mm}/${beYear}`);
    } else {
      onChange(formatToISODate(selected));
    }
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    if (format === 'thai-be') {
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const beYear = toBuddhistYear(now.getFullYear());
      onChange(`${dd}/${mm}/${beYear}`);
    } else {
      onChange(formatToISODate(now));
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  // Calendar calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
  const beYear = toBuddhistYear(viewYear);

  // Years range for dropdown (100 years back, 20 years forward in BE)
  const currentBeYear = toBuddhistYear(today.getFullYear());
  const yearOptions: number[] = [];
  for (let y = currentBeYear - 90; y <= currentBeYear + 15; y++) {
    yearOptions.push(y);
  }

  // Display text in input
  const displayText = parsedValue ? formatThaiDate(parsedValue) : '';

  return (
    <div className={`relative flex flex-col gap-1.5 font-prompt ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
        >
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
          <span className="text-[11px] font-normal text-slate-400">พ.ศ.</span>
        </label>
      )}

      {/* Date Input Button */}
      <div className="relative">
        <button
          type="button"
          id={id}
          name={name}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between text-left text-xs px-3.5 py-2.5 rounded-xl border transition-all duration-200 shadow-sm ${
            error
              ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 dark:border-rose-800 dark:bg-rose-950/20 dark:text-rose-200'
              : 'border-slate-200 bg-slate-50/50 text-slate-800 hover:border-slate-300 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:bg-slate-800'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800/80' : 'cursor-pointer'}`}
        >
          <span className="flex items-center gap-2.5 truncate">
            <i className="fa-solid fa-calendar-days text-primary-500 text-sm shrink-0" />
            <span className={displayText ? 'font-medium text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}>
              {displayText || placeholder}
            </span>
          </span>
          <span className="flex items-center gap-1 shrink-0 ml-2">
            {displayText && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                title="ล้างวันที่"
              >
                <i className="fa-solid fa-xmark text-xs" />
              </span>
            )}
            <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </span>
        </button>
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-72 sm:w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-850 dark:shadow-black/40 backdrop-blur-xl animate-fade-in">
          {/* Header Controls */}
          <div className="flex items-center justify-between gap-1 pb-3 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              title="เดือนก่อนหน้า"
            >
              <i className="fa-solid fa-chevron-left text-xs" />
            </button>

            <div className="flex items-center gap-1.5">
              {/* Month Selector */}
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="form-select py-1 px-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                {THAI_MONTHS.map((m, idx) => (
                  <option key={idx} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Buddhist Era Year Selector */}
              <select
                value={beYear}
                onChange={(e) => {
                  const selectedBe = parseInt(e.target.value, 10);
                  setViewYear(toChristianYear(selectedBe));
                }}
                className="form-select py-1 px-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    พ.ศ. {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              title="เดือนถัดไป"
            >
              <i className="fa-solid fa-chevron-right text-xs" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 py-2 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500">
            {THAI_DAYS_SHORT.map((day, idx) => (
              <div key={idx} className={idx === 0 ? 'text-rose-500' : ''}>
                {day}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="h-8" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                parsedValue &&
                parsedValue.getDate() === day &&
                parsedValue.getMonth() === viewMonth &&
                parsedValue.getFullYear() === viewYear;

              const isToday =
                today.getDate() === day &&
                today.getMonth() === viewMonth &&
                today.getFullYear() === viewYear;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDate(day)}
                  className={`h-8 w-full rounded-lg text-xs font-medium transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold shadow-md shadow-primary-500/30'
                      : isToday
                      ? 'border border-primary-500 text-primary-600 dark:text-primary-400 font-semibold bg-primary-50/50 dark:bg-primary-950/20'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800">
            <button
              type="button"
              onClick={handleSetToday}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              วันนี้
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
              >
                ล้างค่า
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-[11px] text-rose-500 animate-fade-in">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-slate-400">{helperText}</p>}
    </div>
  );
}
