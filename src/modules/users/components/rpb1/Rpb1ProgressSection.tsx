'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '@/components/ui';
import { Rpb1FormData } from '../../types';

interface Rpb1ProgressSectionProps {
  personnelId: string;
  isReadOnly?: boolean;
}

export interface SectionProgressInfo {
  page: number;
  title: string;
  subtitle: string;
  icon: string;
  isCompleted: boolean;
  isStarted: boolean;
  missingFields?: string[];
}

export function calculateRpb1Progress(data: Partial<Rpb1FormData> | null | undefined): {
  percentage: number;
  completedCount: number;
  totalSections: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  sections: SectionProgressInfo[];
  firstIncompletePage: number;
} {
  if (!data) {
    const emptySections: SectionProgressInfo[] = [
      { page: 1, title: 'หน้า 1: ประวัติส่วนตัว และที่อยู่', subtitle: 'ชื่อ, เลขบัตร, วันเกิด, ที่อยู่ปัจจุบัน', icon: 'fa-solid fa-user', isCompleted: false, isStarted: false },
      { page: 2, title: 'หน้า 2: ประวัติการศึกษา และความสามารถ', subtitle: 'วุฒิการศึกษา, กิจกรรมพิเศษ, ที่อยู่ 15 ปี', icon: 'fa-solid fa-graduation-cap', isCompleted: false, isStarted: false },
      { page: 3, title: 'หน้า 3: การทำงาน และการรับราชการ', subtitle: 'ประวัติการทำงาน, ทหารกองประจำการ', icon: 'fa-solid fa-briefcase', isCompleted: false, isStarted: false },
      { page: 4, title: 'หน้า 4: สมาชิกองค์การ และต่างประเทศ', subtitle: 'สมาชิกพรรค/สมาคม, การไปต่างประเทศ', icon: 'fa-solid fa-globe', isCompleted: false, isStarted: false },
      { page: 5, title: 'หน้า 5: เอกสารสำคัญ และบิดามารดา', subtitle: 'บัตร/พาสปอร์ต, ประวัติบิดา-มารดา', icon: 'fa-solid fa-people-roof', isCompleted: false, isStarted: false },
      { page: 6, title: 'หน้า 6: ประวัติคู่สมรส และบุตร', subtitle: 'สถานภาพสมรส, คู่สมรส, บุตร', icon: 'fa-solid fa-ring', isCompleted: false, isStarted: false },
      { page: 7, title: 'หน้า 7: ประวัติพี่น้อง และญาติ', subtitle: 'พี่น้องร่วมบิดามารดา, ญาติรับราชการ', icon: 'fa-solid fa-users', isCompleted: false, isStarted: false },
      { page: 8, title: 'หน้า 8: ผู้อยู่อาศัย และบุคคลอ้างอิง', subtitle: 'ผู้ร่วมบ้าน, เพื่อนสนิท 3 นาย', icon: 'fa-solid fa-user-group', isCompleted: false, isStarted: false },
      { page: 9, title: 'หน้า 9: แผนผังที่พักอาศัยสังเขป', subtitle: 'รูปแผนผังบ้านพัก, ติดต่อฉุกเฉิน', icon: 'fa-solid fa-map-location-dot', isCompleted: false, isStarted: false },
      { page: 10, title: 'หน้า 10: บันทึกเพิ่มเติม และคำรับรอง', subtitle: 'รายงานเพิ่มเติม, การลงนามรับรอง', icon: 'fa-solid fa-file-signature', isCompleted: false, isStarted: false },
    ];
    return {
      percentage: 0,
      completedCount: 0,
      totalSections: 10,
      status: 'NOT_STARTED',
      sections: emptySections,
      firstIncompletePage: 1,
    };
  }

  // Check Page 1
  const p1Started = Boolean(data.firstName || data.citizenId || data.currentHouseNo);
  const p1Completed = Boolean(
    data.firstName?.trim() &&
    data.lastName?.trim() &&
    data.citizenId?.trim() &&
    data.dateOfBirth?.trim() &&
    data.currentHouseNo?.trim() &&
    data.currentProvince?.trim()
  );

  // Check Page 2
  const educations = Array.isArray(data.educations) ? data.educations : [];
  const p2Started = educations.length > 0 || Boolean(data.height || data.bloodGroup);
  const p2Completed = educations.length > 0 && Boolean(data.height && data.bloodGroup);

  // Check Page 3
  const workHistory = Array.isArray(data.workHistory) ? data.workHistory : [];
  const p3Started = Boolean(data.militaryStatus || data.militaryRank || workHistory.length > 0);
  const p3Completed = Boolean(data.militaryStatus || data.militaryRank || workHistory.length > 0);

  // Check Page 4
  const memberships = Array.isArray(data.politicalSocialMemberships) ? data.politicalSocialMemberships : [];
  const travels = Array.isArray(data.foreignTravels) ? data.foreignTravels : [];
  const p4Started = memberships.length > 0 || travels.length > 0 || Boolean(data.writerDetails);
  // Page 4 is optional for many people; consider it completed if form is saved or has data
  const p4Completed = p4Started || Boolean(data.id);

  // Check Page 5
  const fatherName = data.fatherDetails?.titleName?.trim() || '';
  const motherName = data.motherDetails?.titleName?.trim() || '';
  const p5Started = Boolean(fatherName || motherName);
  const p5Completed = Boolean(fatherName && motherName);

  // Check Page 6
  const p6Started = Boolean(data.maritalStatus);
  const p6Completed = Boolean(data.maritalStatus);

  // Check Page 7
  const siblings = Array.isArray(data.siblings) ? data.siblings : [];
  const relatives = Array.isArray(data.relativesInGovernment) ? data.relativesInGovernment : [];
  const p7Started = siblings.length > 0 || relatives.length > 0;
  // If user has saved or has sibling info
  const p7Completed = p7Started || Boolean(data.id);

  // Check Page 8
  const friends = Array.isArray(data.closeFriendsRef) ? data.closeFriendsRef : [];
  const cohabitants = Array.isArray(data.cohabitants) ? data.cohabitants : [];
  const p8Started = friends.length > 0 || cohabitants.length > 0;
  const p8Completed = friends.length >= 1 || p8Started;

  // Check Page 9
  const p9Started = Boolean(data.sketchMapImage || data.emergencyContactRankName || data.mapHouseNo);
  const p9Completed = Boolean(data.sketchMapImage || data.emergencyContactRankName);

  // Check Page 10
  const p10Started = Boolean(data.extraTitleName || data.extraOwnerSignatureDate || data.extraOfficerName);
  const p10Completed = Boolean(data.extraOwnerSignatureDate || data.extraTitleName || data.status === 'COMPLETED');

  const sections: SectionProgressInfo[] = [
    {
      page: 1,
      title: 'หน้า 1: ประวัติส่วนตัว และที่อยู่',
      subtitle: 'ชื่อ-สกุล, เลขประจำตัวประชาชน, วันเกิด, ที่อยู่ปัจจุบัน',
      icon: 'fa-solid fa-user',
      isCompleted: p1Completed,
      isStarted: p1Started,
    },
    {
      page: 2,
      title: 'หน้า 2: ประวัติการศึกษา และความสามารถ',
      subtitle: 'วุฒิการศึกษา, ความชำนาญพิเศษ, ที่อยู่ในรอบ 15 ปี',
      icon: 'fa-solid fa-graduation-cap',
      isCompleted: p2Completed,
      isStarted: p2Started,
    },
    {
      page: 3,
      title: 'หน้า 3: การทำงาน และการรับราชการ',
      subtitle: 'ประวัติการทำงาน, ประวัติทหาร/ตำรวจ',
      icon: 'fa-solid fa-briefcase',
      isCompleted: p3Completed,
      isStarted: p3Started,
    },
    {
      page: 4,
      title: 'หน้า 4: สมาชิกองค์การ และต่างประเทศ',
      subtitle: 'พรรคการเมือง/สมาคม, การเดินทางไปต่างประเทศ',
      icon: 'fa-solid fa-globe',
      isCompleted: p4Completed,
      isStarted: p4Started,
    },
    {
      page: 5,
      title: 'หน้า 5: เอกสารสำคัญ และบิดามารดา',
      subtitle: 'บัตร/หนังสือเดินทาง, ประวัติบิดา และมารดา',
      icon: 'fa-solid fa-people-roof',
      isCompleted: p5Completed,
      isStarted: p5Started,
    },
    {
      page: 6,
      title: 'หน้า 6: ประวัติคู่สมรส และบุตร',
      subtitle: 'สถานภาพสมรส, ประวัติคู่สมรสเดิม/ปัจจุบัน, บุตร',
      icon: 'fa-solid fa-ring',
      isCompleted: p6Completed,
      isStarted: p6Started,
    },
    {
      page: 7,
      title: 'หน้า 7: ประวัติพี่น้อง และญาติ',
      subtitle: 'พี่น้องร่วมบิดามารดา, ญาติที่รับราชการ',
      icon: 'fa-solid fa-users',
      isCompleted: p7Completed,
      isStarted: p7Started,
    },
    {
      page: 8,
      title: 'หน้า 8: ผู้อยู่อาศัย และบุคคลอ้างอิง',
      subtitle: 'ผู้ร่วมบ้าน, เพื่อนสนิทอ้างอิง 3 นาย, ผู้อุปการะ',
      icon: 'fa-solid fa-user-group',
      isCompleted: p8Completed,
      isStarted: p8Started,
    },
    {
      page: 9,
      title: 'หน้า 9: แผนผังที่พักอาศัยสังเขป',
      subtitle: 'ภาพแผนผังบ้านพัก, ผู้ติดต่อกรณีฉุกเฉิน',
      icon: 'fa-solid fa-map-location-dot',
      isCompleted: p9Completed,
      isStarted: p9Started,
    },
    {
      page: 10,
      title: 'หน้า 10: บันทึกเพิ่มเติม และคำรับรอง',
      subtitle: 'รายงานประวัติเพิ่มเติม, การลงนามรับรองความถูกต้อง',
      icon: 'fa-solid fa-file-signature',
      isCompleted: p10Completed,
      isStarted: p10Started,
    },
  ];

  const completedCount = sections.filter((s) => s.isCompleted).length;
  const startedCount = sections.filter((s) => s.isStarted).length;
  const percentage = Math.round((completedCount / sections.length) * 100);

  let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' = 'NOT_STARTED';
  if (percentage === 100 || data.status === 'COMPLETED') {
    status = 'COMPLETED';
  } else if (startedCount > 0 || percentage > 0) {
    status = 'IN_PROGRESS';
  }

  const firstIncomplete = sections.find((s) => !s.isCompleted)?.page || 1;

  return {
    percentage,
    completedCount,
    totalSections: sections.length,
    status,
    sections,
    firstIncompletePage: firstIncomplete,
  };
}

