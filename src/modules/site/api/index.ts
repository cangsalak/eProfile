import { NextResponse } from 'next/server';
import { prisma } from '@/modules/core';
import { requirePermission } from '@/modules/core';
import { z } from 'zod';

export async function handleGetSiteContent() {
  try {
    const settings = await prisma.systemSetting.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });
    return NextResponse.json(map);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch site content' }, { status: 500 });
  }
}

export async function handleSaveSiteContent(request: Request) {
  try {
    const { error: authError, user } = await requirePermission(request, 'MANAGE_SYSTEM');
    if (authError || !user) return authError;

    const body = await request.json();
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const updates = Object.entries(body).map(([key, val]) => {
      const stringVal = typeof val === 'string' ? val : JSON.stringify(val);
      return prisma.systemSetting.upsert({
        where: { key },
        update: { value: stringVal },
        create: { key, value: stringVal },
      });
    });

    await prisma.$transaction(updates);

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: 'UPDATE_SITE_CONTENT',
        entity: 'SystemSetting',
        details: JSON.stringify({ keys: Object.keys(body) }),
        ipAddress: clientIp,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, message: 'บันทึกเนื้อหาเว็บไซต์เรียบร้อยแล้ว' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update site content' }, { status: 500 });
  }
}

const serviceSchema = z.object({
  title: z.string().min(1, 'กรุณากรอกชื่อบริการ').max(200),
  description: z.string().min(1, 'กรุณากรอกรายละเอียดบริการ'),
  price: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  icon: z.string().default('fa-layer-group'),
  published: z.boolean().default(true),
  order: z.number().int().default(0),
});

export async function handleGetServices(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('all') === 'true';

    const where = includeAll ? {} : { published: true };
    const services = await prisma.service.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ data: services });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch services' }, { status: 500 });
  }
}

export async function handleCreateService(request: Request) {
  try {
    const { error: authError, user } = await requirePermission(request, 'MANAGE_SYSTEM');
    if (authError || !user) return authError;

    const body = await request.json();
    const parsed = serviceSchema.safeParse(body);
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create service' }, { status: 500 });
  }
}

export async function handleUpdateService(
  request: Request,
  context: { params: Record<string, string | string[]> }
) {
  try {
    const { error: authError, user } = await requirePermission(request, 'MANAGE_SYSTEM');
    if (authError || !user) return authError;

    const id = context.params.id as string;
    const body = await request.json();
    const parsed = serviceSchema.partial().safeParse(body);
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update service' }, { status: 500 });
  }
}

export async function handleDeleteService(
  request: Request,
  context: { params: Record<string, string | string[]> }
) {
  try {
    const { error: authError, user } = await requirePermission(request, 'MANAGE_SYSTEM');
    if (authError || !user) return authError;

    const id = context.params.id as string;
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete service' }, { status: 500 });
  }
}
