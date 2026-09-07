import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guards';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createServiceSchema = z.object({
  title: z.string().min(1, 'กรุณากรอกชื่อบริการ').max(200),
  description: z.string().min(1, 'กรุณากรอกรายละเอียดบริการ'),
  price: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  icon: z.string().default('fa-layer-group'),
  published: z.boolean().default(true),
  order: z.number().int().default(0),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('all') === 'true';

    const where = includeAll ? {} : { published: true };
    const services = await prisma.service.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ data: services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error: authError, user } = await requirePermission(request, 'MANAGE_SYSTEM');
    if (authError || !user) {
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        price: parsed.data.price || null,
        image: parsed.data.image || null,
        icon: parsed.data.icon || 'fa-layer-group',
        published: parsed.data.published ?? true,
        order: parsed.data.order ?? 0,
      },
    });

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: 'CREATE_SERVICE',
        entity: 'Service',
        entityId: service.id,
        details: JSON.stringify({ title: service.title }),
        ipAddress: clientIp,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, data: service }, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
