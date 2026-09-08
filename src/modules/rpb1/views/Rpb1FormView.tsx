'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Rpb1FormData, INITIAL_RPB1_FORM_DATA } from '../types';
import Page1Personal from '../components/Page1Personal';
import Page2Education from '../components/Page2Education';
import Page3WorkMilitary from '../components/Page3WorkMilitary';
import Page4SocialForeign from '../components/Page4SocialForeign';
import Page5LegalParents from '../components/Page5LegalParents';
import Page6MarriageChildren from '../components/Page6MarriageChildren';
import Page7RelativesOverseas from '../components/Page7RelativesOverseas';
import Page8CohabitantsSignatures from '../components/Page8CohabitantsSignatures';
import Page9SketchMap from '../components/Page9SketchMap';
import Page10AdditionalRecord from '../components/Page10AdditionalRecord';
import Rpb1PrintDocument from '../components/Rpb1PrintDocument';

interface Rpb1FormViewProps {
  personnelId: string;
  currentUser?: any;
  initialPage?: number;
  initialPrintMode?: boolean;
  onBack?: () => void;
}

export default function Rpb1FormView({
  personnelId,
  currentUser: initialUser,
  initialPage = 1,
  initialPrintMode = false,
  onBack,
}: Rpb1FormViewProps) {
  const [currentPage, setCurrentPage] = useState<number>(initialPage || 1);
  const [formData, setFormData] = useState<Rpb1FormData>(INITIAL_RPB1_FORM_DATA);
  const [personnel, setPersonnel] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(initialUser || null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPrintMode, setIsPrintMode] = useState<boolean>(Boolean(initialPrintMode));

  // Fetch Current User if not passed
  useEffect(() => {
    if (!currentUser) {
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.user) setCurrentUser(data.user);
        })
        .catch(() => {});
    }
  }, [currentUser]);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isOwner = Boolean(currentUser && currentUser.id === personnelId);
  const isReadOnly = Boolean(currentUser && !isOwner && !isSuperAdmin);

  // Fetch or Auto-fill RPB1
  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/rpb1/${personnelId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          setFormData(res.data);
          setPersonnel(res.personnel);
        }
      })
      .catch((err) => {
        console.error('Failed to load RPB-1:', err);
        toast.error('ไม่สามารถโหลดข้อมูล รปภ. ๑ ได้');
      })
      .finally(() => setIsLoading(false));
  }, [personnelId]);

  const handleSave = async (status: 'DRAFT' | 'COMPLETED' = 'COMPLETED') => {
    if (isReadOnly) {
      toast.error('ไม่อนุญาตให้แก้ไขข้อมูลแทนผู้อื่น (ผู้ดูแลระบบทั่วไปมีสิทธิ์อ่านและพิมพ์เท่านั้น)');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        status,
      };
      const res = await fetch(`/api/rpb1/${personnelId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFormData((prev) => ({ ...prev, status }));
        toast.success(status === 'DRAFT' ? 'บันทึกฉบับร่างเรียบร้อยแล้ว' : 'บันทึกข้อมูล รปภ. ๑ สำเร็จแล้ว');
      } else {
        toast.error(data.message || data.error || 'บันทึกข้อมูลไม่สำเร็จ');
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsSaving(false);
    }
  };

  const pages = [
    { num: 1, title: 'ข้อมูลส่วนบุคคล (หมวด ๑-๗)', short: 'ข้อมูลทั่วไป' },
    { num: 2, title: 'รูปพรรณ/การศึกษา (หมวด ๘-๑๑)', short: 'การศึกษา/รูปพรรณ' },
    { num: 3, title: 'ทำงาน/รับราชการ (หมวด ๑๒-๑๕)', short: 'การทำงาน/ทหาร' },
    { num: 4, title: 'สื่อสิ่งพิมพ์/ต่างประเทศ (หมวด ๑๖-๑๘)', short: 'ต่างประเทศ/สื่อ' },
    { num: 5, title: 'หนังสือสำคัญ/บิดามารดา (หมวด ๑๙-๒๑)', short: 'คดี/บิดามารดา' },
    { num: 6, title: 'การสมรส/บุตร (หมวด ๒๒-๒๓)', short: 'สมรส/บุตร' },
    { num: 7, title: 'พี่น้อง/ญาติ (หมวด ๒๔-๒๖)', short: 'พี่น้อง/ญาติ' },
    { num: 8, title: 'ผู้ร่วมอาศัย/คำรับรอง (หมวด ๒๗-๓๐)', short: 'ผู้ร่วมอาศัย/ลงนาม' },
    { num: 9, title: 'แผนที่สังเขปที่อยู่ปัจจุบัน', short: 'แผนที่สังเขป' },
    { num: 10, title: 'บันทึกประวัติเพิ่มเติม & รูปถ่าย', short: 'ประวัติเพิ่มเติม' },
  ];

  if (isLoading) {
    return (
      <div className="py-20 text-center font-prompt space-y-3">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary-500"></i>
        <p className="text-sm text-slate-500">กำลังโหลดแบบฟอร์ม รปภ. ๑...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-prompt pb-20 animate-fade-in">
      {/* Top Action Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="ย้อนกลับ"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-500/10 text-primary-600 dark:text-primary-400">
                แบบฟอร์ม รปภ. ๑
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  formData.status === 'COMPLETED'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                {formData.status === 'COMPLETED' ? 'ฉบับสมบูรณ์' : 'ฉบับร่าง (Draft)'}
              </span>
              {isReadOnly && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                  <i className="fa-solid fa-lock text-[10px]"></i>
                  <span>โหมดอ่านอย่างเดียว (Read-Only)</span>
                </span>
              )}
              {isSuperAdmin && !isOwner && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
                  <i className="fa-solid fa-shield-halved text-[10px]"></i>
                  <span>Super Admin Edit Mode</span>
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {personnel ? `${personnel.prefix} ${personnel.firstName} ${personnel.lastName}` : 'ประวัติบุคคล'}
            </h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsPrintMode(!isPrintMode)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
              isPrintMode
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <i className={`fa-solid ${isPrintMode ? 'fa-pen-to-square' : 'fa-print'}`}></i>
            <span>{isPrintMode ? 'กลับสู่โหมดดู/กรอกข้อมูล' : 'ดูตัวอย่างเอกสาร A4 / สั่งพิมพ์'}</span>
          </button>

          {!isPrintMode && !isReadOnly && (
            <>
              <button
                type="button"
                onClick={() => handleSave('DRAFT')}
                disabled={isSaving}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <i className="fa-regular fa-floppy-disk"></i>
                <span>บันทึกแบบร่าง</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave('COMPLETED')}
                disabled={isSaving}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-check"></i>}
                <span>บันทึกข้อมูลสมบูรณ์</span>
              </button>
            </>
          )}

          {isPrintMode && (
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <i className="fa-solid fa-print"></i>
              <span>พิมพ์เอกสาร ๑๐ หน้า (A4)</span>
            </button>
          )}
        </div>
      </div>

      {/* Super Admin Notice Banner */}
      {isSuperAdmin && !isOwner && !isPrintMode && (
        <div className="bg-primary-500/10 border border-primary-500/30 p-4 rounded-2xl flex items-start gap-3.5 text-primary-900 dark:text-primary-200 no-print">
          <div className="w-9 h-9 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0 mt-0.5">
            <i className="fa-solid fa-shield-halved text-base"></i>
          </div>
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm text-primary-900 dark:text-primary-100">
              สิทธิ์ผู้ดูแลระบบระดับสูงสุด (Super Admin Edit Mode)
            </p>
            <p className="text-primary-800 dark:text-primary-300 leading-relaxed">
              ท่านกำลังเข้าแก้ไขแบบฟอร์ม รปภ. ๑ ของ <strong>{personnel?.prefix} {personnel?.firstName} {personnel?.lastName}</strong> ในฐานะผู้ดูแลระบบระดับสูงสุด (SUPER_ADMIN)
            </p>
          </div>
        </div>
      )}

      {/* Read-Only Notice Banner for Admin/Officers */}
      {isReadOnly && !isPrintMode && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3.5 text-amber-900 dark:text-amber-200 no-print">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
            <i className="fa-solid fa-lock text-base"></i>
          </div>
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm text-amber-900 dark:text-amber-100">
              โหมดตรวจสอบข้อมูล (Read-Only) สำหรับผู้ดูแลระบบ
            </p>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
              ตามระเบียบการรักษาความปลอดภัย แบบฟอร์ม รปภ. ๑ เป็นรายงานประวัติส่วนบุคคลเฉพาะตัวของ <strong>{personnel?.prefix} {personnel?.firstName} {personnel?.lastName}</strong> โดยเจ้าของประวัติต้องเป็นผู้กรอกข้อมูลด้วยตนเองเท่านั้น ผู้ดูแลระบบทั่วไปมีสิทธิ์ตรวจสอบและสั่งพิมพ์เอกสารได้ แต่ไม่สามารถแก้ไขข้อมูลแทนได้
            </p>
          </div>
        </div>
      )}

      {/* Stepper Navigation (1 to 10) */}


      {!isPrintMode && (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto no-print">
          <div className="flex items-center gap-1.5 min-w-max">
            {pages.map((p) => {
              const isActive = currentPage === p.num;
              return (
                <button
                  key={p.num}
                  type="button"
                  onClick={() => setCurrentPage(p.num)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                      isActive ? 'bg-white text-primary-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {p.num}
                  </span>
                  <span className="hidden sm:inline">{p.short}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Form Container */}
      {!isPrintMode ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
          <fieldset disabled={isReadOnly} className="border-0 p-0 m-0 min-w-0">
            {currentPage === 1 && <Page1Personal formData={formData} setFormData={setFormData} />}
            {currentPage === 2 && <Page2Education formData={formData} setFormData={setFormData} />}
            {currentPage === 3 && <Page3WorkMilitary formData={formData} setFormData={setFormData} />}
            {currentPage === 4 && <Page4SocialForeign formData={formData} setFormData={setFormData} />}
            {currentPage === 5 && <Page5LegalParents formData={formData} setFormData={setFormData} />}
            {currentPage === 6 && <Page6MarriageChildren formData={formData} setFormData={setFormData} />}
            {currentPage === 7 && <Page7RelativesOverseas formData={formData} setFormData={setFormData} />}
            {currentPage === 8 && <Page8CohabitantsSignatures formData={formData} setFormData={setFormData} />}
            {currentPage === 9 && <Page9SketchMap formData={formData} setFormData={setFormData} />}
            {currentPage === 10 && <Page10AdditionalRecord formData={formData} setFormData={setFormData} />}
          </fieldset>

          {/* Bottom Pagination Controls */}
          <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
            >
              <i className="fa-solid fa-chevron-left text-[10px]"></i>
              <span>หน้าก่อนหน้า ({currentPage - 1})</span>
            </button>

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              หน้า {currentPage} จาก ๑๐
            </span>

            {currentPage < 10 ? (
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(10, prev + 1))}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-500 text-white shadow-xs flex items-center gap-1.5 transition-all"
              >
                <span>หน้าถัดไป ({currentPage + 1})</span>
                <i className="fa-solid fa-chevron-right text-[10px]"></i>
              </button>
            ) : isReadOnly ? (
              <button
                type="button"
                onClick={() => setIsPrintMode(true)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white shadow-md shadow-primary-500/20 flex items-center gap-1.5 transition-all"
              >
                <i className="fa-solid fa-print"></i>
                <span>ไปที่หน้าพิมพ์เอกสาร A4</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSave('COMPLETED')}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
              >
                <i className="fa-solid fa-check-double"></i>
                <span>บันทึกข้อมูลสมบูรณ์ทั้ง ๑๐ หน้า</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Printable 10-page preview */
        <div className="animate-fade-in">
          <Rpb1PrintDocument data={formData} />
        </div>
      )}

    </div>
  );
}
