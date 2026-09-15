'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Search } from 'lucide-react';

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
    <Card variant="convex" className="p-4 sm:p-5 mb-6 rounded-[24px]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Search Box */}
        <div className="lg:col-span-5 relative">
          <label htmlFor="directorySearchInput" className="sr-only">
            ค้นหาบุคลากร
          </label>
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="directorySearchInput"
            type="text"
            aria-label="ค้นหาชื่อ, ยศ, ตำแหน่ง, เลขประจำตัว"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ, ยศ, ตำแหน่ง, เลขประจำตัว..."
            className="form-input text-xs sm:text-sm w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Department Pills */}
        <div className="lg:col-span-7 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none items-center">
          {departments.map((dept) => {
            const isSelected = selectedDept === dept;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-primary-600 text-white font-bold shadow-xs shadow-primary-500/25 scale-[1.02]'
                    : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-750 hover:text-primary-600 dark:hover:text-primary-400 border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
