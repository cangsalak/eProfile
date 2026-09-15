import { NextResponse } from 'next/server';
import { prisma } from '@/modules/core';
import { requirePermission } from '@/modules/core';
import { Prisma } from '@prisma/client';

/** Default fallback policy if database setting is empty */
const FALLBACK_LEAVE_POLICY: Record<string, number> = {
  'ลาพักผ่อน': 10,
  'ลากิจ': 45,
  'ลาป่วย': 60,
  'ลาคลอดบุตร': 90,
  'ลาอุปสมบท': 120,
};

/** Calculate inclusive calendar days between start and end dates */
function calculateCalendarDays(startDate: Date | string, endDate: Date | string): number {
  const s = new Date(startDate);
  const e = new Date(endDate);
  const sUtc = Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate());
  const eUtc = Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate());
  return Math.max(1, Math.round((eUtc - sUtc) / (1000 * 60 * 60 * 24)) + 1);
}

/** Calculate calendar days remaining before return from target date */
function calculateRemainingDays(endDate: Date | string, targetDate: Date | string): number {
  const e = new Date(endDate);
  const t = new Date(targetDate);
  const eUtc = Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate());
  const tUtc = Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
  return Math.max(0, Math.round((eUtc - tUtc) / (1000 * 60 * 60 * 24)));
}

/** Calculate calendar days of a leave falling strictly within a specific calendar year */
function calculateDaysInYear(startDate: Date | string, endDate: Date | string, year: number): number {
  const s = new Date(startDate);
  const e = new Date(endDate);
  const yearStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
  const yearEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

  const effectiveStart = new Date(Math.max(s.getTime(), yearStart.getTime()));
  const effectiveEnd = new Date(Math.min(e.getTime(), yearEnd.getTime()));

  if (effectiveStart.getTime() > effectiveEnd.getTime()) return 0;
  return calculateCalendarDays(effectiveStart, effectiveEnd);
}

/**
 * Handle Command Dashboard Aggregations (Readiness, Active Leaves, Leave Balances, Distributions)
 */
