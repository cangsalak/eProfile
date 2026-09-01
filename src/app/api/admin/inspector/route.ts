import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createInspectionSchema = z.object({
  page: z.string().min(1).max(200),
  url: z.string().min(1).max(500),
  scanMode: z.enum(['QUICK', 'STANDARD', 'FULL', 'PROJECT']).default('STANDARD'),
  durationMs: z.number().int().nonnegative().default(0),
  overallResult: z.enum(['PASS', 'NEEDS_REVIEW', 'CRITICAL_ISSUES']).default('PASS'),
  criticalCount: z.number().int().nonnegative().default(0),
  highCount: z.number().int().nonnegative().default(0),
  mediumCount: z.number().int().nonnegative().default(0),
  lowCount: z.number().int().nonnegative().default(0),
  infoCount: z.number().int().nonnegative().default(0),
  findings: z.array(
    z.object({
      findingCode: z.string().max(50),
      category: z.string().max(100),
      severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']),
      title: z.string().max(255),
      description: z.string().max(2000),
      page: z.string().max(200).optional().nullable(),
      url: z.string().max(500).optional().nullable(),
      expected: z.string().max(1000).optional().nullable(),
      actual: z.string().max(1000).optional().nullable(),
      element: z.string().max(100).optional().nullable(),
      selector: z.string().max(200).optional().nullable(),
      recommendation: z.string().max(2000),
    })
  ).default([]),
});

export async function GET(req: Request) {
  const auth = await requireRole(req, ['SUPER_ADMIN']);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const resultFilter = searchParams.get('result');

  const where: any = {};
  if (resultFilter && ['PASS', 'NEEDS_REVIEW', 'CRITICAL_ISSUES'].includes(resultFilter)) {
    where.overallResult = resultFilter;
  }

  const [total, inspections] = await Promise.all([
    prisma.inspection.count({ where }),
    prisma.inspection.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            role: true,
          },
        },
        _count: {
          select: { findings: true },
        },
      },
    }),
  ]);

  return NextResponse.json({
    data: inspections,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
}

export async function POST(req: Request) {
  const auth = await requireRole(req, ['SUPER_ADMIN']);
  if (auth.error) return auth.error;

  try {
    const rawBody = await req.json();
    const parsed = createInspectionSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { findings, ...inspectionData } = parsed.data;

    const created = await prisma.$transaction(async (tx) => {
      const inspection = await tx.inspection.create({
        data: {
          ...inspectionData,
          userId: auth.user.id,
          totalFindings: findings.length,
          findings: {
            create: findings.map((f) => ({
              findingCode: f.findingCode,
              category: f.category,
              severity: f.severity,
              title: f.title,
              description: f.description,
              expected: f.expected || null,
              actual: f.actual || null,
              element: f.element || null,
              selector: f.selector || null,
              recommendation: f.recommendation,
              status: 'OPEN',
            })),
          },
        },
        include: {
          findings: true,
        },
      });

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          personnelId: auth.user.id,
          action: 'INSPECT_PAGE',
          entity: 'Inspection',
          entityId: inspection.id,
          details: JSON.stringify({
            page: inspection.page,
            url: inspection.url,
            overallResult: inspection.overallResult,
            totalFindings: inspection.totalFindings,
          }),
        },
      });

      return inspection;
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save inspection report' }, { status: 500 });
  }
}
