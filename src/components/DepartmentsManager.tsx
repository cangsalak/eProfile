'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export interface SubDepartment {
  name: string;
  shortName?: string;
}

export interface Department {
  id: string;
  name: string;
  shortName?: string;
  subDepartments?: string | SubDepartment[]; // JSON string or parsed array
  sortOrder?: number;
}

export default function DepartmentsManager() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [personnelCounts, setPersonnelCounts] = useState<{ [deptName: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Add Department Form
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptShortName, setNewDeptShortName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit Department Form
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editDeptName, setEditDeptName] = useState('');
  const [editDeptShortName, setEditDeptShortName] = useState('');

  // SubDepartment Add/Edit Modal
  const [activeDeptForSub, setActiveDeptForSub] = useState<Department | null>(null);
  const [newSubName, setNewSubName] = useState('');
  const [newSubShortName, setNewSubShortName] = useState('');

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/departments');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setDepartments(data);
      }
      
      // Also fetch personnel to calculate counts
      const pRes = await fetch('/api/personnel');
      if (pRes.ok) {
        const pList = await pRes.json();
        if (Array.isArray(pList)) {
          const counts: { [deptName: string]: number } = {};
          pList.forEach((p: any) => {
            if (p.department) {
              counts[p.department] = (counts[p.department] || 0) + 1;
            }
          });
          setPersonnelCounts(counts);
        }
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const parseSubDepts = (subDepts: any): SubDepartment[] => {
    if (!subDepts) return [];
    if (Array.isArray(subDepts)) return subDepts;
    try {
      const parsed = JSON.parse(subDepts);
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          if (typeof item === 'string') return { name: item, shortName: '' };
          return item;
        });
      }
    } catch (_) {}
    return [];
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDeptName.trim(),
          shortName: newDeptShortName.trim(),
          subDepartments: [],
        }),
      });

      if (res.ok) {
        setNewDeptName('');
        setNewDeptShortName('');
        setIsAdding(false);
        fetchDepartments();
        toast.success('เพิ่มหน่วยงานสำเร็จ');
      } else {
        const error = await res.json();
        toast.error(error.error || 'ไม่สามารถเพิ่มหน่วยงานได้');
      }
    } catch (err) {
      toast.error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  const handleUpdateDepartment = async (id: string) => {
    if (!editDeptName.trim()) return;
    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editDeptName.trim(),
          shortName: editDeptShortName.trim(),
        }),
      });
      if (res.ok) {
        setEditingDeptId(null);
        fetchDepartments();
        toast.success('อัปเดตข้อมูลหน่วยงานสำเร็จ');
      } else {
        const error = await res.json();
        toast.error(error.error || 'เกิดข้อผิดพลาดในการอัปเดต');
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบหน่วยงาน "${name}" และแผนกย่อยทั้งหมด?`)) return;
    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDepartments();
        toast.success('ลบหน่วยงานสำเร็จ');
      } else {
        toast.error('ไม่สามารถลบหน่วยงานได้');
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการลบหน่วยงาน');
    }
  };

  const handleAddSubDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDeptForSub || !newSubName.trim()) return;

    const currentSubs = parseSubDepts(activeDeptForSub.subDepartments);
    if (currentSubs.some(s => s.name.toLowerCase() === newSubName.trim().toLowerCase())) {
      toast.error('มีแผนก/หมวดชื่อนี้อยู่ในกองนี้แล้ว');
      return;
    }

    const updatedSubs = [
      ...currentSubs,
      { name: newSubName.trim(), shortName: newSubShortName.trim() }
    ];

    try {
      const res = await fetch(`/api/departments/${activeDeptForSub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activeDeptForSub.name,
          subDepartments: updatedSubs,
        }),
      });

      if (res.ok) {
        setNewSubName('');
        setNewSubShortName('');
        fetchDepartments();
        // update local active
        setActiveDeptForSub(prev => prev ? { ...prev, subDepartments: updatedSubs } : null);
        toast.success('เพิ่มแผนก/หมวดย่อยสำเร็จ');
      } else {
        toast.error('ไม่สามารถเพิ่มแผนก/หมวดได้');
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const handleDeleteSubDepartment = async (dept: Department, subIndex: number) => {
    const currentSubs = parseSubDepts(dept.subDepartments);
    const subToDelete = currentSubs[subIndex];
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบแผนก/หมวด "${subToDelete.name}"?`)) return;

    const updatedSubs = currentSubs.filter((_, i) => i !== subIndex);

    try {
      const res = await fetch(`/api/departments/${dept.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dept.name,
          subDepartments: updatedSubs,
        }),
      });

      if (res.ok) {
        fetchDepartments();
        if (activeDeptForSub?.id === dept.id) {
          setActiveDeptForSub(prev => prev ? { ...prev, subDepartments: updatedSubs } : null);
        }
        toast.success('ลบแผนก/หมวดย่อยสำเร็จ');
      } else {
        toast.error('ไม่สามารถลบแผนก/หมวดได้');
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Header Info & Add Main Unit Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-sitemap text-primary-500"></i>
            โครงสร้างการจัดหน่วย (Military Organizational Hierarchy)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            จัดการกอง, ฝ่าย, กองร้อย พร้อมชื่อเต็ม คำย่อ และโครงสร้างแผนก/หมวด/ตอน/ชุด ภายในหน่วย
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/25 transition-all text-xs font-semibold flex items-center gap-2 shrink-0"
        >
          <i className={`fa-solid ${isAdding ? 'fa-xmark' : 'fa-plus'}`}></i>
          <span>{isAdding ? 'ยกเลิก' : 'เพิ่มกอง / ฝ่าย / กองร้อย'}</span>
        </button>
      </div>

      {/* Add Department Form Panel */}
      {isAdding && (
        <form onSubmit={handleAddDepartment} className="bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800/50 rounded-2xl p-5 shadow-sm animate-fade-in">
          <h4 className="text-xs font-bold text-primary-900 dark:text-primary-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <i className="fa-solid fa-folder-plus"></i> เพิ่มกอง / ฝ่าย / กองร้อย ใหม่
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ชื่อเต็ม (Full Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="เช่น กองการศึกษา, กองร้อยฝึกรบพิเศษที่ 1, ฝ่ายส่งกำลังบำรุง"
                className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-2xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                คำย่อ (Short Name / Abbr)
              </label>
              <input
                type="text"
                value={newDeptShortName}
                onChange={(e) => setNewDeptShortName(e.target.value)}
                placeholder="เช่น กศ., ร้อย.1, ฝกบ."
                className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-2xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-primary-500/20"
            >
              บันทึกหน่วยงาน
            </button>
          </div>
        </form>
      )}

      {/* Departments List / Hierarchy Tree */}
      {isLoading ? (
        <div className="text-center py-16">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary-500 mb-3"></i>
          <p className="text-xs text-slate-500">กำลังโหลดโครงสร้างหน่วยงาน...</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <i className="fa-solid fa-sitemap text-4xl text-slate-300 dark:text-slate-600 mb-3"></i>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">ยังไม่มีข้อมูลหน่วยงาน</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">กดปุ่ม "เพิ่มกอง / ฝ่าย / กองร้อย" เพื่อเริ่มต้นสร้างโครงสร้างหน่วย</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {departments.map((dept) => {
            const subDepts = parseSubDepts(dept.subDepartments);
            const count = personnelCounts[dept.name] || 0;
            const isEditing = editingDeptId === dept.id;

            return (
              <div
                key={dept.id}
                className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                {/* Main Department Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  {isEditing ? (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                      <input
                        type="text"
                        value={editDeptName}
                        onChange={(e) => setEditDeptName(e.target.value)}
                        placeholder="ชื่อเต็มหน่วยงาน"
                        className="sm:col-span-2 h-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-xs text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={editDeptShortName}
                        onChange={(e) => setEditDeptShortName(e.target.value)}
                        placeholder="คำย่อ"
                        className="h-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm shrink-0 border border-primary-100 dark:border-primary-900">
                        <i className="fa-solid fa-shield-halved"></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {dept.name}
                          </h4>
                          {dept.shortName && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px] font-semibold">
                              ({dept.shortName})
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-200 dark:border-emerald-900">
                            {count} นาย
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {subDepts.length > 0 ? `ประกอบด้วย ${subDepts.length} แผนก/หมวดย่อย` : 'ยังไม่มีแผนกย่อย'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions on Department */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleUpdateDepartment(dept.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <i className="fa-solid fa-check"></i> บันทึก
                        </button>
                        <button
                          onClick={() => setEditingDeptId(null)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium"
                        >
                          ยกเลิก
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setActiveDeptForSub(dept);
                            setNewSubName('');
                            setNewSubShortName('');
                          }}
                          className="px-2.5 py-1.5 bg-primary-50 dark:bg-primary-950/50 hover:bg-primary-100 dark:hover:bg-primary-900/60 text-primary-600 dark:text-primary-300 rounded-lg text-xs font-medium flex items-center gap-1 border border-primary-200/50 dark:border-primary-800/50 transition-all"
                          title="เพิ่มแผนก/หมวดย่อย"
                        >
                          <i className="fa-solid fa-plus text-[10px]"></i>
                          <span>เพิ่มแผนกย่อย</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingDeptId(dept.id);
                            setEditDeptName(dept.name);
                            setEditDeptShortName(dept.shortName || '');
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                          title="แก้ไขชื่อหน่วยงาน"
                        >
                          <i className="fa-solid fa-pen-to-square text-xs"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                          className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
                          title="ลบหน่วยงาน"
                        >
                          <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Sub-departments (แผนก / หมวด / ตอน / ชุด) Pills Grid */}
                <div className="pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <i className="fa-solid fa-turn-down-right text-primary-400"></i> แผนก / หมวด / ตอน / ชุด ในสังกัด:
                    </span>
                  </div>

                  {subDepts.length === 0 ? (
                    <div className="text-xs text-slate-400 italic py-1 pl-4">
                      ไม่มีแผนกย่อย (กำลังพลสังกัดกองโดยตรง หรือกดปุ่ม "เพิ่มแผนกย่อย" เพื่อระบุ)
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {subDepts.map((sub, idx) => (
                        <div
                          key={idx}
                          className="group flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-primary-400 dark:hover:border-primary-600 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 transition-all"
                        >
                          <span className="font-medium">{sub.name}</span>
                          {sub.shortName && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({sub.shortName})
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteSubDepartment(dept, idx)}
                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all ml-1"
                            title={`ลบ ${sub.name}`}
                          >
                            <i className="fa-solid fa-circle-xmark text-xs"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Sub-department Modal */}
      {activeDeptForSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-plus-circle text-primary-500"></i>
                เพิ่มแผนก/หมวดย่อย
              </h3>
              <button 
                onClick={() => setActiveDeptForSub(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">สังกัดกอง/ฝ่าย:</p>
              <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-0.5">
                {activeDeptForSub.name} {activeDeptForSub.shortName ? `(${activeDeptForSub.shortName})` : ''}
              </p>
            </div>

            <form onSubmit={handleAddSubDepartment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อเต็มแผนก / หมวด / ตอน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น แผนกวิชาทหาร, หมวดฝึกที่ 1, ตอนส่งกำลัง"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  คำย่อแผนก / หมวด (ถ้ามี)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ผบท., มว.1, ตอน กบ."
                  value={newSubShortName}
                  onChange={(e) => setNewSubShortName(e.target.value)}
                  className="w-full h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveDeptForSub(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium"
                >
                  ปิด
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-primary-500/25"
                >
                  + เพิ่มแผนกย่อย
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
