'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Rpb1FormView from './Rpb1FormView';
import { Rpb1FormData } from '../types';

interface PersonnelRpb1Item {
  id: string;
  badgeNo: string;
  fullName: string;
  position: string;
  department: string;
  subDepartment: string;
  citizenId: string;
  phone: string;
  hasRpb1: boolean;
  rpb1Status: string;
  rpb1Id: string | null;
  rpb1UpdatedAt: string | null;
}

const PAGE_DEFINITIONS = [
  { num: 1, title: '๑. ข้อมูลส่วนบุคคล', short: 'ส่วนบุคคล/ที่อยู่', icon: 'fa-solid fa-user' },
  { num: 2, title: '๒. รูปพรรณ & การศึกษา', short: 'รูปพรรณ/ศึกษา', icon: 'fa-solid fa-graduation-cap' },
  { num: 3, title: '๓. การทำงาน & ทหาร', short: 'การทำงาน/ทหาร', icon: 'fa-solid fa-briefcase' },
  { num: 4, title: '๔. ต่างประเทศ & สื่อ', short: 'ต่างประเทศ/สื่อ', icon: 'fa-solid fa-globe' },
  { num: 5, title: '๕. คดีความ & บิดามารดา', short: 'คดี/บิดามารดา', icon: 'fa-solid fa-users' },
  { num: 6, title: '๖. การสมรส & บุตร', short: 'สมรส/บุตร', icon: 'fa-solid fa-heart' },
  { num: 7, title: '๗. พี่น้อง & ญาติ', short: 'พี่น้อง/ญาติ', icon: 'fa-solid fa-people-roof' },
  { num: 8, title: '๘. ผู้ร่วมอาศัย & ลงนาม', short: 'ผู้ร่วมอาศัย/ลงนาม', icon: 'fa-solid fa-signature' },
  { num: 9, title: '๙. แผนที่ & ผู้ติดต่อฉุกเฉิน', short: 'แผนที่สังเขป', icon: 'fa-solid fa-map-location-dot' },
  { num: 10, title: '๑๐. บันทึกประวัติเพิ่มเติม', short: 'ประวัติเพิ่มเติม', icon: 'fa-solid fa-id-badge' },
];

function evaluatePageCompletion(data: Rpb1FormData | null): boolean[] {
  if (!data) return Array(10).fill(false);
  const p1 = Boolean(data.firstName && data.lastName && (data.citizenId || data.currentHouseNo));
  const p2 = Boolean(data.height || data.weight || (Array.isArray(data.educations) && data.educations.length > 0));
  const p3 = Boolean(data.militaryStatus || (Array.isArray(data.workHistory) && data.workHistory.length > 0) || (Array.isArray(data.languages) && data.languages.length > 0));
  const p4 = Boolean((Array.isArray(data.politicalSocialMemberships) && data.politicalSocialMemberships.length > 0) || (Array.isArray(data.foreignTravels) && data.foreignTravels.length > 0) || data.writerDetails);
  const p5 = Boolean(data.fatherDetails?.titleName || data.motherDetails?.titleName || (Array.isArray(data.identificationDocuments) && data.identificationDocuments.length > 0));
  const p6 = Boolean(data.maritalStatus || (Array.isArray(data.children) && data.children.length > 0));
  const p7 = Boolean((Array.isArray(data.siblings) && data.siblings.length > 0) || (Array.isArray(data.relativesInGovernment) && data.relativesInGovernment.length > 0) || (Array.isArray(data.overseasContacts) && data.overseasContacts.length > 0));
  const p8 = Boolean((Array.isArray(data.cohabitants) && data.cohabitants.length > 0) || (Array.isArray(data.closeFriendsRef) && data.closeFriendsRef.length > 0) || data.ownerSignatureDate);
  const p9 = Boolean(data.mapHouseNo || data.sketchMapImage || data.emergencyContactRankName);
  const p10 = Boolean(data.extraTitleName || data.status === 'COMPLETED');
  return [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10];
}

