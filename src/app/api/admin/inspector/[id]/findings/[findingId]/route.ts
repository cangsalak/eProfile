import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import { isValidId } from '@/lib/validate-utils';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateFindingSchema = z.object({
  status: z.enum(['OPEN', 'REVIEWED', 'IGNORED', 'FIXED', 'FALSE_POSITIVE']),
  notes: z.string().max(1000).optional().nullable(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; findingId: string } }
) {
  const auth = await requireRole(req, ['SUPER_ADMIN']);
  if (auth.error) return auth.error;

  const { id, findingId } = params;
  if (!isValidId(id) || !isValidId(findingId)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }

  const existing = await prisma.inspectionFinding.findFirst({
    where: { id: findingId, inspectionId: id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Finding not found' }, { status: 404 });
  }

  try {
    const rawBody = await req.json();
    const parsed = updateFindingSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const updated = await prisma.inspectionFinding.update({
      where: { id: findingId },
      data: {
        status: parsed.data.status,
        notes: parsed.data.notes !== undefined ? parsed.data.notes : existing.notes,
      },
    });

    await prisma.auditLog.create({
      data: {
        personnelId: auth.user.id,
        action: 'CHANGE_FINDING_STATUS',
        entity: 'InspectionFinding',
        entityId: findingId,
        details: JSON.stringify({
          inspectionId: id,
          findingCode: existing.findingCode,
          oldStatus: existing.status,
          newStatus: parsed.data.status,
        }),
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update finding' }, { status: 500 });
  }
}
