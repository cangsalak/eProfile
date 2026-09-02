import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/auth-guards';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

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

/**
 * GET /api/dashboard/command
 *
 * Command Dashboard API providing aggregated personnel readiness,
 * active leave tracking, and annual leave balance summaries with strict RBAC scoping.
 */
export async function GET(req: Request) {
  try {
    // 1. Permission Check
    const { error: permError, user: authUser } = await requirePermission(req, 'VIEW_COMMAND_DASHBOARD');
    if (permError || !authUser) {
      return permError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Determine User Scope (Global Viewer vs Scoped Commander)
    const isGlobalViewer = ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(authUser.role);

    // Fetch full profile of the requesting user to know their assigned department/subDepartment
    const userProfile = await prisma.personnel.findUnique({
      where: { id: authUser.id },
      select: { department: true, subDepartment: true, role: true },
    });

    const userDept = userProfile?.department || '';
    const userSubDept = userProfile?.subDepartment || '';

    // 3. Parse and Validate Query Parameters
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const yearParam = searchParams.get('year');
    const requestedDept = searchParams.get('department')?.trim();
    const requestedSubDept = searchParams.get('subDepartment')?.trim();
    const includeSubDepts = searchParams.get('includeSubDepartments') !== 'false';

    // Pagination & Search params
    const activeLeavesPage = Math.max(1, parseInt(searchParams.get('activeLeavesPage') || '1', 10) || 1);
    const activeLeavesLimit = Math.min(100, Math.max(1, parseInt(searchParams.get('activeLeavesLimit') || '10', 10) || 10));
    const activeLeavesSearch = searchParams.get('activeLeavesSearch')?.trim() || '';

    const leaveSummaryPage = Math.max(1, parseInt(searchParams.get('leaveSummaryPage') || '1', 10) || 1);
    const leaveSummaryLimit = Math.min(100, Math.max(1, parseInt(searchParams.get('leaveSummaryLimit') || '10', 10) || 10));
    const leaveSummarySearch = searchParams.get('leaveSummarySearch')?.trim() || '';
    const leaveSummaryType = searchParams.get('leaveSummaryType')?.trim() || 'ลาพักผ่อน';

    // Parse Target Date (default to today)
    let targetDate = new Date();
    if (dateParam) {
      const parsed = new Date(dateParam);
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed;
      }
    }

    // Start & End of Target Date (UTC boundary)
    const startOfTargetDate = new Date(targetDate);
    startOfTargetDate.setHours(0, 0, 0, 0);
    const endOfTargetDate = new Date(targetDate);
    endOfTargetDate.setHours(23, 59, 59, 999);

    // Target Year (default to current year)
    let targetYear = targetDate.getFullYear();
    if (yearParam) {
      const parsedYear = parseInt(yearParam, 10);
      if (!isNaN(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100) {
        targetYear = parsedYear;
      }
    }
    const yearStartDate = new Date(targetYear, 0, 1, 0, 0, 0, 0);
    const yearEndDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);

    // 4. Construct Strict Personnel WHERE Scope
    const personnelScopeWhere: Prisma.PersonnelWhereInput = {
      // Exclude system placeholder records (SYSTEM_ALL, SYSTEM_ADMIN)
      id: { notIn: ['ALL', 'ADMIN'] },
    };

    let effectiveDepartment: string | undefined = undefined;
    let effectiveSubDepartment: string | undefined = undefined;

    if (isGlobalViewer) {
      // Global viewers can filter by requested department/subDepartment or view all
      if (requestedDept && requestedDept !== 'ALL') {
        effectiveDepartment = requestedDept;
        personnelScopeWhere.department = requestedDept;
        if (requestedSubDept && requestedSubDept !== 'ALL') {
          effectiveSubDepartment = requestedSubDept;
          personnelScopeWhere.subDepartment = requestedSubDept;
        }
      }
    } else {
      // Scoped commander: strictly locked to user's assigned department
      effectiveDepartment = userDept;
      personnelScopeWhere.department = userDept;

      if (!includeSubDepts && userSubDept && userSubDept !== '-') {
        effectiveSubDepartment = userSubDept;
        personnelScopeWhere.subDepartment = userSubDept;
      } else if (requestedSubDept && requestedSubDept !== 'ALL') {
        effectiveSubDepartment = requestedSubDept;
        personnelScopeWhere.subDepartment = requestedSubDept;
      }
    }

    // 5. Fetch Leave Policy from Database (SystemSetting table)
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

    // 6. DB Aggregations: Personnel Readiness & Force Strength
    // a. Total Personnel in Scope
    const totalPersonnel = await prisma.personnel.count({
      where: personnelScopeWhere,
    });

    // b. Active Approved Leaves on Target Date
    const activeLeavesOnTargetDate = await prisma.leaveRecord.findMany({
      where: {
        status: 'อนุมัติแล้ว',
        startDate: { lte: endOfTargetDate },
        endDate: { gte: startOfTargetDate },
        personnel: personnelScopeWhere,
      },
      select: {
        id: true,
        personnelId: true,
        leaveType: true,
        startDate: true,
        endDate: true,
      },
    });

    const activeLeavePersonnelIds = new Set(activeLeavesOnTargetDate.map(l => l.personnelId));
    const onLeaveTodayCount = activeLeavePersonnelIds.size;

    // c. Distribution by Personnel Status
    const statusGroups = await prisma.personnel.groupBy({
      by: ['status'],
      where: personnelScopeWhere,
      _count: { id: true },
    });

    // d. Distribution by Personnel Type
    const typeGroups = await prisma.personnel.groupBy({
      by: ['personnelType'],
      where: personnelScopeWhere,
      _count: { id: true },
    });

    // e. Distribution by Department
    const deptGroups = await prisma.personnel.groupBy({
      by: ['department'],
      where: personnelScopeWhere,
      _count: { id: true },
    });

    // f. Distribution by Sub-Department (if specific department is selected)
    const subDeptGroups = await prisma.personnel.groupBy({
      by: ['subDepartment'],
      where: personnelScopeWhere,
      _count: { id: true },
    });

    // Calculate Operational Readiness Metrics
    let normalStatusCount = 0;
    let onMissionCount = 0;
    let unavailableCount = 0;

    for (const group of statusGroups) {
      const st = group.status.trim();
      const cnt = group._count.id;
      if (st === 'ปฏิบัติงานปกติ') {
        normalStatusCount += cnt;
      } else if (['ไปช่วยราชการ', 'ไปช่วยราชการภายนอกหน่วย', 'มาช่วยราชการ', 'ศึกษา/ดูงาน'].includes(st)) {
        onMissionCount += cnt;
      } else {
        unavailableCount += cnt;
      }
    }

    // True active duty: normal status minus those currently on approved leave today
    const activeDuty = Math.max(0, normalStatusCount - onLeaveTodayCount);
    const readinessRate = totalPersonnel > 0 ? Math.round((activeDuty / totalPersonnel) * 100) : 0;

    // 7. Paginated Active Leaves Detail on Target Date
    const activeLeavesWhere: Prisma.LeaveRecordWhereInput = {
      status: 'อนุมัติแล้ว',
      startDate: { lte: endOfTargetDate },
      endDate: { gte: startOfTargetDate },
      personnel: {
        ...personnelScopeWhere,
        ...(activeLeavesSearch
          ? {
              OR: [
                { firstName: { contains: activeLeavesSearch } },
                { lastName: { contains: activeLeavesSearch } },
                { position: { contains: activeLeavesSearch } },
                { badgeNo: { contains: activeLeavesSearch } },
              ],
            }
          : {}),
      },
    };

    const totalActiveLeavesCount = await prisma.leaveRecord.count({ where: activeLeavesWhere });
    const activeLeavesRaw = await prisma.leaveRecord.findMany({
      where: activeLeavesWhere,
      select: {
        id: true,
        leaveType: true,
        startDate: true,
        endDate: true,
        status: true,
        reason: true,
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

    // Compute duration and remaining days for active leaves
    const activeLeavesList = activeLeavesRaw.map(record => {
      const totalDays = calculateCalendarDays(record.startDate, record.endDate);
      const remainingDays = calculateRemainingDays(record.endDate, targetDate);

      return {
        id: record.id,
        leaveType: record.leaveType,
        startDate: record.startDate,
        endDate: record.endDate,
        totalDays,
        daysRemaining: remainingDays,
        status: record.status,
        reason: record.reason || '-',
        personnel: record.personnel,
      };
    });

    // 8. Paginated Leave Quota & Balance Summary
    const leaveSummaryPersonnelWhere: Prisma.PersonnelWhereInput = {
      ...personnelScopeWhere,
      ...(leaveSummarySearch
        ? {
            OR: [
              { firstName: { contains: leaveSummarySearch } },
              { lastName: { contains: leaveSummarySearch } },
              { position: { contains: leaveSummarySearch } },
              { badgeNo: { contains: leaveSummarySearch } },
            ],
          }
        : {}),
    };

    const totalLeaveSummaryPersonnelCount = await prisma.personnel.count({
      where: leaveSummaryPersonnelWhere,
    });

    const leaveSummaryPersonnel = await prisma.personnel.findMany({
      where: leaveSummaryPersonnelWhere,
      select: {
        id: true,
        prefix: true,
        firstName: true,
        lastName: true,
        position: true,
        department: true,
        subDepartment: true,
        avatarColor: true,
        leaves: {
          where: {
            startDate: { gte: yearStartDate },
            endDate: { lte: yearEndDate },
            ...(leaveSummaryType && leaveSummaryType !== 'ALL' ? { leaveType: leaveSummaryType } : {}),
            status: { in: ['อนุมัติแล้ว', 'รออนุมัติ'] },
          },
          select: {
            id: true,
            leaveType: true,
            startDate: true,
            endDate: true,
            status: true,
            totalLeaveDays: true,
            thisYearLeaveDays: true,
            accumulatedLeaveDays: true,
          },
        },
      },
      orderBy: [{ department: 'asc' }, { firstName: 'asc' }],
      skip: (leaveSummaryPage - 1) * leaveSummaryLimit,
      take: leaveSummaryLimit,
    });

    const defaultQuotaForType = leavePolicy[leaveSummaryType] ?? (leaveSummaryType === 'ลาพักผ่อน' ? 10 : 45);

    const leaveSummaryList = leaveSummaryPersonnel.map(person => {
      let customQuota: number | null = null;
      let usedApprovedDays = 0;
      let pendingDays = 0;

      for (const leave of person.leaves) {
        // Duration of this leave record
        const dur = calculateCalendarDays(leave.startDate, leave.endDate);

        if (leave.status === 'อนุมัติแล้ว') {
          usedApprovedDays += dur;
        } else if (leave.status === 'รออนุมัติ') {
          pendingDays += dur;
        }

        // If person has customized totalLeaveDays on annual leave record
        if (leave.leaveType === 'ลาพักผ่อน' && leave.totalLeaveDays !== null && leave.totalLeaveDays !== undefined) {
          customQuota = leave.totalLeaveDays;
        }
      }

      const effectiveQuota = customQuota !== null ? customQuota : defaultQuotaForType;
      const isDefaultPolicy = customQuota === null;
      const remainingDays = Math.max(0, effectiveQuota - usedApprovedDays);

      return {
        personnel: {
          id: person.id,
          prefix: person.prefix,
          firstName: person.firstName,
          lastName: person.lastName,
          position: person.position,
          department: person.department,
          subDepartment: person.subDepartment,
          avatarColor: person.avatarColor,
        },
        leaveType: leaveSummaryType,
        year: targetYear,
        quota: effectiveQuota,
        isDefaultPolicy,
        usedApprovedDays,
        pendingDays,
        remainingDays,
      };
    });

    // Department-wide total leave quota aggregations
    let totalScopeQuota = 0;
    let totalScopeUsed = 0;
    let totalScopePending = 0;
    let totalScopeRemaining = 0;

    for (const item of leaveSummaryList) {
      totalScopeQuota += item.quota;
      totalScopeUsed += item.usedApprovedDays;
      totalScopePending += item.pendingDays;
      totalScopeRemaining += item.remainingDays;
    }

    // 9. Return Unified Dashboard Payload
    return NextResponse.json({
      success: true,
      scope: {
        isGlobalViewer,
        userDepartment: userDept,
        userSubDepartment: userSubDept,
        effectiveDepartment: effectiveDepartment || 'ALL',
        effectiveSubDepartment: effectiveSubDepartment || 'ALL',
        targetDate: targetDate.toISOString().split('T')[0],
        targetYear,
      },
      readiness: {
        total: totalPersonnel,
        activeDuty,
        onLeaveToday: onLeaveTodayCount,
        onMission: onMissionCount,
        unavailable: unavailableCount,
        readinessRate,
      },
      distributions: {
        byDepartment: deptGroups.map(d => ({ department: d.department, count: d._count.id })),
        bySubDepartment: subDeptGroups.map(s => ({ subDepartment: s.subDepartment, count: s._count.id })),
        byPersonnelType: typeGroups.map(t => ({ personnelType: t.personnelType, count: t._count.id })),
        byStatus: statusGroups.map(s => ({ status: s.status, count: s._count.id })),
      },
      activeLeaves: {
        items: activeLeavesList,
        pagination: {
          page: activeLeavesPage,
          limit: activeLeavesLimit,
          total: totalActiveLeavesCount,
          totalPages: Math.ceil(totalActiveLeavesCount / activeLeavesLimit) || 1,
        },
      },
      leaveSummary: {
        leaveType: leaveSummaryType,
        year: targetYear,
        policyQuota: defaultQuotaForType,
        totals: {
          totalQuota: totalScopeQuota,
          totalUsedApproved: totalScopeUsed,
          totalPending: totalScopePending,
          totalRemaining: totalScopeRemaining,
        },
        items: leaveSummaryList,
        pagination: {
          page: leaveSummaryPage,
          limit: leaveSummaryLimit,
          total: totalLeaveSummaryPersonnelCount,
          totalPages: Math.ceil(totalLeaveSummaryPersonnelCount / leaveSummaryLimit) || 1,
        },
      },
      leavePolicy,
    });
  } catch (error: unknown) {
    console.error('Error in Command Dashboard API:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `เกิดข้อผิดพลาดในการดึงข้อมูลแดชบอร์ด: ${message}` },
      { status: 500 }
    );
  }
}