export default function Rpb1ListView() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [personnelList, setPersonnelList] = useState<PersonnelRpb1Item[]>([]);
  const [myRpb1, setMyRpb1] = useState<Rpb1FormData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [formTarget, setFormTarget] = useState<{ personnelId: string; page?: number; printMode?: boolean } | null>(null);

  // 1. Fetch Current Logged-in User
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch((err) => console.error('Failed to load user:', err))
      .finally(() => setIsAuthLoading(false));
  }, []);

  // 2. Fetch Current User's Own RPB-1 Record
  useEffect(() => {
    if (currentUser?.id) {
      fetch(`/api/rpb1/${currentUser.id}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.data) {
            setMyRpb1(res.data);
          }
        })
        .catch((err) => console.error('Failed to load my RPB-1:', err));
    }
  }, [currentUser?.id]);

  // 3. Fetch Directory List (for Super Admin and Admin)
  const fetchList = useCallback(() => {
    setIsLoading(true);
    fetch(`/api/rpb1?search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPersonnelList(data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch RPB1 list:', err);
        toast.error('ไม่สามารถโหลดรายชื่อกำลังพลได้');
      })
      .finally(() => setIsLoading(false));
  }, [search]);

  useEffect(() => {
    if (currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN')) {
      fetchList();
    }
  }, [fetchList, currentUser]);

  if (isAuthLoading) {
    return (
      <div className="py-20 text-center font-prompt space-y-3">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary-500"></i>
        <p className="text-sm text-slate-500">กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</p>
      </div>
    );
  }

  // Open Selected Form (for self or another personnel)
  if (formTarget) {
    return (
      <Rpb1FormView
        personnelId={formTarget.personnelId}
        currentUser={currentUser}
        initialPage={formTarget.page || 1}
        initialPrintMode={formTarget.printMode || false}
        onBack={() => {
          setFormTarget(null);
          if (currentUser?.id) {
            fetch(`/api/rpb1/${currentUser.id}`)
              .then((res) => res.json())
              .then((res) => {
                if (res.data) setMyRpb1(res.data);
              })
              .catch(() => {});
          }
          if (currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN')) {
            fetchList();
          }
        }}
      />
    );
  }

  const isAdminOrSuper = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';
  const completedCount = personnelList.filter((p) => p.rpb1Status === 'COMPLETED').length;
  const draftCount = personnelList.filter((p) => p.rpb1Status === 'DRAFT').length;
  const pendingCount = personnelList.filter((p) => p.rpb1Status === 'NOT_STARTED').length;

  // Personal Completion Calculation
  const pageCompletions = evaluatePageCompletion(myRpb1);
  const completedPagesCount = pageCompletions.filter(Boolean).length;
  const completionPercent = Math.round((completedPagesCount / 10) * 100);
  const isMyFormCompleted = myRpb1?.status === 'COMPLETED' || completionPercent === 100;

  return (
    <div className="space-y-8 font-prompt animate-fade-in pb-20">
      {/* ─── ๑. HERO SECTION: My Personal RPB-1 Progress Card ─────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-primary-50/20 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-primary-950/30 rounded-3xl border border-primary-500/20 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        {/* Background Ambient Glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          {/* Top Profile Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-primary-500/20 shrink-0">
                  {currentUser?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.firstName}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <i className="fa-solid fa-file-shield text-2xl"></i>
                  )}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] text-white ${
                    isMyFormCompleted ? 'bg-emerald-500' : completionPercent > 0 ? 'bg-amber-500' : 'bg-slate-400'
                  }`}
                >
                  <i className={`fa-solid ${isMyFormCompleted ? 'fa-check' : 'fa-pen'}`}></i>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
                    แบบรายงานประวัติบุคคล (รปภ. ๑)
                  </span>
                  {isMyFormCompleted ? (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <i className="fa-solid fa-circle-check text-[10px]"></i>
                      <span>บันทึกสมบูรณ์ ๑๐๐%</span>
                    </span>
                  ) : completionPercent > 0 ? (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                      <i className="fa-solid fa-clock text-[10px]"></i>
                      <span>อยู่ระหว่างกรอก ({completionPercent}%)</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                      ยังไม่ได้เริ่มกรอก
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {currentUser ? `${currentUser.prefix} ${currentUser.firstName} ${currentUser.lastName}` : 'ประวัติส่วนบุคคล'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {currentUser?.position || 'กำลังพล'} • {currentUser?.department} {currentUser?.subDepartment ? `(${currentUser?.subDepartment})` : ''} • รหัส: <span className="font-mono">{currentUser?.badgeNo}</span>
                </p>
              </div>
            </div>

            {/* Quick Action Buttons for Own Form */}
            <div className="flex items-center gap-3 flex-wrap self-start md:self-center">
              <button
                type="button"
                onClick={() => setFormTarget({ personnelId: currentUser.id, page: 1, printMode: false })}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white !text-white text-xs font-bold rounded-xl shadow-md shadow-primary-500/25 transition-all flex items-center gap-2 transform active:scale-95 cursor-pointer"
              >
                <i className="fa-solid fa-pen-to-square text-white"></i>
                <span className="text-white font-bold">{myRpb1 ? 'กรอก / แก้ไขแบบ รปภ. ๑ ของตนเอง' : 'เริ่มกรอกแบบ รปภ. ๑ ของตนเอง'}</span>
              </button>

              <button
                type="button"
                onClick={() => setFormTarget({ personnelId: currentUser.id, page: 1, printMode: true })}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-print text-primary-500"></i>
                <span>ดูตัวอย่าง / พิมพ์ (A4)</span>
              </button>
            </div>
          </div>

          {/* Progress Bar & Metric */}
          <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <i className="fa-solid fa-chart-pie text-primary-500"></i>
                <span>ความคืบหน้าการกรอกข้อมูล ๑๐ หน้า ๓๐ หมวดหมู่</span>
              </div>
              <div className="font-bold text-primary-600 dark:text-primary-400">
                กรอกแล้ว {completedPagesCount} จาก ๑๐ หน้า ({completionPercent}%)
              </div>
            </div>

            {/* Progress Track */}
            <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${
                  completionPercent === 100
                    ? 'from-emerald-500 to-teal-400'
                    : 'from-primary-600 to-primary-400'
                }`}
                style={{ width: `${Math.max(5, completionPercent)}%` }}
              ></div>
            </div>

            {/* 10-Step Interactive Page Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 pt-2">
              {PAGE_DEFINITIONS.map((p, idx) => {
                const isCompleted = pageCompletions[idx];
                return (
                  <button
                    key={p.num}
                    type="button"
                    onClick={() => setFormTarget({ personnelId: currentUser.id, page: p.num, printMode: false })}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {isCompleted ? <i className="fa-solid fa-check text-[10px]"></i> : p.num}
                    </div>
                    <span className="text-[10px] font-semibold leading-tight line-clamp-1">{p.short}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── ๒. ADMIN & SUPER ADMIN SECTION: Directory Table (แสดงเฉพาะ Admin/Super Admin) ─ */}
      {isAdminOrSuper && (
        <div className="space-y-6 animate-fade-in pt-2">
          {/* Section Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-500"></span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  ทะเบียนแบบฟอร์ม รปภ. ๑ กำลังพลในหน่วย (สำหรับผู้ดูแลระบบ)
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentUser?.role === 'SUPER_ADMIN'
                  ? '⚡ ท่านมีสิทธิ์ SUPER_ADMIN: สามารถตรวจสอบ สั่งพิมพ์ และแก้ไขข้อมูล รปภ. ๑ ของกำลังพลทุกนายได้'
                  : '👁️ ท่านมีสิทธิ์ ADMIN: สามารถตรวจสอบและสั่งพิมพ์เอกสาร รปภ. ๑ ได้ (โหมดอ่านอย่างเดียว)'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                กำลังพลทั้งหมด {personnelList.length} นาย
              </span>
            </div>
          </div>

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg shrink-0">
                <i className="fa-solid fa-file-circle-check"></i>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">บันทึกสมบูรณ์แล้ว</span>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{completedCount} นาย</h4>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg shrink-0">
                <i className="fa-solid fa-file-pen"></i>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">ฉบับร่าง (อยู่ระหว่างกรอก)</span>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{draftCount} นาย</h4>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-lg shrink-0">
                <i className="fa-solid fa-file-circle-xmark"></i>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">ยังไม่ได้เริ่มกรอก</span>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{pendingCount} นาย</h4>
              </div>
            </div>
          </div>

          {/* Directory Table Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาชื่อ-สกุล, เลขประจำตัว, หรือเลข ปชช...."
                  className="form-control pl-9 text-xs"
                />
              </div>

              <span className="text-xs text-slate-500 dark:text-slate-400 self-center">
                ผลการค้นหา {personnelList.length} นาย
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3">ชื่อ - นามสกุล</th>
                    <th className="p-3">ตำแหน่ง / สังกัด</th>
                    <th className="p-3">เลขประจำตัวประชาชน</th>
                    <th className="p-3 text-center">สถานะ รปภ. ๑</th>
                    <th className="p-3 text-right">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        <i className="fa-solid fa-circle-notch fa-spin text-lg mr-2"></i>
                        กำลังโหลดข้อมูล...
                      </td>
                    </tr>
                  ) : personnelList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        ไม่พบข้อมูลกำลังพล
                      </td>
                    </tr>
                  ) : (
                    personnelList.map((p, idx) => (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                          p.id === currentUser?.id ? 'bg-primary-50/40 dark:bg-primary-950/20' : ''
                        }`}
                      >
                        <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{p.fullName}</span>
                            {p.id === currentUser?.id && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary-600 text-white">
                                ตัวคุณ
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">รหัส: {p.badgeNo}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-slate-800 dark:text-slate-200">{p.position || '-'}</div>
                          <div className="text-[11px] text-slate-400">
                            {p.department} {p.subDepartment ? `(${p.subDepartment})` : ''}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                          {p.citizenId || '-'}
                        </td>
                        <td className="p-3 text-center">
                          {p.rpb1Status === 'COMPLETED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <i className="fa-solid fa-circle-check text-[9px]"></i>
                              <span>สมบูรณ์</span>
                            </span>
                          )}
                          {p.rpb1Status === 'DRAFT' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              <i className="fa-solid fa-pen text-[9px]"></i>
                              <span>ฉบับร่าง</span>
                            </span>
                          )}
                          {p.rpb1Status === 'NOT_STARTED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                              <i className="fa-regular fa-circle text-[9px]"></i>
                              <span>ยังไม่กรอก</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {p.id === currentUser?.id ? (
                            <button
                              type="button"
                              onClick={() => setFormTarget({ personnelId: p.id, page: 1, printMode: false })}
                              className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <i className="fa-solid fa-pen-to-square text-xs"></i>
                              <span>{p.hasRpb1 ? 'แก้ไขของตนเอง' : 'กรอกของตนเอง'}</span>
                            </button>
                          ) : currentUser?.role === 'SUPER_ADMIN' ? (
                            <button
                              type="button"
                              onClick={() => setFormTarget({ personnelId: p.id, page: 1, printMode: false })}
                              className="px-3 py-1.5 bg-primary-600/10 hover:bg-primary-600 text-primary-600 hover:text-white dark:text-primary-400 dark:hover:text-white text-xs font-semibold rounded-xl border border-primary-600/30 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <i className="fa-solid fa-pen-to-square text-xs"></i>
                              <span>ตรวจสอบ / แก้ไข (Super Admin)</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setFormTarget({ personnelId: p.id, page: 1, printMode: true })}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <i className="fa-solid fa-eye text-xs text-primary-500"></i>
                              <span>ตรวจสอบ / พิมพ์ (อ่านอย่างเดียว)</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
