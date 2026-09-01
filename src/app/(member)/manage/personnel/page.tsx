'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Personnel } from '@/types/personnel';
import { useRouter } from 'next/navigation';
import AddPersonnelModal from '@/components/AddPersonnelModal';
import JSZip from 'jszip';
import LeaveList from '@/components/leaves/LeaveList';
import PersonnelTable from '@/components/personnel/PersonnelTable';
import PersonnelPagination from '@/components/personnel/PersonnelPagination';
import PersonnelImportModal from '@/components/personnel/PersonnelImportModal';
import { downloadPersonnelTemplate, exportPersonnelToExcel } from '@/lib/excelUtils';
import toast from 'react-hot-toast';

interface SubDepartmentItem {
  name: string;
  shortName?: string;
}

interface DepartmentItem {
  id: string;
  name: string;
  shortName?: string;
  subDepartments?: string | SubDepartmentItem[];
}

export default function ManagePersonnelPage() {
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [personnelTypes, setPersonnelTypes] = useState<string[]>([
    'นายทหารสัญญาบัตร', 'นายทหารประทวน', 'พนักงานราชการ', 'ลูกจ้าง', 'ทหารกองประจำการ'
  ]);
  const [statusList, setStatusList] = useState<string[]>([
    'ปฏิบัติงานปกติ', 'ไปช่วยราชการ', 'ไปช่วยราชการภายนอกหน่วย', 'มาช่วยราชการ', 'ลาพักผ่อน', 'ลาป่วย/ลากิจ', 'ศึกษา/ดูงาน', 'ย้ายหน่วย/พ้นสภาพ'
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);
  const [leaveModalPerson, setLeaveModalPerson] = useState<Personnel | null>(null);
  
  // 2-Tier Military Unit Filters
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [subDeptFilter, setSubDeptFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Pagination & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const zipInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fetchPersonnel = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/personnel');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setPersonnelList(data);
      }
    } catch (err) {
      console.error('Failed to fetch personnel:', err);
    }
    setIsLoading(false);
  };

  const fetchFiltersData = async () => {
    try {
      // Fetch departments with subDepartments
      const deptRes = await fetch('/api/departments');
      if (deptRes.ok) {
        const depts = await deptRes.json();
        if (Array.isArray(depts)) setDepartments(depts);
      }

      // Fetch dynamic settings
      const settingsRes = await fetch('/api/settings');
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        if (settings.personnelTypes) {
          try { setPersonnelTypes(JSON.parse(settings.personnelTypes)); } catch (_) {}
        }
        if (settings.statusList) {
          try { setStatusList(JSON.parse(settings.statusList)); } catch (_) {}
        }
      }
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  };

  useEffect(() => {
    fetchPersonnel();
    fetchFiltersData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบข้อมูลของ ${name}?`)) return;
    try {
      const res = await fetch(`/api/personnel/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('ลบข้อมูลสำเร็จ');
        fetchPersonnel();
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  const handleBulkPrint = () => {
    if (selectedIds.length === 0) return;
    sessionStorage.setItem('bulkPrintIds', JSON.stringify(selectedIds));
    router.push('/manage/personnel/print-badges');
  };

  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const imageFiles = Object.keys(zip.files).filter(name => !zip.files[name].dir && (name.match(/\.(jpe?g|png)$/i)));
      
      if (imageFiles.length === 0) {
        toast.error('ไม่พบไฟล์รูปภาพ (.jpg, .png) ในไฟล์ ZIP');
        setIsLoading(false);
        return;
      }

      let successCount = 0;
      let notFoundCount = 0;

      for (const filename of imageFiles) {
        const nameWithoutExt = filename.split('/').pop()?.split('.')[0] || '';
        if (!nameWithoutExt) continue;

        const matchedPerson = personnelList.find(p => p.badgeNo === nameWithoutExt || p.citizenId === nameWithoutExt);
        
        if (matchedPerson) {
          const base64Data = await zip.files[filename].async('base64');
          const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
          const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
          const dataUrl = `data:${mimeType};base64,${base64Data}`;

          await fetch(`/api/personnel/${matchedPerson.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatarColor: dataUrl })
          });
          successCount++;
        } else {
          notFoundCount++;
        }
      }

      toast.success(`นำเข้ารูปภาพสำเร็จ ${successCount} รูป${notFoundCount > 0 ? ` (ไม่พบบุคลากรตรงกัน ${notFoundCount} รูป)` : ''}`);
      fetchPersonnel();
    } catch (error) {
      console.error(error);
      toast.error('เกิดข้อผิดพลาดในการนำเข้าไฟล์ ZIP');
    }
    setIsLoading(false);
    if (zipInputRef.current) zipInputRef.current.value = '';
  };

  // Helper to parse subDepartments from selected department
  const getSubDeptsForDept = (deptName: string): SubDepartmentItem[] => {
    const dept = departments.find(d => d.name === deptName);
    if (!dept?.subDepartments) return [];
    if (Array.isArray(dept.subDepartments)) {
      return dept.subDepartments.map(item => {
        if (typeof item === 'string') return { name: item, shortName: '' };
        return item;
      });
    }
    try {
      const parsed = JSON.parse(dept.subDepartments);
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          if (typeof item === 'string') return { name: item, shortName: '' };
          return item;
        });
      }
    } catch (_) {}
    return [];
  };

  // Filter & Search Logic
  const filteredPersonnel = personnelList.filter(p => {
    const matchDept = deptFilter === 'all' || p.department === deptFilter;
    const matchSubDept = subDeptFilter === 'all' || p.subDepartment === subDeptFilter;
    const matchType = typeFilter === 'all' || p.personnelType === typeFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = 
      !searchQuery ||
      (p.firstName && p.firstName.toLowerCase().includes(searchLower)) ||
      (p.lastName && p.lastName.toLowerCase().includes(searchLower)) ||
      (p.badgeNo && p.badgeNo.toLowerCase().includes(searchLower)) ||
      (p.citizenId && p.citizenId.toLowerCase().includes(searchLower)) ||
      (p.position && p.position.toLowerCase().includes(searchLower)) ||
      (p.department && p.department.toLowerCase().includes(searchLower)) ||
      (p.subDepartment && p.subDepartment.toLowerCase().includes(searchLower));

    return matchDept && matchSubDept && matchType && matchStatus && matchSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPersonnel.length / itemsPerPage) || 1;
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPersonnel.slice(indexOfFirstItem, indexOfLastItem);

  const toggleSelectAll = () => {
    if (selectedIds.length === currentItems.length && currentItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentItems.map(p => p.id));
    }
  };

  const toggleSelectPerson = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Calculate counts
  const getDeptCount = (deptName: string) => {
    if (deptName === 'all') return personnelList.length;
    return personnelList.filter(p => p.department === deptName).length;
  };

  const getSubDeptCount = (deptName: string, subName: string) => {
    if (subName === 'all') return personnelList.filter(p => p.department === deptName).length;
    return personnelList.filter(p => p.department === deptName && p.subDepartment === subName).length;
  };

  const currentSubDepts = deptFilter !== 'all' ? getSubDeptsForDept(deptFilter) : [];

  return (
    <div className="pb-12 max-w-7xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <i className="fa-solid fa-users-gear text-primary-500"></i> จัดการข้อมูลบุคลากร (Personnel)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            กำลังพลทั้งหมด {personnelList.length} นาย • แสดงผล {filteredPersonnel.length} นาย
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={downloadPersonnelTemplate}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl transition-all font-medium text-xs flex items-center border border-slate-200 dark:border-slate-700"
          >
            <i className="fa-solid fa-file-excel mr-2 text-green-600 text-sm"></i> โหลดฟอร์ม
          </button>
          
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl transition-all font-medium text-xs flex items-center border border-slate-200 dark:border-slate-700"
          >
            <i className="fa-solid fa-file-import mr-2 text-blue-600 text-sm"></i> นำเข้า Excel
          </button>

          <button
            onClick={() => zipInputRef.current?.click()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl transition-all font-medium text-xs flex items-center border border-slate-200 dark:border-slate-700"
            title="อัปโหลดไฟล์ ZIP ที่ตั้งชื่อรูปภาพตามรหัสบัตร/เลขบัตรประชาชน"
          >
            <i className="fa-solid fa-file-image mr-2 text-purple-600 text-sm"></i> นำเข้ารูป (ZIP)
          </button>
          <input 
            type="file" 
            accept=".zip" 
            className="hidden" 
            ref={zipInputRef} 
            onChange={handleImportZip} 
          />

          <button
            onClick={() => exportPersonnelToExcel(filteredPersonnel)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl transition-all font-medium text-xs flex items-center border border-slate-200 dark:border-slate-700"
          >
            <i className="fa-solid fa-file-export mr-2 text-green-600 text-sm"></i> ส่งออก Excel
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkPrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all font-medium text-xs flex items-center"
            >
              <i className="fa-solid fa-print mr-2"></i>
              พิมพ์บัตร ({selectedIds.length})
            </button>
          )}

          <button
            onClick={() => {
              setEditingPerson(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/30 transition-all font-medium text-xs flex items-center"
          >
            <i className="fa-solid fa-user-plus mr-2"></i>
            เพิ่มบุคลากร
          </button>
        </div>
      </div>

      {/* 2-Tier Military Unit Filter Tabs */}
      <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {/* Tier 1: กอง / ฝ่าย / กองร้อย */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <i className="fa-solid fa-sitemap text-primary-500 text-xs"></i>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              กอง / ฝ่าย / กองร้อย (Main Unit):
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => { 
                setDeptFilter('all'); 
                setSubDeptFilter('all');
                setCurrentPage(1); 
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                deptFilter === 'all'
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>ทั้งหมด</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                deptFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {getDeptCount('all')}
              </span>
            </button>

            {departments.map((dept) => {
              const count = getDeptCount(dept.name);
              const isSelected = deptFilter === dept.name;
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => { 
                    setDeptFilter(dept.name); 
                    setSubDeptFilter('all');
                    setCurrentPage(1); 
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{dept.name}</span>
                  {dept.shortName && (
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                      ({dept.shortName})
                    </span>
                  )}
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier 2: แผนก / หมวด / ตอน / ชุด (แสดงเมื่อเลือกกอง/ฝ่าย) */}
        {deptFilter !== 'all' && currentSubDepts.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 animate-fade-in">
            <div className="flex items-center gap-2 mb-2 px-1">
              <i className="fa-solid fa-turn-down-right text-indigo-500 text-xs"></i>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                แผนก / หมวด / ตอน / ชุด ใน {deptFilter}:
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin pl-3">
              <button
                type="button"
                onClick={() => { setSubDeptFilter('all'); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                  subDeptFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>ทั้งหมดในกอง</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  subDeptFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {getSubDeptCount(deptFilter, 'all')}
                </span>
              </button>

              {currentSubDepts.map((sub, idx) => {
                const count = getSubDeptCount(deptFilter, sub.name);
                const isSelected = subDeptFilter === sub.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setSubDeptFilter(sub.name); setCurrentPage(1); }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{sub.name}</span>
                    {sub.shortName && (
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                        ({sub.shortName})
                      </span>
                    )}
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Search & Dynamic Dropdown Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Search Bar */}
        <div className="relative lg:col-span-2">
          <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input 
            type="text" 
            placeholder="ค้นหาชื่อ, สกุล, รหัสบัตร, ตำแหน่ง, แผนก..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); 
            }}
            className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <i className="fa-solid fa-xmark text-xs"></i>
            </button>
          )}
        </div>

        {/* Personnel Type Filter */}
        <div>
          <select 
            value={typeFilter} 
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1); 
            }}
            className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-2xs"
          >
            <option value="all">ประเภท: ทั้งหมด</option>
            {personnelTypes.map((type, idx) => (
              <option key={idx} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select 
            value={statusFilter} 
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1); 
            }}
            className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-2xs"
          >
            <option value="all">สถานะ: ทั้งหมด</option>
            {statusList.map((st, idx) => (
              <option key={idx} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Personnel Table & Pagination Container */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <PersonnelTable
          isLoading={isLoading}
          currentItems={currentItems}
          selectedIds={selectedIds}
          toggleSelectAll={toggleSelectAll}
          toggleSelectPerson={toggleSelectPerson}
          setLeaveModalPerson={setLeaveModalPerson}
          setEditingPerson={setEditingPerson}
          setIsAddModalOpen={setIsAddModalOpen}
          handleDelete={handleDelete}
        />
        
        <PersonnelPagination
          isLoading={isLoading}
          totalItems={filteredPersonnel.length}
          indexOfFirstItem={indexOfFirstItem}
          indexOfLastItem={indexOfLastItem}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {/* Modals */}
      <AddPersonnelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={async (data) => {
          const url = editingPerson ? `/api/personnel/${editingPerson.id}` : '/api/personnel';
          const method = editingPerson ? 'PUT' : 'POST';

          try {
            const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });

            if (res.ok) {
              toast.success(editingPerson ? 'อัปเดตข้อมูลสำเร็จ' : 'เพิ่มบุคลากรสำเร็จ');
              setIsAddModalOpen(false);
              setEditingPerson(null);
              fetchPersonnel();
            } else {
              const errData = await res.json();
              toast.error(errData.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }
          } catch (err) {
            console.error(err);
            toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
          }
        }}
        initialData={editingPerson}
      />

      <PersonnelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onRefresh={fetchPersonnel}
        setIsLoading={setIsLoading}
      />

      {leaveModalPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-calendar-check text-primary-500"></i>
                ประวัติการลา - {leaveModalPerson.prefix} {leaveModalPerson.firstName} {leaveModalPerson.lastName}
              </h3>
              <button 
                onClick={() => setLeaveModalPerson(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <LeaveList personnelId={leaveModalPerson.id} />
          </div>
        </div>
      )}
    </div>
  );
}
