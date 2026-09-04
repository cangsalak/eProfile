'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Personnel } from '@/types/personnel';
import IDBadge from '../components/IDBadge';
import toast from 'react-hot-toast';

export default function BulkBadgePrintView() {
  const router = useRouter();
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [allPersonnel, setAllPersonnel] = useState<Personnel[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPickingMode, setIsPickingMode] = useState(false);

  useEffect(() => {
    const storedIds = sessionStorage.getItem('bulkPrintIds');
    let idsToPrint: string[] = [];
    if (storedIds) {
      try {
        idsToPrint = JSON.parse(storedIds);
      } catch (e) {
        console.error(e);
      }
    }

    // Fetch settings and personnel
    Promise.all([
      fetch('/api/settings', { cache: 'no-store' }).then(res => res.json()),
      fetch('/api/personnel?all=true', { cache: 'no-store' }).then(res => res.json())
    ])
    .then(([settingsData, personnelData]) => {
      if (!settingsData.error) setSettings(settingsData);
      
      const pList: Personnel[] = Array.isArray(personnelData) ? personnelData : personnelData.data || [];
      if (Array.isArray(pList)) {
        setAllPersonnel(pList);
        if (idsToPrint.length > 0) {
          const filtered = pList.filter((p: Personnel) => idsToPrint.includes(p.id));
          setPersonnelList(filtered);
          setSelectedIds(idsToPrint);
        } else {
          setIsPickingMode(true);
        }
      }
    })
    .catch(console.error)
    .finally(() => setIsLoading(false));
  }, [router]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const filtered = allPersonnel.filter(p => {
      const full = `${p.prefix || ''}${p.firstName} ${p.lastName} ${p.badgeNo || ''} ${p.position || ''}`.toLowerCase();
      return full.includes(search.toLowerCase());
    });
    const filteredIds = filtered.map(p => p.id);
    const allSelected = filteredIds.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleConfirmSelection = () => {
    if (selectedIds.length === 0) {
      toast.error('กรุณาเลือกอย่างน้อย 1 รายชื่อ');
      return;
    }
    sessionStorage.setItem('bulkPrintIds', JSON.stringify(selectedIds));
    const filtered = allPersonnel.filter(p => selectedIds.includes(p.id));
    setPersonnelList(filtered);
    setIsPickingMode(false);
    toast.success(`เตรียมพิมพ์บัตร ${filtered.length} รายการ`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-primary-500 mb-4"></i>
          <p className="text-slate-500 dark:text-slate-400">กำลังเตรียมข้อมูลสำหรับพิมพ์...</p>
        </div>
      </div>
    );
  }

  const filteredPersonnel = allPersonnel.filter(p => {
    const full = `${p.prefix || ''}${p.firstName} ${p.lastName} ${p.badgeNo || ''} ${p.position || ''}`.toLowerCase();
    return full.includes(search.toLowerCase());
  });

  if (isPickingMode || personnelList.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 md:p-8 text-slate-800 dark:text-slate-200">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-id-badge text-primary-500"></i> เลือกรายชื่อสำหรับพิมพ์บัตรประจำตัว
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                กรุณาเลือกรายชื่อกำลังพลที่ต้องการพิมพ์บัตร หรือไปที่หน้าจัดการบุคลากร
              </p>
            </div>
            <button
              onClick={() => router.push('/modules/personnel/manage')}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 border border-slate-200 dark:border-slate-700"
            >
              <i className="fa-solid fa-users-gear text-primary-500"></i> ไปที่จัดการบุคลากร
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="relative flex-1">
                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาชื่อ, นามสกุล, ยศ, เลขประจำตัว..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700"
                >
                  {filteredPersonnel.every(p => selectedIds.includes(p.id)) ? 'ยกเลิกเลือกทั้งหมด' : 'เลือกทั้งหมดที่ค้นพบ'}
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl">
              {filteredPersonnel.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  ไม่พบข้อมูลกำลังพลตรงตามคำค้นหา
                </div>
              ) : (
                filteredPersonnel.map((p) => {
                  const isChecked = selectedIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                        isChecked ? 'bg-primary-500/5 dark:bg-primary-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(p.id)}
                          className="w-4 h-4 text-primary-500 rounded border-slate-300 dark:border-slate-700 focus:ring-primary-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {p.prefix || ''} {p.firstName} {p.lastName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {p.position || 'ไม่ระบุตำแหน่ง'} • {p.department || 'ไม่ระบุสังกัด'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{p.badgeNo || p.citizenId || ''}</span>
                    </label>
                  );
                })
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                เลือกแล้ว <strong className="text-primary-500">{selectedIds.length}</strong> รายการ
              </span>
              <button
                onClick={handleConfirmSelection}
                disabled={selectedIds.length === 0}
                className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all shadow-md flex items-center gap-2"
              >
                <i className="fa-solid fa-print"></i> พิมพ์บัตรประจำตัว ({selectedIds.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 print:bg-white text-slate-800 dark:text-slate-200">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white !important;
          }
          .cr80-card {
            width: 5.4cm;
            height: 8.6cm;
            overflow: hidden;
            position: relative;
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
        @media screen {
          .cr80-card {
            width: 216px;
            height: 344px; /* roughly 54x86 ratio */
            overflow: hidden;
            position: relative;
          }
        }
      `}} />
      
      {/* Non-printable Screen Controls */}
      <div className="print:hidden pt-10 pb-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl mb-8 shadow-lg gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              <i className="fa-solid fa-print mr-2 text-primary-500"></i> พิมพ์บัตรแบบกลุ่ม ({personnelList.length} ใบ)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">กรุณาตั้งค่ากระดาษเป็นขนาด A4 (No Margins) และเปิดใช้งาน "Print Background Graphics"</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsPickingMode(true)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
            >
              <i className="fa-solid fa-user-plus text-primary-500"></i> เลือกรายชื่อเพิ่ม
            </button>
            <button 
              onClick={() => router.push('/modules/personnel/manage')}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700"
            >
              กลับ
            </button>
            <button 
              onClick={() => window.print()}
              className="px-5 py-2 bg-primary-500 hover:bg-primary-600 shadow-[0_0_15px_rgba(99,102,241,0.4)] rounded-lg text-white text-sm font-medium transition-colors flex items-center"
            >
              <i className="fa-solid fa-print mr-2"></i> สั่งพิมพ์ (Print)
            </button>
          </div>
        </div>
      </div>

      {/* Printable Area - Only this will show properly in print mode */}
      <div className="px-4 pb-20 print:p-0 print:m-0 print:max-w-none">
        <div className="flex flex-wrap gap-4 print:gap-[5mm] justify-center print:justify-start">
          
          {personnelList.map(person => (
            <div key={person.id} className="flex flex-col items-center print:break-inside-avoid mb-4">
              <h3 className="print:hidden text-slate-500 dark:text-slate-400 text-xs mb-2 text-center w-full truncate">{person.firstName} {person.lastName}</h3>
              
              {/* The Badge with cut lines for print */}
              <div className="relative p-2 border border-dashed border-slate-300 dark:border-slate-700 print:border-none print:p-0">
                {/* Cut marks (only visible in print or subtle on screen) */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-slate-400 -translate-x-1 -translate-y-1 print:-translate-x-[1px] print:-translate-y-[1px]"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-slate-400 translate-x-1 -translate-y-1 print:translate-x-[1px] print:-translate-y-[1px]"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-slate-400 -translate-x-1 translate-y-1 print:-translate-x-[1px] print:translate-y-[1px]"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-slate-400 translate-x-1 translate-y-1 print:translate-x-[1px] print:translate-y-[1px]"></div>
                
                <div className="cr80-card bg-white shadow-sm print:shadow-none ring-1 ring-slate-200/50 print:ring-0">
                  <IDBadge 
                    personnel={person} 
                    settings={settings} 
                    qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${person.id}` : ''}
                  />
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
