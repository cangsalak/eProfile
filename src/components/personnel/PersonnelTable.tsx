import React from 'react';
import { Personnel } from '@/types/personnel';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface PersonnelTableProps {
  isLoading: boolean;
  currentItems: Personnel[];
  selectedIds: string[];
  toggleSelectAll: () => void;
  toggleSelectPerson: (id: string) => void;
  setLeaveModalPerson: (person: Personnel) => void;
  setEditingPerson: (person: Personnel) => void;
  setIsAddModalOpen: (isOpen: boolean) => void;
  handleDelete: (id: string, name: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (field: string) => void;
}

export default function PersonnelTable({
  isLoading,
  currentItems,
  selectedIds,
  toggleSelectAll,
  toggleSelectPerson,
  setLeaveModalPerson,
  setEditingPerson,
  setIsAddModalOpen,
  handleDelete,
  sortBy,
  sortOrder,
  onSortChange,
}: PersonnelTableProps) {
  const renderSortIcon = (field: string) => {
    if (!onSortChange) return null;
    if (sortBy === field) {
      return sortOrder === 'asc' ? (
        <ArrowUp className="w-3.5 h-3.5 text-primary-500 inline ml-1" />
      ) : (
        <ArrowDown className="w-3.5 h-3.5 text-primary-500 inline ml-1" />
      );
    }
    return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-40 hover:opacity-100 inline ml-1 transition-opacity" />;
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary-500 mb-3 block"></i>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูลกำลังพล...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
        <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3.5 w-12 text-center">
              <input 
                type="checkbox" 
                aria-label="เลือกกำลังพลทั้งหมด"
                className="w-4 h-4 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 cursor-pointer"
                checked={currentItems.length > 0 && selectedIds.length === currentItems.length}
                onChange={toggleSelectAll}
              />
            </th>
            <th 
              className={`px-6 py-3.5 font-semibold whitespace-nowrap ${onSortChange ? 'cursor-pointer hover:text-primary-600 select-none' : ''}`}
              onClick={() => onSortChange && onSortChange('badgeNo')}
            >
              หมายเลขประจำตัว {renderSortIcon('badgeNo')}
            </th>
            <th 
              className={`px-6 py-3.5 font-semibold whitespace-nowrap ${onSortChange ? 'cursor-pointer hover:text-primary-600 select-none' : ''}`}
              onClick={() => onSortChange && onSortChange('firstName')}
            >
              ชื่อ-นามสกุล {renderSortIcon('firstName')}
            </th>
            <th 
              className={`px-6 py-3.5 font-semibold whitespace-nowrap ${onSortChange ? 'cursor-pointer hover:text-primary-600 select-none' : ''}`}
              onClick={() => onSortChange && onSortChange('personnelType')}
            >
              ประเภทกำลังพล {renderSortIcon('personnelType')}
            </th>
            <th 
              className={`px-6 py-3.5 font-semibold whitespace-nowrap ${onSortChange ? 'cursor-pointer hover:text-primary-600 select-none' : ''}`}
              onClick={() => onSortChange && onSortChange('department')}
            >
              ตำแหน่ง / สังกัด {renderSortIcon('department')}
            </th>
            <th 
              className={`px-6 py-3.5 font-semibold whitespace-nowrap ${onSortChange ? 'cursor-pointer hover:text-primary-600 select-none' : ''}`}
              onClick={() => onSortChange && onSortChange('status')}
            >
              สถานะ {renderSortIcon('status')}
            </th>
            <th className="px-6 py-3.5 font-semibold whitespace-nowrap text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {currentItems.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center">
                  <i className="fa-solid fa-user-slash text-3xl mb-2 opacity-40"></i>
                  <p className="font-medium">ไม่พบข้อมูลกำลังพลตามเงื่อนไขที่เลือก</p>
                </div>
              </td>
            </tr>
          ) : (
            currentItems.map((person) => (
              <tr key={person.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-4 py-3.5 text-center">
                  <input 
                    type="checkbox" 
                    aria-label={`เลือกกำลังพล ${person.firstName} ${person.lastName}`}
                    className="w-4 h-4 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    checked={selectedIds.includes(person.id)}
                    onChange={() => toggleSelectPerson(person.id)}
                  />
                </td>
                <td className="px-6 py-3.5 font-mono font-medium text-primary-600 dark:text-primary-400">
                  {person.badgeNo}
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-900 dark:text-white font-bold text-xs overflow-hidden shrink-0"
                      style={{ backgroundColor: person.avatarColor && !person.avatarColor.startsWith('data:image') ? person.avatarColor : '#e2e8f0' }}
                    >
                      {person.avatarColor && person.avatarColor.startsWith('data:image') ? (
                        <img src={person.avatarColor} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        person.firstName[0]
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {person.prefix}{person.firstName} {person.lastName}
                        </p>
                        {person.currentLeave && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs animate-pulse"
                            title={`กำลังลา: ${person.currentLeave.leaveType} (${new Date(person.currentLeave.startDate).toLocaleDateString('th-TH')} - ${new Date(person.currentLeave.endDate).toLocaleDateString('th-TH')})`}
                          >
                            <i className="fa-solid fa-plane-departure text-[9px]"></i>
                            <span>ลา: {person.currentLeave.leaveType}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{person.username || '-'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700 font-medium">
                    {person.personnelType || 'นายทหารสัญญาบัตร'}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{person.position}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {person.department} {person.subDepartment ? `(${person.subDepartment})` : ''}
                  </p>
                </td>
                <td className="px-6 py-3.5">
                  {person.currentLeave ? (
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
                        <i className="fa-solid fa-umbrella-beach text-[11px]"></i>
                        <span>ลา: {person.currentLeave.leaveType}</span>
                      </span>
                      <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">
                        ถึง {new Date(person.currentLeave.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  ) : (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      person.status === 'ปฏิบัติงานปกติ'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}>
                      {person.status}
                    </span>
                  )}
                </td>
                <td className="px-6 py-3.5 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    {person.currentLeave && (
                      <button
                        onClick={() => setLeaveModalPerson(person)}
                        className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-600 text-white border border-amber-600 shadow-xs transition-all flex items-center justify-center relative"
                        title={`กำลังลา (${person.currentLeave.leaveType}) - คลิกเพื่อดูประวัติการลา`}
                        aria-label={`ดูประวัติการลาของ ${person.firstName} ${person.lastName}`}
                      >
                        <i className="fa-solid fa-calendar-check text-xs"></i>
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-ping"></span>
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingPerson(person);
                        setIsAddModalOpen(true);
                      }}
                      className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/50 transition-all flex items-center justify-center"
                      title="แก้ไข"
                      aria-label={`แก้ไขข้อมูล ${person.firstName} ${person.lastName}`}
                    >
                      <i className="fa-solid fa-edit text-xs"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(person.id, `${person.prefix}${person.firstName} ${person.lastName}`)}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/50 transition-all flex items-center justify-center"
                      title="ลบข้อมูล"
                      aria-label={`ลบข้อมูล ${person.firstName} ${person.lastName}`}
                    >
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