export async function handleGetCommandDashboard(req: Request) {
  try {
    // 1. Permission Check
    const { error: permError, user: authUser } = await requirePermission(req, 'VIEW_COMMAND_DASHBOARD');
    if (permError || !authUser) {
      return permError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Determine User Scope (Global Viewer vs Department Commander vs Sub-Department Commander)
    const isGlobalViewer = ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(authUser.role);
    const isDeptCommander = authUser.role === 'DEPARTMENT_COMMANDER';

    // Fetch full profile of the requesting user to know their assigned department/subDepartment
    const userProfile = await prisma.personnel.findUnique({
      where: { id: authUser.id },
      select: { department: true, subDepartment: true, role: true },
    });

    const userDept = userProfile?.department || '';
    const userSubDept = userProfile?.subDepartment || '';

    // 3. Fetch Leave Policy & Leave Types Allowlist from Database
    let leavePolicy: Record<string, number> = { ...FALLBACK_LEAVE_POLICY };
    const dbLeavePolicySetting = await prisma.systemSetting.findUnique({
      where: { key: 'leavePolicy' },
    });
    if (dbLeavePolicySetting?.value) {
      try {
        const parsed = JSON.parse(dbLeavePolicySetting.value);
        if (parsed && typeof parsed === 'object') {
          leavePolicy = { ...FALLBACK_LEAVE_POLICY, ...parsed };
        }
      } catch (e) {
        console.error('Error parsing leavePolicy from DB:', e);
      }
    }

    // Allowed Leave Types allowlist
    let allowedLeaveTypes: string[] = Object.keys(leavePolicy);
    const dbLeaveTypesSetting = await prisma.systemSetting.findUnique({
      where: { key: 'leaveTypes' },
    });
    if (dbLeaveTypesSetting?.value) {
      try {
        const parsed = JSON.parse(dbLeaveTypesSetting.value);
        if (Array.isArray(parsed)) {
          allowedLeaveTypes = parsed;
        }
      } catch (e) {
        console.error('Error parsing leaveTypes from DB:', e);
      }
    }

    // 4. Parse & Validate Query Parameters
    const { searchParams } = new URL(req.url);
    const queryDept = searchParams.get('department') || '';
    const querySubDept = searchParams.get('subDepartment') || '';
    const dateParam = searchParams.get('date');
    const yearParam = searchParams.get('year');
    const leaveSummaryTypeParam = searchParams.get('leaveSummaryType') || searchParams.get('leaveType');

    if (dateParam !== null && dateParam !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam) || isNaN(Date.parse(dateParam))) {
        return NextResponse.json({ error: 'รูปแบบวันที่ไม่ถูกต้อง (ต้องเป็น YYYY-MM-DD)' }, { status: 400 });
      }
    }

    if (yearParam !== null && yearParam !== undefined) {
      const parsedYear = parseInt(yearParam, 10);
      if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
        return NextResponse.json({ error: 'ปีไม่ถูกต้อง (ต้องอยู่ในช่วง 2000 - 2100)' }, { status: 400 });
      }
    }

    if (leaveSummaryTypeParam) {
      if (!allowedLeaveTypes.includes(leaveSummaryTypeParam)) {
        return NextResponse.json({ error: `ประเภทการลา "${leaveSummaryTypeParam}" ไม่ถูกต้อง` }, { status: 400 });
      }
    }

    const selectedLeaveType = leaveSummaryTypeParam || 'ลาพักผ่อน';

    // Target Date (default: today UTC)
    let targetDate = new Date();
    if (dateParam) {
      targetDate = new Date(dateParam);
    }
    const targetDateStart = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0, 0));
    const targetDateEnd = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 23, 59, 59, 999));

    // Target Year (default: targetDate's year)
    let targetYear = targetDate.getUTCFullYear();
    if (yearParam) {
      targetYear = parseInt(yearParam, 10);
    }

    // Pagination & Search for Active Leaves
    const activeLeavesPage = Math.max(1, parseInt(searchParams.get('activeLeavesPage') || '1', 10));
    const activeLeavesLimit = Math.min(100, Math.max(1, parseInt(searchParams.get('activeLeavesLimit') || '10', 10)));
    const activeLeavesSearch = searchParams.get('activeLeavesSearch')?.trim() || '';

    // Pagination & Search for Leave Balance Summary
    const leaveSummaryPage = Math.max(1, parseInt(searchParams.get('leaveSummaryPage') || '1', 10));
    const leaveSummaryLimit = Math.min(100, Math.max(1, parseInt(searchParams.get('leaveSummaryLimit') || '10', 10)));
    const leaveSummarySearch = searchParams.get('leaveSummarySearch')?.trim() || '';

    // 5. Build Department & Sub-Department Scoping Filter
    let effectiveDept = '';
    let effectiveSubDept = '';

    if (isGlobalViewer) {
      effectiveDept = queryDept;
      effectiveSubDept = querySubDept;
    } else if (isDeptCommander) {
      effectiveDept = userDept;
      effectiveSubDept = querySubDept;
    } else {
      effectiveDept = userDept;
      effectiveSubDept = userSubDept;
    }

    // Construct Prisma WHERE clause for scoped personnel
    const personnelWhere: Prisma.PersonnelWhereInput = {};
    if (effectiveDept) {
      personnelWhere.department = effectiveDept;
    }
    if (effectiveSubDept) {
      personnelWhere.subDepartment = effectiveSubDept;
    }

    // 6. Fetch Total Personnel in Scope
    const totalPersonnelCount = await prisma.personnel.count({
      where: personnelWhere,
    });

    // 7. Fetch Active Leaves on Target Date
    const activeLeavesCondition: Prisma.LeaveRecordWhereInput = {
      status: 'อนุมัติแล้ว',
      startDate: { lte: targetDateEnd },
      endDate: { gte: targetDateStart },
      personnel: personnelWhere,
    };

    const activeLeavesTotal = await prisma.leaveRecord.count({
      where: activeLeavesCondition,
    });

    // Fetch paginated active leaves
    const activeLeavesItems = await prisma.leaveRecord.findMany({
      where: {
        ...activeLeavesCondition,
        ...(activeLeavesSearch
          ? {
              personnel: {
                ...personnelWhere,
                OR: [
                  { firstName: { contains: activeLeavesSearch } },
                  { lastName: { contains: activeLeavesSearch } },
                  { badgeNo: { contains: activeLeavesSearch } },
                  { position: { contains: activeLeavesSearch } },
                ],
              },
            }
          : {}),
      },
      include: {
        personnel: {
          select: {
            id: true,
            prefix: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true,
            subDepartment: true,
            avatarColor: true,
          },
        },
      },
      orderBy: { endDate: 'asc' },
      skip: (activeLeavesPage - 1) * activeLeavesLimit,
      take: activeLeavesLimit,
    });

    // Format active leaves with remaining days
    const formattedActiveLeaves = activeLeavesItems.map((l) => ({
      id: l.id,
      leaveType: l.leaveType,
      startDate: l.startDate,
      endDate: l.endDate,
      totalDays: calculateCalendarDays(l.startDate, l.endDate),
      daysRemaining: calculateRemainingDays(l.endDate, targetDate),
      status: l.status,
      reason: l.reason || '',
      personnel: l.personnel,
    }));

    // 8. Calculate Operational Readiness Metrics
    const activeDutyCount = Math.max(0, totalPersonnelCount - activeLeavesTotal);
    const readinessRate = totalPersonnelCount > 0 ? (activeDutyCount / totalPersonnelCount) * 100 : 100;

    // 9. Fetch Categorical Distributions (Department, Sub-Department, Personnel Type, Status)
    const [byDeptGroup, bySubDeptGroup, byTypeGroup, byStatusGroup] = await Promise.all([
      prisma.personnel.groupBy({
        by: ['department'],
        where: personnelWhere,
        _count: { id: true },
      }),
      prisma.personnel.groupBy({
        by: ['subDepartment'],
        where: personnelWhere,
        _count: { id: true },
      }),
      prisma.personnel.groupBy({
        by: ['personnelType'],
        where: personnelWhere,
        _count: { id: true },
      }),
      prisma.personnel.groupBy({
        by: ['status'],
        where: personnelWhere,
        _count: { id: true },
      }),
    ]);

    // 10. Fetch Leave Quota Summary & Calculate Year Balances
    const policyQuota = leavePolicy[selectedLeaveType] ?? FALLBACK_LEAVE_POLICY[selectedLeaveType] ?? 10;
    const yearStart = new Date(Date.UTC(targetYear, 0, 1, 0, 0, 0, 0));
    const yearEnd = new Date(Date.UTC(targetYear, 11, 31, 23, 59, 59, 999));

    // Get paginated personnel for leave quota calculation
    const summaryPersonnelWhere: Prisma.PersonnelWhereInput = {
      ...personnelWhere,
      ...(leaveSummarySearch
        ? {
            OR: [
              { firstName: { contains: leaveSummarySearch } },
              { lastName: { contains: leaveSummarySearch } },
              { badgeNo: { contains: leaveSummarySearch } },
              { position: { contains: leaveSummarySearch } },
            ],
          }
        : {}),
    };

    const totalSummaryPersonnel = await prisma.personnel.count({
      where: summaryPersonnelWhere,
    });

    const summaryPersonnelList = await prisma.personnel.findMany({
      where: summaryPersonnelWhere,
      select: {
        id: true,
        prefix: true,
        firstName: true,
        lastName: true,
        position: true,
        department: true,
        subDepartment: true,
        avatarColor: true,
      },
      orderBy: [{ department: 'asc' }, { firstName: 'asc' }],
      skip: (leaveSummaryPage - 1) * leaveSummaryLimit,
      take: leaveSummaryLimit,
    });

    const personnelIds = summaryPersonnelList.map((p) => p.id);

    // Fetch leaves for these personnel overlapping the target year
    const leavesInYear = await prisma.leaveRecord.findMany({
      where: {
        personnelId: { in: personnelIds },
        leaveType: selectedLeaveType,
        startDate: { lte: yearEnd },
        endDate: { gte: yearStart },
      },
      select: {
        personnelId: true,
        startDate: true,
        endDate: true,
        status: true,
      },
    });

    // Calculate usage per officer
    const formattedSummaryItems = summaryPersonnelList.map((p) => {
      const officerLeaves = leavesInYear.filter((l) => l.personnelId === p.id);
      let usedApprovedDays = 0;
      let pendingDays = 0;

      officerLeaves.forEach((l) => {
        const days = calculateDaysInYear(l.startDate, l.endDate, targetYear);
        if (l.status === 'อนุมัติแล้ว') {
          usedApprovedDays += days;
        } else if (l.status === 'รออนุมัติ') {
          pendingDays += days;
        }
      });

      const remainingDays = Math.max(0, policyQuota - usedApprovedDays);

      return {
        personnel: p,
        leaveType: selectedLeaveType,
        year: targetYear,
        quota: policyQuota,
        isDefaultPolicy: !dbLeavePolicySetting?.value,
        usedApprovedDays,
        pendingDays,
        remainingDays,
      };
    });

    return NextResponse.json({
      success: true,
      scope: {
        isGlobalViewer,
        userDepartment: userDept,
        userSubDepartment: userSubDept,
        effectiveDepartment: effectiveDept,
        effectiveSubDepartment: effectiveSubDept,
        targetDate: targetDate.toISOString(),
        targetYear,
      },
      readiness: {
        total: totalPersonnelCount,
        activeDuty: activeDutyCount,
        onLeaveToday: activeLeavesTotal,
        onMission: 0,
        unavailable: activeLeavesTotal,
        readinessRate: parseFloat(readinessRate.toFixed(1)),
      },
      distributions: {
        byDepartment: byDeptGroup.map((d) => ({ department: d.department || 'ไม่ระบุ', count: d._count.id })),
        bySubDepartment: bySubDeptGroup.map((d) => ({ subDepartment: d.subDepartment || 'ไม่ระบุ', count: d._count.id })),
        byPersonnelType: byTypeGroup.map((d) => ({ personnelType: d.personnelType || 'ไม่ระบุ', count: d._count.id })),
        byStatus: byStatusGroup.map((d) => ({ status: d.status || 'ไม่ระบุ', count: d._count.id })),
      },
      activeLeaves: {
        items: formattedActiveLeaves,
        pagination: {
          page: activeLeavesPage,
          limit: activeLeavesLimit,
          total: activeLeavesTotal,
          totalPages: Math.ceil(activeLeavesTotal / activeLeavesLimit),
        },
      },
      leaveSummary: {
        leaveType: selectedLeaveType,
        year: targetYear,
        policyQuota,
        allowedLeaveTypes,
        items: formattedSummaryItems,
        totals: {
          policyQuota,
          totalPersonnel: totalSummaryPersonnel,
          totalUsedApproved: formattedSummaryItems.reduce((acc, i) => acc + i.usedApprovedDays, 0),
          totalPending: formattedSummaryItems.reduce((acc, i) => acc + i.pendingDays, 0),
          utilizationRate: totalSummaryPersonnel > 0 && policyQuota > 0
            ? parseFloat(((formattedSummaryItems.reduce((acc, i) => acc + i.usedApprovedDays, 0) / (totalSummaryPersonnel * policyQuota)) * 100).toFixed(1))
            : 0,
        },
        pagination: {
          page: leaveSummaryPage,
          limit: leaveSummaryLimit,
          total: totalSummaryPersonnel,
          totalPages: Math.ceil(totalSummaryPersonnel / leaveSummaryLimit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error in handleGetCommandDashboard:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
