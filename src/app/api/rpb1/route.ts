import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guards';

export const dynamic = 'force-dynamic';

/**
 * GET /api/rpb1
 * Returns list of personnel with their Rpb1Record status.
 */
export async function GET(req: Request) {
  try {
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) {
      return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

    const where: any = {};
    if (!isAdmin) {
      where.id = user.id;
    } else {
      if (search) {
        where.OR = [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { citizenId: { contains: search } },
          { badgeNo: { contains: search } },
        ];
      }
      if (department) {
        where.department = department;
      }
    }


    const personnelList = await prisma.personnel.findMany({
      where,
      select: {
        id: true,
        badgeNo: true,
        prefix: true,
        firstName: true,
        lastName: true,
        position: true,
        department: true,
        subDepartment: true,
        citizenId: true,
        phone: true,
        rpb1Records: {
          select: {
            id: true,
            status: true,
            updatedAt: true,
            version: true,
          },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ department: 'asc' }, { firstName: 'asc' }],
    });

    const formatted = personnelList.map((p) => {
      const latestRpb1 = p.rpb1Records[0] || null;
      return {
        id: p.id,
        badgeNo: p.badgeNo,
        fullName: `${p.prefix} ${p.firstName} ${p.lastName}`,
        position: p.position,
        department: p.department,
        subDepartment: p.subDepartment,
        citizenId: p.citizenId,
        phone: p.phone,
        hasRpb1: Boolean(latestRpb1),
        rpb1Status: latestRpb1 ? latestRpb1.status : 'NOT_STARTED',
        rpb1Id: latestRpb1 ? latestRpb1.id : null,
        rpb1UpdatedAt: latestRpb1 ? latestRpb1.updatedAt : null,
      };
    });

    return NextResponse.json(formatted);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to list RPB1 records';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
