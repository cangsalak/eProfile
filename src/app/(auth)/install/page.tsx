'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type DbProvider = 'sqlite' | 'postgresql' | 'mysql';

export default function InstallPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [testingDb, setTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  // Database Form
  const [dbConfig, setDbConfig] = useState({
    provider: 'sqlite' as DbProvider,
    host: 'localhost',
    port: 5432,
    database: 'eprofile',
    user: 'postgres',
    password: '',
  });

  // System & Admin Form
  const [formData, setFormData] = useState({
    systemName: 'ระบบทำเนียบบุคลากรและโปรไฟล์อิเล็กทรอนิกส์ (eProfile)',
    theme: 'dark',
    firstName: '',
    lastName: '',
    citizenId: '',
    badgeNo: '',
    password: '',
    confirmPassword: '',
    setupSecret: '',
  });

  const handleDbProviderChange = (provider: DbProvider) => {
    let port = 5432;
    let user = 'postgres';
    if (provider === 'mysql') {
      port = 3306;
      user = 'root';
    } else if (provider === 'sqlite') {
      port = 0;
      user = '';
    }
    setDbConfig({
      ...dbConfig,
      provider,
      port,
      user,
    });
    setDbTestResult(null);
  };

  const handleTestConnection = async () => {
    setTestingDb(true);
    setDbTestResult(null);
    try {
      const res = await fetch('/api/install/test-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbConfig),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ไม่สามารถทดสอบการเชื่อมต่อได้');
      }
      setDbTestResult(data);
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err: any) {
      const result = { success: false, message: err.message };
      setDbTestResult(result);
      toast.error(err.message);
    } finally {
      setTestingDb(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Enforce numeric only for citizenId (13 digits) and badgeNo (10 digits)
    if (name === 'citizenId') {
      const numericOnly = value.replace(/\D/g, '').slice(0, 13);
      setFormData((prev) => ({ ...prev, [name]: numericOnly }));
      return;
    }
    if (name === 'badgeNo') {
      const numericOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numericOnly }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!formData.systemName.trim()) {
        toast.error('กรุณาระบุชื่อระบบ');
        return;
      }
      setStep(3);
    }
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('กรุณาระบุชื่อและนามสกุล');
      return;
    }

    if (!/^\d{13}$/.test(formData.citizenId)) {
      toast.error('เลขประจำตัวประชาชนต้องเป็นตัวเลข 13 หลัก');
      return;
    }

    if (!/^\d{10}$/.test(formData.badgeNo)) {
      toast.error('หมายเลขประจำตัวทหาร/เจ้าหน้าที่ต้องเป็นตัวเลข 10 หลัก');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        dbProvider: dbConfig.provider,
        dbConnectionString: dbConfig.provider !== 'sqlite' ? `${dbConfig.provider}://${dbConfig.user}:***@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}` : 'file:./dev.db',
      };

      const res = await fetch('/api/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการติดตั้ง');
      }

      toast.success('ติดตั้งระบบสำเร็จและสร้างผู้ดูแลเรียบร้อยแล้ว!');

      if (data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
      }

      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 font-prompt py-12 px-4 sm:px-6">
      <div className="glass-card max-w-2xl w-full p-6 sm:p-10 border border-slate-200 dark:border-slate-700/50 shadow-2xl rounded-2xl bg-white dark:bg-slate-900/90 backdrop-blur-xl transition-all">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-inner">
            <i className="fa-solid fa-server text-2xl text-blue-500"></i>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            ติดตั้งระบบ eProfile (Installation Wizard)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            ตั้งค่าฐานข้อมูล กำหนดค่าระบบ และสร้างบัญชีผู้ดูแลระบบสูงสุด (Super Admin)
          </p>
        </div>

        {/* 3-Step Indicator */}
        <div className="flex justify-between mb-8 relative px-4">
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 -z-10 -translate-y-1/2 rounded-full"></div>
          <div
            className="absolute top-1/2 left-8 h-1 bg-blue-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-300"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          ></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-md ${step >= 1 ? 'bg-blue-600 text-white shadow-blue-500/30 ring-4 ring-blue-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
              1
            </div>
            <span className={`text-xs mt-1.5 font-medium ${step === 1 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>ฐานข้อมูล</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-md ${step >= 2 ? 'bg-blue-600 text-white shadow-blue-500/30 ring-4 ring-blue-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
              2
            </div>
            <span className={`text-xs mt-1.5 font-medium ${step === 2 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>ข้อมูลระบบ</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-md ${step >= 3 ? 'bg-blue-600 text-white shadow-blue-500/30 ring-4 ring-blue-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
              3
            </div>
            <span className={`text-xs mt-1.5 font-medium ${step === 3 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>ผู้ดูแลระบบ</span>
          </div>
        </div>

        {/* Step Forms */}
        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="space-y-6">

          {/* ================= STEP 1: DATABASE ================= */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                <h2 className="font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-database text-blue-500 text-base"></i>
                  เลือกประเภทฐานข้อมูล (Database Provider)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  เลือกระบบฐานข้อมูลที่ต้องการใช้งานสำหรับจัดเก็บข้อมูลทั้งหมด
                </p>
              </div>

              {/* Provider Options Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* SQLite */}
                <div
                  onClick={() => handleDbProviderChange('sqlite')}
                  className={`cursor-pointer p-4 rounded-xl border transition-all text-center flex flex-col items-center justify-between ${
                    dbConfig.provider === 'sqlite'
                      ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/20 ring-2 ring-blue-500/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                    <i className="fa-solid fa-file-shield text-lg"></i>
                  </div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">SQLite</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Embedded File (แนะนำสำหรับ Standalone / ใช้งานทันที)
                  </div>
                  <div className="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium">
                    Zero-Config
                  </div>
                </div>

                {/* PostgreSQL */}
                <div
                  onClick={() => handleDbProviderChange('postgresql')}
                  className={`cursor-pointer p-4 rounded-xl border transition-all text-center flex flex-col items-center justify-between ${
                    dbConfig.provider === 'postgresql'
                      ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/20 ring-2 ring-blue-500/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
                    <i className="fa-solid fa-elephant text-lg"></i>
                  </div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">PostgreSQL</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Enterprise / Cloud SQL / Supabase / Neon
                  </div>
                  <div className="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium">
                    High-Scale
                  </div>
                </div>

                {/* MySQL */}
                <div
                  onClick={() => handleDbProviderChange('mysql')}
                  className={`cursor-pointer p-4 rounded-xl border transition-all text-center flex flex-col items-center justify-between ${
                    dbConfig.provider === 'mysql'
                      ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/20 ring-2 ring-blue-500/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                    <i className="fa-solid fa-server text-lg"></i>
                  </div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">MySQL / MariaDB</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Standard Web Hosting / On-Premise
                  </div>
                  <div className="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">
                    Standard
                  </div>
                </div>
              </div>

              {/* Database Parameter Inputs for PostgreSQL / MySQL */}
              {dbConfig.provider !== 'sqlite' && (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Host / Server IP</label>
                      <input
                        type="text"
                        value={dbConfig.host}
                        onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
                        placeholder="localhost หรือ 192.168.1.100"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Port</label>
                      <input
                        type="number"
                        value={dbConfig.port}
                        onChange={(e) => setDbConfig({ ...dbConfig, port: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Database Name</label>
                      <input
                        type="text"
                        value={dbConfig.database}
                        onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Username</label>
                      <input
                        type="text"
                        value={dbConfig.user}
                        onChange={(e) => setDbConfig({ ...dbConfig, user: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Password</label>
                      <input
                        type="password"
                        value={dbConfig.password}
                        onChange={(e) => setDbConfig({ ...dbConfig, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Test Connection Button & Result */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingDb}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium transition flex items-center gap-2"
                >
                  {testingDb ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin text-blue-500"></i>
                      กำลังทดสอบการเชื่อมต่อ...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-plug text-blue-500"></i>
                      ทดสอบการเชื่อมต่อ (Test Connection)
                    </>
                  )}
                </button>

                {dbTestResult && (
                  <div className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium ${
                    dbTestResult.success
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}>
                    <i className={`fa-solid ${dbTestResult.success ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
                    <span>{dbTestResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 2: SYSTEM INFORMATION ================= */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                <h2 className="font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-sliders text-blue-500 text-base"></i>
                  กำหนดข้อมูลและชื่อระบบ
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ระบุชื่อระบบและธีมการแสดงผลเริ่มต้น
                </p>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">
                  ชื่อระบบ (System Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="systemName"
                  value={formData.systemName}
                  onChange={handleChange}
                  required
                  placeholder="เช่น ระบบทำเนียบบุคลากรและโปรไฟล์อิเล็กทรอนิกส์"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">
                  ธีมเริ่มต้น (Default Theme)
                </label>
                <select
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                >
                  <option value="dark">Dark Theme (โหมดมืด - แนะนำ)</option>
                  <option value="light">Light Theme (โหมดสว่าง)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 flex items-start gap-2.5">
                <i className="fa-solid fa-circle-info mt-0.5 text-sm"></i>
                <div>
                  ระบบจะสร้างการตั้งค่าเริ่มต้น เช่น รายการสังกัด, ประเภทกำลังพล, หมวดหมู่การลา และสิทธิ์เริ่มต้น (SUPER_ADMIN, ADMIN, EDITOR, OFFICER, USER) ให้อัตโนมัติ
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: SUPER ADMIN ================= */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                <h2 className="font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-user-shield text-blue-500 text-base"></i>
                  สร้างบัญชีผู้ดูแลระบบสูงสุด (Super Admin)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ผู้ใช้แรกนี้จะได้รับสิทธิ์สูงสุดในการควบคุมและบริหารจัดการทุกส่วนในระบบ
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">
                    ชื่อ (First Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="เช่น แอดมิน"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">
                    นามสกุล (Last Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="เช่น ประจำระบบ"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Strict Digits-Only Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium">
                      เลขประจำตัวประชาชน (13 หลัก) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">{formData.citizenId.length}/13</span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={13}
                    name="citizenId"
                    value={formData.citizenId}
                    onChange={handleChange}
                    required
                    placeholder="ตัวเลข 13 หลักเท่านั้น"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium">
                      หมายเลขประจำตัวทหาร (10 หลัก) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">{formData.badgeNo.length}/10</span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    name="badgeNo"
                    value={formData.badgeNo}
                    onChange={handleChange}
                    required
                    placeholder="ตัวเลข 10 หลักเท่านั้น"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">
                    รหัสผ่าน (Password) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">
                    ยืนยันรหัสผ่าน (Confirm Password) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="กรอกรหัสผ่านซ้ำอีกครั้ง"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">
                  รหัสลับการติดตั้ง (Setup Secret - ถ้ามีกำหนดใน .env)
                </label>
                <input
                  type="password"
                  name="setupSecret"
                  value={formData.setupSecret}
                  onChange={handleChange}
                  placeholder="เว้นว่างได้หากไม่ได้ตั้งค่าใน .env"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={loading}
                className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition"
              >
                <i className="fa-solid fa-arrow-left mr-2"></i>
                ย้อนกลับ
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition"
              >
                ถัดไป
                <i className="fa-solid fa-arrow-right ml-2"></i>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 transition flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    กำลังบันทึกและติดตั้งระบบ...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    ยืนยันและเริ่มติดตั้งระบบ
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
