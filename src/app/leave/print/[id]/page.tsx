import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import './print.css';
import { PersonalLeavePrintForm } from '@/components/leaves/forms/PersonalLeavePrintForm';
import { SickLeavePrintForm } from '@/components/leaves/forms/SickLeavePrintForm';
import { LeavePrintFormProps } from '@/components/leaves/forms/types';

export default async function PrintLeavePage({ params }: { params: { id: string } }) {
  const { id } = params;

  const leave = await prisma.leaveRecord.findUnique({
    where: { id },
    include: {
      personnel: true,
    },
  });

  if (!leave) {
    return notFound();
  }

  const { personnel } = leave;

  // Format dates to Thai locale
  const startDay = leave.startDate.toLocaleDateString('th-TH', { day: 'numeric' });
  const startMonth = leave.startDate.toLocaleDateString('th-TH', { month: 'long' });
  const startYear = leave.startDate.getFullYear() + 543;

  const endDay = leave.endDate.toLocaleDateString('th-TH', { day: 'numeric' });
  const endMonth = leave.endDate.toLocaleDateString('th-TH', { month: 'long' });
  const endYear = leave.endDate.getFullYear() + 543;

  const diffTime = Math.abs(leave.endDate.getTime() - leave.startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const today = new Date();
  const todayDay = today.toLocaleDateString('th-TH', { day: 'numeric' });
  const todayMonth = today.toLocaleDateString('th-TH', { month: 'long' });
  const todayYear = today.getFullYear() + 543;

  // Calculate fiscal year based on leave start date (Oct 1 - Sep 30)
  const leaveYear = leave.startDate.getFullYear();
  const leaveMonth = leave.startDate.getMonth();
  const fiscalYearStart = leaveMonth >= 9 ? new Date(leaveYear, 9, 1) : new Date(leaveYear - 1, 9, 1);
  
  const pastLeaves = await prisma.leaveRecord.findMany({
    where: {
      personnelId: leave.personnelId,
      status: 'อนุมัติแล้ว',
      startDate: {
        gte: fiscalYearStart,
        lt: leave.startDate
      }
    }
  });

  let pastPersonalLeaveCount = 0;
  let pastPersonalLeaveDays = 0;
  let pastSickLeaveCount = 0;
  let pastSickLeaveDays = 0;

  for (const pLeave of pastLeaves) {
    const days = Math.ceil(Math.abs(pLeave.endDate.getTime() - pLeave.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (pLeave.leaveType === 'ลากิจ') {
      pastPersonalLeaveCount++;
      pastPersonalLeaveDays += days;
    } else if (pLeave.leaveType === 'ลาป่วย') {
      pastSickLeaveCount++;
      pastSickLeaveDays += days;
    }
  }

  const props: LeavePrintFormProps = {
    leave: leave as any,
    personnel: personnel as any,
    startDay,
    startMonth,
    startYear,
    endDay,
    endMonth,
    endYear,
    diffDays,
    todayDay,
    todayMonth,
    todayYear,
    pastPersonalLeaveCount,
    pastPersonalLeaveDays,
    pastSickLeaveCount,
    pastSickLeaveDays,
  };

  if (leave.leaveType === 'ลากิจ') {
    return <PersonalLeavePrintForm {...props} />;
  }

  if (leave.leaveType === 'ลาป่วย') {
    return <SickLeavePrintForm {...props} />;
  }

  // Fallback for other leave types not implemented yet
  return (
    <div className="a4-page flex items-center justify-center h-full bg-slate-200 min-h-screen">
      <div className="text-center text-xl text-slate-500">
        ระบบยังไม่รองรับแบบฟอร์มการพิมพ์สำหรับ: {leave.leaveType}
      </div>
    </div>
  );
}
