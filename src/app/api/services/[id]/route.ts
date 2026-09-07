import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guards';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateServiceSchema = z.object({
  title: z.string().min(1, 'กรุณากรอกชื่อบริการ').max(200).optional(),
  description: z.string().min(1, 'กรุณากรอกรายละเอียดบริการ').optional(),
  price: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  icon: z.string().optional(),
  published: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error: authError, user } = await requirePermission(request, 'MANAGE_SYSTEM');
    if (authError || !user) {
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const parsed = updateServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
    }

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบบริการที่ระบุ' }, { status: 404 });
    }

    const updated = await prisma.service.update({
      where: { id },
      data: parsed.data,
    });

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: 'UPDATE_SERVICE',
        entity: 'Service',
        entityId: id,
        details: JSON.stringify(parsed.data),
        ipAddress: clientIp,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error: authError, user } = await requirePermission(request, 'MANAGE_SYSTEM');
    if (authError || !user) {
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบบริการที่ระบุ' }, { status: 404 });
    }

    await prisma.service.delete({ where: { id } });

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: 'DELETE_SERVICE',
        entity: 'Service',
        entityId: id,
        details: JSON.stringify({ title: existing.title }),
        ipAddress: clientIp,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, message: 'ลบบริการเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
