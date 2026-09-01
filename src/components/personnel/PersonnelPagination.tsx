import React from 'react';

interface PersonnelPaginationProps {
  isLoading: boolean;
  totalItems: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
}

export default function PersonnelPagination({
  isLoading,
  totalItems,
  indexOfFirstItem,
  indexOfLastItem,
  currentPage,
  totalPages,
  setCurrentPage,
}: PersonnelPaginationProps) {
  if (isLoading || totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-300 dark:border-slate-600/50 bg-slate-100/50 dark:bg-slate-800/80">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        แสดง <span className="font-medium text-slate-900 dark:text-white">{indexOfFirstItem + 1}</span> ถึง{' '}
        <span className="font-medium text-slate-900 dark:text-white">
          {Math.min(indexOfLastItem, totalItems)}
        </span>{' '}
        จากทั้งหมด <span className="font-medium text-slate-900 dark:text-white">{totalItems}</span> รายการ
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
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
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors ${
                    currentPage === page
                      ? 'bg-primary-500 text-white font-medium shadow-sm'
                      : 'bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                  }`}
                >
                  {page}
                </button>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return (
                <span key={page} className="text-slate-500 px-1">
                  ...
                </span>
              );
            }
            return null;
          })}
        </div>

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}
