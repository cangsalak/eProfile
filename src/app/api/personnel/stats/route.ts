import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guards';

// GET /api/personnel/stats - Aggregated personnel metrics for Dashboard
export async function GET(req: Request) {
  try {
    const { error: authError } = await requireAuth(req);
    if (authError) return authError;

    const total = await prisma.personnel.count();
    const active = await prisma.personnel.count({ where: { status: 'ปฏิบัติงานปกติ' } });
    const byDepartmentRaw = await prisma.personnel.groupBy({
      by: ['department'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });
    const byPersonnelTypeRaw = await prisma.personnel.groupBy({
      by: ['personnelType'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });
    const byStatusRaw = await prisma.personnel.groupBy({
      by: ['status'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const inactive = total - active;

    const byDepartment = byDepartmentRaw.map((item) => ({
      department: item.department || 'ไม่ระบุ',
      count: item._count.id,
    }));

    const byPersonnelType = byPersonnelTypeRaw.map((item) => ({
      type: item.personnelType || 'ไม่ระบุ',
      count: item._count.id,
    }));

    const byStatus = byStatusRaw.map((item) => ({
      status: item.status || 'ไม่ระบุ',
      count: item._count.id,
    }));

    return NextResponse.json({
      summary: {
        total,
        active,
        inactive,
      },
      byDepartment,
      byPersonnelType,
      byStatus,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch personnel statistics' },
      { status: 500 }
    );
  }
}
