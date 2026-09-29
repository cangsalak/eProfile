'use client';

import React, { useState } from 'react';
import { Card, CardHeader, Badge, Button, Input } from '@/components/ui';
import { PageHeaderExtra } from '@/modules/core/components/layout/PageHeaderContext';
import Link from 'next/link';
import { Printer, FileText, Shield, Calendar, Search, ExternalLink, Settings2 } from 'lucide-react';
import PrintPreviewModal from '../components/PrintPreviewModal';
import { PaperSettings } from '../types';

interface PrintableDocTemplate {
  id: string;
  title: string;
  category: 'leave' | 'badge' | 'personnel' | 'calendar';
  categoryLabel: string;
  description: string;
  paperSize: 'A4' | 'CR80';
  orientation: 'portrait' | 'landscape';
  formNumber?: string;
  targetUrl: string;
  actionLabel: string;
  badgeVariant: 'primary' | 'candy' | 'warning' | 'info' | 'success';
}

const DOCUMENT_TEMPLATES: PrintableDocTemplate[] = [
  // หมวดแบบฟอร์มการลา
  {
    id: 'leave-annual',
    title: 'ใบลาพักผ่อน',
    category: 'leave',
    categoryLabel: 'แบบฟอร์มการลา',
    description: 'แบบฟอร์มขออนุมัติลาพักผ่อนประจำปี พร้อมตารางประวัติวันลาและลายมือชื่อผู้บังคับบัญชา',
    paperSize: 'A4',
    orientation: 'portrait',
    formNumber: 'แบบ ๑',
    targetUrl: '/modules/e-form',
    actionLabel: 'เปิดพิมพ์ใบลา',
    badgeVariant: 'primary',
  },
  {
    id: 'leave-sick',
    title: 'ใบลาป่วย / ลาคลอดบุตร',
    category: 'leave',
    categoryLabel: 'แบบฟอร์มการลา',
    description: 'แบบฟอร์มขอลาป่วยหรือลาคลอดบุตร พร้อมช่องแนบใบรับรองแพทย์และความเห็นผู้บังคับบัญชา',
    paperSize: 'A4',
    orientation: 'portrait',
    formNumber: 'แบบ ๒',
    targetUrl: '/modules/e-form',
    actionLabel: 'เปิดพิมพ์ใบลา',
    badgeVariant: 'primary',
  },
  {
    id: 'leave-personal',
    title: 'ใบยากิจส่วนตัว',
    category: 'leave',
    categoryLabel: 'แบบฟอร์มการลา',
    description: 'แบบฟอร์มขออนุมัติลากิจส่วนตัวตามระเบียบข้าราชการและเจ้าหน้าที่',
    paperSize: 'A4',
    orientation: 'portrait',
    formNumber: 'แบบ ๓',
    targetUrl: '/modules/e-form',
    actionLabel: 'เปิดพิมพ์ใบลา',
    badgeVariant: 'primary',
  },
  // หมวดบัตรประจำตัว
  {
    id: 'badge-single',
    title: 'บัตรประจำตัวบุคคล (หน้า-หลัง)',
    category: 'badge',
    categoryLabel: 'บัตรประจำตัว',
    description: 'บัตรประจำตัวข้าราชการ/พนักงานมาตรฐาน ISO CR80 (5.4 × 8.6 ซม.) ด้านหน้าและด้านหลัง พร้อม QR Code',
    paperSize: 'CR80',
    orientation: 'portrait',
    formNumber: 'CR80-ID',
    targetUrl: '/modules/badges',
    actionLabel: 'พิมพ์บัตรประจำตัว',
    badgeVariant: 'candy',
  },
  {
    id: 'badge-bulk',
    title: 'แผ่นพิมพ์บัตรชุดหมู่ (A4 8 ใบ)',
    category: 'badge',
    categoryLabel: 'บัตรประจำตัว',
    description: 'จัดหน้าพิมพ์บัตรประจำตัวหลายนายลงในกระดาษ A4 แผ่นเดียว พร้อมเส้นประสำหรับตัดขอบ',
    paperSize: 'A4',
    orientation: 'portrait',
    formNumber: 'CR80-SHEET',
    targetUrl: '/modules/badges/bulk',
    actionLabel: 'พิมพ์บัตรชุดหมู่',
    badgeVariant: 'candy',
  },
  // หมวดงานกำลังพล & รปภ.๑
  {
    id: 'rpb1-profile',
    title: 'แบบประวัติความปลอดภัย รปภ. ๑',
    category: 'personnel',
    categoryLabel: 'งานกำลังพล',
    description: 'แบบฟอร์มประวัติความปลอดภัย รปภ. ๑ (ทบ. 100-009) ครบ 10 หน้า พร้อมแบบสรุปทางการ',
    paperSize: 'A4',
    orientation: 'portrait',
    formNumber: 'ทบ. 100-009',
    targetUrl: '/modules/users/rpb1',
    actionLabel: 'พิมพ์เอกสาร รปภ.๑',
    badgeVariant: 'warning',
  },
  {
    id: 'personnel-roster',
    title: 'ทำเนียบบัญชีรายชื่อกำลังพล',
    category: 'personnel',
    categoryLabel: 'งานกำลังพล',
    description: 'บัญชีรายชื่อกำลังพลแยกตามสังกัด/กอง/แผนก แสดงยศ ชื่อ ตำแหน่ง และหมายเลขประจำตัว',
    paperSize: 'A4',
    orientation: 'landscape',
    formNumber: 'กพ. ๐๑',
    targetUrl: '/modules/users',
    actionLabel: 'พิมพ์ทำเนียบ',
    badgeVariant: 'warning',
  },
  // หมวดตารางเวร & ปฏิทิน
  {
    id: 'calendar-duty',
    title: 'ตารางเวรยามและปฏิบัติการประจำเดือน',
    category: 'calendar',
    categoryLabel: 'ตารางเวรยาม',
    description: 'ตารางเวรยาม ผลัดปฏิบัติหน้าที่ และสถิติเวรยามประจำเดือนสำหรับปิดประกาศและลงนามคำสั่ง',
    paperSize: 'A4',
    orientation: 'landscape',
    formNumber: 'วร. ๑๐',
    targetUrl: '/modules/calendar',
    actionLabel: 'พิมพ์ตารางเวร',
    badgeVariant: 'info',
  },
];

