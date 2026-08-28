'use client';

import React, { useState, useEffect } from 'react';

interface Department {
  id: string;
  name: string;
}

export default function DepartmentsManager() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newDeptName, setNewDeptName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/departments');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setDepartments(data);
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDeptName.trim() }),
      });
      if (res.ok) {
        setNewDeptName('');
        fetchDepartments();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add department');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchDepartments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบหน่วยงานนี้?')) return;
    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDepartments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pt-4">
      <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 mb-8">
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            type="text"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            placeholder="พิมพ์ชื่อหน่วยงานใหม่..."
            className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
          />
          <button type="submit" className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-lg shadow-primary-500/30 transition-all font-medium whitespace-nowrap">
            <i className="fa-solid fa-plus mr-2"></i>
            เพิ่มหน่วยงาน
          </button>
        </form>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400 mb-3 block"></i>
            <p className="text-sm text-slate-500 dark:text-slate-400">กำลังโหลด...</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-700/50 text-slate-800 dark:text-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium w-16">#</th>
                <th className="px-6 py-4 font-medium">ชื่อหน่วยงาน</th>
                <th className="px-6 py-4 font-medium text-right w-32">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {departments.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">ไม่มีข้อมูลหน่วยงาน</td></tr>
              ) : (
                departments.map((dept, index) => (
                  <tr key={dept.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">
                      {editingId === dept.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                          autoFocus
                        />
                      ) : (
                        dept.name
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingId === dept.id ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleUpdate(dept.id)} className="text-emerald-400 hover:text-emerald-300"><i className="fa-solid fa-check"></i></button>
                          <button onClick={() => setEditingId(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-300"><i className="fa-solid fa-times"></i></button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-3">
                          <button onClick={() => { setEditingId(dept.id); setEditName(dept.name); }} className="text-blue-400 hover:text-blue-300"><i className="fa-solid fa-edit"></i></button>
                          <button onClick={() => handleDelete(dept.id)} className="text-red-400 hover:text-red-300"><i className="fa-solid fa-trash"></i></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
