import React from 'react';

export interface TablePaginationProps {
  isLoading?: boolean;
  totalItems: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  unitName?: string;
  setPageSize?: (size: number) => void;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
}

export default function TablePagination({
  isLoading = false,
  totalItems,
  indexOfFirstItem,
  indexOfLastItem,
  currentPage,
  totalPages,
  pageSize = 20,
  unitName = 'รายการ',
  setPageSize,
  setCurrentPage,
}: TablePaginationProps) {
  if (isLoading || totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-400">
      {/* Left: Metadata & Page size selector */}
      <div className="flex items-center gap-3">
        <div>
          แสดง <span className="font-semibold text-slate-900 dark:text-white">{indexOfFirstItem + 1}</span> ถึง{' '}
          <span className="font-semibold text-slate-900 dark:text-white">
            {Math.min(indexOfLastItem, totalItems)}
          </span>{' '}
          จากทั้งหมด <span className="font-bold text-primary-600 dark:text-primary-400">{totalItems.toLocaleString()}</span> {unitName}
        </div>

        {setPageSize && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-300 dark:border-slate-700">
            <label htmlFor="table-page-size-select" className="cursor-pointer text-xs text-slate-600 dark:text-slate-400">
              แสดงหน้าละ:
            </label>
            <select
              id="table-page-size-select"
              aria-label="จำนวนรายการต่อหน้า"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer text-slate-800 dark:text-slate-200"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation */}
      <div className="flex items-center space-x-1.5">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors shadow-xs"
        >
          ก่อนหน้า
        </button>

        <div className="flex items-center space-x-1">
          {[...Array(totalPages)].map((_, idx) => {
            const page = idx + 1;
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs transition-all ${
                    currentPage === page
                      ? 'bg-primary-600 text-white font-bold shadow-sm shadow-primary-500/20'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium'
                  }`}
                >
                  {page}
                </button>
              );
            }
            if (page === currentPage - 2 || page === currentPage + 2) {
              return (
                <span key={page} className="px-1 text-slate-400">
                  ...
                </span>
              );
            }
            return null;
          })}
        </div>

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors shadow-xs"
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}
