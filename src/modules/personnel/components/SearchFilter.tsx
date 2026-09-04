'use client';

import React from 'react';

interface SearchFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  departments: string[];
  selectedDept: string;
  setSelectedDept: (dept: string) => void;
}

export default function SearchFilter({
  searchQuery,
  setSearchQuery,
  departments,
  selectedDept,
  setSelectedDept,
}: SearchFilterProps) {
  return (
    <div className="glass-card p-4 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="relative">
          <label htmlFor="directorySearchInput" className="sr-only">ค้นหาบุคลากร</label>
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"></i>
          <input
            id="directorySearchInput"
            type="text"
            aria-label="ค้นหาชื่อ, ยศ, ตำแหน่ง, เลขประจำตัว"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ, ยศ, ตำแหน่ง, เลขประจำตัว..."
            className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-4 py-2 rounded-full text-xs whitespace-nowrap transition-all ${
                selectedDept === dept
                  ? 'bg-primary-600 text-white font-medium shadow-md shadow-primary-600/40'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-white'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
