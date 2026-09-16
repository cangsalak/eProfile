'use client';

import React, { useState, useEffect } from 'react';
import { MainPrintTab, PaperSettings } from '../types';
import PrintSettingsToolbar from '../components/PrintSettingsToolbar';
import DocumentPrintSection from '../components/DocumentPrintSection';
import BadgePrintSection from '../components/BadgePrintSection';
import BarcodeQrPrintSection from '../components/BarcodeQrPrintSection';
import CertificatePrintSection from '../components/CertificatePrintSection';
import PrintPreviewModal from '../components/PrintPreviewModal';
import { Button, Badge } from '@/components/ui';

export default function PrintCenterView() {
  const [mainTab, setMainTab] = useState<MainPrintTab>('documents');
  const [personnelList, setPersonnelList] = useState<any[]>([]);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>('');
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [paperSettings, setPaperSettings] = useState<PaperSettings>({
    pageSize: 'A4',
    orientation: 'portrait',
    margin: '10mm',
    showGaruda: true,
    watermark: 'none',
    showSignature: true,
    unitName: 'กองบังคับการและหน่วยปฏิบัติการพิเศษ',
  });

  // Load fresh personnel list & system settings
  useEffect(() => {
    Promise.all([
      fetch(`/api/settings?_t=${Date.now()}`, { cache: 'no-store' }).then((res) => res.json()),
      fetch(`/api/personnel?all=true&_t=${Date.now()}`, { cache: 'no-store' }).then((res) => res.json()),
    ])
      .then(([settingsData, personnelData]) => {
        if (!settingsData.error) setSettings(settingsData);
        const pList = Array.isArray(personnelData) ? personnelData : personnelData.data || [];
        if (Array.isArray(pList) && pList.length > 0) {
          setPersonnelList(pList);
          // Check query params
          const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
          const qId = urlParams?.get('id');
          const qTab = urlParams?.get('tab') as MainPrintTab;
          if (qTab && ['documents', 'badges', 'barcodes', 'certificates'].includes(qTab)) {
            setMainTab(qTab);
          }
          if (qId && pList.some((p: any) => String(p.id) === qId)) {
            setSelectedPersonnelId(qId);
          } else {
            setSelectedPersonnelId(String(pList[0].id));
          }
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Keyboard shortcut Ctrl+P / Cmd+P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        // Native print triggers @media print
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const selectedPerson =
    personnelList.find((p) => String(p.id) === selectedPersonnelId) ||
    personnelList[0] || {
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      rank: 'พ.ต.ท.',
      position: 'สารวัตรฝ่ายยุทธการ',
      department: { name: 'กองบังคับการ' },
      subDepartment: { name: 'ฝ่ายยุทธการ' },
      badgeNo: 'EP-90214',
      citizenId: '1-1002-00345-67-8',
      salary: 42500,
    };

  const tabs: { id: MainPrintTab; name: string; icon: string; countDesc: string }[] = [
    { id: 'documents', name: 'เอกสารราชการและแบบฟอร์ม', icon: 'fa-solid fa-file-lines', countDesc: 'ใบลา, สลิป, รปภ.๑, ทำเนียบ' },
    { id: 'badges', name: 'บัตรประจำตัว CR80 (0.05 มม.)', icon: 'fa-solid fa-id-card', countDesc: 'หน้า-หลังคู่กัน Single-pass' },
    { id: 'barcodes', name: 'บาร์โค้ด & QR Code สติกเกอร์', icon: 'fa-solid fa-barcode', countDesc: 'ป้ายชื่อ, สติกเกอร์แฟ้ม' },
    { id: 'certificates', name: 'หนังสือรับรองราชการ', icon: 'fa-solid fa-award', countDesc: 'รับรองเงินเดือน / การทำงาน' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center font-prompt">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary-500 mb-3"></i>
          <p className="text-xs text-slate-500 dark:text-slate-400">กำลังเตรียมศูนย์การพิมพ์เอกสาร...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 font-prompt animate-fade-in">
      {/* ─── Global Print CSS ─── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: ${paperSettings.pageSize === 'CR80' ? '8.6cm 5.4cm' : 'A4'} ${paperSettings.orientation};
                margin: ${paperSettings.margin} !important;
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
            }
          `,
        }}
      />

      {/* ─── TOP NO-PRINT CONTROL BAR ─── */}
      <div className="no-print space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[28px] bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/80 dark:border-slate-700 shadow-clay-card">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 text-white shadow-clay-orb flex items-center justify-center text-xl shrink-0">
              <i className="fa-solid fa-print"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  ศูนย์รวมการพิมพ์เอกสารราชการ (Unified Print Center)
                </h2>
                <Badge variant="candy" size="xs">
                  {paperSettings.pageSize} Ready
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                พิมพ์แบบฟอร์มเอกสารราชการ บัตรประจำตัว สติกเกอร์ และหนังสือรับรอง โดยไม่มีแถบเมนูรบกวน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="md"
              icon="fa-solid fa-eye"
              onClick={() => setIsPreviewOpen(true)}
              className="px-4"
            >
              ดูตัวอย่างก่อนพิมพ์
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              icon="fa-solid fa-print"
              onClick={handlePrint}
              className="shadow-clay-button px-6"
            >
              สั่งพิมพ์ทันที (Ctrl + P)
            </Button>
          </div>
        </div>

        {/* ─── MAIN 4 TABS NAVIGATION ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tabs.map((tab) => {
            const isSelected = mainTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMainTab(tab.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3.5 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-primary-500/15 to-indigo-500/15 border-primary-500 shadow-clay-card ring-2 ring-primary-500/20'
                    : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 ${
                    isSelected
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <i className={tab.icon}></i>
                </div>
                <div className="overflow-hidden">
                  <h4
                    className={`text-xs sm:text-sm font-black truncate ${
                      isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {tab.name}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {tab.countDesc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ─── SETTINGS TOOLBAR ─── */}
        <PrintSettingsToolbar
          paperSettings={paperSettings}
          setPaperSettings={setPaperSettings}
          personnelList={personnelList}
          selectedPersonnelId={selectedPersonnelId}
          setSelectedPersonnelId={setSelectedPersonnelId}
          showGarudaControl={mainTab !== 'badges'}
        />
      </div>

      {/* ─── TAB CONTENT RENDERING ─── */}
      <div className="animate-fade-in">
        {mainTab === 'documents' && (
          <DocumentPrintSection
            person={selectedPerson}
            paperSettings={paperSettings}
            allPersonnel={personnelList}
          />
        )}

        {mainTab === 'badges' && (
          <BadgePrintSection
            person={selectedPerson}
            allPersonnel={personnelList}
            settings={settings}
            paperSettings={paperSettings}
          />
        )}

        {mainTab === 'barcodes' && (
          <BarcodeQrPrintSection
            person={selectedPerson}
            allPersonnel={personnelList}
            paperSettings={paperSettings}
          />
        )}

        {mainTab === 'certificates' && (
          <CertificatePrintSection
            person={selectedPerson}
            paperSettings={paperSettings}
          />
        )}
      </div>

      {/* ─── PRINT PREVIEW MODAL ─── */}
      <PrintPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onConfirmPrint={handlePrint}
        title={tabs.find((t) => t.id === mainTab)?.name || 'ตัวอย่างก่อนพิมพ์'}
        paperSettings={paperSettings}
      >
        {mainTab === 'documents' && (
          <DocumentPrintSection
            person={selectedPerson}
            paperSettings={paperSettings}
            allPersonnel={personnelList}
          />
        )}

        {mainTab === 'badges' && (
          <BadgePrintSection
            person={selectedPerson}
            allPersonnel={personnelList}
            settings={settings}
            paperSettings={paperSettings}
          />
        )}

        {mainTab === 'barcodes' && (
          <BarcodeQrPrintSection
            person={selectedPerson}
            allPersonnel={personnelList}
            paperSettings={paperSettings}
          />
        )}

        {mainTab === 'certificates' && (
          <CertificatePrintSection
            person={selectedPerson}
            paperSettings={paperSettings}
          />
        )}
      </PrintPreviewModal>
    </div>
  );
}
