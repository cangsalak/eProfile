import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import { isValidId } from '@/lib/validate-utils';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireRole(req, ['SUPER_ADMIN']);
  if (auth.error) return auth.error;

  const { id } = params;
  if (!isValidId(id)) {
    return NextResponse.json({ error: 'Invalid Inspection ID' }, { status: 400 });
  }

  const inspection = await prisma.inspection.findUnique({
    where: { id },
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
      findings: {
        orderBy: [
          { severity: 'asc' },
          { createdAt: 'desc' },
        ],
      },
    },
  });

  if (!inspection) {
    return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
  }

  return NextResponse.json({ data: inspection });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireRole(req, ['SUPER_ADMIN']);
  if (auth.error) return auth.error;

  const { id } = params;
  if (!isValidId(id)) {
    return NextResponse.json({ error: 'Invalid Inspection ID' }, { status: 400 });
  }

  const existing = await prisma.inspection.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
  }

  await prisma.inspection.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      personnelId: auth.user.id,
      action: 'DELETE_INSPECTION',
      entity: 'Inspection',
      entityId: id,
      details: `Deleted inspection for ${existing.page} (${existing.url})`,
    },
  }).catch(() => {});

  return NextResponse.json({ success: true, message: 'Inspection deleted successfully' });
}
