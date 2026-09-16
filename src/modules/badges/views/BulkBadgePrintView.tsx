'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Personnel } from '@/modules/users';
import IDBadge from '../components/IDBadge';
import CR80Pair from '../components/CR80Pair';
import PrintPreviewModal from '@/modules/print/components/PrintPreviewModal';
import toast from 'react-hot-toast';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';
import { Button, Badge, Card, CardHeader, Input, Checkbox } from '@/components/ui';

export default function BulkBadgePrintView() {
  const router = useRouter();
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [allPersonnel, setAllPersonnel] = useState<Personnel[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState<any>({});
  const [isPickingMode, setIsPickingMode] = useState(false);
  const [printSide, setPrintSide] = useState<'pair' | 'front' | 'back'>('pair');
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const queryId = urlParams?.get('id');
    const queryIds = urlParams?.get('ids');

    let idsToPrint: string[] = [];
    if (queryId) {
      idsToPrint = [queryId];
    } else if (queryIds) {
      idsToPrint = queryIds.split(',').map((s) => s.trim()).filter(Boolean);
    } else {
      const storedIds = sessionStorage.getItem('bulkPrintIds');
      if (storedIds) {
        try {
          idsToPrint = JSON.parse(storedIds);
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Fetch settings and personnel (Always fresh)
    Promise.all([
      fetch(`/api/settings?_t=${Date.now()}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache' } }).then((res) => res.json()),
      fetch(`/api/personnel?all=true&_t=${Date.now()}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache' } }).then((res) => res.json()),
    ])
      .then(([settingsData, personnelData]) => {
        if (!settingsData.error) setSettings(settingsData);

        const pList: Personnel[] = Array.isArray(personnelData) ? personnelData : personnelData.data || [];
        if (Array.isArray(pList)) {
          setAllPersonnel(pList);
          if (idsToPrint.length > 0) {
            const filtered = pList.filter((p: Personnel) => idsToPrint.includes(p.id));
            setPersonnelList(filtered.length > 0 ? filtered : pList.slice(0, 4));
            setSelectedIds(filtered.length > 0 ? idsToPrint : pList.slice(0, 4).map((p) => p.id));
          } else {
            const defaultSet = pList.slice(0, 4);
            setPersonnelList(defaultSet);
            setSelectedIds(defaultSet.map((p) => p.id));
          }
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredPersonnel = useMemo(() => {
    return allPersonnel.filter((p) => {
      const full = `${p.prefix || ''}${p.firstName} ${p.lastName} ${p.badgeNo || ''} ${p.position || ''}`.toLowerCase();
      return full.includes(search.toLowerCase());
    });
  }, [allPersonnel, search]);

  const handleSelectAll = () => {
    const filteredIds = filteredPersonnel.map((p) => p.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleConfirmSelection = () => {
    if (selectedIds.length === 0) {
      toast.error('กรุณาเลือกอย่างน้อย 1 รายชื่อ');
      return;
    }
    sessionStorage.setItem('bulkPrintIds', JSON.stringify(selectedIds));
    const filtered = allPersonnel.filter((p) => selectedIds.includes(p.id));
    setPersonnelList(filtered);
    setIsPickingMode(false);
    toast.success(`เตรียมพิมพ์บัตร ${filtered.length} รายการ`);
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary-500 mb-3"></i>
          <p className="text-xs text-slate-500 dark:text-slate-400">กำลังเตรียมข้อมูลสำหรับพิมพ์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-prompt">
      {/* Submenu Slots in Universal Header */}
      <PageHeaderExtra>
        <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
          <Link
            href="/modules/badges"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 bg-primary-600 text-white shadow-sm shadow-primary-500/30"
          >
            <i className="fa-solid fa-print text-xs"></i>
            <span>พิมพ์บัตรประจำตัว</span>
          </Link>
          <Link
            href="/modules/badges/settings"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60"
          >
            <i className="fa-solid fa-palette text-xs text-slate-400"></i>
            <span>สตูดิโอออกแบบบัตร</span>
          </Link>
          <Link
            href="/modules/badges/my"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60"
          >
            <i className="fa-solid fa-address-card text-xs text-slate-400"></i>
            <span>บัตรของฉัน</span>
          </Link>
        </div>
      </PageHeaderExtra>

      {/* Picking Mode / Empty State View */}
      {isPickingMode || personnelList.length === 0 ? (
        <div className="space-y-6">
          <Card className="no-print print:hidden">
            <CardHeader
              title="เลือกรายชื่อสำหรับพิมพ์บัตรประจำตัว"
              subtitle="เลือกรายชื่อกำลังพลที่ต้องการสั่งพิมพ์ หรือเลือกทั้งหมดเพื่อพิมพ์เป็นชุด"
              icon="fa-solid fa-id-card"
              action={
                <Link href="/modules/users">
                  <Button
                    variant="outline"
                    size="xs"
                    icon="fa-solid fa-users-gear"
                  >
                    ไปที่ทะเบียนบุคลากร
                  </Button>
                </Link>
              }
            />

            <div className="p-5 space-y-4">
              {/* Search & Bulk Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                <div className="flex-1">
                  <Input
                    placeholder="ค้นหาชื่อ, นามสกุล, ยศ, เลขประจำตัว, หรือตำแหน่ง..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    icon="fa-solid fa-search"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleSelectAll}
                  >
                    {filteredPersonnel.length > 0 && filteredPersonnel.every((p) => selectedIds.includes(p.id))
                      ? 'ยกเลิกเลือกทั้งหมด'
                      : 'เลือกทั้งหมดที่ค้นพบ'}
                  </Button>
                </div>
              </div>

              {/* Personnel Checklist */}
              <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl">
                {filteredPersonnel.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    <i className="fa-solid fa-user-slash text-3xl mb-2 block opacity-40"></i>
                    ไม่พบข้อมูลกำลังพลตรงตามคำค้นหา
                  </div>
                ) : (
                  filteredPersonnel.map((p) => {
                    const isChecked = selectedIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-primary-500/5 dark:bg-primary-500/10'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelect(p.id)}
                            className="w-4 h-4 text-primary-600 rounded border-slate-300 dark:border-slate-700 focus:ring-primary-500"
                          />
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {p.prefix || ''} {p.firstName} {p.lastName}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {p.position || 'ไม่ระบุตำแหน่ง'} • {p.department || 'ไม่ระบุสังกัด'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="neutral" size="sm">
                          {p.badgeNo || p.citizenId || 'ID'}
                        </Badge>
                      </label>
                    );
                  })
                )}
              </div>

              {/* Footer Selection Summary */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  เลือกแล้ว <strong className="text-primary-600 dark:text-primary-400">{selectedIds.length}</strong> จากทั้งหมด {allPersonnel.length} รายการ
                </span>
                <Button
                  variant="primary"
                  size="md"
                  icon="fa-solid fa-print"
                  disabled={selectedIds.length === 0}
                  onClick={handleConfirmSelection}
                >
                  จัดเตรียมพิมพ์บัตร ({selectedIds.length})
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* Printable Ready View */
        <div className="space-y-6">
          <style dangerouslySetInnerHTML={{
            __html: `
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 8mm 6mm !important;
                }
                html, body, #__next, main, .main-content {
                  background: white !important;
                  background-color: white !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  border: none !important;
                  box-shadow: none !important;
                }
                header, nav, aside, footer, .sidebar, .navbar, .page-header, .page-header-extra, .no-print, .print\\:hidden, [class*="print:hidden"], [class*="no-print"] {
                  display: none !important;
                  visibility: hidden !important;
                  height: 0 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                .cr80-card {
                  width: 5.4cm !important;
                  height: 8.6cm !important;
                  overflow: hidden !important;
                  position: relative !important;
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
              }
              @media screen {
                .cr80-card {
                  width: 216px;
                  height: 344px;
                  overflow: hidden;
                  position: relative;
                }
              }
            `
          }} />

          {/* Control Bar (Hidden on Print) */}
          <Card className="no-print print:hidden">
            <div className="p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    พร้อมพิมพ์บัตรแบบกลุ่ม ({personnelList.length} ใบ)
                  </h3>
                  <Badge variant="success" size="sm">
                    CR80 Standard (5.4 x 8.6 cm)
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  กรุณาตั้งค่าเครื่องพิมพ์เป็นกระดาษขนาด <strong>A4 (No Margins)</strong> และเปิดใช้งานตัวเลือก <strong>"Print Background Graphics"</strong>
                </p>
              </div>

              {/* Print Side Selector */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPrintSide('pair')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    printSide === 'pair'
                      ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-table-columns text-xs" />
                  <span>หน้า-หลังคู่กัน (0.05 มม.)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintSide('front')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    printSide === 'front'
                      ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>เฉพาะหน้า</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintSide('back')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    printSide === 'back'
                      ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>เฉพาะหลัง</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  icon="fa-solid fa-user-plus"
                  onClick={() => setIsPickingMode(true)}
                >
                  เลือกรายชื่อเพิ่ม
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon="fa-solid fa-eye"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  ดูตัวอย่างก่อนพิมพ์
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  icon="fa-solid fa-print"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  สั่งพิมพ์ทันที (Print)
                </Button>
              </div>
            </div>
          </Card>

          {/* Badges Layout Grid (Printable Area) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 print:bg-transparent print:border-none print:p-0 print:shadow-none print:rounded-none">
            <div className="flex flex-wrap gap-6 print:gap-[6mm] justify-center print:justify-start">
              {personnelList.map((person) => (
                <div key={person.id} className="flex flex-col items-center print:break-inside-avoid mb-4">
                  <span className="no-print print:hidden text-slate-500 dark:text-slate-400 text-xs mb-2 text-center font-medium truncate max-w-[216px]">
                    {person.firstName} {person.lastName}
                  </span>

                  {/* Print Card Container with exact 0.05mm gap between front and back */}
                  {printSide === 'pair' ? (
                    <CR80Pair
                      front={
                        <IDBadge
                          personnel={person}
                          settings={settings}
                          qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${person.id}` : ''}
                        />
                      }
                      back={
                        <IDBadge
                          personnel={person}
                          settings={settings}
                          qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${person.id}` : ''}
                          isBack={true}
                        />
                      }
                    />
                  ) : (
                    <div className="relative p-2 border border-dashed border-slate-300 dark:border-slate-700 print:border-none print:p-0 rounded-2xl bg-white dark:bg-slate-900 shadow-sm print:shadow-none">
                      <IDBadge
                        personnel={person}
                        settings={settings}
                        qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${person.id}` : ''}
                        isBack={printSide === 'back'}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Print Preview Modal */}
          <PrintPreviewModal
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            onConfirmPrint={() => window.print()}
            title={`พิมพ์บัตรประจำตัว (${personnelList.length} รายการ)`}
            paperSettings={{
              pageSize: 'A4',
              orientation: 'portrait',
              margin: '8mm',
              showGaruda: false,
              watermark: 'none',
              showSignature: false,
              unitName: 'CR80 Badge Print Sheet',
            }}
          >
            <div className="p-6 flex flex-wrap gap-6 justify-center">
              {personnelList.map((person) => (
                <div key={person.id} className="flex flex-col items-center">
                  <span className="text-slate-500 text-xs mb-2 font-medium">
                    {person.firstName} {person.lastName}
                  </span>
                  {printSide === 'pair' ? (
                    <CR80Pair
                      showCropMarks={false}
                      front={
                        <IDBadge
                          personnel={person}
                          settings={settings}
                          qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${person.id}` : ''}
                        />
                      }
                      back={
                        <IDBadge
                          personnel={person}
                          settings={settings}
                          qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${person.id}` : ''}
                          isBack={true}
                        />
                      }
                    />
                  ) : (
                    <IDBadge
                      personnel={person}
                      settings={settings}
                      qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${person.id}` : ''}
                      isBack={printSide === 'back'}
                    />
                  )}
                </div>
              ))}
            </div>
          </PrintPreviewModal>
        </div>
      )}
    </div>
  );
}
