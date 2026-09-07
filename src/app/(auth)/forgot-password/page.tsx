'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface AccountInfo {
  maskedName: string;
  department: string;
  subDepartment: string;
  hasPhone: boolean;
  hasEmail: boolean;
  hasCitizenId: boolean;
}

export default function ForgotPasswordPage() {
  // Step 1: Lookup, Step 2: Verify Identity, Step 3: Set New Password, Step 4: Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 State
  const [username, setUsername] = useState('');
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);

  // Step 2 State
  const [verifyCitizenId, setVerifyCitizenId] = useState('');
  const [verifyPhone, setVerifyPhone] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Step 3 State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [adminRequested, setAdminRequested] = useState(false);

  // ── Step 1: Account Lookup ──────────────────────────────────────────────────
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lookup', username: username.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'ไม่พบข้อมูลบัญชีผู้ใช้งาน กรุณาตรวจสอบอีกครั้ง');
        return;
      }

      setAccountInfo(data);
      setStep(2);
    } catch (err) {
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Identity Verification ──────────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCitizenId.trim() && !verifyPhone.trim()) {
      setErrorMessage('กรุณาระบุเลขประจำตัวประชาชน หรือเบอร์โทรศัพท์อย่างน้อยหนึ่งรายการ');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          username: username.trim(),
          citizenId: verifyCitizenId.trim(),
          phone: verifyPhone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'ข้อมูลยืนยันตัวตนไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
        return;
      }

      setResetToken(data.resetToken);
      setStep(3);
    } catch (err) {
      setErrorMessage('เกิดข้อผิดพลาดในการยืนยันตัวตน กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2 Fallback: Request Admin Help ────────────────────────────────────
  const handleRequestAdmin = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request-admin',
          username: username.trim(),
          note: 'ผู้ใช้ขอยื่นคำขอผ่านหน้า Forgot Password',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAdminRequested(true);
      } else {
        setErrorMessage(data.error || 'ไม่สามารถส่งคำขอได้ กรุณาลองใหม่อีกครั้ง');
      }
    } catch {
      setErrorMessage('เกิดข้อผิดพลาดในการส่งคำขอ');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 3: Set New Password ───────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }

    // Client-side Policy Checks
    if (newPassword.length < 8) {
      setErrorMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setErrorMessage('รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setErrorMessage('รหัสผ่านต้องมีตัวอักษรพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setErrorMessage('รหัสผ่านต้องมีตัวเลข (0-9) อย่างน้อย 1 ตัว');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'ไม่สามารถตั้งรหัสผ่านใหม่ได้');
        return;
      }

      setStep(4);
    } catch {
      setErrorMessage('เกิดข้อผิดพลาดในการบันทึกรหัสผ่านใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Password Requirement Validation Helpers ──────────────────────────────
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isMatching = newPassword && confirmPassword && newPassword === confirmPassword;

  return (
    <div className="w-full max-w-lg p-4 font-prompt animate-fade-in">
      {/* Header Logo & Title */}
      <div className="text-center mb-6">
        <Link href="/login" className="inline-flex items-center justify-center w-14 h-14 bg-primary-600/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-2xl border border-primary-500/20 shadow-sm mb-3">
          <i className="fa-solid fa-shield-keyhole text-2xl"></i>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          รีเซ็ตรหัสผ่าน (Self-Service Reset)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          ระบบกู้คืนรหัสผ่านด้วยการยืนยันตัวตนอัตโนมัติ
        </p>
      </div>

      {/* Step Indicator Bar */}
      {step < 4 && (
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 1 ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              1
            </span>
            <span className={`text-xs font-medium hidden sm:inline ${step === 1 ? 'text-primary-600 font-bold' : 'text-slate-500'}`}>
              ค้นหาบัญชี
            </span>
          </div>

          <div className={`flex-1 h-0.5 mx-2 transition-all ${step >= 2 ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-800'}`}></div>

          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 2 ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              2
            </span>
            <span className={`text-xs font-medium hidden sm:inline ${step === 2 ? 'text-primary-600 font-bold' : 'text-slate-500'}`}>
              ยืนยันตัวตน
            </span>
          </div>

          <div className={`flex-1 h-0.5 mx-2 transition-all ${step >= 3 ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-800'}`}></div>

          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 3 ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              3
            </span>
            <span className={`text-xs font-medium hidden sm:inline ${step === 3 ? 'text-primary-600 font-bold' : 'text-slate-500'}`}>
              รหัสผ่านใหม่
            </span>
          </div>
        </div>
      )}

      {/* Main Card Container */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
        
        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 mb-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
            <i className="fa-solid fa-circle-exclamation text-base mt-0.5 shrink-0"></i>
            <div>{errorMessage}</div>
          </div>
        )}

        {/* ─── STEP 1: Search Account ────────────────────────────────────── */}
        {step === 1 && (
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label htmlFor="lookup-username" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ระบุชื่อผู้ใช้ หรือเลขประจำตัว <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <i className="fa-solid fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  id="lookup-username"
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username, เลขประจำตัวประชาชน หรือเลขทหาร"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                สามารถระบุได้ทั้ง Username เข้าสู่ระบบ, เลขประจำตัวประชาชน 13 หลัก หรือเลขประจำตัวทหาร 10 หลัก
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>กำลังค้นหาข้อมูล...</span>
                </>
              ) : (
                <>
                  <span>ตรวจสอบบัญชี</span>
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </>
              )}
            </button>
          </form>
        )}

        {/* ─── STEP 2: Identity Verification ─────────────────────────────── */}
        {step === 2 && accountInfo && (
          <div className="space-y-5">
            {/* Found Account Info Pill */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] font-bold text-slate-500 uppercase">พบบัญชีในระบบ</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {accountInfo.maskedName}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                สังกัด: <span className="font-semibold text-slate-700 dark:text-slate-300">{accountInfo.department}</span>
                {accountInfo.subDepartment && accountInfo.subDepartment !== '-' && ` (${accountInfo.subDepartment})`}
              </div>
            </div>

            {adminRequested ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs space-y-2 text-center animate-fade-in">
                <i className="fa-solid fa-circle-check text-2xl text-emerald-500"></i>
                <div className="font-bold text-sm">ส่งคำขอไปยังแอดมินเรียบร้อยแล้ว</div>
                <p className="text-[11px] leading-relaxed">
                  ผู้ดูแลระบบได้รับคำขอของท่านแล้ว และจะทำการตรวจสอบพร้อมติดต่อกลับตามช่องทางที่ลงทะเบียนไว้
                </p>
                <Link
                  href="/login"
                  className="inline-block mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </Link>
              </div>
            ) : (
              <form onSubmit={handleVerify} className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  เพื่อความปลอดภัย กรุณาระบุข้อมูลที่ตรงกับที่ลงทะเบียนไว้ในระบบ:
                </p>

                {/* Citizen ID input */}
                <div>
                  <label htmlFor="verify-citizen-id" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    เลขประจำตัวประชาชน 13 หลัก
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-id-card absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    <input
                      id="verify-citizen-id"
                      type="text"
                      maxLength={13}
                      value={verifyCitizenId}
                      onChange={(e) => setVerifyCitizenId(e.target.value.replace(/\D/g, ''))}
                      placeholder="เช่น 1234567890123"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                {/* Phone input */}
                <div>
                  <label htmlFor="verify-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    เบอร์โทรศัพท์มือถือที่ลงทะเบียน
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-phone absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    <input
                      id="verify-phone"
                      type="text"
                      maxLength={10}
                      value={verifyPhone}
                      onChange={(e) => setVerifyPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="เช่น 0812345678"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || (!verifyCitizenId && !verifyPhone)}
                    className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                        <span>กำลังตรวจสอบข้อมูล...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-shield-check text-xs"></i>
                        <span>ยืนยันตัวตนเพื่อตั้งรหัสผ่านใหม่</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setErrorMessage('');
                      }}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      ← เปลี่ยนชื่อผู้ใช้
                    </button>

                    <button
                      type="button"
                      onClick={handleRequestAdmin}
                      disabled={isLoading}
                      className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                    >
                      จำข้อมูลไม่ได้? แจ้งแอดมิน
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ─── STEP 3: Set New Password ──────────────────────────────────── */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-emerald-500 text-base"></i>
              <span>ยืนยันตัวตนสำเร็จ กรุณากำหนดรหัสผ่านใหม่สำหรับเข้าใช้งาน</span>
            </div>

            {/* New Password Input */}
            <div>
              <label htmlFor="new-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                รหัสผ่านใหม่ <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่อย่างน้อย 8 ตัวอักษร"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirm-new-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ยืนยันรหัสผ่านใหม่อีกครั้ง <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <i className="fa-solid fa-lock-keyhole absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  id="confirm-new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้งให้ตรงกัน"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Live Security Policy Checklist */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-1.5 text-[11px]">
              <div className="font-bold text-slate-600 dark:text-slate-400 mb-1">เงื่อนไขความปลอดภัยรหัสผ่าน:</div>
              <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                <i className={`fa-solid ${hasMinLength ? 'fa-check' : 'fa-circle-dot text-[9px]'}`}></i>
                <span>ความยาวอย่างน้อย 8 ตัวอักษร</span>
              </div>
              <div className={`flex items-center gap-2 ${hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                <i className={`fa-solid ${hasUpper ? 'fa-check' : 'fa-circle-dot text-[9px]'}`}></i>
                <span>มีตัวอักษรพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว</span>
              </div>
              <div className={`flex items-center gap-2 ${hasLower ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                <i className={`fa-solid ${hasLower ? 'fa-check' : 'fa-circle-dot text-[9px]'}`}></i>
                <span>มีตัวอักษรพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว</span>
              </div>
              <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                <i className={`fa-solid ${hasNumber ? 'fa-check' : 'fa-circle-dot text-[9px]'}`}></i>
                <span>มีตัวเลข (0-9) อย่างน้อย 1 ตัว</span>
              </div>
              {confirmPassword && (
                <div className={`flex items-center gap-2 ${isMatching ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-500'}`}>
                  <i className={`fa-solid ${isMatching ? 'fa-check' : 'fa-xmark'}`}></i>
                  <span>{isMatching ? 'รหัสผ่านทั้งสองช่องตรงกัน' : 'รหัสผ่านทั้งสองช่องไม่ตรงกัน'}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !hasMinLength || !hasUpper || !hasLower || !hasNumber || !isMatching}
              className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>กำลังบันทึกรหัสผ่านใหม่...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-key text-xs"></i>
                  <span>บันทึกรหัสผ่านใหม่และเข้าสู่ระบบ</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ─── STEP 4: Success ───────────────────────────────────────────── */}
        {step === 4 && (
          <div className="text-center py-6 space-y-4 animate-scale-in">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <i className="fa-solid fa-check text-2xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                ตั้งรหัสผ่านใหม่สำเร็จ!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                รหัสผ่านบัญชีของคุณได้รับการอัปเดตเรียบร้อยแล้ว ท่านสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-primary-500/20 transition-all w-full"
              >
                <span>เข้าสู่ระบบทันที (Go to Login)</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Footer link to login */}
      <div className="mt-6 text-center">
        <Link href="/login" className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-1.5">
          <i className="fa-solid fa-arrow-left text-[10px]"></i>
          <span>จำรหัสผ่านได้แล้ว? กลับสู่หน้าเข้าสู่ระบบ</span>
        </Link>
      </div>
    </div>
  );
}
