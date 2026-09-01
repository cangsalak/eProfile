import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission, requireRole } from '@/lib/auth-guards';
import { contactSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    const { error: authError } = await requireRole(req, ['ADMIN', 'SUPER_ADMIN']);
    if (authError) return authError;

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { name, email, phone, message } = validation.data;

    const contactMsg = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        message
      }
    });

    // Notify Admins
    await prisma.notification.create({
      data: {
        personnelId: 'ADMIN',
        title: `ข้อความติดต่อใหม่จากคุณ ${name}`,
        message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        type: 'info',
        link: '/manage/contacts'
      }
    }).catch(() => {});

    return NextResponse.json(contactMsg, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit contact message' }, { status: 500 });
  }
}
