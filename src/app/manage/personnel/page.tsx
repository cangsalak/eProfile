'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Personnel } from '../../../types/personnel';
import { useRouter } from 'next/navigation';
import AddPersonnelModal from '../../../components/AddPersonnelModal';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import LeaveList from '../../../components/leaves/LeaveList';

export default function ManagePersonnelPage() {
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);
  const [leaveModalPerson, setLeaveModalPerson] = useState<Personnel | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Phase 1: Pagination & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบข้อมูลของ ${name}?`)) return;
    try {
      const res = await fetch(`/api/personnel/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPersonnel();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkPrint = () => {
    if (selectedIds.length === 0) return;
    sessionStorage.setItem('bulkPrintIds', JSON.stringify(selectedIds));
    router.push('/manage/personnel/print-badges');
  };

  // Import / Export Logic
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      'คำนำหน้า': 'นาย',
      'ชื่อ': 'ตัวอย่าง',
      'นามสกุล': 'ทดสอบ',
      'ประเภท': 'พนักงานราชการ',
      'ตำแหน่ง': 'นักวิชาการคอมพิวเตอร์',
      'หน่วยงาน': 'กองเทคโนโลยีสารสนเทศ',
      'แผนก/ฝ่าย': 'แผนกซอฟต์แวร์',
      'รหัสบัตร': 'ID-001',
      'เลขบัตรปชช': '1234567890123',
      'หมายเลขข้าราชการ': '1000000001',
      'เหล่า': 'ทหารบก',
      'วันบรรจุ': '2015-05-01',
      'วันเกิด': '1990-01-01',
      'กรุ๊ปเลือด': 'O',
      'ศาสนา': 'พุทธ',
      'เบอร์โทร': '0812345678',
      'มือถือ': '0899999999',
      'อีเมล': 'test@example.com',
      'ที่อยู่': '123 ถ.สุขุมวิท กทม.',
      'การศึกษา': 'ปริญญาตรี',
      'ประสบการณ์': '5 ปี',
      'ประวัติฝึกอบรม': '-',
      'เครื่องราชฯ': '-',
      'ชื่อผู้ติดต่อฉุกเฉิน': 'นายใจดี',
      'เบอร์ผู้ติดต่อฉุกเฉิน': '0811111111',
      'ความสัมพันธ์ฉุกเฉิน': 'บิดา',
      'หมายเหตุ': '-'
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'personnel_template.xlsx');
  };

  const handleExportExcel = () => {
    const exportData = personnelList.map(p => ({
      'รหัสบัตร': p.badgeNo,
      'คำนำหน้า': p.prefix,
      'ชื่อ': p.firstName,
      'นามสกุล': p.lastName,
      'ประเภท': p.personnelType,
      'ตำแหน่ง': p.position,
      'หน่วยงาน': p.department,
      'แผนก/ฝ่าย': p.subDepartment,
      'เลขบัตรปชช': p.citizenId,
      'กรุ๊ปเลือด': p.bloodType,
      'เบอร์โทร': p.phone,
      'อีเมล': p.email,
      'มือถือ': p.mobile,
      'การศึกษา': p.education,
      'ประสบการณ์': p.experience,
      'หมายเหตุ': p.notes,
      'วันเกิด': p.dateOfBirth,
      'ศาสนา': p.religion,
      'หมายเลขข้าราชการ': p.officialId,
      'เหล่า': p.militaryBranch,
      'วันบรรจุ': p.commissionDate,
      'ที่อยู่': p.currentAddress,
      'ชื่อผู้ติดต่อฉุกเฉิน': p.emergencyContactName,
      'เบอร์ผู้ติดต่อฉุกเฉิน': p.emergencyContactPhone,
      'ความสัมพันธ์ฉุกเฉิน': p.emergencyContactRelation,
      'เครื่องราชฯ': p.royalDecorations,
      'ประวัติฝึกอบรม': p.trainingHistory
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Personnel');
    XLSX.writeFile(wb, 'personnel_data.xlsx');
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        let successCount = 0;
        setIsLoading(true);
        for (const row of data as any[]) {
          const mappedData = {
            id: `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            prefix: row['prefix'] || row['คำนำหน้า'] || 'นาย',
            firstName: row['firstName'] || row['ชื่อ'] || '',
            lastName: row['lastName'] || row['นามสกุล'] || '',
            position: row['position'] || row['ตำแหน่ง'] || '',
            personnelType: row['personnelType'] || row['ประเภท'] || 'นายทหารสัญญาบัตร',
            department: row['department'] || row['หน่วยงาน'] || '',
            subDepartment: row['subDepartment'] || row['แผนก/ฝ่าย'] || '',
            citizenId: String(row['citizenId'] || row['เลขบัตรปชช'] || ''),
            badgeNo: String(row['badgeNo'] || row['รหัสบัตร'] || ''),
            bloodType: row['bloodType'] || row['กรุ๊ปเลือด'] || '',
            phone: String(row['phone'] || row['เบอร์โทร'] || ''),
            email: row['email'] || row['อีเมล'] || '',
            mobile: String(row['mobile'] || row['มือถือ'] || ''),
            education: row['education'] || row['การศึกษา'] || '',
            experience: row['experience'] || row['ประสบการณ์'] || '',
            notes: row['notes'] || row['หมายเหตุ'] || '',
            dateOfBirth: row['dateOfBirth'] || row['วันเกิด'] || '',
            religion: row['religion'] || row['ศาสนา'] || '',
            officialId: String(row['officialId'] || row['หมายเลขข้าราชการ'] || ''),
            militaryBranch: row['militaryBranch'] || row['เหล่า'] || '',
            commissionDate: row['commissionDate'] || row['วันบรรจุ'] || '',
            currentAddress: row['currentAddress'] || row['ที่อยู่'] || '',
            emergencyContactName: row['emergencyContactName'] || row['ชื่อผู้ติดต่อฉุกเฉิน'] || '',
            emergencyContactPhone: String(row['emergencyContactPhone'] || row['เบอร์ผู้ติดต่อฉุกเฉิน'] || ''),
            emergencyContactRelation: row['emergencyContactRelation'] || row['ความสัมพันธ์ฉุกเฉิน'] || '',
            royalDecorations: row['royalDecorations'] || row['เครื่องราชฯ'] || '',
            trainingHistory: row['trainingHistory'] || row['ประวัติฝึกอบรม'] || '',
            role: 'OFFICER',
            status: 'ปฏิบัติงานปกติ',
            avatarColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)],
            skills: '[]'
          };
          if (!mappedData.firstName || !mappedData.badgeNo) continue;
          
          await fetch('/api/personnel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mappedData)
          });
          successCount++;
        }
        alert(`นำเข้าข้อมูลสำเร็จ ${successCount} รายการ`);
        fetchPersonnel();
        setIsImportModalOpen(false);
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการนำเข้าไฟล์');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const imageFiles = Object.keys(zip.files).filter(name => !zip.files[name].dir && (name.match(/\.(jpe?g|png)$/i)));
      
      if (imageFiles.length === 0) {
        alert('ไม่พบไฟล์รูปภาพ (.jpg, .png) ในไฟล์ ZIP');
        setIsLoading(false);
        return;
      }

      let successCount = 0;
      let notFoundCount = 0;

      for (const filename of imageFiles) {
        // Extract identifier from filename (e.g. ID-001.jpg -> ID-001)
        const nameWithoutExt = filename.split('/').pop()?.split('.')[0] || '';
        if (!nameWithoutExt) continue;

        // Find matching personnel
        const matchedPerson = personnelList.find(p => p.badgeNo === nameWithoutExt || p.citizenId === nameWithoutExt);
        
        if (matchedPerson) {
          // Read file as base64
          const base64Data = await zip.files[filename].async('base64');
          const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
          const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
          const dataUrl = `data:${mimeType};base64,${base64Data}`;

          // Update via API
          const res = await fetch(`/api/personnel/${matchedPerson.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...matchedPerson, avatarColor: dataUrl })
          });

          if (res.ok) successCount++;
        } else {
          notFoundCount++;
        }
      }

      alert(`อัปโหลดรูปภาพสำเร็จ ${successCount} รายการ\nไม่พบข้อมูลที่ตรงกัน ${notFoundCount} รายการ`);
      fetchPersonnel();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการอ่านไฟล์ ZIP');
    }
    
    setIsLoading(false);
    if (zipInputRef.current) zipInputRef.current.value = '';
  };

  // Filter & Search
  const filteredPersonnel = personnelList.filter(p => {
    const matchType = typeFilter === 'all' || p.personnelType === typeFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = 
      (p.firstName && p.firstName.toLowerCase().includes(searchLower)) ||
      (p.lastName && p.lastName.toLowerCase().includes(searchLower)) ||
      (p.badgeNo && p.badgeNo.toLowerCase().includes(searchLower));
    return matchType && matchSearch;
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

  return (
    <div className="pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">จัดการข้อมูลบุคลากร (Personnel)</h2>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg transition-all font-medium text-sm flex items-center"
          >
            <i className="fa-solid fa-file-excel mr-2 text-green-600"></i> โหลดฟอร์ม
          </button>
          
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg transition-all font-medium text-sm flex items-center"
          >
            <i className="fa-solid fa-file-import mr-2 text-blue-600"></i> นำเข้า Excel
          </button>
          <button
            onClick={() => zipInputRef.current?.click()}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg transition-all font-medium text-sm flex items-center"
            title="อัปโหลดไฟล์ ZIP ที่ตั้งชื่อรูปภาพตามรหัสบัตร/เลขบัตรประชาชน"
          >
            <i className="fa-solid fa-file-image mr-2 text-purple-600"></i> นำเข้ารูป (ZIP)
          </button>
          <input 
            type="file" 
            accept=".zip" 
            className="hidden" 
            ref={zipInputRef} 
            onChange={handleImportZip} 
          />

          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg transition-all font-medium text-sm flex items-center"
          >
            <i className="fa-solid fa-file-export mr-2 text-green-600"></i> ส่งออก Excel
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkPrint}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-500/30 transition-all font-medium text-sm flex items-center"
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
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-lg shadow-primary-500/30 transition-all font-medium text-sm flex items-center"
          >
            <i className="fa-solid fa-user-plus mr-2"></i>
            เพิ่มบุคลากร
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            placeholder="ค้นหาจากชื่อ หรือรหัสพนักงาน..." 
            value={searchQuery}
            onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); 
            }}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 shadow-sm"
          />
        </div>
        <select 
          value={typeFilter} 
          onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1); 
          }}
          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 shadow-sm sm:w-64"
        >
          <option value="all">ทั้งหมด (All Types)</option>
          <option value="นายทหารสัญญาบัตร">นายทหารสัญญาบัตร</option>
          <option value="นายทหารประทวน">นายทหารประทวน</option>
          <option value="พนักงานราชการ">พนักงานราชการ</option>
          <option value="ลูกจ้าง">ลูกจ้าง</option>
          <option value="ทหารกองประจำการ">ทหารกองประจำการ</option>
        </select>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden overflow-x-auto shadow-xl">
        {isLoading ? (
          <div className="text-center py-12">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400 mb-3 block"></i>
            <p className="text-sm text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
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
        )}
        
        {/* Pagination Controls */}
        {!isLoading && filteredPersonnel.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-300 dark:border-slate-600/50 bg-slate-100/50 dark:bg-slate-800/80">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              แสดง <span className="font-medium text-slate-900 dark:text-white">{indexOfFirstItem + 1}</span> ถึง <span className="font-medium text-slate-900 dark:text-white">{Math.min(indexOfLastItem, filteredPersonnel.length)}</span> จากทั้งหมด <span className="font-medium text-slate-900 dark:text-white">{filteredPersonnel.length}</span> รายการ
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                ก่อนหน้า
              </button>
              
              <div className="flex items-center space-x-1">
                {[...Array(totalPages)].map((_, idx) => {
                  const page = idx + 1;
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button 
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors ${currentPage === page ? 'bg-primary-500 text-white font-medium shadow-sm' : 'bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="text-slate-500 px-1">...</span>;
                  }
                  return null;
                })}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>

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
              body: JSON.stringify(data)
            });
            if (res.ok) fetchPersonnel();
          } catch (err) {
            console.error(err);
          }
        }}
        initialData={editingPerson}
      />

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <i className="fa-solid fa-file-import text-blue-500 mr-3"></i> นำเข้าข้อมูลจาก Excel
              </h2>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-6 text-sm text-slate-700 dark:text-slate-300">
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-xl border border-blue-200 dark:border-blue-800/30 flex gap-3">
                <i className="fa-solid fa-circle-info mt-0.5"></i>
                <div>
                  <p className="font-semibold mb-1">คำแนะนำในการนำเข้าข้อมูล</p>
                  <p className="text-xs opacity-90">
                    กรุณาเตรียมไฟล์ Excel (.xlsx หรือ .xls) โดยต้องมีหัวคอลัมน์ในบรรทัดแรก (แถวที่ 1) ตามรูปแบบด้านล่างนี้ คุณสามารถดาวน์โหลดฟอร์มตัวอย่างไปกรอกข้อมูลได้เพื่อความถูกต้อง
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">คอลัมน์ที่ระบบต้องการ:</h3>
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      <tr>
                        <th className="py-2 px-4 font-semibold w-1/3">ชื่อคอลัมน์ (Header)</th>
                        <th className="py-2 px-4 font-semibold">คำอธิบาย</th>
                        <th className="py-2 px-4 font-semibold w-20 text-center">บังคับ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      <tr>
                        <td className="py-2 px-4 font-mono text-primary-600 dark:text-primary-400">คำนำหน้า หรือ prefix</td>
                        <td className="py-2 px-4 text-slate-500">เช่น นาย, นาง, นางสาว, ว่าที่ ร.ต.</td>
                        <td className="py-2 px-4 text-center"><i className="fa-solid fa-check text-green-500"></i></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-primary-600 dark:text-primary-400">ชื่อ หรือ firstName</td>
                        <td className="py-2 px-4 text-slate-500">ชื่อจริง (ไม่ต้องใส่คำนำหน้า)</td>
                        <td className="py-2 px-4 text-center"><i className="fa-solid fa-check text-green-500"></i></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-primary-600 dark:text-primary-400">นามสกุล หรือ lastName</td>
                        <td className="py-2 px-4 text-slate-500">นามสกุล</td>
                        <td className="py-2 px-4 text-center"><i className="fa-solid fa-check text-green-500"></i></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-primary-600 dark:text-primary-400">รหัสบัตร หรือ badgeNo</td>
                        <td className="py-2 px-4 text-slate-500">รหัสประจำตัวบนบัตร (ต้องไม่ซ้ำกัน)</td>
                        <td className="py-2 px-4 text-center"><i className="fa-solid fa-check text-green-500"></i></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">ประเภท หรือ personnelType</td>
                        <td className="py-2 px-4 text-slate-500">นายทหารสัญญาบัตร, นายทหารประทวน ฯลฯ</td>
                        <td className="py-2 px-4 text-center text-slate-300">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">ตำแหน่ง หรือ position</td>
                        <td className="py-2 px-4 text-slate-500">ชื่อตำแหน่งงาน</td>
                        <td className="py-2 px-4 text-center text-slate-300">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">หน่วยงาน หรือ department</td>
                        <td className="py-2 px-4 text-slate-500">ชื่อแผนกหรือหน่วยงานสังกัด</td>
                        <td className="py-2 px-4 text-center text-slate-300">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">แผนก/ฝ่าย หรือ subDepartment</td>
                        <td className="py-2 px-4 text-slate-500">ชื่อแผนกย่อย</td>
                        <td className="py-2 px-4 text-center text-slate-300">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">เลขบัตรปชช หรือ citizenId</td>
                        <td className="py-2 px-4 text-slate-500">เลขประจำตัวประชาชน 13 หลัก</td>
                        <td className="py-2 px-4 text-center text-slate-300">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">กรุ๊ปเลือด หรือ bloodType</td>
                        <td className="py-2 px-4 text-slate-500">A, B, O, AB</td>
                        <td className="py-2 px-4 text-center text-slate-300">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">เบอร์โทร หรือ phone</td>
                        <td className="py-2 px-4 text-slate-500">เบอร์โทรศัพท์</td>
                        <td className="py-2 px-4 text-center text-slate-300">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">อีเมล หรือ email</td>
                        <td className="py-2 px-4 text-slate-500">อีเมลที่ติดต่อได้</td>
                        <td className="py-2 px-4 text-center text-slate-300">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">มือถือ หรือ mobile</td>
                        <td className="py-2 px-4 text-slate-500">เบอร์โทรศัพท์มือถือสำรอง</td>
                        <td className="py-2 px-4 text-center text-slate-300">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">การศึกษา หรือ education</td>
                        <td className="py-2 px-4 text-slate-500">ประวัติการศึกษา</td>
                        <td className="py-2 px-4 text-center text-slate-300">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">ประสบการณ์ หรือ experience</td>
                        <td className="py-2 px-4 text-slate-500">ประวัติการทำงาน</td>
                        <td className="py-2 px-4 text-center text-slate-300">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">วันเกิด หรือ dateOfBirth</td>
                        <td className="py-2 px-4 text-slate-500">YYYY-MM-DD</td>
                        <td className="py-2 px-4 text-center text-slate-300">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">ศาสนา หรือ religion</td>
                        <td className="py-2 px-4 text-slate-500">พุทธ, คริสต์, อิสลาม ฯลฯ</td>
                        <td className="py-2 px-4 text-center text-slate-300">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">หมายเลขข้าราชการ หรือ officialId</td>
                        <td className="py-2 px-4 text-slate-500">รหัสข้าราชการประจำตัว</td>
                        <td className="py-2 px-4 text-center text-slate-300">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">เหล่า หรือ militaryBranch</td>
                        <td className="py-2 px-4 text-slate-500">ทหารบก, ทหารเรือ, ทหารอากาศ ฯลฯ</td>
                        <td className="py-2 px-4 text-center text-slate-300">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">วันบรรจุ หรือ commissionDate</td>
                        <td className="py-2 px-4 text-slate-500">วันที่บรรจุเข้ารับราชการ YYYY-MM-DD</td>
                        <td className="py-2 px-4 text-center text-slate-300">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">ที่อยู่ หรือ currentAddress</td>
                        <td className="py-2 px-4 text-slate-500">ที่อยู่ปัจจุบัน</td>
                        <td className="py-2 px-4 text-center text-slate-300">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">ติดต่อฉุกเฉิน หรือ emergencyContact...</td>
                        <td className="py-2 px-4 text-slate-500">ชื่อ, เบอร์, ความสัมพันธ์</td>
                        <td className="py-2 px-4 text-center text-slate-300">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">อื่นๆ (หมายเหตุ, เครื่องราชฯ ฯลฯ)</td>
                        <td className="py-2 px-4 text-slate-500">notes, royalDecorations, trainingHistory</td>
                        <td className="py-2 px-4 text-center text-slate-300">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
                <button
                  onClick={handleDownloadTemplate}
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl transition-all font-medium text-sm flex items-center justify-center"
                >
                  <i className="fa-solid fa-download mr-2 text-green-600"></i> โหลดไฟล์ต้นแบบ (Template)
                </button>
                <div className="w-full sm:w-auto">
                  <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImportExcel} 
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-8 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/30 transition-all font-medium text-sm flex items-center justify-center"
                  >
                    <i className="fa-solid fa-cloud-arrow-up mr-2"></i> เลือกไฟล์และอัปโหลด
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Management Modal for Admin */}
      {leaveModalPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setLeaveModalPerson(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <i className="fa-solid fa-times text-xl"></i>
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              จัดการการลา: {leaveModalPerson.prefix}{leaveModalPerson.firstName} {leaveModalPerson.lastName}
            </h2>
            <LeaveList personnelId={leaveModalPerson.id} isAdmin={true} />
          </div>
        </div>
      )}
    </div>
  );
}
