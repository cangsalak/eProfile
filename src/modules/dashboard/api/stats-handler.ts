import { NextResponse } from 'next/server';
import { prisma } from '@/modules/core';
import { requireAuth } from '@/modules/core';

/**
 * Handle Executive Dashboard Stats (Overview KPIs, Charts, System Pulse)
 */
export async function handleGetDashboardStats(req: Request) {
  try {
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) {
      return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Parallel fetch core metrics
    const [
      totalPersonnel,
      activeLeavesToday,
      pendingLeaveRequests,
      totalVehicles,
      upcomingCalendarEvents,
      recentAuditLogs,
      deptBreakdown,
      leaveTypeCounts,
    ] = await Promise.all([
      // 1. Total Personnel
      prisma.personnel.count(),

      // 2. Active leaves today
      prisma.leaveRecord.count({
        where: {
          status: 'อนุมัติแล้ว',
          startDate: { lte: todayEnd },
          endDate: { gte: todayStart },
        },
      }),

      // 3. Pending leave requests awaiting approval
      prisma.leaveRecord.count({
        where: {
          status: 'รออนุมัติ',
        },
      }),

      // 4. Vehicles (0 as vehicle module is removed)
      Promise.resolve(0),

      // 5. Upcoming events in next 7 days
      prisma.calendarEvent.findMany({
        where: {
          startDate: { gte: todayStart },
        },
        orderBy: { startDate: 'asc' },
        take: 5,
      }).catch(() => []),

      // 6. Recent Audit Logs
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          personnel: {
            select: {
              firstName: true,
              lastName: true,
              prefix: true,
              avatarColor: true,
              department: true,
            },
          },
        },
      }).catch(() => []),

      // 7. Department Breakdown
      prisma.personnel.groupBy({
        by: ['department'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 6,
      }),

      // 8. Leave Type Distribution
      prisma.leaveRecord.groupBy({
        by: ['leaveType'],
        where: { status: 'อนุมัติแล้ว' },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    const activeDuty = Math.max(0, totalPersonnel - activeLeavesToday);
    const readinessRate = totalPersonnel > 0 ? (activeDuty / totalPersonnel) * 100 : 100;

    return NextResponse.json({
      success: true,
      stats: {
        totalPersonnel,
        activeDuty,
        activeLeavesToday,
        pendingLeaveRequests,
        readinessRate: parseFloat(readinessRate.toFixed(1)),
        totalVehicles,
        availableVehicles: totalVehicles,
      },
      upcomingEvents: upcomingCalendarEvents,
      recentActivities: recentAuditLogs,
      departmentStats: deptBreakdown.map((d: any) => ({
        name: d.department || 'ส่วนกลาง/ไม่ระบุ',
        count: d._count.id,
      })),
      leaveTypeStats: leaveTypeCounts.map((l: any) => ({
        name: l.leaveType,
        count: l._count.id,
      })),
    });
  } catch (error: any) {
    console.error('Error in handleGetDashboardStats:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
