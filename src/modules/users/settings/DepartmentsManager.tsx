'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/common/ConfirmModal';
import { Card, Button, Badge, Modal } from '@/components/ui';

export interface SubDepartmentNode {
  name: string;
  shortName?: string;
  children?: SubDepartmentNode[];
}

export interface Department {
  id: string;
  name: string;
  shortName?: string;
  subDepartments?: string | SubDepartmentNode[];
  sortOrder?: number;
}

export default function DepartmentsManager() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [personnelCounts, setPersonnelCounts] = useState<{ [deptName: string]: number }>({});
  const [subPersonnelCounts, setSubPersonnelCounts] = useState<{ [subName: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Add Department Form (Level 0: Main Unit)
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptShortName, setNewDeptShortName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit Department Form (Level 0: Main Unit)
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editDeptName, setEditDeptName] = useState('');
  const [editDeptShortName, setEditDeptShortName] = useState('');

  // SubDepartment Add Modal State (Levels 1, 2, 3)
  const [addSubTarget, setAddSubTarget] = useState<{
    dept: Department;
    parentPath: number[]; // [] = root of subDepartments, [0] = under 1st child, [0, 1] = under 2nd level child
    parentTitle: string;
    levelName: string;
    levelNumber: 1 | 2 | 3;
  } | null>(null);
  const [subFormName, setSubFormName] = useState('');
  const [subFormShortName, setSubFormShortName] = useState('');
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);

  // SubDepartment Edit Modal State
  const [editSubTarget, setEditSubTarget] = useState<{
    dept: Department;
    path: number[];
    originalName: string;
    name: string;
    shortName: string;
    levelName: string;
    syncPersonnel: boolean;
  } | null>(null);
  const [isSavingSub, setIsSavingSub] = useState(false);

  // Confirmation Modal state
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: 'dept'; id: string; name: string }
    | { type: 'sub'; dept: Department; path: number[]; name: string; hasChildren: boolean }
    | null
  >(null);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/departments');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setDepartments(data);
      }

      // Also fetch personnel to calculate counts
      const pRes = await fetch('/api/personnel?all=true');
      if (pRes.ok) {
        const rawData = await pRes.json();
        const pList = Array.isArray(rawData) ? rawData : rawData.data || [];
        if (Array.isArray(pList)) {
          const counts: { [deptName: string]: number } = {};
          const subCounts: { [subDeptKey: string]: number } = {};
          pList.forEach((p: any) => {
            if (p.department) {
              counts[p.department] = (counts[p.department] || 0) + 1;
            }
            if (p.subDepartment) {
              subCounts[p.subDepartment] = (subCounts[p.subDepartment] || 0) + 1;
            }
          });
          setPersonnelCounts(counts);
          setSubPersonnelCounts(subCounts);
        }
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Safe recursive parser for sub-departments
  const parseSubDepts = (subDepts: any): SubDepartmentNode[] => {
    if (!subDepts) return [];
    let rawList: any[] = [];
    if (Array.isArray(subDepts)) {
      rawList = subDepts;
    } else {
      try {
        const parsed = typeof subDepts === 'string' ? JSON.parse(subDepts) : subDepts;
        if (Array.isArray(parsed)) rawList = parsed;
      } catch (_) {
        return [];
      }
    }

    const normalizeNode = (item: any): SubDepartmentNode => {
      if (typeof item === 'string') {
        return { name: item, shortName: '', children: [] };
      }
      const childrenRaw = item.children || item.subDepartments;
      const children = Array.isArray(childrenRaw) ? childrenRaw.map(normalizeNode) : [];
      return {
        name: item.name || '',
        shortName: item.shortName || '',
        children,
      };
    };

    return rawList.map(normalizeNode);
  };

  // Tree manipulation helpers
  const addChildToTree = (
    tree: SubDepartmentNode[],
    parentPath: number[],
    newChild: SubDepartmentNode
  ): SubDepartmentNode[] => {
    if (parentPath.length === 0) {
      return [...tree, newChild];
    }
    const [head, ...tail] = parentPath;
    return tree.map((node, idx) => {
      if (idx === head) {
        return {
          ...node,
          children: addChildToTree(node.children || [], tail, newChild),
        };
      }
      return node;
    });
  };

  const updateNodeInTree = (
    tree: SubDepartmentNode[],
    targetPath: number[],
    updated: { name: string; shortName?: string }
  ): SubDepartmentNode[] => {
    const [head, ...tail] = targetPath;
    return tree.map((node, idx) => {
      if (idx === head) {
        if (tail.length === 0) {
          return {
            ...node,
            name: updated.name,
            shortName: updated.shortName,
          };
        }
        return {
          ...node,
          children: updateNodeInTree(node.children || [], tail, updated),
        };
      }
      return node;
    });
  };

  const removeNodeFromTree = (
    tree: SubDepartmentNode[],
    targetPath: number[]
  ): SubDepartmentNode[] => {
    const [head, ...tail] = targetPath;
    if (tail.length === 0) {
      return tree.filter((_, idx) => idx !== head);
    }
    return tree.map((node, idx) => {
      if (idx === head) {
        return {
          ...node,
          children: removeNodeFromTree(node.children || [], tail),
        };
      }
      return node;
    });
  };

  const isNameInTree = (tree: SubDepartmentNode[], name: string, excludePath?: number[]): boolean => {
    const checkRecursive = (nodes: SubDepartmentNode[], currentPath: number[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        const path = [...currentPath, i];
        if (excludePath && path.join(',') === excludePath.join(',')) {
          continue;
        }
        if (nodes[i].name.trim().toLowerCase() === name.trim().toLowerCase()) {
          return true;
        }
        if (nodes[i].children && nodes[i].children!.length > 0) {
          if (checkRecursive(nodes[i].children!, path)) return true;
        }
      }
      return false;
    };
    return checkRecursive(tree, []);
  };

  const saveDepartmentSubTree = async (
    dept: Department,
    updatedTree: SubDepartmentNode[],
    renameInfo?: { from: string; to: string }
  ) => {
    try {
      const res = await fetch(`/api/departments/${dept.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dept.name,
          subDepartments: updatedTree,
          renameSubDepartment: renameInfo,
        }),
      });

      if (res.ok) {
        await fetchDepartments();
        return true;
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        return false;
      }
    } catch (err) {
      console.error(err);
      toast.error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      return false;
    }
  };

  // Main Department Handlers
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
        const error = await res.json().catch(() => ({}));
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
        const error = await res.json().catch(() => ({}));
        toast.error(error.error || 'เกิดข้อผิดพลาดในการอัปเดต');
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const executeDeleteDepartment = async (id: string) => {
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
    } finally {
      setDeleteTarget(null);
    }
  };

  // SubDepartment Handlers
  const handleAddSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addSubTarget || !subFormName.trim()) return;

    const dept = addSubTarget.dept;
    const currentTree = parseSubDepts(dept.subDepartments);

    if (isNameInTree(currentTree, subFormName.trim())) {
      toast.error('มีชื่อหน่วยย่อยนี้อยู่ในโครงสร้างของหน่วยงานนี้แล้ว');
      return;
    }

    const newNode: SubDepartmentNode = {
      name: subFormName.trim(),
      shortName: subFormShortName.trim(),
      children: [],
    };

    const newTree = addChildToTree(currentTree, addSubTarget.parentPath, newNode);

    setIsSubmittingSub(true);
    const success = await saveDepartmentSubTree(dept, newTree);
    setIsSubmittingSub(false);

    if (success) {
      setAddSubTarget(null);
      setSubFormName('');
      setSubFormShortName('');
      toast.success(`เพิ่ม ${addSubTarget.levelName} สำเร็จ`);
    }
  };

  const handleEditSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSubTarget || !editSubTarget.name.trim()) return;

    const dept = editSubTarget.dept;
    const currentTree = parseSubDepts(dept.subDepartments);

    if (isNameInTree(currentTree, editSubTarget.name.trim(), editSubTarget.path)) {
      toast.error('มีชื่อหน่วยย่อยนี้อยู่ในโครงสร้างของหน่วยงานนี้แล้ว');
      return;
    }

    const newTree = updateNodeInTree(currentTree, editSubTarget.path, {
      name: editSubTarget.name.trim(),
      shortName: editSubTarget.shortName.trim(),
    });

    setIsSavingSub(true);
    const success = await saveDepartmentSubTree(
      dept,
      newTree,
      editSubTarget.syncPersonnel && editSubTarget.originalName !== editSubTarget.name.trim()
        ? { from: editSubTarget.originalName, to: editSubTarget.name.trim() }
        : undefined
    );
    setIsSavingSub(false);

    if (success) {
      setEditSubTarget(null);
      toast.success('แก้ไขข้อมูลหน่วยย่อยสำเร็จ');
    }
  };

  const executeDeleteSubNode = async (dept: Department, path: number[]) => {
    const currentTree = parseSubDepts(dept.subDepartments);
    const newTree = removeNodeFromTree(currentTree, path);
    const success = await saveDepartmentSubTree(dept, newTree);
    if (success) {
      toast.success('ลบหน่วยย่อยสำเร็จ');
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 pt-2 font-prompt">
      {/* Header Info & Add Main Unit Button */}
      <Card variant="convex" className="p-5 sm:p-6 rounded-[24px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-sitemap text-primary-500"></i>
            โครงสร้างการจัดหน่วย (Military Organizational Hierarchy)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            จัดการโครงสร้างหน่วยงานลำดับชั้น: กอง / ฝ่าย ➔ แผนก / หมวด ➔ ตอน / ชุด ภายในหน่วยงาน
          </p>
        </div>
        <Button
          type="button"
          variant={isAdding ? "secondary" : "primary"}
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          icon={isAdding ? "fa-solid fa-xmark" : "fa-solid fa-plus"}
          className="text-xs font-semibold rounded-xl shrink-0"
        >
          {isAdding ? 'ยกเลิก' : 'เพิ่มกอง / ฝ่าย / กองร้อย'}
        </Button>
      </Card>

      {/* Add Main Department Form Panel */}
      {isAdding && (
        <Card variant="convex" className="p-5 sm:p-6 rounded-[24px] border-primary-200/50 dark:border-primary-800/50 animate-fade-in">
          <form onSubmit={handleAddDepartment}>
            <h4 className="text-xs font-bold text-primary-900 dark:text-primary-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <i className="fa-solid fa-folder-plus text-primary-500"></i> เพิ่มกอง / ฝ่าย / กองร้อย ใหม่ (ระดับหลัก)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="md:col-span-2">
                <label htmlFor="newDeptNameInput" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อเต็ม (Full Name) <span className="text-red-500">*</span>
                </label>
                <input
                  id="newDeptNameInput"
                  aria-label="ชื่อเต็มหน่วยงาน"
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="เช่น กองการศึกษา, กองร้อยฝึกรบพิเศษที่ 1, ฝ่ายส่งกำลังบำรุง"
                  className="w-full h-11 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-2xs"
                  required
                />
              </div>
              <div>
                <label htmlFor="newDeptShortNameInput" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  คำย่อ (Short Name / Abbr)
                </label>
                <input
                  id="newDeptShortNameInput"
                  aria-label="คำย่อหน่วยงาน"
                  type="text"
                  value={newDeptShortName}
                  onChange={(e) => setNewDeptShortName(e.target.value)}
                  placeholder="เช่น กศ., ร้อย.1, ฝกบ."
                  className="w-full h-11 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-2xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsAdding(false)}
                className="text-xs font-medium rounded-xl"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon="fa-solid fa-check"
                className="text-xs font-semibold rounded-xl"
              >
                บันทึกหน่วยงาน
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Departments List / Hierarchy Tree */}
      {isLoading ? (
        <div className="text-center py-16">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary-500 mb-3"></i>
          <p className="text-xs text-slate-500">กำลังโหลดโครงสร้างหน่วยงาน...</p>
        </div>
      ) : departments.length === 0 ? (
        <Card variant="convex" className="text-center py-16 rounded-[24px] border-dashed p-8">
          <i className="fa-solid fa-sitemap text-4xl text-slate-300 dark:text-slate-600 mb-3"></i>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">ยังไม่มีข้อมูลหน่วยงาน</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">กดปุ่ม "เพิ่มกอง / ฝ่าย / กองร้อย" เพื่อเริ่มต้นสร้างโครงสร้างหน่วย</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {departments.map((dept) => {
            const subTree = parseSubDepts(dept.subDepartments);
            const count = personnelCounts[dept.name] || 0;
            const isEditing = editingDeptId === dept.id;

            return (
              <Card
                key={dept.id}
                variant="convex"
                className="p-5 sm:p-6 rounded-[24px] transition-all border border-slate-200/80 dark:border-slate-800/80 shadow-sm"
              >
                {/* Main Department Header (Level 0) */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  {isEditing ? (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                      <label htmlFor={`editDeptName_${dept.id}`} className="sr-only">ชื่อเต็มหน่วยงาน</label>
                      <input
                        id={`editDeptName_${dept.id}`}
                        aria-label="ชื่อเต็มหน่วยงาน"
                        type="text"
                        value={editDeptName}
                        onChange={(e) => setEditDeptName(e.target.value)}
                        placeholder="ชื่อเต็มหน่วยงาน"
                        className="sm:col-span-2 h-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-xs text-slate-900 dark:text-white"
                      />
                      <label htmlFor={`editDeptShortName_${dept.id}`} className="sr-only">คำย่อหน่วยงาน</label>
                      <input
                        id={`editDeptShortName_${dept.id}`}
                        aria-label="คำย่อหน่วยงาน"
                        type="text"
                        value={editDeptShortName}
                        onChange={(e) => setEditDeptShortName(e.target.value)}
                        placeholder="คำย่อ"
                        className="h-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-base shrink-0 border border-primary-100 dark:border-primary-900/60 shadow-2xs">
                        <i className="fa-solid fa-shield-halved"></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {dept.name}
                          </h4>
                          {dept.shortName && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs font-semibold">
                              ({dept.shortName})
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-900/60">
                            {count} นาย
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {subTree.length > 0 ? `โครงสร้างภายใน ${subTree.length} หน่วยย่อยหลัก` : 'ยังไม่มีหน่วยงานย่อย'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions on Department */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {isEditing ? (
                      <>
                        <Button
                          type="button"
                          variant="success"
                          size="sm"
                          onClick={() => handleUpdateDepartment(dept.id)}
                          icon="fa-solid fa-check"
                          className="text-xs font-semibold rounded-lg"
                        >
                          บันทึก
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingDeptId(null)}
                          className="text-xs font-medium rounded-lg"
                        >
                          ยกเลิก
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAddSubTarget({
                              dept,
                              parentPath: [],
                              parentTitle: dept.name,
                              levelName: 'กอง / ฝ่ายย่อย (ชั้นที่ 1)',
                              levelNumber: 1,
                            });
                            setSubFormName('');
                            setSubFormShortName('');
                          }}
                          icon="fa-solid fa-plus"
                          className="text-xs font-medium rounded-xl"
                          title="เพิ่มหน่วยย่อยชั้นที่ 1 ในสังกัด"
                        >
                          เพิ่มกอง/ฝ่ายย่อย
                        </Button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDeptId(dept.id);
                            setEditDeptName(dept.name);
                            setEditDeptShortName(dept.shortName || '');
                          }}
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                          title="แก้ไขชื่อหน่วยงาน"
                        >
                          <i className="fa-solid fa-pen-to-square text-xs"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ type: 'dept', id: dept.id, name: dept.name })}
                          className="p-2 text-rose-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                          title="ลบหน่วยงาน"
                        >
                          <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Sub-departments Container (กรอบ: แผนก / หมวด / ตอน / ชุด ในสังกัด 3 ชั้น) */}
                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <i className="fa-solid fa-turn-down-right text-primary-500"></i> แผนก / หมวด / ตอน / ชุด ในสังกัด (โครงสร้าง 3 ชั้นย่อย):
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAddSubTarget({
                          dept,
                          parentPath: [],
                          parentTitle: dept.name,
                          levelName: 'กอง / ฝ่ายย่อย (ชั้นที่ 1)',
                          levelNumber: 1,
                        });
                        setSubFormName('');
                        setSubFormShortName('');
                      }}
                      className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                    >
                      <i className="fa-solid fa-plus text-[10px]"></i> เพิ่มชั้นที่ 1
                    </button>
                  </div>

                  {subTree.length === 0 ? (
                    <div className="text-xs text-slate-400 italic py-3 px-4 bg-slate-50/60 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                      <span>ยังไม่มีหน่วยงานย่อย (กำลังพลสังกัดกองโดยตรง)</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAddSubTarget({
                            dept,
                            parentPath: [],
                            parentTitle: dept.name,
                            levelName: 'กอง / ฝ่ายย่อย (ชั้นที่ 1)',
                            levelNumber: 1,
                          });
                          setSubFormName('');
                          setSubFormShortName('');
                        }}
                        className="text-primary-600 dark:text-primary-400 font-medium hover:underline text-xs"
                      >
                        + เพิ่มหน่วยย่อยชั้นที่ 1
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {subTree.map((node1, idx1) => {
                        const path1 = [idx1];
                        const count1 = subPersonnelCounts[node1.name] || 0;
                        const children1 = node1.children || [];

                        return (
                          <div
                            key={idx1}
                            className="rounded-2xl border border-slate-200/90 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-3 transition-all hover:border-primary-300 dark:hover:border-primary-700 shadow-2xs"
                          >
                            {/* Level 1: กอง / ฝ่ายย่อย */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 text-[11px] font-bold border border-primary-200 dark:border-primary-800">
                                  ชั้น 1 (กอง/ฝ่าย)
                                </span>
                                <span
                                  onClick={() =>
                                    setEditSubTarget({
                                      dept,
                                      path: path1,
                                      originalName: node1.name,
                                      name: node1.name,
                                      shortName: node1.shortName || '',
                                      levelName: 'ชั้น 1: กอง/ฝ่ายย่อย',
                                      syncPersonnel: true,
                                    })
                                  }
                                  className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                  title="คลิกเพื่อแก้ไข"
                                >
                                  {node1.name}
                                </span>
                                {node1.shortName && (
                                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
                                    ({node1.shortName})
                                  </span>
                                )}
                                {count1 > 0 && (
                                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                                    {count1} นาย
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAddSubTarget({
                                      dept,
                                      parentPath: path1,
                                      parentTitle: node1.name,
                                      levelName: 'แผนก / หมวด (ชั้นที่ 2)',
                                      levelNumber: 2,
                                    });
                                    setSubFormName('');
                                    setSubFormShortName('');
                                  }}
                                  className="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-primary-50 dark:hover:bg-primary-950/50 text-primary-600 dark:text-primary-300 border border-slate-200 dark:border-slate-600 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 shadow-2xs"
                                  title="เพิ่มแผนกหรือหมวดย่อยภายใต้กองนี้"
                                >
                                  <i className="fa-solid fa-plus text-[10px]"></i> เพิ่มแผนก/หมวด
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditSubTarget({
                                      dept,
                                      path: path1,
                                      originalName: node1.name,
                                      name: node1.name,
                                      shortName: node1.shortName || '',
                                      levelName: 'ชั้น 1: กอง/ฝ่ายย่อย',
                                      syncPersonnel: true,
                                    })
                                  }
                                  className="p-1.5 text-slate-400 hover:text-primary-500 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-all"
                                  title={`แก้ไข ${node1.name}`}
                                >
                                  <i className="fa-solid fa-pen-to-square text-xs"></i>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: 'sub',
                                      dept,
                                      path: path1,
                                      name: node1.name,
                                      hasChildren: (node1.children || []).length > 0,
                                    })
                                  }
                                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                                  title={`ลบ ${node1.name}`}
                                >
                                  <i className="fa-solid fa-trash-can text-xs"></i>
                                </button>
                              </div>
                            </div>

                            {/* Level 2 & 3 Tree Container */}
                            {children1.length > 0 && (
                              <div className="ml-2 sm:ml-4 pl-3 sm:pl-4 border-l-2 border-primary-200/80 dark:border-primary-800/60 space-y-2.5 pt-1">
                                {children1.map((node2, idx2) => {
                                  const path2 = [...path1, idx2];
                                  const count2 = subPersonnelCounts[node2.name] || 0;
                                  const children2 = node2.children || [];

                                  return (
                                    <div
                                      key={idx2}
                                      className="bg-white dark:bg-slate-900/90 rounded-xl p-3 border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-2"
                                    >
                                      {/* Level 2: แผนก / หมวด */}
                                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                                            ชั้น 2 (แผนก/หมวด)
                                          </span>
                                          <span
                                            onClick={() =>
                                              setEditSubTarget({
                                                dept,
                                                path: path2,
                                                originalName: node2.name,
                                                name: node2.name,
                                                shortName: node2.shortName || '',
                                                levelName: 'ชั้น 2: แผนก/หมวด',
                                                syncPersonnel: true,
                                              })
                                            }
                                            className="font-semibold text-xs text-slate-800 dark:text-slate-200 cursor-pointer hover:text-primary-500 transition-colors"
                                            title="คลิกเพื่อแก้ไข"
                                          >
                                            {node2.name}
                                          </span>
                                          {node2.shortName && (
                                            <span className="text-[11px] text-slate-400 font-mono">
                                              ({node2.shortName})
                                            </span>
                                          )}
                                          {count2 > 0 && (
                                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                                              {count2} นาย
                                            </span>
                                          )}
                                        </div>

                                        <div className="flex items-center gap-1 self-end sm:self-center">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setAddSubTarget({
                                                dept,
                                                parentPath: path2,
                                                parentTitle: node2.name,
                                                levelName: 'ตอน / ชุด (ชั้นที่ 3)',
                                                levelNumber: 3,
                                              });
                                              setSubFormName('');
                                              setSubFormShortName('');
                                            }}
                                            className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-300 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-medium transition-all flex items-center gap-1"
                                            title="เพิ่มตอนหรือชุดย่อยภายใต้แผนกนี้"
                                          >
                                            <i className="fa-solid fa-plus text-[9px]"></i> เพิ่มตอน/ชุด
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setEditSubTarget({
                                                dept,
                                                path: path2,
                                                originalName: node2.name,
                                                name: node2.name,
                                                shortName: node2.shortName || '',
                                                levelName: 'ชั้น 2: แผนก/หมวด',
                                                syncPersonnel: true,
                                              })
                                            }
                                            className="p-1 text-slate-400 hover:text-primary-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                            title={`แก้ไข ${node2.name}`}
                                          >
                                            <i className="fa-solid fa-pen-to-square text-[11px]"></i>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setDeleteTarget({
                                                type: 'sub',
                                                dept,
                                                path: path2,
                                                name: node2.name,
                                                hasChildren: (node2.children || []).length > 0,
                                              })
                                            }
                                            className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                                            title={`ลบ ${node2.name}`}
                                          >
                                            <i className="fa-solid fa-trash-can text-[11px]"></i>
                                          </button>
                                        </div>
                                      </div>

                                      {/* Level 3: ตอน / ชุด / หมู่ Pills */}
                                      {children2.length > 0 && (
                                        <div className="ml-2 sm:ml-4 pl-3 border-l-2 border-dashed border-amber-300 dark:border-amber-700/60 pt-1 flex flex-wrap gap-2">
                                          {children2.map((node3, idx3) => {
                                            const path3 = [...path2, idx3];
                                            const count3 = subPersonnelCounts[node3.name] || 0;

                                            return (
                                              <div
                                                key={idx3}
                                                className="group inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 hover:border-emerald-400 transition-all"
                                              >
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                <span
                                                  onClick={() =>
                                                    setEditSubTarget({
                                                      dept,
                                                      path: path3,
                                                      originalName: node3.name,
                                                      name: node3.name,
                                                      shortName: node3.shortName || '',
                                                      levelName: 'ชั้น 3: ตอน/ชุด',
                                                      syncPersonnel: true,
                                                    })
                                                  }
                                                  className="font-medium cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 text-[11px]"
                                                  title="คลิกเพื่อแก้ไข"
                                                >
                                                  {node3.name}
                                                </span>
                                                {node3.shortName && (
                                                  <span className="text-[10px] text-slate-400 font-mono">
                                                    ({node3.shortName})
                                                  </span>
                                                )}
                                                {count3 > 0 && (
                                                  <span className="text-[9px] px-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                                                    {count3}
                                                  </span>
                                                )}
                                                <div className="flex items-center gap-0.5 ml-1 pl-1 border-l border-slate-200 dark:border-slate-700">
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      setEditSubTarget({
                                                        dept,
                                                        path: path3,
                                                        originalName: node3.name,
                                                        name: node3.name,
                                                        shortName: node3.shortName || '',
                                                        levelName: 'ชั้น 3: ตอน/ชุด',
                                                        syncPersonnel: true,
                                                      })
                                                    }
                                                    className="p-0.5 text-slate-400 hover:text-primary-500 transition-colors"
                                                    title={`แก้ไข ${node3.name}`}
                                                  >
                                                    <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      setDeleteTarget({
                                                        type: 'sub',
                                                        dept,
                                                        path: path3,
                                                        name: node3.name,
                                                        hasChildren: false,
                                                      })
                                                    }
                                                    className="p-0.5 text-slate-400 hover:text-rose-500 transition-colors"
                                                    title={`ลบ ${node3.name}`}
                                                  >
                                                    <i className="fa-solid fa-circle-xmark text-[11px]"></i>
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Sub-department Modal (Multi-Level) */}
      {addSubTarget && (
        <Modal
          isOpen={!!addSubTarget}
          onClose={() => !isSubmittingSub && setAddSubTarget(null)}
          title={`เพิ่ม ${addSubTarget.levelName}`}
          subtitle={`สังกัดภายใต้: ${addSubTarget.parentTitle}`}
          icon="fa-solid fa-folder-plus"
          size="sm"
        >
          <form onSubmit={handleAddSubSubmit} className="space-y-4">
            <div>
              <label htmlFor="subFormNameInput" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ชื่อเต็มหน่วยย่อย <span className="text-rose-500">*</span>
              </label>
              <input
                id="subFormNameInput"
                aria-label="ชื่อเต็มหน่วยย่อย"
                type="text"
                placeholder={
                  addSubTarget.levelNumber === 1
                    ? 'เช่น กองการศึกษา, กองบริการและสนับสนุน'
                    : addSubTarget.levelNumber === 2
                    ? 'เช่น แผนกส่งกำลังและซ่อมบำรุง, หมวดฝึกที่ 1'
                    : 'เช่น ตอนยานยนต์, ตอนคลังอาวุธ, ชุดปฏิบัติการที่ 1'
                }
                value={subFormName}
                onChange={(e) => setSubFormName(e.target.value)}
                className="w-full h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 shadow-2xs"
                required
                autoFocus
                disabled={isSubmittingSub}
              />
            </div>

            <div>
              <label htmlFor="subFormShortNameInput" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                คำย่อ (ถ้ามี)
              </label>
              <input
                id="subFormShortNameInput"
                aria-label="คำย่อหน่วยย่อย"
                type="text"
                placeholder="เช่น กบร., ผกบ., มว.1, ตอน ยย."
                value={subFormShortName}
                onChange={(e) => setSubFormShortName(e.target.value)}
                className="w-full h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 shadow-2xs"
                disabled={isSubmittingSub}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setAddSubTarget(null)}
                disabled={isSubmittingSub}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon="fa-solid fa-plus"
                disabled={isSubmittingSub}
              >
                {isSubmittingSub ? 'กำลังบันทึก...' : `บันทึกหน่วยย่อย`}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Sub-department Modal */}
      {editSubTarget && (
        <Modal
          isOpen={!!editSubTarget}
          onClose={() => !isSavingSub && setEditSubTarget(null)}
          title={`แก้ไข ${editSubTarget.levelName}`}
          subtitle={`สังกัดหน่วยงาน: ${editSubTarget.dept.name}`}
          icon="fa-solid fa-pen-to-square"
          size="sm"
        >
          <form onSubmit={handleEditSubSubmit} className="space-y-4">
            <div>
              <label htmlFor="editSubFormNameInput" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ชื่อเต็มหน่วยย่อย <span className="text-rose-500">*</span>
              </label>
              <input
                id="editSubFormNameInput"
                aria-label="ชื่อเต็มหน่วยย่อย"
                type="text"
                value={editSubTarget.name}
                onChange={(e) => setEditSubTarget({ ...editSubTarget, name: e.target.value })}
                className="w-full h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 shadow-2xs"
                required
                autoFocus
                disabled={isSavingSub}
              />
            </div>

            <div>
              <label htmlFor="editSubFormShortNameInput" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                คำย่อ (ถ้ามี)
              </label>
              <input
                id="editSubFormShortNameInput"
                aria-label="คำย่อหน่วยย่อย"
                type="text"
                value={editSubTarget.shortName}
                onChange={(e) => setEditSubTarget({ ...editSubTarget, shortName: e.target.value })}
                className="w-full h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 shadow-2xs"
                disabled={isSavingSub}
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editSubTarget.syncPersonnel}
                  onChange={(e) => setEditSubTarget({ ...editSubTarget, syncPersonnel: e.target.checked })}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 mt-0.5"
                  disabled={isSavingSub}
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    อัปเดตชื่อสังกัดในข้อมูลกำลังพลเดิมอัตโนมัติ
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    เปลี่ยนชื่อหน่วยย่อยในประวัติของกำลังพลทุกคนที่สังกัดชื่อเดิมให้เป็นชื่อใหม่ทันที
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEditSubTarget(null)}
                disabled={isSavingSub}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon="fa-solid fa-check"
                disabled={isSavingSub}
              >
                {isSavingSub ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Styled Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.type === 'dept' ? 'ยืนยันการลบหน่วยงาน?' : 'ยืนยันการลบหน่วยย่อย?'}
        message={
          deleteTarget?.type === 'dept'
            ? `คุณแน่ใจหรือไม่ที่จะลบหน่วยงาน "${deleteTarget.name}" และโครงสร้างย่อยทั้งหมด? ข้อมูลที่ลบจะไม่สามารถกู้คืนได้`
            : `คุณแน่ใจหรือไม่ที่จะลบ "${deleteTarget?.type === 'sub' ? deleteTarget.name : ''}"?${
                deleteTarget?.type === 'sub' && deleteTarget.hasChildren
                  ? ' (คำเตือน: หน่วยย่อยนี้มีแผนก/ตอนภายใน โครงสร้างย่อยทั้งหมดจะถูกลบไปด้วย)'
                  : ''
              }`
        }
        confirmText="ยืนยันการลบ"
        cancelText="ยกเลิก"
        isDestructive={true}
        onConfirm={() => {
          if (!deleteTarget) return;
          if (deleteTarget.type === 'dept') {
            executeDeleteDepartment(deleteTarget.id);
          } else {
            executeDeleteSubNode(deleteTarget.dept, deleteTarget.path);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