export default function Rpb1ProgressSection({
  personnelId,
  isReadOnly = false,
}: Rpb1ProgressSectionProps) {
  const [formData, setFormData] = useState<Rpb1FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (!personnelId) return;
    setIsLoading(true);
    fetch(`/api/rpb1/${personnelId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        if (res?.data) {
          setFormData(res.data);
          if (res.data.updatedAt) {
            setLastUpdated(res.data.updatedAt);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load RPB-1 progress:', err);
      })
      .finally(() => setIsLoading(false));
  }, [personnelId]);

  const progress = calculateRpb1Progress(formData);

  if (isLoading) {
    return (
      <Card variant="convex" className="p-8 rounded-[24px] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 dark:text-slate-400">กำลังตรวจสอบความคืบหน้าแบบ รปภ. 1...</p>
      </Card>
    );
  }

  const statusVariant =
    progress.status === 'COMPLETED'
      ? 'success'
      : progress.status === 'IN_PROGRESS'
      ? 'primary'
      : 'neutral';

  const statusLabel =
    progress.status === 'COMPLETED'
      ? 'กรอกข้อมูลสมบูรณ์ (100%)'
      : progress.status === 'IN_PROGRESS'
      ? `กำลังดำเนินการ (${progress.completedCount}/10 หมวด)`
      : 'ยังไม่ได้เริ่มกรอกข้อมูล';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header & Overall Progress Summary Card */}
      <Card variant="convex" className="p-6 sm:p-7 rounded-[24px] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white flex items-center justify-center text-2xl shadow-lg shadow-primary-500/25 shrink-0">
              <i className="fa-solid fa-file-shield"></i>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  แบบรายงานประวัติบุคคล (รปภ. 1)
                </h2>
                <Badge variant={statusVariant} size="sm">
                  {statusLabel}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                รายงานประวัติบุคคลเชิงลึก 10 หน้า 30 หมวดหมู่ ตามระเบียบการรักษาความปลอดภัยแห่งชาติ
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-stretch sm:self-auto flex-wrap">
            <Link
              href={`/modules/users/rpb1/form?id=${personnelId}&page=${progress.firstIncompletePage}`}
              className="flex-1 sm:flex-initial"
            >
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={progress.status === 'COMPLETED' ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-arrow-right'}
                className="w-full text-xs font-bold rounded-xl shadow-md shadow-primary-500/20"
              >
                {progress.status === 'NOT_STARTED'
                  ? 'เริ่มกรอกแบบ รปภ. 1'
                  : progress.status === 'COMPLETED'
                  ? 'แก้ไขข้อมูล รปภ. 1'
                  : `กรอกต่อ (หน้า ${progress.firstIncompletePage})`}
              </Button>
            </Link>

            <Link href={`/modules/users/rpb1/form?id=${personnelId}&print=true`}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon="fa-solid fa-print"
                className="text-xs font-semibold rounded-xl"
              >
                พิมพ์เอกสาร
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress Bar & Key Metrics */}
        <div className="pt-6 space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <i className="fa-solid fa-chart-pie text-primary-500"></i>
              ความคืบหน้ารวมการกรอกข้อมูล
            </span>
            <span className="font-extrabold text-primary-600 dark:text-primary-400 text-base">
              {progress.percentage}%
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                progress.percentage === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/30'
                  : progress.percentage > 0
                  ? 'bg-gradient-to-r from-primary-600 to-primary-400 shadow-sm shadow-primary-500/30'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
              style={{ width: `${Math.max(progress.percentage, 3)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span>
              สำเร็จแล้ว <strong>{progress.completedCount}</strong> จากทั้งหมด <strong>10</strong> หมวดหมู่
            </span>
            {lastUpdated && (
              <span>
                บันทึกล่าสุด: {new Date(lastUpdated).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* 2. 10 Sections Grid Overview (Interactive Quick Navigation) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <i className="fa-solid fa-list-check text-primary-500"></i>
            <span>สถานะและสารบัญแบบรายงาน (คลิกเพื่อเข้าสู่แต่ละหน้าโดยตรง)</span>
          </h3>
          <span className="text-[11px] text-slate-400">10 หน้า 30 หมวดหมู่</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {progress.sections.map((sec) => {
            const cardBg = sec.isCompleted
              ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 hover:border-emerald-400'
              : sec.isStarted
              ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10 hover:border-amber-400'
              : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-primary-300 dark:hover:border-primary-700';

            return (
              <Link
                key={sec.page}
                href={`/modules/users/rpb1/form?id=${personnelId}&page=${sec.page}`}
                className={`group p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between hover:shadow-md ${cardBg}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-primary-50 group-hover:text-primary-600 dark:group-hover:bg-primary-950/50 dark:group-hover:text-primary-400 transition-colors">
                      หน้า {sec.page}
                    </span>

                    {sec.isCompleted ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        <i className="fa-solid fa-circle-check text-[10px]"></i> ครบถ้วน
                      </span>
                    ) : sec.isStarted ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                        <i className="fa-solid fa-clock text-[10px]"></i> ยังไม่ครบ
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        <i className="fa-regular fa-circle text-[9px]"></i> ว่าง
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-2.5 mt-2">
                    <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-primary-500 group-hover:text-white transition-all flex items-center justify-center text-xs shrink-0">
                      <i className={sec.icon}></i>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {sec.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                        {sec.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-primary-500 font-semibold">
                  <span>เข้าสู่หน้านี้</span>
                  <i className="fa-solid fa-chevron-right text-[8px] transform group-hover:translate-x-0.5 transition-transform"></i>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
