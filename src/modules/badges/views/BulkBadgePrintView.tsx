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
import { toPng } from 'html-to-image';

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
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPng = async () => {
    const node = document.getElementById('printable-badges-grid');
    if (!node) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(node, {
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `badges-bulk-print-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('ดาวน์โหลดไฟล์รูปภาพบัตร (PNG) เรียบร้อยแล้ว');
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการบันทึกภาพ PNG');
    } finally {
      setIsExporting(false);
    }
  };

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
        <div className="space-y-6 w-full">
          <Card padding="none" className="w-full overflow-hidden">
            {/* Control Toolbar (Hidden on Print) */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 no-print print:hidden">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-lg shrink-0">
                  <i className="fa-solid fa-print" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      ระบบพิมพ์บัตรประจำตัวแบบกลุ่ม
                    </h2>
                    <Badge variant="primary" size="sm">
                      {personnelList.length} ใบ
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    CR80 Standard (53.98 × 85.60 mm) • รองรับการพิมพ์ 2 หน้าพร้อมเส้นพับ
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 justify-between lg:justify-end">
                {/* Print Side Selector */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 items-center text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPrintSide('pair')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      printSide === 'pair'
                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>พิมพ์คู่หน้า-หลัง (ระยะ 0.05mm)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintSide('front')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
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
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      printSide === 'back'
                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>เฉพาะหลัง</span>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
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
                    icon={isExporting ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-image'}
                    onClick={handleExportPng}
                    disabled={isExporting}
                  >
                    {isExporting ? 'กำลังบันทึก...' : 'บันทึกภาพ PNG'}
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
                    onClick={() => window.print()}
                  >
                    สั่งพิมพ์ทันที (Print)
                  </Button>
                </div>
              </div>
            </div>

            {/* Badges Layout Workspace */}
            <div className="p-6 sm:p-10 bg-slate-50/50 dark:bg-slate-900/30 w-full flex flex-col justify-center items-center min-h-[460px] print:p-0 print:m-0 print:bg-transparent">
              <div id="printable-badge-sheet" className="badge-print-container flex flex-wrap gap-8 print:gap-[6mm] justify-center items-start print:w-auto">
                {personnelList.map((person) => (
                  <div key={person.id} className="flex flex-col items-center print:break-inside-avoid group">
                    {/* Personnel Info Card Pill (Hidden on Print) */}
                    <div className="no-print print:hidden mb-2.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between gap-2 max-w-[240px] transition-all group-hover:border-primary-300 dark:group-hover:border-primary-700">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {person.firstName?.[0] || 'U'}
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                          {person.prefix || ''}{person.firstName} {person.lastName}
                        </span>
                      </div>
                      {personnelList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = personnelList.filter((p) => p.id !== person.id);
                            setPersonnelList(updated);
                            setSelectedIds((prev) => prev.filter((i) => i !== person.id));
                            sessionStorage.setItem('bulkPrintIds', JSON.stringify(updated.map((p) => p.id)));
                            toast.success('นำรายชื่อออกจากคิวพิมพ์แล้ว');
                          }}
                          className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-0.5"
                          title="นำออกจากรายการพิมพ์"
                        >
                          <i className="fa-solid fa-xmark text-xs" />
                        </button>
                      )}
                    </div>

                    {/* Print Card Container */}
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
                      <div 
                        className="relative p-0 print:p-0 shadow-sm print:shadow-none overflow-hidden shrink-0"
                        style={{ width: '53.98mm', height: '85.60mm' }}
                      >
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

              {/* Print Scale Helper Note (Hidden on Print) */}
              <div className="mt-8 px-4 py-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2 max-w-xl no-print print:hidden">
                <i className="fa-solid fa-circle-info text-amber-600 dark:text-amber-400 text-sm shrink-0" />
                <span>
                  <strong>ขนาดมาตรฐาน ISO CR80 (5.4 × 8.6 ซม.):</strong> ในหน้าต่างพิมพ์ ให้ตั้งค่า <strong>Scale = 100%</strong> (หรือเอาติ๊ก <em>Scale to fit</em> ออก) และนำติ๊ก <em>Headers/Footers</em> ออก
                </span>
              </div>
            </div>
          </Card>

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
