import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guards';
import { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const { user, error: authError } = await requirePermission(req, 'VIEW_AUDIT_LOGS');
    if (authError || !user) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || searchParams.get('take') || '20')));
    const search = searchParams.get('search')?.trim() || '';
    const action = searchParams.get('action')?.trim() || '';

    const where: Prisma.AuditLogWhereInput = {};

    if (action && action !== 'ALL') {
      where.action = action;
    }

    if (search) {
      where.OR = [
        { details: { contains: search } },
        { entity: { contains: search } },
        { action: { contains: search } },
        { ipAddress: { contains: search } },
        {
          personnel: {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { username: { contains: search } },
            ],
          },
        },
      ];
    }

    // Distinct queries for pagination and stats
    const total = await prisma.auditLog.count({ where });
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        personnel: {
          select: { firstName: true, lastName: true, username: true, prefix: true },
        },
      },
    });
    const totalAll = await prisma.auditLog.count();
    const loginCount = await prisma.auditLog.count({ where: { action: 'LOGIN' } });
    const createCount = await prisma.auditLog.count({ where: { action: 'CREATE' } });
    const changeCount = await prisma.auditLog.count({ where: { OR: [{ action: 'UPDATE' }, { action: 'DELETE' }] } });

    // If client requested flat array via legacy param, check if they need object
    // Return structured object with pagination
    return NextResponse.json({
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      stats: {
        total: totalAll,
        loginCount,
        createCount,
        changeCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
