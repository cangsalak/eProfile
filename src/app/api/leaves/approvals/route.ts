import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guards';
import { resolveApproverScope, ALLOWED_LEAVE_TYPES } from '@/lib/leave-approvals';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const VALID_SORT_FIELDS = ['createdAt', 'startDate', 'endDate', 'status'] as const;

function isValidDateString(val: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
  const [year, month, day] = val.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

const QuerySchema = z
  .object({
    status: z.enum(['ALL', 'รออนุมัติ', 'อนุมัติแล้ว', 'ไม่อนุมัติ', 'ยกเลิก']).optional().default('รออนุมัติ'),
    leaveType: z.enum(['ALL', ...ALLOWED_LEAVE_TYPES]).optional(),
    department: z.string().optional(),
    subDepartment: z.string().optional(),
    search: z.string().max(100).optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'รูปแบบวันที่ต้องเป็น YYYY-MM-DD')
      .refine(isValidDateString, { message: 'วันที่เริ่มต้นไม่ใช่วันที่ที่มีอยู่จริงในปฏิทิน' })
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'รูปแบบวันที่ต้องเป็น YYYY-MM-DD')
      .refine(isValidDateString, { message: 'วันที่สิ้นสุดไม่ใช่วันที่ที่มีอยู่จริงในปฏิทิน' })
      .optional(),
    page: z.coerce.number().int().min(1, 'หน้าที่ต้องการต้องมากกว่าหรือเท่ากับ 1').default(1),
    limit: z.coerce.number().int().min(1).max(100, 'จำนวนรายการต่อหน้าต้องไม่เกิน 100').default(10),
    sortBy: z.enum(VALID_SORT_FIELDS).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .refine(
    data => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'วันที่เริ่มต้นต้องน้อยกว่าหรือเท่ากับวันที่สิ้นสุด',
      path: ['startDate'],
    }
  );

/**
 * GET /api/leaves/approvals
 * 
 * Secure endpoint to fetch leave approval queue with strict server-side scoping.
 * Protected by APPROVE_LEAVE permission (SUPER_ADMIN, ADMIN, HR_MANAGER, DEPARTMENT_COMMANDER, COMMANDER).
 */
export async function GET(req: Request) {
  try {
    const { user, error: permError } = await requirePermission(req, 'APPROVE_LEAVE');
    if (permError || !user) {
      return permError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parsedQuery = QuerySchema.safeParse({
      status: searchParams.get('status') || undefined,
      leaveType: searchParams.get('leaveType') || undefined,
      department: searchParams.get('department') || undefined,
      subDepartment: searchParams.get('subDepartment') || undefined,
      search: searchParams.get('search') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: 'พารามิเตอร์การค้นหาไม่ถูกต้อง', details: parsedQuery.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      status,
      leaveType,
      department: queryDept,
      subDepartment: querySubDept,
      search,
      startDate,
      endDate,
      page,
      limit,
      sortBy,
      sortOrder,
    } = parsedQuery.data;

    // ── 1. Determine Scope Boundaries using shared helper ───────────────────────
    const userProfile = await prisma.personnel.findUnique({
      where: { id: user.id },
      select: { department: true, subDepartment: true, role: true },
    });

    const { scope, error: scopeError } = resolveApproverScope(user.role, userProfile);
    if (scopeError || !scope) {
      return NextResponse.json(
        { error: scopeError || 'ไม่มีสิทธิ์เข้าถึงข้อมูลเนื่องจากไม่พบสังกัดที่ถูกต้อง' },
        { status: 403 }
      );
    }

    let effectiveDepartment: string | undefined = undefined;
    let effectiveSubDepartment: string | undefined = undefined;

    if (scope.isGlobalViewer) {
      effectiveDepartment = queryDept && queryDept !== 'ALL' ? queryDept : undefined;
      effectiveSubDepartment = querySubDept && querySubDept !== 'ALL' ? querySubDept : undefined;
    } else if (scope.allowedDepartment && !scope.allowedSubDepartment) {
      // Department Commander: locked to department, can filter subDepartment
      effectiveDepartment = scope.allowedDepartment;
      effectiveSubDepartment = querySubDept && querySubDept !== 'ALL' ? querySubDept : undefined;
    } else {
      // Sub-unit Commander: locked to department & subDepartment
      effectiveDepartment = scope.allowedDepartment;
      effectiveSubDepartment = scope.allowedSubDepartment;
    }

    // ── 2. Build Base Scope Condition for Personnel ───────────────────────────
    const personnelScopeCondition: Prisma.PersonnelWhereInput = {
      ...(effectiveDepartment ? { department: effectiveDepartment } : {}),
      ...(effectiveSubDepartment ? { subDepartment: effectiveSubDepartment } : {}),
    };

    // ── 3. Build Leave Filter Where Input ─────────────────────────────────────
    const leaveWhere: Prisma.LeaveRecordWhereInput = {
      personnel: {
        ...personnelScopeCondition,
        ...(search
          ? {
              OR: [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { badgeNo: { contains: search } },
                { position: { contains: search } },
              ],
            }
          : {}),
      },
      ...(status && status !== 'ALL' ? { status } : {}),
      ...(leaveType && leaveType !== 'ALL' ? { leaveType } : {}),
      ...(startDate ? { endDate: { gte: new Date(`${startDate}T00:00:00.000Z`) } } : {}),
      ...(endDate ? { startDate: { lte: new Date(`${endDate}T23:59:59.999Z`) } } : {}),
    };

    // ── 4. Calculate KPI Summaries (within the user's unit scope) ──────────────
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [pendingCount, approvedTodayCount, rejectedTodayCount, totalInScope] = await Promise.all([
      prisma.leaveRecord.count({
        where: {
          personnel: personnelScopeCondition,
          status: 'รออนุมัติ',
        },
      }),
      prisma.leaveRecord.count({
        where: {
          personnel: personnelScopeCondition,
          status: 'อนุมัติแล้ว',
          approvedAt: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.leaveRecord.count({
        where: {
          personnel: personnelScopeCondition,
          status: 'ไม่อนุมัติ',
          approvedAt: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.leaveRecord.count({
        where: {
          personnel: personnelScopeCondition,
        },
      }),
    ]);

    // ── 5. Fetch Paginated Records ─────────────────────────────────────────────
    const totalCount = await prisma.leaveRecord.count({ where: leaveWhere });

    const leaves = await prisma.leaveRecord.findMany({
      where: leaveWhere,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
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
            phone: true,
            mobile: true,
            badgeNo: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            prefix: true,
            firstName: true,
            lastName: true,
            role: true,
            position: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      scope: {
        isGlobalViewer: scope.isGlobalViewer,
        userRole: user.role,
        userDepartment: scope.userDepartment,
        userSubDepartment: scope.userSubDepartment,
        effectiveDepartment: effectiveDepartment || 'ALL',
        effectiveSubDepartment: effectiveSubDepartment || 'ALL',
      },
      summary: {
        pendingCount,
        approvedTodayCount,
        rejectedTodayCount,
        totalInScope,
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      items: leaves,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch leave approvals';
    console.error('Leave approvals GET error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
