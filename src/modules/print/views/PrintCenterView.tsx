'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Button, Badge, Input, Select } from '@/components/ui';

export type DocCategory = 'leave' | 'slip' | 'badge' | 'rpb1' | 'roster' | 'duty';

interface PaperSettings {
  pageSize: 'A4' | 'Letter' | 'CR80';
  orientation: 'portrait' | 'landscape';
  margin: string; // '0mm' | '5mm' | '10mm' | '15mm' | '20mm'
  showGaruda: boolean;
  watermark: 'none' | 'original' | 'copy' | 'confidential';
  showSignature: boolean;
  unitName: string;
}

export default function PrintCenterView() {
  const [selectedDoc, setSelectedDoc] = useState<DocCategory>('leave');
  const [personnelList, setPersonnelList] = useState<any[]>([]);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>('');
  const [paperSettings, setPaperSettings] = useState<PaperSettings>({
    pageSize: 'A4',
    orientation: 'portrait',
    margin: '10mm',
    showGaruda: true,
    watermark: 'none',
    showSignature: true,
    unitName: 'กองบังคับการและหน่วยปฏิบัติการพิเศษ',
  });

  // Load sample personnel list for preview
  useEffect(() => {
    fetch('/api/personnel?limit=10')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
          setPersonnelList(data.data);
          if (data.data.length > 0) {
            setSelectedPersonnelId(String(data.data[0].id));
          }
        }
      })
      .catch(() => {});
  }, []);

  // Keyboard shortcut listener for Ctrl+P / Cmd+P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        // Allow default browser print flow, which triggers @media print
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const selectedPerson = personnelList.find((p) => String(p.id) === selectedPersonnelId) || {
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

  const docCategories: { id: DocCategory; name: string; icon: string; desc: string }[] = [
    { id: 'leave', name: 'ใบลาและแบบฟอร์มการลา', icon: 'fa-solid fa-calendar-xmark', desc: 'แบบฟอร์มการลาพักผ่อน / ลากิจ / ลาป่วย ราชการ' },
    { id: 'slip', name: 'สลิปเงินได้และเงินเดือน', icon: 'fa-solid fa-file-invoice-dollar', desc: 'หนังสือรับรองการจ่ายเงินเดือนและเงินได้รายบุคคล' },
    { id: 'badge', name: 'บัตรประจำตัวบุคลากร', icon: 'fa-solid fa-id-card', desc: 'แบบพิมพ์บัตร CR-80 พร้อม Barcode & QR Code' },
    { id: 'rpb1', name: 'แบบประวัติ รพบ.1 (ทบ.100-009)', icon: 'fa-solid fa-shield-halved', desc: 'เอกสารระเบียนประวัติความมั่นคงมาตรฐานราชการ' },
    { id: 'roster', name: 'บัญชีรายชื่อและทำเนียบกำลังพล', icon: 'fa-solid fa-users-line', desc: 'บัญชีสรุปยอดกำลังพลจำแนกตามหน่วยงาน' },
    { id: 'duty', name: 'ตารางเวรปฏิบัติหน้าที่', icon: 'fa-solid fa-calendar-days', desc: 'ตารางคำสั่งเวรยามและภารกิจประจำเดือน' },
  ];

  return (
    <div className="space-y-6 pb-20 font-prompt animate-fade-in">
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
                <Badge variant="candy" size="xs">Print Ready A4</Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                เลือกเอกสาร ตั้งค่าหน้ากระดาษ และสั่งพิมพ์ผ่านเบราว์เซอร์ได้ทันทีโดยไร้แถบเมนูรบกวน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="primary"
              size="md"
              icon="fa-solid fa-print"
              onClick={handlePrint}
              className="shadow-clay-button px-6"
            >
              สั่งพิมพ์เอกสาร (Ctrl + P)
            </Button>
          </div>
        </div>

        {/* ─── 6 DOCUMENT CATEGORIES SELECTOR ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {docCategories.map((cat) => {
            const isSelected = selectedDoc === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedDoc(cat.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-primary-500/15 to-indigo-500/15 border-primary-500 shadow-clay-card ring-2 ring-primary-500/20'
                    : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                  isSelected
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  <i className={cat.icon}></i>
                </div>
                <div>
                  <h4 className={`text-xs font-black truncate ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-slate-900 dark:text-white'}`}>
                    {cat.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {cat.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ─── PAPER SETTINGS TOOLBAR ─── */}
        <Card variant="convex" padding="md" className="space-y-4">
          <CardHeader
            title="ตั้งค่าหน้ากระดาษและตัวเลือกการพิมพ์ (Print & Paper Settings)"
            subtitle="กำหนดขนาดกระดาษ ระยะขอบ ทิศทาง และองค์ประกอบตราครุฑ"
            icon="fa-solid fa-sliders"
            iconGradient="from-primary-500 to-indigo-600"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Page Size */}
            <Select
              label="ขนาดกระดาษ (Page Size)"
              value={paperSettings.pageSize}
              onChange={(e) => setPaperSettings({ ...paperSettings, pageSize: e.target.value as any })}
              options={[
                { value: 'A4', label: 'A4 (210 x 297 มม.) — มาตรฐานราชการ' },
                { value: 'Letter', label: 'Letter (8.5 x 11 นิ้ว)' },
                { value: 'CR80', label: 'CR-80 (85.6 x 54 มม.) — ขนาดบัตร' },
              ]}
            />

            {/* Orientation */}
            <Select
              label="ทิศทางหน้ากระดาษ (Orientation)"
              value={paperSettings.orientation}
              onChange={(e) => setPaperSettings({ ...paperSettings, orientation: e.target.value as any })}
              options={[
                { value: 'portrait', label: 'แนวตั้ง (Portrait)' },
                { value: 'landscape', label: 'แนวนอน (Landscape)' },
              ]}
            />

            {/* Margin */}
            <Select
              label="ระยะขอบกระดาษ (Margins)"
              value={paperSettings.margin}
              onChange={(e) => setPaperSettings({ ...paperSettings, margin: e.target.value })}
              options={[
                { value: '5mm', label: 'แคบ (5 มม.)' },
                { value: '10mm', label: 'ปกติราชการ (10 มม.)' },
                { value: '15mm', label: 'มาตรฐานสมบูรณ์ (15 มม.)' },
                { value: '20mm', label: 'กว้าง (20 มม.)' },
                { value: '0mm', label: 'ไร้ขอบ (0 มม. - สำหรับพิมพ์บัตร)' },
              ]}
            />

            {/* Watermark */}
            <Select
              label="ลายน้ำเอกสาร (Watermark)"
              value={paperSettings.watermark}
              onChange={(e) => setPaperSettings({ ...paperSettings, watermark: e.target.value as any })}
              options={[
                { value: 'none', label: 'ไม่มีลายน้ำ' },
                { value: 'original', label: 'ต้นฉบับ (ORIGINAL)' },
                { value: 'copy', label: 'สำเนาถูกต้อง (CERTIFIED COPY)' },
                { value: 'confidential', label: 'ลับที่สุด (TOP SECRET)' },
              ]}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={paperSettings.showGaruda}
                  onChange={(e) => setPaperSettings({ ...paperSettings, showGaruda: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span>แสดงตราครุฑราชการ</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={paperSettings.showSignature}
                  onChange={(e) => setPaperSettings({ ...paperSettings, showSignature: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span>แสดงช่องลงนามผู้บังคับบัญชา</span>
              </label>
            </div>

            {personnelList.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-500">เลือกกำลังพลตัวอย่าง:</span>
                <select
                  value={selectedPersonnelId}
                  onChange={(e) => setSelectedPersonnelId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                >
                  {personnelList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.rank || ''} {p.firstName} {p.lastName} ({p.badgeNo || p.id})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ─── LIVE REAL-TIME PAPER SIMULATOR (A4 CONTAINER) ─── */}
      <div className="flex justify-center my-6 overflow-x-auto p-4 sm:p-8 bg-slate-200/60 dark:bg-slate-950/60 rounded-[32px] border border-slate-300/80 dark:border-slate-800 shadow-inner">
        <div
          id="printable-document-sheet"
          className={`bg-white text-black transition-all duration-300 relative shadow-2xl ${
            paperSettings.orientation === 'landscape'
              ? 'w-[297mm] min-h-[210mm]'
              : 'w-[210mm] min-h-[297mm]'
          }`}
          style={{
            padding: paperSettings.margin,
            fontFamily: "'Sarabun', 'Prompt', serif",
            color: '#000000',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Watermark Overlay if active */}
          {paperSettings.watermark !== 'none' && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10 rotate-[-35deg] select-none z-0">
              <span className="text-7xl sm:text-8xl font-black tracking-widest uppercase border-8 border-black px-12 py-4">
                {paperSettings.watermark === 'original' && 'ต้นฉบับ'}
                {paperSettings.watermark === 'copy' && 'สำเนาถูกต้อง'}
                {paperSettings.watermark === 'confidential' && 'ลับที่สุด'}
              </span>
            </div>
          )}

          {/* ── DOCUMENT TEMPLATE RENDERER ── */}
          <div className="relative z-10 space-y-6 text-black text-sm">
            {/* Header: Garuda Emblem */}
            {paperSettings.showGaruda && (
              <div className="flex flex-col items-center justify-center text-center space-y-2 pb-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/8/87/Garuda_Emblem_of_Thailand.svg"
                  alt="Garuda Emblem"
                  className="h-20 w-20 object-contain mx-auto"
                />
                <h1 className="text-xl font-bold tracking-tight">
                  {selectedDoc === 'leave' && 'แบบฟอร์มการขออนุมัติการลา (ทบ. 100-002)'}
                  {selectedDoc === 'slip' && 'หนังสือรับรองการจ่ายเงินเดือนและเงินได้รายบุคคล'}
                  {selectedDoc === 'badge' && 'แบบจัดพิมพ์บัตรประจำตัวข้าราชการ/พนักงาน'}
                  {selectedDoc === 'rpb1' && 'แบบพิมพ์ระเบียนประวัติความมั่นคง รพบ.1 (ทบ.100-009)'}
                  {selectedDoc === 'roster' && 'บัญชีสรุปยอดและทำเนียบกำลังพลประจำปี'}
                  {selectedDoc === 'duty' && 'ตารางคำสั่งเวรยามและภารกิจปฏิบัติการประจำเดือน'}
                </h1>
                <p className="text-xs text-gray-600">
                  {paperSettings.unitName} — ประจำปีงบประมาณ พ.ศ. {new Date().getFullYear() + 543}
                </p>
              </div>
            )}

            {/* Content: Leave Form */}
            {selectedDoc === 'leave' && (
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
                <div className="flex justify-between border-b border-black pb-2 text-xs">
                  <span>เลขที่คำขอ: <strong>LV-2026/089</strong></span>
                  <span>เขียนที่: <strong>{paperSettings.unitName}</strong></span>
                  <span>วันที่: <strong>{new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
                </div>

                <div className="space-y-2 pt-2">
                  <p>
                    เรื่อง: <strong>ขออนุมัติลาพักผ่อนประจำปี</strong>
                  </p>
                  <p>
                    เรียน: <strong>ผู้บังคับการ / ผู้มีอำนาจอนุมัติ</strong>
                  </p>
                  <p className="indent-8 text-justify">
                    ข้าพเจ้า <strong>{selectedPerson.rank || ''} {selectedPerson.firstName} {selectedPerson.lastName}</strong> ตำแหน่ง <strong>{selectedPerson.position || 'เจ้าหน้าที่'}</strong> สังกัด <strong>{selectedPerson.department?.name || 'กองบังคับการ'} {selectedPerson.subDepartment?.name ? `(${selectedPerson.subDepartment.name})` : ''}</strong> รหัสประจำตัว <strong>{selectedPerson.badgeNo || 'EP-90214'}</strong> มีความประสงค์ขออนุมัติลาพักผ่อนประจำปี
                  </p>
                  <p className="indent-8 text-justify">
                    ตั้งแต่วันที่ <strong>{new Date().toLocaleDateString('th-TH')}</strong> ถึงวันที่ <strong>{new Date(Date.now() + 3 * 86400000).toLocaleDateString('th-TH')}</strong> มีกำหนด <strong>3 วันทำการ</strong> ในระหว่างการลาข้าพเจ้าสามารถติดต่อได้ที่เบอร์โทรศัพท์ <strong>089-016-7912</strong>
                  </p>
                </div>

                <table className="w-full border-collapse border border-black text-xs my-4 text-center">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-2">ประเภทการลา</th>
                      <th className="border border-black p-2">สิทธิ์สะสม (วัน)</th>
                      <th className="border border-black p-2">ใช้ไปแล้ว (วัน)</th>
                      <th className="border border-black p-2">ลาครั้งนี้ (วัน)</th>
                      <th className="border border-black p-2">คงเหลือ (วัน)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2">ลาพักผ่อน</td>
                      <td className="border border-black p-2">10</td>
                      <td className="border border-black p-2">2</td>
                      <td className="border border-black p-2">3</td>
                      <td className="border border-black p-2 font-bold">5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Content: Salary Slip */}
            {selectedDoc === 'slip' && (
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-4 border border-black p-3 bg-gray-50 text-xs">
                  <div>
                    <p>ชื่อ-สกุล: <strong>{selectedPerson.rank || ''} {selectedPerson.firstName} {selectedPerson.lastName}</strong></p>
                    <p>ตำแหน่ง: <strong>{selectedPerson.position || 'นายทหารปฏิบัติการ'}</strong></p>
                    <p>สังกัด: <strong>{selectedPerson.department?.name || 'กองบังคับการ'}</strong></p>
                  </div>
                  <div>
                    <p>รหัสกำลังพล: <strong>{selectedPerson.badgeNo || 'EP-90214'}</strong></p>
                    <p>เลขประจำตัวประชาชน: <strong>{selectedPerson.citizenId || '1-1002-00345-67-8'}</strong></p>
                    <p>งวดประจำเดือน: <strong>กันยายน พ.ศ. 2569</strong></p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Income */}
                  <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black p-1.5 text-left">รายการได้ (Income)</th>
                        <th className="border border-black p-1.5 text-right w-24">จำนวนเงิน (บาท)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="border border-black p-1.5">เงินเดือนพื้นฐาน</td><td className="border border-black p-1.5 text-right font-mono">42,500.00</td></tr>
                      <tr><td className="border border-black p-1.5">เงินประจำตำแหน่ง</td><td className="border border-black p-1.5 text-right font-mono">5,600.00</td></tr>
                      <tr><td className="border border-black p-1.5">ค่าครองชีพชั่วคราว</td><td className="border border-black p-1.5 text-right font-mono">2,000.00</td></tr>
                      <tr className="bg-gray-50 font-bold"><td className="border border-black p-1.5">รวมเงินได้</td><td className="border border-black p-1.5 text-right font-mono text-emerald-800">50,100.00</td></tr>
                    </tbody>
                  </table>

                  {/* Deduction */}
                  <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black p-1.5 text-left">รายการหัก (Deduction)</th>
                        <th className="border border-black p-1.5 text-right w-24">จำนวนเงิน (บาท)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="border border-black p-1.5">ภาษีหัก ณ ที่จ่าย</td><td className="border border-black p-1.5 text-right font-mono">1,850.00</td></tr>
                      <tr><td className="border border-black p-1.5">กบข. / สหกรณ์</td><td className="border border-black p-1.5 text-right font-mono">1,500.00</td></tr>
                      <tr><td className="border border-black p-1.5">ฌาปนกิจสงเคราะห์</td><td className="border border-black p-1.5 text-right font-mono">250.00</td></tr>
                      <tr className="bg-gray-50 font-bold"><td className="border border-black p-1.5">รวมเงินหัก</td><td className="border border-black p-1.5 text-right font-mono text-rose-800">3,600.00</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 border-2 border-black bg-gray-100 flex justify-between items-center text-sm font-bold">
                  <span>เงินได้สุทธิ (Net Pay):</span>
                  <span className="text-base font-black font-mono">46,500.00 บาท (สี่หมื่นหกพันห้าร้อยบาทถ้วน)</span>
                </div>
              </div>
            )}

            {/* Content: ID Badges */}
            {selectedDoc === 'badge' && (
              <div className="space-y-6">
                <p className="text-xs text-center text-gray-500 mb-4">
                  * แบบจัดพิมพ์บัตรประจำตัว CR-80 สัดส่วนจริง 85.60 x 53.98 มม. (พิมพ์ 4 บัติต่อแผ่น)
                </p>
                <div className="grid grid-cols-2 gap-6 justify-items-center">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-[85.6mm] h-[54mm] border-2 border-black rounded-xl p-3 bg-white flex flex-col justify-between shadow-sm relative overflow-hidden text-xs"
                    >
                      <div className="flex items-center gap-2 border-b border-black pb-1.5">
                        <div className="w-6 h-6 rounded bg-primary-800 text-white flex items-center justify-center text-[10px] font-bold">
                          eP
                        </div>
                        <div>
                          <p className="font-bold text-[11px] leading-none">บัตรประจำตัวข้าราชการ</p>
                          <p className="text-[9px] text-gray-600">{paperSettings.unitName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 py-1">
                        <div className="w-14 h-16 border border-gray-400 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                          รูปถ่าย
                        </div>
                        <div className="space-y-0.5 text-[10px] min-w-0">
                          <p className="font-bold truncate">{selectedPerson.rank || ''} {selectedPerson.firstName} {selectedPerson.lastName}</p>
                          <p className="text-gray-600 truncate">{selectedPerson.position || 'เจ้าหน้าที่'}</p>
                          <p className="text-gray-600 truncate">สังกัด: {selectedPerson.department?.name || 'กองบังคับการ'}</p>
                          <p className="font-mono text-[9px] font-bold">ID: {selectedPerson.badgeNo || 'EP-90214'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-300 pt-1 text-[8px] text-gray-500">
                        <span>ออกบัตร: 01/01/2569</span>
                        <span>หมดอายุ: 31/12/2573</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content: RPB1 Profile */}
            {selectedDoc === 'rpb1' && (
              <div className="space-y-4 text-xs">
                <div className="border border-black p-3 space-y-2">
                  <h3 className="font-bold text-center border-b border-black pb-1">หมวดที่ 1: ข้อมูลส่วนบุคคลและประวัติราชการ</h3>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <p>ชื่อ-สกุล: <strong>{selectedPerson.rank || ''} {selectedPerson.firstName} {selectedPerson.lastName}</strong></p>
                    <p>เลขประจำตัว: <strong>{selectedPerson.badgeNo || 'EP-90214'}</strong></p>
                    <p>สัญชาติ: <strong>ไทย</strong></p>
                    <p>ตำแหน่ง: <strong>{selectedPerson.position || 'เจ้าหน้าที่'}</strong></p>
                    <p>สังกัด: <strong>{selectedPerson.department?.name || 'กองบังคับการ'}</strong></p>
                    <p>ศาสนา: <strong>พุทธ</strong></p>
                  </div>
                </div>

                <div className="border border-black p-3 space-y-2">
                  <h3 className="font-bold text-center border-b border-black pb-1">หมวดที่ 2: ประวัติการศึกษาและการฝึกอบรมหลักสูตรพิเศษ</h3>
                  <table className="w-full border-collapse border border-black text-center text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black p-1">ปีที่สำเร็จ</th>
                        <th className="border border-black p-1">สถาบันการศึกษา</th>
                        <th className="border border-black p-1">วุฒิการศึกษา / หลักสูตร</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="border border-black p-1">2560</td><td className="border border-black p-1">โรงเรียนนายร้อย</td><td className="border border-black p-1">ปริญญาตรี รปศ.บ.</td></tr>
                      <tr><td className="border border-black p-1">2564</td><td className="border border-black p-1">สถาบันพัฒนาผู้นำ</td><td className="border border-black p-1">หลักสูตรฝ่ายเสนาธิการ</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Content: Roster Summary */}
            {selectedDoc === 'roster' && (
              <div className="space-y-4 text-xs">
                <table className="w-full border-collapse border border-black text-center text-xs">
                  <thead>
                    <tr className="bg-gray-100 font-bold">
                      <th className="border border-black p-2 w-12">ลำดับ</th>
                      <th className="border border-black p-2">ยศ - ชื่อ - สกุล</th>
                      <th className="border border-black p-2">ตำแหน่ง</th>
                      <th className="border border-black p-2">สังกัด / แผนก</th>
                      <th className="border border-black p-2 w-28">รหัสประจำตัว</th>
                      <th className="border border-black p-2 w-24">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(personnelList.length > 0 ? personnelList : [selectedPerson]).map((p, idx) => (
                      <tr key={idx}>
                        <td className="border border-black p-2">{idx + 1}</td>
                        <td className="border border-black p-2 text-left font-bold">{p.rank || ''} {p.firstName} {p.lastName}</td>
                        <td className="border border-black p-2 text-left">{p.position || 'เจ้าหน้าที่'}</td>
                        <td className="border border-black p-2 text-left">{p.department?.name || 'กองบังคับการ'}</td>
                        <td className="border border-black p-2 font-mono">{p.badgeNo || `EP-${90210 + idx}`}</td>
                        <td className="border border-black p-2 font-bold text-emerald-800">พร้อมปฏิบัติหน้าที่</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Content: Duty Schedule */}
            {selectedDoc === 'duty' && (
              <div className="space-y-4 text-xs">
                <table className="w-full border-collapse border border-black text-center text-xs">
                  <thead>
                    <tr className="bg-gray-100 font-bold">
                      <th className="border border-black p-2 w-28">วันที่ / เวร</th>
                      <th className="border border-black p-2">นายทหารเวรผู้ใหญ่</th>
                      <th className="border border-black p-2">นายทหารเวรประจำวัน</th>
                      <th className="border border-black p-2">ผู้ช่วยนายทหารเวร</th>
                      <th className="border border-black p-2 w-32">ผลการปฏิบัติ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((d) => (
                      <tr key={d}>
                        <td className="border border-black p-2 font-bold">{d} ก.ย. 2569</td>
                        <td className="border border-black p-2">พ.อ. เกริกเกียรติ สุวรรณ</td>
                        <td className="border border-black p-2 font-bold">{selectedPerson.rank || ''} {selectedPerson.firstName} {selectedPerson.lastName}</td>
                        <td className="border border-black p-2">ร.ต.อ. นพดล ศรีสุวรรณ</td>
                        <td className="border border-black p-2 text-emerald-800 font-bold">เหตุการณ์ปกติ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer Signature Blocks */}
            {paperSettings.showSignature && (
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                <div className="space-y-8">
                  <p>ลงชื่อ................................................................</p>
                  <div>
                    <p>({selectedPerson.rank || ''} {selectedPerson.firstName} {selectedPerson.lastName})</p>
                    <p className="text-[11px] text-gray-600">ผู้ยื่นคำขอ / ผู้จัดทำ</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <p>ลงชื่อ................................................................</p>
                  <div>
                    <p>(พล.ต. ชูชาติ สุวรรณภักดี)</p>
                    <p className="text-[11px] text-gray-600">ผู้บังคับการ / ผู้อนุมัติ</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
