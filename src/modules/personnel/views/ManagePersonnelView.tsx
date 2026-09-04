'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Personnel } from '@/types/personnel';
import { useRouter } from 'next/navigation';
import AddPersonnelModal from '../components/AddPersonnelModal';
import JSZip from 'jszip';
import LeaveList from '@/modules/leaves/components/LeaveList';
import PersonnelTable from '../components/PersonnelTable';
import PersonnelPagination from '../components/PersonnelPagination';
import PersonnelImportModal from '../components/PersonnelImportModal';
import PersonnelDashboard from '../components/PersonnelDashboard';
import { downloadPersonnelTemplate, exportPersonnelToExcel } from '@/lib/excelUtils';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/common/ConfirmModal';

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

export default function ManagePersonnelView() {
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
  const [deleteTargetPerson, setDeleteTargetPerson] = useState<{ id: string; name: string } | null>(null);
  
  // Server-side Pagination & Search & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const zipInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchPersonnel = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
        search: debouncedSearch,
        department: deptFilter,
        subDepartment: subDeptFilter,
        status: statusFilter,
        personnelType: typeFilter,
        sortBy,
        sortOrder,
      });

      const res = await fetch(`/api/personnel?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        if (result.data && result.pagination) {
          setPersonnelList(result.data);
          setTotalItems(result.pagination.total);
          setTotalPages(result.pagination.totalPages);
        } else if (Array.isArray(result)) {
          setPersonnelList(result);
          setTotalItems(result.length);
          setTotalPages(Math.ceil(result.length / pageSize) || 1);
        }
      }
    } catch (err) {
      console.error('Failed to fetch personnel:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, deptFilter, subDeptFilter, statusFilter, typeFilter, sortBy, sortOrder]);

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
        if (settings.defaultPageSize) {
          const size = parseInt(settings.defaultPageSize, 10);
          if (!isNaN(size) && size > 0) {
            setPageSize(size);
          }
        }
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
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchPersonnel();
  }, [fetchPersonnel]);

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteTargetPerson({ id, name });
  };

  const executeDeletePerson = async (id: string) => {
    try {
      const res = await fetch(`/api/personnel/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('ลบข้อมูลสำเร็จ');
        fetchPersonnel();
      } else {
        toast.error('ไม่สามารถลบข้อมูลได้');
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setDeleteTargetPerson(null);
    }
  };

  const handleBulkPrint = () => {
    if (selectedIds.length === 0) return;
    sessionStorage.setItem('bulkPrintIds', JSON.stringify(selectedIds));
    router.push('/manage/personnel/print-badges');
  };

  const handleServerExport = async () => {
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        department: deptFilter,
        subDepartment: subDeptFilter,
        status: statusFilter,
        personnelType: typeFilter,
      });

      const res = await fetch(`/api/personnel/export?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        if (result.data) {
          exportPersonnelToExcel(result.data);
          toast.success(`ส่งออกข้อมูลสำเร็จ ${result.data.length} รายการ`);
        }
      } else {
        toast.error('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
      }
    } catch (err) {
      console.error(err);
      toast.error('ไม่สามารถส่งออกข้อมูลได้');
    }
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

  const toggleSelectAll = () => {
    if (selectedIds.length === personnelList.length && personnelList.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(personnelList.map(p => p.id));
    }
  };

  const toggleSelectPerson = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const currentSubDepts = deptFilter !== 'all' ? getSubDeptsForDept(deptFilter) : [];
  const indexOfFirstItem = (currentPage - 1) * pageSize;
  const indexOfLastItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="pb-12 max-w-7xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <i className="fa-solid fa-users-gear text-primary-500"></i> จัดการข้อมูลบุคลากร (Personnel)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            กำลังพลในระบบทั้งหมด {totalItems.toLocaleString()} นาย • ระบบแบ่งหน้าประมวลผลผ่าน Server-side
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
            id="personnelZipUploadInput"
            type="file" 
            accept=".zip" 
            aria-label="อัปโหลดไฟล์ ZIP รูปภาพบุคลากร (.zip)"
            className="hidden" 
            ref={zipInputRef} 
            onChange={handleImportZip} 
          />

          <button
            onClick={handleServerExport}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl transition-all font-medium text-xs flex items-center border border-slate-200 dark:border-slate-700"
          >
            <i className="fa-solid fa-file-export mr-2 text-green-600 text-sm"></i> ส่งออก Excel
          </button>

          <button
            onClick={() => {
              setEditingPerson(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-sm hover:shadow transition-all font-medium text-xs flex items-center gap-1.5"
          >
            <i className="fa-solid fa-user-plus text-sm"></i> เพิ่มกำลังพลใหม่
          </button>
        </div>
      </div>

      {/* Personnel Intelligence Dashboard Component */}
      <PersonnelDashboard />

      {/* Main Filter & Table Card */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Tier 1: Major Department Selection */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-200/70 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <i className="fa-solid fa-sitemap text-primary-500"></i> สังกัดหลัก (กอง / ฝ่าย / กองร้อย)
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => {
                setDeptFilter('all');
                setSubDeptFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                deptFilter === 'all'
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>ทั้งหมด</span>
            </button>
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => {
                  setDeptFilter(dept.name);
                  setSubDeptFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  deptFilter === dept.name
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{dept.shortName ? dept.shortName : dept.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tier 2: Sub-Department (แผนก / หมวด / ตอน / ชุด) */}
        {deptFilter !== 'all' && currentSubDepts.length > 0 && (
          <div className="px-5 py-2.5 bg-blue-50/40 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0 mr-1 flex items-center gap-1">
              <i className="fa-solid fa-code-branch text-[10px]"></i> แผนก/หมวด:
            </span>
            <button
              onClick={() => {
                setSubDeptFilter('all');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                subDeptFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 border border-blue-200 dark:border-blue-800/40'
              }`}
            >
              ทั้งหมดใน{deptFilter}
            </button>
            {currentSubDepts.map((sub, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSubDeptFilter(sub.name);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  subDeptFilter === sub.name
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 border border-blue-200 dark:border-blue-800/40'
                }`}
              >
                {sub.shortName ? `${sub.shortName} (${sub.name})` : sub.name}
              </button>
            ))}
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row gap-3 justify-between items-center bg-white dark:bg-slate-900/50">
          <div className="relative w-full md:w-80">
            <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              id="personnelSearchInput"
              aria-label="ค้นหาบุคลากรด้วยชื่อ สกุล หมายเลข หรือตำแหน่ง"
              type="text"
              placeholder="ค้นหาชื่อ, สกุล, หมายเลขประจำตัว, ตำแหน่ง..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Personnel Type Filter */}
            <select
              id="personnelTypeFilter"
              aria-label="กรองตามประเภทบุคลากร"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer font-medium"
            >
              <option value="all">ประเภท: ทั้งหมด</option>
              {personnelTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              id="personnelStatusFilter"
              aria-label="กรองตามสถานะบุคลากร"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer font-medium"
            >
              <option value="all">สถานะ: ทั้งหมด</option>
              {statusList.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            {/* Bulk Print Badges button */}
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkPrint}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all animate-fade-in"
              >
                <i className="fa-solid fa-id-card"></i> พิมพ์บัตร ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Personnel Table */}
        <PersonnelTable
          isLoading={isLoading}
          currentItems={personnelList}
          selectedIds={selectedIds}
          toggleSelectAll={toggleSelectAll}
          toggleSelectPerson={toggleSelectPerson}
          setLeaveModalPerson={setLeaveModalPerson}
          setEditingPerson={setEditingPerson}
          setIsAddModalOpen={setIsAddModalOpen}
          handleDelete={handleDelete}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />

        {/* Server-Side Pagination Bar */}
        <PersonnelPagination
          isLoading={isLoading}
          totalItems={totalItems}
          indexOfFirstItem={indexOfFirstItem}
          indexOfLastItem={indexOfLastItem}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          setPageSize={setPageSize}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddPersonnelModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingPerson(null);
          }}
          onAdd={() => {
            fetchPersonnel();
            setIsAddModalOpen(false);
            setEditingPerson(null);
          }}
          initialData={editingPerson}
        />
      )}

      {isImportModalOpen && (
        <PersonnelImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onRefresh={() => {
            fetchPersonnel();
            setIsImportModalOpen(false);
          }}
          setIsLoading={setIsLoading}
        />
      )}

      {leaveModalPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-calendar-days text-primary-500"></i> ประวัติและจัดการการลา
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {leaveModalPerson.prefix}{leaveModalPerson.firstName} {leaveModalPerson.lastName} ({leaveModalPerson.badgeNo}) - {leaveModalPerson.department}
                </p>
              </div>
              <button
                onClick={() => setLeaveModalPerson(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <LeaveList personnelId={leaveModalPerson.id} />
          </div>
        </div>
      )}

      {/* Styled Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetPerson}
        title="ยืนยันการลบข้อมูลกำลังพล?"
        message={`คุณแน่ใจหรือไม่ที่จะลบข้อมูลของ "${deleteTargetPerson?.name}"? ข้อมูลส่วนตัว เอกสาร และประวัติการลาทั้งหมดของบุคคลนี้จะถูกลบออกจากระบบ`}
        confirmText="ยืนยันการลบ"
        cancelText="ยกเลิก"
        isDestructive={true}
        onConfirm={() => {
          if (deleteTargetPerson) {
            executeDeletePerson(deleteTargetPerson.id);
          }
        }}
        onCancel={() => setDeleteTargetPerson(null)}
      />
    </div>
  );
}
