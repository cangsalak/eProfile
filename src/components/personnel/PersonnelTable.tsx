import React from 'react';
import { Personnel } from '@/types/personnel';

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
}: PersonnelTableProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400 mb-3 block"></i>
        <p className="text-sm text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
      <thead className="bg-slate-700/80 text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-600/50">
        <tr>
          <th className="px-4 py-4 w-12 text-center">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-800 cursor-pointer"
              checked={currentItems.length > 0 && selectedIds.length === currentItems.length}
              onChange={toggleSelectAll}
            />
          </th>
          <th className="px-6 py-4 font-medium whitespace-nowrap">รหัสพนักงาน</th>
          <th className="px-6 py-4 font-medium whitespace-nowrap">ชื่อ-นามสกุล</th>
          <th className="px-6 py-4 font-medium whitespace-nowrap">ประเภทกำลังพล</th>
          <th className="px-6 py-4 font-medium whitespace-nowrap">ตำแหน่ง / หน่วยงาน</th>
          <th className="px-6 py-4 font-medium whitespace-nowrap">สถานะ</th>
          <th className="px-6 py-4 font-medium whitespace-nowrap text-right">จัดการ</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-700/50">
        {currentItems.length === 0 ? (
          <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">ไม่มีข้อมูล</td></tr>
        ) : (
          currentItems.map((person) => (
            <tr key={person.id} className="hover:bg-slate-700/40 transition-colors">
              <td className="px-4 py-4 text-center">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-800 cursor-pointer"
                  checked={selectedIds.includes(person.id)}
                  onChange={() => toggleSelectPerson(person.id)}
                />
              </td>
              <td className="px-6 py-4 font-mono text-primary-300">{person.badgeNo}</td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-900 dark:text-white font-bold text-xs overflow-hidden"
                    style={{ backgroundColor: person.avatarColor && !person.avatarColor.startsWith('data:image') ? person.avatarColor : '#e2e8f0' }}
                  >
                    {person.avatarColor && person.avatarColor.startsWith('data:image') ? (
                        <img src={person.avatarColor} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        person.firstName[0]
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{person.prefix}{person.firstName} {person.lastName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{person.username || '-'}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs border border-slate-300 dark:border-slate-600">
                  {person.personnelType || 'นายทหารสัญญาบัตร'}
                </span>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-slate-800 dark:text-slate-200">{person.position}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{person.department}</p>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">
                  {person.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setLeaveModalPerson(person)}
                    className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-transparent hover:border-orange-500/30 transition-all flex items-center justify-center"
                    title="จัดการการลา"
                  >
                    <i className="fa-solid fa-calendar-check"></i>
                  </button>
                  <button
                    onClick={() => {
                      setEditingPerson(person);
                      setIsAddModalOpen(true);
                    }}
                    className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-transparent hover:border-blue-500/30 transition-all flex items-center justify-center"
                    title="แก้ไข"
                  >
                    <i className="fa-solid fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(person.id, person.firstName)}
                    className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all flex items-center justify-center"
                    title="ลบข้อมูล"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
