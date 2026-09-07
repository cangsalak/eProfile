'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { thaiBahtText } from '../utils/thai-baht';

interface SalarySlipData {
  id: string;
  slipNo: string;
  month: string;
  year: number;
  payDate: string;
  personnelId: string;
  fullName: string;
  rank: string;
  position: string;
  department: string;
  subDepartment?: string;
  citizenId: string;
  bankAccount: string;
  bankName: string;
  // Earnings
  baseSalary: number;
  positionAllowance: number;
  costOfLiving: number;
  specialAllowance: number;
  overtimePay: number;
  otherIncome: number;
  // Deductions
  taxWithholding: number;
  pensionFund: number;
  savingsCoop: number;
  coopLoan: number;
  welfareFund: number;
  otherDeductions: number;
  // Metadata
  remarks?: string;
  financeOfficer: string;
  isPaid: boolean;
}

const MONTH_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export default function PaySlipView() {
  const [currentYear, setCurrentYear] = useState(2569);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(8); // September (0-indexed: 8)
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>('');
  const [personnelList, setPersonnelList] = useState<any[]>([]);
  const [isLoadingPersonnel, setIsLoadingPersonnel] = useState(true);
  const [systemSettings, setSystemSettings] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'slip' | 'history' | 'calc'>('slip');
  const [isPrinting, setIsPrinting] = useState(false);

  // Active slip data
  const [slip, setSlip] = useState<SalarySlipData | null>(null);

  // Load personnel list & system settings on mount
  useEffect(() => {
    async function initData() {
      try {
        const [pRes, sRes] = await Promise.all([
          fetch('/api/personnel?limit=100').then(r => r.json()).catch(() => ({ data: [] })),
          fetch('/api/settings').then(r => r.json()).catch(() => ({})),
        ]);

        if (Array.isArray(pRes.data) && pRes.data.length > 0) {
          setPersonnelList(pRes.data);
          setSelectedPersonnelId(pRes.data[0].id);
          generateSlipForPersonnel(pRes.data[0], currentMonthIndex, currentYear);
        }
        setSystemSettings(sRes || {});
      } catch (err) {
        console.error('Failed to initialize slip data', err);
      } finally {
        setIsLoadingPersonnel(false);
      }
    }
    initData();
  }, []);

  // Generate realistic slip calculation based on personnel profile
  const generateSlipForPersonnel = (p: any, monthIdx: number, yr: number) => {
    if (!p) return;

    const baseSalary = p.salary ? Number(p.salary) : (p.personnelType?.includes('สัญญาบัตร') ? 35400 : 21500);
    const positionAllowance = p.personnelType?.includes('สัญญาบัตร') ? 5600 : 1500;
    const costOfLiving = baseSalary < 20000 ? 2000 : 0;
    const specialAllowance = 3000;
    const overtimePay = 1850;
    const otherIncome = 0;

    // Deductions calculation
    const gross = baseSalary + positionAllowance + costOfLiving + specialAllowance + overtimePay + otherIncome;
    const taxWithholding = Math.round(gross * 0.035);
    const pensionFund = Math.round(baseSalary * 0.03); // กบข. 3%
    const savingsCoop = 2000;
    const coopLoan = 4500;
    const welfareFund = 150;
    const otherDeductions = 0;

    const padMonth = String(monthIdx + 1).padStart(2, '0');
    const slipNumber = `SLIP-${yr}-${padMonth}-${p.id.substring(0, 4).toUpperCase()}`;

    const newSlip: SalarySlipData = {
      id: `slip-${p.id}-${yr}-${monthIdx}`,
      slipNo: slipNumber,
      month: MONTH_NAMES[monthIdx],
      year: yr,
      payDate: `28 ${MONTH_NAMES[monthIdx]} ${yr}`,
      personnelId: p.id,
      fullName: `${p.prefix || ''} ${p.firstName || ''} ${p.lastName || ''}`.trim() || 'ไม่ระบุชื่อ',
      rank: p.rank || p.position || 'เจ้าหน้าที่',
      position: p.position || 'ประจำส่วนราชการ',
      department: p.department?.name || 'กองบัญชาการ',
      subDepartment: p.subDepartment?.name || 'ฝ่ายธุรการและการกำลังพล',
      citizenId: p.citizenId ? `${p.citizenId.slice(0, 1)}-${p.citizenId.slice(1, 5)}-xxxxx-${p.citizenId.slice(-2)}` : '1-1002-xxxxx-12-3',
      bankAccount: 'xxx-x-xx892-1',
      bankName: 'ธนาคารกรุงไทย (KTB)',
      baseSalary,
      positionAllowance,
      costOfLiving,
      specialAllowance,
      overtimePay,
      otherIncome,
      taxWithholding,
      pensionFund,
      savingsCoop,
      coopLoan,
      welfareFund,
      otherDeductions,
      financeOfficer: 'ร.อ. ชาญวิทย์ การเงินมั่นคง (น.การเงิน)',
      isPaid: true,
      remarks: 'โอนเงินเข้าบัญชีเรียบร้อยเมื่อ 28/09/2569 เวลา 06:30 น.',
    };

    setSlip(newSlip);
  };

  const handlePersonnelChange = (id: string) => {
    setSelectedPersonnelId(id);
    const p = personnelList.find(item => item.id === id);
    if (p) {
      generateSlipForPersonnel(p, currentMonthIndex, currentYear);
      toast.success(`โหลดข้อมูลสลิปของ ${p.prefix || ''} ${p.firstName} เรียบร้อย`);
    }
  };

  const handleMonthChange = (monthIdx: number) => {
    setCurrentMonthIndex(monthIdx);
    const p = personnelList.find(item => item.id === selectedPersonnelId) || personnelList[0];
    if (p) {
      generateSlipForPersonnel(p, monthIdx, currentYear);
    }
  };

  // Calculations
  const totalEarnings = useMemo(() => {
    if (!slip) return 0;
    return (
      slip.baseSalary +
      slip.positionAllowance +
      slip.costOfLiving +
      slip.specialAllowance +
      slip.overtimePay +
      slip.otherIncome
    );
  }, [slip]);

  const totalDeductions = useMemo(() => {
    if (!slip) return 0;
    return (
      slip.taxWithholding +
      slip.pensionFund +
      slip.savingsCoop +
      slip.coopLoan +
      slip.welfareFund +
      slip.otherDeductions
    );
  }, [slip]);

  const netPay = useMemo(() => {
    return totalEarnings - totalDeductions;
  }, [totalEarnings, totalDeductions]);

  const netPayText = useMemo(() => {
    return thaiBahtText(netPay);
  }, [netPay]);

  // Actions
  const handlePrint = () => {
    window.print();
  };

  const handleRandomizeDemo = () => {
    if (!slip) return;
    const randomBase = Math.floor(Math.random() * 25000) + 18000;
    const randomPos = Math.floor(Math.random() * 6000) + 1000;
    const randomOT = Math.floor(Math.random() * 3000);
    const randomLoan = Math.floor(Math.random() * 5000);

    setSlip(prev => {
      if (!prev) return null;
      return {
        ...prev,
        baseSalary: randomBase,
        positionAllowance: randomPos,
        overtimePay: randomOT,
        coopLoan: randomLoan,
        taxWithholding: Math.round((randomBase + randomPos + randomOT) * 0.035),
        pensionFund: Math.round(randomBase * 0.03),
      };
    });
    toast.success('สุ่มค่าเงินได้-เงินหักใหม่สำเร็จ');
  };

  const handleCopySummary = () => {
    if (!slip) return;
    const text = `
=== ใบแจ้งยอดเงินเดือน / เงินได้สุทธิ ===
งวดประจำเดือน: ${slip.month} ${slip.year}
เลขที่สลิป: ${slip.slipNo}
กำลังพล: ${slip.fullName}
ตำแหน่ง/สังกัด: ${slip.position} (${slip.department})
----------------------------------------
รวมเงินได้: ฿${totalEarnings.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
รวมเงินหัก: ฿${totalDeductions.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
เงินได้สุทธิ: ฿${netPay.toLocaleString('th-TH', { minimumFractionDigits: 2 })} (${netPayText})
----------------------------------------
สถานะ: โอนเข้าบัญชี ${slip.bankName} ${slip.bankAccount}
`.trim();

    navigator.clipboard.writeText(text);
    toast.success('คัดลอกสรุปสลิปเงินเดือนลงคลิปบอร์ดแล้ว');
  };

  const organizationName = systemSettings.organizationName || 'ระบบบริหารจัดการทรัพยากรบุคคลและกำลังพล (eProfile)';
  const systemLogo = systemSettings.systemLogo || '';

  return (
    <div className="space-y-6 pb-16 font-prompt animate-fade-in">
      {/* Action Header / Top Bar (Hidden during print) */}
      <div className="print:hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center text-2xl shadow-inner shrink-0">
            <i className="fa-solid fa-file-invoice-dollar"></i>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>สลิปเงินได้และเงินเดือน</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
                Official Pay Slip
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              พิมพ์และตรวจสอบรายการเงินเดือน ค่าตอบแทน และการคำนวณภาษีหัก ณ ที่จ่าย
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={handleRandomizeDemo}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center gap-2"
            title="สุ่มค่าตัวเลขเพื่อทดสอบการคำนวณสลิป"
          >
            <i className="fa-solid fa-dice text-primary-500"></i>
            <span>สุ่มข้อมูลทดสอบ</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center gap-2"
            title="คัดลอกข้อความสรุป"
          >
            <i className="fa-solid fa-copy text-slate-500"></i>
            <span>คัดลอกสรุป</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-primary-500/25 flex items-center gap-2"
          >
            <i className="fa-solid fa-print"></i>
            <span>พิมพ์สลิปเงินเดือน</span>
          </button>
        </div>
      </div>

      {/* Filter / Selector Bar (Hidden during print) */}
      <div className="print:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs">
        {/* Personnel Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            <i className="fa-solid fa-user text-primary-500 mr-1.5"></i>เลือกกำลังพล
          </label>
          <select
            value={selectedPersonnelId}
            onChange={(e) => handlePersonnelChange(e.target.value)}
            disabled={isLoadingPersonnel}
            className="form-select w-full text-xs sm:text-sm"
          >
            {personnelList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.prefix || ''} {p.firstName} {p.lastName} — {p.position || 'เจ้าหน้าที่'} ({p.department?.name || 'กองบัญชาการ'})
              </option>
            ))}
          </select>
        </div>

        {/* Month Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            <i className="fa-solid fa-calendar-days text-primary-500 mr-1.5"></i>งวดประจำเดือน
          </label>
          <select
            value={currentMonthIndex}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
            className="form-select w-full text-xs sm:text-sm"
          >
            {MONTH_NAMES.map((m, idx) => (
              <option key={idx} value={idx}>
                {m} {currentYear}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            <i className="fa-solid fa-layer-group text-primary-500 mr-1.5"></i>มุมมอง
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('slip')}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'slip'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-file-invoice mr-1.5"></i>ใบสลิป
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-clock-rotate-left mr-1.5"></i>ประวัติย้อนหลัง
            </button>
          </div>
        </div>
      </div>

      {/* MAIN VIEW: PAY SLIP DOCUMENT */}
      {activeTab === 'slip' && slip && (
        <div className="max-w-4xl mx-auto">
          {/* Slip Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0">
            {/* Header / Seal */}
            <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-5 mb-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                  {systemLogo ? (
                    <img src={systemLogo} alt="Logo" className="w-14 h-14 object-contain shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-2xl font-bold shrink-0">
                      <i className="fa-solid fa-building-columns"></i>
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-wide">
                      {organizationName}
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                      ใบแจ้งยอดเงินได้และเงินหัก (Pay Slip / Salary Certificate)
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      สังกัด: {slip.department} {slip.subDepartment ? `| ${slip.subDepartment}` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1 border border-slate-200 dark:border-slate-700">
                    {slip.slipNo}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ประจำงวด: <strong className="text-slate-800 dark:text-slate-200">{slip.month} {slip.year}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    วันที่จ่ายเงิน: {slip.payDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Personnel Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">ชื่อ - สกุล ผู้รับเงิน:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{slip.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">ตำแหน่ง / ชั้นยศ:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{slip.rank}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">เลขประจำตัวประชาชน:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{slip.citizenId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">การจ่ายเงิน:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <i className="fa-solid fa-circle-check text-[10px]"></i>
                  {slip.bankName}
                </span>
              </div>
            </div>

            {/* Dual Column: Earnings vs Deductions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Column 1: รายการเงินได้ (Earnings) */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                <div className="bg-emerald-50/80 dark:bg-emerald-950/40 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <i className="fa-solid fa-plus-circle text-emerald-600"></i> รายการเงินได้ (Earnings)
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">จำนวนเงิน (บาท)</span>
                </div>
                <div className="p-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300 flex-1">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span>1. เงินเดือนประจำตำแหน่ง (Basic Salary)</span>
                    <span className="font-mono font-semibold">{slip.baseSalary.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span>2. เงินประจำตำแหน่ง (Position Allowance)</span>
                    <span className="font-mono font-semibold">{slip.positionAllowance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {slip.costOfLiving > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                      <span>3. ค่าครองชีพชั่วคราว (Cost of Living)</span>
                      <span className="font-mono font-semibold">{slip.costOfLiving.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span>4. ค่าตอบแทนพิเศษ (Special Allowance)</span>
                    <span className="font-mono font-semibold">{slip.specialAllowance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span>5. ค่าล่วงเวลา / เบี้ยเลี้ยง (Overtime / Duty)</span>
                    <span className="font-mono font-semibold">{slip.overtimePay.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/70 p-3.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-bold text-slate-900 dark:text-white">
                  <span>รวมเงินได้ทั้งสิ้น (A)</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                    ฿{totalEarnings.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Column 2: รายการเงินหัก (Deductions) */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                <div className="bg-rose-50/80 dark:bg-rose-950/40 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <i className="fa-solid fa-minus-circle text-rose-600"></i> รายการเงินหัก (Deductions)
                  </span>
                  <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">จำนวนเงิน (บาท)</span>
                </div>
                <div className="p-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300 flex-1">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span>1. ภาษีเงินได้หัก ณ ที่จ่าย (Withholding Tax)</span>
                    <span className="font-mono font-semibold">{slip.taxWithholding.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span>2. กองทุนบำเหน็จบำนาญ (กบข. / ประกันสังคม)</span>
                    <span className="font-mono font-semibold">{slip.pensionFund.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span>3. ค่าหุ้นสหกรณ์ออมทรัพย์ (Savings Shares)</span>
                    <span className="font-mono font-semibold">{slip.savingsCoop.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span>4. ชำระเงินกู้สหกรณ์ (Cooperative Loan)</span>
                    <span className="font-mono font-semibold">{slip.coopLoan.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span>5. เงินทุนสวัสดิการ / ฌาปนกิจ (Welfare Fund)</span>
                    <span className="font-mono font-semibold">{slip.welfareFund.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/70 p-3.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-bold text-slate-900 dark:text-white">
                  <span>รวมรายการหักทั้งสิ้น (B)</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400 text-sm">
                    ฿{totalDeductions.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* NET PAYABLE BANNER (ยอดเงินได้สุทธิ) */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl p-5 sm:p-6 mb-8 shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-primary-100 uppercase tracking-wider block">
                    ยอดเงินได้สุทธิที่ได้รับ (Net Payable Amount = A - B)
                  </span>
                  <span className="text-xs text-primary-200 mt-1 block">
                    ตัวอักษร: ({netPayText})
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
                    ฿{netPay.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white mt-1">
                    <i className="fa-solid fa-check"></i> รับเงินเรียบร้อยแล้ว
                  </span>
                </div>
              </div>
            </div>

            {/* Signatures & Official Stamp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-dashed border-slate-300 dark:border-slate-700 text-center text-xs">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary-400/60 dark:border-primary-500/40 flex items-center justify-center text-primary-500 text-xl font-bold">
                  <i className="fa-solid fa-stamp"></i>
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  ตรวจสอบและรับรองถูกต้อง
                </p>
                <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  {slip.financeOfficer}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(`EPROFILE-PAYSLIP:${slip.slipNo}:${slip.fullName}:${netPay}`)}`}
                    alt="QR Verification"
                    className="w-14 h-14"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  สแกนเพื่อตรวจสอบความถูกต้องของสลิปเงินเดือน
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANNUAL HISTORY VIEW */}
      {activeTab === 'history' && slip && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-chart-line text-primary-500"></i>
              ประวัติยอดเงินได้และเงินหักย้อนหลัง (ปีงบประมาณ {currentYear})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">งวดเดือน</th>
                    <th className="p-3.5 text-right">เงินได้รวม</th>
                    <th className="p-3.5 text-right">เงินหักรวม</th>
                    <th className="p-3.5 text-right">เงินได้สุทธิ</th>
                    <th className="p-3.5 text-center">สถานะ</th>
                    <th className="p-3.5 text-right rounded-r-xl">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {MONTH_NAMES.slice(0, currentMonthIndex + 1).map((m, idx) => {
                    const grossDemo = totalEarnings + (idx - 4) * 200;
                    const dedDemo = totalDeductions;
                    const netDemo = grossDemo - dedDemo;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white font-prompt">
                          {m} {currentYear}
                        </td>
                        <td className="p-3.5 text-right text-emerald-600 dark:text-emerald-400">
                          ฿{grossDemo.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-right text-rose-600 dark:text-rose-400">
                          ฿{dedDemo.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-right font-black text-slate-900 dark:text-white">
                          ฿{netDemo.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-center font-prompt">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            โอนสำเร็จ
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              handleMonthChange(idx);
                              setActiveTab('slip');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 text-xs font-semibold hover:bg-primary-100 transition-colors font-prompt"
                          >
                            ดูสลิป
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