export default function PrintCenterView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<PrintableDocTemplate | null>(null);

  const defaultPaperSettings: PaperSettings = {
    pageSize: previewDoc?.paperSize || 'A4',
    orientation: previewDoc?.orientation || 'portrait',
    margin: '10mm',
    showGaruda: true,
    watermark: 'none',
    showSignature: true,
    unitName: 'ระบบบริหารงานกำลังพล eProfile',
  };

  const filteredDocs = DOCUMENT_TEMPLATES.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.formNumber && doc.formNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 font-prompt pb-12">
      {/* ── PageHeader Action Button ── */}
      <PageHeaderExtra>
        <div className="flex items-center gap-2">
          <Link href="/modules/print/settings">
            <Button variant="outline" size="sm" icon="fa-solid fa-sliders">
              ตั้งค่ากระดาษราชการ
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            icon="fa-solid fa-print"
            onClick={() => window.print()}
          >
            สั่งพิมพ์หน้าจอปัจจุบัน
          </Button>
        </div>
      </PageHeaderExtra>

      {/* ── Header Banner Card ── */}
      <Card variant="convex" className="p-6 relative overflow-hidden bg-gradient-to-br from-white via-primary-50/20 to-sky-50/30 dark:from-slate-900 dark:via-primary-950/20 dark:to-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="xs">
                <i className="fa-solid fa-stamp mr-1"></i> มาตรฐานงานสารบรรณภาครัฐ
              </Badge>
              <Badge variant="success" size="xs">
                <i className="fa-solid fa-font mr-1"></i> ฟอนต์ TH Sarabun New พร้อมใช้งาน
              </Badge>
            </div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
              <Printer className="w-7 h-7 text-primary-600 dark:text-primary-400" />
              ศูนย์รวมการพิมพ์เอกสารราชการ
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              ศูนย์กลางรวบรวมแบบฟอร์มและสั่งพิมพ์เอกสารทางการ ใบลา บัตรประจำตัวข้าราชการ ประวัติ รปภ. ๑
              และทำเนียบกำลังพล พร้อมตัวจำลองกระดาษ A4 มาตรฐาน ปรับขนาดระยะขอบ ตราครุฑ และลายน้ำอัตโนมัติ
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link href="/modules/e-form">
              <Button variant="secondary" size="sm" icon="fa-solid fa-file-signature">
                พิมพ์ใบลา
              </Button>
            </Link>
            <Link href="/modules/badges">
              <Button variant="secondary" size="sm" icon="fa-solid fa-id-card">
                พิมพ์บัตร
              </Button>
            </Link>
            <Link href="/modules/users">
              <Button variant="secondary" size="sm" icon="fa-solid fa-users">
                พิมพ์ทำเนียบ
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* ── Search and Category Filters ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาแบบฟอร์มเอกสาร, เลขแบบ, คำสำคัญ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          {[
            { id: 'all', label: 'เอกสารทั้งหมด', icon: 'fa-solid fa-boxes-stacked' },
            { id: 'leave', label: 'แบบฟอร์มการลา', icon: 'fa-solid fa-file-signature' },
            { id: 'badge', label: 'บัตรประจำตัว', icon: 'fa-solid fa-id-card' },
            { id: 'personnel', label: 'งานกำลังพล', icon: 'fa-solid fa-user-shield' },
            { id: 'calendar', label: 'ตารางเวรยาม', icon: 'fa-solid fa-calendar-days' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <i className={`${cat.icon} text-[11px]`}></i>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Document Catalog Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <Card
            key={doc.id}
            variant="convex"
            className="flex flex-col justify-between p-5 hover:border-primary-300 dark:hover:border-primary-700 transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={doc.badgeVariant} size="xs">
                  {doc.categoryLabel}
                </Badge>
                {doc.formNumber && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                    {doc.formNumber}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {doc.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1">
                  <i className="fa-regular fa-file"></i>
                  กระดาษ {doc.paperSize}
                </span>
                <span>•</span>
                <span>{doc.orientation === 'portrait' ? 'แนวตั้ง' : 'แนวนอน'}</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="xs"
                icon="fa-regular fa-eye"
                onClick={() => setPreviewDoc(doc)}
              >
                ตัวอย่างก่อนพิมพ์
              </Button>
              <Link href={doc.targetUrl}>
                <Button
                  type="button"
                  variant="primary"
                  size="xs"
                  icon="fa-solid fa-arrow-right"
                >
                  {doc.actionLabel}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">ไม่พบแบบฟอร์มเอกสารที่ค้นหา</h4>
          <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</p>
        </div>
      )}

      {/* ── Interactive Print Preview Modal ── */}
      {previewDoc && (
        <PrintPreviewModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          onConfirmPrint={() => window.print()}
          title={previewDoc.title}
          paperSettings={defaultPaperSettings}
        >
          <div className="p-10 w-[210mm] min-h-[297mm] bg-white text-slate-900 font-['TH_Sarabun_New','THSarabunNew','Sarabun',sans-serif] text-[16pt] leading-normal shadow-sm">
            {/* Garuda & Header Sample */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <i className="fa-solid fa-feather-pointed text-4xl text-amber-600 opacity-80"></i>
              </div>
              <h2 className="text-[20pt] font-bold leading-tight">{previewDoc.title}</h2>
              {previewDoc.formNumber && (
                <p className="text-[14pt] text-slate-600 font-semibold">{previewDoc.formNumber}</p>
              )}
            </div>

            <div className="space-y-4 text-justify mt-8">
              <div className="flex justify-between">
                <span>เขียนที่: {defaultPaperSettings.unitName}</span>
                <span>วันที่: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <p>เรื่อง: ขออนุมัติดำเนินการตามแบบฟอร์ม {previewDoc.title}</p>
              <p>เรียน: ผู้บังคับบัญชาตามลำดับชั้น</p>
              <p className="indent-8">
                ด้วย ข้าพเจ้า มีความประสงค์จะขอดำเนินการสั่งพิมพ์หรือจัดทำเอกสารตามแบบคำขอข้างต้น โดยได้ระบุรายละเอียดและแนบหลักฐานประกอบการพิจารณาตามระเบียบงานสารบรรณภาครัฐเรียบร้อยแล้ว
              </p>
              <p className="indent-8">
                จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ
              </p>
            </div>

            {/* Signature Block */}
            <div className="mt-16 flex justify-end">
              <div className="text-center w-64 space-y-2">
                <div className="h-10"></div>
                <p>(ลงชื่อ)........................................................</p>
                <p>(........................................................)</p>
                <p>ตำแหน่ง......................................................</p>
              </div>
            </div>
          </div>
        </PrintPreviewModal>
      )}
    </div>
  );
}
