import { LeaveRecord, Personnel } from '@prisma/client';

export interface LeavePrintFormProps {
  leave: LeaveRecord;
  personnel: Personnel;
  startDay: string;
  startMonth: string;
  startYear: number;
  endDay: string;
  endMonth: string;
  endYear: number;
  diffDays: number;
  todayDay: string;
  todayMonth: string;
  todayYear: number;
  pastPersonalLeaveCount: number;
  pastPersonalLeaveDays: number;
  pastSickLeaveCount: number;
  pastSickLeaveDays: number;
}
